import fetch from "node-fetch";

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
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { notionEndpoint, body } = req.body;

    if (!notionEndpoint || !body) {
      return res.status(400).json({ error: "Missing 'notionEndpoint' or 'body' in request" });
    }

    // 🔥 HARD-CODED API TOKEN TEMP FIX (REMOVE THIS AFTER TESTING)
    const NOTION_TOKEN = "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"; 
    const NOTION_VERSION = "2022-06-28";

    const notionResponse = await fetch(notionEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
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
