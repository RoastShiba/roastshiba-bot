const { TwitterApi } = require("twitter-api-v2");
const fetch = require("node-fetch");
const { getLastTweetId, setLastTweetId } = require("../lib/sheets");

module.exports = async function handler(req, res) {
  console.log("🚀 /api/checkMentions triggered");

  try {
    const twitter = new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_SECRET,
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_SECRET
    });

    // 🔍 Search for tweets tagging @RoastShiba
    const search = await twitter.v2.search("@RoastShiba", {
      "tweet.fields": "author_id,created_at",
      max_results: 10
    });

    const data = search.data;
    if (!data || data.length === 0) {
      console.log("🟡 No mentions found.");
      return res.status(200).json({ message: "No mentions" });
    }

    const lastId = await getLastTweetId();
    console.log("🧠 Last roasted ID:", lastId);

    const newMention = data.find(tweet => tweet.id !== lastId);
    if (!newMention) {
      console.log("🟨 No unroasted tweets.");
      return res.status(200).json({ message: "No new tweets" });
    }

    const tweetText = newMention.text;
    const tweetId = newMention.id;
    const username = newMention.author_id;
    const artTitle = tweetText.replace(/@RoastShiba/gi, "").trim();
    const tweetURL = `https://x.com/${username}/status/${tweetId}`;

    console.log("🔥 Roasting tweet:", tweetId);

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, artTitle, tweetId, tweetURL })
    });

    await setLastTweetId(tweetId);
    return res.status(200).json({ roasted: tweetId });

  } catch (err) {
    if (err.code === 429) {
      console.warn("⚠️ Rate limit hit.");
      return res.status(429).json({ error: "Rate limit hit." });
    }

    console.error("❌ checkMentions failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
