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
            const basicInfo = "So Marlon's this Google Ads guy who's been crushing it - he's actually managing a $10k/month campaign right now for a nonprofit. Pretty cool, right? He's got all the Google certifications and really knows his stuff when it comes to getting results.";
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
            
            // Generate contextual responses based on user questions
            if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('package')) {
                response = `Hey! So here's the deal with Marlon's pricing - he's got three packages that make total sense:\n\nFor smaller businesses just starting out, there's the "Launchpad" at $150/month. Perfect if you're working with like $200-500 ad budget. You get a solid search campaign, keyword research, ad creatives, the whole setup.\n\nThen there's "Growth" at $300/month for businesses spending $500-1500. This adds extra campaigns like display or remarketing, plus weekly optimization instead of bi-weekly.\n\nAnd for the big players, "Total Control" starts at $500/month. This is when you're spending serious money ($1500+) and want daily monitoring and all the bells and whistles.\n\nHonestly? The pricing is pretty fair for what you get. Which one sounds like it fits your situation?`;
            } else if (messageLower.includes('service') || messageLower.includes('offer') || messageLower.includes('do')) {
                response = `Oh man, Marlon does a ton of stuff! His main thing is obviously Google Ads - like full campaign management from start to finish.\n\nBut here's what I think is cool - he's not just some guy who took a Google course. He was actually trained by Ian Baillo, who's like THE Google Ads expert in the Philippines. Plus he's currently managing a $10k/month campaign for a nonprofit, so he's literally doing this stuff right now, not just talking about it.\n\nHis specialties include:\n- Google Ads audits (like figuring out why your campaigns aren't working)\n- Strategy development\n- Campaign optimization\n- Copywriting for ads\n- Keyword research\n- Setting up conversion tracking\n\nBasically, if it's Google Ads related, he's got you covered. What's your biggest challenge with ads right now?`;
            } else if (messageLower.includes('experience') || messageLower.includes('background') || messageLower.includes('qualified')) {
                response = `So Marlon's got this interesting background - he's been working with US clients for like 4 years in customer service and tech support, so he really gets how American businesses think.\n\nBut the Google Ads stuff? That's more recent and super legit. He got his Google certifications in 2024, then did advanced training with Ian Baillo's academy (this guy's basically a legend in the Philippines Google Ads scene).\n\nRight now he's volunteering managing a $10k/month search campaign for a nonprofit through VolunteerMatch. I mean, that's real-world experience happening as we speak.\n\nPlus he's done freelance work for organizations like the Humanity Impacts Institute, so it's not just theory - he's been in the trenches actually making campaigns work.\n\nWhat specific experience are you looking for? Like, what kind of campaigns are you running?`;
            } else if (messageLower.includes('certification') || messageLower.includes('certified')) {
                response = `Oh yeah, Marlon's got all his ducks in a row when it comes to certifications!\n\nHe's Google Ads certified across the board - Search, Display, Video, and Shopping. Got that in 2024.\n\nBut here's what's actually impressive - he did advanced Google Ads training with Ian Baillo's Pass Academy. Ian's like the top Google Ads expert in the Philippines, so that's legit training, not just some online course.\n\nHe also did Virtual Assistant training with The VA BAR in 2025, and even Facebook Ads mastery training with Negosyo Network Academy.\n\nSo yeah, he's got the papers, but more importantly, he's got the training from people who actually know what they're doing. The Google certification is great, but that advanced training is where the real knowledge comes from.`;
            } else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
                response = `Hey there! 👋\n\nSo you're looking to learn more about Marlon? Nice choice - he's honestly one of the good ones in the Google Ads space.\n\nInstead of giving you the boring resume spiel, how about I just tell you what's actually cool about him? He's literally managing a $10k/month campaign right now for a nonprofit, so he's not just talking theory. Plus he was trained by this guy Ian Baillo who's like the Google Ads whisperer of the Philippines.\n\nWant to know about his services, pricing, or what makes him different from the million other "Google Ads experts" out there?`;
            } else {
                // Default friendly response with key info
                response = `Hey! So Marlon's basically your go-to guy if you want Google Ads that actually work. Here's the quick version:\n\nHe's managing a $10k/month campaign right now (like, literally as we speak) for a nonprofit, so he's in the trenches doing this stuff. Got trained by Ian Baillo - if you know Google Ads in the Philippines, you know Ian's the real deal.\n\nHis sweet spots are Google Ads audits, strategy, optimization, and making sure you're actually tracking conversions properly (because what's the point if you don't know what's working?).\n\nHe's got three service packages starting at $150/month, depending on your ad budget and how hands-on you want him to be.\n\nWhat do you want to know more about? The services, pricing, or maybe what's wrong with your current campaigns?`;
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
    
    // More casual welcome message with slight delay for natural feel
    setTimeout(() => {
        displayMessage('Hey there! 👋 So you want to know about Marlon? Cool - I can definitely help with that.\n\nInstead of boring you with a wall of text, what are you actually curious about? His Google Ads services, what he charges, or maybe his experience managing those big campaigns? Just ask away!', 'bot');
    }, 800);
    
    console.log('Chatbot initialized and ready for interaction');
});
