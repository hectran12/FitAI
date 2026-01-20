/**
 * FitAI - Community Module
 * 
 * Handles community posts, likes, and comments
 */

const Community = {
    posts: [],
    filter: 'all',
    page: 1,
    hasMore: true,
    isLoading: false,
    selectedImages: [], // Store selected image files

    /**
     * Render community page
     */
    renderCommunityPage() {
        return `
            <div class="community-page">
                <div class="container">
                    <div class="community-header">
                        <div>
                            <h1><i class="fas fa-users"></i> Cộng Đồng FitAI</h1>
                            <p class="text-muted">Chia sẻ và học hỏi cùng cộng đồng</p>
                        </div>
                    </div>
                    
                    <!-- 3-Column Layout -->
                    <div class="community-layout">
                        <!-- Left Sidebar -->
                        <div class="community-sidebar left-sidebar">
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-lightbulb text-yellow"></i> Mẹo Fitness</h3>
                                <ul class="tips-list">
                                    <li><i class="fas fa-check-circle text-green"></i> Uống đủ 2-3 lít nước mỗi ngày</li>
                                    <li><i class="fas fa-check-circle text-green"></i> Ngủ đủ 7-8 tiếng để phục hồi cơ</li>
                                    <li><i class="fas fa-check-circle text-green"></i> Tập luyện đều đặn, không bỏ buổi</li>
                                    <li><i class="fas fa-check-circle text-green"></i> Ăn đủ protein sau tập</li>
                                    <li><i class="fas fa-check-circle text-green"></i> Khởi động kỹ trước khi tập</li>
                                </ul>
                            </div>
                            
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-fire text-primary"></i> Thử thách tuần</h3>
                                <div class="challenge-card">
                                    <div class="challenge-icon">🏃</div>
                                    <div class="challenge-info">
                                        <strong>100 Squats mỗi ngày</strong>
                                        <p class="text-muted">Chia thành 4 sets x 25 reps</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="community-main">
                            <!-- Filter tabs -->
                            <div class="community-tabs">
                                <button class="tab-btn active" data-filter="all">
                                    <i class="fas fa-list"></i> Tất cả
                                </button>
                                <button class="tab-btn" data-filter="question">
                                    <i class="fas fa-question-circle"></i> Hỏi đáp
                                </button>
                                <button class="tab-btn" data-filter="achievement">
                                    <i class="fas fa-trophy"></i> Thành tựu
                                </button>
                            </div>
                            
                            <!-- Create post form -->
                            <div class="create-post-card card">
                                <div class="create-post-header">
                                    <div class="create-post-avatar">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div class="create-post-input" id="createPostTrigger">
                                        Bạn đang nghĩ gì?
                                    </div>
                                </div>
                                <div class="create-post-actions">
                                    <button class="create-action-btn" data-type="question">
                                        <i class="fas fa-question-circle text-yellow"></i> Hỏi đáp
                                    </button>
                                    <button class="create-action-btn" data-type="achievement">
                                        <i class="fas fa-trophy text-primary"></i> Thành tựu
                                    </button>
                                    <button class="create-action-btn" data-type="general">
                                        <i class="fas fa-edit text-green"></i> Chia sẻ
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Posts feed -->
                            <div class="posts-feed" id="postsFeed">
                                <div class="loading">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                            
                            <!-- Load more button -->
                            <div class="load-more-container" id="loadMoreContainer" style="display: none;">
                                <button class="btn btn-secondary" id="loadMoreBtn">
                                    <i class="fas fa-chevron-down"></i> Xem thêm
                                </button>
                            </div>
                        </div>
                        
                        <!-- Right Sidebar -->
                        <div class="community-sidebar right-sidebar">
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-chart-bar text-primary"></i> Thống kê</h3>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <div class="stat-value" id="statMembers">--</div>
                                        <div class="stat-label">Thành viên</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value" id="statPosts">--</div>
                                        <div class="stat-label">Bài viết</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-hashtag"></i> Chủ đề hot</h3>
                                <div class="trending-topics">
                                    <a href="#" class="topic-tag">#giảmcân</a>
                                    <a href="#" class="topic-tag">#tăngcơ</a>
                                    <a href="#" class="topic-tag">#cardio</a>
                                    <a href="#" class="topic-tag">#ănuống</a>
                                    <a href="#" class="topic-tag">#motivation</a>
                                    <a href="#" class="topic-tag">#homeworkout</a>
                                </div>
                            </div>
                            
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-quote-left text-muted"></i> Quote</h3>
                                <blockquote class="fitness-quote">
                                    "The only bad workout is the one that didn't happen."
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Create Post Modal -->
            <div class="post-modal-overlay" id="postModalOverlay">
                <div class="post-modal">
                    <div class="post-modal-header">
                        <h3 id="postModalTitle">Tạo bài viết</h3>
                        <button class="post-modal-close" id="postModalClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="post-modal-body">
                        <textarea id="postContent" placeholder="Viết nội dung..." rows="4"></textarea>
                        <div class="post-images-preview" id="postImagesPreview"></div>
                        <div class="post-modal-actions">
                            <input type="file" id="postImageInput" accept="image/*" multiple style="display: none;">
                            <button class="btn btn-secondary" id="addImageBtn">
                                <i class="fas fa-images"></i> Thêm ảnh (tối đa 5)
                            </button>
                            <input type="hidden" id="postType" value="general">
                        </div>
                    </div>
                    <div class="post-modal-footer">
                        <button class="btn btn-primary btn-block" id="submitPostBtn">
                            <i class="fas fa-paper-plane"></i> Đăng bài
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize community page
     */
    initCommunityPage() {
        this.posts = [];
        this.page = 1;
        this.hasMore = true;
        this.filter = 'all';

        this.bindEvents();
        this.loadFeed();
        this.loadStats();
        this.loadUserAvatar();
    },

    /**
     * Load current user avatar for create post section
     */
    async loadUserAvatar() {
        try {
            const result = await API.get('/profile/get.php');
            if (result.success && result.profile) {
                const avatarContainer = document.querySelector('.create-post-avatar');
                if (avatarContainer && result.profile.avatar) {
                    avatarContainer.innerHTML = `<img src="${result.profile.avatar}" alt="Avatar">`;
                }
            }
        } catch (error) {
            console.error('Error loading user avatar:', error);
        }
    },

    /**
     * Load community stats
     */
    async loadStats() {
        try {
            const response = await API.get('/community/stats.php');
            if (response.success) {
                const membersEl = document.getElementById('statMembers');
                const postsEl = document.getElementById('statPosts');
                if (membersEl) membersEl.textContent = response.members;
                if (postsEl) postsEl.textContent = response.posts;
            }
        } catch (error) {
            console.error('Load stats error:', error);
        }
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.page = 1;
                this.posts = [];
                this.loadFeed();
            });
        });

        // Create post trigger
        document.getElementById('createPostTrigger').addEventListener('click', () => {
            this.openPostModal('general');
        });

        // Create action buttons
        document.querySelectorAll('.create-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openPostModal(btn.dataset.type);
            });
        });

        // Modal close
        document.getElementById('postModalClose').addEventListener('click', () => {
            this.closePostModal();
        });

        document.getElementById('postModalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'postModalOverlay') {
                this.closePostModal();
            }
        });

        // Image upload - multiple files
        document.getElementById('addImageBtn').addEventListener('click', () => {
            document.getElementById('postImageInput').click();
        });

        document.getElementById('postImageInput').addEventListener('change', (e) => {
            this.handleImageSelect(e.target.files);
        });

        // Submit post
        document.getElementById('submitPostBtn').addEventListener('click', () => {
            this.createPost();
        });

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.page++;
            this.loadFeed(true);
        });
    },

    /**
     * Load feed posts
     */
    async loadFeed(append = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        const feed = document.getElementById('postsFeed');

        if (!append) {
            feed.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        }

        try {
            const response = await API.get(`/community/feed.php?type=${this.filter}&page=${this.page}`);

            if (response.success) {
                if (!append) {
                    feed.innerHTML = '';
                }

                if (response.posts.length === 0 && !append) {
                    feed.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <p>Chưa có bài viết nào</p>
                            <button class="btn btn-primary" onclick="Community.openPostModal('general')">
                                Đăng bài đầu tiên
                            </button>
                        </div>
                    `;
                } else {
                    response.posts.forEach(post => {
                        feed.insertAdjacentHTML('beforeend', this.renderPost(post));
                    });
                    this.bindPostEvents();
                }

                this.hasMore = response.has_more;
                document.getElementById('loadMoreContainer').style.display =
                    this.hasMore ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Load feed error:', error);
            if (!append) {
                feed.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-circle"></i> Không thể tải bài viết
                    </div>
                `;
            }
        }

        this.isLoading = false;
    },

    /**
     * Render a single post
     */
    renderPost(post) {
        const typeIcon = {
            'question': '<span class="post-type-badge question"><i class="fas fa-question-circle"></i> Hỏi đáp</span>',
            'achievement': '<span class="post-type-badge achievement"><i class="fas fa-trophy"></i> Thành tựu</span>',
            'general': ''
        };

        return `
            <div class="post-card card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar clickable" onclick="Community.viewUserProfile(${post.user_id}); event.stopPropagation();">
                        ${post.avatar
                ? `<img src="${post.avatar}" alt="${post.display_name}">`
                : '<i class="fas fa-user"></i>'
            }
                    </div>
                    <div class="post-meta">
                        <div class="post-author clickable" onclick="Community.viewUserProfile(${post.user_id}); event.stopPropagation();">${post.display_name}</div>
                        <div class="post-time">${post.time_ago}</div>
                    </div>
                    ${post.is_owner ? `
                        <div class="post-menu">
                            <button class="post-menu-btn" onclick="Community.deletePost(${post.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                ${typeIcon[post.post_type]}
                
                <div class="post-content">
                    <p>${this.formatContent(post.content)}</p>
                </div>
                
                ${this.renderPostImages(post.image_path)}
                
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i> <span class="likes-count">${post.likes_count}</span></span>
                    <span><i class="fas fa-comment"></i> <span class="comments-count">${post.comments_count}</span> bình luận</span>
                </div>
                
                <div class="post-actions">
                    <button class="post-action-btn like-btn ${post.is_liked ? 'liked' : ''}" 
                            onclick="Community.toggleLike(${post.id}, this)">
                        <i class="fas fa-heart"></i> Thích
                    </button>
                    <button class="post-action-btn comment-btn" 
                            onclick="Community.toggleComments(${post.id})">
                        <i class="fas fa-comment"></i> Bình luận
                    </button>
                </div>
                
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list" id="commentsList-${post.id}"></div>
                    <div class="add-comment">
                        <input type="text" placeholder="Viết bình luận..." 
                               id="commentInput-${post.id}" 
                               onkeypress="if(event.key==='Enter') Community.addComment(${post.id})">
                        <button onclick="Community.addComment(${post.id})">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Bind events for posts
     */
    bindPostEvents() {
        // Already using inline onclick handlers
    },

    /**
     * Open post creation modal
     */
    openPostModal(type = 'general') {
        const titles = {
            'question': 'Đặt câu hỏi',
            'achievement': 'Khoe thành tựu',
            'general': 'Chia sẻ với cộng đồng'
        };

        document.getElementById('postModalTitle').textContent = titles[type];
        document.getElementById('postType').value = type;
        document.getElementById('postContent').value = '';
        this.clearAllImages();

        document.getElementById('postModalOverlay').classList.add('active');
        document.getElementById('postContent').focus();
    },

    /**
     * Close post modal
     */
    closePostModal() {
        document.getElementById('postModalOverlay').classList.remove('active');
    },

    /**
     * Handle multiple image selection
     */
    handleImageSelect(files) {
        const maxImages = 5;
        const remaining = maxImages - this.selectedImages.length;

        if (remaining <= 0) {
            alert('Đã đạt giới hạn 5 ảnh');
            return;
        }

        const filesToAdd = Array.from(files).slice(0, remaining);

        filesToAdd.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.selectedImages.push(file);
            }
        });

        this.renderImagePreviews();
        document.getElementById('postImageInput').value = '';
    },

    /**
     * Render image previews
     */
    renderImagePreviews() {
        const container = document.getElementById('postImagesPreview');

        if (this.selectedImages.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.selectedImages.map((file, index) => {
            const url = URL.createObjectURL(file);
            return `
                <div class="image-preview-item">
                    <img src="${url}" alt="Preview ${index + 1}">
                    <button class="remove-preview-btn" onclick="Community.removeImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    },

    /**
     * Remove a specific image
     */
    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.renderImagePreviews();
    },

    /**
     * Clear all selected images
     */
    clearAllImages() {
        this.selectedImages = [];
        document.getElementById('postImagesPreview').innerHTML = '';
        document.getElementById('postImageInput').value = '';
    },

    /**
     * Create new post
     */
    async createPost() {
        const content = document.getElementById('postContent').value.trim();
        const postType = document.getElementById('postType').value;
        const imageInput = document.getElementById('postImageInput');
        const submitBtn = document.getElementById('submitPostBtn');

        if (!content) {
            alert('Vui lòng nhập nội dung');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng...';

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('post_type', postType);
            formData.append('csrf_token', API.csrfToken);

            // Append multiple images
            this.selectedImages.forEach((file, index) => {
                formData.append('images[]', file);
            });

            const response = await fetch('/api/community/post.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.post) {
                this.closePostModal();
                this.clearAllImages();

                // Add new post to top of feed
                const feed = document.getElementById('postsFeed');
                const emptyState = feed.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }

                feed.insertAdjacentHTML('afterbegin', this.renderPost(data.post));
            } else {
                alert(data.message || 'Không thể đăng bài');
            }
        } catch (error) {
            console.error('Create post error:', error);
            alert('Có lỗi xảy ra');
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Đăng bài';
    },

    /**
     * Toggle like on post
     */
    async toggleLike(postId, btn) {
        try {
            const response = await API.post('/community/like.php', {
                post_id: postId,
                csrf_token: API.csrfToken
            });

            if (response.success) {
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                const likesCount = postCard.querySelector('.likes-count');

                btn.classList.toggle('liked', response.is_liked);
                likesCount.textContent = response.likes_count;
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    },

    /**
     * Toggle comments section
     */
    async toggleComments(postId) {
        const section = document.getElementById(`comments-${postId}`);
        const isVisible = section.style.display !== 'none';

        if (isVisible) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
            this.loadComments(postId);
        }
    },

    /**
     * Load comments for a post
     */
    async loadComments(postId) {
        const list = document.getElementById(`commentsList-${postId}`);
        list.innerHTML = '<div class="loading-small"><i class="fas fa-spinner fa-spin"></i></div>';

        try {
            const response = await API.get(`/community/comments.php?post_id=${postId}`);

            if (response.success) {
                if (response.comments.length === 0) {
                    list.innerHTML = '<div class="no-comments">Chưa có bình luận</div>';
                } else {
                    list.innerHTML = response.comments.map(c => this.renderComment(c)).join('');
                }
            }
        } catch (error) {
            console.error('Load comments error:', error);
            list.innerHTML = '<div class="text-muted">Không thể tải bình luận</div>';
        }
    },

    /**
     * Render a single comment
     */
    renderComment(comment, isReply = false) {
        const repliesHtml = comment.replies && comment.replies.length > 0
            ? `<div class="comment-replies">
                ${comment.replies.map(r => this.renderComment(r, true)).join('')}
               </div>`
            : '';

        return `
            <div class="comment-item ${isReply ? 'is-reply' : ''}" data-comment-id="${comment.id}">
                <div class="comment-avatar">
                    ${comment.avatar
                ? `<img src="${comment.avatar}" alt="${comment.display_name}">`
                : '<i class="fas fa-user"></i>'
            }
                </div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">${comment.display_name}</span>
                        <span class="comment-time">${comment.time_ago}</span>
                        ${comment.is_owner ? `
                            <button class="comment-delete" onclick="Community.deleteComment(${comment.id}, ${comment.post_id})">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="comment-content">${comment.content}</div>
                    ${!isReply ? `
                        <button class="comment-reply-btn" onclick="Community.showReplyForm(${comment.id}, ${comment.post_id})">
                            <i class="fas fa-reply"></i> Trả lời
                        </button>
                        <div class="reply-form" id="replyForm-${comment.id}" style="display: none;">
                            <input type="text" placeholder="Viết trả lời..." 
                                   id="replyInput-${comment.id}"
                                   onkeypress="if(event.key==='Enter') Community.addReply(${comment.post_id}, ${comment.id})">
                            <button onclick="Community.addReply(${comment.post_id}, ${comment.id})">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${repliesHtml}
        `;
    },

    /**
     * Show reply form
     */
    showReplyForm(commentId, postId) {
        const form = document.getElementById(`replyForm-${commentId}`);
        const isVisible = form.style.display !== 'none';

        // Hide all other reply forms
        document.querySelectorAll('.reply-form').forEach(f => f.style.display = 'none');

        if (!isVisible) {
            form.style.display = 'flex';
            document.getElementById(`replyInput-${commentId}`).focus();
        }
    },

    /**
     * Add a reply to a comment
     */
    async addReply(postId, parentId) {
        const input = document.getElementById(`replyInput-${parentId}`);
        const content = input.value.trim();

        if (!content) return;

        input.disabled = true;

        try {
            const response = await API.post('/community/comments.php', {
                post_id: postId,
                content: content,
                parent_id: parentId,
                csrf_token: API.csrfToken
            });

            if (response.success && response.comment) {
                // Reload comments to show the new reply
                this.loadComments(postId);

                // Update comment count
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                const countEl = postCard.querySelector('.comments-count');
                countEl.textContent = parseInt(countEl.textContent) + 1;
            }
        } catch (error) {
            console.error('Add reply error:', error);
        }

        input.disabled = false;
    },

    /**
     * Add a new comment
     */
    async addComment(postId) {
        const input = document.getElementById(`commentInput-${postId}`);
        const content = input.value.trim();

        if (!content) return;

        input.disabled = true;

        try {
            const response = await API.post('/community/comments.php', {
                post_id: postId,
                content: content,
                csrf_token: API.csrfToken
            });

            if (response.success && response.comment) {
                const list = document.getElementById(`commentsList-${postId}`);
                const noComments = list.querySelector('.no-comments');
                if (noComments) noComments.remove();

                list.insertAdjacentHTML('beforeend', this.renderComment(response.comment));
                input.value = '';

                // Update comment count
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                const countEl = postCard.querySelector('.comments-count');
                countEl.textContent = parseInt(countEl.textContent) + 1;
            }
        } catch (error) {
            console.error('Add comment error:', error);
        }

        input.disabled = false;
        input.focus();
    },

    /**
     * Delete a comment
     */
    async deleteComment(commentId, postId) {
        if (!confirm('Xóa bình luận này?')) return;

        try {
            const response = await API.delete('/community/comments.php', {
                comment_id: commentId
            });

            if (response.success) {
                document.querySelector(`[data-comment-id="${commentId}"]`).remove();

                // Update comment count
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                const countEl = postCard.querySelector('.comments-count');
                countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
            }
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    },

    /**
     * Delete a post
     */
    async deletePost(postId) {
        if (!confirm('Xóa bài viết này?')) return;

        try {
            const response = await API.delete('/community/post.php', {
                post_id: postId
            });

            if (response.success) {
                document.querySelector(`[data-post-id="${postId}"]`).remove();
            }
        } catch (error) {
            console.error('Delete post error:', error);
        }
    },

    /**
     * Format post content
     */
    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    },

    /**
     * Render post images (single or multiple)
     */
    renderPostImages(imagePath) {
        if (!imagePath) return '';

        let images = [];

        // Check if it's JSON array or single path
        if (imagePath.startsWith('[')) {
            try {
                images = JSON.parse(imagePath);
            } catch (e) {
                images = [imagePath];
            }
        } else {
            images = [imagePath];
        }

        if (images.length === 0) return '';

        if (images.length === 1) {
            return `
                <div class="post-image" onclick="Community.openLightbox('${images[0]}')">
                    <img src="${images[0]}" alt="Post image" loading="lazy">
                </div>
            `;
        }

        // Multiple images - create grid gallery
        const gridClass = images.length === 2 ? 'grid-2' :
            images.length === 3 ? 'grid-3' :
                images.length === 4 ? 'grid-4' : 'grid-5';

        return `
            <div class="post-images-gallery ${gridClass}">
                ${images.map((img, i) => `
                    <div class="gallery-item" onclick="Community.openLightbox('${img}')">
                        <img src="${img}" alt="Post image ${i + 1}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Open image lightbox
     */
    openLightbox(imageSrc) {
        // Create lightbox if not exists
        let lightbox = document.getElementById('imageLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'imageLightbox';
            lightbox.className = 'image-lightbox';
            lightbox.innerHTML = `
                <button class="lightbox-close" onclick="Community.closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                <img id="lightboxImage" src="" alt="Full image">
            `;
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
            document.body.appendChild(lightbox);
        }

        document.getElementById('lightboxImage').src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close image lightbox
     */
    closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * View user profile
     */
    async viewUserProfile(userId) {
        try {
            const result = await API.get(`/profile/user-profile.php?user_id=${userId}`);

            if (result.success && result.user) {
                // Check friendship status
                let friendshipStatus = null;
                try {
                    const friendResult = await API.get(`/friends/status?user_id=${userId}`);
                    friendshipStatus = friendResult.status || null;
                } catch (e) {
                    console.log('Could not get friendship status');
                }

                this.renderUserProfileModal(result.user, friendshipStatus);
            } else {
                alert('Không thể tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            alert('Lỗi khi tải thông tin người dùng');
        }
    },

    /**
     * Render user profile modal
     */
    renderUserProfileModal(user, friendshipStatus = null) {
        // Remove existing modal
        const existingModal = document.getElementById('userProfileModal');
        if (existingModal) existingModal.remove();

        const isFriend = friendshipStatus === 'accepted';

        // Parse social links
        const socialLinks = user.social_links || {};
        const socialIcons = {
            facebook: 'fab fa-facebook',
            instagram: 'fab fa-instagram',
            twitter: 'fab fa-twitter',
            youtube: 'fab fa-youtube',
            tiktok: 'fab fa-tiktok'
        };

        let socialHtml = '';
        for (const [platform, url] of Object.entries(socialLinks)) {
            if (url) {
                socialHtml += `<a href="${url}" target="_blank" class="social-link-btn"><i class="${socialIcons[platform] || 'fas fa-link'}"></i></a>`;
            }
        }

        const currentUserId = Auth.getUser()?.id;
        const isOwnProfile = currentUserId == user.id;

        const modalHtml = `
            <div class="modal-overlay active" id="userProfileModal" onclick="Community.closeUserProfileModal(event)">
                <div class="modal user-profile-modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="Community.closeUserProfileModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="user-profile-header">
                        <div class="user-profile-avatar">
                            ${user.avatar
                ? `<img src="${user.avatar}" alt="${user.display_name}">`
                : '<i class="fas fa-user"></i>'
            }
                        </div>
                        <h2 class="user-profile-name">${user.display_name}</h2>
                    </div>
                    
                    ${user.bio ? `
                        <div class="user-profile-bio">
                            <p>${user.bio}</p>
                        </div>
                    ` : ''}
                    
                    <div class="user-profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${user.post_count || 0}</span>
                            <span class="stat-label">Bài viết</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value"><i class="fas fa-calendar-alt"></i></span>
                            <span class="stat-label">${user.member_since}</span>
                        </div>
                    </div>
                    
                    ${socialHtml ? `
                        <div class="user-profile-social">
                            ${socialHtml}
                        </div>
                    ` : ''}
                    
                    ${!isOwnProfile ? `
                        <div class="user-profile-actions">
                            ${!isFriend ? `
                                <button class="btn btn-primary" onclick="Community.addFriendFromProfile(${user.id})">
                                    <i class="fas fa-user-plus"></i> Kết bạn
                                </button>
                            ` : `
                                <button class="btn btn-success" disabled>
                                    <i class="fas fa-user-check"></i> Bạn bè
                                </button>
                            `}
                            ${isFriend ? `
                                <button class="btn btn-outline" onclick="Community.closeUserProfileModal(); App.navigate('chat'); setTimeout(() => Chat.openChat(${user.id}), 200)">
                                    <i class="fas fa-comment"></i> Nhắn tin
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close user profile modal
     */
    closeUserProfileModal(event) {
        if (event && event.target.id !== 'userProfileModal') return;

        const modal = document.getElementById('userProfileModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    /**
     * Add friend from profile modal
     */
    async addFriendFromProfile(userId) {
        try {
            const result = await API.post('/friends.php', { friend_id: userId });
            if (result.success) {
                App.showNotification(result.message, 'success');
                // Update button to show pending state
                const btn = document.querySelector('.user-profile-actions .btn-primary');
                if (btn) {
                    btn.outerHTML = '<span class="badge badge-warning"><i class="fas fa-clock"></i> Đã gửi lời mời</span>';
                }
            }
        } catch (e) {
            App.showNotification(e.message, 'error');
        }
    }
};
