export default async function handler(req, res) {
  // ✅ Ensure this function is async
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Hello from GET! Your Notion proxy is up and running.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed - use GET to test or POST to call Notion'
    });
  }

  try {
    // ✅ Log request body for debugging
    console.log('Received request body:', req.body);

    // ✅ Ensure `notionEndpoint` is extracted properly
    const { notionEndpoint, body } = req.body || {};
    if (!notionEndpoint) {
      return res.status(400).json({
        error: 'Missing "notionEndpoint" in request body.'
      });
    }

    // ✅ Read environment variables correctly
    const notionToken = process.env.NOTION_TOKEN;
    const notionVersion = process.env.NOTION_VERSION || '2022-06-28';

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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      error: error.message || 'Unknown error from Notion proxy'
    });
  }
}
