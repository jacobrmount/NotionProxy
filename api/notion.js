(function() {
  // Prepare the Notion query body
  const todayPlus2Weeks = new Date();
  todayPlus2Weeks.setDate(todayPlus2Weeks.getDate() + 14);
  const cutoffDate = todayPlus2Weeks.toISOString().split('T')[0];

  const bodyData = {
    // The filter/sorts from your original script
    filter: {
      and: [
        {
          or: [
            { property: "Status", select: { equals: "Todo" } },
            { property: "Status", select: { equals: "Needs Review" } },
            { property: "Status", select: { equals: "In Progress" } }
          ]
        },
        {
          property: "Due",
          date: {
            on_or_before: cutoffDate
          }
        }
      ]
    },
    sorts: [
      { property: "Due", direction: "ascending" },
      { property: "Status", direction: "descending" }
    ]
  };

  // The final POST request to your Vercel function
  fetch("https://notion-proxy-abc123.vercel.app/api/notion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      // The serverless function expects "notionEndpoint" and "body"
      notionEndpoint: "https://api.notion.com/v1/databases/15bed8dc2e838174bb19d5423c4e2ddf/query",
      body: bodyData
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        sendToWidgy("No tasks found.");
        return;
      }
      const firstItem = data.results[0];
      const taskName =
        firstItem.properties["Task name"]?.title?.[0]?.plain_text || "Unnamed Task";
      sendToWidgy(taskName);
    })
    .catch(error => {
      sendToWidgy("Error fetching tasks: " + error.message);
    });
})();
