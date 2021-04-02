const fs = require('fs')
// const { PassThrough } = require('stream')
const es = require('event-stream')
const { stripComments, parseCommand, generateCode } = require('./core')

/**
 * Perform translation of a source `.vm` file into assembly `.asm` file.
 *
 * @param {string} source The path of the source `.vm` file
 * @param {string} target The path of the target `.asm` file
 */
module.exports = function assemble (source, target) {
  if (!fs.existsSync(source)) {
    console.error(`no such file in current directory: ${source}`)
    process.exit(1)
  }

  const dest = fs.createWriteStream(target)

  // const passThrough = new PassThrough() // useful for debugging

  fs.createReadStream(source)
    .pipe(es.split(/\r?\n/))
    .pipe(stripComments)
    .pipe(es.mapSync(parseCommand))
    .pipe(es.mapSync(generateCode))
    .pipe(es.join('\n'))
    // .pipe(passThrough)
    // .pipe(process.stdout)
    .pipe(dest)

  // passThrough.on('data', console.log) // log buffers
  // passThrough.on('data', d => { console.log(d.toString()) }) // log strings
}
