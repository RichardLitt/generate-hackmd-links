const request = require('request')
const rp = require('request-promise')
const stringReplaceAsync = require('string-replace-async')
const str = new RegExp('\\]\\(HACKMD\\)', 'g')

// TODO Make the shim match the RegExp, so you can pass vars
function shimURL (url) {
  return '](' + url + ')'
}

function addURL (match) {
  return rp({
      method: 'GET',
      uri: 'https://hackmd.io/new',
      resolveWithFullResponse: true
    }).then((response) => {
      return shimURL(response.request.href)
    })
}

function checkFileContents (input) {
  return (input && input.match(str)) ? input : null
}

function replaceStrings (res) {
  return stringReplaceAsync(checkFileContents(res), str, addURL)
}

function includesHackmdLink (input) {
  return !!input.match(new RegExp('https://hackmd.io/[a-zA-Z\\=]*', 'g'))
}

module.exports = {
  addURL: addURL,
  replaceStrings: replaceStrings,
  checkFileContents: checkFileContents,
  includesHackmdLink: includesHackmdLink
}
