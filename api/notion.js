// api/notion.js
import fetch from 'node-fetch';

/**
 * A Vercel serverless function that proxies requests to Notion's API.
 * Add the following environment variables on Vercel:
 *   NOTION_TOKEN, NOTION_VERSION
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // We'll expect the client to send:
    // {
    //   notionEndpoint: "https://api.notion.com/v1/databases/xxx/query",
    //   body: { filter: { ... }, sorts: [ ... ] }
    // }
    const { notionEndpoint, body } = req.body || {};

    if (!notionEndpoint) {
      return res.status(400).json({ error: 'notionEndpoint is required in request body' });
    }

    // Build headers from environment variables
    const notionToken = process.env.NOTION_TOKEN;
    const notionVersion = process.env.NOTION_VERSION || '2022-06-28';

    // Forward the request to Notion
    const notionResponse = await fetch(notionEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': notionVersion
      },
      body: JSON.stringify(body)
    });

    const data = await notionResponse.json();

    // Return the data to the client
    // Add permissive CORS headers to allow Widgy's Safari to accept
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
