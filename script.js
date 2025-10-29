document.addEventListener('DOMContentLoaded', function() {
    console.log('Nova AI starting...');
    
    // Get elements
    const authScreen = document.getElementById('authScreen');
    const appScreen = document.getElementById('appScreen');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const newChatBtn = document.getElementById('newChatBtn');
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const themeToggle = document.getElementById('themeToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    
    // Initialize with welcome message
    showWelcomeMessage();
    
    // Auth tabs
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });
    
    signupTab.addEventListener('click', function() {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    // Login form
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login clicked');
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        showWelcomeMessage();
    });
    
    // Signup form  
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Signup clicked');
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        showWelcomeMessage();
    });
    
    // Google auth
    googleAuthBtn.addEventListener('click', function() {
        console.log('Google auth clicked');
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        showWelcomeMessage();
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // New chat
    newChatBtn.addEventListener('click', function() {
        showWelcomeMessage();
    });
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    });
    
    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const mode = this.dataset.mode;
            const placeholders = {
                chat: 'Message Nova AI...',
                code: 'Describe the code you want to generate...',
                image: 'Describe the image you want to create...'
            };
            
            chatInput.placeholder = placeholders[mode] || 'Message Nova AI...';
        });
    });
    
    // Show welcome message
    function showWelcomeMessage() {
        const welcomeHTML = `
            <div class="welcome-container">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h1 class="welcome-title">Welcome to Nova AI</h1>
                <p class="welcome-subtitle">Your intelligent assistant for chat, code, and creative tasks. Experience the power of AI with a beautiful, intuitive interface.</p>
                <div class="feature-cards">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div class="feature-title">Smart Chat</div>
                        <div class="feature-desc">Have natural conversations with advanced AI</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="feature-title">Code Generation</div>
                        <div class="feature-desc">Generate code in multiple languages</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-image"></i>
                        </div>
                        <div class="feature-title">Image Creation</div>
                        <div class="feature-desc">Create stunning images from text descriptions</div>
                    </div>
                </div>
            </div>
        `;
        chatMessages.innerHTML = welcomeHTML;
    }
    
    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate AI response after delay
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(message);
            addMessage('assistant', response);
        }, 1500);
    }
    
    // Add message to chat
    function addMessage(role, content) {
        // Remove welcome message if it exists
        if (document.querySelector('.welcome-container')) {
            chatMessages.innerHTML = '';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${role === 'user' ? 'U' : 'AI'}</div>
            <div class="message-content">
                <div>${content.replace(/\n/g, '<br>')}</div>
                <div class="message-actions">
                    <button class="action-btn copy-btn">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `;
        
        // Add copy functionality
        const copyBtn = messageDiv.querySelector('.copy-btn');
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(content);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-msg';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Generate AI response
    function generateAIResponse(userMessage) {
        const responses = [
            `I understand you're asking about "${userMessage}". That's an interesting topic! How can I help you with this?`,
            `Thanks for your question about "${userMessage}". Let me help you with that. Based on my knowledge, here's what I can tell you...`,
            `I'd be happy to discuss "${userMessage}" with you. Here's what I think about it based on the information available to me.`,
            `That's a great question about "${userMessage}"! Here's my perspective on this topic and how it might be helpful to you.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    console.log('Nova AI ready!');
});
