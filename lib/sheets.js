const { google } = require("googleapis");

// Base auth
const getAuth = () => {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, "base64").toString("utf8")
  );

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
};

// ✅ Append new roast row
const writeToSheet = async ({ username, artTitle, roast, score, tweetURL }) => {
  const sheets = google.sheets({ version: "v4", auth: await getAuth() });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[username, artTitle, roast, score, tweetURL, new Date().toISOString()]]
    }
  });
};

// ✅ Read lastTweetId from cell G1
const getLastTweetId = async () => {
  const sheets = google.sheets({ version: "v4", auth: await getAuth() });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!G1"
  });

  return res.data.values?.[0]?.[0] || null;
};

// ✅ Write new lastTweetId to G1
const setLastTweetId = async (tweetId) => {
  const sheets = google.sheets({ version: "v4", auth: await getAuth() });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!G1",
    valueInputOption: "RAW",
    requestBody: { values: [[tweetId]] }
  });
};

module.exports = {
  writeToSheet,
  getLastTweetId,
  setLastTweetId
};
