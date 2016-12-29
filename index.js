const helpers = require('./helpers')

module.exports = function generateHackmdLinks (input) {
  return helpers.replaceStrings(helpers.checkFileContents(input))
}
