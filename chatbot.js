document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat widget
    const chatWidget = document.getElementById('chat-widget');
    const minimizeBtn = document.getElementById('minimize-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');

    // Add minimize functionality
    let isMinimized = false;
    minimizeBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        chatWidget.style.height = isMinimized ? '50px' : '500px';
        minimizeBtn.innerHTML = isMinimized ? '<i class="fas fa-plus"></i>' : '<i class="fas fa-minus"></i>';
    });

    // Add enter key functionality
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Add click handler for send button
    sendBtn.addEventListener('click', handleSendMessage);

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
            chatWidget.style.display = 'none';
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
            // Use fallback context for local development
            portfolioContext = JSON.stringify({
                name: "Marlon Palomares",
                title: "Google Ads Specialist",
                summary: "A results-driven Google Ads specialist with hands-on campaign management experience.",
                core_competencies: ["Google Ads Audit", "Google Ad Strategy", "Google Ads Optimization", "Copywriting", "Keyword Research", "Conversion Tracking Setup"],
                key_achievements: ["Managing a $10,000/month Google Ads campaign for a nonprofit", "Google Ads certified with advanced optimization training"]
            }, null, 2);
            console.log('Using fallback portfolio context for local development');
        }
    }

    /**
     * Appends a message to the chat window with formatting support.
     * @param {string} message - The message content.
     * @param {('user'|'bot')} sender - The sender of the message.
     */
    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        
        // Handle line breaks and basic formatting
        messageDiv.innerHTML = message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    /**
     * Saves a conversation to the Supabase database.
     * @param {string} userMessage - The user's message.
     * @param {string} botResponse - The bot's response.
     */
    async function saveMessageToSupabase(userMessage, botResponse) {
        // Skip Supabase save in local development to prevent CORS/auth issues
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDevelopment) {
            console.log('Skipping Supabase save in local development');
            return;
        }
        
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
            botMessageElement.textContent = 'Hey! Let me tell you about Marlon...';
            // Use basic portfolio info if context isn't loaded yet
        const basicInfo = "Google Ads guy. Managing campaigns right now. Knows his stuff.";
        return basicInfo;
        }
        
        let fullResponse = '';
        
        // Check hosting environment
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // Use mock responses for local development AND GitHub Pages since Netlify functions won't work there
        if (isLocalDevelopment || isGitHubPages) {
            // Enhanced mock responses that sound more human and use actual portfolio data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Faster response for better UX
            
            const messageLower = userMessage.toLowerCase();
            let response = '';
            
            // Parse portfolio data for personalized responses
            let portfolioData;
            try {
                portfolioData = JSON.parse(portfolioContext);
            } catch (e) {
                portfolioData = null;
            }
            
            // Generate contextual responses based STRICTLY on portfolio data
            if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('package')) {
                const packages = portfolioData?.services?.packages || [
                    { name: "Launchpad", price: 150, budget: "$200-500", includes: "search campaign, keyword research, ad creatives" },
                    { name: "Growth", price: 300, budget: "$500-1500", includes: "extra campaigns, weekly optimization" },
                    { name: "Total Control", price: 500, budget: "$1500+", includes: "daily monitoring, all features" }
                ];
                
                response = `Alright, so Marlon's got three packages - super straightforward:

**Launchpad**: $${packages[0]?.price || 150}/month - perfect if you're spending around ${packages[0]?.budget || "$200-500"} on ads. Gets you ${packages[0]?.includes || "search campaign setup"}.

**Growth**: $${packages[1]?.price || 300}/month - for ${packages[1]?.budget || "$500-1500"} budgets. ${packages[1]?.includes || "more campaigns + weekly tweaks"}.

**Total Control**: Starts at $${packages[2]?.price || 500}/month - when you're spending ${packages[2]?.budget || "$1500+"} and want ${packages[2]?.includes || "daily monitoring"}.

That's literally it. No hidden fees or weird stuff. Which one's calling your name?`;
            } else if (messageLower.includes('service') || messageLower.includes('offer') || messageLower.includes('do')) {
                const services = portfolioData?.services?.specialties || [
                    "Google Ads audits", "Strategy development", "Campaign optimization", 
                    "Copywriting for ads", "Keyword research", "Conversion tracking setup"
                ];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const currentCampaign = portfolioData?.experience?.currentCampaign || "$10k/month nonprofit campaign";
                
                response = `So what Marlon actually does is pretty straightforward - Google Ads management from A to Z.

Real talk though - he learned from ${training.split("'s")[0]} (legit Google Ads guru), and right now he's running ${currentCampaign}. Not theory, happening right now.

Here's what he handles:
${services.map(service => `- ${service}`).join('\n')}

That's pretty much it. No fluff, just Google Ads that actually work. What's bugging you about your current setup?`;
            } else if (messageLower.includes('experience') || messageLower.includes('background') || messageLower.includes('qualified')) {
                const yearsUS = portfolioData?.experience?.yearsUS || "4 years";
                const certifications = portfolioData?.certifications || ["Google Ads Search", "Google Ads Display", "Google Ads Video", "Google Ads Shopping"];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const currentWork = portfolioData?.experience?.current || "managing $10k/month nonprofit campaign";
                
                response = `Dude's got the receipts:

- ${yearsUS} working with US clients (gets how we think)
- Google certified in ${certifications.length} areas (${certifications.join(', ')})
- Trained by ${training.split("'s")[0]} (the guy literally wrote the book on this stuff)
- Right now: ${currentWork}

That's not LinkedIn fluff - that's actual work happening today. What you running these days?`;
            } else if (messageLower.includes('certification') || messageLower.includes('certified')) {
                const certs = portfolioData?.certifications || ["Google Ads Search", "Google Ads Display", "Google Ads Video", "Google Ads Shopping"];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const year = portfolioData?.experience?.certYear || "2024";
                
                response = `Certs? Yeah, he's got 'em:

- ${certs.join(', ')}
- Got 'em in ${year}
- Advanced training with ${training}

That's the real deal, not some weekend course. You good with that?`;
            } else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
                const currentWork = portfolioData?.experience?.current || "managing $10k/month nonprofit campaign";
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                
                response = `Yo! 👋

Marlon's the guy running ${currentWork} right now. Learned from ${training.split("'s")[0]} - that's the guy everyone copies.

Want pricing, services, or what's wrong with your current setup?`;
            } else {
                // Default response strictly based on portfolio data
                const packages = portfolioData?.services?.packages || [
                    { name: "Launchpad", price: 150 }
                ];
                const services = portfolioData?.services?.specialties || ["Google Ads management"];
                const currentWork = portfolioData?.experience?.current || "Google Ads campaigns";
                
                response = `Quick version:

- ${services.join(', ')}
- Packages start at $${packages[0]?.price || 150}/month
- Currently doing ${currentWork}

What specifically you wanna know?`;
            }
            
            // Simulate typing with more natural pauses
            botMessageElement.textContent = '';
            const words = response.split(' ');
            let currentText = '';
            
            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 100));
                currentText += (i === 0 ? '' : ' ') + words[i];
                botMessageElement.textContent = currentText;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            return response;
        }
        
        try {
            // Check if we're on Netlify (where functions work) vs GitHub Pages
            const isNetlify = !isLocalDevelopment && !isGitHubPages;
            
            if (!isNetlify) {
                throw new Error('Netlify functions not available - using fallback responses');
            }
            
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
            
            reader.releaseLock();

            if (!fullResponse.trim()) {
                throw new Error('No response received from AI');
            }
            
            return fullResponse;
        } catch (error) {
            console.error('Error fetching streaming response from DeepSeek API:', error);
            
            // For GitHub Pages and local development, gracefully fall back to mock responses
            if (isGitHubPages || isLocalDevelopment) {
                console.log('Using fallback responses for non-Netlify hosting');
                // This will be caught and handled by the mock response system above
                throw error;
            }
            
            let errorMessage;
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Connection error: Please check your internet connection or try again later.';
            } else if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
                errorMessage = 'Service configuration issue. Using fallback responses instead.';
                console.log('405 error detected - likely GitHub Pages deployment, switching to fallback');
            } else if (error.message.includes('Server error: 502')) {
                errorMessage = 'The AI service is temporarily unavailable. Please try again in a few moments.';
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

        // Disable input while processing
        chatInput.disabled = true;
        sendBtn.disabled = true;

        displayMessage(userMessage, 'user');
        chatInput.value = '';
        resetIdleTimer(); // Reset timer on send
        
        // Create a placeholder for the bot's streaming response
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.textContent = 'Thinking...';
        botMessageElement.classList.add('thinking');
        chatMessages.appendChild(botMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            botMessageElement.classList.remove('thinking');
            const botResponse = await getBotResponse(userMessage, botMessageElement);
            await saveMessageToSupabase(userMessage, botResponse);
        } catch (error) {
            console.error('Error in chat interaction:', error);
            botMessageElement.textContent = 'Sorry, I encountered an error. Please try again.';
        } finally {
            // Re-enable input controls
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // --- Initialization ---
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    console.log('Chatbot initializing...');
    console.log('Environment:', isLocal ? 'Local Development' : isGitHubPages ? 'GitHub Pages' : 'Netlify');
    console.log('Netlify functions available:', !isLocal && !isGitHubPages);
    
    loadPortfolioData();
    
    // Casual welcome message
    setTimeout(() => {
        displayMessage("Hey! 👋\n\nMarlon's the Google Ads guy. Ask me about pricing, services, or what's broken with your ads. Keep it simple.", 'bot');
    }, 800);
    
    console.log('Chatbot initialized and ready for interaction');
});
