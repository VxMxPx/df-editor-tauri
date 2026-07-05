import { log } from "@df/app"

type css_variable_name = `--${string}`

export function css_var(name: css_variable_name, to_number: true): number
export function css_var(name: css_variable_name, to_number?: false): string
export function css_var(name: css_variable_name, to_number = false) {
  const element: Element = document.documentElement
  const value = getComputedStyle(element).getPropertyValue(name).trim()
  if (!value) log.war(`css/variable_not_found:${name}`)
  return to_number ? Number.parseFloat(value) : value
}
