const NOTION_TOKEN = "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"
const NOTION_VERSION = "2022-06-28"

export default async function handler(req, res) {
  // Allow CORS for Widgy & Safari WebView
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Simple GET request for testing
  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from GET! Your Notion proxy is running." });
  }

  try {
    // Read the request body
    const { notionEndpoint, body } = req.body || {};

    if (!notionEndpoint) {
      return res.status(400).json({ error: "Missing 'notionEndpoint' in request body." });
    }

    // Use environment variables instead of hardcoded tokens
    const NOTION_TOKEN = process.NOTION_TOKEN;
    const NOTION_VERSION = process.NOTION_VERSION;

    // Ensure the token is set (prevents authentication errors)
    if (!NOTION_TOKEN) {
      return res.status(500).json({ error: "Server misconfiguration: NOTION_TOKEN is missing." });
    }

    // Forward the request to Notion API
    const notionResponse = await fetch(notionEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    // Handle Notion API errors
    if (!notionResponse.ok) {
      return res.status(notionResponse.status).json({ error: `Notion API error: ${notionResponse.statusText}` });
    }

    const data = await notionResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
