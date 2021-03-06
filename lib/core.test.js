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

  function nullProtoObj (obj) {
    return Object.assign(Object.create(null), obj)
  }

  describe('branching operations', () => {
    it('parses a `label` operation into its parts', () => {
      const result = parseCommand('label LOOP-START')
      expect(result).toStrictEqual(nullProtoObj({ type: 'LABEL', arg1: 'LOOP-START', arg2: undefined, _raw: '// label LOOP-START' }))
    })
    it('parses a `goto` operation into its parts', () => {
      const result = parseCommand('goto END_PROGRAM')
      expect(result).toStrictEqual(nullProtoObj({ type: 'GOTO', arg1: 'END_PROGRAM', arg2: undefined, _raw: '// goto END_PROGRAM' }))
    })
    it('parses a `if-goto` operation into its parts', () => {
      const result = parseCommand('if-goto COMPUTE_ELEMENT')
      expect(result).toStrictEqual(nullProtoObj({ type: 'IF', arg1: 'COMPUTE_ELEMENT', arg2: undefined, _raw: '// if-goto COMPUTE_ELEMENT' }))
    })
  })

  describe('function call operations', () => {
    it('parses a `call` operation into its parts', () => {
      const result = parseCommand('call Main.fibonacci 1')
      expect(result).toStrictEqual(nullProtoObj({ type: 'CALL', arg1: 'Main.fibonacci', arg2: 1, _raw: '// call Main.fibonacci 1' }))
    })
    it('parses a `function` operation into its parts', () => {
      const result = parseCommand('function SimpleFunction.test 2')
      expect(result).toStrictEqual(nullProtoObj({ type: 'FUNCTION', arg1: 'SimpleFunction.test', arg2: 2, _raw: '// function SimpleFunction.test 2' }))
    })
    it('parses a `return` operation into its parts', () => {
      const result = parseCommand('return')
      expect(result).toStrictEqual(nullProtoObj({ type: 'RETURN', arg1: undefined, arg2: undefined, _raw: '// return' }))
    })
  })
})

describe('generateCode', () => {
  it('prints the source command when `PRINT_SOURCE_COMMAND` is set', () => {
    process.env.PRINT_SOURCE_COMMAND = '1'
    const code = generateCode({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })
    expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
`@42
D=A
@SP
AM=M+1
A=A-1
M=D`)
    })

    const baseSegments = [
      ['local', 'LCL'],
      ['argument', 'ARG'],
      ['this', 'THIS'],
      ['that', 'THAT']
    ]

    test.each(baseSegments)(
      'it generates code to perform a `push %s` operation', (segment, segmentLabel) => {
        const code = generateCode({ type: 'PUSH', arg1: segment, arg2: 1, _raw: `// push ${segment} 1` })
        expect(code).toStrictEqual(
`@1
D=A
@${segmentLabel}
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
      }
    )

    it('generates code to perform a `push temp` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'temp', arg2: 1, _raw: '// push temp 1' })
      expect(code).toStrictEqual(
`@1
D=A
@5
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })

    it('generates code to perform a `push pointer 0` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'pointer', arg2: 0, _raw: '// push pointer 0' })
      expect(code).toStrictEqual(
`@THIS
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })

    it('generates code to perform a `push pointer 1` operation', () => {
      const code = generateCode({ type: 'PUSH', arg1: 'pointer', arg2: 1, _raw: '// push pointer 1' })
      expect(code).toStrictEqual(
`@THAT
D=M
@SP
AM=M+1
A=A-1
M=D`)
    })

    it('generates code to perform a `push static` operation, according to the value of `__SOURCE_BASENAME`', () => {
      process.env.__SOURCE_BASENAME = 'Mirri'
      const code = generateCode({ type: 'PUSH', arg1: 'static', arg2: 33, _raw: '// push static 33' })
      expect(code).toStrictEqual(
`@Mirri.33
D=M
@SP
AM=M+1
A=A-1
M=D`)
      delete process.env.__SOURCE_BASENAME
    })
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
        expect(code).toStrictEqual(
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
M=D`)
      }
    )

    it('generates code to perform a `pop temp` operation', () => {
      const code = generateCode({ type: 'POP', arg1: 'temp', arg2: 2, _raw: '// pop temp 2' })
      expect(code).toStrictEqual(
`@5
D=A
@2
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D`)
    })

    it('generates code to perform a `pop pointer 0` operation', () => {
      const code = generateCode({ type: 'POP', arg1: 'pointer', arg2: 0, _raw: '// pop pointer 0' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
@THIS
M=D`)
    })

    it('generates code to perform a `pop pointer 1` operation', () => {
      const code = generateCode({ type: 'POP', arg1: 'pointer', arg2: 1, _raw: '// pop pointer 1' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
@THAT
M=D`)
    })

    it('generates code to perform a `pop static` operation, according to the value of `__SOURCE_BASENAME`', () => {
      process.env.__SOURCE_BASENAME = 'Mirri'
      const code = generateCode({ type: 'POP', arg1: 'static', arg2: 99, _raw: '// pop static 99' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
@Mirri.99
M=D`)
      delete process.env.__SOURCE_BASENAME
    })
  })

  describe('arithmetic operations', () => {
    it('generates code to perform an `add` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
A=A-1
M=D+M`)
    })
    it('generates code to perform a `sub` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
A=A-1
M=M-D`)
    })
    it('generates code to perform a `neg` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' })
      expect(code).toStrictEqual(
`@SP
A=M-1
M=-M`)
    })
    it('generates code to perform an `eq` operation and increments the corrisponding label', () => {
      let code = generateCode({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' })
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
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
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
A=A-1
M=D&M`)
    })
    it('generates code to perform an `or` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
A=A-1
M=D|M`)
    })
    it('generates code to perform a `not` operation', () => {
      const code = generateCode({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' })
      expect(code).toStrictEqual(
`@SP
A=M-1
M=!M`)
    })
  })

  describe('branching operations', () => {
    it('generates code to perform a `label` operation', () => {
      const code = generateCode({ type: 'LABEL', arg1: 'LOOP-START', arg2: undefined, _raw: '// label LOOP-START' })
      expect(code).toStrictEqual(
        '(undefined$LOOP-START)')
    })
    it('generates code to perform a `goto` operation', () => {
      const code = generateCode({ type: 'GOTO', arg1: 'END_PROGRAM', arg2: undefined, _raw: '// goto END_PROGRAM' })
      expect(code).toStrictEqual(
`@undefined$END_PROGRAM
0;JMP`)
    })
    it('generates code to perform an `if-goto` operation', () => {
      const code = generateCode({ type: 'IF', arg1: 'COMPUTE_ELEMENT', arg2: undefined, _raw: '// if-goto COMPUTE_ELEMENT' })
      expect(code).toStrictEqual(
`@SP
AM=M-1
D=M
@undefined$COMPUTE_ELEMENT
D;JNE`)
    })
  })

  describe('function call operations', () => {
    it.skip('generates code to perform a `call` operation', () => {
      const code = generateCode({ type: 'CALL', arg1: 'Main.fibonacci', arg2: 1, _raw: '// call Main.fibonacci 1' })
      expect(code).toStrictEqual(
`foo
bar`)
    })
    it('generates code to perform a `function` operation', () => {
      const code = generateCode({ type: 'FUNCTION', arg1: 'SimpleFunction.test', arg2: 2, _raw: '// function SimpleFunction.test 2' })
      expect(code).toStrictEqual(
`(SimpleFunction.test)
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@0
D=A
@SP
AM=M+1
A=A-1
M=D`)
    })
    it('generates code to perform a `return` operation', () => {
      const code = generateCode({ type: 'RETURN', arg1: undefined, arg2: undefined, _raw: '// return' })
      expect(code).toStrictEqual(
`@LCL
D=M
@R13
M=D
@5
D=D-A
A=D
D=M
@R14
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@R13
AM=M-1
D=M
@THAT
M=D
@R13
AM=M-1
D=M
@THIS
M=D
@R13
AM=M-1
D=M
@ARG
M=D
@R13
AM=M-1
D=M
@LCL
M=D
@R14
A=M
0;JMP`)
    })
  })
})
