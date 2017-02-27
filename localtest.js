var gcf = require('./index');

var slackEvent = {
   "token":"bfZTKuChvIygERs2yQdpuK8N",
   "team_id":"T025N3T5Z",
   "team_domain":"apigee",
   "service_id":"128925746628",
   "channel_id":"C30P2QKFZ",
   "channel_name":"selfservice-intercom",
   "timestamp":"1488071208.861050",
   "user_id":"U0AAH9ZRP",
   "user_name":"alanho",
   "text":"whoa"
};



gcf.localTestEvent(slackEvent, function() {
  console.log("Finished Local Testing");
});
