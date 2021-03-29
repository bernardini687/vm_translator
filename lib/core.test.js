const { parseCommand, generateCode } = require('./core')

describe('parseCommand', () => {
  function nullProtoObj (props) {
    return Object.assign(Object.create(null), props)
  }

  describe('push to `constant` segment', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('push constant 42')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('  push   constant   42')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'PUSH', arg1: 'constant', arg2: 42, _raw: '// push constant 42' }))
    })
  })

  describe('`add` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('add')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('  add  ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' }))
    })
  })

  describe('`sub` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('sub')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('sub  ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'sub', arg2: undefined, _raw: '// sub' }))
    })
  })

  describe('`neg` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('neg')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand(' neg')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'neg', arg2: undefined, _raw: '// neg' }))
    })
  })

  describe('`eq` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('eq')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand(' eq ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'eq', arg2: undefined, _raw: '// eq' }))
    })
  })

  describe('`gt` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('gt')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'gt', arg2: undefined, _raw: '// gt' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('gt ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'gt', arg2: undefined, _raw: '// gt' }))
    })
  })

  describe('`lt` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('lt')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'lt', arg2: undefined, _raw: '// lt' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('   lt')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'lt', arg2: undefined, _raw: '// lt' }))
    })
  })

  describe('`and` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('and')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'and', arg2: undefined, _raw: '// and' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('   and   ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'and', arg2: undefined, _raw: '// and' }))
    })
  })

  describe('`or` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('or')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('or   ')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'or', arg2: undefined, _raw: '// or' }))
    })
  })

  describe('`not` operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('not')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' }))
    })
    it('ignores whitespace', () => {
      const parts = parseCommand('    not')
      expect(parts).toStrictEqual(nullProtoObj({ type: 'ARITHMETIC', arg1: 'not', arg2: undefined, _raw: '// not' }))
    })
  })
})

describe('generateCode', () => {
  it('generates code to perform an `add` operation', () => {
    const code = generateCode({ type: 'ARITHMETIC', arg1: 'add', arg2: undefined, _raw: '// add' })
    expect(code).toMatch(`@SP
AM=M-1
D=M
A=A-1
M=D+M
`)
  })
})
