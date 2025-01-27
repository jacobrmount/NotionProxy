import fetch from "node-fetch"; // ✅ Correct import for ES Modules

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from GET! Your Notion proxy is running." });
  }

  try {
    const { notionEndpoint, body } = req.body || {};

    if (!notionEndpoint) {
      return res.status(400).json({ error: "Missing 'notionEndpoint' in request body." });
    }

    const NOTION_TOKEN = "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";
    const NOTION_VERSION = "2022-06-28";

    // Ensure the token is set (prevents authentication errors)
    if (!NOTION_TOKEN) {
      return res.status(500).json({ error: "Server misconfiguration: NOTION_TOKEN is missing." });
    }

    // Forward the request to Notion API
    const notionResponse = await fetch(notionEndpoint, {
      method: "POST",
      headers: {
        "Authorization": NOTION_TOKEN,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!notionResponse.ok) {
      return res.status(notionResponse.status).json({ error: `Notion API error: ${notionResponse.statusText}` });
    }

    const data = await notionResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
