document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatContainer = document.querySelector('.chat-container');
    const chatToggle = document.querySelector('.chat-toggle');
    const closeChatBtn = document.querySelector('.close-chat');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    let portfolioContext = '';
    let idleTimer;

    // --- Functions ---

    /**
     * Ends the chat session due to inactivity.
     */
    function endChatSession() {
        displayMessage("Your session has ended due to inactivity.", "bot");
        chatInput.disabled = true;
        sendBtn.disabled = true;
        // Optionally, close the chat window after a delay
        setTimeout(() => {
            chatContainer.style.display = 'none';
            chatToggle.style.display = 'flex';
            // Re-enable input for the next session
            chatInput.disabled = false;
            sendBtn.disabled = false;
        }, 4000);
    }

    /**
     * Resets the idle timer.
     */
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(endChatSession, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Fetches portfolio data to be used as context for the chatbot.
     */
    async function loadPortfolioData() {
        try {
            const response = await fetch('portfolio_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            portfolioContext = JSON.stringify(data, null, 2);
            console.log('Portfolio data loaded successfully.');
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            displayMessage('Sorry, I am having trouble accessing my knowledge base right now.', 'bot');
        }
    }

    /**
     * Appends a message to the chat window.
     * @param {string} message - The message content.
     * @param {('user'|'bot')} sender - The sender of the message.
     */
    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    /**
     * Saves a conversation to the Supabase database.
     * @param {string} userMessage - The user's message.
     * @param {string} botResponse - The bot's response.
     */
    async function saveMessageToSupabase(userMessage, botResponse) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                    user_message: userMessage,
                    bot_response: botResponse,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Supabase error: ${JSON.stringify(error)}`);
            }
            console.log('Message saved to Supabase successfully.');
        } catch (error) {
            console.error('Error saving message to Supabase:', error);
        }
    }

    /**
     * Gets a streaming response from the DeepSeek API and updates the UI in real-time.
     * @param {string} userMessage - The user's message.
     * @param {HTMLElement} botMessageElement - The UI element for the bot's message.
     * @returns {Promise<string>} The full bot response for saving.
     */
    async function getBotResponse(userMessage, botMessageElement) {
        if (!portfolioContext) {
            botMessageElement.textContent = 'I am still gathering my thoughts. Please try again in a moment.';
            return botMessageElement.textContent;
        }
        
        let fullResponse = '';
        try {
            // Call our secure Netlify serverless function instead of the DeepSeek API directly.
            const response = await fetch('/.netlify/functions/deepseek', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ "role": "user", "content": userMessage }],
                    portfolioContext: portfolioContext
                }),
            });

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || `Server error: ${response.status}`;
                } catch {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Check if response has a body
            if (!response.body) {
                throw new Error('No response body received');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            botMessageElement.textContent = ''; // Clear the '...'
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

                        const jsonStr = trimmedLine.substring(5).trim();
                        if (jsonStr === '[DONE]') {
                            console.log('Stream completed');
                            break;
                        }

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                botMessageElement.textContent += content;
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            console.warn('Invalid JSON chunk:', e.message);
                            continue;
                        }
                    }
                }
            } catch (streamError) {
                console.error('Error processing stream:', streamError);
                throw new Error('Failed to process the AI response stream');
            } finally {
                reader.releaseLock();
            }
            }
            
            if (!fullResponse.trim()) {
                throw new Error('No response received from AI');
            }
            
            return fullResponse;
        } catch (error) {
            console.error('Error fetching streaming response from DeepSeek API:', error);
            
            let errorMessage;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Connection error: Please check your internet connection or try again later.';
            } else if (error.message.includes('API key')) {
                errorMessage = 'Configuration error: AI service is temporarily unavailable.';
            } else {
                errorMessage = error.message || 'Sorry, I am having trouble connecting to my brain right now. Please try again later.';
            }
            
            botMessageElement.textContent = errorMessage;
            return errorMessage;
        }
    }

    /**
     * Handles the process of sending a message.
     */
    async function handleSendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        displayMessage(userMessage, 'user');
        chatInput.value = '';
        resetIdleTimer(); // Reset timer on send
        
        // Create a placeholder for the bot's streaming response
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.textContent = '...';
        chatMessages.appendChild(botMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const botResponse = await getBotResponse(userMessage, botMessageElement);
        
        await saveMessageToSupabase(userMessage, botResponse);
    }

    // --- Event Listeners ---
    chatToggle.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        chatToggle.style.display = 'none';
        resetIdleTimer(); // Start timer when chat is opened
    });

    closeChatBtn.addEventListener('click', () => {
        chatContainer.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        resetIdleTimer(); // Reset timer on keypress
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    chatInput.addEventListener('input', resetIdleTimer); // Also reset on any input

    // --- Initialization ---
    loadPortfolioData();
    displayMessage('Hello! How can I help you learn more about Marlon Palomares today?', 'bot');
});
