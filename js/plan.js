/**
 * FitAI - Workout Plan Module (Vietnamese)
 * 
 * Quản lý hiển thị, tạo kế hoạch và ghi nhật ký tập luyện
 */

const Plan = {
    currentPlan: null,
    viewMode: 'list', // 'list' hoặc 'calendar'

    /**
     * Tải kế hoạch tuần hiện tại
     */
    async loadPlan(weekStart = null) {
        try {
            const result = await PlansAPI.get(weekStart);
            if (result.success) {
                this.currentPlan = result.has_plan ? result.plan : null;
                return result;
            }
        } catch (error) {
            console.error('Lỗi tải kế hoạch:', error);
        }
        return { success: false, has_plan: false };
    },

    /**
     * Tạo kế hoạch mới
     */
    async generatePlan() {
        try {
            const result = await PlansAPI.generate();
            if (result.success) {
                this.currentPlan = result.plan;
                return { success: true, plan: result.plan };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Tạo lại kế hoạch
     */
    async regeneratePlan() {
        try {
            const result = await PlansAPI.regenerate();
            if (result.success) {
                this.currentPlan = result.plan;
                return { success: true, plan: result.plan };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Điều chỉnh kế hoạch tuần tiếp theo
     */
    async adjustPlan() {
        try {
            const result = await PlansAPI.adjust();
            if (result.success) {
                return { success: true, plan: result.plan };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Ghi nhật ký hoàn thành
     */
    async logWorkout(planDayId, status, fatigueRating = null, notes = null) {
        try {
            const result = await LogsAPI.save(planDayId, status, fatigueRating, notes);
            if (result.success) {
                // Cập nhật dữ liệu local
                if (this.currentPlan) {
                    const day = this.currentPlan.days.find(d => d.id === planDayId);
                    if (day) {
                        day.log = {
                            status: status,
                            fatigue_rating: fatigueRating,
                            notes: notes
                        };
                    }
                }
                return { success: true };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Render trang kế hoạch
     */
    renderPlanPage() {
        return `
            <div class="plan-page">
                <div class="container">
                    <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
                        <div>
                            <h1><i class="fas fa-calendar-alt"></i> Kế Hoạch Tập Luyện</h1>
                            <p class="text-muted" id="weekLabel">Kế hoạch tuần này</p>
                        </div>
                        <div class="flex gap-md">
                            <button class="btn btn-secondary" id="regenerateBtn" style="display: none;">
                                <i class="fas fa-sync-alt"></i> Tạo lại
                            </button>
                            <button class="btn btn-primary" id="adjustBtn" style="display: none;">
                                <i class="fas fa-chart-line"></i> Điều chỉnh tuần sau
                            </button>
                        </div>
                    </div>

                    <!-- Toggle hiển thị -->
                    <div class="tabs">
                        <button class="tab active" data-view="list" id="listViewBtn">
                            <i class="fas fa-list"></i> Danh sách
                        </button>
                        <button class="tab" data-view="calendar" id="calendarViewBtn">
                            <i class="fas fa-calendar"></i> Lịch
                        </button>
                    </div>

                    <div id="planAlert"></div>
                    <div id="planContent">
                        <div class="loading">
                            <div class="spinner"></div>
                        </div>
                    </div>

                    <!-- Nguyên tắc và Ghi chú -->
                    <div id="planInfo" style="display: none; margin-top: var(--space-xl);">
                        <div class="grid grid-2">
                            <div class="card">
                                <h3><i class="fas fa-book"></i> Nguyên Tắc Tập Luyện</h3>
                                <ul id="principlesList" style="list-style: disc; padding-left: 1.5rem; margin-top: var(--space-md);">
                                </ul>
                            </div>
                            <div class="card">
                                <h3><i class="fas fa-sticky-note"></i> Ghi Chú</h3>
                                <ul id="notesList" style="list-style: disc; padding-left: 1.5rem; margin-top: var(--space-md);">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Khởi tạo trang kế hoạch
     */
    async initPlanPage() {
        // Tải dữ liệu kế hoạch
        const result = await this.loadPlan();

        // Render nội dung dựa trên có kế hoạch hay không
        if (result.has_plan) {
            this.renderPlanContent();
            document.getElementById('regenerateBtn').style.display = 'block';
            document.getElementById('adjustBtn').style.display = 'block';
            document.getElementById('planInfo').style.display = 'block';
            this.renderPlanInfo();
        } else {
            this.renderNoPlan();
        }

        // Thiết lập toggle hiển thị
        this.setupViewToggle();

        // Thiết lập nút tạo lại
        document.getElementById('regenerateBtn').addEventListener('click', async () => {
           
                await this.handleRegenerate();
       
        });

        // Thiết lập nút điều chỉnh
        document.getElementById('adjustBtn').addEventListener('click', async () => {
            await this.handleAdjust();
        });
    },

    /**
     * Render trạng thái chưa có kế hoạch
     */
    renderNoPlan() {
        const content = document.getElementById('planContent');
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-dumbbell"></i></div>
                <h3 class="empty-state-title">Chưa Có Kế Hoạch</h3>
                <p class="empty-state-text">Tạo kế hoạch tập luyện 7 ngày được cá nhân hóa với AI</p>
                <button class="btn btn-primary btn-lg" id="generatePlanBtn">
                    <i class="fas fa-magic"></i> Tạo Kế Hoạch
                </button>
            </div>
        `;

        document.getElementById('generatePlanBtn').addEventListener('click', async () => {
            await this.handleGenerate();
        });
    },

    /**
     * Xử lý tạo kế hoạch
     */
    async handleGenerate() {
        const btn = document.getElementById('generatePlanBtn');
        const content = document.getElementById('planContent');
        const alert = document.getElementById('planAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
        alert.innerHTML = '';

        const result = await this.generatePlan();

        if (result.success) {
            this.renderPlanContent();
            document.getElementById('regenerateBtn').style.display = 'block';
            document.getElementById('adjustBtn').style.display = 'block';
            document.getElementById('planInfo').style.display = 'block';
            this.renderPlanInfo();
        } else {
            alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Tạo Kế Hoạch';
        }
    },

    /**
     * Xử lý tạo lại kế hoạch
     */
    async handleRegenerate() {
        const btn = document.getElementById('regenerateBtn');
        const alert = document.getElementById('planAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo lại...';
        alert.innerHTML = '';

        const result = await this.regeneratePlan();

        if (result.success) {
            this.renderPlanContent();
            this.renderPlanInfo();
            alert.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Đã tạo lại kế hoạch thành công!</div>';
        } else {
            alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Tạo lại';
    },

    /**
     * Xử lý điều chỉnh kế hoạch tuần sau
     */
    async handleAdjust() {
        const btn = document.getElementById('adjustBtn');
        const alert = document.getElementById('planAlert');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang điều chỉnh...';
        alert.innerHTML = '';

        const result = await this.adjustPlan();

        if (result.success) {
            alert.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> Đã tạo kế hoạch tuần sau! Bắt đầu từ ${result.plan.week_start}.
                    <a href="#" onclick="Plan.loadNextWeek(); return false;">Xem tuần sau →</a>
                </div>
            `;
        } else {
            alert.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${result.message}</div>`;
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-chart-line"></i> Điều chỉnh tuần sau';
    },

    /**
     * Tải kế hoạch tuần sau
     */
    async loadNextWeek() {
        const nextWeek = this.getNextWeekStart();
        const result = await this.loadPlan(nextWeek);
        if (result.has_plan) {
            document.getElementById('weekLabel').textContent = `Tuần từ ${nextWeek}`;
            this.renderPlanContent();
            this.renderPlanInfo();
        }
    },

    /**
     * Lấy ngày bắt đầu tuần sau
     */
    getNextWeekStart() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + 7;
        const nextMonday = new Date(today.setDate(diff));
        return nextMonday.toISOString().split('T')[0];
    },

    /**
     * Thiết lập nút toggle hiển thị
     */
    setupViewToggle() {
        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.viewMode = 'list';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById('listViewBtn').classList.add('active');
            this.renderPlanContent();
        });

        document.getElementById('calendarViewBtn').addEventListener('click', () => {
            this.viewMode = 'calendar';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById('calendarViewBtn').classList.add('active');
            this.renderPlanContent();
        });
    },

    /**
     * Render nội dung kế hoạch dựa trên chế độ xem
     */
    renderPlanContent() {
        const content = document.getElementById('planContent');

        if (!this.currentPlan || !this.currentPlan.days) {
            this.renderNoPlan();
            return;
        }

        if (this.viewMode === 'calendar') {
            content.innerHTML = this.renderCalendarView();
        } else {
            content.innerHTML = this.renderListView();
        }

        this.setupLogButtons();
    },

    /**
     * Render chế độ xem danh sách
     */
    renderListView() {
        if (!this.currentPlan || !this.currentPlan.days.length) {
            return '<p class="text-muted">Không có buổi tập nào được lên lịch</p>';
        }

        const today = new Date().toISOString().split('T')[0];

        return `
            <div class="grid" style="gap: var(--space-lg);">
                ${this.currentPlan.days.map((day, index) => {
            const isToday = day.date === today;
            const status = day.log ? day.log.status : 'pending';
            const statusClass = status === 'done' ? 'done' : status === 'skipped' ? 'skipped' : '';

            return `
                        <div class="workout-card ${statusClass}" id="workout-${day.id}">
                            <div class="workout-card-header">
                                <div>
                                    <div class="workout-card-date">${this.formatDate(day.date)}${isToday ? ' (Hôm nay)' : ''}</div>
                                    <div class="workout-card-title">${day.title}</div>
                                </div>
                                <div class="flex gap-sm items-center">
                                    <span class="badge ${status === 'done' ? 'badge-success' : status === 'skipped' ? 'badge-muted' : ''}">
                                        ${status === 'done' ? '<i class="fas fa-check"></i> Hoàn thành' : status === 'skipped' ? 'Bỏ qua' : `<i class="fas fa-clock"></i> ~${day.estimated_minutes} phút`}
                                    </span>
                                    ${status === 'pending' ? `
                                        <button class="btn btn-sm btn-primary log-done-btn" data-day-id="${day.id}">
                                            <i class="fas fa-check"></i> Đánh dấu hoàn thành
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="workout-card-body">
                                <ul class="exercise-list">
                                    ${day.sessions.map((session, i) => `
                                        <li class="exercise-item">
                                            <span class="exercise-number">${i + 1}</span>
                                            <div class="exercise-info">
                                                <div class="exercise-name">${session.exercise}</div>
                                                <div class="exercise-details">
                                                    ${session.sets} hiệp × ${session.reps} lần • nghỉ ${session.rest_sec}s
                                                </div>
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    /**
     * Render chế độ xem lịch
     */
    renderCalendarView() {
        const weekStart = new Date(this.currentPlan.week_start);
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const today = new Date().toISOString().split('T')[0];

        // Tạo map các ngày tập
        const workoutMap = {};
        this.currentPlan.days.forEach(day => {
            workoutMap[day.date] = day;
        });

        let calendarHtml = `
            <div class="calendar">
                ${days.map(d => `<div class="calendar-header">${d}</div>`).join('')}
        `;

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const workout = workoutMap[dateStr];
            const isToday = dateStr === today;

            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (workout) classes += ' workout';
            if (workout && workout.log && workout.log.status === 'done') classes += ' done';

            calendarHtml += `
                <div class="${classes}" data-date="${dateStr}" ${workout ? `data-day-id="${workout.id}"` : ''}>
                    <div class="calendar-day-number">${date.getDate()}</div>
                    ${workout ? `<div class="calendar-day-indicator" title="${workout.title}"></div>` : ''}
                </div>
            `;
        }

        calendarHtml += '</div>';

        // Thêm chi tiết ngày được chọn
        calendarHtml += `
            <div id="calendarDetails" style="margin-top: var(--space-lg);">
                <p class="text-muted text-center">Nhấn vào ngày để xem chi tiết</p>
            </div>
        `;

        return calendarHtml;
    },

    /**
     * Thiết lập các nút ghi nhật ký và tương tác lịch
     */
    setupLogButtons() {
        // Nút đánh dấu hoàn thành
        document.querySelectorAll('.log-done-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayId = parseInt(btn.dataset.dayId);
                this.showLogModal(dayId);
            });
        });

        // Click ngày trong lịch
        document.querySelectorAll('.calendar-day[data-day-id]').forEach(day => {
            day.addEventListener('click', () => {
                const dayId = parseInt(day.dataset.dayId);
                this.showDayDetails(dayId);
            });
        });
    },

    /**
     * Hiển thị modal ghi nhật ký
     */
    showLogModal(dayId) {
        const day = this.currentPlan.days.find(d => d.id === dayId);
        if (!day) return;

        Modal.show({
            title: `Ghi nhật ký: ${day.title}`,
            body: `
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-check-circle"></i> Trạng thái</label>
                    <div class="option-group">
                        <label class="option-btn active">
                            <input type="radio" name="logStatus" value="done" checked>
                            <i class="fas fa-check"></i> Hoàn thành
                        </label>
                        <label class="option-btn">
                            <input type="radio" name="logStatus" value="partial">
                            <i class="fas fa-adjust"></i> Một phần
                        </label>
                        <label class="option-btn">
                            <input type="radio" name="logStatus" value="skipped">
                            <i class="fas fa-times"></i> Bỏ qua
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-battery-half"></i> Mức độ mệt mỏi (1-5)</label>
                    <div class="fatigue-rating">
                        ${[1, 2, 3, 4, 5].map(n => `
                            <button type="button" class="fatigue-btn" data-value="${n}">${n}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-comment"></i> Ghi chú (tùy chọn)</label>
                    <textarea class="form-textarea" id="logNotes" placeholder="Buổi tập hôm nay thế nào?"></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.hide()"><i class="fas fa-times"></i> Hủy</button>
                <button class="btn btn-primary" id="saveLogBtn"><i class="fas fa-save"></i> Lưu</button>
            `,
            onShow: () => {
                // Thiết lập option buttons
                document.querySelectorAll('.modal .option-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        btn.querySelector('input').checked = true;
                    });
                });

                // Thiết lập fatigue buttons
                document.querySelectorAll('.fatigue-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.fatigue-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    });
                });

                // Nút lưu
                document.getElementById('saveLogBtn').addEventListener('click', async () => {
                    const status = document.querySelector('input[name="logStatus"]:checked').value;
                    const fatigueBtn = document.querySelector('.fatigue-btn.active');
                    const fatigue = fatigueBtn ? parseInt(fatigueBtn.dataset.value) : null;
                    const notes = document.getElementById('logNotes').value;

                    const result = await this.logWorkout(dayId, status, fatigue, notes);
                    if (result.success) {
                        Modal.hide();
                        this.renderPlanContent();
                    }
                });
            }
        });
    },

    /**
     * Hiển thị chi tiết ngày trong lịch
     */
    showDayDetails(dayId) {
        const day = this.currentPlan.days.find(d => d.id === dayId);
        if (!day) return;

        const details = document.getElementById('calendarDetails');
        const status = day.log ? day.log.status : 'pending';

        details.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${day.title}</h3>
                        <p class="text-muted">${this.formatDate(day.date)} • ~${day.estimated_minutes} phút</p>
                    </div>
                    ${status === 'pending' ? `
                        <button class="btn btn-primary log-done-btn" data-day-id="${day.id}">
                            <i class="fas fa-check"></i> Đánh dấu hoàn thành
                        </button>
                    ` : `
                        <span class="badge ${status === 'done' ? 'badge-success' : 'badge-muted'}">
                            ${status === 'done' ? '<i class="fas fa-check"></i> Hoàn thành' : 'Bỏ qua'}
                        </span>
                    `}
                </div>
                <ul class="exercise-list">
                    ${day.sessions.map((session, i) => `
                        <li class="exercise-item">
                            <span class="exercise-number">${i + 1}</span>
                            <div class="exercise-info">
                                <div class="exercise-name">${session.exercise}</div>
                                <div class="exercise-details">
                                    ${session.sets} hiệp × ${session.reps} lần • nghỉ ${session.rest_sec}s
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        this.setupLogButtons();
    },

    /**
     * Render nguyên tắc và ghi chú kế hoạch
     */
    renderPlanInfo() {
        if (!this.currentPlan) return;

        const principlesList = document.getElementById('principlesList');
        const notesList = document.getElementById('notesList');

        if (principlesList && this.currentPlan.principles) {
            principlesList.innerHTML = this.currentPlan.principles
                .map(p => `<li style="margin-bottom: 0.5rem; color: var(--text-secondary)">${p}</li>`)
                .join('');
        }

        if (notesList && this.currentPlan.notes) {
            notesList.innerHTML = this.currentPlan.notes
                .map(n => `<li style="margin-bottom: 0.5rem; color: var(--text-secondary)">${n}</li>`)
                .join('');
        }
    },

    /**
     * Format ngày để hiển thị
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('vi-VN', options);
    }
};
