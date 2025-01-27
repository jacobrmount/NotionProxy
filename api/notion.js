// notion.js
// Place this file in "api/notion.js" at the root of your repo (or in the folder 
// you set as Vercel's "Root Directory"). This version handles both GET and POST 
// so you can test via browser GET requests and still proxy Notion for POST.
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // If someone visits this URL in a browser (making a GET request),
  // we'll return a simple JSON message to confirm the route is working:
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Hello from GET! Your Notion proxy is up and running.'
    });
  }

  // Otherwise, only allow POST for the actual Notion proxy behavior:
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed - use GET to test or POST to call Notion'
    });
  }

  try {
    // Expect the client to send something like:
    // {
    //   notionEndpoint: 'https://api.notion.com/v1/databases/<DB_ID>/query',
    //   body: { filter: {...}, sorts: [...] }
    // }
    const { notionEndpoint, body } = req.body || {};

    if (!notionEndpoint) {
      return res.status(400).json({
        error: 'Missing "notionEndpoint" in request body.'
      });
    }

    // Read environment variables you set in Vercel -> Project Settings -> Environment Variables
    // For example: NOTION_TOKEN and NOTION_VERSION
    const notionToken = process.env.NOTION_TOKEN;            // e.g. 'secret_abc123'
    const notionVersion = process.env.NOTION_VERSION || '2022-06-28';

    // Forward the request to Notion
    const notionResponse = await fetch(notionEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': notionVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await notionResponse.json();

    // Return the data to the client
    // Add permissive CORS headers so your Widgy script can read the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Unknown error from Notion proxy'
    });
  }
}
