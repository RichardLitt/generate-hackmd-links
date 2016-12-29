/* global describe, it */
const assert = require('assert')
const helpers = require('./helpers')
const fn = require('./')

const withVar = `# [test](HACKMD)`
const noVar = `# test`
const withLink = `https://hackmd.io/IYVgZgDApiBMDsBaAbPAnCRAWAHFAxomhCEsgEYCMEEkUYOYYQA=`

describe('checkFileContents', () => {
  it('returns the response if there are matches', function () {
    assert(helpers.checkFileContents(withVar) === withVar, 'WithVar should be returned')
  })
  it('returns null if there are no matches', function () {
    assert(helpers.checkFileContents(noVar) === null, 'Null should be returned')
  })
})

describe('includesHackmdLink', () => {
  it('should return an array of hackmd links if there are any', function () {
    assert(helpers.includesHackmdLink(withLink) === true, 'It should return true')
  })

  it('should return null if there are no links', function () {
    assert(helpers.includesHackmdLink('None') === false, 'It should return false')
  })
})

describe('replaceStrings', () => {
  it('reads input with string to replace', function () {
    helpers.replaceStrings(withVar).then((output) => {
      assert(helpers.includesHackmdLink(output) === true, 'The output should have a link.')
    })
  })

  it('reads input with no string to replace', function () {
    helpers.replaceStrings(noVar).then((output) => {
      assert(helpers.includesHackmdLink(output) === false, 'Nothing should have changed.')
    })
  })
})

describe('generate-hackmd-link', () => {
  it('should replace the var in a file with a hackmd link', function () {
    fn(withVar).then((result) => {
      assert(helpers.includesHackmdLink(result) === true, 'Should have been replaced')
    })
  })

  it('should not affect a file without a hackmd link', function () {
    fn(noVar).then((result) => {
      assert(result === noVar, 'Should have been unchanged')
    })
  })
})
