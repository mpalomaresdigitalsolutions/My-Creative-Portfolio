// This is a simplified function for debugging purposes.
exports.handler = async function(event, context) {
  // Explicitly handle OPTIONS request for potential CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  // Test for POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: `Method Not Allowed. You used ${event.httpMethod}. Only POST is accepted.`,
    };
  }

  // If POST is used, return a success message
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "Success! The function received the POST request." }),
  };
};
