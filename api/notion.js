import fetch from "node-fetch";

export default async function handler(req, res) {
  // ✅ Fix: Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Fix: Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Fix: Debugging GET request
  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from GET! Your Notion proxy is running." });
  }

  try {
    // ✅ Fix: Ensure req.body is properly parsed
    const requestBody = await req.json(); // Vercel does not auto-parse JSON

    if (!requestBody) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { notionEndpoint, body } = requestBody;

    if (!notionEndpoint || !body) {
      return res.status(400).json({ error: "Missing 'notionEndpoint' or 'body' in request" });
    }

    // ✅ Fix: Ensure API keys are defined (Use Environment Variables)
    const NOTION_TOKEN = process.env.NOTION_TOKEN; // Set in Vercel
    const NOTION_VERSION = "2022-06-28";

    if (!NOTION_TOKEN) {
      return res.status(500).json({ error: "Server misconfiguration: NOTION_TOKEN is missing." });
    }

    // ✅ Fix: Forward request to Notion API
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
