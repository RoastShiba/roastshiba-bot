const { TwitterApi } = require("twitter-api-v2");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  try {
    console.log("✅ checkMentions triggered");

    const twitter = new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_SECRET,
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_SECRET
    });

    const me = await twitter.v2.me();
    const botId = me.data.id;
    console.log("🤖 Bot ID:", botId);

    const { data } = await twitter.v2.userMentionTimeline(botId, {
      expansions: ["author_id"],
      max_results: 5
    });

    if (!data || data.length === 0) return res.status(200).send("No mentions found");

    const latest = data[0];
    const tweetText = latest.text;
    const tweetId = latest.id;
    const username = latest.author_id;
    const artTitle = tweetText.replace(/@RoastShiba/gi, "").trim();
    const tweetURL = `https://x.com/${username}/status/${tweetId}`;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, artTitle, tweetId, tweetURL })
    });

    res.status(200).json({ handled: tweetId });
  } catch (err) {
    console.error("❌ Error in checkMentions:", err);
    res.status(500).json({ error: "Server error" });
  }
};
