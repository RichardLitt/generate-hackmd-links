#!/usr/bin/env node
const meow = require('meow')
const checkFileContents = require('./').checkFileContents
const Promise = require('bluebird')

const cli = meow([`
  Usage
    $ hackmd-link <input>

  Examples
    $ hackmd-link README.md
`])

var readFile = Promise.promisify(require('fs').readFile)

readFile(cli.input[0], 'utf8').then((res) => {
  return checkFileContents(res)
}).then((result) => {
  console.log(result)
})
