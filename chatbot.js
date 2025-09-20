document.addEventListener('DOMContentLoaded', async () => {
    // Initialize chat widget
    const chatWidget = document.querySelector('.chatbot-window');
    const minimizeBtn = document.querySelector('.chatbot-toggle');
    const closeBtn = document.querySelector('.chatbot-close');
    const chatInput = document.querySelector('#chatbot-input');
    const sendBtn = document.querySelector('#chatbot-send');
    const chatMessages = document.querySelector('#chatbot-messages');

    // Start with chat widget minimized
    let isMinimized = true;
    chatWidget.style.display = 'none';

    // Add toggle functionality
    minimizeBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        chatWidget.style.display = isMinimized ? 'none' : 'flex';
        minimizeBtn.style.display = isMinimized ? 'block' : 'none';
        
        // Show welcome message when opening for the first time
        if (!isMinimized && chatMessages.children.length <= 1) {
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

**Service Packages Available:**
🚀 Starter: $197/month (6 hours dedicated work)
📈 Growth: $397/month (9 hours dedicated work)  
💎 Premium: $697/month (11 hours dedicated work)

Ready to unlock your campaign's potential? Just ask me anything about Google Ads, digital marketing, or let's schedule your free audit! What's on your mind?`, 'bot');
            }, 500);
        }
    });

    // Add close functionality
    closeBtn.addEventListener('click', () => {
        isMinimized = true;
        chatWidget.style.display = 'none';
        minimizeBtn.style.display = 'block';
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

    // Initialize portfolio context
    let portfolioContext = '';
    
    // Conversation memory for context
    let conversationMemory = {
        userIndustry: '',
        budgetRange: '',
        goals: '',
        timeline: ''
    };

    // Service discovery flow
    const serviceDiscoveryFlow = {
        questions: [
            "What type of business do you run? (e.g., e-commerce, local service, SaaS, etc.)",
            "What's your current monthly ad budget range?",
            "What are your main goals? (leads, sales, brand awareness)",
            "What's your timeline to see results?"
        ],
        currentQuestion: 0,
        answers: {}
    };

    // Load portfolio data on startup
    loadPortfolioData();

    // Idle timer for session management
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
     * Updates conversation memory with user context.
     */
    function updateContext(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detect business type
        if (lowerMessage.includes('ecommerce') || lowerMessage.includes('shop') || lowerMessage.includes('store')) {
            conversationMemory.userIndustry = 'e-commerce business';
        } else if (lowerMessage.includes('local') || lowerMessage.includes('service')) {
            conversationMemory.userIndustry = 'local service business';
        } else if (lowerMessage.includes('saas') || lowerMessage.includes('software')) {
            conversationMemory.userIndustry = 'SaaS business';
        }

        // Detect budget range
        if (lowerMessage.includes('$200') || lowerMessage.includes('200')) {
            conversationMemory.budgetRange = '$200-500 budget';
        } else if (lowerMessage.includes('$500') || lowerMessage.includes('500')) {
            conversationMemory.budgetRange = '$500-1500 budget';
        } else if (lowerMessage.includes('$1000') || lowerMessage.includes('1000')) {
            conversationMemory.budgetRange = '$1000+ budget';
        }

        // Detect goals
        if (lowerMessage.includes('lead') || lowerMessage.includes('customer')) {
            conversationMemory.goals = 'generating leads';
        } else if (lowerMessage.includes('sale') || lowerMessage.includes('revenue')) {
            conversationMemory.goals = 'increasing sales';
        } else if (lowerMessage.includes('brand') || lowerMessage.includes('awareness')) {
            conversationMemory.goals = 'building brand awareness';
        }
    }

    /**
     * Fetches comprehensive portfolio data including Google Ads knowledge base for the chatbot.
     */
    async function loadPortfolioData() {
        try {
            // Check if we're running locally (file:// protocol)
            const isLocal = window.location.protocol === 'file:';
            if (isLocal) {
                console.warn('Local file protocol detected. Using fallback knowledge base.');
            }
            
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
            portfolioContext = `# Comprehensive Knowledge Base - Marlon Palomares Portfolio & Google Ads Expertise (Updated 2025)

## Personal Information & Portfolio Overview

**Name:** Marlon Palomares  
**Title:** Google Ads Specialist  
**Email:** marlonpalomares@protonmail.com  
**Website:** https://mpalomaresdigitalsolutions.github.io/MPDIGITAL/

### Professional Summary
Google Ads specialist with 6 months focused experience managing live campaigns. Google Ads certified with advanced training in local lead generation. Strong customer service background (4+ years) supporting high-volume client communications. Passionate about helping businesses get leads through Google Ads and committed to continuous learning and optimization.

### Core Services Offered
1. **Google Ads Audit** - Comprehensive analysis and optimization recommendations
2. **Google Ad Strategy** - Strategic planning and campaign development  
3. **Google Ads Optimization** - Performance improvement and ROI maximization
4. **Copywriting** - Ad copy development and optimization
5. **Keyword Research** - Target audience and keyword analysis
6. **Conversion Tracking Setup** - Advanced tracking implementation

### Service Packages & Pricing (Updated 2025)

#### Package A – Starter – $197/month
**Target:** Perfect for beginners and initial testing
**Total Hours:** 6 hours monthly dedicated work
**Includes:**
- Complete Google Ads account audit and setup
- Strategic keyword research with 10 targeted keywords
- 3 high-converting ad variations optimized for clicks
- Basic landing page conversion review
- Full conversion tracking implementation
- First week monitoring with 30-minute strategy call
- Perfect for businesses starting with Google Ads

#### Package B – Growth – $397/month  
**Target:** For advertisers ready to grow campaigns with ongoing optimization
**Total Hours:** 9 hours monthly dedicated work
**Includes everything in Starter, plus:**
- Advanced keyword research (20 keywords)
- 5 additional ad variations + A/B testing
- Competitor analysis
- Conversion tracking fine-tuning
- 2 weeks optimization + weekly reports
- Basic lead nurturing setup with GoHighLevel
- Ongoing campaign optimization and performance monitoring

#### Package C – Premium – $697/month
**Target:** Full campaign management with insights and enhanced targeting
**Total Hours:** 11 hours monthly dedicated work
**Includes everything in Growth, plus:**
- Audience targeting setup
- Remarketing campaign creation
- Google Analytics integration
- Custom reporting
- 1-month campaign management + daily performance checks
- Monthly strategy call
- Comprehensive campaign management with daily monitoring
- Advanced reporting and strategic insights

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
- Auction Insights Report for competitor comparison`;
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
        
        const discoveryHTML = `
            <div class="service-discovery">
                <h4>🎯 Let's Find Your Perfect Package</h4>
                <p>I'll ask you a few questions to provide a personalized recommendation.</p>
                <div id="discovery-content">
                    <p><strong>Question 1:</strong> ${serviceDiscoveryFlow.questions[0]}</p>
                    <input type="text" id="discovery-input" placeholder="Type your answer..." style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                    <button class="quick-action" onclick="processDiscoveryAnswer()">Next →</button>
                </div>
            </div>
        `;
        displayMessage(discoveryHTML, 'bot');
    }

    /**
     * Processes service discovery answers
     */
    window.processDiscoveryAnswer = function() {
        const input = document.getElementById('discovery-input');
        const answer = input.value.trim();
        if (!answer) return;

        serviceDiscoveryFlow.answers[serviceDiscoveryFlow.currentQuestion] = answer;
        serviceDiscoveryFlow.currentQuestion++;

        if (serviceDiscoveryFlow.currentQuestion < serviceDiscoveryFlow.questions.length) {
            const discoveryContent = document.getElementById('discovery-content');
            discoveryContent.innerHTML = `
                <p><strong>Question ${serviceDiscoveryFlow.currentQuestion + 1}:</strong> ${serviceDiscoveryFlow.questions[serviceDiscoveryFlow.currentQuestion]}</p>
                <input type="text" id="discovery-input" placeholder="Type your answer..." style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                <button class="quick-action" onclick="processDiscoveryAnswer()">Next →</button>
            `;
            document.getElementById('discovery-input').focus();
        } else {
            // Generate personalized recommendation
            const businessType = serviceDiscoveryFlow.answers[0];
            const budget = serviceDiscoveryFlow.answers[1];
            const goals = serviceDiscoveryFlow.answers[2];
            const timeline = serviceDiscoveryFlow.answers[3];

            let recommendation = `🎯 **Your Personalized Recommendation**\n\n`;
            
            if (budget.includes('200') || budget.includes('500')) {
                recommendation += `**Recommended: Launchpad Package ($150/month)**\nPerfect for your ${budget} budget and ${goals} goals.\n\n`;
            } else if (budget.includes('500') || budget.includes('1000')) {
                recommendation += `**Recommended: Growth Package ($300/month)**\nIdeal for your ${budget} budget and ${goals} goals.\n\n`;
            } else {
                recommendation += `**Recommended: Total Control Package ($500+/month)**\nBest for your ${budget} budget and ${goals} goals.\n\n`;
            }

            recommendation += `**Next Steps:**\n📅 Book a free strategy call to discuss your specific needs\n💰 Get a detailed quote with timeline: ${timeline}\n\n<button class="quick-action" onclick="bookConsultation()">📅 Book Free Call</button>`;

            displayMessage(recommendation, 'bot');
        }
    };

    /**
     * Books consultation via Calendly
     */
    window.bookConsultation = function() {
        displayMessage("🗓️ **Opening booking page...**\n\nYou'll be redirected to Calendly to schedule your free 30-minute strategy call with Marlon.", 'bot');
        setTimeout(() => {
            window.open('https://calendar.app.google/ecrh372MbNbBHbSf6', '_blank');
        }, 1500);
    };

    /**
     * Delivers lead magnet
     */
    window.deliverLeadMagnet = function() {
        const emailInput = document.getElementById('email-input');
        const email = emailInput ? emailInput.value : '';
        if (!email || !email.includes('@')) {
            displayMessage("❌ Please enter a valid email address to receive your checklist.", 'bot');
            return;
        }
        
        displayMessage(`✅ **Checklist sent!**\n\nYour Google Ads checklist has been sent to ${email}. Check your inbox (and spam folder just in case)!\n\n**Bonus:** You'll also receive exclusive tips and case studies to help grow your campaigns.`, 'bot');
    };

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
            const botResponse = await getBotResponse(userMessage, botMessageElement);
            // Save to analytics (if available)
            try {
                if (window.gtag) {
                    window.gtag('event', 'chat_message', {
                        'event_category': 'engagement',
                        'event_label': userMessage.substring(0, 50)
                    });
                }
            } catch (e) {
                console.log('Analytics not available');
            }
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

    /**
     * Gets the bot's response based on user input.
     * @param {string} userMessage - The user's message.
     * @param {HTMLElement} botMessageElement - The bot's message element for streaming.
     * @returns {Promise<string>} The bot's response.
     */
    async function getBotResponse(userMessage, botMessageElement) {
        const messageLower = userMessage.toLowerCase();
        let response = '';

        // Enhanced contextual responses
        if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('package') || messageLower.includes('pricing')) {
            response = `💰 **Google Ads Management Packages**

**Launchpad Package - $150/month**
Perfect for $200-500/month ad budgets

**Growth Package - $300/month** 
Ideal for $500-1,500/month ad budgets

**Total Control Package - $500+/month**
For $1,500+ monthly budgets with full service

**Interactive Pricing Calculator:**
<button class="quick-action" onclick="showPricingCalculator()">💰 Get Custom Quote</button>

Want to see which package fits your specific situation?`;
        } else if (messageLower.includes('audit') || messageLower.includes('free') || messageLower.includes('analysis')) {
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
        } else if (messageLower.includes('checklist') || messageLower.includes('download') || messageLower.includes('guide') || messageLower.includes('pdf')) {
            response = `🎁 Perfect! I've prepared a **Google Ads Checklist** that's helped businesses increase conversions by 200%!

**The checklist covers:**
• Keyword research secrets most agencies miss
• Ad copy formulas that convert
• Landing page optimization tips
• Budget allocation strategies
• Negative keyword goldmines

<button class="quick-action" onclick="showEmailCapture()">📧 Get My Checklist</button>

Just enter your email and I'll send it over immediately. No spam, ever!`;
        } else if (messageLower.includes('consultation') || messageLower.includes('call') || messageLower.includes('meeting') || messageLower.includes('schedule')) {
            response = `🗓️ Excellent choice! Marlon offers **free 30-minute strategy calls** with zero obligation.

**What to expect:**
• Review your current Google Ads performance
• Identify immediate opportunities
• Get honest recommendations
• Discuss budget and timeline
• No sales pressure - just value

<button class="quick-action" onclick="bookConsultation()">📅 Book Your Call</button>

Or if you prefer, I can ask you a few quick questions to prepare a personalized quote first.`;
        } else if (messageLower.includes('experience') || messageLower.includes('results') || messageLower.includes('track record')) {
            response = `🏆 **Marlon's Proven Track Record**

**Current Campaign Results:**
• Managing $10,000/month Google Ads campaign
• 78.5% optimization score (industry-leading)
• $5.39 average cost per conversion
• 18+ conversions generated monthly
• Training from Ian Baillo (Philippines' top Google Ads expert)

**Experience:**
• 4+ years with US-based clients
• Google Ads certified with advanced optimization training
• Specializes in nonprofit and small business campaigns
• Expert in conversion tracking and landing page optimization

Want to see how these results could apply to your business?`;
        } else if (messageLower.includes('certification') || messageLower.includes('qualified') || messageLower.includes('expert')) {
            response = `✅ **Marlon's Qualifications**

**Certifications:**
• Google Ads Certified (Search, Display, Video, Shopping)
• Advanced Google Ads Optimization Training
• Conversion Tracking Specialist Certification
• Landing Page Optimization Certified

**Training:**
• Trained by Ian Baillo - Philippines' #1 Google Ads expert
• Continuous education on latest Google Ads features
• Advanced bid strategy and automation training

**Specializations:**
• Small to medium business campaigns
• Nonprofit Google Ad Grants management
• E-commerce and local service businesses
• Advanced conversion tracking setup

Ready to leverage this expertise for your campaigns?`;
        } else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
            response = `👋 Hello! Welcome to Marlon's Google Ads assistant.

I'm here to help you with:
💰 **Pricing packages** - Find the perfect fit for your budget
🎁 **Free audit** - Get a $200 Google Ads audit absolutely free
📅 **Strategy calls** - Book free 30-minute consultations
📧 **Resources** - Download exclusive checklists and guides

**What brings you here today?** Are you looking to:
1. Start new Google Ads campaigns
2. Improve existing campaign performance
3. Get a professional audit
4. Learn about pricing and packages

Just let me know what's most important to you!`;
        } else {
            // Enhanced contextual response using conversation memory
            updateContext(userMessage);
            
            let contextResponse = `I'm here to help! `;
            
            if (conversationMemory.userIndustry) {
                contextResponse += `I see you have a ${conversationMemory.userIndustry} - that's great! `;
            }
            
            if (conversationMemory.budgetRange) {
                contextResponse += `With your ${conversationMemory.budgetRange}, I can give you specific recommendations. `;
            }
            
            contextResponse += `Marlon specializes in Google Ads with proven results - currently managing a $10K/month campaign with 78.5% optimization score.

**What can I help you with today?**

<button class="quick-action" onclick="showPricingCalculator()">💰 Pricing Calculator</button>
<button class="quick-action" onclick="startServiceDiscovery()">🎯 Personalized Quote</button>
<button class="quick-action" onclick="bookConsultation()">📅 Free Strategy Call</button>
<button class="quick-action" onclick="showEmailCapture()">📧 Free Checklist</button>

Just let me know what's most important to you!`;
            
            response = contextResponse;
        }

        // Simulate typing with more natural pauses
        botMessageElement.textContent = '';
        const words = response.split(' ');
        let currentText = '';
        
        async function typeWords() {
            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 80));
                currentText += (i === 0 ? '' : ' ') + words[i];
                botMessageElement.innerHTML = currentText.replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        
        await typeWords();
        return response;
    }

    // --- Initialization ---
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isNetlify = window.location.hostname.includes('netlify.app');
    
    console.log('Chatbot initializing...');
    console.log('Environment:', isLocal ? 'Local Development' : isGitHubPages ? 'GitHub Pages' : isNetlify ? 'Netlify' : 'Production');
    
    loadPortfolioData();
    
    
    // Ensure chat controls are enabled on initialization
    chatInput.disabled = false;
    sendBtn.disabled = false;
    
    console.log('Chatbot initialized and ready for interaction');
    
    // Reset idle timer on any interaction
    chatInput.addEventListener('input', resetIdleTimer);
    chatInput.addEventListener('keypress', resetIdleTimer);
    
    // Make functions globally available for onclick handlers
    window.showPricingCalculator = showPricingCalculator;
    window.startServiceDiscovery = startServiceDiscovery;
    window.bookConsultation = bookConsultation;
    window.showEmailCapture = showEmailCapture;
    window.processDiscoveryAnswer = processDiscoveryAnswer;
    window.deliverLeadMagnet = deliverLeadMagnet;
});
