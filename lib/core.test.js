const { smokeTest } = require('./core')

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

/*
  fn 'push constant 42'                           -> { type: 'PUSH', arg1: 'constant', arg2: 42 }

  fn { type: 'PUSH', arg1: 'constant', arg2: 42 } -> ['@42', 'D=A', '@SP', 'A=M', ...].join('\n')
*/
