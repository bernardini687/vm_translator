const { Transform } = require('stream')
const OPERATIONS = Object.freeze(require('./data/operations'))
const TRANSLATIONS = Object.freeze(require('./data/translations'))

const _counters = {
  eqLabelCounter: 0,
  gtLabelCounter: 0,
  ltLabelCounter: 0
}

function parseCommand (command) {
  const commandParts = Object.create(null)

  const [op, ...args] = command.toString().split(/\s+/).filter(emptyStrings)

  const type = OPERATIONS[op]

  if (type === undefined) {
    throw new Error(`unexpected command type for given operation '${op}'`)
  }

  const arg2 = Number(args[1])

  commandParts.type = type
  commandParts.arg1 = type === 'ARITHMETIC' ? op : args[0]
  commandParts.arg2 = Number.isNaN(arg2) ? undefined : arg2
  commandParts._raw = `// ${op} ${args.filter(undefineds).join(' ')}`.trimEnd() // TODO: extract function

  return commandParts
}

function generateCode ({ type, arg1, arg2, _raw }) {
  let assemblyCode

  switch (type) {
    case 'PUSH':
      assemblyCode = TRANSLATIONS.pushConstant(arg2)
      break
    case 'ARITHMETIC':
      assemblyCode = handleArithmeticTranslation(arg1)
      break

    default:
      throw new Error(`unexpected type '${type}'`)
  }

  if (process.env.PRINT_SOURCE_COMMAND) {
    return `${_raw}:\n${assemblyCode}`
  } else {
    return assemblyCode
  }
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

function handleArithmeticTranslation (op) {
  switch (op) {
    case 'eq':
    case 'gt':
    case 'lt':
      return lookupTranslationAndIncrementLabel(op)

    default:
      return TRANSLATIONS[op]()
  }
}

function lookupTranslationAndIncrementLabel (op) {
  const labelCounter = `${op}LabelCounter`
  const assemblyCode = TRANSLATIONS[op](_counters[labelCounter])

  _counters[labelCounter]++

  return assemblyCode
}

function emptyStrings (x) {
  return x !== ''
}

function undefineds (x) {
  return x !== undefined
}

module.exports = {
  stripComments,
  parseCommand,
  generateCode
}
