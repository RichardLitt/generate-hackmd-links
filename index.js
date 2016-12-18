const request = require('request')
const rp = require('request-promise')
const stringReplaceAsync = require('string-replace-async')

function addURL (match) {
  return rp({
      method: 'GET',
      uri: 'https://hackmd.io/new',
      resolveWithFullResponse: true
    }).then((response) => {
      return '](' + response.request.href + ')'
    })
}

function checkFileContents (res) {
  return stringReplaceAsync(res, new RegExp('\\]\\(HACKMD\\)', 'g'), addURL)
}

module.exports = {
  addURL: addURL,
  checkFileContents: checkFileContents
}
