/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const debug = require('debug')('keanu-bot'),
  config = require('./config.json'),
  apiai = require('apiai'),
  axios = require('axios')

// api.ai client
const apiapp = apiai(config.APIAI_TOKEN)

// slack client
const slack = axios.create({
  params: { token: config.SLACK_TOKEN },
  baseURL: 'https://slack.com/api/',
  headers: { 'User-Agent': 'keanu-bot' }
})


/**
 * Post a message to Slack
 * 
 * @param {string} channel - the channel id to post to
 * @param {object} fields - the response fields to post
 * @returns A Promise with the http response
 */
function respondInSlack(channel, fields) {
  debug('building slack message\n%O', fields)

  let attachment = {
    color: '#3367d6',
    text: fields.text,
    image_url: fields.url,
    fallback: "whoa"
  }
  debug('slack attachment\n%O', attachment)

  let params = {
    channel: channel,
    attachments: JSON.stringify([attachment])
  }

  debug('sending slack message\n%O', params)
  return slack.get('chat.postMessage', { params })
}


/**
 * Send text request to api.ai
 * 
 * @param {string} text - the text to submit
 * @returns A Promise with the response result
 */
function sendToAPIAI(text) {
  debug('sending text', text)

  let sessionId = new Date().getTime()
  let request = apiapp.textRequest(text, { sessionId })
  request.end()

  return new Promise((resolve, reject) => {
    // successful response
    request.on('response', response => {
      debug('response\n%O', response)
      resolve(response.result)
    })

    // error
    request.on('error', error => {
      debug('error\n%O', error)
      reject(error)
    })
  })
}


/**
 * Parse api.ai result
 * 
 * @param {object} result - api.ai response result
 * @returns A Promise with the parsed fields
 */
function parseResponse(result) {
  debug('parsing result\n%O', result)
  let { score, fulfillment } = result

  // no match
  if (score <= 0.1) return Promise.reject()

  // parse text and url from the speech
  let fields = {}
  fulfillment.speech.split(',').forEach(text => {
    if (!text.match(/(?:jpeg|jpg|gif|png)$/i)) fields.text = text
    else fields.url = text.replace(/ /g, '')
  })

  debug('return fields\n%O', fields)
  return Promise.resolve(fields)
}


/**
 * Process a Slack event
 * 
 * @param {object} event - the Slack message event
 * @returns A Promise with the event results
 */
function processEvent(event) {
  let { channel, text } = event
  let respond = respondInSlack.bind(null, channel)
  return sendToAPIAI(text).then(parseResponse).then(respond)
}


/**
 * @param {object} req Cloud Function request object.
 * @param {object} req.body The request payload.
 * @param {string} req.body.token Slack's verification token.
 * @param {string} req.body.text The user's search query.
 * @param {object} res Cloud Function response object.
 */
function handler(req, res) {
  debug('payload received\n%O', req.body)

  let { token, challenge, event } = req.body

  // verify slack request token
  if (token !== config.VERIFICATION_TOKEN) {
    debug('invalid verification token', token)
    return res.status(401).send('Invalid request')
  }

  // slack events api challenge request
  if (challenge) {
    debug('challenge request', challenge)
    return res.send(challenge)
  }

  // ignore bot events
  if (event && event.bot_id) {
    debug('bot event ignored', event.bot_id)
    return res.status(200)
  }

  // process the event
  let complete = () => res.send()
  processEvent(event).then(complete).catch(complete)
}


// public endpoint
exports.handler = handler