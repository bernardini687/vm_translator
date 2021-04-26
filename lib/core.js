const { Transform } = require('stream')
const OPERATIONS = Object.freeze(require('./data/operations'))
const SEGMENTS = Object.freeze(require('./data/segments'))
const TRANSLATIONS = Object.freeze(require('./data/translations'))

const _counters = {
  eqLabelCounter: 0,
  gtLabelCounter: 0,
  ltLabelCounter: 0
}

let _currentFunction

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
      assemblyCode = handlePushTranslation(arg1, arg2)
      break
    case 'POP':
      assemblyCode = handlePopTranslation(arg1, arg2)
      break
    case 'ARITHMETIC':
      assemblyCode = handleArithmeticTranslation(arg1)
      break
    case 'LABEL':
    case 'GOTO':
    case 'IF':
      assemblyCode = handleBranchingTranslation(type, arg1)
      break
    case 'FUNCTION':
      assemblyCode = handleFunctionTranslation(arg1, arg2)
      break
    case 'RETURN':
      assemblyCode = TRANSLATIONS.return()
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

function handlePushTranslation (segment, value) {
  switch (segment) {
    case 'constant':
      return TRANSLATIONS.pushConstant(value)
    case 'local':
    case 'argument':
    case 'this':
    case 'that':
      return TRANSLATIONS.pushBaseSegment(value, SEGMENTS[segment])
    case 'temp':
      return TRANSLATIONS.pushTemp(value)
    case 'pointer':
      return TRANSLATIONS.pushPointerOrStatic(SEGMENTS[value])
    case 'static':
      return TRANSLATIONS.pushPointerOrStatic(`${process.env.__SOURCE_BASENAME}.${value}`)

    default:
      throw new Error(`unexpected PUSH segment '${segment}'`)
  }
}

function handlePopTranslation (segment, value) {
  switch (segment) {
    case 'local':
    case 'argument':
    case 'this':
    case 'that':
      return TRANSLATIONS.popBaseSegment(value, SEGMENTS[segment])
    case 'temp':
      return TRANSLATIONS.popTemp(value)
    case 'pointer':
      return TRANSLATIONS.popPointerOrStatic(SEGMENTS[value])
    case 'static':
      return TRANSLATIONS.popPointerOrStatic(`${process.env.__SOURCE_BASENAME}.${value}`)

    default:
      throw new Error(`unexpected POP segment '${segment}'`)
  }
}

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

function handleBranchingTranslation (type, label) {
  const fullLabel = `${_currentFunction}$${label}`
  return TRANSLATIONS[type.toLowerCase()](fullLabel)
}

function lookupTranslationAndIncrementLabel (op) {
  const labelCounter = `${op}LabelCounter`
  const assemblyCode = TRANSLATIONS[op](_counters[labelCounter])

  _counters[labelCounter]++

  return assemblyCode
}

function handleFunctionTranslation (functionName, localVarsCount) {
  const translations = [TRANSLATIONS.label(functionName)]
  for (let i = 0; i < localVarsCount; i++) {
    translations.push(TRANSLATIONS.pushConstant(0))
  }
  return translations.join('\n')
}

/* utils */

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
