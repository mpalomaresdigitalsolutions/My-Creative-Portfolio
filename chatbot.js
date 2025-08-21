document.addEventListener('DOMContentLoaded', async () => {
    // Initialize chat widget
    const chatWidget = document.getElementById('chat-widget');
    const minimizeBtn = document.getElementById('minimize-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');

    // Start with chat widget minimized
    let isMinimized = true;
    chatWidget.style.height = '50px';
    minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';

    // Add minimize/maximize functionality
    minimizeBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        chatWidget.style.height = isMinimized ? '50px' : '500px';
        minimizeBtn.innerHTML = isMinimized ? '<i class="fas fa-plus"></i>' : '<i class="fas fa-minus"></i>';
        
        // Show welcome message when opening for the first time
        if (!isMinimized && chatMessages.children.length === 0) {
            setTimeout(() => {
                typeMessage(`🎯 **EXCLUSIVE OFFER: FREE Google Ads + Website Audit!** 🎯

Hi! I'm Marlon's AI assistant, and I'm excited to offer you something special today.

**Get a comprehensive audit worth $200 absolutely FREE!** I'll analyze:
✅ Your Google Ads account structure & performance
✅ Keyword targeting effectiveness  
✅ Landing page optimization opportunities
✅ Competitor analysis insights
✅ Actionable recommendations to boost ROI

**No strings attached** - just pure value to help your business grow.

Ready to unlock your campaign's potential? Just ask me anything about Google Ads, digital marketing, or let's schedule your free audit! What's on your mind?`, 'bot');
            }, 500);
        }
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
        displayMessage("Session paused due to inactivity. Click to continue chatting!", "bot");
        chatInput.disabled = false;
        sendBtn.disabled = false;
        // Reset idle timer when user interacts again
        chatInput.addEventListener('focus', resetIdleTimer, { once: true });
    }

    /**
     * Resets the idle timer.
     */
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(endChatSession, 15 * 60 * 1000); // 15 minutes
    }

    /**
     * Fetches FAQ knowledge base to be used as context for the chatbot.
     */
    async function loadPortfolioData() {
        try {
            const response = await fetch('faq.file');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            portfolioContext = data;
            console.log('FAQ knowledge base loaded successfully.');
        } catch (error) {
            console.error('Error loading FAQ knowledge base:', error);
            // Use fallback context for local development
            portfolioContext = `# Marlon Palomares Portfolio - FAQ Knowledge Base

## Personal Information
**Name:** Marlon Palomares  
**Title:** Google Ads Specialist  
**Email:** Mpalomaresdigital@gmail.com  
**Website:** https://mpalomaresdigitalsolutions.github.io/MPDIGITAL/

## Professional Summary
A results-driven Google Ads specialist with hands-on campaign management experience, trained by Ian Baillo, the Philippines' top Google Ads expert. Currently managing a $10,000 monthly search campaign for a nonprofit through VolunteerMatch. Over 4 years of experience with US-based clients.

## Service Packages
- Launchpad: $150/month (small businesses, $200-500 ad budget)
- Growth: $300/month (growing businesses, $500-1,500 ad budget)  
- Total Control: $500+/month (established businesses, $1,500+ ad budget)

## Key Achievements
- Managing $10,000/month Google Ads campaign for nonprofit
- Trained by Ian Baillo (Philippines' top Google Ads expert)
- Google Ads certified with advanced optimization training
- 4+ years experience with US-based clients`;
            console.log('Using fallback FAQ context for local development');
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
     * Types out a message with a typing effect.
     * @param {string} message - The message content.
     * @param {('user'|'bot')} sender - The sender of the message.
     */
    function typeMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        chatMessages.appendChild(messageDiv);
        
        let index = 0;
        const typingSpeed = 20; // milliseconds per character
        
        function typeNextCharacter() {
            if (index < message.length) {
                const char = message[index];
                if (char === '\n') {
                    messageDiv.innerHTML += '<br>';
                } else if (char === '*' && message[index + 1] === '*') {
                    // Handle bold formatting
                    const endIndex = message.indexOf('**', index + 2);
                    if (endIndex !== -1) {
                        const boldText = message.substring(index + 2, endIndex);
                        messageDiv.innerHTML += `<strong>${boldText}</strong>`;
                        index = endIndex + 1;
                    } else {
                        messageDiv.innerHTML += '*';
                    }
                } else if (char === '*' && message[index + 1] !== '*') {
                    // Handle italic formatting
                    const endIndex = message.indexOf('*', index + 1);
                    if (endIndex !== -1) {
                        const italicText = message.substring(index + 1, endIndex);
                        messageDiv.innerHTML += `<em>${italicText}</em>`;
                        index = endIndex;
                    } else {
                        messageDiv.innerHTML += '*';
                    }
                } else {
                    messageDiv.innerHTML += char;
                }
                index++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(typeNextCharacter, typingSpeed);
            }
        }
        
        typeNextCharacter();
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
     * Checks if a question is related to Marlon's portfolio services or relevant business topics.
     * @param {string} message - The user's message.
     * @returns {boolean} True if related to portfolio/business, false otherwise.
     */
    function isQuestionPortfolioRelated(message) {
        const portfolioKeywords = [
            'google ads', 'google', 'ads', 'campaign', 'marketing', 'advertising',
            'price', 'cost', 'package', 'pricing', 'budget', 'money', 'dollar',
            'service', 'services', 'offer', 'offers', 'what do', 'what does',
            'experience', 'background', 'qualified', 'certified', 'certification',
            'marlon', 'he', 'his', 'guy', 'specialist', 'expert',
            'keyword', 'research', 'strategy', 'audit', 'optimization', 'tracking',
            'conversion', 'copywriting', 'setup', 'launch', 'manage',
            'meeting', 'call', 'consultation', 'schedule', 'appointment', 'book',
            'business', 'client', 'results', 'performance', 'roi', 'leads',
            'hello', 'hi', 'hey', 'yo', 'sup', 'help', 'question'
        ];
        
        const messageLower = message.toLowerCase();
        return portfolioKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Gets a streaming response from the DeepSeek API and updates the UI in real-time.
     * @param {string} userMessage - The user's message.
     * @param {HTMLElement} botMessageElement - The UI element for the bot's message.
     * @returns {Promise<string>} The full bot response for saving.
     */
    async function getBotResponse(userMessage, botMessageElement) {
        const systemPrompt = `You are Marlon Palomares, a friendly and knowledgeable Google Ads specialist. You have access to a comprehensive FAQ knowledge base containing detailed information about my portfolio, services, experience, and capabilities. Use this knowledge base to provide accurate, helpful, and engaging responses to all user inquiries.

FAQ Knowledge Base:
${portfolioContext}

When responding to questions:
- Always base your answers on the FAQ knowledge base above
- Maintain a warm, friendly, and conversational tone - like talking to a helpful friend who happens to be a Google Ads expert
- Use emojis occasionally to add personality and warmth (but don't overdo it)
- Provide detailed, accurate information about services, pricing, experience, and achievements
- Reference specific facts, metrics, and details from the knowledge base
- Be genuinely helpful and thorough in your explanations
- If information isn't available in the knowledge base, acknowledge this honestly and offer to help find the answer
- Use examples and specific details from the FAQ when relevant
- Always look for opportunities to provide value and build trust
- End responses with engaging questions or clear next steps when appropriate
- Make the user feel heard and valued`;

        if (!portfolioContext) {
            botMessageElement.textContent = "Hold up...";
            // Use basic portfolio info if context isn't loaded yet
            const basicInfo = systemPrompt;
            return basicInfo;
        }
        
        let fullResponse = '';
        
        // Check hosting environment
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // Use mock responses for local development AND GitHub Pages since Netlify functions won't work there
        if (isLocalDevelopment || isGitHubPages) {
            // Enhanced friendly mock responses that use actual portfolio data
            await new Promise(resolve => setTimeout(resolve, 800)); // Quick response for better UX
            
            const messageLower = userMessage.toLowerCase();
            let response = '';
            
            // Parse portfolio data for personalized responses
            let portfolioData;
            try {
                portfolioData = JSON.parse(portfolioContext);
            } catch (e) {
                portfolioData = null;
            }
            
            // Check if message is portfolio-related before responding
            const isPortfolioRelated = isQuestionPortfolioRelated(messageLower);
            
            if (!isPortfolioRelated) {
                response = "Hey there! 👋 I'm here to help with anything related to Google Ads, digital marketing, or Marlon's services. I specialize in Google Ads strategy, campaign optimization, and helping businesses like yours grow. What's on your mind today?";
            } else if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('package')) {
                const packages = portfolioData?.services?.packages || [
                    { name: "Launchpad", price: 150, budget: "$200-500", includes: "search campaign, keyword research, ad creatives" },
                    { name: "Growth", price: 300, budget: "$500-1500", includes: "extra campaigns, weekly optimization" },
                    { name: "Total Control", price: 500, budget: "$1500+", includes: "daily monitoring, all features" }
                ];
                
                response = `I'd love to share Marlon's transparent pricing! 💰

**🚀 Launchpad Package** - $${packages[0]?.price || 150}/month
Perfect for businesses with ${packages[0]?.budget || "$200-500"} ad budgets. Includes ${packages[0]?.includes || "search campaign setup, keyword research, and compelling ad creatives"}.

**📈 Growth Package** - $${packages[1]?.price || 300}/month  
Ideal for growing businesses spending ${packages[1]?.budget || "$500-1500"}. Features ${packages[1]?.includes || "additional campaign types and weekly optimization"}.

**🎯 Total Control Package** - $${packages[2]?.price || 500}+/month
For established businesses with ${packages[2]?.budget || "$1500+"} budgets. ${packages[2]?.includes || "Daily monitoring and comprehensive campaign management"}.

✨ **No hidden fees, ever!** What budget range are you working with? I'd be happy to recommend the best fit for your goals!`;
            } else if (messageLower.includes('service') || messageLower.includes('offer') || messageLower.includes('do')) {
                const services = portfolioData?.services?.specialties || [
                    "Google Ads audits", "Strategy development", "Campaign optimization", 
                    "Copywriting for ads", "Keyword research", "Conversion tracking setup"
                ];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const currentCampaign = portfolioData?.experience?.current || "$10k/month nonprofit campaign";
                
                response = `Great question! Marlon is your dedicated Google Ads specialist 🎯

**His expertise includes:**
${services.map(service => `• ${service}`).join('\n')}

**Real-world experience:** Currently managing ${currentCampaign} and learned directly from ${training.split("'s")[0]} - recognized as the Philippines' top Google Ads expert.

This isn't just theory - Marlon applies proven strategies that deliver real results for businesses just like yours. What specific challenge are you facing with your ads? I'd love to help!`;
            } else if (messageLower.includes('experience') || messageLower.includes('background') || messageLower.includes('qualified')) {
                const yearsUS = portfolioData?.experience?.yearsUS || "4 years";
                const certifications = portfolioData?.certifications || ["Google Ads Search", "Google Ads Display", "Google Ads Video", "Google Ads Shopping"];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const currentWork = portfolioData?.experience?.current || "managing $10k/month Google Ads campaign";
                
                response = `Absolutely! Here's Marlon's impressive track record 📊

**Experience Highlights:**
• ${yearsUS} of hands-on experience with US-based clients
• Google certified in ${certifications.length} key areas: ${certifications.join(', ')}
• Advanced training from ${training} - the Philippines' leading Google Ads authority
• Currently: ${currentWork}

**What this means for you:** You're working with someone who's been in the trenches, managing real campaigns with real budgets and delivering measurable results.

Ready to see how this expertise can transform your business? Let's discuss your specific goals!`;
            } else if (messageLower.includes('certification') || messageLower.includes('certified')) {
                const certs = portfolioData?.certifications || ["Google Ads Search", "Google Ads Display", "Google Ads Video", "Google Ads Shopping"];
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                const year = portfolioData?.experience?.certYear || "2024";
                
                response = `Marlon's credentials are rock-solid! 🏆

**Google Certifications:**
• ${certs.join('\n• ')}

**Advanced Training:**
• Certified ${year} with continuous updates
• Completed intensive training with ${training} - the Philippines' top Google Ads expert

These aren't just certificates - they represent proven expertise in managing successful campaigns across different industries and budgets. When you work with Marlon, you're getting Google-approved strategies that actually work.

Want to discuss how these skills can benefit your specific business?`;
            } else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
                const currentWork = portfolioData?.experience?.current || "managing a $10k/month Google Ads campaign";
                const training = portfolioData?.experience?.training || "Ian Baillo's Pass Academy";
                
                response = `Hello! 👋 Welcome! I'm Marlon's AI assistant, and I'm thrilled you're here!

Marlon is currently ${currentWork} and brings expertise from training with ${training.split("'s")[0]} - the Philippines' leading Google Ads authority.

**I'm here to help you with:**
• Understanding Google Ads strategies
• Pricing and service packages
• Campaign optimization tips
• Scheduling your FREE audit
• Any questions about growing your business with Google Ads

What brings you here today? Whether you're struggling with your current campaigns or just exploring options, I'm here to help!`;
            } else {
                // Default response strictly based on portfolio data
                const packages = portfolioData?.services?.packages || [
                    { name: "Launchpad", price: 150 }
                ];
                const services = portfolioData?.services?.specialties || ["Google Ads management"];
                const currentWork = portfolioData?.experience?.current || "Google Ads campaigns";
                
                response = `I'd be happy to help! Here's what I can tell you:

**Marlon specializes in:** ${services.join(', ')}

**Pricing starts at:** $${packages[0]?.price || 150}/month

**Current work:** ${currentWork}

**Next steps:** The best way to see how this can work for your specific business is through a free strategy call. No sales pressure - just honest advice about your Google Ads opportunities.

What specific challenge or goal would you like to discuss? I'm here to help!`;
            }
            
            // Simulate typing with more natural pauses
            botMessageElement.textContent = '';
            const words = response.split(' ');
            let currentText = '';
            
            async function typeWords() {
                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 80));
                    currentText += (i === 0 ? '' : ' ') + words[i];
                    botMessageElement.textContent = currentText;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
            
            await typeWords();
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
            // Always re-enable input controls, even if there's an error
            setTimeout(() => {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }, 100); // Small delay to ensure UI updates
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
        const welcomeMessage = "Hello! I am Marlon's chatbot. How can I help you today?";
        displayMessage(welcomeMessage, 'bot');
    }, 800);
    
    // Ensure chat controls are enabled on initialization
    chatInput.disabled = false;
    sendBtn.disabled = false;
    
    console.log('Chatbot initialized and ready for interaction');
});
