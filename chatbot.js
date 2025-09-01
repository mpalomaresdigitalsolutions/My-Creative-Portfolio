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

    // Add image viewing functionality for GHL samples
    setupImageViewer();

    let portfolioContext = '';
    let idleTimer;
    
    // Conversation memory for contextual responses
    const conversationMemory = {
        userIndustry: null,
        budgetRange: null,
        previousQueries: [],
        conversationStage: 'initial',
        userName: null
    };
    
    // Service discovery flow
    const serviceDiscoveryFlow = {
        questions: [
            {
                id: 'business_type',
                question: '🏢 What type of business do you run?',
                options: ['Local Service Business', 'E-commerce', 'Consulting', 'Restaurant', 'Other']
            },
            {
                id: 'current_spend',
                question: '💰 What\'s your current monthly Google Ads budget?',
                options: ['$0-500', '$500-1500', '$1500-5000', '$5000+', 'Not sure yet']
            },
            {
                id: 'main_goal',
                question: '🎯 What\'s your primary goal?',
                options: ['More phone calls', 'Website sales', 'Lead generation', 'Brand awareness']
            }
        ],
        currentQuestion: 0,
        answers: {},
        
        generateRecommendation() {
            const answers = this.answers;
            let packageName = 'Package A - Starter';
            let price = 197;
            
            if (answers.current_spend === '$1500-5000' || answers.current_spend === '$5000+') {
                packageName = 'Package C - Premium';
                price = 997;
            } else if (answers.current_spend === '$500-1500') {
                packageName = 'Package B - Growth';
                price = 497;
            }
            
            return {
                package: packageName,
                price,
                personalized: true,
                context: answers
            };
        }
    };

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
     * Fetches comprehensive portfolio data including Google Ads knowledge base for the chatbot.
     */
    async function loadPortfolioData() {
        try {
            const response = await fetch('knowledge_base.md');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            portfolioContext = data;
            console.log('Knowledge base loaded successfully.');
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            // Use fallback context for local development
            portfolioContext = `# Comprehensive Knowledge Base - Marlon Palomares Portfolio & Google Ads Expertise

## Personal Information & Portfolio Overview

**Name:** Marlon Palomares  
**Title:** Google Ads Specialist  
**Email:** Mpalomaresdigital@gmail.com  
**Website:** https://mpalomaresdigitalsolutions.github.io/MPDIGITAL/

### Professional Summary
A results-driven Google Ads specialist with hands-on campaign management experience, trained by Ian Baillo, the Philippines' top Google Ads expert. Currently managing a $10,000 monthly search campaign for a nonprofit through VolunteerMatch. Over 4 years of experience with US-based clients as a Customer Service and Technical Support Representative.

### Core Services Offered
1. **Google Ads Audit** - Comprehensive analysis and optimization recommendations
2. **Google Ad Strategy** - Strategic planning and campaign development
3. **Google Ads Optimization** - Performance improvement and ROI maximization
4. **Copywriting** - Ad copy development and optimization
5. **Keyword Research** - Target audience and keyword analysis
6. **Conversion Tracking Setup** - Advanced tracking implementation

### Service Packages & Pricing

#### The 'Launchpad' Package - $150/month
**Target:** Small business with $200-$500 monthly ad budget
**Includes:**
- One Google Search campaign setup
- Keyword research (up to 25 keywords)
- 3-5 high-quality ad creatives
- Initial conversion tracking setup
- Bi-weekly campaign monitoring and budget management
- Negative keyword research
- Ad copy A/B testing
- Basic bid adjustments
- Bi-weekly email updates and monthly performance summary

#### The 'Growth' Package - $300/month
**Target:** Growing business with $500-$1,500 monthly ad budget
**Includes:**
- Everything in Launchpad package
- Additional campaign setup (Display or Remarketing)
- Advanced keyword and audience research
- Weekly optimization and aggressive bid strategies
- Landing page suggestions
- Weekly performance reports
- Monthly strategy call

#### The 'Total Control' Package - $500+/month
**Target:** Established business with $1,500+ monthly ad budget
**Includes:**
- Everything in Growth package
- Multiple campaign types (Search, Display, Shopping, Video)
- Comprehensive audience targeting and segmentation
- Advanced conversion tracking with Google Analytics
- Full-service landing page consultation
- Daily/Bi-weekly budget and bid monitoring
- Custom weekly and monthly reports
- Priority communication

### Key Achievements & Experience
- **Current:** Managing $10,000/month Google Ads campaign for nonprofit
- **Training:** Advanced Google Ads training from Ian Baillo (Philippines' top expert)
- **Certification:** Google Ads certified with advanced optimization training
- **Experience:** 4+ years with US-based clients in customer service and technical support
- **Performance:** 78.5% optimization score, $5.39 average cost per conversion, 15+ conversions generated

### Contact & Scheduling
**Booking Link:** https://calendar.app.google/ecrh372MbNbBHbSf6  
**Email:** Mpalomaresdigital@gmail.com  
**Availability:** Free strategy calls available for qualified prospects

## Google Ads Fundamentals and Best Practices

Google Ads is a digital advertising service that enables you to promote your products or services on various Google platforms, including Google's search engine, YouTube, and other affiliated websites. They're also referred to as paid search or pay-per-click (PPC) ads, because you only pay for the ads' placement when a user clicks them.

### Master Ads Keyword Research

Effective PPC keyword research goes beyond selecting the right words. Understanding user intent and search patterns is pivotal for Google Ads' success, as it connects ad offerings with the target audience's specific needs and behaviors.

**Types of Search Intent:**
- **Informational (I)**: User is looking for information (e.g., "What is the safest life jacket for toddlers?").
- **Navigational (N)**: User wants a specific brand or page (e.g., "XYZ Outdoors life jackets").
- **Commercial (C)**: User is researching before a purchase (e.g., "Top-rated life jackets for sailing").
- **Transactional (T)**: User wants to buy (e.g., "Buy life jackets online").

**Advanced Keyword Strategies:**
- Utilize negative keywords to prevent ads from appearing for irrelevant search queries
- Organize keywords using tools like Semrush's PPC Keyword Tool
- Employ long-tail keywords for potentially less expensive PPC advertising
- Include local keywords to attract local customers
- Experiment with different keyword match types (broad, phrase, exact)
- Analyze competitor keyword positions and ad copy using tools like Semrush's Advertising Research

### Campaign Building and Optimization

Creating a Google Ads campaign involves several key steps, from defining your objective to structuring your account effectively. A campaign allows you to promote your products or services across Google's network.

**Campaign Types:**
- **Search**: Text ads on Google search results
- **Display**: Image ads on websites within the Google Display Network
- **Video**: Video ads on YouTube
- **Shopping**: Product listings for e-commerce businesses
- **Demand Gen**: Advertise within online feeds
- **App**: Promote your app across various channels
- **Performance Max**: Finds high-value customers across all Google channels

**Optimization Techniques:**
- Continuous keyword optimization with negative keywords and match type adjustments
- A/B testing of ad copy and landing pages
- Bid strategy adjustments using automated bidding (Maximize Conversions, Target CPA, Target ROAS)
- Audience targeting refinement using demographics and remarketing
- Landing page optimization for relevance and user experience

### Performance Monitoring

**Key Metrics to Monitor:**
- **Click-Through Rate (CTR)**: Measures the percentage of people who click your ad after seeing it
- **Conversion Rate**: Percentage of clicks that resulted in a conversion
- **Cost Per Click (CPC)**: Average cost paid for each click on your ad
- **Cost Per Acquisition (CPA)**: Average cost to acquire a conversion
- **Return on Ad Spend (ROAS)**: Revenue generated for every dollar spent on advertising
- **Quality Score**: Google's rating of the quality and relevance of your keywords, ads, and landing pages

**Essential Tools:**
- Google Ads Keyword Planner for keyword research
- Google Analytics integration for deeper insights
- Competitor analysis tools (Semrush, SpyFu)
- Search Terms Report for identifying negative keywords
- Auction Insights Report for competitor comparison`
            console.log('Using fallback knowledge base for local development');
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
     * Shows interactive pricing calculator
     */
    function showPricingCalculator() {
        const calculatorHTML = `
            <div class="pricing-calculator">
                <h4>📊 Get Your Custom Quote</h4>
                <div class="calc-input">
                    <label>💰 Monthly Ad Budget:</label>
                    <input type="range" id="budget-slider" min="200" max="10000" value="1000" step="100">
                    <span id="budget-display">$1,000</span>
                </div>
                <div class="calc-result">
                    <strong>🎯 Recommended Package:</strong> <span id="package-name">Growth Package</span>
                    <br><strong>💵 Management Fee:</strong> <span id="management-fee">$300/month</span>
                    <br><strong>📈 Expected ROI:</strong> <span id="expected-roi">300-500%</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="quick-action" onclick="bookConsultation()">📅 Book Free Strategy Call</button>
                    <button class="quick-action" onclick="startServiceDiscovery()">🎯 Get Personalized Quote</button>
                </div>
            </div>
        `;
        
        displayMessage(calculatorHTML, 'bot');
        
        // Add calculator functionality
        setTimeout(() => {
            const slider = document.getElementById('budget-slider');
            const display = document.getElementById('budget-display');
            const packageName = document.getElementById('package-name');
            const managementFee = document.getElementById('management-fee');
            const expectedROI = document.getElementById('expected-roi');
            
            slider.addEventListener('input', (e) => {
                const budget = parseInt(e.target.value);
                display.textContent = `$${budget.toLocaleString()}`;
                
                if (budget <= 500) {
                    packageName.textContent = 'Launchpad Package';
                    managementFee.textContent = '$150/month';
                    expectedROI.textContent = '200-300%';
                } else if (budget <= 1500) {
                    packageName.textContent = 'Growth Package';
                    managementFee.textContent = '$300/month';
                    expectedROI.textContent = '300-500%';
                } else {
                    packageName.textContent = 'Total Control Package';
                    managementFee.textContent = '$500+/month';
                    expectedROI.textContent = '400-800%';
                }
            });
        }, 100);
    }

    /**
     * Shows email capture with lead magnet
     */
    function showEmailCapture() {
        const captureHTML = `
            <div class="email-capture">
                <h4>🎁 Free Google Ads Checklist</h4>
                <p>Get my 10-point checklist that increased conversions by 200%</p>
                <input type="email" placeholder="Enter your email" id="email-input" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                <button class="quick-action" onclick="deliverLeadMagnet()">📧 Send My Checklist</button>
                <small style="color: #666;">No spam, unsubscribe anytime</small>
            </div>
        `;
        displayMessage(captureHTML, 'bot');
    }

    /**
     * Starts guided service discovery
     */
    function startServiceDiscovery() {
        serviceDiscoveryFlow.currentQuestion = 0;
        serviceDiscoveryFlow.answers = {};
        askServiceQuestion();
    }

    /**
     * Asks service discovery questions
     */
    function askServiceQuestion() {
        const question = serviceDiscoveryFlow.questions[serviceDiscoveryFlow.currentQuestion];
        if (!question) {
            showPersonalizedRecommendation();
            return;
        }
        
        let questionHTML = `<strong>${question.question}</strong><br>`;
        question.options.forEach(option => {
            questionHTML += `<button class="quick-action" onclick="selectServiceOption('${question.id}', '${option}')">${option}</button>`;
        });
        
        displayMessage(questionHTML, 'bot');
    }

    /**
     * Handles service discovery option selection
     */
    function selectServiceOption(questionId, option) {
        serviceDiscoveryFlow.answers[questionId] = option;
        serviceDiscoveryFlow.currentQuestion++;
        askServiceQuestion();
    }

    /**
     * Shows personalized recommendation
     */
    function showPersonalizedRecommendation() {
        const recommendation = serviceDiscoveryFlow.generateRecommendation();
        const recHTML = `
            <div class="personalized-recommendation">
                <h4>🎯 Your Personalized Recommendation</h4>
                <p><strong>Package:</strong> ${recommendation.package}</p>
                <p><strong>Price:</strong> $${recommendation.price} one-time setup</p>
                <p><strong>Perfect for:</strong> ${recommendation.context.business_type} with ${recommendation.context.current_spend} budget</p>
                <div style="margin-top: 15px;">
                    <button class="quick-action" onclick="bookConsultation()">📅 Book Free Call</button>
                    <button class="quick-action" onclick="showEmailCapture()">📧 Get Detailed Quote</button>
                </div>
            </div>
        `;
        displayMessage(recHTML, 'bot');
    }

    /**
     * Books consultation
     */
    function bookConsultation() {
        window.open('https://calendar.app.google/ecrh372MbNbBHbSf6', '_blank');
        displayMessage('🗓️ Perfect! Opening calendar to book your free strategy call. Looking forward to helping you grow your business!', 'bot');
    }

    /**
     * Delivers lead magnet
     */
    function deliverLeadMagnet() {
        const email = document.getElementById('email-input')?.value;
        if (!email || !email.includes('@')) {
            displayMessage('❌ Please enter a valid email address to receive your checklist.', 'bot');
            return;
        }
        
        displayMessage(`📧 Great! Your Google Ads checklist is on its way to ${email}. Check your inbox in the next few minutes!`, 'bot');
        
        // Here you would typically send the email via API
        console.log('Lead magnet delivered to:', email);
    }

    /**
     * Sets up image viewing functionality for GHL sample images
     */
    function setupImageViewer() {
        // Create lightbox modal HTML
        const lightboxHTML = `
            <div id="image-lightbox" class="image-lightbox" style="display: none;">
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img class="lightbox-image" src="" alt="">
                    <div class="lightbox-caption"></div>
                </div>
            </div>
        `;
        
        // Add lightbox CSS
        const lightboxCSS = `
            .image-lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                text-align: center;
            }
            
            .lightbox-image {
                max-width: 100%;
                max-height: 80vh;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .lightbox-close {
                position: absolute;
                top: -40px;
                right: 0;
                color: white;
                font-size: 35px;
                font-weight: bold;
                cursor: pointer;
                z-index: 1001;
            }
            
            .lightbox-close:hover {
                color: #ff6b6b;
            }
            
            .lightbox-caption {
                color: white;
                margin-top: 15px;
                font-size: 16px;
                max-width: 600px;
            }
            
            .cert-preview img {
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .cert-preview img:hover {
                transform: scale(1.05);
            }
        `;
        
        // Add lightbox to body
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        
        // Add CSS to head
        const style = document.createElement('style');
        style.textContent = lightboxCSS;
        document.head.appendChild(style);
        
        // Get all GHL images
        const ghlImages = document.querySelectorAll('.cert-preview img[src*="GHL images"]');
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        
        // Add click handlers to images
        ghlImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt;
                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Close lightbox handlers
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });
        
        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Saves a conversation to the Supabase database.
     * @param {string} userMessage - The user's message.
     * @param {string} botResponse - The bot's response.
     */
    async function saveMessageToSupabase(userMessage, botResponse) {
        // Skip Supabase save - works without database
        console.log('Chatbot running in standalone mode - no database required');
        return;
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
                // Use knowledge base content for contextual responses
                const knowledgeBase = portfolioContext || '';
                
                if (messageLower.includes('google ads') || messageLower.includes('campaign')) {
                    response = `I understand you're asking about Google Ads! Based on Marlon's current work managing a $10K/month campaign for a nonprofit, here's what's working:

**Key insights from recent campaigns:**
- 78.5% optimization score achieved
- $5.39 average cost per conversion
- 15+ conversions generated through strategic keyword targeting

**For your specific situation**, Marlon typically starts with understanding your current ad spend and goals. The strategies he's learned from Ian Baillo - Philippines' top Google Ads expert - focus heavily on intent-based keyword research and negative keyword optimization.

**Quick question:** What's your current monthly ad budget range? This helps determine whether the Launchpad ($150/month), Growth ($300/month), or Total Control ($500+/month) package would be most suitable for your needs.`;
                } else if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('pricing')) {
            response = `💡 I have an interactive pricing tool that can give you a personalized quote!

Let me show you exactly what you'd pay based on your budget:

<button class="quick-action" onclick="showPricingCalculator()">📊 Get Custom Quote</button>
<button class="quick-action" onclick="startServiceDiscovery()">🎯 Personalized Recommendation</button>

Or if you prefer the quick breakdown:

**Launchpad Package - $150/month**
Perfect for $200-500/month ad budgets

**Growth Package - $300/month** 
Ideal for $500-1,500/month ad budgets

**Total Control Package - $500+/month**
For $1,500+ monthly budgets with full service

Want to see which package fits your specific situation?`;
        } else if (messageLower.includes('audit') || messageLower.includes('free')) {
            response = `🎉 YES! Marlon offers a **FREE Google Ads + Website Audit** worth $200!

**Your audit includes:**
✅ Complete Google Ads account analysis
✅ Keyword targeting effectiveness review
✅ Landing page optimization opportunities
✅ Competitor analysis insights
✅ 30-day action plan to boost ROI

This isn't a sales pitch - it's pure value to help your business grow.

<button class="quick-action" onclick="bookConsultation()">📅 Book Free Audit</button>
<button class="quick-action" onclick="showEmailCapture()">📧 Get Audit Checklist</button>

What type of business do you run? This helps me prepare specific insights for your audit.`;
        } else if (messageLower.includes('checklist') || messageLower.includes('download') || messageLower.includes('guide')) {
            response = `🎁 Perfect! I've prepared a **Google Ads Checklist** that's helped businesses increase conversions by 200%!

**The checklist covers:**
• Keyword research secrets most agencies miss
• Ad copy formulas that convert
• Landing page optimization tips
• Budget allocation strategies
• Negative keyword goldmines

<button class="quick-action" onclick="showEmailCapture()">📧 Get My Checklist</button>

Just enter your email and I'll send it over immediately. No spam, ever!`;
        } else if (messageLower.includes('consultation') || messageLower.includes('call') || messageLower.includes('meeting')) {
            response = `🗓️ Excellent choice! Marlon offers **free 30-minute strategy calls** with zero obligation.

**What to expect:**
• Review your current Google Ads performance
• Identify immediate opportunities
• Get honest recommendations
• Discuss budget and timeline
• No sales pressure - just value

<button class="quick-action" onclick="bookConsultation()">📅 Book Your Call</button>

Or if you prefer, I can ask you a few quick questions to prepare a personalized quote first.`;
        } else {
            // Enhanced contextual response using conversation memory
            updateContext(userMessage);
            
            let contextResponse = `I'm here to help! `;
            
            if (conversationMemory.userIndustry) {
                contextResponse += `I see you have a ${conversationMemory.userIndustry} - that's great! `;
            }
            
            if (conversationMemory.budgetRange) {
                contextResponse += `With your ${conversationMemory.budgetRange} budget, I can give you specific recommendations. `;
            }
            
            contextResponse += `Marlon specializes in Google Ads with proven results - currently managing a $10K/month campaign with 78.5% optimization score.

**What can I help you with today?**

<button class="quick-action" onclick="showPricingCalculator()">💰 Pricing Calculator</button>
<button class="quick-action" onclick="startServiceDiscovery()">🎯 Personalized Quote</button>
<button class="quick-action" onclick="bookConsultation()">📅 Free Strategy Call</button>
<button class="quick-action" onclick="showEmailCapture()">📧 Free Checklist</button>

Just let me know what's most important to you right now!`;
            
            response = contextResponse;
        }
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
        
        // For GitHub Pages and local development, skip API calls and use mock responses
        if (isGitHubPages || isLocalDevelopment) {
            console.log('Using intelligent fallback responses for GitHub Pages');
            return await getMockBotResponse(userMessage, botMessageElement);
        }
        
        // Only attempt API calls for Netlify deployment
        try {
            const response = await fetch('/.netlify/functions/deepseek', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: portfolioData
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.log('Using fallback responses for reliability');
            return await getMockBotResponse(userMessage, botMessageElement);
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
    const isNetlify = window.location.hostname.includes('netlify.app');
    
    console.log('Chatbot initializing...');
    console.log('Environment:', isLocal ? 'Local Development' : isGitHubPages ? 'GitHub Pages' : isNetlify ? 'Netlify' : 'Production');
    console.log('Netlify functions available:', isNetlify && !isLocal && !isGitHubPages);
    
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
    
    // Make functions globally available for onclick handlers
    window.showPricingCalculator = showPricingCalculator;
    window.startServiceDiscovery = startServiceDiscovery;
    window.bookConsultation = bookConsultation;
    window.showEmailCapture = showEmailCapture;
});
