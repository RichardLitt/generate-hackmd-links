const helpers = require('./helpers')

const hackmduri = 'https://hackmd.io'

/**
 * Generates a new hackmd noteId.
 * 
 * @returns {Promise<string>} - A promise containing the new hackmd noteId
 */
function generateNewNoteId() { 
  var reqOptions = { 
      method: 'GET', 
      uri: hackmduri + '/new', 
      resolveWithFullResponse: true, 
      jar: true
  }
  
  return rp(reqOptions).then((response) => {
      if (!response.request.href) { 
          return Promise.reject(new Error('No new notepad Id came back from ' + hackmduri + '/new'))
      }

      // TODO Don't assume that the note id is in this position
      var newNoteId =  response.request.href.split('/')[3]
      console.debug('(generateNewNoteId) generated new note id: ' + newNoteId)
      return newNoteId
  })  
}

/**
 * Posts new note content to hackmd.  Assumes a blank note to start.
 * 
 * @param {string} noteId - Hackmd note Id
 * @param {string} mdText - Markdown text of the contents note 
 * 
 */
function postNoteContent(noteId, mdText) {
  // TODO add ability to pass in blank noteId to start a new note with mdText content

  // Check whether note Id is valid 
  helpers.getSessionIdCookie().then((sessionIdCookie) => {
      console.debug('(postNoteContent) got session id cookie, calling for websocket connection')
      helpers.postNoteContentOnSocket(noteId, mdText, sessionIdCookie)
  })
}

function generateHackmdLinks (input) {
  return helpers.replaceStrings(helpers.checkFileContents(input))
}

module.exports = {
  generateHackmdLinks: generateHackmdLinks,
  generateNewNoteId: generateNewNoteId,
  postNoteContent: postNoteContent
}
