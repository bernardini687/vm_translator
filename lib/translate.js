const fs = require('fs')
const { PassThrough } = require('stream')
const es = require('event-stream')
// const { ReReadable } = require('rereadable-stream')
const { stripComments /* parseCommand, generateCode */ } = require('./core')

const passThrough = new PassThrough()
// const firstPass = new ReReadable()

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

  fs.createReadStream(source)
    .pipe(es.split(/\r?\n/))
    .pipe(stripComments)
    // .pipe(resolveLabels)
    .pipe(passThrough)
    // .pipe(firstPass)

  passThrough.on('data', console.log) // log buffers
  passThrough.on('data', d => { console.log(d.toString()) }) // log strings

  // firstPass.on('finish', () => {
  //   const dest = fs.createWriteStream(target)

  //   firstPass.rewind()
  //     .pipe(es.mapSync(parseCommand))
  //     .pipe(es./* mapSync(generateCode */))
  //     .pipe(es.join('\n')) // TODO: what about carriage return?
  //     // .pipe(process.stdout)
  //     .pipe(dest)
  // })
}
