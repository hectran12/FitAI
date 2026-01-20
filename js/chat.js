/**
 * Chat Module - Friends & Messaging
 */
const Chat = {
    currentFriendId: null,
    friends: [],
    messages: [],
    stickers: [],
    pollingInterval: null,
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],

    /**
     * Render chat page
     */
    renderPage() {
        return `
            <div class="chat-page">
                <div class="chat-sidebar">
                    <div class="chat-tabs">
                        <button class="chat-tab active" data-tab="friends">
                            <i class="fas fa-users"></i> Bạn bè
                        </button>
                        <button class="chat-tab" data-tab="requests">
                            <i class="fas fa-user-plus"></i> Lời mời
                        </button>
                    </div>
                    <div class="chat-search">
                        <input type="text" id="friendSearch" placeholder="Tìm bạn bè..." class="form-input">
                    </div>
                    <div class="chat-friends-list" id="friendsList">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                <div class="chat-main" id="chatMain">
                    <div class="chat-empty">
                        <i class="fas fa-comments"></i>
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize chat
     */
    async init() {
        await this.loadFriends();
        await this.loadStickers();
        this.bindEvents();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.onclick = () => this.switchTab(tab.dataset.tab);
        });

        // Search
        const searchInput = document.getElementById('friendSearch');
        if (searchInput) {
            let timeout;
            searchInput.oninput = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.searchUsers(searchInput.value), 300);
            };
        }
    },

    switchTab(tab) {
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.chat-tab[data-tab="${tab}"]`).classList.add('active');

        if (tab === 'friends') {
            this.loadFriends();
        } else {
            this.loadRequests();
        }
    },

    async loadFriends() {
        const list = document.getElementById('friendsList');
        try {
            const result = await API.get('/friends.php');
            if (result.success) {
                this.friends = result.friends;
                list.innerHTML = this.friends.length ? this.friends.map(f => `
                    <div class="friend-item ${this.currentFriendId == f.id ? 'active' : ''}" 
                         onclick="Chat.openChat(${f.id})">
                        <div class="friend-avatar">
                            <img src="${f.avatar || '/images/default-avatar.png'}" alt="">
                            ${f.unread_count > 0 ? `<span class="unread-badge">${f.unread_count}</span>` : ''}
                        </div>
                        <div class="friend-info">
                            <div class="friend-name">${f.display_name || 'User ' + f.id}</div>
                        </div>
                    </div>
                `).join('') : '<p class="empty-text">Chưa có bạn bè</p>';
            }
        } catch (e) {
            list.innerHTML = '<p class="error-text">Không thể tải danh sách</p>';
        }
    },

    async loadRequests() {
        const list = document.getElementById('friendsList');
        list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/friends/requests.php');
            if (result.success) {
                let html = '';

                if (result.incoming.length) {
                    html += '<div class="requests-section"><h4>Lời mời nhận được</h4>';
                    html += result.incoming.map(r => `
                        <div class="request-item">
                            <img src="${r.avatar || '/images/default-avatar.png'}" class="request-avatar" alt="">
                            <div class="request-info">
                                <div class="request-name">${r.display_name || r.email}</div>
                            </div>
                            <div class="request-actions">
                                <button class="btn btn-sm btn-primary" onclick="Chat.acceptRequest(${r.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="Chat.rejectRequest(${r.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                    html += '</div>';
                }

                if (result.outgoing.length) {
                    html += '<div class="requests-section"><h4>Đã gửi</h4>';
                    html += result.outgoing.map(r => `
                        <div class="request-item outgoing">
                            <img src="${r.avatar || '/images/default-avatar.png'}" class="request-avatar" alt="">
                            <div class="request-info">
                                <div class="request-name">${r.display_name || r.email}</div>
                                <div class="request-status">Đang chờ phản hồi</div>
                            </div>
                        </div>
                    `).join('');
                    html += '</div>';
                }

                list.innerHTML = html || '<p class="empty-text">Không có lời mời nào</p>';
            }
        } catch (e) {
            list.innerHTML = '<p class="error-text">Không thể tải</p>';
        }
    },

    async searchUsers(query) {
        const list = document.getElementById('friendsList');
        if (query.length < 2) {
            return this.loadFriends();
        }

        try {
            const result = await API.get(`/users/search.php?q=${encodeURIComponent(query)}`);
            if (result.success) {
                list.innerHTML = result.users.length ? result.users.map(u => `
                    <div class="friend-item search-result">
                        <div class="friend-avatar">
                            <img src="${u.avatar || '/images/default-avatar.png'}" alt="">
                        </div>
                        <div class="friend-info">
                            <div class="friend-name">${u.display_name || u.email}</div>
                        </div>
                        ${this.renderFriendAction(u)}
                    </div>
                `).join('') : '<p class="empty-text">Không tìm thấy</p>';
            }
        } catch (e) {
            console.error(e);
        }
    },

    renderFriendAction(user) {
        if (user.friendship_status === 'accepted') {
            return '<span class="badge friend-badge">Bạn bè</span>';
        } else if (user.friendship_status === 'pending') {
            return '<span class="badge pending-badge">Đã gửi</span>';
        }
        return `<button class="btn btn-sm btn-primary" onclick="Chat.sendRequest(${user.id})">
            <i class="fas fa-user-plus"></i>
        </button>`;
    },

    async sendRequest(userId) {
        try {
            const result = await API.post('/friends.php', { friend_id: userId });
            if (result.success) {
                App.showNotification(result.message, 'success');
                this.loadFriends();
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    },

    async acceptRequest(requestId) {
        try {
            const result = await API.post('/friends/requests.php', { request_id: requestId, action: 'accept' });
            if (result.success) {
                App.showNotification(result.message, 'success');
                this.loadRequests();
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    },

    async rejectRequest(requestId) {
        try {
            const result = await API.post('/friends/requests.php', { request_id: requestId, action: 'reject' });
            if (result.success) {
                this.loadRequests();
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    },

    async openChat(friendId) {
        this.currentFriendId = friendId;
        const friend = this.friends.find(f => f.id == friendId);

        // Update active state
        document.querySelectorAll('.friend-item').forEach(item => item.classList.remove('active'));
        event?.target?.closest('.friend-item')?.classList.add('active');

        const main = document.getElementById('chatMain');
        main.innerHTML = `
            <div class="chat-header">
                <img src="${friend?.avatar || '/images/default-avatar.png'}" class="chat-avatar" alt="">
                <div class="chat-name">${friend?.display_name || 'User ' + friendId}</div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="loading"><div class="spinner"></div></div>
            </div>
            <div class="chat-input-area">
                <div class="sticker-picker" id="stickerPicker" style="display:none"></div>
                <div class="chat-attachments">
                    <button class="attach-btn" onclick="Chat.toggleStickers()" title="Sticker">
                        <i class="fas fa-smile"></i>
                    </button>
                    <button class="attach-btn" onclick="Chat.pickImage()" title="Hình ảnh">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="attach-btn" onclick="Chat.pickFile()" title="File">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <button class="attach-btn" id="voiceBtn" onclick="Chat.toggleVoice()" title="Voice">
                        <i class="fas fa-microphone"></i>
                    </button>
                </div>
                <div class="chat-input-wrapper">
                    <input type="text" id="messageInput" class="form-input" placeholder="Nhập tin nhắn...">
                    <button class="send-btn" onclick="Chat.sendTextMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <input type="file" id="imageInput" accept="image/*" style="display:none" onchange="Chat.uploadImage(this)">
                <input type="file" id="fileInput" style="display:none" onchange="Chat.uploadFile(this)">
            </div>
        `;

        // Bind enter key
        document.getElementById('messageInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendTextMessage();
        };

        await this.loadMessages();
        this.startPolling();
        this.renderStickerPicker();
    },

    async loadMessages() {
        const container = document.getElementById('chatMessages');
        try {
            const result = await API.get(`/messages.php?friend_id=${this.currentFriendId}`);
            if (result.success) {
                this.messages = result.messages;
                this.renderMessages();
            }
        } catch (e) {
            container.innerHTML = '<p class="error-text">Không thể tải tin nhắn</p>';
        }
    },

    renderMessages() {
        const container = document.getElementById('chatMessages');
        const userId = Auth.getUser()?.id;

        container.innerHTML = this.messages.map(m => {
            const isMine = m.sender_id == userId;
            return `
                <div class="message ${isMine ? 'mine' : 'theirs'}">
                    ${this.renderMessageContent(m)}
                    <div class="message-time">${this.formatTime(m.created_at)}</div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    },

    renderMessageContent(msg) {
        switch (msg.message_type) {
            case 'sticker':
                return `<img src="${msg.sticker_url}" class="message-sticker" alt="">`;
            case 'image':
                return `<img src="${msg.file_url}" class="message-image" alt="" onclick="Chat.viewImage('${msg.file_url}')">`;
            case 'file':
                return `<a href="${msg.file_url}" class="message-file" download="${msg.file_name}">
                    <i class="fas fa-file"></i> ${msg.file_name}
                    <span class="file-size">${this.formatSize(msg.file_size)}</span>
                </a>`;
            case 'voice':
                return `<audio controls class="message-voice"><source src="${msg.file_url}" type="audio/webm"></audio>`;
            default:
                return `<div class="message-text">${this.escapeHtml(msg.content)}</div>`;
        }
    },

    async sendTextMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        if (!content) return;

        input.value = '';
        await this.sendMessage('text', content);
    },

    async sendMessage(type, content, file = null, stickerId = null) {
        const formData = new FormData();
        formData.append('friend_id', this.currentFriendId);
        formData.append('message_type', type);
        if (content) formData.append('content', content);
        if (file) formData.append('file', file);
        if (stickerId) formData.append('sticker_id', stickerId);

        try {
            const response = await fetch('/api/messages.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (result.success) {
                this.messages.push(result.message);
                this.renderMessages();
            }
        } catch (e) {
            App.showNotification('Gửi tin nhắn thất bại', 'error');
        }
    },

    async loadStickers() {
        try {
            const result = await API.get('/stickers.php');
            if (result.success) {
                this.stickers = result.packs;
            }
        } catch (e) {
            console.log('Stickers not available');
        }
    },

    renderStickerPicker() {
        const picker = document.getElementById('stickerPicker');
        if (!picker || !this.stickers.length) return;

        picker.innerHTML = this.stickers.map(pack => `
            <div class="sticker-pack">
                <div class="sticker-pack-name">${pack.name}</div>
                <div class="sticker-grid">
                    ${pack.stickers.map(s => `
                        <img src="${s.image_url}" class="sticker-item" 
                             onclick="Chat.sendSticker(${s.id})" alt="${s.emoji || ''}">
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    toggleStickers() {
        const picker = document.getElementById('stickerPicker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    },

    async sendSticker(stickerId) {
        document.getElementById('stickerPicker').style.display = 'none';
        await this.sendMessage('sticker', null, null, stickerId);
    },

    pickImage() {
        document.getElementById('imageInput').click();
    },

    pickFile() {
        document.getElementById('fileInput').click();
    },

    async uploadImage(input) {
        if (input.files[0]) {
            await this.sendMessage('image', null, input.files[0]);
            input.value = '';
        }
    },

    async uploadFile(input) {
        if (input.files[0]) {
            await this.sendMessage('file', null, input.files[0]);
            input.value = '';
        }
    },

    async toggleVoice() {
        const btn = document.getElementById('voiceBtn');

        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioStream = stream;

                // Use RecordRTC with WAV format
                this.recorder = new RecordRTC(stream, {
                    type: 'audio',
                    mimeType: 'audio/wav',
                    recorderType: RecordRTC.StereoAudioRecorder,
                    numberOfAudioChannels: 1,
                    desiredSampRate: 16000
                });

                this.recorder.startRecording();
                this.isRecording = true;
                btn.classList.add('recording');
                btn.innerHTML = '<i class="fas fa-stop"></i>';
                App.showNotification('🎤 Đang ghi âm...', 'info');
            } catch (e) {
                console.error('Voice error:', e);
                App.showNotification('Không thể truy cập microphone!', 'error');
            }
        } else {
            this.recorder.stopRecording(() => {
                const blob = this.recorder.getBlob();
                const file = new File([blob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });

                this.audioStream.getTracks().forEach(t => t.stop());
                this.sendMessage('voice', null, file);
                App.showNotification('Đã gửi voice!', 'success');
            });

            this.isRecording = false;
            btn.classList.remove('recording');
            btn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    },

    startPolling() {
        this.stopPolling();
        this.pollingInterval = setInterval(() => this.pollMessages(), 3000);
    },

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    async pollMessages() {
        if (!this.currentFriendId) return;

        try {
            const result = await API.get(`/messages.php?friend_id=${this.currentFriendId}`);
            if (result.success && result.messages.length !== this.messages.length) {
                this.messages = result.messages;
                this.renderMessages();
            }
        } catch (e) {
            // Silent fail
        }
    },

    viewImage(url) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-overlay" onclick="this.parentNode.remove()">
                <img src="${url}" alt="">
            </div>
        `;
        document.body.appendChild(modal);
    },

    formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
            ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup() {
        this.stopPolling();
        this.currentFriendId = null;
    }
};
