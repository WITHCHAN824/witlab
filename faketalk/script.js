/**
 * FakeTalk Maker - Main Application Script
 * A serverless, client-side chat screenshot generator
 */

// ============================================
// Application State
// ============================================
const AppState = {
    chatData: [],
    settings: {
        time: '9:41',
        battery: 100,
        network: 'LTE',
        theme: 'blue',
        fontSize: 'medium',
        contactName: 'John',
        profileImage: null,
        inputBarText: 'Type a message',
        appStyle: 'kakaotalk'
    },
    isRecording: false
};

// Theme configurations
const themes = {
    blue: {
        bg: '#b2c7d9',
        headerBg: 'rgba(255,255,255,0.9)',
        headerText: '#1a1a1a'
    },
    dark: {
        bg: '#1a1a2e',
        headerBg: '#16213e',
        headerText: '#ffffff'
    },
    pink: {
        bg: '#f8e1e7',
        headerBg: 'rgba(255,255,255,0.9)',
        headerText: '#1a1a1a'
    },
    green: {
        bg: '#c8e6c9',
        headerBg: 'rgba(255,255,255,0.9)',
        headerText: '#1a1a1a'
    }
};

// App Style Configurations
const appStyles = {
    kakaotalk: {
        name: 'KakaoTalk',
        bg: '#b2c7d9',
        headerBg: 'rgba(255,255,255,0.9)',
        headerText: '#1a1a1a',
        inputBg: '#ffffff',
        inputPlaceholder: 'Type a message',
        myBubbleBg: 'linear-gradient(135deg, #ffeb33 0%, #ffd700 100%)',
        myBubbleText: '#1a1a1a',
        otherBubbleBg: '#ffffff',
        otherBubbleText: '#1a1a1a',
        sendBtnColor: '#ffeb33',
        showStatus: false,
        statusBarLight: true
    },
    whatsapp: {
        name: 'WhatsApp',
        bg: '#e5ddd5',
        headerBg: '#075e54',
        headerText: '#ffffff',
        inputBg: '#ffffff',
        inputPlaceholder: 'Type a message',
        myBubbleBg: '#dcf8c6',
        myBubbleText: '#1a1a1a',
        otherBubbleBg: '#ffffff',
        otherBubbleText: '#1a1a1a',
        sendBtnColor: '#075e54',
        showStatus: true,
        statusBarLight: false
    },
    imessage: {
        name: 'iMessage',
        bg: '#ffffff',
        headerBg: '#f6f6f6',
        headerText: '#1a1a1a',
        inputBg: '#ffffff',
        inputPlaceholder: 'iMessage',
        myBubbleBg: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
        myBubbleText: '#ffffff',
        otherBubbleBg: '#e9e9eb',
        otherBubbleText: '#1a1a1a',
        sendBtnColor: '#007AFF',
        showStatus: false,
        statusBarLight: true
    }
};

const fontSizes = {
    small: '12px',
    medium: '14px',
    large: '16px'
};

// ============================================
// Utility Functions
// ============================================
function generateId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// DOM References
// ============================================
const DOM = {
    // Settings
    statusTime: document.getElementById('statusTime'),
    statusBattery: document.getElementById('statusBattery'),
    statusNetwork: document.getElementById('statusNetwork'),
    chatTheme: document.getElementById('chatTheme'),
    chatFontSize: document.getElementById('chatFontSize'),
    contactName: document.getElementById('contactName'),
    profileImage: document.getElementById('profileImage'),
    profilePreview: document.getElementById('profilePreview'),
    inputBarTextInput: document.getElementById('inputBarTextInput'),
    appStyleInputs: document.querySelectorAll('input[name="appStyle"]'),
    
    // Preview
    phoneScreen: document.getElementById('phoneScreen'),
    statusBar: document.getElementById('statusBar'),
    previewTime: document.getElementById('previewTime'),
    previewBattery: document.getElementById('previewBattery'),
    previewNetwork: document.getElementById('previewNetwork'),
    batteryFill: document.getElementById('batteryFill'),
    chatHeader: document.getElementById('chatHeader'),
    headerName: document.getElementById('headerName'),
    headerStatus: document.getElementById('headerStatus'),
    headerProfile: document.getElementById('headerProfile'),
    headerActions: document.getElementById('headerActions'),
    chatMessages: document.getElementById('chatMessages'),
    chatInputBar: document.getElementById('chatInputBar'),
    inputBarText: document.getElementById('inputBarText'),
    sendBtn: document.getElementById('sendBtn'),
    
    // Editor
    messageList: document.getElementById('messageList'),
    messageCount: document.getElementById('messageCount'),
    addMessageBtn: document.getElementById('addMessageBtn'),
    
    // Export
    exportImageBtn: document.getElementById('exportImageBtn'),
    exportVideoBtn: document.getElementById('exportVideoBtn'),
    recordingStatus: document.getElementById('recordingStatus')
};

// ============================================
// Settings Management
// ============================================
function initSettings() {
    // Status Time
    DOM.statusTime.addEventListener('input', (e) => {
        AppState.settings.time = e.target.value;
        updatePreview();
    });
    
    // Battery
    DOM.statusBattery.addEventListener('input', (e) => {
        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
        e.target.value = value;
        AppState.settings.battery = value;
        updatePreview();
    });
    
    // Network
    DOM.statusNetwork.addEventListener('change', (e) => {
        AppState.settings.network = e.target.value;
        updatePreview();
    });
    
    // Theme
    DOM.chatTheme.addEventListener('change', (e) => {
        AppState.settings.theme = e.target.value;
        updatePreview();
    });
    
    // Font Size
    DOM.chatFontSize.addEventListener('change', (e) => {
        AppState.settings.fontSize = e.target.value;
        updatePreview();
    });
    
    // Contact Name
    DOM.contactName.addEventListener('input', (e) => {
        AppState.settings.contactName = e.target.value || 'Contact';
        updatePreview();
    });
    
    // Profile Image
    DOM.profileImage.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await fileToBase64(file);
            AppState.settings.profileImage = base64;
            updateProfilePreview();
            updatePreview();
        }
    });
    
    // Input Bar Text
    DOM.inputBarTextInput.addEventListener('input', (e) => {
        AppState.settings.inputBarText = e.target.value || 'Type a message';
        updatePreview();
    });
    
    // App Style Selection
    DOM.appStyleInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            AppState.settings.appStyle = e.target.value;
            // Update input bar placeholder based on app style
            const style = appStyles[AppState.settings.appStyle];
            DOM.inputBarTextInput.placeholder = style.inputPlaceholder;
            if (!DOM.inputBarTextInput.value || DOM.inputBarTextInput.value === appStyles.kakaotalk.inputPlaceholder || DOM.inputBarTextInput.value === appStyles.whatsapp.inputPlaceholder || DOM.inputBarTextInput.value === appStyles.imessage.inputPlaceholder) {
                DOM.inputBarTextInput.value = style.inputPlaceholder;
                AppState.settings.inputBarText = style.inputPlaceholder;
            }
            updatePreview();
        });
    });
}

function updateProfilePreview() {
    if (AppState.settings.profileImage) {
        DOM.profilePreview.innerHTML = `<img src="${AppState.settings.profileImage}" class="w-full h-full object-cover" alt="Profile">`;
    }
}

// ============================================
// Preview Rendering
// ============================================
function updatePreview() {
    const appStyle = appStyles[AppState.settings.appStyle];
    
    // Update status bar
    DOM.previewTime.textContent = AppState.settings.time;
    DOM.previewBattery.textContent = AppState.settings.battery;
    DOM.previewNetwork.textContent = AppState.settings.network;
    
    // Update battery fill
    const fillWidth = (AppState.settings.battery / 100) * 21;
    DOM.batteryFill.setAttribute('width', fillWidth);
    
    // Apply app style
    applyAppStyle(appStyle);
    
    // Update header
    DOM.headerName.textContent = AppState.settings.contactName;
    if (AppState.settings.profileImage) {
        DOM.headerProfile.innerHTML = `<img src="${AppState.settings.profileImage}" class="w-full h-full object-cover" alt="Profile">`;
    } else {
        // Reset to default profile icon
        DOM.headerProfile.innerHTML = `<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
    }
    
    // Update font size
    const fontSize = fontSizes[AppState.settings.fontSize];
    DOM.chatMessages.style.fontSize = fontSize;
    
    // Update input bar text
    DOM.inputBarText.textContent = AppState.settings.inputBarText;
    
    // Render messages
    renderChatMessages();
}

function applyAppStyle(style) {
    const appStyleName = AppState.settings.appStyle;
    
    // Remove all app style classes
    DOM.phoneScreen.classList.remove('kakaotalk', 'whatsapp', 'imessage');
    DOM.chatMessages.classList.remove('kakaotalk', 'whatsapp', 'imessage');
    
    // Add current app style class
    DOM.phoneScreen.classList.add(appStyleName);
    DOM.chatMessages.classList.add(appStyleName);
    
    // Apply background
    if (appStyleName === 'whatsapp') {
        DOM.phoneScreen.style.background = `#e5ddd5 url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9c4bc' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    } else {
        DOM.phoneScreen.style.background = style.bg;
    }
    
    // Apply header style
    DOM.chatHeader.style.background = style.headerBg;
    DOM.chatHeader.style.color = style.headerText;
    DOM.headerName.style.color = style.headerText;
    
    // Update status bar colors based on header
    if (style.statusBarLight) {
        DOM.statusBar.style.color = '#000000';
    } else {
        DOM.statusBar.style.color = '#ffffff';
    }
    
    // Show/hide online status
    if (style.showStatus) {
        DOM.headerStatus.classList.remove('hidden');
        DOM.headerStatus.textContent = 'online';
        DOM.headerStatus.style.color = appStyleName === 'whatsapp' ? 'rgba(255,255,255,0.8)' : '#666';
    } else {
        DOM.headerStatus.classList.add('hidden');
    }
    
    // Update header icons color
    const headerBtns = DOM.chatHeader.querySelectorAll('button');
    headerBtns.forEach(btn => {
        btn.style.color = style.headerText;
    });
    
    // Update header actions based on app style
    updateHeaderActions(appStyleName);
    
    // Update input bar
    DOM.chatInputBar.style.background = style.inputBg;
    DOM.sendBtn.style.color = style.sendBtnColor;
    
    // Update input bar style based on app
    if (appStyleName === 'whatsapp') {
        DOM.inputBarText.className = 'flex-1 bg-white rounded-full px-4 py-2 text-gray-400 text-sm border border-gray-200';
    } else if (appStyleName === 'imessage') {
        DOM.inputBarText.className = 'flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-400 text-sm';
    } else {
        DOM.inputBarText.className = 'flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-400 text-sm';
    }
}

function updateHeaderActions(appStyleName) {
    if (appStyleName === 'whatsapp') {
        DOM.headerActions.innerHTML = `
            <button style="color: inherit">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
            <button style="color: inherit">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </button>
            <button style="color: inherit">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
        `;
    } else if (appStyleName === 'imessage') {
        DOM.headerActions.innerHTML = `
            <button style="color: #007AFF">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
        `;
    } else {
        DOM.headerActions.innerHTML = `
            <button style="color: inherit">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <button style="color: inherit">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        `;
    }
}

function renderChatMessages(animate = false) {
    DOM.chatMessages.innerHTML = '';
    
    AppState.chatData.forEach((msg, index) => {
        const msgElement = createChatBubble(msg, animate, index);
        DOM.chatMessages.appendChild(msgElement);
    });
    
    // Scroll to bottom
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function createChatBubble(msg, animate = false, index = 0) {
    const wrapper = document.createElement('div');
    const appStyleName = AppState.settings.appStyle;
    const appStyle = appStyles[appStyleName];
    
    wrapper.className = `flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} items-end gap-2`;
    
    if (animate) {
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateY(10px)';
    }
    
    // Date divider
    if (msg.type === 'date_divider') {
        wrapper.className = 'flex justify-center';
        let dateDividerStyle = 'bg-black/10 rounded-full px-3 py-1 text-xs text-gray-600';
        if (appStyleName === 'whatsapp') {
            dateDividerStyle = 'bg-white/80 rounded-lg px-3 py-1 text-xs text-gray-600 shadow-sm';
        } else if (appStyleName === 'imessage') {
            dateDividerStyle = 'text-xs text-gray-500';
        }
        wrapper.innerHTML = `
            <div class="${dateDividerStyle}">
                ${msg.content}
            </div>
        `;
        return wrapper;
    }
    
    // Profile image for other's messages (only for KakaoTalk style)
    if (msg.sender === 'other' && appStyleName === 'kakaotalk') {
        const profileImg = AppState.settings.profileImage 
            ? `<img src="${AppState.settings.profileImage}" class="w-8 h-8 rounded-full object-cover" alt="Profile">`
            : `<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
               </div>`;
        wrapper.innerHTML = `<div class="shrink-0 self-end">${profileImg}</div>`;
    }
    
    // Message bubble
    const bubble = document.createElement('div');
    
    // Apply app-specific bubble styles
    let bubbleClass = 'max-w-[70%] ';
    let textColor = msg.sender === 'me' ? appStyle.myBubbleText : appStyle.otherBubbleText;
    
    if (appStyleName === 'kakaotalk') {
        bubbleClass += msg.sender === 'me' ? 'chat-bubble-me' : 'chat-bubble-other';
    } else if (appStyleName === 'whatsapp') {
        if (msg.sender === 'me') {
            bubbleClass += 'rounded-lg shadow-sm';
            bubble.style.background = '#dcf8c6';
            bubble.style.borderRadius = '8px 8px 0 8px';
        } else {
            bubbleClass += 'rounded-lg shadow-sm';
            bubble.style.background = '#ffffff';
            bubble.style.borderRadius = '8px 8px 8px 0';
        }
    } else if (appStyleName === 'imessage') {
        if (msg.sender === 'me') {
            bubbleClass += 'rounded-2xl';
            bubble.style.background = 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)';
            bubble.style.borderRadius = '18px 18px 4px 18px';
            textColor = '#ffffff';
        } else {
            bubbleClass += 'rounded-2xl';
            bubble.style.background = '#e9e9eb';
            bubble.style.borderRadius = '18px 18px 18px 4px';
        }
    }
    
    bubble.className = bubbleClass;
    
    if (msg.type === 'image' && msg.content) {
        bubble.innerHTML = `
            <img src="${msg.content}" class="chat-image rounded-lg" alt="Chat image">
            <div class="text-[10px] mt-1 text-right px-2 pb-1" style="color: ${msg.sender === 'me' && appStyleName === 'imessage' ? 'rgba(255,255,255,0.7)' : '#666'}">${msg.timestamp}</div>
        `;
    } else {
        const timestampColor = msg.sender === 'me' && appStyleName === 'imessage' ? 'rgba(255,255,255,0.7)' : '#888';
        bubble.innerHTML = `
            <div class="px-3 py-2">
                <p class="break-words" style="color: ${textColor}">${escapeHtml(msg.content) || '&nbsp;'}</p>
                <div class="text-[10px] mt-1 text-right" style="color: ${timestampColor}">
                    ${msg.timestamp}
                </div>
            </div>
        `;
    }
    
    wrapper.appendChild(bubble);
    return wrapper;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Message Editor
// ============================================
function renderMessageList() {
    DOM.messageList.innerHTML = '';
    
    AppState.chatData.forEach((msg, index) => {
        const item = createMessageItem(msg, index);
        DOM.messageList.appendChild(item);
    });
    
    DOM.messageCount.textContent = `${AppState.chatData.length} message${AppState.chatData.length !== 1 ? 's' : ''}`;
    
    // Initialize sortable
    initSortable();
}

function createMessageItem(msg, index) {
    const item = document.createElement('div');
    item.className = 'message-item bg-editor-bg rounded-xl p-3 border border-editor-border';
    item.dataset.id = msg.id;
    
    item.innerHTML = `
        <div class="flex items-start gap-2">
            <!-- Drag Handle -->
            <div class="drag-handle p-1 text-gray-600 hover:text-gray-400 cursor-grab">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                </svg>
            </div>
            
            <!-- Main Content -->
            <div class="flex-1 space-y-2">
                <!-- Top Row: Sender & Type -->
                <div class="flex gap-2">
                    <select class="sender-select bg-editor-card border border-editor-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-editor-accent">
                        <option value="me" ${msg.sender === 'me' ? 'selected' : ''}>Me</option>
                        <option value="other" ${msg.sender === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                    <select class="type-select bg-editor-card border border-editor-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-editor-accent">
                        <option value="text" ${msg.type === 'text' ? 'selected' : ''}>Text</option>
                        <option value="image" ${msg.type === 'image' ? 'selected' : ''}>Image</option>
                        <option value="date_divider" ${msg.type === 'date_divider' ? 'selected' : ''}>Date</option>
                    </select>
                    <input type="text" class="timestamp-input flex-1 bg-editor-card border border-editor-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-editor-accent" value="${msg.timestamp}" placeholder="10:30 AM">
                </div>
                
                <!-- Content Input -->
                <div class="content-wrapper">
                    ${getContentInput(msg)}
                </div>
            </div>
            
            <!-- Delete Button -->
            <button class="delete-btn p-1 text-gray-600 hover:text-red-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Event listeners
    const senderSelect = item.querySelector('.sender-select');
    const typeSelect = item.querySelector('.type-select');
    const timestampInput = item.querySelector('.timestamp-input');
    const deleteBtn = item.querySelector('.delete-btn');
    const contentWrapper = item.querySelector('.content-wrapper');
    
    senderSelect.addEventListener('change', (e) => {
        msg.sender = e.target.value;
        updatePreview();
    });
    
    typeSelect.addEventListener('change', (e) => {
        msg.type = e.target.value;
        if (msg.type === 'date_divider') {
            msg.content = 'Today';
        } else if (msg.type === 'image') {
            msg.content = '';
        }
        contentWrapper.innerHTML = getContentInput(msg);
        attachContentListeners(contentWrapper, msg);
        updatePreview();
    });
    
    timestampInput.addEventListener('input', debounce((e) => {
        msg.timestamp = e.target.value;
        updatePreview();
    }, 150));
    
    deleteBtn.addEventListener('click', () => {
        AppState.chatData = AppState.chatData.filter(m => m.id !== msg.id);
        renderMessageList();
        updatePreview();
    });
    
    attachContentListeners(contentWrapper, msg);
    
    return item;
}

function getContentInput(msg) {
    if (msg.type === 'image') {
        return `
            <div class="flex items-center gap-2">
                <label class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-editor-card border border-editor-border rounded-lg cursor-pointer hover:border-editor-accent transition-colors">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-xs text-gray-400">${msg.content ? 'Change Image' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" class="image-input hidden">
                </label>
                ${msg.content ? `<img src="${msg.content}" class="w-10 h-10 rounded object-cover">` : ''}
            </div>
        `;
    } else if (msg.type === 'date_divider') {
        return `
            <input type="text" class="content-input w-full bg-editor-card border border-editor-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-editor-accent" value="${msg.content}" placeholder="Today, Yesterday, etc.">
        `;
    } else {
        return `
            <textarea class="content-input w-full bg-editor-card border border-editor-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-editor-accent resize-none" rows="2" placeholder="Type your message...">${msg.content}</textarea>
        `;
    }
}

function attachContentListeners(wrapper, msg) {
    const textInput = wrapper.querySelector('.content-input');
    const imageInput = wrapper.querySelector('.image-input');
    
    if (textInput) {
        textInput.addEventListener('input', debounce((e) => {
            msg.content = e.target.value;
            updatePreview();
        }, 150));
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await fileToBase64(file);
                msg.content = base64;
                renderMessageList();
                updatePreview();
            }
        });
    }
}

function addMessage() {
    const newMessage = {
        id: generateId(),
        sender: 'other',
        type: 'text',
        content: '',
        timestamp: getCurrentTime(),
        isRead: true
    };
    
    AppState.chatData.push(newMessage);
    renderMessageList();
    updatePreview();
    
    // Focus on the new message input
    setTimeout(() => {
        const inputs = DOM.messageList.querySelectorAll('.content-input');
        const lastInput = inputs[inputs.length - 1];
        if (lastInput) {
            lastInput.focus();
        }
    }, 50);
}

// ============================================
// Sortable (Drag & Drop)
// ============================================
let sortableInstance = null;

function initSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    sortableInstance = new Sortable(DOM.messageList, {
        handle: '.drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
            const { oldIndex, newIndex } = evt;
            const [movedItem] = AppState.chatData.splice(oldIndex, 1);
            AppState.chatData.splice(newIndex, 0, movedItem);
            updatePreview();
        }
    });
}

// ============================================
// Export Functions
// ============================================
async function exportImage() {
    try {
        DOM.exportImageBtn.disabled = true;
        DOM.exportImageBtn.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
        `;
        
        const canvas = await html2canvas(DOM.phoneScreen, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const link = document.createElement('a');
        link.download = `faketalk_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export image. Please try again.');
    } finally {
        DOM.exportImageBtn.disabled = false;
        DOM.exportImageBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Save Image
        `;
    }
}

async function exportVideo() {
    if (AppState.chatData.length === 0) {
        alert('Please add some messages first!');
        return;
    }
    
    if (AppState.isRecording) return;
    
    try {
        AppState.isRecording = true;
        DOM.recordingStatus.classList.remove('hidden');
        DOM.exportVideoBtn.disabled = true;
        DOM.exportVideoBtn.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Recording...
        `;
        
        // Create canvas for recording
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 1280;
        const ctx = canvas.getContext('2d');
        
        // Setup MediaRecorder
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `faketalk_${Date.now()}.webm`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        };
        
        // Save original data
        const originalData = [...AppState.chatData];
        
        // Clear chat for animation - start fresh
        AppState.chatData = [];
        renderChatMessages();
        
        // Start recording
        mediaRecorder.start();
        
        // Initial empty frame
        const initialFrame = await html2canvas(DOM.phoneScreen, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false
        });
        ctx.drawImage(initialFrame, 0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Animate messages one by one - KEEPING previous messages
        for (let i = 0; i < originalData.length; i++) {
            // Add new message to existing messages (accumulate)
            AppState.chatData.push(originalData[i]);
            
            // Render all messages including the new one
            renderChatMessages();
            
            // Scroll to bottom
            DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
            
            // Wait a bit for DOM to update
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Capture frames for smooth video
            for (let j = 0; j < 20; j++) {
                const frame = await html2canvas(DOM.phoneScreen, {
                    backgroundColor: null,
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
                await new Promise(resolve => setTimeout(resolve, 33));
            }
            
            // Pause between messages
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Hold on final frame for a bit longer
        for (let j = 0; j < 30; j++) {
            const frame = await html2canvas(DOM.phoneScreen, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false
            });
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            await new Promise(resolve => setTimeout(resolve, 33));
        }
        
        // Stop recording
        mediaRecorder.stop();
        
        // Restore data (already has all messages)
        AppState.chatData = originalData;
        renderChatMessages();
        
    } catch (error) {
        console.error('Video export failed:', error);
        alert('Failed to record video. Please try again.');
    } finally {
        AppState.isRecording = false;
        DOM.recordingStatus.classList.add('hidden');
        DOM.exportVideoBtn.disabled = false;
        DOM.exportVideoBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Record Video
        `;
    }
}

// ============================================
// Demo Data
// ============================================
function loadDemoData() {
    AppState.chatData = [
        {
            id: generateId(),
            sender: 'other',
            type: 'text',
            content: 'Hey! How are you doing? 😊',
            timestamp: '10:30 AM',
            isRead: true
        },
        {
            id: generateId(),
            sender: 'me',
            type: 'text',
            content: 'Hi! I\'m doing great, thanks for asking!',
            timestamp: '10:31 AM',
            isRead: true
        },
        {
            id: generateId(),
            sender: 'me',
            type: 'text',
            content: 'What about you?',
            timestamp: '10:31 AM',
            isRead: true
        },
        {
            id: generateId(),
            sender: 'other',
            type: 'text',
            content: 'Pretty good! Just wanted to share something cool with you',
            timestamp: '10:32 AM',
            isRead: true
        },
        {
            id: generateId(),
            sender: 'other',
            type: 'text',
            content: 'Check out this amazing chat maker tool! 🚀',
            timestamp: '10:33 AM',
            isRead: true
        },
        {
            id: generateId(),
            sender: 'me',
            type: 'text',
            content: 'Wow, that looks awesome! I love it! 💯',
            timestamp: '10:34 AM',
            isRead: true
        }
    ];
    
    renderMessageList();
    updatePreview();
}

// ============================================
// Initialization
// ============================================
function init() {
    initSettings();
    
    DOM.addMessageBtn.addEventListener('click', addMessage);
    DOM.exportImageBtn.addEventListener('click', exportImage);
    DOM.exportVideoBtn.addEventListener('click', exportVideo);
    
    // Load demo data
    loadDemoData();
    
    console.log('✨ FakeTalk Maker initialized successfully!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
