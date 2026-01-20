/**
 * Friends Module - Friend Management
 */
const Friends = {

    renderPage() {
        return `
            <div class="friends-page">
                <div class="container">
                    <div class="friends-header">
                        <h1><i class="fas fa-user-friends"></i> Bạn bè</h1>
                    </div>
                    
                    <div class="friends-layout">
                        <div class="friends-sidebar">
                            <div class="friends-tabs">
                                <button class="friends-tab active" data-tab="friends">
                                    <i class="fas fa-users"></i> Bạn bè
                                </button>
                                <button class="friends-tab" data-tab="requests">
                                    <i class="fas fa-user-plus"></i> Lời mời
                                    <span class="request-count" id="requestCount" style="display:none"></span>
                                </button>
                                <button class="friends-tab" data-tab="search">
                                    <i class="fas fa-search"></i> Tìm kiếm
                                </button>
                            </div>
                        </div>
                        
                        <div class="friends-content" id="friendsContent">
                            <div class="loading"><div class="spinner"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.bindEvents();
        await this.loadFriends();
        this.loadRequestCount();
    },

    bindEvents() {
        document.querySelectorAll('.friends-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.friends-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadTab(tab.dataset.tab);
            };
        });
    },

    loadTab(tab) {
        switch (tab) {
            case 'friends': this.loadFriends(); break;
            case 'requests': this.loadRequests(); break;
            case 'search': this.showSearch(); break;
        }
    },

    async loadRequestCount() {
        try {
            const result = await API.get('/friends/requests.php');
            if (result.success && result.incoming.length > 0) {
                const badge = document.getElementById('requestCount');
                if (badge) {
                    badge.textContent = result.incoming.length;
                    badge.style.display = 'inline';
                }
            }
        } catch (e) { }
    },

    async loadFriends() {
        const content = document.getElementById('friendsContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/friends.php');
            if (result.success) {
                if (result.friends.length === 0) {
                    content.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-user-friends"></i>
                            <p>Chưa có bạn bè</p>
                            <button class="btn btn-primary" onclick="document.querySelector('[data-tab=search]').click()">
                                <i class="fas fa-search"></i> Tìm bạn bè
                            </button>
                        </div>
                    `;
                    return;
                }

                content.innerHTML = `
                    <div class="friends-grid">
                        ${result.friends.map(f => `
                            <div class="friend-card">
                                <img src="${f.avatar || '/images/default-avatar.png'}" class="friend-card-avatar" alt="">
                                <div class="friend-card-name">${f.display_name || 'User ' + f.id}</div>
                                <div class="friend-card-actions">
                                    <button class="btn btn-sm btn-primary" onclick="App.navigate('chat'); setTimeout(() => Chat.openChat(${f.id}), 100)">
                                        <i class="fas fa-comment"></i> Nhắn tin
                                    </button>
                                    <button class="btn btn-sm btn-outline" onclick="Friends.unfriend(${f.id})">
                                        <i class="fas fa-user-minus"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (e) {
            content.innerHTML = '<p class="error-text">Không thể tải danh sách bạn bè</p>';
        }
    },

    async loadRequests() {
        const content = document.getElementById('friendsContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/friends/requests.php');
            if (result.success) {
                let html = '';

                if (result.incoming.length) {
                    html += `<h3 class="section-title">Lời mời nhận được</h3>`;
                    html += `<div class="requests-grid">`;
                    html += result.incoming.map(r => `
                        <div class="request-card">
                            <img src="${r.avatar || '/images/default-avatar.png'}" class="request-card-avatar" alt="">
                            <div class="request-card-info">
                                <div class="request-card-name">${r.display_name || r.email}</div>
                            </div>
                            <div class="request-card-actions">
                                <button class="btn btn-sm btn-primary" onclick="Friends.acceptRequest(${r.id})">
                                    <i class="fas fa-check"></i> Chấp nhận
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="Friends.rejectRequest(${r.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                    html += `</div>`;
                }

                if (result.outgoing.length) {
                    html += `<h3 class="section-title" style="margin-top: 2rem;">Đã gửi</h3>`;
                    html += `<div class="requests-grid">`;
                    html += result.outgoing.map(r => `
                        <div class="request-card outgoing">
                            <img src="${r.avatar || '/images/default-avatar.png'}" class="request-card-avatar" alt="">
                            <div class="request-card-info">
                                <div class="request-card-name">${r.display_name || r.email}</div>
                                <div class="request-card-status">Đang chờ phản hồi</div>
                            </div>
                        </div>
                    `).join('');
                    html += `</div>`;
                }

                content.innerHTML = html || '<div class="empty-state"><i class="fas fa-inbox"></i><p>Không có lời mời nào</p></div>';
            }
        } catch (e) {
            content.innerHTML = '<p class="error-text">Không thể tải</p>';
        }
    },

    showSearch() {
        const content = document.getElementById('friendsContent');
        content.innerHTML = `
            <div class="search-section">
                <div class="search-box">
                    <input type="text" id="userSearchInput" class="form-input" placeholder="Nhập tên hoặc email...">
                    <button class="btn btn-primary" onclick="Friends.search()">
                        <i class="fas fa-search"></i> Tìm
                    </button>
                </div>
                <div id="searchResults"></div>
            </div>
        `;

        document.getElementById('userSearchInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.search();
        };
    },

    async search() {
        const query = document.getElementById('userSearchInput').value.trim();
        const results = document.getElementById('searchResults');

        if (query.length < 2) {
            results.innerHTML = '<p class="text-muted">Nhập ít nhất 2 ký tự</p>';
            return;
        }

        results.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get(`/users/search.php?q=${encodeURIComponent(query)}`);
            if (result.success) {
                if (result.users.length === 0) {
                    results.innerHTML = '<p class="text-muted">Không tìm thấy kết quả</p>';
                    return;
                }

                results.innerHTML = `
                    <div class="search-results-grid">
                        ${result.users.map(u => `
                            <div class="search-result-card">
                                <img src="${u.avatar || '/images/default-avatar.png'}" class="search-avatar" alt="">
                                <div class="search-info">
                                    <div class="search-name">${u.display_name || u.email}</div>
                                </div>
                                ${this.renderFriendButton(u)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (e) {
            results.innerHTML = '<p class="error-text">Lỗi tìm kiếm</p>';
        }
    },

    renderFriendButton(user) {
        if (user.friendship_status === 'accepted') {
            return '<span class="badge badge-success">Bạn bè</span>';
        } else if (user.friendship_status === 'pending') {
            return '<span class="badge badge-warning">Đã gửi</span>';
        }
        return `<button class="btn btn-sm btn-primary" onclick="Friends.sendRequest(${user.id})">
            <i class="fas fa-user-plus"></i> Kết bạn
        </button>`;
    },

    async sendRequest(userId) {
        try {
            const result = await API.post('/friends.php', { friend_id: userId });
            if (result.success) {
                App.showNotification(result.message, 'success');
                this.search();
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
                this.loadRequestCount();
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    },

    async rejectRequest(requestId) {
        try {
            await API.post('/friends/requests.php', { request_id: requestId, action: 'reject' });
            this.loadRequests();
            this.loadRequestCount();
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    },

    async unfriend(friendId) {
        if (!confirm('Hủy kết bạn với người này?')) return;
        try {
            const result = await API.delete('/friends.php', { friend_id: friendId });
            if (result.success) {
                App.showNotification(result.message, 'success');
                this.loadFriends();
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    }
};

// Function to add friend from community posts
function addFriendFromPost(userId, userName) {
    Friends.sendRequest(userId);
}
