// This is a Netlify serverless function.
// It acts as a secure proxy to the DeepSeek API.

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // 1. Get the user's message from the request body.
  const { messages, portfolioContext } = JSON.parse(event.body);

  // 2. Get the secret API key from environment variables.
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    return {
      statusCode: 500,
      body: 'API key is not configured.',
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

  // 5. Stream the response back to the client.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/event-stream',
    },
    body: response.body,
  };
};
