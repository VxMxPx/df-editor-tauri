import { expect, test } from "vitest"
import * as cfg from "./cfg"

const { process, encode } = cfg
const parsed_values = (lines: string[]) => process(lines).values

test("retutns empty array for empty input", () => {
  expect(parsed_values([])).toStrictEqual({})
})

test("ignore comments", () => {
  expect(parsed_values(["# hello world"])).toStrictEqual({})
})

test("preserves comments next to properties", () => {
  expect(process(["# Comment", "KEY=Foo"])).toStrictEqual({
    values: {
      KEY: "Foo",
    },
    comments: {
      KEY: "Comment",
    },
  })
})

test("does not attach comments separated by an empty line", () => {
  expect(process(["# Comment", "", "KEY=Foo"])).toStrictEqual({
    values: {
      KEY: "Foo",
    },
    comments: {},
  })
})

test("preserves multiple comment lines", () => {
  expect(process(["# Comment A", "# Comment B", "KEY=Foo"])).toStrictEqual({
    values: {
      KEY: "Foo",
    },
    comments: {
      KEY: "Comment A\nComment B",
    },
  })
})

// Headers
//

test("resolve header", () => {
  expect(parsed_values(["[HEADER]"])).toStrictEqual({})
})

test("resolve header", () => {
  expect(
    parsed_values([
      "[HEADER]",
      "VALUE=Something",
      "[HEADER2]",
      "VALUE=Something2",
    ]),
  ).toStrictEqual({
    "HEADER.VALUE": "Something",
    "HEADER2.VALUE": "Something2",
  })
})

test("preserves comments inside headers", () => {
  expect(process(["[HEADER]", "# Comment", "VALUE=Something"])).toStrictEqual({
    values: {
      "HEADER.VALUE": "Something",
    },
    comments: {
      "HEADER.VALUE": "Comment",
    },
  })
})

// test('multi-dimension headers', () => {
//   expect(
//     process(['[OPTIONS]', 'MAX=12', '[OPTIONS.SUB]', 'MAX=13'])
//   ).toStrictEqual({
//     OPTIONS: {
//       MAX: 12,
//       SUB: {
//         MAX: 13
//       }
//     }
//   })
// })

// Strings
//

test("string values", () => {
  expect(
    parsed_values(["SIMPLE=String", 'QUOTED="HELLO"', 'QUOTEDPAD="  HELLO  "']),
  ).toStrictEqual({
    SIMPLE: "String",
    QUOTED: "HELLO",
    QUOTEDPAD: "  HELLO  ",
  })
})

test("hash-prefixed values are strings", () => {
  expect(parsed_values(["FOO = #ff0000"])).toStrictEqual({
    FOO: "#ff0000",
  })
})

// Booleans & nulls
//

test("booleans", () => {
  expect(
    parsed_values(["TRUE=true", "TRUEUC=TRUE", "FALSE=false", "FALSEUC=FALSE"]),
  ).toStrictEqual({ TRUE: true, TRUEUC: true, FALSE: false, FALSEUC: false })
})

test("nulls", () => {
  expect(parsed_values(["ISNULL=null"])).toStrictEqual({ ISNULL: null })
})

// Numbers
//

test("numeric values", () => {
  expect(
    parsed_values([
      "NUMBER=12",
      "DECIMAL=1.2",
      "BINARY=0b11",
      "HEX=0xff",
      "NEGATIVE=-12",
      "NEGATIVE_DECIMAL=-12.5",
    ]),
  ).toStrictEqual({
    NUMBER: 12,
    DECIMAL: 1.2,
    BINARY: 0b11,
    HEX: 0xff,
    NEGATIVE: -12,
    NEGATIVE_DECIMAL: -12.5,
  })
})

// Key compositions
//

test("spaced key value", () => {
  expect(parsed_values(["   HELLO    =     world"])).toStrictEqual({
    HELLO: "world",
  })
})

test("value can contain equals sign", () => {
  expect(parsed_values(["URL=https://example.test?a=b"])).toStrictEqual({
    URL: "https://example.test?a=b",
  })
  expect(parsed_values(['TOKEN="a=b=c"'])).toStrictEqual({
    TOKEN: "a=b=c",
  })
})

// Inline arrays
//

test("inline array", () => {
  expect(parsed_values(["ARR=[one, two, 3]"])).toStrictEqual({
    ARR: ["one", "two", 3],
  })
})

test("inline array empty", () => {
  expect(parsed_values(["ARR=[]"])).toStrictEqual({
    ARR: [],
  })
  expect(parsed_values(["ARR=[   ]"])).toStrictEqual({
    ARR: [],
  })
})

test("inline array various values", () => {
  expect(
    parsed_values(['ARR=["one", two, 3, 0x12, null, true, false, "false"]']),
  ).toStrictEqual({
    ARR: ["one", "two", 3, 0x12, null, true, false, "false"],
  })
})

test("inline array preserves escaped characters", () => {
  expect(parsed_values(['ARR=["C:\\tmp", "quote: \\""]'])).toStrictEqual({
    ARR: ["C:\\tmp", 'quote: "'],
  })
})

test("inline array multiline", () => {
  expect(
    parsed_values([
      "ARR=[",
      "one,",
      "two,",
      "3",
      "]",
      "ARR2=[one,",
      "two,",
      "3]",
    ]),
  ).toStrictEqual({ ARR: ["one", "two", 3], ARR2: ["one", "two", 3] })
})

test("inline array strange composition", () => {
  expect(parsed_values(['ARR=["single string"]'])).toStrictEqual({
    ARR: ["single string"],
  })
  expect(parsed_values(["ARR=[", '"single string"', "]"])).toStrictEqual({
    ARR: ["single string"],
  })
})

// Multiline strings
//

test("multiline string", () => {
  expect(
    parsed_values(['MLS="""', "Here", "is", "multiline", "string", '"""']),
  ).toStrictEqual({ MLS: "Here is multiline string" })
})

test("multiline string inline", () => {
  expect(parsed_values(['MLS="""Inline"""'])).toStrictEqual({ MLS: "Inline" })
})

test("multiline string comment", () => {
  expect(parsed_values(['MLS="""', "# Comment", '"""'])).toStrictEqual({
    MLS: "# Comment",
  })
})

test("throws on unclosed multiline string", () => {
  expect(() => process(['MLS="""', "unterminated"])).toThrow()
})

test("throws on unclosed multiline array", () => {
  expect(() => process(["ARR=[", "one,"])).toThrow()
})

//
// --- ENCODING ---
//

test("empty object", () => {
  expect(encode({})).toStrictEqual("")
})

test("simple values", () => {
  expect(
    encode({
      KEY: "Hello world",
      NUM: 12,
    }),
  ).toEqual(`KEY=Hello world
NUM=12`)
})

test("comments", () => {
  expect(
    encode(
      {
        KEY: "Foo",
      },
      {
        KEY: "Comment",
      },
    ),
  ).toEqual(`# Comment
KEY=Foo`)
})

test("multi-line comments", () => {
  expect(
    encode(
      {
        KEY: "Foo",
      },
      {
        KEY: "Comment A\nComment B",
      },
    ),
  ).toEqual(`# Comment A
# Comment B
KEY=Foo`)
})

test("boolean and null values", () => {
  expect(
    encode({
      BOOL1: true,
      BOOL2: false,
      NULLS: null,
      FBOOL: "true",
    }),
  ).toEqual(`BOOL1=true
BOOL2=false
NULLS=null
FBOOL="true"`)
})

test("numbers", () => {
  expect(
    encode({
      NUM1: -20,
      NUM2: 1.4,
      NUM3: 12,
    }),
  ).toEqual(`NUM1=-20
NUM2=1.4
NUM3=12`)
})

test("problematic string", () => {
  expect(
    encode({
      PROBLEM: 'I am "problematic" string',
    }),
  ).toEqual(`PROBLEM=I am "problematic" string`)
  expect(
    encode({
      PROBLEM: '"I am problematic string"',
    }),
  ).toEqual(`PROBLEM="I am problematic string"`)
  expect(
    encode({
      PROBLEM: 'I am, "problematic" string',
    }),
  ).toEqual(`PROBLEM="I am, \\"problematic\\" string"`)
})

test("problematic string in array", () => {
  expect(
    encode({
      PROBLEM: ["string with a, inside"],
    }),
  ).toEqual(`PROBLEM=[ "string with a, inside" ]`)
})

test("quoted strings round trip through encode and process", () => {
  const encoded = `PROBLEM="I am, \\"problematic\\" string"`

  expect(
    encode({
      PROBLEM: 'I am, "problematic" string',
    }),
  ).toEqual(encoded)
  expect(parsed_values(encoded.split("\n"))).toStrictEqual({
    PROBLEM: 'I am, "problematic" string',
  })
})

test("inline array", () => {
  expect(
    encode({
      ARR: ["one", "two", 3],
    }),
  ).toEqual(`ARR=[ one, two, 3 ]`)
})

test("inline array over 80 to ml", () => {
  expect(
    encode({
      ARR: [
        "a quite long string",
        "another long string",
        "another long string",
        "another long string",
        "another long string",
      ],
    }),
  ).toEqual(
    `ARR=[
a quite long string,
another long string,
another long string,
another long string,
another long string
]`,
  )
})

test("header", () => {
  expect(
    encode({
      NUMBER: 12,
      "SETTINGS.NUMBER": 13,
      "ANOTHER.NUMBER": 14,
      FOO: "BAR",
    }),
  ).toEqual(`NUMBER=12
FOO=BAR
[SETTINGS]
NUMBER=13
[ANOTHER]
NUMBER=14`)
})

test("comments inside headers", () => {
  expect(
    encode(
      {
        "SETTINGS.VALUE": "Foo",
      },
      {
        "SETTINGS.VALUE": "Comment",
      },
    ),
  ).toEqual(`[SETTINGS]
# Comment
VALUE=Foo`)
})

test("comments round trip through encode and process", () => {
  const config_values = {
    KEY: "Foo",
    "SETTINGS.VALUE": "Bar",
  }
  const comments = {
    KEY: "Root comment",
    "SETTINGS.VALUE": "Nested comment",
  }

  expect(process(encode(config_values, comments).split("\n"))).toEqual({
    values: config_values,
    comments,
  })
})
