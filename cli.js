#!/usr/bin/env node
const meow = require('meow')
const fn = require('./')
const Promise = require('bluebird')

const cli = meow([`
  Usage
    $ hackmd-link <input>

  Examples
    $ hackmd-link README.md
`])

var readFile = Promise.promisify(require('fs').readFile)

readFile(cli.input[0], 'utf8').then((result) => {
  return fn(result)
}).then((result) => {
  console.log(result)
})
