// This is a Netlify serverless function.
// It acts as a secure proxy to the DeepSeek API.

exports.handler = async function(event, context) {
  // Handle CORS preflight requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests for actual processing
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 1. Get the user's message from the request body.
  let messages, portfolioContext;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
    portfolioContext = body.portfolioContext;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request: messages array is required' }),
      };
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  // 2. Get the secret API key from environment variables.
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY environment variable is missing');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'AI service is not properly configured. Please contact the administrator.' }),
    };
  }

  // 3. Prepare the prompt for the AI.
  const systemPrompt = `You are Marlon Palomares's personal AI assistant. Your voice should be casual, friendly, and approachable, just like Marlon. Answer questions based ONLY on the provided portfolio information. Avoid sounding like a generic AI. Instead, be conversational and engaging. Encourage users to reach out to Marlon for professional collaborations. If you don't know the answer from the context, say something like, "That's a great question! I don't have the details on that, but I'm sure Marlon would be happy to chat about it." Here is Marlon's portfolio data: \n\n${portfolioContext}`;

  const payload = {
    model: 'deepseek-chat',
    messages: [
      { "role": "system", "content": systemPrompt },
      ...messages
    ],
    stream: true,
  };

  // 4. Call the DeepSeek API.
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  // 5. Check if the API response is successful
  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepSeek API error:', response.status, errorText);
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: `DeepSeek API error: ${response.status} ${response.statusText}` }),
    };
  }

  // 6. Stream the response back to the client with proper headers
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
    body: response.body,
  };
};
