export default async function handler(req, res) {
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
    // ✅ Parse JSON request body
    let body = '';

    // Ensure request body is read correctly
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', resolve);
      req.on('error', reject);
    });

    // ✅ Parse body JSON safely
    const parsedBody = JSON.parse(body || '{}');
    console.log('Parsed request body:', parsedBody);

    // ✅ Extract notionEndpoint
    const { notionEndpoint, queryBody } = parsedBody;

    if (!notionEndpoint) {
      return res.status(400).json({
        error: 'Missing "notionEndpoint" in request body.'
      });
    }

    // ✅ Read environment variables
    const notionToken = process.env.NOTION_TOKEN;
    const notionVersion = process.env.NOTION_VERSION || '2022-06-28';

    const notionResponse = await fetch(notionEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': notionVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });

    const data = await notionResponse.json();

    // ✅ CORS Headers
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
