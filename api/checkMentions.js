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

    // ✅ Use search instead of userMentionTimeline (avoids rate limit)
  const response = await twitter.v2.search("@RoastShiba", {
  "tweet.fields": "author_id",
  max_results: 10
});


    const data = response.data;

    if (!data || data.length === 0) {
      console.log("😶 No new mentions found");
      return res.status(200).send("No mentions found");
    }

    const latest = data[0];
    const tweetText = latest.text;
    const tweetId = latest.id;
    const username = latest.author_id;
    const artTitle = tweetText.replace(/@RoastShiba/gi, "").trim();
    const tweetURL = `https://x.com/${username}/status/${tweetId}`;

    console.log("🔥 Processing roast for:", { username, artTitle });

    // ✅ Call roast endpoint
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, artTitle, tweetId, tweetURL })
    });

    return res.status(200).json({ handled: tweetId });
  } catch (err) {
    console.error("❌ Error in checkMentions:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
