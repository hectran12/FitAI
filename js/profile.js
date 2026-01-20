/**
 * FitAI - Profile Module (Vietnamese)
 * 
 * Quản lý thiết lập và chỉnh sửa hồ sơ người dùng
 * Bao gồm: Avatar, tên hiển thị, bio, social links, thông tin tập luyện
 */

const Profile = {
    currentProfile: null,

    /**
     * Tải hồ sơ người dùng
     */
    async loadProfile() {
        try {
            const result = await ProfileAPI.get();
            if (result.success) {
                this.currentProfile = result.profile;
                return result.profile;
            }
        } catch (error) {
            console.error('Lỗi tải hồ sơ:', error);
        }
        return null;
    },

    /**
     * Lưu cập nhật hồ sơ
     */
    async saveProfile(data) {
        try {
            const result = await ProfileAPI.update(data);
            if (result.success) {
                this.currentProfile = { ...this.currentProfile, ...result.profile };
                Auth.profileComplete = true;
                return { success: true, profile: result.profile };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Upload avatar
     */
    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                this.currentProfile.avatar = result.avatar;
            }
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Render trang thiết lập hồ sơ
     */
    renderProfilePage() {
        return `
            <div class="profile-page">
                <div class="container container-md">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title"><i class="fas fa-user-cog"></i> Thiết Lập Hồ Sơ</h2>
                        </div>
                        
                        <div id="profileAlert"></div>
                        
                        <form id="profileForm">
                            <!-- Avatar & Thông tin cá nhân -->
                            <div class="profile-personal-section">
                                <h3><i class="fas fa-id-card"></i> Thông Tin Cá Nhân</h3>
                                
                                <!-- Avatar Upload -->
                                <div class="avatar-upload-section">
                                    <div class="avatar-preview" id="avatarPreview">
                                        <img src="" alt="Avatar" id="avatarImg" style="display: none;">
                                        <div class="avatar-placeholder" id="avatarPlaceholder">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <label class="avatar-upload-btn" for="avatarInput">
                                            <i class="fas fa-camera"></i>
                                        </label>
                                    </div>
                                    <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                                    <p class="form-hint text-center">Nhấn vào biểu tượng camera để thay đổi ảnh đại diện</p>
                                </div>

                                <!-- Tên hiển thị -->
                                <div class="form-group">
                                    <label class="form-label"><i class="fas fa-signature"></i> Tên hiển thị</label>
                                    <input type="text" class="form-input" name="display_name" id="displayName" 
                                           placeholder="Tên bạn muốn hiển thị">
                                </div>

                                <!-- Bio -->
                                <div class="form-group">
                                    <label class="form-label"><i class="fas fa-quote-left"></i> Giới thiệu bản thân</label>
                                    <textarea class="form-textarea" name="bio" id="bio" rows="3"
                                              placeholder="Viết vài dòng về bạn..."></textarea>
                                </div>

                                <!-- Social Links -->
                                <div class="form-group">
                                    <label class="form-label"><i class="fas fa-share-alt"></i> Liên kết mạng xã hội</label>
                                    <div class="social-links-grid">
                                        <div class="social-input">
                                            <span class="social-icon"><i class="fab fa-facebook"></i></span>
                                            <input type="url" class="form-input" name="social_facebook" id="socialFacebook" 
                                                   placeholder="https://facebook.com/username">
                                        </div>
                                        <div class="social-input">
                                            <span class="social-icon"><i class="fab fa-instagram"></i></span>
                                            <input type="url" class="form-input" name="social_instagram" id="socialInstagram" 
                                                   placeholder="https://instagram.com/username">
                                        </div>
                                        <div class="social-input">
                                            <span class="social-icon"><i class="fab fa-tiktok"></i></span>
                                            <input type="url" class="form-input" name="social_tiktok" id="socialTiktok" 
                                                   placeholder="https://tiktok.com/@username">
                                        </div>
                                        <div class="social-input">
                                            <span class="social-icon"><i class="fab fa-youtube"></i></span>
                                            <input type="url" class="form-input" name="social_youtube" id="socialYoutube" 
                                                   placeholder="https://youtube.com/@channel">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr style="border-color: var(--border); margin: var(--space-xl) 0;">

                            <!-- Thông tin tập luyện -->
                            <h3><i class="fas fa-dumbbell"></i> Thông Tin Tập Luyện</h3>

                            <!-- Mục tiêu -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-bullseye"></i> Mục tiêu chính của bạn?</label>
                                <div class="option-group" id="goalOptions">
                                    <label class="option-btn" data-value="fat_loss">
                                        <input type="radio" name="goal" value="fat_loss">
                                        <i class="fas fa-fire"></i> Giảm Mỡ
                                    </label>
                                    <label class="option-btn" data-value="muscle_gain">
                                        <input type="radio" name="goal" value="muscle_gain">
                                        <i class="fas fa-dumbbell"></i> Tăng Cơ
                                    </label>
                                    <label class="option-btn" data-value="maintenance">
                                        <input type="radio" name="goal" value="maintenance">
                                        <i class="fas fa-balance-scale"></i> Duy Trì
                                    </label>
                                </div>
                            </div>

                            <!-- Trình độ -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-layer-group"></i> Trình độ tập luyện</label>
                                <div class="option-group" id="levelOptions">
                                    <label class="option-btn" data-value="beginner">
                                        <input type="radio" name="level" value="beginner">
                                        <i class="fas fa-seedling"></i> Mới bắt đầu
                                    </label>
                                    <label class="option-btn" data-value="intermediate">
                                        <input type="radio" name="level" value="intermediate">
                                        <i class="fas fa-leaf"></i> Trung bình
                                    </label>
                                    <label class="option-btn" data-value="advanced">
                                        <input type="radio" name="level" value="advanced">
                                        <i class="fas fa-tree"></i> Nâng cao
                                    </label>
                                </div>
                            </div>

                            <!-- Thiết bị -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-tools"></i> Thiết bị tập luyện</label>
                                <div class="option-group" id="equipmentOptions">
                                    <label class="option-btn" data-value="none">
                                        <input type="radio" name="equipment" value="none">
                                        <i class="fas fa-home"></i> Không có (tập tại nhà)
                                    </label>
                                    <label class="option-btn" data-value="home">
                                        <input type="radio" name="equipment" value="home">
                                        <i class="fas fa-couch"></i> Dụng cụ tại nhà
                                    </label>
                                    <label class="option-btn" data-value="gym">
                                        <input type="radio" name="equipment" value="gym">
                                        <i class="fas fa-building"></i> Phòng Gym
                                    </label>
                                </div>
                            </div>

                            <!-- Số ngày tập -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-calendar-week"></i> Số ngày tập mỗi tuần</label>
                                <div class="option-group" id="daysOptions">
                                    <label class="option-btn" data-value="3">
                                        <input type="radio" name="days_per_week" value="3">
                                        3 ngày
                                    </label>
                                    <label class="option-btn" data-value="4">
                                        <input type="radio" name="days_per_week" value="4">
                                        4 ngày
                                    </label>
                                    <label class="option-btn" data-value="5">
                                        <input type="radio" name="days_per_week" value="5">
                                        5 ngày
                                    </label>
                                    <label class="option-btn" data-value="6">
                                        <input type="radio" name="days_per_week" value="6">
                                        6 ngày
                                    </label>
                                </div>
                            </div>

                            <!-- Thời gian mỗi buổi -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-clock"></i> Thời gian mỗi buổi tập (phút)</label>
                                <select class="form-select" name="session_minutes" id="sessionMinutes">
                                    <option value="20">20 phút</option>
                                    <option value="30">30 phút</option>
                                    <option value="45" selected>45 phút</option>
                                    <option value="60">60 phút</option>
                                    <option value="75">75 phút</option>
                                    <option value="90">90 phút</option>
                                </select>
                            </div>

                            <!-- Ngày có thể tập -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-calendar-check"></i> Các ngày bạn có thể tập</label>
                                <div class="grid grid-4" id="availabilityGrid">
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_monday" value="1">
                                        Thứ 2
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_tuesday" value="1">
                                        Thứ 3
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_wednesday" value="1">
                                        Thứ 4
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_thursday" value="1">
                                        Thứ 5
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_friday" value="1">
                                        Thứ 6
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_saturday" value="1">
                                        Thứ 7
                                    </label>
                                    <label class="form-checkbox">
                                        <input type="checkbox" name="availability_sunday" value="1">
                                        Chủ nhật
                                    </label>
                                </div>
                            </div>

                            <!-- Chấn thương / hạn chế -->
                            <div class="form-group">
                                <label class="form-label"><i class="fas fa-notes-medical"></i> Chấn thương hoặc hạn chế? (tùy chọn)</label>
                                <textarea class="form-textarea" name="constraints" id="constraints"
                                          placeholder="Ví dụ: đau lưng, đau gối, vai yếu..."></textarea>
                                <p class="form-hint">Chúng tôi sẽ tránh các bài tập có thể ảnh hưởng đến tình trạng của bạn.</p>
                            </div>

                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary btn-lg btn-block" id="saveProfileBtn">
                                    <i class="fas fa-save"></i> Lưu & Tiếp Tục
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Khởi tạo xử lý trang hồ sơ
     */
    async initProfilePage() {
        // Tải dữ liệu hồ sơ hiện có
        const profile = await this.loadProfile();

        // Điền sẵn form nếu có dữ liệu
        if (profile) {
            this.prefillForm(profile);
        }

        // Thiết lập xử lý click cho option buttons
        this.setupOptionButtons();

        // Thiết lập avatar upload
        this.setupAvatarUpload();

        // Xử lý submit form
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('saveProfileBtn');
            const alert = document.getElementById('profileAlert');

            // Thu thập dữ liệu form
            const formData = this.gatherFormData();

            // Kiểm tra
            if (!formData.goal || !formData.level || !formData.equipment) {
                alert.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Vui lòng điền đầy đủ các trường bắt buộc</div>';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            alert.innerHTML = '';

            const result = await this.saveProfile(formData);

            if (result.success) {
                alert.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Đã lưu hồ sơ thành công!</div>';
                setTimeout(() => {
                    App.navigate('dashboard');
                }, 1000);
            } else {
                alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Lưu & Tiếp Tục';
            }
        });
    },

    /**
     * Thiết lập avatar upload
     */
    setupAvatarUpload() {
        const input = document.getElementById('avatarInput');
        const img = document.getElementById('avatarImg');
        const placeholder = document.getElementById('avatarPlaceholder');

        if (!input) return;

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Kiểm tra loại file
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh');
                return;
            }

            // Kiểm tra kích thước (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File quá lớn. Tối đa 5MB');
                return;
            }

            // Preview ngay lập tức
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                img.style.display = 'block';
                placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // Upload lên server
            const result = await this.uploadAvatar(file);
            if (!result.success) {
                alert('Lỗi upload: ' + result.message);
                // Khôi phục trạng thái cũ
                if (!this.currentProfile?.avatar) {
                    img.style.display = 'none';
                    placeholder.style.display = 'flex';
                }
            }
        });
    },

    /**
     * Thiết lập xử lý click cho option buttons
     */
    setupOptionButtons() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.querySelector('input');
                if (input) {
                    input.checked = true;
                    // Bỏ active từ các nút anh em
                    btn.parentElement.querySelectorAll('.option-btn').forEach(sibling => {
                        sibling.classList.remove('active');
                    });
                    btn.classList.add('active');
                }
            });
        });
    },

    /**
     * Điền sẵn form với dữ liệu hồ sơ có sẵn
     */
    prefillForm(profile) {
        // Avatar
        if (profile.avatar) {
            const img = document.getElementById('avatarImg');
            const placeholder = document.getElementById('avatarPlaceholder');
            img.src = profile.avatar;
            img.style.display = 'block';
            placeholder.style.display = 'none';
        }

        // Tên hiển thị
        if (profile.display_name) {
            document.getElementById('displayName').value = profile.display_name;
        }

        // Bio
        if (profile.bio) {
            document.getElementById('bio').value = profile.bio;
        }

        // Social links
        if (profile.social_links) {
            if (profile.social_links.facebook) {
                document.getElementById('socialFacebook').value = profile.social_links.facebook;
            }
            if (profile.social_links.instagram) {
                document.getElementById('socialInstagram').value = profile.social_links.instagram;
            }
            if (profile.social_links.tiktok) {
                document.getElementById('socialTiktok').value = profile.social_links.tiktok;
            }
            if (profile.social_links.youtube) {
                document.getElementById('socialYoutube').value = profile.social_links.youtube;
            }
        }

        // Mục tiêu
        if (profile.goal) {
            const goalBtn = document.querySelector(`#goalOptions [data-value="${profile.goal}"]`);
            if (goalBtn) {
                goalBtn.click();
            }
        }

        // Trình độ
        if (profile.level) {
            const levelBtn = document.querySelector(`#levelOptions [data-value="${profile.level}"]`);
            if (levelBtn) {
                levelBtn.click();
            }
        }

        // Thiết bị
        if (profile.equipment) {
            const equipBtn = document.querySelector(`#equipmentOptions [data-value="${profile.equipment}"]`);
            if (equipBtn) {
                equipBtn.click();
            }
        }

        // Số ngày mỗi tuần
        if (profile.days_per_week) {
            const daysBtn = document.querySelector(`#daysOptions [data-value="${profile.days_per_week}"]`);
            if (daysBtn) {
                daysBtn.click();
            }
        }

        // Thời gian mỗi buổi
        if (profile.session_minutes) {
            document.getElementById('sessionMinutes').value = profile.session_minutes;
        }

        // Hạn chế
        if (profile.constraints) {
            document.getElementById('constraints').value = profile.constraints;
        }

        // Lịch khả dụng
        if (profile.availability) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            days.forEach(day => {
                const checkbox = document.querySelector(`[name="availability_${day}"]`);
                if (checkbox && profile.availability[day] && profile.availability[day].available) {
                    checkbox.checked = true;
                }
            });
        }
    },

    /**
     * Thu thập dữ liệu form thành object
     */
    gatherFormData() {
        const form = document.getElementById('profileForm');

        // Lấy giá trị radio được chọn
        const goal = form.querySelector('input[name="goal"]:checked');
        const level = form.querySelector('input[name="level"]:checked');
        const equipment = form.querySelector('input[name="equipment"]:checked');
        const daysPerWeek = form.querySelector('input[name="days_per_week"]:checked');

        // Xây dựng object lịch khả dụng
        const availability = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            const checkbox = form.querySelector(`[name="availability_${day}"]`);
            availability[day] = {
                available: checkbox ? checkbox.checked : false,
                time: 'anytime'
            };
        });

        // Xây dựng object social links
        const socialLinks = {
            facebook: document.getElementById('socialFacebook').value || null,
            instagram: document.getElementById('socialInstagram').value || null,
            tiktok: document.getElementById('socialTiktok').value || null,
            youtube: document.getElementById('socialYoutube').value || null
        };

        return {
            display_name: document.getElementById('displayName').value || null,
            bio: document.getElementById('bio').value || null,
            social_links: socialLinks,
            goal: goal ? goal.value : null,
            level: level ? level.value : null,
            equipment: equipment ? equipment.value : null,
            days_per_week: daysPerWeek ? parseInt(daysPerWeek.value) : 3,
            session_minutes: parseInt(document.getElementById('sessionMinutes').value),
            constraints: document.getElementById('constraints').value,
            availability: availability
        };
    }
};
