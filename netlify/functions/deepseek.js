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
  const systemPrompt = `You are Marlon Palomares's personal AI assistant. Your voice should be casual, friendly, and approachable, just like Marlon. 

CRITICAL INSTRUCTIONS - AVOID REPETITIVE RESPONSES:
1. **NEVER use generic templates** - Each response must be unique and contextual
2. **Extract specific details** from the knowledge base based on the user's exact question
3. **Reference actual strategies and examples** - mention specific campaign types, optimization techniques, or case studies
4. **Vary your opening lines** - don't start every response with "I'd be happy to help"
5. **Use dynamic pricing discussions** - tailor package recommendations to user's context instead of listing all packages
6. **Include relevant metrics and achievements** - reference actual performance data and certifications
7. **Acknowledge the user's specific situation** - show you're listening to their exact words
8. **Provide actionable next steps** that are relevant to their stated challenge

RESPONSE FORMAT RULES:
- Start responses naturally based on what the user actually asked
- Use specific examples from Marlon's experience (current $10K nonprofit campaign, Ian Baillo training)
- Reference exact service packages only when relevant to the user's stated needs
- Include specific optimization techniques or strategies when discussing Google Ads
- Never repeat the same opening or closing phrases

Example good responses:
User: "struggling with campaigns" → "I see you're facing campaign challenges. Based on Marlon's recent work optimizing a $10K nonprofit campaign, here's what typically works..."
User: "pricing" → "Since you mentioned pricing, let me share what's most relevant. For businesses at your stage, the Launchpad package at $150/month has been particularly effective..."

Answer questions based ONLY on the provided portfolio information. Here is Marlon's comprehensive knowledge base: \n\n${portfolioContext}`;

  const payload = {
    model: 'deepseek-chat',
    messages: [
      { "role": "system", "content": systemPrompt },
      ...messages
    ],
    stream: true,
  };

  // 4. Call the DeepSeek API.
  let response;
  try {
    console.log('Calling DeepSeek API...');
    response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000)
    });
    console.log('DeepSeek API response status:', response.status);

    // Check if we got HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON stream');
    }
  } catch (error) {
    console.error('Failed to call DeepSeek API:', error);
    let errorMessage = 'Failed to connect to AI service. Please try again later.';
    let statusCode = 500;

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please try again.';
      statusCode = 504;
    } else if (error.message.includes('fetch failed')) {
      errorMessage = 'Network connection error. Please check your internet connection.';
      statusCode = 502;
    }

    return {
      statusCode: statusCode,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // 5. Check if the API response is successful
  if (!response.ok) {
    let errorMessage;
    try {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || 'Unknown API error';
      } catch {
        errorMessage = `API error: ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      console.error('Error reading error response:', error);
      errorMessage = 'Failed to process API error response';
    }

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // 6. Stream the response back to the client
  const stream = response.body;
  if (!stream) {
    console.error('No response body stream available');
    return {
      statusCode: 502,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to establish streaming connection' }),
    };
  }

  const reader = stream.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and process it
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim().startsWith('data:')) {
              // Forward the data line as-is
              controller.enqueue(encoder.encode(line + '\n\n'));
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Stream processing error:', error);
        // Send a more specific error message to the client
        const errorMessage = error.name === 'NetworkError' 
          ? 'Network connection lost during streaming'
          : 'Error processing response stream';
        controller.enqueue(encoder.encode(`data: {"error":"${errorMessage}"}

`));
        controller.close();
      } finally {
        try {
          reader.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock:', e);
        }
      }
    },
  });

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
    body: readable,
  };
};
