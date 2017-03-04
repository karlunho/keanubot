# keanubot
Let the most excellent Keanu improve your Slack conversations

![Excellent](https://cloud.githubusercontent.com/assets/35968/23574957/3c4cd150-003a-11e7-96c2-2a3e0df7df2c.png)

## Config Variables
Name | Description
---|---
`APIAI_TOKEN` | The api.ai [access token](https://docs.api.ai/docs/authentication)
`SLACK_TOKEN` | The Slack Bot token 
`VERIFICATION_TOKEN` | The Slack verification token

## Instructions:

1. Create a [Slack App](./slack.md) and install it on your team

2. Using your Slack and API.ai credentials, create a config.json file. Use
the [config.default.json](./config.default.json) as a guide.

3. Deploy the app to CloudFunctions :
```
gcloud alpha functions deploy keanubot --stage-bucket <YOUR_CLOUD_STORAGE> --trigger-http
```

4. Trigger your CloudFunctions
```
curl -X POST "https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/keanubot" --data '[Slack Message Event]'
```

5. Invite your bot into a channel or send messages to it
![](https://cloud.githubusercontent.com/assets/35968/23574948/14166368-003a-11e7-94ed-1cf585dbb2e8.png)