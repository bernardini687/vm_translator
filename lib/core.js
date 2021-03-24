// const { Transform } = require('stream')
// const { COMPUTATIONS, DESTINATIONS, JUMPS } = require('./data/dictionary')
// const metadata = require('./data/metadata')
// const symbols = require('./data/symbols')

function smokeTest (x, y) {
  return x + y
}

/* stream interfaces */

// const stripComments = new Transform({
//   transform (chunk, _encoding, next) {
//     const commentStartIndex = chunk.indexOf('//')

//     if (commentStartIndex === 0) {
//       next()
//     } else if (commentStartIndex > 0) {
//       next(null, chunk.slice(0, commentStartIndex))
//     } else {
//       next(null, chunk)
//     }
//   }
// })

/* private */

module.exports = {
  smokeTest
}
