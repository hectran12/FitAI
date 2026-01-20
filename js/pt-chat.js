/**
 * PT AI Chat Widget
 * Floating chat button and AI assistant window
 * Uses: /api/chat/send, /api/chat/history, /api/chat/analyze-body, /api/chat/analyze-food
 */

let ptChatWidget = null;
let ptCsrfToken = '';

function initPTChat() {
    if (ptChatWidget) return;

    // Get CSRF token from existing app
    ptCsrfToken = API.csrfToken || '';

    // Create widget container
    ptChatWidget = document.createElement('div');
    ptChatWidget.className = 'chat-widget';
    ptChatWidget.id = 'ptChatWidget';

    ptChatWidget.innerHTML = `
        <button class="chat-toggle" id="ptChatToggle" title="PT AI - Huấn luyện viên AI">
            <i class="fas fa-robot"></i>
        </button>
        <div class="chat-window" id="ptChatWindow">
            <div class="chat-header pt-chat-header">
                <div class="pt-chat-title">
                    <i class="fas fa-robot"></i>
                    <span>PT AI - Huấn luyện viên</span>
                </div>
                <button class="chat-close" id="ptChatClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pt-chat-actions">
                <button class="pt-action-btn" onclick="PTChat.analyzeBody()" title="Phân tích hình thể">
                    <i class="fas fa-walking"></i> Body
                </button>
                <button class="pt-action-btn" onclick="PTChat.analyzeFood()" title="Phân tích thức ăn">
                    <i class="fas fa-utensils"></i> Food
                </button>
            </div>
            <div class="chat-messages pt-chat-messages" id="ptChatMessages">
                <div class="pt-message bot">
                    <div class="pt-message-content">
                        Xin chào! Tôi là PT AI - huấn luyện viên thể hình của bạn. 
                        Hãy hỏi tôi về bài tập, dinh dưỡng hoặc tải ảnh để phân tích!
                    </div>
                </div>
            </div>
            <div class="pt-chat-input">
                <input type="text" id="ptChatInput" placeholder="Nhập câu hỏi..." />
                <button id="ptChatSend">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
        <input type="file" id="ptBodyImageInput" accept="image/*" style="display:none" />
        <input type="file" id="ptFoodImageInput" accept="image/*" style="display:none" />
    `;

    document.body.appendChild(ptChatWidget);

    // Bind events
    const toggle = document.getElementById('ptChatToggle');
    const closeBtn = document.getElementById('ptChatClose');
    const window = document.getElementById('ptChatWindow');
    const input = document.getElementById('ptChatInput');
    const sendBtn = document.getElementById('ptChatSend');

    toggle.onclick = () => {
        window.classList.toggle('open');
        toggle.classList.toggle('hidden');
        if (window.classList.contains('open')) {
            PTChat.loadHistory();
        }
    };

    closeBtn.onclick = () => {
        window.classList.remove('open');
        toggle.classList.remove('hidden');
    };

    sendBtn.onclick = () => PTChat.sendMessage();
    input.onkeypress = (e) => {
        if (e.key === 'Enter') PTChat.sendMessage();
    };

    // File upload handlers
    document.getElementById('ptBodyImageInput').onchange = (e) => {
        if (e.target.files[0]) PTChat.uploadBodyImage(e.target.files[0]);
    };
    document.getElementById('ptFoodImageInput').onchange = (e) => {
        if (e.target.files[0]) PTChat.uploadFoodImage(e.target.files[0]);
    };
}

function destroyPTChat() {
    if (ptChatWidget) {
        ptChatWidget.remove();
        ptChatWidget = null;
    }
}

const PTChat = {
    isProcessing: false,

    setProcessing(processing) {
        this.isProcessing = processing;
        const input = document.getElementById('ptChatInput');
        const sendBtn = document.getElementById('ptChatSend');
        const bodyBtn = document.querySelector('.pt-action-btn[onclick*="analyzeBody"]');
        const foodBtn = document.querySelector('.pt-action-btn[onclick*="analyzeFood"]');

        if (processing) {
            input.disabled = true;
            sendBtn.disabled = true;
            bodyBtn.disabled = true;
            foodBtn.disabled = true;
            input.placeholder = 'AI đang xử lý...';
        } else {
            input.disabled = false;
            sendBtn.disabled = false;
            bodyBtn.disabled = false;
            foodBtn.disabled = false;
            input.placeholder = 'Nhập câu hỏi...';
        }
    },

    async loadHistory() {
        const messages = document.getElementById('ptChatMessages');
        try {
            const result = await API.get('/chat/history');
            if (result.success && result.messages && result.messages.length > 0) {
                messages.innerHTML = result.messages.map(msg => `
                    <div class="pt-message ${msg.role === 'user' ? 'user' : 'bot'}">
                        <div class="pt-message-content">${this.formatContent(msg.content)}</div>
                    </div>
                `).join('');
            }
            messages.scrollTop = messages.scrollHeight;
        } catch (e) {
            console.log('No history available');
        }
    },

    formatContent(content) {
        return content.replace(/\n/g, '<br>');
    },

    async sendMessage() {
        if (this.isProcessing) return;

        const input = document.getElementById('ptChatInput');
        const messages = document.getElementById('ptChatMessages');
        const message = input.value.trim();

        if (!message) return;

        this.setProcessing(true);

        // Add user message
        messages.innerHTML += `
            <div class="pt-message user">
                <div class="pt-message-content">${message}</div>
            </div>
        `;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        // Show typing
        const typingId = 'typing-' + Date.now();
        messages.innerHTML += `
            <div class="pt-message bot" id="${typingId}">
                <div class="pt-message-content">
                    <i class="fas fa-spinner fa-spin"></i> Đang suy nghĩ...
                </div>
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;

        try {
            const result = await API.post('/chat/send', {
                message,
                csrf_token: API.csrfToken || ''
            });

            document.getElementById(typingId)?.remove();

            if (result.success) {
                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-message-content">${this.formatContent(result.response)}</div>
                    </div>
                `;
            } else {
                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-message-content">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.</div>
                    </div>
                `;
            }
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        } catch (e) {
            document.getElementById(typingId)?.remove();
            messages.innerHTML += `
                <div class="pt-message bot">
                    <div class="pt-message-content">Lỗi kết nối. Vui lòng thử lại.</div>
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        }
    },

    analyzeBody() {
        document.getElementById('ptBodyImageInput').click();
    },

    analyzeFood() {
        document.getElementById('ptFoodImageInput').click();
    },

    async uploadBodyImage(file) {
        if (this.isProcessing) return;

        this.setProcessing(true);
        const messages = document.getElementById('ptChatMessages');

        messages.innerHTML += `
            <div class="pt-message user">
                <div class="pt-message-content"><i class="fas fa-image"></i> Phân tích hình thể của tôi</div>
            </div>
        `;

        const typingId = 'typing-' + Date.now();
        messages.innerHTML += `
            <div class="pt-message bot" id="${typingId}">
                <div class="pt-message-content">
                    <i class="fas fa-spinner fa-spin"></i> Đang phân tích hình thể...
                </div>
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('csrf_token', API.csrfToken || '');

            const response = await fetch('/api/chat/analyze-body', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            document.getElementById(typingId)?.remove();

            if (result.success && result.analysis) {
                const a = result.analysis;
                const areas = (a.areas_to_improve || []).map(area => `<span class="pt-tag">${area}</span>`).join('');
                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-analysis-card body-card">
                            <div class="pt-card-header">
                                <i class="fas fa-dumbbell"></i>
                                <span>Phân tích hình thể</span>
                            </div>
                            <div class="pt-card-body">
                                <div class="pt-assessment">
                                    ${a.overall_assessment || 'Không có dữ liệu'}
                                </div>
                                ${areas ? `
                                <div class="pt-section">
                                    <div class="pt-section-title">📌 Cần cải thiện:</div>
                                    <div class="pt-tags">${areas}</div>
                                </div>` : ''}
                                ${a.recommendations ? `
                                <div class="pt-section">
                                    <div class="pt-section-title">💡 Gợi ý:</div>
                                    <div class="pt-recommendations">${a.recommendations}</div>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-message-content">${result.message || 'Không thể phân tích ảnh'}</div>
                    </div>
                `;
            }
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        } catch (e) {
            document.getElementById(typingId)?.remove();
            messages.innerHTML += `
                <div class="pt-message bot">
                    <div class="pt-message-content">Lỗi khi phân tích ảnh</div>
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        }

        document.getElementById('ptBodyImageInput').value = '';
    },

    async uploadFoodImage(file) {
        if (this.isProcessing) return;

        this.setProcessing(true);
        const messages = document.getElementById('ptChatMessages');

        messages.innerHTML += `
            <div class="pt-message user">
                <div class="pt-message-content"><i class="fas fa-image"></i> Phân tích bữa ăn này</div>
            </div>
        `;

        const typingId = 'typing-' + Date.now();
        messages.innerHTML += `
            <div class="pt-message bot" id="${typingId}">
                <div class="pt-message-content">
                    <i class="fas fa-spinner fa-spin"></i> Đang phân tích thức ăn...
                </div>
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('csrf_token', API.csrfToken || '');

            const response = await fetch('/api/chat/analyze-food', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            document.getElementById(typingId)?.remove();

            if (result.success && result.analysis) {
                const a = result.analysis;
                const foods = (a.foods || a.food_items || []).map(f => `<span class="pt-tag">${f}</span>`).join('');
                const suggestions = (a.suggestions || []).map(s => `<li>${s}</li>`).join('');
                const ratingClass = a.rating === 'good' ? 'good' : a.rating === 'bad' ? 'bad' : 'medium';
                const ratingIcon = a.rating === 'good' ? '✅' : a.rating === 'bad' ? '❌' : '⚠️';

                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-analysis-card food-card">
                            <div class="pt-card-header">
                                <i class="fas fa-utensils"></i>
                                <span>Phân tích bữa ăn</span>
                                ${a.rating ? `<span class="pt-rating ${ratingClass}">${ratingIcon} ${a.rating.toUpperCase()}</span>` : ''}
                            </div>
                            <div class="pt-card-body">
                                ${a.summary ? `<div class="pt-summary">${a.summary}</div>` : ''}
                                
                                <div class="pt-nutrition-grid">
                                    <div class="pt-nutrition-item calories">
                                        <div class="pt-nutrition-value">${a.total_calories || 0}</div>
                                        <div class="pt-nutrition-label">Calories</div>
                                    </div>
                                    <div class="pt-nutrition-item protein">
                                        <div class="pt-nutrition-value">${a.protein_g || 0}g</div>
                                        <div class="pt-nutrition-label">Protein</div>
                                    </div>
                                    <div class="pt-nutrition-item carbs">
                                        <div class="pt-nutrition-value">${a.carbs_g || 0}g</div>
                                        <div class="pt-nutrition-label">Carbs</div>
                                    </div>
                                    <div class="pt-nutrition-item fat">
                                        <div class="pt-nutrition-value">${a.fat_g || 0}g</div>
                                        <div class="pt-nutrition-label">Fat</div>
                                    </div>
                                </div>
                                
                                ${a.fiber_g ? `
                                <div class="pt-fiber">🥬 Chất xơ: <strong>${a.fiber_g}g</strong></div>
                                ` : ''}
                                
                                ${foods ? `
                                <div class="pt-section">
                                    <div class="pt-section-title">🍽️ Thực phẩm phát hiện:</div>
                                    <div class="pt-tags">${foods}</div>
                                </div>` : ''}
                                
                                ${a.rating_reason ? `
                                <div class="pt-section">
                                    <div class="pt-section-title">📊 Đánh giá:</div>
                                    <div class="pt-rating-reason">${a.rating_reason}</div>
                                </div>` : ''}
                                
                                ${suggestions ? `
                                <div class="pt-section">
                                    <div class="pt-section-title">💡 Gợi ý:</div>
                                    <ul class="pt-suggestions">${suggestions}</ul>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                messages.innerHTML += `
                    <div class="pt-message bot">
                        <div class="pt-message-content">${result.message || 'Không thể phân tích ảnh'}</div>
                    </div>
                `;
            }
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        } catch (e) {
            document.getElementById(typingId)?.remove();
            messages.innerHTML += `
                <div class="pt-message bot">
                    <div class="pt-message-content">Lỗi khi phân tích ảnh</div>
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;
            this.setProcessing(false);
        }

        document.getElementById('ptFoodImageInput').value = '';
    }
};
