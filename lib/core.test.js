const { parseCommand, generateCode } = require('./core')

describe('parseCommand', () => {
  describe('`push` operations', () => {
    function expectedPushResult (segment) {
      return Object.assign(Object.create(null), {
        type: 'PUSH',
        arg1: segment,
        arg2: 42,
        _raw: `// push ${segment} 42`
      })
    }

    const pushSegments = ['constant', 'local', 'argument', 'this', 'that', 'temp']

    test.each([pushSegments])(
      'it parses the command into its parts when given segment %p', (segment) => {
        const result = parseCommand(`push ${segment} 42`)
        expect(result).toStrictEqual(expectedPushResult(segment))
      }
    )
    test.each([pushSegments])(
      'it handles a Buffer when given segment %p', segment => {
        const result = parseCommand(Buffer.from(`push ${segment} 42`))
        expect(result).toStrictEqual(expectedPushResult(segment))
      }
    )
    test.each([pushSegments])(
      'it ignores whitespace when given segment %p', segment => {
        const result = parseCommand(`  push   ${segment}   42  `)
        expect(result).toStrictEqual(expectedPushResult(segment))
      }
    )
  })

  describe('`pop` operations', () => {
    function expectedPopResult (segment) {
      return Object.assign(Object.create(null), {
        type: 'POP',
        arg1: segment,
        arg2: 42,
        _raw: `// pop ${segment} 42`
      })
    }

    const popSegments = ['local', 'argument', 'this', 'that', 'temp']

    test.each(popSegments)(
      'it parses the command into its parts when given segment %p', (segment) => {
        const result = parseCommand(`pop ${segment} 42`)
        expect(result).toStrictEqual(expectedPopResult(segment))
      }
    )
    test.each(popSegments)(
      'it handles a Buffer when given segment %p', segment => {
        const result = parseCommand(Buffer.from(`pop ${segment} 42`))
        expect(result).toStrictEqual(expectedPopResult(segment))
      }
    )
    test.each(popSegments)(
      'it ignores whitespace when given segment %p', segment => {
        const result = parseCommand(` pop  ${segment}   42    `)
        expect(result).toStrictEqual(expectedPopResult(segment))
      }
    )
  })

  describe('arithmetic operations', () => {
    function expectedArithmeticResult (op) {
      return Object.assign(Object.create(null), {
        type: 'ARITHMETIC',
        arg1: op,
        arg2: undefined,
        _raw: `// ${op}`
      })
    }

    const operations = ['add', 'sub', 'neg', 'eq', 'gt', 'lt', 'and', 'or', 'not']

    test.each(operations)(
      'it parses the command into its parts on %p operation', (op) => {
        const result = parseCommand(op)
        expect(result).toStrictEqual(expectedArithmeticResult(op))
      }
    )
    test.each(operations)(
      'it handles a Buffer on %p operation', op => {
        const result = parseCommand(Buffer.from(op))
        expect(result).toStrictEqual(expectedArithmeticResult(op))
      }
    )
    test.each(operations)(
      'it ignores whitespace on %p operation', op => {
        const result = parseCommand(` ${op}  `)
        expect(result).toStrictEqual(expectedArithmeticResult(op))
      }
    )
  })
})

describe('generateCode', () => {
  it('prints the source command when `PRINT_SOURCE_COMMAND` is set', () => {
    process.env.PRINT_SOURCE_COMMAND = '1'
    const code = generateCode({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })
    expect(code).toMatch(
`// push constant 42:
@42
D=A
@SP
AM=M+1
A=A-1
M=D`)
    delete process.env.PRINT_SOURCE_COMMAND
  })

  describe('`push` operations', () => {
    it('generates code to perform a `push constant` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })
      expect(code).toMatch(
`@42
D=A
@SP
AM=M+1
A=A-1
M=D`)
    })
    it('generates code to perform a `push local` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'local', arg2: 0, _raw: '// push local 0' })
      expect(code).toMatch(
`@0
D=A
@LCL
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })
    it('generates code to perform a `push argument` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'argument', arg2: 0, _raw: '// push argument 0' })
      expect(code).toMatch(
`@0
D=A
@ARG
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })
    it('generates code to perform a `push this` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'this', arg2: 0, _raw: '// push this 0' })
      expect(code).toMatch(
`@0
D=A
@THIS
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })
    it('generates code to perform a `push that` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'that', arg2: 0, _raw: '// push that 0' })
      expect(code).toMatch(
`@0
D=A
@THAT
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })
    it.todo('generates code to perform a `push temp` operation')
  })

  describe('`pop` operations', () => {
    const baseSegments = [
      ['local', 'LCL'],
      ['argument', 'ARG'],
      ['this', 'THIS'],
      ['that', 'THAT']
    ]

    test.each(baseSegments)(
      'it generates code to perform a `pop %s` operation', (segment, segmentLabel) => {
        const code = generateCode({ type: 'POP', arg1: segment, arg2: 2, _raw: `// pop ${segment} 2` })
        expect(code).toMatch(
`@${segmentLabel}
D=M
@2
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
`)
      }
    )
  })

  describe('arithmetic operations', () => {
    it('generates code to perform an `add` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
M=D+M`)
    })
    it('generates code to perform a `sub` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
M=M-D`)
    })
    it('generates code to perform a `neg` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' })
      expect(code).toMatch(
`@SP
A=M-1
M=-M`)
    })
    it('generates code to perform an `eq` operation and increments the corrisponding label', () => {
      let code = generateCode({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@EQ_LABEL_0
D;JEQ
@SP
A=M-1
M=0
(EQ_LABEL_0)`)
      code = generateCode({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@EQ_LABEL_1
D;JEQ
@SP
A=M-1
M=0
(EQ_LABEL_1)`)
    })
    it('generates code to perform a `gt` operation and increments the corrisponding label', () => {
      let code = generateCode({ type: 'ARITHMETIC', arg1: 'gt', arg2: undefined, _raw: '// gt' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@GT_LABEL_0
D;JGT
@SP
A=M-1
M=0
(GT_LABEL_0)`)
      code = generateCode({ type: 'ARITHMETIC', arg1: 'gt', arg2: undefined, _raw: '// gt' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@GT_LABEL_1
D;JGT
@SP
A=M-1
M=0
(GT_LABEL_1)`)
    })
    it('generates code to perform a `lt` operation and increments the corrisponding label', () => {
      let code = generateCode({ type: 'ARITHMETIC', arg1: 'lt', arg2: undefined, _raw: '// lt' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=D-M
M=-1
@LT_LABEL_0
D;JGT
@SP
A=M-1
M=0
(LT_LABEL_0)`)
      code = generateCode({ type: 'ARITHMETIC', arg1: 'lt', arg2: undefined, _raw: '// lt' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
D=D-M
M=-1
@LT_LABEL_1
D;JGT
@SP
A=M-1
M=0
(LT_LABEL_1)`)
    })
    it('generates code to perform an `and` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'and', arg2: undefined, _raw: '// and' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
M=D&M`)
    })
    it('generates code to perform an `or` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' })
      expect(code).toMatch(
`@SP
AM=M-1
D=M
A=A-1
M=D|M`)
    })
    it('generates code to perform a `not` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' })
      expect(code).toMatch(
`@SP
A=M-1
M=!M`)
    })
  })
})
