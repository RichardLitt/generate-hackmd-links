/* global describe, it */
const assert = require('assert')
const fn = require('./').checkFileContents

const input = `# [test](HACKMD)`

describe('validate file', () => {
  it('reads a file with string to replace', function () {
    fn(input).then((output) => {
      assert(output !== input, 'Something should have changed.')
    })
  })
})

describe('validate file', () => {
  it('reads a file with no string to replace', function () {
    fn(input).then((output) => {
      assert(output === input, 'Nothing should have changed.')
    })
  })
})
