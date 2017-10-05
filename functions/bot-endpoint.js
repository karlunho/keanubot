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

 // Based on code from: https://github.com/karlunho/keanubot

'use strict'

const apiai = require('apiai'),
  axios = require('axios');

// api.ai client
const apiapp = apiai(process.env.APIAI_TOKEN)

// slack client
const slack = axios.create({
  params: { token: process.env.SLACK_BOT_TOKEN },
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
  console.log('building slack message\n%O', fields)

  let attachment = {
    color: '#3367d6',
    fallback: fields.text,
    image_url: fields.url,
    fallback: "whoa"
  }
  console.log('slack attachment\n%O', attachment)

  let params = {
    channel: channel,
    text: fields.text,
    attachments: JSON.stringify([attachment])
  }

  console.log('sending slack message\n%O', params)
  return slack.get('chat.postMessage', { params })
}


/**
 * Send text request to api.ai
 *
 * @param {string} text - the text to submit
 * @returns A Promise with the response result
 */
function sendToAPIAI(text) {
  console.log('sending text', text)

  let sessionId = new Date().getTime()
  let request = apiapp.textRequest(text, { sessionId })
  request.end()

  return new Promise((resolve, reject) => {
    // successful response
    request.on('response', response => {
      console.log('response\n%O', response)
      resolve(response.result)
    })

    // error
    request.on('error', error => {
      console.log('error\n%O', error)
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
  console.log('parsing result\n%O', result)
  let { score, fulfillment } = result

  // no match
  if (score <= 0.5) return Promise.reject()

  // parse text and url from the speech
  let fields = {}
  fulfillment.speech.split(',').forEach(text => {
    if (!text.match(/(?:jpeg|jpg|gif|png)$/i)) fields.text = text
    else fields.url = text.replace(/ /g, '')
  })

  console.log('return fields\n%O', fields)
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
 * @param {object} res Cloud Function response object.
 */
exports.handler = function handler(req, res) {
  console.log('payload received\n%O', JSON.stringify(req.body,null,'\t'));

  let { token, challenge, event } = req.body

  // ignore retries
  if (req.headers["X-Slack-Retry-Num"]) {
    console.log('ignoring event api retry', req.headers["X-Slack-Retry-Num"])
    return res.send()
  }

  // verify slack request token
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('invalid verification token', token)
    return res.status(401).send('Invalid request')
  }

  // slack events api challenge request
  if (challenge) {
    console.log('challenge request', challenge)
    return res.send(challenge)
  }

  // ignore bot events

  if (event && event.bot_id) {
    console.log('bot event ignored', event.bot_id)
    return res.send()
  }

  // process the event
  let complete = () => res.send()
  processEvent(event).then(complete).catch(complete)
}