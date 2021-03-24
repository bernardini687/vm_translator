#!/usr/bin/env node

const [filename] = process.argv.slice(2)

if (filename === undefined) {
  console.error('no argument given')
  process.exit(1)
} else {
  start(filename)
}

function start (filename) {
  const module = require('../lib')
  module(filename)
}
