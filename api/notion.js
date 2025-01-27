export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle CORS preflight
  }

  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from GET! Your Notion proxy is running." });
  }

  try {
    const { notionEndpoint, body } = req.body || {};

    if (!notionEndpoint) {
      return res.status(400).json({ error: "Missing 'notionEndpoint' in request body." });
    }

    const notionResponse = await fetch(notionEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `${process.env.NOTION_TOKEN}`,
        "Notion-Version": process.env.NOTION_VERSION || "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await notionResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
