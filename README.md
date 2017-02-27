# keanubot
Let the most excellent Keanu improve your group chat conversations

Instructions:

1. Using your slack and API.ai credentials, create a config.json file. Use
the config.default.json as a guide.

2. Deploy the app to CloudFunctions :

gcloud alpha functions deploy keanubotwebhook --stage-bucket <YOUR_CLOUD_STORAGE> --trigger-http

3. Trigger your CloudFunctions

curl -X POST "https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/keanubotwebhook" --data '{"token":"[YOUR_SLACK_TOKEN]","text":"whoa"}'

4. Hook your CloudFunction to your Slack Outbound Webhook

https://api.slack.com/outgoing-webhooks
