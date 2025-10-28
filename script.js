// App State
const state = {
    currentUser: null,
    chats: JSON.parse(localStorage.getItem('nova-ai-chats')) || [],
    currentChatId: null,
    isGenerating: false,
    isListening: false,
    darkMode: localStorage.getItem('nova-ai-dark-mode') === 'true',
    currentMode: 'chat'
};

// DOM Elements
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const themeToggle = document.getElementById('themeToggle');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const stopBtn = document.getElementById('stopBtn');
const modelSelector = document.getElementById('modelSelector');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const modeButtons = document.querySelectorAll('.mode-btn');

// Initialize App
function initApp() {
    // Check if user is logged in (simulated)
    const savedUser = localStorage.getItem('nova-ai-user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showAuth();
    }

    // Apply dark mode if enabled
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }

    // Load chats if any
    renderChatHistory();
    
    // If there are chats, load the first one
    if (state.chats.length > 0) {
        loadChat(state.chats[0].id);
    } else {
        createNewChat();
    }

    // Set up event listeners
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Auth tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));

    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Chat actions
    newChatBtn.addEventListener('click', createNewChat);
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Voice input
    voiceBtn.addEventListener('click', toggleVoiceInput);

    // Stop generation
    stopBtn.addEventListener('click', stopGeneration);

    // Model selector
    modelSelector.addEventListener('change', updateModel);

    // Mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', autoResizeTextarea);

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            e.target !== mobileMenuBtn) {
            sidebar.classList.remove('open');
        }
    });
}

// Auth Functions
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login - in a real app, this would be an API call
    state.currentUser = {
        name: 'Demo User',
        email: email,
        initials: 'DU'
    };
    
    localStorage.setItem('nova-ai-user', JSON.stringify(state.currentUser));
    showApp();
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Simulate signup - in a real app, this would be an API call
    state.currentUser = {
        name: name,
        email: email,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    
    localStorage.setItem('nova-ai-user', JSON.stringify(state.currentUser));
    showApp();
}

function showAuth() {
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showApp() {
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    // Update user info in sidebar
    document.getElementById('userName').textContent = state.currentUser.name;
    document.getElementById('userEmail').textContent = state.currentUser.email;
    document.getElementById('userAvatar').textContent = state.currentUser.initials;
}

// Theme Functions
function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    localStorage.setItem('nova-ai-dark-mode', state.darkMode);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    icon.className = state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.querySelector('span').textContent = state.darkMode ? 'Light Mode' : 'Dark Mode';
}

// Chat Functions
function createNewChat() {
    const chatId = 'chat-' + Date.now();
    const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        model: modelSelector.value
    };
    
    state.chats.unshift(newChat);
    state.currentChatId = chatId;
    
    saveChats();
    renderChatHistory();
    renderChatMessages();
    
    // Focus on input
    chatInput.focus();
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function loadChat(chatId) {
    state.currentChatId = chatId;
    const chat = state.chats.find(c => c.id === chatId);
    
    if (chat) {
        modelSelector.value = chat.model;
        renderChatMessages();
        
        // Update active chat in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    }
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function deleteChat(chatId) {
    state.chats = state.chats.filter(chat => chat.id !== chatId);
    
    if (state.currentChatId === chatId) {
        if (state.chats.length > 0) {
            loadChat(state.chats[0].id);
        } else {
            createNewChat();
        }
    }
    
    saveChats();
    renderChatHistory();
}

function duplicateChat(chatId) {
    const originalChat = state.chats.find(chat => chat.id === chatId);
    if (originalChat) {
        const newChat = {
            ...originalChat,
            id: 'chat-' + Date.now(),
            title: originalChat.title + ' (Copy)',
            createdAt: new Date().toISOString()
        };
        
        state.chats.unshift(newChat);
        state.currentChatId = newChat.id;
        
        saveChats();
        renderChatHistory();
        renderChatMessages();
    }
}

function renameChat(chatId, newTitle) {
    const chat = state.chats.find(chat => chat.id === chatId);
    if (chat && newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        saveChats();
        renderChatHistory();
    }
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || state.isGenerating) return;

    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    autoResizeTextarea();
    
    // Show stop button
    stopBtn.classList.remove('hidden');
    state.isGenerating = true;
    
    // Simulate AI response with typing animation
    setTimeout(() => {
        simulateAIResponse(message);
    }, 500);
}

function addMessage(role, content) {
    const chat = state.chats.find(chat => chat.id === state.currentChatId);
    if (chat) {
        const message = {
            id: 'msg-' + Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        chat.messages.push(message);
        
        // Update chat title if it's the first user message
        if (role === 'user' && chat.messages.length === 1) {
            chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            renderChatHistory();
        }
        
        saveChats();
        renderChatMessages();
    }
}

function simulateAIResponse(userMessage) {
    const chat = state.chats.find(chat => chat.id === state.currentChatId);
    if (!chat) return;

    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-msg';
    typingIndicator.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Generate response based on mode and model
    let response = '';
    const model = modelSelector.value;
    
    if (state.currentMode === 'code') {
        response = generateCodeResponse(userMessage, model);
    } else if (state.currentMode === 'image') {
        response = generateImageResponse(userMessage, model);
    } else {
        response = generateChatResponse(userMessage, model);
    }

    // Simulate typing effect
    let i = 0;
    const typingSpeed = 20; // ms per character
    
    function typeCharacter() {
        if (i < response.length && state.isGenerating) {
            // Remove typing indicator
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Add character to message
            if (i === 0) {
                addMessage('assistant', response.charAt(i));
            } else {
                const lastMessage = chat.messages[chat.messages.length - 1];
                if (lastMessage.role === 'assistant') {
                    lastMessage.content += response.charAt(i);
                    saveChats();
                    renderChatMessages();
                }
            }
            
            i++;
            setTimeout(typeCharacter, typingSpeed);
        } else {
            // Finished typing
            state.isGenerating = false;
            stopBtn.classList.add('hidden');
            
            // Ensure typing indicator is removed
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
        }
    }
    
    typeCharacter();
}

function generateChatResponse(message, model) {
    const responses = {
        'gpt-5': [
            `I understand you're asking about "${message}". As GPT-5, I can provide you with a comprehensive analysis based on the latest information available. This topic involves several key aspects that we should consider carefully.`,

            `That's an interesting question about "${message}"! Based on my training data and current understanding, I can tell you that this subject has evolved significantly in recent years. The main points to consider are...`,

            `I'd be happy to help with "${message}". Let me break down the key points for you:\n\n1. First, it's important to understand the context\n2. Then we can explore the main concepts\n3. Finally, we can discuss practical applications\n\nWould you like me to elaborate on any of these aspects?`
        ],
        'claude-3.5': [
            `Thank you for your question about "${message}". From my perspective as Claude 3.5, I approach this by considering multiple angles and ensuring a balanced, thoughtful response. The core of this matter seems to be...`,

            `I appreciate you bringing up "${message}". My analysis suggests that we should examine this through several lenses: the historical context, current implications, and potential future developments. Each of these provides valuable insights.`,

            `That's a thoughtful inquiry about "${message}". Let me provide you with a nuanced perspective on this matter. Based on my understanding, there are several key factors to consider, and the situation may vary depending on specific circumstances.`
        ]
    };
    
    const modelResponses = responses[model] || responses['gpt-5'];
    return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

function generateCodeResponse(message, model) {
    const language = message.toLowerCase().includes('python') ? 'python' :
                    message.toLowerCase().includes('java') ? 'java' :
                    message.toLowerCase().includes('html') || message.toLowerCase().includes('css') ? 'html' : 'javascript';

    const codeExamples = {
        'javascript': `function ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}() {\n  // Implementation for: ${message}\n  const result = "Solution implemented";\n  console.log(result);\n  return result;\n}\n\n// Usage example:\n// const output = ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}();\n// console.log(output);`,
        
        'python': `def ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}():\n    """Implementation for: ${message}"""\n    result = "Solution implemented"\n    print(result)\n    return result\n\n# Usage example:\n# output = ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}()\n# print(output)`,
        
        'java': `public class Solution {\n    public static String ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}() {\n        // Implementation for: ${message}\n        String result = "Solution implemented";\n        System.out.println(result);\n        return result;\n    }\n    \n    public static void main(String[] args) {\n        // Usage example:\n        // String output = ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}();\n        // System.out.println(output);\n    }\n}`,
        
        'html': `<!DOCTYPE html>\n<html>\n<head>\n    <title>Solution for: ${message}</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n            background-color: #f5f5f5;\n        }\n        .container {\n            background: white;\n            padding: 20px;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Solution Implementation</h1>\n        <p>This addresses: ${message}</p>\n    </div>\n</body>\n</html>`
    };

    return `Here's a ${language} solution for "${message}":\n\n\`\`\`${language}\n${codeExamples[language]}\n\`\`\`\n\nThis implementation provides a foundation for your needs. You can customize it further based on your specific requirements.`;
}

function generateImageResponse(message, model) {
    return `I've generated an image concept based on your description: "${message}".\n\n![Generated Image](https://picsum.photos/400/300?random=${Date.now()})\n\n**Image Description:** This visual representation captures the essence of "${message}" with appropriate styling and composition.\n\nWould you like me to:\n- Generate another variation\n- Adjust any specific elements\n- Provide a more detailed description\n- Create a different style?`;
}

function stopGeneration() {
    state.isGenerating = false;
    stopBtn.classList.add('hidden');
}

function switchMode(mode) {
    state.currentMode = mode;
    
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Update placeholder based on mode
    const placeholders = {
        chat: 'Message Nova AI...',
        code: 'Describe the code you want to generate...',
        image: 'Describe the image you want to create...'
    };
    
    chatInput.placeholder = placeholders[mode] || 'Message Nova AI...';
}

// Voice Input Functions
function toggleVoiceInput() {
    if (!state.isListening) {
        startVoiceInput();
    } else {
        stopVoiceInput();
    }
}

function startVoiceInput() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Please try Chrome or Edge.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        state.isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        autoResizeTextarea();
    };
    
    recognition.onend = () => {
        stopVoiceInput();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopVoiceInput();
        alert('Speech recognition failed. Please try again.');
    };
    
    recognition.start();
}

function stopVoiceInput() {
    state.isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
}

// UI Helper Functions
function renderChatHistory() {
    chatHistory.innerHTML = '';
    
    if (state.chats.length === 0) {
        chatHistory.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No chats yet</p>
                <p class="text-sm">Start a new conversation to begin</p>
            </div>
        `;
        return;
    }
    
    state.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === state.currentChatId ? 'active' : ''}`;
        chatItem.dataset.chatId = chat.id;
        
        chatItem.innerHTML = `
            <div class="chat-title">${chat.title}</div>
            <div class="chat-actions">
                <button class="chat-action-btn rename-chat" title="Rename">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="chat-action-btn duplicate-chat" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="chat-action-btn delete-chat" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
     
