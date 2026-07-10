const unescape_quoted_string = (value: string) => {
  return value.replaceAll('\\"', '"').replaceAll("\\\\", "\\")
}

const process_value = (value: string) => {
  // String value
  if (value.startsWith('"') && value.endsWith('"')) {
    return unescape_quoted_string(value.substring(1, value.length - 1))
  }

  // Lowecase value
  const lc_value = value.toLowerCase()

  // Boolean value
  if (lc_value === "true") return true
  if (lc_value === "false") return false
  if (lc_value === "null") return null

  // Numeric value
  const number = Number(value)
  if (!isNaN(number)) {
    return number
  }

  // String value
  return value
}

const process_inline_array = (value: string) => {
  const values = []
  let buffer = ""
  let locked = false
  let escaped = false
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    // Handle Backslash Escape
    if (char === "\\") {
      buffer = buffer + char
      escaped = true
      continue
    }
    // Handle quote
    if (char === '"' && !escaped) {
      if (locked) {
        locked = false
      } else {
        locked = true
      }
    }

    escaped = false

    if (locked) {
      buffer = buffer + char
      continue
    }

    if (char === ",") {
      values.push(process_value(buffer.trim()))
      buffer = ""
      continue
    }

    buffer = buffer + char
  }

  if (buffer.trim()) {
    values.push(process_value(buffer.trim()))
  }

  return values
}

const process = (lines: string[]) => {
  const result: Record<string, unknown> = {}
  const comments: Record<string, unknown> = {}
  let current_header = ""
  let pending_comments: string[] = []
  let value_buffer = {
    active: false,
    key: "",
    value: [] as string[],
    terminator: "",
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!value_buffer.active && line.startsWith("#")) {
      pending_comments.push(line.substring(1).trim())
      continue
    }

    if (!line) {
      pending_comments = []
      continue
    }

    if (
      value_buffer.active &&
      value_buffer.terminator !== '"""' &&
      line.startsWith("#")
    ) {
      continue
    }

    // We're in value buffer?
    if (value_buffer.active) {
      if (line.endsWith(value_buffer.terminator)) {
        value_buffer.value.push(
          line.substring(0, line.length - value_buffer.terminator.length),
        )
        if (value_buffer.terminator === "]") {
          result[value_buffer.key] = process_inline_array(
            value_buffer.value.join(" "),
          )
        } else {
          result[value_buffer.key] = value_buffer.value.join(" ").trim()
        }
        value_buffer.active = false
      } else {
        value_buffer.value.push(line)
      }
      continue
    }

    // Header
    if (line.match(/^\[[\w\.]+\]$/)) {
      current_header = line.substring(1, line.length - 1)
      pending_comments = []
      continue
    }

    // Value
    if (line.includes("=")) {
      const separator = line.indexOf("=")
      const key = line.substring(0, separator)
      const value = line.substring(separator + 1)
      const value_trim = value.trim()
      const key_trim = key.trim()
      const full_key = current_header
        ? `${current_header}.${key_trim}`
        : key_trim

      if (pending_comments.length > 0) {
        comments[full_key] = pending_comments.join("\n")
        pending_comments = []
      }

      if (value_trim.startsWith("[")) {
        if (value_trim === "[]") {
          result[full_key] = []
          continue
        }
        // Multiline array
        if (value_trim.endsWith("]")) {
          result[full_key] = process_inline_array(
            value_trim.substring(1, value_trim.length - 1),
          )
          continue
        }
        value_buffer.active = true
        value_buffer.value = [value_trim.substring(1)]
        value_buffer.terminator = "]"
        value_buffer.key = full_key
      } else if (value_trim.startsWith('"""')) {
        // Multiline string
        if (value_trim.length > 3 && value_trim.endsWith('"""')) {
          result[full_key] = value_trim.substring(3, value_trim.length - 3)
          continue
        }
        value_buffer.active = true
        value_buffer.value = [value_trim.substring(3)]
        value_buffer.terminator = '"""'
        value_buffer.key = full_key
      } else {
        result[full_key] = process_value(value_trim)
      }
    }
  }

  if (value_buffer.active) {
    throw `lib/config/unclosed_value_for_key:${value_buffer.key}`
  }

  return { values: result, comments }
}

const encode_comment = (comment: unknown) => {
  return String(comment)
    .split("\n")
    .map((line) => `# ${line}`)
}

const encode_value = (value: unknown): string => {
  if (typeof value === "number") return String(value)
  if (value === true) return "true"
  if (value === false) return "false"
  if (value === null) return "null"
  if (Array.isArray(value)) {
    let len = 0
    const arr: string[] = []
    value.map((val) => {
      const ev = encode_value(val)
      len = len + ev.length
      arr.push(ev)
    })
    const nl = len > 80 ? "\n" : " "
    return `[${nl}${arr.join(`,${nl}`)}${nl}]`
  }

  const string_value = String(value)
  if (
    typeof process_value(string_value) !== "string" ||
    string_value.includes(",")
  ) {
    if (string_value.includes('"')) {
      return `"${string_value.replaceAll('"', '\\"')}"`
    }
    return `"${string_value}"`
  } else {
    return string_value
  }
}

const encode_arr = (
  config: Record<string, unknown>,
  comments: Record<string, unknown> = {},
) => {
  const root: string[] = []
  const sections: Record<string, string[]> = {}

  const push_section = (section: string, line: string) => {
    sections[section] = sections[section] ?? []
    sections[section].push(line)
  }

  for (const key in config) {
    const value_raw = config[key]
    const comment_raw = comments[key]
    const separator = key.indexOf(".")
    const value = encode_value(value_raw)

    if (separator === -1) {
      if (comment_raw !== undefined) {
        root.push(...encode_comment(comment_raw))
      }
      root.push(`${key}=${value}`)
    } else {
      const header = key.substring(0, separator)
      const property = key.substring(separator + 1)
      if (comment_raw !== undefined) {
        for (const line of encode_comment(comment_raw)) {
          push_section(header, line)
        }
      }
      push_section(header, `${property}=${value}`)
    }
  }

  const deep = Object.entries(sections).flatMap(([header, lines]) => [
    `[${header}]`,
    ...lines,
  ])

  return [...root, ...deep]
}

const encode = (
  config: Record<string, unknown>,
  comments: Record<string, unknown> = {},
) => {
  return encode_arr(config, comments).join("\n")
}

export type CfgValue = string | number | boolean | null | CfgValue[]
export type CfgValues = Record<string, CfgValue>

export { encode, process }
