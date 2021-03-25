const { smokeTest, parseCommand } = require('./core')

describe('smokeTest', () => {
  // function nullprotoobj (props) {
  //   return Object.assign(Object.create(null), props)
  // }

  describe('', () => {
    it('', () => {
      const result = smokeTest(40, 2)
      expect(result).toBe(42)
    })
  })
})

describe('parseCommand', () => {
  function nullProtoObj (props) {
    return Object.assign(Object.create(null), props)
  }

  describe('push to `constant` segment', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('push constant 42')
      expect(parts).toStrictEqual(nullProtoObj({
        type: 'PUSH',
        arg1: 'constant',
        arg2: 42,
        _raw: '// push constant 42'
      }))
    })

    it.todo('ignores whitespace')
  })

  describe('pop to `constant` segment', () => {})

  describe('add operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('add')
      expect(parts).toStrictEqual(nullProtoObj({
        type: 'ARITHMETIC',
        arg1: undefined,
        arg2: undefined,
        _raw: '// add'
      }))
    })

    it.todo('ignores whitespace')
  })

  describe('sub operation', () => {
    it('parses the command into its parts', () => {
      const parts = parseCommand('sub')
      expect(parts).toStrictEqual(nullProtoObj({
        type: 'ARITHMETIC',
        arg1: undefined,
        arg2: undefined,
        _raw: '// sub'
      }))
    })

    it.todo('ignores whitespace')
  })
})

/*
  fn 'push constant 42'                           -> { type: 'PUSH', arg1: 'constant', arg2: 42 }

  fn { type: 'PUSH', arg1: 'constant', arg2: 42 } -> ['@42', 'D=A', '@SP', 'A=M', ...].join('\n')
*/
