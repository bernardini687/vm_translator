const { Transform } = require('stream')
// const { COMPUTATIONS, DESTINATIONS, JUMPS } = require('./data/dictionary')
// const metadata = require('./data/metadata')
const OPERATIONS = Object.freeze(require('./data/operations'))

function parseCommand (command) {
  const commandParts = Object.create(null)

  const [operation, ...args] = command.split(/\s+/).filter(emptyStrings)

  const type = OPERATIONS[operation]

  if (type === undefined) {
    throw new Error(`unexpected command type for given operation '${operation}'`)
  }

  const arg2 = Number(args[1])

  commandParts.type = type
  commandParts.arg1 = type === 'ARITHMETIC' ? operation : args[0]
  commandParts.arg2 = Number.isNaN(arg2) ? undefined : arg2
  commandParts._raw = `// ${operation} ${args.filter(undefineds).join(' ')}`.trimEnd() // TODO: extract function

  return commandParts
}

/* stream interfaces */

const stripComments = new Transform({
  transform (chunk, _encoding, next) {
    const commentStartIndex = chunk.indexOf('//')

    if (commentStartIndex === 0) { // entire line is a comment
      next()
    } else if (commentStartIndex > 0) { // keep from beginning up to start of comment
      next(null, chunk.slice(0, commentStartIndex))
    } else {
      next(null, chunk)
    }
  }
})

/* private */

// function pushConstant (value) {
//   return [
//     `@${value}`,
//     'D=A',
//     '@SP',
//     'A=M',
//     'M=D',
//     '@SP',
//     'M=M+1'
//   ]
// }

function emptyStrings (x) {
  return x !== ''
}

function undefineds (x) {
  return x !== undefined
}

module.exports = {
  stripComments,
  parseCommand
}
