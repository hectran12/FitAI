/**
 * FitAI - Dashboard Module (Vietnamese)
 * 
 * Quản lý dashboard với thống kê, buổi tập hôm nay và biểu đồ
 */

const Dashboard = {
    stats: null,

    /**
     * Tải thống kê dashboard
     */
    async loadStats() {
        try {
            const result = await DashboardAPI.getStats();
            if (result.success) {
                this.stats = result.stats;
                return result.stats;
            }
        } catch (error) {
            console.error('Lỗi tải thống kê:', error);
        }
        return null;
    },

    /**
     * Render trang dashboard
     */
    renderDashboardPage() {
        return `
            <div class="dashboard-page">
                <div class="container">
                    <div class="dashboard-header">
                        <div>
                            <h1><i class="fas fa-chart-line"></i> Bảng Điều Khiển</h1>
                            <p class="text-muted">Chào mừng trở lại! Đây là tổng quan về tiến độ của bạn.</p>
                        </div>
                        <a href="#" class="btn btn-primary" onclick="App.navigate('plan'); return false;">
                            <i class="fas fa-calendar-alt"></i> Xem Kế Hoạch
                        </a>
                    </div>

                    <div id="dashboardContent">
                        <div class="loading">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Khởi tạo dashboard
     */
    async initDashboard() {
        const stats = await this.loadStats();
        this.renderDashboardContent(stats);
    },

    /**
     * Render nội dung dashboard
     */
    renderDashboardContent(stats) {
        const content = document.getElementById('dashboardContent');

        if (!stats) {
            content.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i> Không thể tải dữ liệu. Vui lòng thử lại.
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <!-- Thẻ thống kê -->
            <div class="stats-grid">
                <div class="stat-card-enhanced">
                    <div class="stat-value ${stats.current_streak > 0 ? 'text-primary' : ''}">
                        ${stats.current_streak}
                        ${stats.current_streak > 0 ? '<i class="fas fa-fire text-primary"></i>' : ''}
                    </div>
                    <div class="stat-label">Chuỗi ngày</div>
                </div>
                <div class="stat-card-enhanced">
                    <div class="stat-value">${stats.weekly_completion}%</div>
                    <div class="stat-label">Tuần này</div>
                    <div class="progress" style="margin-top: var(--space-sm);">
                        <div class="progress-bar ${stats.weekly_completion >= 70 ? 'green' : ''}" 
                             style="width: ${stats.weekly_completion}%"></div>
                    </div>
                </div>
                <div class="stat-card-enhanced">
                    <div class="stat-value">${stats.completed_this_week}/${stats.total_this_week}</div>
                    <div class="stat-label">Buổi tập hoàn thành</div>
                </div>
                <div class="stat-card-enhanced">
                    <div class="stat-value">${stats.total_completed}</div>
                    <div class="stat-label">Tổng tất cả</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Nội dung chính -->
                <div class="dashboard-main">
                    <!-- Buổi tập hôm nay -->
                    ${this.renderTodayWorkout(stats.today_session)}

                    <!-- Buổi tập tiếp theo -->
                    ${stats.next_session && !stats.today_session ? this.renderNextSession(stats.next_session) : ''}

                    <!-- Biểu đồ tiến độ tuần -->
                    <div class="card">
                        <h3 style="margin-bottom: var(--space-md);"><i class="fas fa-chart-bar"></i> Tiến Độ Tuần</h3>
                        <div class="chart-container">
                            ${this.renderWeeklyChart(stats)}
                        </div>
                    </div>
                </div>

                <!-- Thanh bên -->
                <div class="dashboard-sidebar">
                    <!-- Hoạt động gần đây -->
                    <div class="card">
                        <h3 style="margin-bottom: var(--space-md);"><i class="fas fa-history"></i> Hoạt Động Gần Đây</h3>
                        ${this.renderRecentActivity(stats.recent_activity)}
                    </div>

                    <!-- Thao tác nhanh -->
                    <div class="card">
                        <h3 style="margin-bottom: var(--space-md);"><i class="fas fa-bolt"></i> Thao Tác Nhanh</h3>
                        <div class="quick-actions">
                            <a href="#" class="btn btn-secondary btn-block" onclick="App.navigate('plan'); return false;">
                                <i class="fas fa-calendar-alt"></i> Xem Kế Hoạch
                            </a>
                            <a href="#" class="btn btn-secondary btn-block" onclick="App.navigate('profile'); return false;">
                                <i class="fas fa-user-cog"></i> Chỉnh Sửa Hồ Sơ
                            </a>
                            ${!stats.has_plan ? `
                                <button class="btn btn-primary btn-block" id="quickGenerateBtn">
                                    <i class="fas fa-magic"></i> Tạo Kế Hoạch
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Thiết lập nút tạo nhanh
        const quickGenBtn = document.getElementById('quickGenerateBtn');
        if (quickGenBtn) {
            quickGenBtn.addEventListener('click', async () => {
                quickGenBtn.disabled = true;
                quickGenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
                const result = await Plan.generatePlan();
                if (result.success) {
                    App.navigate('plan');
                } else {
                    quickGenBtn.disabled = false;
                    quickGenBtn.innerHTML = '<i class="fas fa-magic"></i> Tạo Kế Hoạch';
                    alert('Lỗi tạo kế hoạch: ' + result.message);
                }
            });
        }

        // Thiết lập nút ghi nhật ký hôm nay
        const logTodayBtn = document.getElementById('logTodayBtn');
        if (logTodayBtn) {
            logTodayBtn.addEventListener('click', () => {
                const dayId = parseInt(logTodayBtn.dataset.dayId);
                Plan.showLogModal(dayId);
            });
        }
    },

    /**
     * Render phần buổi tập hôm nay
     */
    renderTodayWorkout(todaySession) {
        if (!todaySession) {
            return `
                <div class="card">
                    <div class="empty-state" style="padding: var(--space-lg);">
                        <div style="font-size: 2rem; margin-bottom: var(--space-md);"><i class="fas fa-couch"></i></div>
                        <h3>Ngày Nghỉ</h3>
                        <p class="text-muted">Không có buổi tập nào hôm nay. Hãy nghỉ ngơi tốt nhé!</p>
                    </div>
                </div>
            `;
        }

        const isDone = todaySession.status === 'done';

        return `
            <div class="card today-workout ${isDone ? 'card-green' : 'card-primary'}">
                <div class="flex justify-between items-center" style="margin-bottom: var(--space-md);">
                    <div>
                        <h3><i class="fas fa-dumbbell"></i> ${todaySession.title}</h3>
                        <p class="text-muted">Buổi tập hôm nay • ~${todaySession.estimated_minutes} phút</p>
                    </div>
                    ${isDone ? `
                        <span class="badge badge-success"><i class="fas fa-check"></i> Hoàn thành</span>
                    ` : `
                        <button class="btn btn-primary" id="logTodayBtn" data-day-id="${todaySession.id}">
                            <i class="fas fa-check"></i> Đánh dấu hoàn thành
                        </button>
                    `}
                </div>
                
                <ul class="exercise-list">
                    ${todaySession.exercises.slice(0, 5).map((ex, i) => `
                        <li class="exercise-item">
                            <span class="exercise-number">${i + 1}</span>
                            <div class="exercise-info">
                                <div class="exercise-name">${ex.exercise_name}</div>
                                <div class="exercise-details">
                                    ${ex.sets} hiệp × ${ex.reps} lần
                                </div>
                            </div>
                        </li>
                    `).join('')}
                    ${todaySession.exercises.length > 5 ? `
                        <li class="exercise-item">
                            <span class="text-muted">+${todaySession.exercises.length - 5} bài tập khác</span>
                        </li>
                    ` : ''}
                </ul>
            </div>
        `;
    },

    /**
     * Render phần buổi tập tiếp theo
     */
    renderNextSession(nextSession) {
        const date = new Date(nextSession.date);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const dateStr = date.toLocaleDateString('vi-VN', options);

        return `
            <div class="card" style="margin-top: var(--space-lg);">
                <div class="flex justify-between items-center">
                    <div>
                        <h4><i class="fas fa-forward"></i> ${nextSession.title}</h4>
                        <p class="text-muted">Buổi tập tiếp theo: ${dateStr}</p>
                    </div>
                    <span class="badge"><i class="fas fa-clock"></i> ~${nextSession.estimated_minutes} phút</span>
                </div>
            </div>
        `;
    },

    /**
     * Render biểu đồ tiến độ tuần bằng CSS bars
     */
    renderWeeklyChart(stats) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        // Lấy ngày tập từ kế hoạch hiện tại
        let workoutDays = [];
        if (Plan.currentPlan && Plan.currentPlan.days) {
            workoutDays = Plan.currentPlan.days.map(d => {
                const date = new Date(d.date);
                return {
                    dayIndex: (date.getDay() + 6) % 7, // Chuyển đổi thành T2=0
                    status: d.log ? d.log.status : 'pending'
                };
            });
        }

        return `
            <div class="bar-chart">
                ${days.map((day, index) => {
            const workout = workoutDays.find(w => w.dayIndex === index);
            let height = 20;
            let barClass = 'empty';

            if (workout) {
                if (workout.status === 'done') {
                    height = 100;
                    barClass = '';
                } else if (workout.status === 'skipped') {
                    height = 30;
                    barClass = 'empty';
                } else {
                    height = 50;
                    barClass = '';
                }
            }

            return `
                        <div class="bar-item">
                            <div class="bar ${barClass}" style="height: ${height}%"></div>
                            <span class="bar-label">${day}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    /**
     * Render danh sách hoạt động gần đây
     */
    renderRecentActivity(activities) {
        if (!activities || activities.length === 0) {
            return '<p class="text-muted">Chưa có hoạt động nào</p>';
        }

        return `
            <ul style="list-style: none;">
                ${activities.map(activity => {
            const date = new Date(activity.date);
            const dateStr = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
            const statusIcon = activity.status === 'done' ? 'fa-check' : activity.status === 'skipped' ? 'fa-times' : 'fa-circle';
            const statusColor = activity.status === 'done' ? 'var(--green)' : 'var(--muted)';

            return `
                        <li style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) 0; border-bottom: 1px solid var(--border);">
                            <span style="color: ${statusColor}; font-weight: bold;"><i class="fas ${statusIcon}"></i></span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500;">${activity.title}</div>
                                <div class="text-muted" style="font-size: 0.875rem;">${dateStr}</div>
                            </div>
                            ${activity.fatigue_rating ? `
                                <span class="badge badge-muted"><i class="fas fa-battery-half"></i> ${activity.fatigue_rating}/5</span>
                            ` : ''}
                        </li>
                    `;
        }).join('')}
            </ul>
        `;
    }
};
