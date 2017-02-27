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

'use strict';

// [START functions_slack_setup]
const config = require('./config.json');

var apiai = require('apiai');
var apiapp = apiai(config.APIAI_TOKEN);


// [END functions_slack_setup]

// [START functions_slack_search]
/**
 * Receive a Slash Command request from Slack.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/keanubotwebhook
 *
 * @example
 * curl -X POST "https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/keanubotwebhook" --data '{"token":"[YOUR_SLACK_TOKEN]","text":"whoa"}'
 *
 * @param {object} req Cloud Function request object.
 * @param {object} req.body The request payload.
 * @param {string} req.body.token Slack's verification token.
 * @param {string} req.body.text The user's search query.
 * @param {object} res Cloud Function response object.
 */
exports.keanubotwebhook = function keanubotwebhook (req, res) {

  if(verifyWebhook(req.body)) {
    handleSlackEvent(req.body, function(body) {
      res.status(200).send(body);
    });
  } else {
    res.status(401).send('Could not verify Webhook');
  }

};
// [END functions_slack_search]

// [START functions_verify_webhook]
/**
 * Verify that the webhook request came from Slack.
 *
 * @param {object} body The body of the request.
 * @param {string} body.token The Slack token to be verified.
 */
function verifyWebhook (body) {

  console.log("Slack Token: " + JSON.stringify(body));

  console.log("OK:" + JSON.stringify(body.token));

  if (!body || body.token !== config.SLACK_TOKEN) {
    return false;
  } else {
    return true;
  }
}
// [END functions_verify_webhook]

function handleSlackEvent(event,callback)
{
    console.log("Handling Slack Webhook");
    //console.log(event);
    console.log(JSON.stringify(event));

    var conversationRawText = event.text;

    if(event.user_name != "keanubot" && event.user_name != "slackbot"){

      var request = apiapp.textRequest(conversationRawText, {
        sessionId: "12312"
      });

      request.on('response', function(response) {
        console.log(JSON.stringify(response));
        if (response.result.score > 0.1)
        {

          console.log("Autoreplying to user: " + response.result.fulfillment.speech);
          var slackMessage = formatSlackMessage(response.result.fulfillment.speech);
          console.log(JSON.stringify(slackMessage));
          //client.conversations.reply(reply, callback);
          callback(slackMessage);
        }
      });

      request.on('error', function(error) {
          console.log(error);
          callback();
      });

      request.end();
    } else {
      callback();
    }
}

// [START functions_slack_format]
/**
 * Format the API.ai response into a richly formatted Slack message.
 *
 * @param {object} response The speech response from the API.ai. This is assumed
 * to be a text or picture, or both with a ',' as the seperator
 * @returns {object} The formatted message.
 */
function formatSlackMessage (response) {


  // Prepare a rich Slack message
  // See https://api.slack.com/docs/message-formatting
  var slackMessage = {
    response_type: 'in_channel',
    attachments: []
  };

  if(response.match(','))
  {
    console.log("Found a ,");
    var responses = response.split(',');
    if(responses.length == 2)
    {
      slackMessage["text"] = responses[0];
      slackMessage.attachments.push(createAttachment(responses[1]));
    }
  } else {
    if (response.match('(?:jpg|gif|png)$')) {
      slackMessage.attachments.push(createAttachment(response));
    } else {
      slackMessage["text"] = response;
    }
  }
  return slackMessage;
}

function createAttachment(imageURL)
{
  const attachment = {
    color: '#3367d6',
    image_url: imageURL.replace(/ /g,''),
    title: "",
    title_link:"",
    text: ""
  }
  return attachment;
}

// [END functions_slack_format]



exports.localTestEvent = function localTestEvent(event,callback) {
  handleSlackEvent(event,callback);
};
