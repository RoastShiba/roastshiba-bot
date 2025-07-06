const fetch = require("node-fetch");
const { TwitterApi } = require("twitter-api-v2");
const { writeToSheet } = require("../lib/sheets");

module.exports = async function handler(req, res) {
  const { username, artTitle, tweetId, tweetURL } = req.body;

  const roastPrompt = `
Roast this artwork titled "${artTitle}" by @${username}.
Make it sarcastic, funny, and under 280 characters.
`;

  const roastResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 300,
      messages: [{ role: "user", content: roastPrompt }]
    })
  }).then(r => r.json());

  const roast = roastResponse?.content?.[0]?.text || "Roast failed";

  await writeToSheet({
    username,
    artTitle,
    roast,
    score: Math.floor(Math.random() * 10) + 1,
    tweetURL
  });

  const twitter = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET
  });

  await twitter.v2.reply(`@${username} ${roast}`, tweetId);

  res.status(200).json({ success: true, roast });
};
