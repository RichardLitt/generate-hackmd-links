const request = require('request')
const rp = require('request-promise')
const stringReplaceAsync = require('string-replace-async')
const Promise = require('bluebird')
const io = require('socket.io-client')
const str = new RegExp('\\]\\(HACKMD\\)', 'g')

const hackmduri = 'https://hackmd.io'

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

/**
 * Initializes connection to hackmd instance establishing a sessionid cookie.
 *  
 * @returns {Promise<string>} - A promise containing the sessionId cookie 
 */
function getSessionIdCookie() { 
  var reqOptions = { 
      method: 'GET', 
      uri: hackmduri, 
      resolveWithFullResponse: true, 
      jar: true
  }
  
  return rp(reqOptions)
      .then((response) => {
          var cookies = response.headers['set-cookie']
          if (!Array.isArray(cookies) || !cookies.length) {
             return Promise.reject(new Error('no cookies came back from ' + hackmduri))
          }

          // TODO don't assume that the session id cookie is the first to be set
          var sessionCookie = cookies[0].split(';')[0]
          console.log('hackmd-helper.getSessionIdCookie: fetched session id cookie: ' + sessionCookie)

          // Check that cookie looks like a valid session ID cookie
          if (!/^connect.sid=/.test(sessionCookie)) { 
            return Promise.reject(new Error('no session cookie found.  Instead: ' + sessionCookie))
          }

          return sessionCookie
      })
}

/**
 * Check whether a given hackmd note Id is valid
 * 
 * @param {string} noteId - Hackmd note Id
 *  
 * @returns {Promise<boolean>} - A promise containing the boolean check.  True if noteId exists on hackmd, False otherwise 
 */
function isValidNoteId(noteId) { 
  if (!noteId) {
    return Promise.resolve(false)
  }

  var reqOptions = { 
      method: 'GET', 
      uri: hackmduri + '/' + noteId, 
      resolveWithFullResponse: true
  }
  
  return rp(reqOptions)
      .then((response) => {
          var statusCode = response.statusCode

          console.log('Requested note Id: ' + noteId + ' \nReceived HTTP Status Code: ' + statusCode)

          // success!
          if (statusCode >= 200 && statusCode < 300) { 
            return true
          } else { 
            return false
          }
      })
      .catch((err) => {
        var statusCode = err.statusCode
        console.log('Requested note Id: ' + noteId + ' \nReceived HTTP Status Code: ' + statusCode)  
        
          // client error: not found or something's busted in how we're asking
          if (statusCode >= 400 && statusCode < 500) { 
            return false
          }

          // server-side error, can't verify 
          if (statusCode >= 500) {
            return Promise.reject(new Error('trying to check validity of note Id: ' + noteId + ' received HTTP Status Code: ' + statusCode))
          }
      })
}


/**
* Establishes the websocket connection and injects note text.
* 
* Warning: this is potentially brittle and a hold over until the POST
* method to hackmd.io/new works.  (see https://github.com/hackmdio/hackmd/pull/673)
* 
* @param {string} noteId - Hackmd note Id
* @param {string} mdText - Markdown text of the contents note 
* @param {string} sessionCookie - Session Id Cookie for the uri
*/
function postNoteContentOnSocket(noteId, mdText, sessionCookie) { 
  // initialize a websocket to hackmd
  var socket = io.connect(hackmduri,{
      path: '', 
      query: {
          noteId: noteId
      },
      timeout: 5000, // 5 secs to timeout,
      forceNew: true,
      reconnectionAttempts: 20, // retry 20 times on connect failed
      extraHeaders: { 
          'Cookie': sessionCookie
      }
  })

  // TODO make sure timeout happens in case the on('connect') never fires 

  // once websockets connected, push the new content to the note and disconnect
  socket.on('connect', () => {
      console.debug('Client has connected to the server!')
      
      // full operation includes the range. e.g.: "operation",0,["hello world"],{"ranges":[{"anchor":11,"head":11}]}
      // TODO Determine full operation instruction for fully replacing content
      socket.emit("operation",0,[mdText])
      
      socket.disconnect(); 
  })
}

module.exports = {
  addURL: addURL,
  replaceStrings: replaceStrings,
  checkFileContents: checkFileContents,
  includesHackmdLink: includesHackmdLink, 
  getSessionIdCookie: getSessionIdCookie, 
  isValidNoteId: isValidNoteId,
  postNoteContentOnSocket: postNoteContentOnSocket
}
