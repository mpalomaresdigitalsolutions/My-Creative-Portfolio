// This is a Netlify serverless function.
// It acts as a secure proxy to the DeepSeek API.

export default async (req, context) => {
  // 1. Get the user's message from the request body.
  const { messages, portfolioContext } = await req.json();

  // 2. Get the secret API key from environment variables (set in Netlify UI).
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    return new Response("API key is not configured.", { status: 500 });
  }

  // 3. Prepare the prompt for the AI.
  const systemPrompt = `You are Marlon Palomares's personal AI assistant. Your voice should be casual, friendly, and approachable, just like Marlon. Answer questions based ONLY on the provided portfolio information. Avoid sounding like a generic AI. Instead, be conversational and engaging. Encourage users to reach out to Marlon for professional collaborations. If you don't know the answer from the context, say something like, "That's a great question! I don't have the details on that, but I'm sure Marlon would be happy to chat about it." Here is Marlon's portfolio data: \n\n${portfolioContext}`;

  const payload = {
    model: 'deepseek-chat',
    messages: [
      { "role": "system", "content": systemPrompt },
      ...messages // Spread the user's message history
    ],
    stream: true,
  };

  // 4. Call the DeepSeek API securely from the server.
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  // 5. Stream the response back to the chatbot on your website.
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
};
