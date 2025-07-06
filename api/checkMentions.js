const { TwitterApi } = require("twitter-api-v2");
const fetch = require("node-fetch");

let lastTweetId = null; // In-memory cache — will reset on redeploy

module.exports = async function handler(req, res) {
  console.log("🚀 RoastShiba /api/checkMentions triggered");

  try {
    const twitter = new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_SECRET,
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_SECRET
    });

    // 🧠 Use /search to avoid rate-limited mentions API
    const search = await twitter.v2.search("@RoastShiba", {
      "tweet.fields": "author_id,created_at",
      max_results: 10
    });

    const data = search.data;

    if (!data || data.length === 0) {
      console.log("🟡 No tweets found.");
      return res.status(200).json({ message: "No mentions found" });
    }

    // 🧹 Filter out tweets already roasted (by comparing last ID)
    const newMentions = data.filter(tweet => tweet.id !== lastTweetId);

    if (newMentions.length === 0) {
      console.log("🟨 No new unprocessed mentions.");
      return res.status(200).json({ message: "No new mentions to roast" });
    }

    // 🔥 Process the latest unroasted tweet
    const tweet = newMentions[0];
    const tweetId = tweet.id;
    const tweetText = tweet.text;
    const username = tweet.author_id;
    const artTitle = tweetText.replace(/@RoastShiba/gi, "").trim();
    const tweetURL = `https://x.com/${username}/status/${tweetId}`;

    console.log("🎯 Roasting tweet:", tweetId, tweetText);

    // ✅ Trigger roast endpoint
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, artTitle, tweetId, tweetURL })
    });

    // 🔒 Store the last tweet ID to avoid duplicate roasts
    lastTweetId = tweetId;

    return res.status(200).json({ roasted: tweetId });

  } catch (err) {
    if (err.code === 429) {
      console.warn("⚠️ Twitter API rate limit hit. Skipping roast.");
      return res.status(429).json({ error: "Rate limit. Try later." });
    }

    console.error("❌ checkMentions fatal error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
