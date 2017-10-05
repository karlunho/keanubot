// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Code based on https://github.com/api-ai/fulfillment-webhook-nodejs

'use strict';

exports.handler = (request, response) => {
  // Log the request header and body coming from API.AI to help debug issues.
  // See https://api.ai/docs/fulfillment#request for more.
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  let action = null,
      parameters = null,
      contexts = null;

  // An action is a string used to identify what tasks needs to be done
  // in fulfillment usally based on the corresponding intent.
  // See https://api.ai/docs/actions-and-parameters for more.
  if ('result' in request.body) {
    action = request.body.result.action;

  // Parameters are any entites that API.AI has extracted from the request.
  // See https://api.ai/docs/actions-and-parameters for more.
    parameters = request.body.result.parameters;

  // Contexts are objects used to track and store conversation state and are identified by strings.
  // See https://api.ai/docs/contexts for more.
    contexts = request.body.result.contexts;
  }

  // Initialize JSON we will use to respond to API.AI.
  let responseJson = {};

  // Create a handler for each action defined in API.AI
  // and a default action handler for unknown actions
  const actionHandlers = {
    'input.name': () => {
      let name = parameters.givenName || 'friend';
      let text = `Hello _${name}_. My... name... is... *NEO*! 😎😎😎`;
      let image_url = ` http://1.bp.blogspot.com/-3S6-8oHs7l8/T6vxvqlLuXI/AAAAAAAABkU/qGp-BkfXdiU/s1600/mynameisneo.jpg`;
      responseJson.speech = text + ',' + image_url;
      // Send the response to API.AI
      response.json(responseJson);
    },
    'input.do-you-know': () => {
      let skill = parameters.skill || 'that';
      let text = `I don't know *${skill}* but... _I know Kung Fu_. 🥋🥋🥋`;
      let image_url = `http://kungfukingdom.com/wp-content/uploads/2016/08/The-Matrix-Kung-Fu-Kingdom-770x472.jpg`;
      responseJson.speech = text + ',' + image_url;
      response.json(responseJson);
    },
    'default': () => {
      // This is executed if the action hasn't been defined.
      // Add a new case with your action to respond to your users' intent!
      responseJson.speech = 'Whoa. Just.... whoa. (default message).';

      // Optional: add outgoing context(s) for conversation branching and flow control.
      // Uncomment next 2 lines to enable. See https://api.ai/docs/contexts for more.
      //let outgoingContexts = [{"name":"weather", "lifespan":2, "parameters":{"city":"Rome"}}];
      //responseJson.contextOut = outgoingContexts;

      // Send the response to API.AI.
      response.json(responseJson);
    }
  };

  // If the action is not handled by one of our defined action handlers
  // use the default action handler
  if (!actionHandlers[action]) {
    action = 'default';
  }

  // Map the action name to the correct action handler function and run the function
  console.log("Invoking action ", action);
  actionHandlers[action]();
};
