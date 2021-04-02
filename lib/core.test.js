const { parseCommand, generateCode } = require('./core')

describe('parseCommand', () => {
  function nullProtoObj (props) {
    return Object.assign(Object.create(null), props)
  }

  describe('push to `constant` segment', () => {
    const result = nullProtoObj({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })

    it('parses the command into its parts', () => {
      const parts = parseCommand('push constant 42')
      expect(parts).toStrictEqual(result)
    })
    it('handles a Buffer', () => {
      const parts = parseCommand(Buffer.from('push constant 42'))
      expect(parts).toStrictEqual(result)
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('  push   constant   42')
      expect(parts).toStrictEqual(result)
    })
  })

  describe('`add` operation', () => {
    const result = nullProtoObj({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' })

    it('parses the command into its parts', () => {
      const parts = parseCommand('add')
      expect(parts).toStrictEqual(result)
    })
    it('handles a Buffer', () => {
      const parts = parseCommand(Buffer.from('add'))
      expect(parts).toStrictEqual(result)
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('  add  ')
      expect(parts).toStrictEqual(result)
    })
  })

  describe('`sub` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('sub')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' }))
    })
  })

  describe('`neg` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('neg')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' }))
    })
  })

  describe('`eq` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('eq')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' }))
    })
  })

  describe('`gt` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('gt')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'gt', arg2: undefined, _raw: '// gt' }))
    })
  })

  describe('`lt` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('lt')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'lt', arg2: undefined, _raw: '// lt' }))
    })
  })

  describe('`and` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('and')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'and', arg2: undefined, _raw: '// and' }))
    })
  })

  describe('`or` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('or')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' }))
    })
  })

  describe('`not` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('not')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' }))
    })
  })
})

describe('generateCode', () => {
  it('generates code to perform a `push constant` operation', () => {
    const code = generateCode({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })
    expect(code).toMatch(`@42
D=A
@SP
AM=M+1
A=A-1
M=D`)
  })
  it('prints the source command when `PRINT_SOURCE_COMMAND` is set', () => {
    process.env.PRINT_SOURCE_COMMAND = '1'
    const code = generateCode({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' })
    expect(code).toMatch(`// push constant 42:
@42
D=A
@SP
AM=M+1
A=A-1
M=D`)
    delete process.env.PRINT_SOURCE_COMMAND
  })
  it('generates code to perform an `add` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' })
    expect(code).toMatch(`@SP
AM=M-1
D=M
A=A-1
M=D+M`)
  })
  it('generates code to perform a `sub` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' })
    expect(code).toMatch(`@SP
AM=M-1
D=M
A=A-1
M=M-D`)
  })
  it('generates code to perform a `neg` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' })
    expect(code).toMatch(`@SP
A=M-1
M=-M`)
  })
  it('generates code to perform an `eq` operation and increments the corrisponding label', () => {
    let code = generateCode({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' })
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
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
    expect(code).toMatch(`@SP
AM=M-1
D=M
A=A-1
M=D&M`)
  })
  it('generates code to perform an `or` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' })
    expect(code).toMatch(`@SP
AM=M-1
D=M
A=A-1
M=D|M`)
  })
  it('generates code to perform a `not` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' })
    expect(code).toMatch(`@SP
A=M-1
M=!M`)
  })
})
