/**
 * FitAI - Main Application Module (Vietnamese)
 * 
 * Điều khiển routing, navigation và khởi tạo ứng dụng
 */

const App = {
    currentPage: null,

    /**
     * Khởi tạo ứng dụng
     */
    async init() {
        // Initialize theme from localStorage
        this.initTheme();

        // Kiểm tra trạng thái đăng nhập
        const isLoggedIn = await Auth.checkSession();

        // Thiết lập navigation
        this.setupNavigation();

        // Lấy hash từ URL
        const hash = window.location.hash.replace('#', '');

        // Điều hướng dựa trên trạng thái
        if (isLoggedIn) {
            // Initialize PT Chat for logged in users
            if (typeof initPTChat === 'function') {
                initPTChat();
            }

            if (hash && ['dashboard', 'plan', 'profile', 'community'].includes(hash)) {
                this.navigate(hash);
            } else if (Auth.profileComplete) {
                this.navigate('dashboard');
            } else {
                this.navigate('profile');
            }
        } else {
            // Destroy PT Chat for logged out users
            if (typeof destroyPTChat === 'function') {
                destroyPTChat();
            }

            if (hash && ['login', 'register'].includes(hash)) {
                this.navigate(hash);
            } else {
                this.navigate('landing');
            }
        }

        // Thiết lập xử lý modal
        this.setupModal();
    },

    /**
     * Initialize theme from localStorage
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon();
    },

    /**
     * Update theme toggle icon
     */
    updateThemeIcon() {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            btn.title = isDark ? 'Chế độ sáng' : 'Chế độ tối';
        }
    },

    /**
     * Show notification using SweetAlert2
     */
    showNotification(message, type = 'success') {
        const icons = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: icons[type] || 'info',
            title: message
        });
    },

    /**
     * Load sidebar ads
     */
    async loadSidebarAds() {
        try {
            const result = await API.get('/ads.php');
            if (result.success && result.ads && result.ads.length > 0) {
                const slots = ['adSlot1', 'adSlot2', 'adSlot3', 'adSlot4'];

                result.ads.forEach((ad, index) => {
                    if (index < slots.length) {
                        const slot = document.getElementById(slots[index]);
                        if (slot) {
                            slot.innerHTML = this.renderAd(ad);
                        }
                    }
                });
            }
        } catch (error) {
            console.log('Ads not available');
        }
    },

    renderAd(ad) {
        const imgSrc = ad.image_url ? ad.image_url : '';
        return `
            <a href="${ad.link_url || '#'}" target="_blank" class="sidebar-ad" 
               onclick="API.post('/ads.php', {id: ${ad.id}})">
                ${imgSrc
                ? `<img src="${imgSrc}" alt="${ad.title}" onerror="this.parentNode.innerHTML='<div class=ad-placeholder>${ad.title}</div>'">`
                : `<div class="ad-placeholder">${ad.title}</div>`
            }
            </a>
        `;
    },

    /**
     * Thiết lập navigation
     */
    setupNavigation() {
        this.updateNavbar();

        // Toggle menu mobile
        const toggle = document.getElementById('navbarToggle');
        const nav = document.getElementById('navbarNav');

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    },

    /**
     * Cập nhật navbar dựa trên trạng thái đăng nhập
     */
    updateNavbar() {
        const nav = document.getElementById('navbarNav');
        if (!nav) return;

        const themeIcon = document.documentElement.getAttribute('data-theme') === 'light'
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';
        const themeTitle = document.documentElement.getAttribute('data-theme') === 'light'
            ? 'Chế độ tối'
            : 'Chế độ sáng';

        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();
            const isAdmin = user && user.is_admin;

            // Main navbar - các tính năng chính + sidebar items cho mobile
            nav.innerHTML = `
                <li><a href="#" data-page="dashboard"><i class="fas fa-chart-line"></i> <span>Bảng điều khiển</span></a></li>
                <li><a href="#" data-page="plan"><i class="fas fa-calendar-alt"></i> <span>Kế hoạch</span></a></li>
                <li><a href="#" data-page="community"><i class="fas fa-users"></i> <span>Cộng đồng</span></a></li>
                <li><a href="#" data-page="profile"><i class="fas fa-user"></i> <span>Hồ sơ</span></a></li>
                
                <!-- Mobile only - Sidebar items -->
                <li class="mobile-only nav-divider"></li>
                <li class="mobile-only"><a href="#" data-page="friends"><i class="fas fa-user-friends"></i> <span>Bạn bè</span></a></li>
                <li class="mobile-only"><a href="#" data-page="chat"><i class="fas fa-comments"></i> <span>Chat</span></a></li>
                <li class="mobile-only"><a href="#" data-page="market"><i class="fas fa-store"></i> <span>Shop</span></a></li>
                <li class="mobile-only"><a href="#" data-page="orders"><i class="fas fa-box"></i> <span>Đơn hàng</span></a></li>
                <li class="mobile-only"><a href="#" data-page="cart"><i class="fas fa-shopping-cart"></i> <span>Giỏ hàng</span></a></li>
                <li class="mobile-only"><a href="#" data-page="music"><i class="fas fa-music"></i> <span>Kho nhạc</span></a></li>
                ${isAdmin ? '<li class="mobile-only"><a href="#" data-page="admin"><i class="fas fa-shield-alt"></i> <span>Admin</span></a></li>' : ''}
                <li class="mobile-only nav-divider"></li>
                
                <li><a href="#" id="themeToggle" class="theme-toggle-btn" title="${themeTitle}">${themeIcon}</a></li>
                <li><a href="#" data-page="logout"><i class="fas fa-sign-out-alt"></i> <span class="mobile-only">Đăng xuất</span></a></li>
            `;

            // Sidebar - Market & Admin + Ads
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('visible');
                sidebar.querySelector('.sidebar-nav').innerHTML = `
                    <a href="#" class="sidebar-link" data-page="friends">
                        <i class="fas fa-user-friends"></i>
                        <span>Bạn bè</span>
                    </a>
                    <a href="#" class="sidebar-link" data-page="chat">
                        <i class="fas fa-comments"></i>
                        <span>Chat</span>
                    </a>
                    <div class="sidebar-divider"></div>
                    <a href="#" class="sidebar-link" data-page="market">
                        <i class="fas fa-store"></i>
                        <span>Shop</span>
                    </a>
                    <a href="#" class="sidebar-link" data-page="orders">
                        <i class="fas fa-box"></i>
                        <span>Đơn hàng</span>
                    </a>
                    <a href="#" class="sidebar-link" data-page="cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Giỏ hàng</span>
                    </a>
                    <a href="#" class="sidebar-link" data-page="music">
                        <i class="fas fa-music"></i>
                        <span>Kho nhạc</span>
                    </a>
                    ${isAdmin ? `
                        <div class="sidebar-divider"></div>
                        <a href="#" class="sidebar-link" data-page="admin">
                            <i class="fas fa-shield-alt"></i>
                            <span>Admin</span>
                        </a>
                    ` : ''}
                    <div class="sidebar-ads">
                        <div class="sidebar-ad-slot" id="adSlot1"></div>
                        <div class="sidebar-ad-slot" id="adSlot2"></div>
                        <div class="sidebar-ad-slot" id="adSlot3"></div>
                        <div class="sidebar-ad-slot" id="adSlot4"></div>
                    </div>
                `;

                // Bind sidebar link clicks
                sidebar.querySelectorAll('.sidebar-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const page = link.dataset.page;
                        App.navigate(page);
                        // Close sidebar on mobile after click
                        sidebar.classList.remove('open');
                        document.querySelector('.sidebar-overlay')?.classList.remove('active');
                    });
                });

                // Load ads
                this.loadSidebarAds();

                // Setup mobile sidebar toggle
                this.setupMobileSidebar();
            }

            // Add body class for sidebar layout
            document.body.classList.add('has-sidebar');
        } else {
            // Hide sidebar when not logged in
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('visible');
            }
            document.body.classList.remove('has-sidebar');

            nav.innerHTML = `
                <li><a href="#features" class="nav-scroll">Tính năng</a></li>
                <li><a href="#how-it-works" class="nav-scroll">Cách hoạt động</a></li>
                <li><a href="#" id="themeToggle" class="theme-toggle-btn" title="${themeTitle}">${themeIcon}</a></li>
                <li><a href="#" data-page="login"><i class="fas fa-sign-in-alt"></i> Đăng Nhập</a></li>
                <li><a href="#" data-page="register" class="btn btn-primary"><i class="fas fa-rocket"></i> Bắt Đầu Miễn Phí</a></li>
            `;
        }

        // Theme toggle click handler
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Thêm xử lý click
        nav.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page === 'logout') {
                    Auth.logout();
                } else {
                    this.navigate(page);
                }
                // Đóng menu mobile
                nav.classList.remove('active');
            });
        });

        // Smooth scroll cho anchor links
        nav.querySelectorAll('.nav-scroll').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                nav.classList.remove('active');
            });
        });
    },

    /**
     * Setup mobile sidebar toggle
     */
    setupMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Create overlay if not exists
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        // Create hamburger button if not exists
        let hamburger = document.querySelector('.sidebar-toggle-btn');
        if (!hamburger) {
            hamburger = document.createElement('button');
            hamburger.className = 'sidebar-toggle-btn';
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            hamburger.title = 'Menu';

            const header = document.querySelector('.navbar');
            if (header) {
                header.insertBefore(hamburger, header.firstChild);
            }
        }

        // Toggle sidebar on hamburger click
        hamburger.onclick = () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        };

        // Close sidebar when clicking overlay
        overlay.onclick = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        };
    },

    /**
     * Điều hướng đến trang
     */
    async navigate(page) {
        this.currentPage = page;
        const app = document.getElementById('app');

        // Cập nhật link active
        document.querySelectorAll('.navbar-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Render nội dung trang
        switch (page) {
            case 'landing':
                app.innerHTML = this.renderLandingPage();
                this.initLandingPage();
                break;

            case 'login':
                app.innerHTML = Auth.renderLoginPage();
                Auth.initLoginPage();
                break;

            case 'register':
                app.innerHTML = Auth.renderRegisterPage();
                Auth.initRegisterPage();
                break;

            case 'profile':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Profile.renderProfilePage();
                Profile.initProfilePage();
                break;

            case 'dashboard':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Dashboard.renderDashboardPage();
                Dashboard.initDashboard();
                break;

            case 'plan':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Plan.renderPlanPage();
                Plan.initPlanPage();
                break;

            case 'community':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Community.renderCommunityPage();
                Community.initCommunityPage();
                break;

            case 'friends':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Friends.renderPage();
                Friends.init();
                break;

            case 'chat':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                if (typeof Chat !== 'undefined' && Chat.cleanup) Chat.cleanup();
                app.innerHTML = Chat.renderPage();
                Chat.init();
                break;

            case 'admin':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Admin.renderAdminPage();
                Admin.initAdminPage();
                break;

            case 'market':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Market.renderMarketPage();
                Market.initMarketPage();
                break;

            case 'cart':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Market.renderCartPage();
                Market.initCartPage();
                break;

            case 'checkout':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Market.renderCheckoutPage();
                Market.initCheckoutPage();
                break;

            case 'orders':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Market.renderOrdersPage();
                Market.initOrdersPage();
                break;

            case 'music':
                if (!Auth.isLoggedIn()) {
                    this.navigate('login');
                    return;
                }
                app.innerHTML = Music.renderPage();
                Music.init();
                break;

            case 'author':
                app.innerHTML = await Author.renderPage();
                break;

            default:
                // Handle dynamic routes like product/123, order/456
                if (page.startsWith('product/')) {
                    const productId = page.split('/')[1];
                    app.innerHTML = await Market.renderProductDetailPage(productId);
                    Market.initProductDetailPage(productId);
                } else if (page.startsWith('order/')) {
                    const orderId = page.split('/')[1];
                    app.innerHTML = Market.renderOrderDetailPage();
                    Market.initOrderDetailPage(orderId);
                } else {
                    this.navigate('landing');
                }
        }

        // Cập nhật trạng thái navbar
        this.updateNavbar();

        // Cập nhật URL không reload
        const url = page === 'landing' || page === 'dashboard' ? '/' : `/#${page}`;
        history.pushState({ page }, '', url);

        // Scroll to top
        window.scrollTo(0, 0);
    },

    /**
     * Render Landing Page
     */
    renderLandingPage() {
        return `
            <!-- Hero Section -->
            <section class="hero">
                <div class="hero-bg" style="background-image: url('images/cover.png');">
                    <div class="hero-gradient"></div>
                </div>
                <div class="container hero-content">
                    <div class="hero-text">
                        <div class="hero-badge">
                            <i class="fas fa-bolt"></i> Ứng dụng AI hàng đầu
                        </div>
                        <h1 class="hero-title">
                            Tập luyện thông minh với
                            <span class="text-gradient">Trí tuệ nhân tạo</span>
                        </h1>
                        <p class="hero-description">
                            FitAI tạo kế hoạch tập luyện 7 ngày được cá nhân hóa dựa trên mục tiêu, 
                            trình độ và thiết bị của bạn. Theo dõi tiến độ và điều chỉnh tự động.
                        </p>
                        <div class="hero-cta">
                            <a href="#" class="btn btn-primary btn-xl" onclick="App.navigate('register'); return false;">
                                <i class="fas fa-rocket"></i> Bắt Đầu Miễn Phí
                            </a>
                            <a href="#how-it-works" class="btn btn-ghost btn-xl">
                                <i class="fas fa-play-circle"></i> Xem Cách Hoạt Động
                            </a>
                        </div>
                        <div class="hero-stats">
                            <div class="hero-stat">
                                <div class="hero-stat-value">50+</div>
                                <div class="hero-stat-label">Bài tập</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">AI</div>
                                <div class="hero-stat-label">Cá nhân hóa</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">7</div>
                                <div class="hero-stat-label">Ngày/Kế hoạch</div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-visual">
                        <div class="hero-phone">
                            <div class="phone-notch"></div>
                            <div class="phone-screen">
                                <div class="phone-header">
                                    <i class="fas fa-dumbbell"></i> FitAI
                                </div>
                                <div class="phone-card">
                                    <div class="phone-card-title">Hôm nay</div>
                                    <div class="phone-card-subtitle">Ngày Vai & Tay Sau</div>
                                    <div class="phone-exercise">
                                        <span class="phone-exercise-num">1</span>
                                        <span>Đẩy vai dumbbell</span>
                                    </div>
                                    <div class="phone-exercise">
                                        <span class="phone-exercise-num">2</span>
                                        <span>Nâng vai bên</span>
                                    </div>
                                    <div class="phone-exercise">
                                        <span class="phone-exercise-num">3</span>
                                        <span>Đẩy tay sau</span>
                                    </div>
                                </div>
                                <div class="phone-btn">
                                    <i class="fas fa-check"></i> Hoàn thành
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hero-scroll">
                    <a href="#features"><i class="fas fa-chevron-down"></i></a>
                </div>
            </section>

            <!-- Features Section -->
            <section class="section" id="features">
                <div class="container">
                    <div class="section-header">
                        <div class="section-badge"><i class="fas fa-star"></i> Tính năng</div>
                        <h2 class="section-title">Mọi thứ bạn cần để <span class="text-gradient">đạt mục tiêu</span></h2>
                        <p class="section-description">
                            Công nghệ AI tiên tiến kết hợp với kiến thức thể hình chuyên sâu
                        </p>
                    </div>
                    
                    <div class="features-grid">
                        <div class="feature-card feature-highlight">
                            <div class="feature-icon-lg">
                                <i class="fas fa-brain"></i>
                            </div>
                            <h3>AI Cá Nhân Hóa</h3>
                            <p>Thuật toán thông minh phân tích mục tiêu, trình độ và thiết bị để tạo kế hoạch phù hợp nhất với bạn.</p>
                            <div class="feature-tags">
                                <span class="tag"><i class="fas fa-fire"></i> Giảm mỡ</span>
                                <span class="tag"><i class="fas fa-dumbbell"></i> Tăng cơ</span>
                                <span class="tag"><i class="fas fa-heart"></i> Sức khỏe</span>
                            </div>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <h3>Kế Hoạch 7 Ngày</h3>
                            <p>Lịch tập luyện đầy đủ cho cả tuần, phân bổ nhóm cơ hợp lý.</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h3>Theo Dõi Tiến Độ</h3>
                            <p>Ghi nhật ký buổi tập, theo dõi chuỗi ngày và xem thống kê chi tiết.</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                            <h3>Tự Động Điều Chỉnh</h3>
                            <p>AI học từ phản hồi của bạn để điều chỉnh kế hoạch tuần sau.</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-home"></i>
                            </div>
                            <h3>Linh Hoạt Thiết Bị</h3>
                            <p>Tập tại nhà không dụng cụ hoặc phòng gym đầy đủ - chúng tôi có tất cả.</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>An Toàn & Bảo Mật</h3>
                            <p>Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn bảo mật cao nhất.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <h3>Cộng Đồng</h3>
                            <p>Kết nối với người tập cùng mục tiêu, chia sẻ tiến độ và động viên lẫn nhau.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h3>Chat & Nhắn Tin</h3>
                            <p>Trò chuyện trực tiếp với bạn bè, chia sẻ tips và hỗ trợ lẫn nhau.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-store"></i>
                            </div>
                            <h3>Market</h3>
                            <p>Mua sắm thiết bị tập luyện, thực phẩm bổ sung và sản phẩm sức khỏe.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-music"></i>
                            </div>
                            <h3>Kho Nhạc Tập Luyện</h3>
                            <p>Thư viện nhạc động lực theo BPM, phân loại theo thể loại để tăng hiệu quả tập.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3>PT AI Chat</h3>
                            <p>Trợ lý AI cá nhân phân tích body, dinh dưỡng và tư vấn tập luyện 24/7.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="section section-dark" id="how-it-works">
                <div class="container">
                    <div class="section-header">
                        <div class="section-badge"><i class="fas fa-magic"></i> Cách hoạt động</div>
                        <h2 class="section-title">Bắt đầu chỉ trong <span class="text-gradient">3 bước</span></h2>
                    </div>
                    
                    <div class="steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <div class="step-icon"><i class="fas fa-user-plus"></i></div>
                                <h3>Tạo Hồ Sơ</h3>
                                <p>Đăng ký và cho chúng tôi biết mục tiêu, trình độ và thiết bị tập luyện của bạn.</p>
                            </div>
                        </div>
                        
                        <div class="step-connector"><i class="fas fa-arrow-right"></i></div>
                        
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <div class="step-icon"><i class="fas fa-robot"></i></div>
                                <h3>AI Tạo Kế Hoạch</h3>
                                <p>Thuật toán AI phân tích dữ liệu và tạo kế hoạch 7 ngày được cá nhân hóa.</p>
                            </div>
                        </div>
                        
                        <div class="step-connector"><i class="fas fa-arrow-right"></i></div>
                        
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-icon"><i class="fas fa-medal"></i></div>
                                <h3>Tập & Theo Dõi</h3>
                                <p>Thực hiện bài tập, ghi nhật ký và xem tiến bộ của bạn qua thời gian.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Goals Section -->
            <section class="section">
                <div class="container">
                    <div class="section-header">
                        <div class="section-badge"><i class="fas fa-bullseye"></i> Mục tiêu</div>
                        <h2 class="section-title">Phù hợp với <span class="text-gradient">mọi mục tiêu</span></h2>
                    </div>
                    
                    <div class="goals-grid">
                        <div class="goal-card goal-fat-loss" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/goal-fat-loss.png');">
                            <div class="goal-icon"><i class="fas fa-fire-alt"></i></div>
                            <h3>Giảm Mỡ</h3>
                            <p>Bài tập cardio và circuits thiết kế để đốt cháy calories tối đa</p>
                            <ul class="goal-features">
                                <li><i class="fas fa-check"></i> HIIT cardio</li>
                                <li><i class="fas fa-check"></i> Circuit training</li>
                                <li><i class="fas fa-check"></i> Thời gian nghỉ ngắn</li>
                            </ul>
                        </div>
                        
                        <div class="goal-card goal-muscle-gain" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/goal-muscle-gain.png');">
                            <div class="goal-icon"><i class="fas fa-dumbbell"></i></div>
                            <h3>Tăng Cơ</h3>
                            <p>Chương trình tập nặng với focus vào progressive overload</p>
                            <ul class="goal-features">
                                <li><i class="fas fa-check"></i> Compound movements</li>
                                <li><i class="fas fa-check"></i> Volume training</li>
                                <li><i class="fas fa-check"></i> Phân chia cơ hợp lý</li>
                            </ul>
                        </div>
                        
                        <div class="goal-card goal-maintain" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/goal-maintain.png');">
                            <div class="goal-icon"><i class="fas fa-heartbeat"></i></div>
                            <h3>Duy Trì</h3>
                            <p>Giữ vóc dáng và sức khỏe với chương trình cân bằng</p>
                            <ul class="goal-features">
                                <li><i class="fas fa-check"></i> Full body workouts</li>
                                <li><i class="fas fa-check"></i> Flexibility training</li>
                                <li><i class="fas fa-check"></i> Sustainable routine</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="section section-cta">
                <div class="container">
                    <div class="cta-content">
                        <h2>Sẵn sàng biến đổi cơ thể?</h2>
                        <p>Tham gia ngay hôm nay và nhận kế hoạch tập luyện cá nhân hóa miễn phí từ AI</p>
                        <div class="cta-buttons">
                            <a href="#" class="btn btn-primary btn-xl" onclick="App.navigate('register'); return false;">
                                <i class="fas fa-rocket"></i> Đăng Ký Ngay
                            </a>
                            <a href="#" class="btn btn-secondary btn-xl" onclick="App.navigate('login'); return false;">
                                <i class="fas fa-sign-in-alt"></i> Đăng Nhập
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <div class="footer-logo">
                                <i class="fas fa-dumbbell"></i> <span>Fit</span>AI
                            </div>
                            <p>Trợ lý thể hình thông minh của bạn</p>
                        </div>
                        <div class="footer-links">
                            <a href="#features">Tính năng</a>
                            <a href="#how-it-works">Cách hoạt động</a>
                            <a href="#" onclick="App.navigate('author'); return false;">Về tác giả</a>
                            <a href="#" onclick="App.navigate('login'); return false;">Đăng nhập</a>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2026 FitAI. Được phát triển bởi Nhân Hòa</p>
                    </div>
                </div>
            </footer>
        `;
    },

    /**
     * Khởi tạo landing page
     */
    initLandingPage() {
        // Smooth scroll cho tất cả anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId !== '#' && targetId.length > 1) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    },

    /**
     * Thiết lập chức năng modal
     */
    setupModal() {
        const overlay = document.getElementById('modalOverlay');
        const closeBtn = document.getElementById('modalClose');

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    Modal.hide();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                Modal.hide();
            });
        }

        // Phím ESC để đóng modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Modal.hide();
            }
        });
    }
};

/**
 * Tiện ích Modal
 */
const Modal = {
    show({ title, body, footer, onShow }) {
        const overlay = document.getElementById('modalOverlay');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');
        const footerEl = document.getElementById('modalFooter');

        if (titleEl) titleEl.textContent = title || '';
        if (bodyEl) bodyEl.innerHTML = body || '';
        if (footerEl) footerEl.innerHTML = footer || '';

        if (overlay) overlay.classList.add('active');

        if (onShow) {
            setTimeout(onShow, 100);
        }
    },

    hide() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('active');
    }
};

// Khởi tạo app khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Xử lý nút back/forward của trình duyệt
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
        App.navigate(e.state.page);
    }
});
