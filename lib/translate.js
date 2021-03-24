const fs = require('fs')
const { PassThrough } = require('stream')
const es = require('event-stream')
// const { ReReadable } = require('rereadable-stream')
// const { stripComments, resolveLabels, parseInstruction, translateParts } = require('./core')

const passThrough = new PassThrough()
// const firstPass = new ReReadable()

/**
 * Perform translation of a source `.vm` file into assembly `.asm` file.
 *
 * @param {string} filesource The path of the source `.vm` file
 * @param {string} filedest The path of the destination `.asm` file
 */
module.exports = function assemble (filesource, filedest) {
  if (!fs.existsSync(filesource)) {
    console.error(`no such file in current directory: ${filesource}`)
    process.exit(1)
  }

  fs.createReadStream(filesource)
    .pipe(es.split(/\r?\n/))
    // .pipe(stripComments)
    // .pipe(resolveLabels)
    .pipe(passThrough)
    // .pipe(firstPass)

  passThrough.on('data', console.log) // log buffers
  passThrough.on('data', d => { console.log(d.toString()) }) // log strings

  // firstPass.on('finish', () => {
  //   const dest = fs.createWriteStream(filedest)

  //   firstPass.rewind()
  //     .pipe(es.mapSync(parseInstruction))
  //     .pipe(es.mapSync(translateParts))
  //     .pipe(es.join('\n')) // TODO: what about carriage return?
  //     // .pipe(process.stdout)
  //     .pipe(dest)
  // })
}
