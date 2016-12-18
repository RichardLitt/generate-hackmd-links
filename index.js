const path = require('path')
const request = require('request')
const escapeRegExp = require('escape-string-regexp')
const Promise = require('bluebird')
const rp = require('request-promise')
const stringReplaceAsync = require('string-replace-async')

var readFile = Promise.promisify(require('fs').readFile)

function addURL (match) {
  return rp({
      method: 'GET',
      uri: 'https://hackmd.io/new',
      resolveWithFullResponse: true
    }).then((response) => {
      return '[test](' + response.request.href + ')'
    })
}

function checkFileContents (input) {
  readFile(input, 'utf8').then((res) => {
    return stringReplaceAsync(res, new RegExp(escapeRegExp('[test]()'), 'g'), addURL)
  }).then((response) => {
    console.log(response)
  })
}

checkFileContents(path.join(__dirname, 'README.md'))
