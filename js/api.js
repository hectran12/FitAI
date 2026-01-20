/**
 * FitAI - API Helper Module
 * 
 * Handles all API communication with the PHP backend
 */

const API = {
    baseUrl: '/api',
    csrfToken: null,

    /**
     * Initialize API with CSRF token
     */
    async init() {
        try {
            const session = await this.get('/auth/session.php');
            this.csrfToken = session.csrf_token;
            return session;
        } catch (error) {
            console.error('Failed to initialize API:', error);
            return { authenticated: false };
        }
    },

    /**
     * Make a GET request
     */
    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        return this._handleResponse(response);
    },

    /**
     * Make a POST request
     */
    async post(endpoint, data = {}) {
        // Include CSRF token in data
        if (this.csrfToken) {
            data.csrf_token = this.csrfToken;
        }

        const response = await fetch(this.baseUrl + endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': this.csrfToken || ''
            },
            body: JSON.stringify(data)
        });

        const result = await this._handleResponse(response);

        // Update CSRF token if provided
        if (result.csrf_token) {
            this.csrfToken = result.csrf_token;
        }

        return result;
    },

    /**
     * Make a DELETE request
     */
    async delete(endpoint, data = {}) {
        // Include CSRF token in data
        if (this.csrfToken) {
            data.csrf_token = this.csrfToken;
        }

        const response = await fetch(this.baseUrl + endpoint, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': this.csrfToken || ''
            },
            body: JSON.stringify(data)
        });

        return this._handleResponse(response);
    },

    /**
     * Handle API response
     */
    async _handleResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                throw new APIError(data.message || 'Request failed', response.status, data);
            }

            return data;
        }

        if (!response.ok) {
            throw new APIError('Request failed', response.status);
        }

        return await response.text();
    }
};

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Auth API endpoints
 */
const AuthAPI = {
    async login(email, password) {
        return API.post('/auth/login.php', { email, password });
    },

    async register(email, password, passwordConfirm) {
        return API.post('/auth/register.php', {
            email,
            password,
            password_confirm: passwordConfirm
        });
    },

    async logout() {
        return API.post('/auth/logout.php');
    },

    async checkSession() {
        return API.get('/auth/session.php');
    }
};

/**
 * Profile API endpoints
 */
const ProfileAPI = {
    async get() {
        return API.get('/profile/get.php');
    },

    async update(profileData) {
        return API.post('/profile/update.php', profileData);
    }
};

/**
 * Plans API endpoints
 */
const PlansAPI = {
    async get(weekStart = null) {
        const params = weekStart ? { week_start: weekStart } : {};
        return API.get('/plans/get.php', params);
    },

    async generate() {
        return API.post('/plans/generate.php');
    },

    async regenerate() {
        return API.post('/plans/regenerate.php');
    },

    async adjust() {
        return API.post('/plans/adjust.php');
    }
};

/**
 * Logs API endpoints
 */
const LogsAPI = {
    async save(planDayId, status, fatigueRating = null, notes = null) {
        return API.post('/logs/save.php', {
            plan_day_id: planDayId,
            status,
            fatigue_rating: fatigueRating,
            notes
        });
    },

    async get(weekStart = null, limit = 50) {
        const params = { limit };
        if (weekStart) params.week_start = weekStart;
        return API.get('/logs/get.php', params);
    }
};

/**
 * Dashboard API endpoints
 */
const DashboardAPI = {
    async getStats() {
        return API.get('/dashboard/stats.php');
    }
};

/**
 * Exercises API endpoints
 */
const ExercisesAPI = {
    async list(filters = {}) {
        return API.get('/exercises/list.php', filters);
    }
};
