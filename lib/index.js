const path = require('path')
const translate = require('./translate')

module.exports = function (filename) {
  const filesource = path.join(process.cwd(), filename)
  const filenameNoExt = path.basename(filesource, '.vm')
  const filedest = path.join(process.cwd(), `${filenameNoExt}.asm`)

  console.log('DEBUG:', filedest)

  translate(filesource, filedest)
}
