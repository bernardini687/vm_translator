const path = require('path')
const translate = require('./translate')

module.exports = function (filename) {
  const source = path.join(process.cwd(), filename)
  const basename = path.basename(source, '.vm')
  const target = path.join(process.cwd(), `${basename}.asm`)

  console.log('DEBUG:', target)

  process.env.__SOURCE_BASENAME = basename // TODO: check this when translating multiple files at once...

  translate(source, target)
}
