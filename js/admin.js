/**
 * FitAI - Admin Module
 * 
 * Admin dashboard for managing users, posts, and exercises
 */

const Admin = {
    currentTab: 'overview',
    usersPage: 1,
    postsPage: 1,
    exercisesPage: 1,
    categoriesPage: 1,
    productsPage: 1,
    ordersPage: 1,

    /**
     * Render admin page
     */
    renderAdminPage() {
        return `
            <div class="admin-page">
                <div class="container">
                    <div class="admin-header">
                        <h1><i class="fas fa-shield-alt"></i> Admin Dashboard</h1>
                        <p class="text-muted">Quản lý hệ thống FitAI</p>
                    </div>
                    
                    <div class="admin-tabs">
                        <button class="admin-tab active" data-tab="overview">
                            <i class="fas fa-chart-pie"></i> Tổng quan
                        </button>
                        <button class="admin-tab" data-tab="users">
                            <i class="fas fa-users"></i> Người dùng
                        </button>
                        <button class="admin-tab" data-tab="posts">
                            <i class="fas fa-newspaper"></i> Bài viết
                        </button>
                        <button class="admin-tab" data-tab="exercises">
                            <i class="fas fa-dumbbell"></i> Bài tập
                        </button>
                        <button class="admin-tab" data-tab="market">
                            <i class="fas fa-store"></i> Market
                        </button>
                        <button class="admin-tab" data-tab="ads">
                            <i class="fas fa-ad"></i> Ads
                        </button>
                        <button class="admin-tab" data-tab="music">
                            <i class="fas fa-music"></i> Music
                        </button>
                        <button class="admin-tab" data-tab="settings">
                            <i class="fas fa-cog"></i> Settings
                        </button>
                    </div>
                    
                    <div class="admin-content" id="adminContent">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize admin page
     */
    initAdminPage() {
        this.bindEvents();
        this.loadOverview();
    },

    /**
     * Bind events
     */
    bindEvents() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.loadTab(this.currentTab);
            });
        });
    },

    /**
     * Load tab content
     */
    loadTab(tab) {
        switch (tab) {
            case 'overview':
                this.loadOverview();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'posts':
                this.loadPosts();
                break;
            case 'exercises':
                this.loadExercises();
                break;
            case 'market':
                this.loadMarketOverview();
                break;
            case 'ads':
                this.loadAds();
                break;
            case 'music':
                this.loadMusic();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    /**
     * Load overview stats
     */
    async loadOverview() {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/admin/stats.php');

            if (result.success) {
                const stats = result.stats;
                content.innerHTML = `
                    <div class="admin-stats-grid">
                        <div class="admin-stat-card">
                            <div class="stat-icon users"><i class="fas fa-users"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.total_users}</div>
                                <div class="stat-label">Tổng người dùng</div>
                            </div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="stat-icon new"><i class="fas fa-user-plus"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.users_today}</div>
                                <div class="stat-label">Mới hôm nay</div>
                            </div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="stat-icon banned"><i class="fas fa-user-slash"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.banned_users}</div>
                                <div class="stat-label">Đã khóa</div>
                            </div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="stat-icon posts"><i class="fas fa-newspaper"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.total_posts}</div>
                                <div class="stat-label">Bài viết</div>
                            </div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="stat-icon plans"><i class="fas fa-calendar-alt"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.total_plans}</div>
                                <div class="stat-label">Kế hoạch tập</div>
                            </div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="stat-icon exercises"><i class="fas fa-dumbbell"></i></div>
                            <div class="stat-info">
                                <div class="stat-value">${stats.total_exercises}</div>
                                <div class="stat-label">Bài tập</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3><i class="fas fa-clock"></i> Người dùng mới nhất</h3>
                        <div class="admin-table-wrapper">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Email</th>
                                        <th>Ngày tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${result.recent_users.map(u => `
                                        <tr>
                                            <td>${u.id}</td>
                                            <td>${u.email}</td>
                                            <td>${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Không thể tải thống kê: ${error.message}</div>`;
        }
    },

    /**
     * Load users list
     */
    async loadUsers(page = 1) {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        this.usersPage = page;

        try {
            const result = await API.get(`/admin/users.php?page=${page}`);

            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="userSearch" placeholder="Tìm theo email hoặc ID...">
                        </div>
                    </div>
                    
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Avatar</th>
                                    <th>Email</th>
                                    <th>Tên hiển thị</th>
                                    <th>Ngày tạo</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.users.map(u => `
                                    <tr class="${u.is_banned ? 'banned-row' : ''}">
                                        <td>${u.id}</td>
                                        <td>
                                            <div class="table-avatar">
                                                ${u.avatar ? `<img src="${u.avatar}" alt="">` : '<i class="fas fa-user"></i>'}
                                            </div>
                                        </td>
                                        <td>${u.email}</td>
                                        <td>${u.display_name}</td>
                                        <td>${u.created_at_formatted}</td>
                                        <td>
                                            ${u.is_admin ? '<span class="badge admin">Admin</span>' : ''}
                                            ${u.is_banned ? '<span class="badge banned">Đã khóa</span>' : '<span class="badge active">Hoạt động</span>'}
                                        </td>
                                        <td>
                                            ${!u.is_admin ? `
                                                <button class="btn-action ${u.is_banned ? 'unban' : 'ban'}" 
                                                        onclick="Admin.toggleBan(${u.id}, '${u.is_banned ? 'unban' : 'ban'}')">
                                                    <i class="fas fa-${u.is_banned ? 'unlock' : 'ban'}"></i>
                                                </button>
                                                <button class="btn-action delete" onclick="Admin.deleteUser(${u.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${this.renderPagination(result.page, result.total_pages, 'loadUsers')}
                `;

                // Bind search
                document.getElementById('userSearch').addEventListener('keyup', this.debounce(() => {
                    this.searchUsers();
                }, 500));
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Không thể tải danh sách: ${error.message}</div>`;
        }
    },

    /**
     * Search users
     */
    async searchUsers() {
        const search = document.getElementById('userSearch').value;
        const content = document.getElementById('adminContent');

        try {
            const result = await API.get(`/admin/users.php?search=${encodeURIComponent(search)}`);
            if (result.success) {
                const tbody = content.querySelector('tbody');
                tbody.innerHTML = result.users.map(u => `
                    <tr class="${u.is_banned ? 'banned-row' : ''}">
                        <td>${u.id}</td>
                        <td>
                            <div class="table-avatar">
                                ${u.avatar ? `<img src="${u.avatar}" alt="">` : '<i class="fas fa-user"></i>'}
                            </div>
                        </td>
                        <td>${u.email}</td>
                        <td>${u.display_name}</td>
                        <td>${u.created_at_formatted}</td>
                        <td>
                            ${u.is_admin ? '<span class="badge admin">Admin</span>' : ''}
                            ${u.is_banned ? '<span class="badge banned">Đã khóa</span>' : '<span class="badge active">Hoạt động</span>'}
                        </td>
                        <td>
                            ${!u.is_admin ? `
                                <button class="btn-action ${u.is_banned ? 'unban' : 'ban'}" 
                                        onclick="Admin.toggleBan(${u.id}, '${u.is_banned ? 'unban' : 'ban'}')">
                                    <i class="fas fa-${u.is_banned ? 'unlock' : 'ban'}"></i>
                                </button>
                                <button class="btn-action delete" onclick="Admin.deleteUser(${u.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    },

    /**
     * Toggle user ban status
     */
    async toggleBan(userId, action) {
        const actionText = action === 'ban' ? 'khóa' : 'mở khóa';
        if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) return;

        try {
            const result = await API.post('/admin/users.php', { user_id: userId, action });
            if (result.success) {
                alert(result.message);
                this.loadUsers(this.usersPage);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Delete user
     */
    async deleteUser(userId) {
        if (!confirm('Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản này? Không thể hoàn tác!')) return;

        try {
            const result = await API.delete('/admin/users.php', { user_id: userId });
            if (result.success) {
                alert(result.message);
                this.loadUsers(this.usersPage);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Load posts list
     */
    async loadPosts(page = 1) {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        this.postsPage = page;

        try {
            const result = await API.get(`/admin/posts.php?page=${page}`);

            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <select id="postTypeFilter" onchange="Admin.filterPosts()">
                            <option value="all">Tất cả loại</option>
                            <option value="question">Hỏi đáp</option>
                            <option value="achievement">Thành tựu</option>
                            <option value="general">Chung</option>
                        </select>
                    </div>
                    
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tác giả</th>
                                    <th>Nội dung</th>
                                    <th>Loại</th>
                                    <th>Likes</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="postsTableBody">
                                ${this.renderPostsRows(result.posts)}
                            </tbody>
                        </table>
                    </div>
                    
                    ${this.renderPagination(result.page, result.total_pages, 'loadPosts')}
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Không thể tải bài viết: ${error.message}</div>`;
        }
    },

    renderPostsRows(posts) {
        return posts.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>
                    <div class="author-cell">
                        <div class="table-avatar">
                            ${p.avatar ? `<img src="${p.avatar}" alt="">` : '<i class="fas fa-user"></i>'}
                        </div>
                        <span>${p.display_name}</span>
                    </div>
                </td>
                <td class="content-cell">${p.content_preview}</td>
                <td><span class="badge type-${p.post_type}">${p.post_type}</span></td>
                <td>${p.likes_count}</td>
                <td>${p.created_at_formatted}</td>
                <td>
                    <button class="btn-action delete" onclick="Admin.deletePost(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async filterPosts() {
        const type = document.getElementById('postTypeFilter').value;

        try {
            const result = await API.get(`/admin/posts.php?type=${type}`);
            if (result.success) {
                document.getElementById('postsTableBody').innerHTML = this.renderPostsRows(result.posts);
            }
        } catch (error) {
            console.error('Filter error:', error);
        }
    },

    async deletePost(postId) {
        if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

        try {
            const result = await API.delete('/admin/posts.php', { post_id: postId });
            if (result.success) {
                alert(result.message);
                this.loadPosts(this.postsPage);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Load exercises list
     */
    async loadExercises(page = 1) {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        this.exercisesPage = page;

        try {
            const result = await API.get(`/admin/exercises.php?page=${page}`);

            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <select id="muscleGroupFilter" onchange="Admin.filterExercises()">
                            <option value="">Tất cả nhóm cơ</option>
                            ${result.muscle_groups.map(g => `<option value="${g}">${g}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="Admin.showExerciseModal()">
                            <i class="fas fa-plus"></i> Thêm bài tập
                        </button>
                    </div>
                    
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên bài tập</th>
                                    <th>Nhóm cơ</th>
                                    <th>Thiết bị</th>
                                    <th>Độ khó</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="exercisesTableBody">
                                ${this.renderExercisesRows(result.exercises)}
                            </tbody>
                        </table>
                    </div>
                    
                    ${this.renderPagination(result.page, result.total_pages, 'loadExercises')}
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Không thể tải bài tập: ${error.message}</div>`;
        }
    },

    renderExercisesRows(exercises) {
        return exercises.map(e => `
            <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td><span class="badge muscle">${e.muscle_group}</span></td>
                <td>${e.equipment || 'none'}</td>
                <td><span class="badge diff-${e.difficulty}">${e.difficulty}</span></td>
                <td>
                    <button class="btn-action edit" onclick='Admin.showExerciseModal(${JSON.stringify(e)})'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="Admin.deleteExercise(${e.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async filterExercises() {
        const muscleGroup = document.getElementById('muscleGroupFilter').value;

        try {
            const result = await API.get(`/admin/exercises.php?muscle_group=${encodeURIComponent(muscleGroup)}`);
            if (result.success) {
                document.getElementById('exercisesTableBody').innerHTML = this.renderExercisesRows(result.exercises);
            }
        } catch (error) {
            console.error('Filter error:', error);
        }
    },

    showExerciseModal(exercise = null) {
        const isEdit = exercise !== null;
        const modalHtml = `
            <div class="modal-overlay active" id="exerciseModal" onclick="Admin.closeExerciseModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="Admin.closeExerciseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>${isEdit ? 'Sửa bài tập' : 'Thêm bài tập mới'}</h2>
                    
                    <form id="exerciseForm">
                        <input type="hidden" id="exerciseId" value="${exercise?.id || ''}">
                        
                        <div class="form-group">
                            <label class="form-label">Tên bài tập *</label>
                            <input type="text" class="form-input" id="exerciseName" 
                                   value="${exercise?.name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Nhóm cơ *</label>
                            <select class="form-input" id="exerciseMuscle" required>
                                <option value="">Chọn nhóm cơ</option>
                                ${['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio']
                .map(g => `<option value="${g}" ${exercise?.muscle_group === g ? 'selected' : ''}>${g}</option>`)
                .join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Thiết bị</label>
                            <select class="form-input" id="exerciseEquipment">
                                ${['none', 'home', 'gym'].map(e =>
                    `<option value="${e}" ${exercise?.equipment === e ? 'selected' : ''}>${e}</option>`
                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Độ khó</label>
                            <select class="form-input" id="exerciseDifficulty">
                                ${['beginner', 'intermediate', 'advanced'].map(d =>
                    `<option value="${d}" ${exercise?.difficulty === d ? 'selected' : ''}>${d}</option>`
                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mô tả</label>
                            <textarea class="form-input" id="exerciseDesc" rows="3">${exercise?.description || ''}</textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        document.getElementById('exerciseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExercise();
        });
    },

    closeExerciseModal(event) {
        if (event && event.target.id !== 'exerciseModal') return;
        const modal = document.getElementById('exerciseModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    async saveExercise() {
        const data = {
            id: document.getElementById('exerciseId').value || null,
            name: document.getElementById('exerciseName').value,
            muscle_group: document.getElementById('exerciseMuscle').value,
            equipment: document.getElementById('exerciseEquipment').value,
            difficulty: document.getElementById('exerciseDifficulty').value,
            description: document.getElementById('exerciseDesc').value
        };

        try {
            const result = await API.post('/admin/exercises.php', data);
            if (result.success) {
                alert(result.message);
                this.closeExerciseModal();
                this.loadExercises(this.exercisesPage);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async deleteExercise(exerciseId) {
        if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;

        try {
            const result = await API.delete('/admin/exercises.php', { exercise_id: exerciseId });
            if (result.success) {
                alert(result.message);
                this.loadExercises(this.exercisesPage);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Render pagination
     */
    renderPagination(current, total, loadFn) {
        if (total <= 1) return '';

        let pages = '';
        for (let i = 1; i <= total; i++) {
            pages += `<button class="page-btn ${i === current ? 'active' : ''}" 
                             onclick="Admin.${loadFn}(${i})">${i}</button>`;
        }

        return `<div class="pagination">${pages}</div>`;
    },

    /**
     * Debounce helper
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ==================== MARKET MANAGEMENT ====================

    /**
     * Load market overview with sub-tabs
     */
    async loadMarketOverview() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="market-admin">
                <div class="market-sub-tabs">
                    <button class="sub-tab active" data-subtab="categories" onclick="Admin.loadMarketTab('categories')">
                        <i class="fas fa-list"></i> Danh mục
                    </button>
                    <button class="sub-tab" data-subtab="products" onclick="Admin.loadMarketTab('products')">
                        <i class="fas fa-box"></i> Sản phẩm
                    </button>
                    <button class="sub-tab" data-subtab="orders" onclick="Admin.loadMarketTab('orders')">
                        <i class="fas fa-shopping-cart"></i> Đơn hàng
                    </button>
                </div>
                <div id="marketContent">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        `;
        this.loadCategories();
    },

    loadMarketTab(tab) {
        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-subtab="${tab}"]`).classList.add('active');

        switch (tab) {
            case 'categories': this.loadCategories(); break;
            case 'products': this.loadProducts(); break;
            case 'orders': this.loadOrders(); break;
        }
    },

    /**
     * Load categories
     */
    async loadCategories() {
        const content = document.getElementById('marketContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/admin/market/categories.php');
            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <button class="btn btn-primary" onclick="Admin.showCategoryModal()">
                            <i class="fas fa-plus"></i> Thêm danh mục
                        </button>
                    </div>
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên</th>
                                    <th>Mô tả</th>
                                    <th>Sản phẩm</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.categories.map(c => `
                                    <tr>
                                        <td>${c.id}</td>
                                        <td><strong>${c.name}</strong></td>
                                        <td class="content-cell">${c.description || '-'}</td>
                                        <td>${c.product_count || 0}</td>
                                        <td>
                                            <span class="badge ${c.is_active ? 'active' : 'banned'}">
                                                ${c.is_active ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn-action edit" onclick='Admin.showCategoryModal(${JSON.stringify(c)})'>
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-action delete" onclick="Admin.deleteCategory(${c.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Lỗi: ${error.message}</div>`;
        }
    },

    showCategoryModal(category = null) {
        const isEdit = category !== null;
        const html = `
            <div class="modal-overlay active" id="categoryModal" onclick="Admin.closeCategoryModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="Admin.closeCategoryModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>${isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
                    <form id="categoryForm">
                        <input type="hidden" id="categoryId" value="${category?.id || ''}">
                        <div class="form-group">
                            <label class="form-label">Tên danh mục *</label>
                            <input type="text" class="form-input" id="categoryName" value="${category?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mô tả</label>
                            <textarea class="form-input" id="categoryDesc" rows="3">${category?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="categoryActive" ${category?.is_active !== 0 ? 'checked' : ''}>
                                Hiển thị danh mục
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
        document.getElementById('categoryForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveCategory();
        };
    },

    closeCategoryModal(event) {
        if (event && event.target.id !== 'categoryModal') return;
        document.getElementById('categoryModal')?.remove();
        document.body.style.overflow = '';
    },

    async saveCategory() {
        const data = {
            id: document.getElementById('categoryId').value || null,
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDesc').value,
            is_active: document.getElementById('categoryActive').checked ? 1 : 0
        };

        try {
            const result = await API.post('/admin/market/categories.php', data);
            if (result.success) {
                alert(result.message);
                this.closeCategoryModal();
                this.loadCategories();
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async deleteCategory(id) {
        if (!confirm('Xóa danh mục này?')) return;
        try {
            await API.delete('/admin/market/categories.php', { id });
            this.loadCategories();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Load products
     */
    async loadProducts(page = 1) {
        const content = document.getElementById('marketContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        this.productsPage = page;

        try {
            const result = await API.get(`/admin/market/products.php?page=${page}`);
            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <select id="productCategoryFilter" onchange="Admin.filterProducts()">
                            <option value="">Tất cả danh mục</option>
                            ${result.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="Admin.showProductModal()">
                            <i class="fas fa-plus"></i> Thêm sản phẩm
                        </button>
                    </div>
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ảnh</th>
                                    <th>Tên</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Kho</th>
                                    <th>Đã bán</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                ${this.renderProductsRows(result.products)}
                            </tbody>
                        </table>
                    </div>
                    ${this.renderPagination(result.page, result.total_pages, 'loadProducts')}
                `;
                this.productCategories = result.categories;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Lỗi: ${error.message}</div>`;
        }
    },

    renderProductsRows(products) {
        return products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>
                    <div class="table-avatar">
                        ${p.primary_image ? `<img src="${p.primary_image}" alt="">` : '<i class="fas fa-image"></i>'}
                    </div>
                </td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category_name || '-'}</td>
                <td>
                    ${p.sale_price ? `<s>${Number(p.price).toLocaleString()}đ</s> <span class="text-primary">${Number(p.sale_price).toLocaleString()}đ</span>` : `${Number(p.price).toLocaleString()}đ`}
                </td>
                <td>${p.stock}</td>
                <td>${p.sold_count}</td>
                <td>
                    <button class="btn-action edit" onclick="Admin.showProductModal(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="Admin.deleteProduct(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async filterProducts() {
        const categoryId = document.getElementById('productCategoryFilter').value;
        try {
            const result = await API.get(`/admin/market/products.php?category_id=${categoryId}`);
            if (result.success) {
                document.getElementById('productsTableBody').innerHTML = this.renderProductsRows(result.products);
            }
        } catch (error) {
            console.error(error);
        }
    },

    async showProductModal(productId = null) {
        // Get categories first
        let categories = this.productCategories || [];
        if (!categories.length) {
            const res = await API.get('/admin/market/categories.php');
            categories = res.categories || [];
        }

        let product = null;
        if (productId) {
            const res = await API.get(`/market/products.php?id=${productId}`);
            product = res.product;
        }

        const isEdit = product !== null;
        const html = `
            <div class="modal-overlay active" id="productModal" onclick="Admin.closeProductModal(event)">
                <div class="modal" onclick="event.stopPropagation()" style="max-width: 600px;">
                    <button class="modal-close" onclick="Admin.closeProductModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>${isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                    <form id="productForm" enctype="multipart/form-data">
                        <input type="hidden" id="productId" value="${product?.id || ''}">
                        
                        <div class="form-group">
                            <label class="form-label">Tên sản phẩm *</label>
                            <input type="text" class="form-input" id="productName" value="${product?.name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Danh mục *</label>
                            <select class="form-input" id="productCategory" required>
                                <option value="">Chọn danh mục</option>
                                ${categories.map(c => `<option value="${c.id}" ${product?.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Giá gốc *</label>
                                <input type="number" class="form-input" id="productPrice" value="${product?.price || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Giá sale</label>
                                <input type="number" class="form-input" id="productSalePrice" value="${product?.sale_price || ''}">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Kho hàng</label>
                                <input type="number" class="form-input" id="productStock" value="${product?.stock || 0}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tags (cách bởi dấu phẩy)</label>
                                <input type="text" class="form-input" id="productTags" value="${product?.tags || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mô tả</label>
                            <textarea class="form-input" id="productDesc" rows="4">${product?.description || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Hình ảnh (có thể chọn nhiều)</label>
                            <input type="file" class="form-input" id="productImages" multiple accept="image/*">
                            ${product?.images?.length ? `
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                                    ${product.images.map(img => `
                                        <img src="${img.image_path}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
        document.getElementById('productForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveProduct();
        };
    },

    closeProductModal(event) {
        if (event && event.target.id !== 'productModal') return;
        document.getElementById('productModal')?.remove();
        document.body.style.overflow = '';
    },

    async saveProduct() {
        const formData = new FormData();
        formData.append('id', document.getElementById('productId').value || '');
        formData.append('name', document.getElementById('productName').value);
        formData.append('category_id', document.getElementById('productCategory').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('sale_price', document.getElementById('productSalePrice').value || '');
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('tags', document.getElementById('productTags').value);
        formData.append('description', document.getElementById('productDesc').value);

        const files = document.getElementById('productImages').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images[]', files[i]);
        }

        try {
            const response = await fetch('/api/admin/market/products.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                this.closeProductModal();
                this.loadProducts(this.productsPage);
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async deleteProduct(id) {
        if (!confirm('Xóa sản phẩm này?')) return;
        try {
            await API.delete('/admin/market/products.php', { id });
            this.loadProducts(this.productsPage);
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Load orders
     */
    async loadOrders(page = 1) {
        const content = document.getElementById('marketContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        this.ordersPage = page;

        try {
            const result = await API.get(`/admin/market/orders.php?page=${page}`);
            if (result.success) {
                const statusLabels = {
                    pending: 'Chờ xác nhận',
                    confirmed: 'Đã xác nhận',
                    shipping: 'Đang giao',
                    delivered: 'Đã giao',
                    cancelled: 'Đã hủy'
                };

                content.innerHTML = `
                    <div class="admin-toolbar">
                        <select id="orderStatusFilter" onchange="Admin.filterOrders()">
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận (${result.status_counts?.pending || 0})</option>
                            <option value="confirmed">Đã xác nhận (${result.status_counts?.confirmed || 0})</option>
                            <option value="shipping">Đang giao (${result.status_counts?.shipping || 0})</option>
                            <option value="delivered">Đã giao (${result.status_counts?.delivered || 0})</option>
                            <option value="cancelled">Đã hủy (${result.status_counts?.cancelled || 0})</option>
                        </select>
                    </div>
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>SP</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đặt</th>
                                    <th>Cập nhật</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                ${result.orders.map(o => `
                                    <tr>
                                        <td><strong>${o.order_code}</strong></td>
                                        <td>${o.display_name || o.user_email}</td>
                                        <td class="text-primary">${o.total_formatted}</td>
                                        <td>${o.item_count}</td>
                                        <td><span class="badge status-${o.status}">${statusLabels[o.status]}</span></td>
                                        <td>${o.created_at_formatted}</td>
                                        <td>
                                            <select class="form-input" style="width: auto; padding: 4px 8px; font-size: 0.85rem;"
                                                    onchange="Admin.updateOrderStatus(${o.id}, this.value)">
                                                ${['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map(s =>
                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`
                ).join('')}
                                            </select>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${this.renderPagination(result.page, result.total_pages, 'loadOrders')}
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Lỗi: ${error.message}</div>`;
        }
    },

    async filterOrders() {
        const status = document.getElementById('orderStatusFilter').value;
        try {
            const result = await API.get(`/admin/market/orders.php?status=${status}`);
            if (result.success) {
                const statusLabels = {
                    pending: 'Chờ xác nhận',
                    confirmed: 'Đã xác nhận',
                    shipping: 'Đang giao',
                    delivered: 'Đã giao',
                    cancelled: 'Đã hủy'
                };
                document.getElementById('ordersTableBody').innerHTML = result.orders.map(o => `
                    <tr>
                        <td><strong>${o.order_code}</strong></td>
                        <td>${o.display_name || o.user_email}</td>
                        <td class="text-primary">${o.total_formatted}</td>
                        <td>${o.item_count}</td>
                        <td><span class="badge status-${o.status}">${statusLabels[o.status]}</span></td>
                        <td>${o.created_at_formatted}</td>
                        <td>
                            <select class="form-input" style="width: auto; padding: 4px 8px; font-size: 0.85rem;"
                                    onchange="Admin.updateOrderStatus(${o.id}, this.value)">
                                ${['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map(s =>
                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`
                ).join('')}
                            </select>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error(error);
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const result = await API.post('/admin/market/orders.php', { order_id: orderId, status });
            if (result.success) {
                alert(result.message);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
            this.loadOrders(this.ordersPage);
        }
    },

    // ==================== ADS MANAGEMENT ====================

    /**
     * Load ads list
     */
    async loadAds() {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/admin/ads.php');
            if (result.success) {
                content.innerHTML = `
                    <div class="admin-toolbar">
                        <button class="btn btn-primary" onclick="Admin.showAdModal()">
                            <i class="fas fa-plus"></i> Thêm quảng cáo
                        </button>
                    </div>
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th>Vị trí</th>
                                    <th>Views</th>
                                    <th>Clicks</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.ads.map(ad => `
                                    <tr>
                                        <td>${ad.id}</td>
                                        <td>
                                            <div class="table-avatar">
                                                ${ad.image_url ? `<img src="${ad.image_url}" alt="">` : '<i class="fas fa-image"></i>'}
                                            </div>
                                        </td>
                                        <td><strong>${ad.title}</strong></td>
                                        <td><span class="badge">${ad.position === 'sidebar_top' ? 'Top' : 'Bottom'}</span></td>
                                        <td>${ad.view_count || 0}</td>
                                        <td>${ad.click_count || 0}</td>
                                        <td>
                                            <span class="badge ${ad.is_active ? 'active' : 'banned'}">
                                                ${ad.is_active ? 'Hiện' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn-action edit" onclick='Admin.showAdModal(${JSON.stringify(ad)})'>
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-action delete" onclick="Admin.deleteAd(${ad.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${result.ads.length === 0 ? '<p class="text-muted text-center">Chưa có quảng cáo nào</p>' : ''}
                `;
            }
        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Lỗi: ${error.message}</div>`;
        }
    },

    showAdModal(ad = null) {
        const isEdit = ad !== null;
        const html = `
            <div class="modal-overlay active" id="adModal" onclick="Admin.closeAdModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="Admin.closeAdModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>${isEdit ? 'Sửa quảng cáo' : 'Thêm quảng cáo'}</h2>
                    <form id="adForm" enctype="multipart/form-data">
                        <input type="hidden" id="adId" value="${ad?.id || ''}">
                        <input type="hidden" id="existingImage" value="${ad?.image_url || ''}">
                        
                        <div class="form-group">
                            <label class="form-label">Tiêu đề *</label>
                            <input type="text" class="form-input" id="adTitle" value="${ad?.title || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Link URL</label>
                            <input type="url" class="form-input" id="adLink" value="${ad?.link_url || ''}" placeholder="https://...">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Vị trí</label>
                            <select class="form-input" id="adPosition">
                                <option value="sidebar_top" ${ad?.position === 'sidebar_top' ? 'selected' : ''}>Sidebar Top</option>
                                <option value="sidebar_bottom" ${ad?.position === 'sidebar_bottom' ? 'selected' : ''}>Sidebar Bottom</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Hình ảnh</label>
                            <input type="file" class="form-input" id="adImage" accept="image/*">
                            ${ad?.image_url ? `<img src="${ad.image_url}" style="max-width: 200px; margin-top: 0.5rem; border-radius: 8px;">` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="adActive" ${ad?.is_active !== 0 ? 'checked' : ''}>
                                Hiển thị quảng cáo
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
        document.getElementById('adForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveAd();
        };
    },

    closeAdModal(event) {
        if (event && event.target.id !== 'adModal') return;
        document.getElementById('adModal')?.remove();
        document.body.style.overflow = '';
    },

    async saveAd() {
        const formData = new FormData();
        formData.append('id', document.getElementById('adId').value || '');
        formData.append('title', document.getElementById('adTitle').value);
        formData.append('link_url', document.getElementById('adLink').value);
        formData.append('position', document.getElementById('adPosition').value);
        formData.append('is_active', document.getElementById('adActive').checked ? 1 : 0);
        formData.append('existing_image', document.getElementById('existingImage').value);

        const imageFile = document.getElementById('adImage').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('/api/admin/ads.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                this.closeAdModal();
                this.loadAds();
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async deleteAd(id) {
        if (!confirm('Xóa quảng cáo này?')) return;
        try {
            await API.delete('/admin/ads.php', { id });
            this.loadAds();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    // ==================== MUSIC MANAGEMENT ====================

    /**
     * Load music list
     */
    async loadMusic() {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/music/tracks');

            content.innerHTML = `
                <div class="admin-section">
                    <div class="section-header">
                        <h3><i class="fas fa-music"></i> Quản lý nhạc</h3>
                        <button class="btn btn-primary" onclick="Admin.showMusicModal()">
                            <i class="fas fa-plus"></i> Thêm nhạc
                        </button>
                    </div>
                    
                    <div class="categories-filter">
                        <button class="category-btn active" data-cat="">Tất cả</button>
                        ${(result.categories || []).map(c => `
                            <button class="category-btn" data-cat="${c.id}">${c.name}</button>
                        `).join('')}
                    </div>
                    
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cover</th>
                                    <th>Title</th>
                                    <th>Artist</th>
                                    <th>Category</th>
                                    <th>BPM</th>
                                    <th>Plays</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="musicTableBody">
                                ${this.renderMusicRows(result.tracks || [])}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Category filter events
            content.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    content.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const catId = btn.dataset.cat;
                    const params = catId ? { category_id: catId } : {};
                    const filtered = await API.get('/music/tracks', params);
                    document.getElementById('musicTableBody').innerHTML = this.renderMusicRows(filtered.tracks || []);
                });
            });

        } catch (error) {
            content.innerHTML = '<p class="text-muted">Lỗi tải danh sách nhạc</p>';
        }
    },

    renderMusicRows(tracks) {
        if (tracks.length === 0) {
            return '<tr><td colspan="8" class="text-center text-muted">Chưa có bài hát</td></tr>';
        }
        return tracks.map(t => `
            <tr>
                <td>${t.id}</td>
                <td><img src="${t.cover_image || '/images/default-album.png'}" class="thumb-sm" style="width:40px;height:40px;border-radius:4px;object-fit:cover;"></td>
                <td><strong>${t.title}</strong></td>
                <td>${t.artist || '-'}</td>
                <td><span class="badge">${t.category_name}</span></td>
                <td>${t.bpm || '-'}</td>
                <td>${t.play_count || 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="window.open('${t.file_url}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Admin.deleteMusic(${t.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async showMusicModal() {
        // Load categories first
        const result = await API.get('/music/tracks');
        const categories = result.categories || [];

        Modal.show({
            title: 'Thêm bài hát mới',
            body: `
                <form id="musicForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>Category *</label>
                        <select id="musicCategory" class="form-control" required>
                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="musicTitle" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Artist</label>
                        <input type="text" id="musicArtist" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>BPM (Beats per minute)</label>
                        <input type="number" id="musicBpm" class="form-control" min="60" max="200">
                    </div>
                    <div class="form-group">
                        <label>Audio File (MP3) *</label>
                        <input type="file" id="musicAudio" class="form-control" accept=".mp3,audio/mpeg" required>
                    </div>
                    <div class="form-group">
                        <label>Cover Image (Optional)</label>
                        <input type="file" id="musicCover" class="form-control" accept="image/*">
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
                <button class="btn btn-primary" onclick="Admin.saveMusic()">
                    <i class="fas fa-upload"></i> Upload
                </button>
            `
        });
    },

    async saveMusic() {
        const categoryId = document.getElementById('musicCategory').value;
        const title = document.getElementById('musicTitle').value.trim();
        const artist = document.getElementById('musicArtist').value.trim();
        const bpm = document.getElementById('musicBpm').value;
        const audioFile = document.getElementById('musicAudio').files[0];
        const coverFile = document.getElementById('musicCover').files[0];

        if (!categoryId || !title || !audioFile) {
            App.showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('category_id', categoryId);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('bpm', bpm);
        formData.append('audio', audioFile);
        if (coverFile) {
            formData.append('cover', coverFile);
        }
        formData.append('csrf_token', API.csrfToken || '');

        try {
            const response = await fetch('/api/music/tracks', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                Modal.hide();
                App.showNotification('Đã thêm bài hát thành công!', 'success');
                this.loadMusic();
            } else {
                App.showNotification(result.message || 'Lỗi upload', 'error');
            }
        } catch (e) {
            App.showNotification('Lỗi kết nối', 'error');
        }
    },

    async deleteMusic(id) {
        if (!confirm('Xóa bài hát này?')) return;
        try {
            await API.delete('/music/tracks', { id });
            this.loadMusic();
            App.showNotification('Đã xóa bài hát', 'info');
        } catch (error) {
            App.showNotification('Lỗi: ' + error.message, 'error');
        }
    },

    /**
     * Load Settings
     */
    async loadSettings() {
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/admin/settings');

            const settings = result.settings || {};

            content.innerHTML = `
                <div class="admin-section">
                    <div class="section-header">
                        <h3><i class="fas fa-cog"></i> Cài đặt hệ thống</h3>
                    </div>

                    <div class="card" style="max-width: 800px;">
                        <h4><i class="fas fa-envelope"></i> Cấu hình Gmail SMTP</h4>
                        <p class="text-muted">Cấu hình email để gửi mã xác thực quên mật khẩu</p>
                        
                        <form id="settingsForm">
                            <div class="settings-form-grid">
                                <div class="form-group">
                                    <label class="form-label">SMTP Host</label>
                                    <input type="text" class="form-control" id="smtp_host" 
                                           value="${settings.smtp_host?.value || 'smtp.gmail.com'}" required>
                                    <small class="text-muted">${settings.smtp_host?.description || 'SMTP server host'}</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">SMTP Port</label>
                                    <input type="number" class="form-control" id="smtp_port" 
                                           value="${settings.smtp_port?.value || '587'}" required>
                                    <small class="text-muted">${settings.smtp_port?.description || 'SMTP server port'}</small>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Gmail Address</label>
                                <input type="email" class="form-control" id="smtp_username" 
                                       value="${settings.smtp_username?.value || ''}" 
                                       placeholder="your-email@gmail.com" required>
                                <small class="text-muted">${settings.smtp_username?.description || 'Your Gmail address'}</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Gmail App Password</label>
                                <input type="password" class="form-control" id="smtp_password" 
                                       value="${settings.smtp_password?.value || ''}" 
                                       placeholder="16-character app password">
                                <small class="text-muted">
                                    <a href="https://myaccount.google.com/apppasswords" target="_blank">
                                        <i class="fas fa-external-link-alt"></i> Generate App Password
                                    </a>
                                </small>
                            </div>

                            <div class="settings-form-grid">
                                <div class="form-group">
                                    <label class="form-label">From Email</label>
                                    <input type="email" class="form-control" id="smtp_from_email" 
                                           value="${settings.smtp_from_email?.value || 'noreply@fitai.com'}" required>
                                    <small class="text-muted">${settings.smtp_from_email?.description || 'Email address shown as sender'}</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">From Name</label>
                                    <input type="text" class="form-control" id="smtp_from_name" 
                                           value="${settings.smtp_from_name?.value || 'FitAI'}" required>
                                    <small class="text-muted">${settings.smtp_from_name?.description || 'Name shown as sender'}</small>
                                </div>
                            </div>

                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Hướng dẫn:</strong>
                                <ol style="margin: 0.5rem 0 0 1.5rem;">
                                    <li>Bật 2-Factor Authentication trên Gmail</li>
                                    <li>Tạo App Password tại: <a href="https://myaccount.google.com/apppasswords" target="_blank">Google Account</a></li>
                                    <li>Nhập Gmail và App Password vào form trên</li>
                                    <li>Lưu cài đặt</li>
                                </ol>
                            </div>

                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Lưu cài đặt SMTP
                            </button>
                        </form>
                    </div>

                    <div class="card" style="max-width: 800px; margin-top: 2rem;">
                        <h4><i class="fas fa-user-circle"></i> Thông tin tác giả</h4>
                        <p class="text-muted">Cấu hình thông tin hiển thị trên trang Author</p>
                        
                        <form id="authorForm">
                            <div class="form-group">
                                <label class="form-label">Avatar</label>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <img id="author_avatar_preview" 
                                         src="${settings.author_avatar?.value || '/images/logo.png'}" 
                                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border);">
                                    <input type="file" id="author_avatar_upload" accept="image/*" style="flex: 1;">
                                </div>
                                <small class="text-muted">Ảnh đại diện tác giả (khuyến nghị: 400x400px)</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Tên tác giả</label>
                                <input type="text" class="form-control" id="author_name" 
                                       value="${settings.author_name?.value || ''}" 
                                       placeholder="FitAI Team">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Tiểu sử</label>
                                <textarea class="form-control" id="author_bio" rows="4" 
                                          placeholder="Giới thiệu về bạn hoặc đội ngũ...">${settings.author_bio?.value || ''}</textarea>
                            </div>

                            <div class="settings-form-grid">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="author_email" 
                                           value="${settings.author_email?.value || ''}" 
                                           placeholder="contact@example.com">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Website</label>
                                    <input type="url" class="form-control" id="author_website" 
                                           value="${settings.author_website?.value || ''}" 
                                           placeholder="https://example.com">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Địa điểm</label>
                                <input type="text" class="form-control" id="author_location" 
                                       value="${settings.author_location?.value || ''}" 
                                       placeholder="Hà Nội, Việt Nam">
                            </div>

                            <h5 style="margin-top: 1.5rem; margin-bottom: 1rem;">
                                <i class="fas fa-share-alt"></i> Mạng xã hội
                            </h5>

                            <div class="form-group">
                                <label class="form-label"><i class="fab fa-facebook"></i> Facebook</label>
                                <input type="url" class="form-control" id="author_facebook" 
                                       value="${settings.author_facebook?.value || ''}" 
                                       placeholder="https://facebook.com/username">
                            </div>

                            <div class="form-group">
                                <label class="form-label"><i class="fab fa-instagram"></i> Instagram</label>
                                <input type="url" class="form-control" id="author_instagram" 
                                       value="${settings.author_instagram?.value || ''}" 
                                       placeholder="https://instagram.com/username">
                            </div>

                            <div class="form-group">
                                <label class="form-label"><i class="fab fa-twitter"></i> Twitter</label>
                                <input type="url" class="form-control" id="author_twitter" 
                                       value="${settings.author_twitter?.value || ''}" 
                                       placeholder="https://twitter.com/username">
                            </div>

                            <div class="form-group">
                                <label class="form-label"><i class="fab fa-linkedin"></i> LinkedIn</label>
                                <input type="url" class="form-control" id="author_linkedin" 
                                       value="${settings.author_linkedin?.value || ''}" 
                                       placeholder="https://linkedin.com/in/username">
                            </div>

                            <div class="form-group">
                                <label class="form-label"><i class="fab fa-github"></i> GitHub</label>
                                <input type="url" class="form-control" id="author_github" 
                                       value="${settings.author_github?.value || ''}" 
                                       placeholder="https://github.com/username">
                            </div>

                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Lưu thông tin tác giả
                            </button>
                        </form>
                    </div>
                </div>
            `;

            document.getElementById('settingsForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });

            document.getElementById('authorForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAuthorSettings();
            });

            document.getElementById('author_avatar_upload').addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.uploadAuthorAvatar(e.target.files[0]);
                }
            });

        } catch (error) {
            content.innerHTML = `<div class="alert alert-error">Lỗi: ${error.message}</div>`;
        }
    },

    /**
     * Save Settings
     */
    async saveSettings() {
        const settings = {
            smtp_host: document.getElementById('smtp_host').value,
            smtp_port: document.getElementById('smtp_port').value,
            smtp_username: document.getElementById('smtp_username').value,
            smtp_password: document.getElementById('smtp_password').value,
            smtp_from_email: document.getElementById('smtp_from_email').value,
            smtp_from_name: document.getElementById('smtp_from_name').value
        };

        try {
            const result = await API.post('/admin/settings', { settings });

            if (result.success) {
                App.showNotification('Đã lưu cài đặt thành công!', 'success');
            } else {
                App.showNotification(result.message || 'Lỗi lưu cài đặt', 'error');
            }
        } catch (error) {
            App.showNotification('Lỗi: ' + error.message, 'error');
        }
    },

    /**
     * Save Author Settings
     */
    async saveAuthorSettings() {
        const settings = {
            author_name: document.getElementById('author_name').value,
            author_bio: document.getElementById('author_bio').value,
            author_email: document.getElementById('author_email').value,
            author_website: document.getElementById('author_website').value,
            author_location: document.getElementById('author_location').value,
            author_facebook: document.getElementById('author_facebook').value,
            author_instagram: document.getElementById('author_instagram').value,
            author_twitter: document.getElementById('author_twitter').value,
            author_linkedin: document.getElementById('author_linkedin').value,
            author_github: document.getElementById('author_github').value
        };

        try {
            const result = await API.post('/admin/settings', { settings });

            if (result.success) {
                App.showNotification('Đã lưu thông tin tác giả!', 'success');
            } else {
                App.showNotification(result.message || 'Lỗi lưu thông tin', 'error');
            }
        } catch (error) {
            App.showNotification('Lỗi: ' + error.message, 'error');
        }
    },

    /**
     * Upload Author Avatar
     */
    async uploadAuthorAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/admin/author-avatar', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                // Update preview
                document.getElementById('author_avatar_preview').src = result.avatar_url;
                App.showNotification('Đã upload avatar!', 'success');
            } else {
                App.showNotification(result.message || 'Lỗi upload', 'error');
            }
        } catch (error) {
            App.showNotification('Lỗi upload: ' + error.message, 'error');
        }
    }
};
