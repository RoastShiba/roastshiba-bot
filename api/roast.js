// Vercel API route: Receives data → generates roast → saves to sheet → replies on Twitter
import { writeToSheet } from "@/lib/sheets";
import { TwitterApi } from "twitter-api-v2";

export default async function handler(req, res) {
  const { username, artTitle, tweetId, tweetURL } = req.body;

  const roastPrompt = `
Roast this artwork titled "${artTitle}" by @${username}.
Make it sarcastic, funny, and under 280 characters.
`;

  // === Claude API request (replace with OpenAI if needed) ===
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

  // === Save to Google Sheets ===
  await writeToSheet({
    username,
    artTitle,
    roast,
    score: Math.floor(Math.random() * 10) + 1, // placeholder score
    tweetURL
  });

  // === Reply on Twitter ===
  const twitter = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET
  });

  await twitter.v2.reply(`@${username} ${roast}`, tweetId);

  res.status(200).json({ success: true, roast });
}
