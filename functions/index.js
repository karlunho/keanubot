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

'use strict'

// Load environment variables from `.env` file and/or OS.
require('dotenv').config();

const botEndpoint = require('./bot-endpoint'),
  fulfillment = require('./fulfillment');

module.exports = {
  keanubot: botEndpoint.handler,
  apiaifulfillment: fulfillment.handler
};
