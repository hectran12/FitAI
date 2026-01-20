/**
 * FitAI - Authentication Module (Vietnamese)
 * 
 * Xử lý đăng nhập, đăng ký và đăng xuất
 */

const Auth = {
    currentUser: null,
    profileComplete: false,

    /**
     * Kiểm tra đăng nhập
     */
    isLoggedIn() {
        return this.currentUser !== null;
    },

    /**
     * Lấy thông tin user hiện tại
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Đặt thông tin user
     */
    setUser(user, profileComplete = false) {
        this.currentUser = user;
        this.profileComplete = profileComplete;
    },

    /**
     * Đăng nhập
     */
    async login(email, password) {
        try {
            const result = await AuthAPI.login(email, password);
            if (result.success) {
                this.setUser(result.user, result.profile_complete);
                return { success: true, profileComplete: result.profile_complete };
            }
            return { success: false, message: result.message || 'Đăng nhập thất bại' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Đăng ký tài khoản mới
     */
    async register(email, password, passwordConfirm) {
        try {
            const result = await AuthAPI.register(email, password, passwordConfirm);
            if (result.success) {
                this.setUser(result.user, false);
                return { success: true };
            }
            return { success: false, message: result.message || 'Đăng ký thất bại' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Đăng xuất
     */
    async logout() {
        try {
            await AuthAPI.logout();
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
        this.currentUser = null;
        this.profileComplete = false;

        // Destroy PT Chat on logout
        if (typeof destroyPTChat === 'function') {
            destroyPTChat();
        }

        App.navigate('login');
    },

    /**
     * Kiểm tra phiên đăng nhập
     */
    async checkSession() {
        try {
            const result = await API.init();
            if (result.authenticated) {
                this.setUser(result.user, result.profile_complete);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi kiểm tra phiên:', error);
            return false;
        }
    },

    /**
     * Render trang đăng nhập
     */
    renderLoginPage() {
        return `
            <div class="auth-page">
                <div class="auth-card card">
                    <div class="auth-logo">
                        <h1><i class="fas fa-dumbbell text-primary"></i> <span>Fit</span>AI</h1>
                        <p class="text-muted">Trợ lý thể hình thông minh của bạn</p>
                    </div>
                    
                    <div id="loginAlert"></div>
                    
                    <form id="loginForm">
                        <div class="form-group">
                            <label class="form-label" for="loginEmail">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" class="form-input" id="loginEmail" 
                                   placeholder="email@example.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="loginPassword">
                                <i class="fas fa-lock"></i> Mật khẩu
                            </label>
                            <input type="password" class="form-input" id="loginPassword" 
                                   placeholder="••••••••" required>
                            <div class="form-help">
                                <a href="#" onclick="Auth.showForgotPasswordModal(); return false;" class="text-primary">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="loginBtn">
                            <i class="fas fa-sign-in-alt"></i> Đăng Nhập
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        Chưa có tài khoản? 
                        <a href="#" onclick="App.navigate('register'); return false;">Đăng ký ngay</a>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render trang đăng ký
     */
    renderRegisterPage() {
        return `
            <div class="auth-page">
                <div class="auth-card card">
                    <div class="auth-logo">
                        <h1><i class="fas fa-dumbbell text-primary"></i> <span>Fit</span>AI</h1>
                        <p class="text-muted">Bắt đầu hành trình sức khỏe của bạn</p>
                    </div>
                    
                    <div id="registerAlert"></div>
                    
                    <form id="registerForm">
                        <div class="form-group">
                            <label class="form-label" for="registerEmail">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" class="form-input" id="registerEmail" 
                                   placeholder="email@example.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="registerPassword">
                                <i class="fas fa-lock"></i> Mật khẩu
                            </label>
                            <input type="password" class="form-input" id="registerPassword" 
                                   placeholder="Tối thiểu 6 ký tự" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="registerPasswordConfirm">
                                <i class="fas fa-lock"></i> Xác nhận mật khẩu
                            </label>
                            <input type="password" class="form-input" id="registerPasswordConfirm" 
                                   placeholder="••••••••" required minlength="6">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="registerBtn">
                            <i class="fas fa-user-plus"></i> Tạo Tài Khoản
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        Đã có tài khoản? 
                        <a href="#" onclick="App.navigate('login'); return false;">Đăng nhập</a>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Khởi tạo xử lý trang đăng nhập
     */
    initLoginPage() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const btn = document.getElementById('loginBtn');
            const alert = document.getElementById('loginAlert');

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
            alert.innerHTML = '';

            const result = await this.login(email, password);

            if (result.success) {
                // Initialize PT Chat after successful login
                if (typeof initPTChat === 'function') {
                    initPTChat();
                }

                if (result.profileComplete) {
                    App.navigate('dashboard');
                } else {
                    App.navigate('profile');
                }
            } else {
                alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
            }
        });
    },

    /**
     * Khởi tạo xử lý trang đăng ký
     */
    initRegisterPage() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const btn = document.getElementById('registerBtn');
            const alert = document.getElementById('registerAlert');

            // Kiểm tra mật khẩu
            if (password !== passwordConfirm) {
                alert.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Mật khẩu không khớp</div>';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo tài khoản...';
            alert.innerHTML = '';

            const result = await this.register(email, password, passwordConfirm);

            if (result.success) {
                // Initialize PT Chat after successful registration
                if (typeof initPTChat === 'function') {
                    initPTChat();
                }

                App.navigate('profile');
            } else {
                alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-user-plus"></i> Tạo Tài Khoản';
            }
        });
    },

    /**
     * Show forgot password modal
     */
    showForgotPasswordModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="forgotPasswordModal">
                <div class="modal">
                    <button class="modal-close" onclick="Auth.closeForgotPasswordModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2><i class="fas fa-key"></i> Quên mật khẩu</h2>
                    <p class="text-muted">Nhập email của bạn để nhận mã xác thực</p>
                    <div id="forgotPasswordAlert"></div>
                    <form id="forgotPasswordForm">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="forgotEmail" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="sendCodeBtn">
                            <i class="fas fa-paper-plane"></i> Gửi mã xác thực
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            await this.sendResetCode(email);
        });
    },

    closeForgotPasswordModal() {
        document.getElementById('forgotPasswordModal')?.remove();
    },

    /**
     * Send reset code to email
     */
    async sendResetCode(email) {
        const btn = document.getElementById('sendCodeBtn');
        const alert = document.getElementById('forgotPasswordAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        alert.innerHTML = '';

        try {
            const result = await API.post('/auth/forgot-password', { email });

            if (result.success) {
                this.closeForgotPasswordModal();
                this.showVerifyCodeModal(email);
            } else {
                alert.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
            }
        } catch (error) {
            alert.innerHTML = `<div class="alert alert-error">Có lỗi xảy ra. Vui lòng thử lại.</div>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi mã xác thực';
        }
    },

    /**
     * Show verify code modal
     */
    showVerifyCodeModal(email) {
        const modalHtml = `
            <div class="modal-overlay active" id="verifyCodeModal">
                <div class="modal">
                    <button class="modal-close" onclick="Auth.closeVerifyCodeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2><i class="fas fa-shield-alt"></i> Xác thực mã</h2>
                    <p class="text-muted">Mã xác thực đã được gửi đến <strong>${email}</strong></p>
                    <div id="verifyCodeAlert"></div>
                    <form id="verifyCodeForm">
                        <div class="form-group">
                            <label class="form-label">Mã xác thực (6 chữ số)</label>
                            <input type="text" class="form-control" id="resetCode" 
                                   maxlength="6" pattern="[0-9]{6}" required 
                                   placeholder="000000" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="verifyCodeBtn">
                            <i class="fas fa-check"></i> Xác thực
                        </button>
                    </form>
                    <div class="text-center" style="margin-top: 1rem;">
                        <a href="#" onclick="Auth.closeVerifyCodeModal(); Auth.sendResetCode('${email}'); return false;" class="text-primary">
                            <i class="fas fa-redo"></i> Gửi lại mã
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('verifyCodeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('resetCode').value;
            await this.verifyResetCode(email, code);
        });
    },

    closeVerifyCodeModal() {
        document.getElementById('verifyCodeModal')?.remove();
    },

    /**
     * Verify reset code
     */
    async verifyResetCode(email, code) {
        const btn = document.getElementById('verifyCodeBtn');
        const alert = document.getElementById('verifyCodeAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác thực...';
        alert.innerHTML = '';

        try {
            const result = await API.post('/auth/verify-reset-code', { email, code });

            if (result.success) {
                this.closeVerifyCodeModal();
                this.showNewPasswordModal(result.reset_token);
            } else {
                alert.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
            }
        } catch (error) {
            alert.innerHTML = `<div class="alert alert-error">Mã xác thực không đúng</div>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Xác thực';
        }
    },

    /**
     * Show new password modal
     */
    showNewPasswordModal(resetToken) {
        const modalHtml = `
            <div class="modal-overlay active" id="newPasswordModal">
                <div class="modal">
                    <button class="modal-close" onclick="Auth.closeNewPasswordModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2><i class="fas fa-lock"></i> Đặt mật khẩu mới</h2>
                    <p class="text-muted">Nhập mật khẩu mới cho tài khoản của bạn</p>
                    <div id="newPasswordAlert"></div>
                    <form id="newPasswordForm">
                        <div class="form-group">
                            <label class="form-label">Mật khẩu mới</label>
                            <input type="password" class="form-control" id="newPassword" 
                                   minlength="6" required placeholder="Tối thiểu 6 ký tự">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Xác nhận mật khẩu</label>
                            <input type="password" class="form-control" id="confirmNewPassword" 
                                   minlength="6" required placeholder="Nhập lại mật khẩu">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="resetPasswordBtn">
                            <i class="fas fa-save"></i> Đặt lại mật khẩu
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('newPasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmPassword) {
                document.getElementById('newPasswordAlert').innerHTML =
                    '<div class="alert alert-error">Mật khẩu không khớp</div>';
                return;
            }

            await this.resetPassword(resetToken, newPassword);
        });
    },

    closeNewPasswordModal() {
        document.getElementById('newPasswordModal')?.remove();
    },

    /**
     * Reset password
     */
    async resetPassword(resetToken, newPassword) {
        const btn = document.getElementById('resetPasswordBtn');
        const alert = document.getElementById('newPasswordAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đặt lại...';
        alert.innerHTML = '';

        try {
            const result = await API.post('/auth/reset-password', {
                reset_token: resetToken,
                new_password: newPassword
            });

            if (result.success) {
                this.setUser(result.user, true);
                this.closeNewPasswordModal();

                // Show success message
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: 'Mật khẩu đã được đặt lại. Bạn đã đăng nhập.',
                        timer: 2000
                    });
                }

                // Initialize PT Chat
                if (typeof initPTChat === 'function') {
                    initPTChat();
                }

                App.navigate('dashboard');
            } else {
                alert.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
            }
        } catch (error) {
            alert.innerHTML = `<div class="alert alert-error">Có lỗi xảy ra. Vui lòng thử lại.</div>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Đặt lại mật khẩu';
        }
    }
};
