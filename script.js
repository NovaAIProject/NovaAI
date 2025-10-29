// App State
const state = {
    currentUser: null,
    chats: JSON.parse(localStorage.getItem('nova-ai-chats')) || [],
    currentChatId: null,
    isGenerating: false,
    isListening: false,
    darkMode: localStorage.getItem('nova-ai-dark-mode') === 'true',
    currentMode: 'chat',
    recognition: null
};

// DOM Elements
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
const sidebarOverlay = document.getElementById('sidebarOverlay');
const modeButtons = document.querySelectorAll('.mode-btn');
const googleAuthBtn = document.getElementById('googleAuthBtn');
const voiceBtn = document.getElementById('voiceBtn');
const stopBtn = document.getElementById('stopBtn');
const modelSelector = document.getElementById('modelSelector');
const chatHistory = document.getElementById('chatHistory');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

// Initialize App
function initApp() {
    console.log('Nova AI starting...');
    
    // Check for saved user
    const savedUser = localStorage.getItem('nova-ai-user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showAuth();
    }

    // Apply saved theme
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }

    // Load chats
    renderChatHistory();
    
    // Load first chat or create new one
    if (state.chats.length > 0) {
        loadChat(state.chats[0].id);
    } else {
        showWelcomeMessage();
    }

    // Set up event listeners
    setupEventListeners();
    
    console.log('Nova AI ready!');
}

// Event Listeners
function setupEventListeners() {
    // Auth tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));

    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    googleAuthBtn.addEventListener('click', handleGoogleAuth);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Chat actions
    newChatBtn.addEventListener('click', createNewChat);
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', handleChatInput);
    stopBtn.addEventListener('click', stopGeneration);

    // Voice input
    voiceBtn.addEventListener('click', toggleVoiceInput);

    // Mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    sidebarOverlay.addEventListener('click', closeMobileMenu);

    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Model selector
    modelSelector.addEventListener('change', updateModel);

    // Auto-resize textarea
    chatInput.addEventListener('input', autoResizeTextarea);
}

// Auth Functions
function switchAuthTab(tab) {
    loginTab.classList.toggle('active', tab === 'login');
    signupTab.classList.toggle('active', tab === 'signup');
    loginForm.classList.toggle('hidden', tab !== 'login');
    signupForm.classList.toggle('hidden', tab !== 'signup');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate login
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
    
    // Simple validation
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate signup
    state.currentUser = {
        name: name,
        email: email,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    
    localStorage.setItem('nova-ai-user', JSON.stringify(state.currentUser));
    showApp();
}

function handleGoogleAuth() {
    // Simulate Google auth
    state.currentUser = {
        name: 'Google User',
        email: 'user@gmail.com',
        initials: 'GU'
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
    
    // Update user info
    userName.textContent = state.currentUser.name;
    userEmail.textContent = state.currentUser.email;
    userAvatar.textContent = state.currentUser.initials;
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
    const text = themeToggle.querySelector('span');
    if (state.darkMode) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
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
    showWelcomeMessage();
    
    // Close mobile sidebar
    closeMobileMenu();
}

function loadChat(chatId) {
    state.currentChatId = chatId;
    const chat = state.chats.find(c => c.id === chatId);
    
    if (chat) {
        modelSelector.value = chat.model;
        renderChatMessages(chat);
        
        // Update active chat in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    }
    
    closeMobileMenu();
}

function deleteChat(chatId, e) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
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
}

function duplicateChat(chatId, e) {
    e.stopPropagation();
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
        renderChatMessages(newChat);
    }
}

function renameChat(chatId, e) {
    e.stopPropagation();
    const chat = state.chats.find(chat => chat.id === chatId);
    if (chat) {
        const newTitle = prompt('Enter new chat title:', chat.title);
        if (newTitle && newTitle.trim()) {
            chat.title = newTitle.trim();
            saveChats();
            renderChatHistory();
        }
    }
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || state.isGenerating) return;

    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    autoResizeTextarea();
    
    // Show stop button and set generating state
    stopBtn.classList.remove('hidden');
    state.isGenerating = true;
    
    // Simulate AI response
    setTimeout(() => {
        simulateAIResponse(message);
    }, 500);
}

function handleChatInput(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    autoResizeTextarea();
}

function addMessage(role, content) {
    const chat = state.chats.find(chat => chat.id === state.currentChatId);
    if (!chat) return;

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
    renderChatMessages(chat);
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
    const typingSpeed = 20;
    
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
                    renderChatMessages(chat);
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
        'javascript': `function ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}() {\n  // Implementation for: ${message}\n  const result = "Solution implemented";\n  console.log(result);\n  return result;\n}`,
        
        'python': `def ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}():\n    """Implementation for: ${message}"""\n    result = "Solution implemented"\n    print(result)\n    return result`,
        
        'java': `public class Solution {\n    public static String ${message.replace(/\?/g, '').replace(/\s+/g, '_').toLowerCase()}() {\n        // Implementation for: ${message}\n        String result = "Solution implemented";\n        System.out.println(result);\n        return result;\n    }\n}`,
        
        'html': `<!DOCTYPE html>\n<html>\n<head>\n    <title>Solution for: ${message}</title>\n</head>\n<body>\n    <h1>Solution Implementation</h1>\n    <p>This addresses: ${message}</p>\n</body>\n</html>`
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
    state.recognition = new SpeechRecognition();
    
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';
    
    state.recognition.onstart = () => {
        state.isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
    };
    
    state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        autoResizeTextarea();
    };
    
    state.recognition.onend = () => {
        stopVoiceInput();
    };
    
    state.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopVoiceInput();
        alert('Speech recognition failed. Please try again.');
    };
    
    state.recognition.start();
}

function stopVoiceInput() {
    if (state.recognition) {
        state.recognition.stop();
    }
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
        
        // Chat item click
        chatItem.addEventListener('click', () => loadChat(chat.id));
        
        // Chat actions
        co
