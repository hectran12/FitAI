/**
 * FitAI - Music Library Module
 * 
 * Kho nhạc workout với audio player
 */

const Music = {
    currentTrack: null,
    audioPlayer: null,
    isPlaying: false,
    playlist: [],
    currentIndex: 0,

    async init() {
        this.createMiniPlayer();
        this.bindEvents();
        await this.loadTracks();
    },

    renderPage() {
        return `
            <div class="music-page">
                <div class="container">
                    <div class="music-header">
                        <h1><i class="fas fa-music"></i> Kho Nhạc Workout</h1>
                        <p class="text-muted">Nhạc năng động cho buổi tập của bạn</p>
                    </div>
                    
                    <div class="music-categories" id="musicCategories">
                        <button class="category-btn active" data-id="">
                            <i class="fas fa-globe"></i> Tất cả
                        </button>
                    </div>
                    
                    <div class="music-tabs">
                        <button class="music-tab active" data-tab="all">
                            <i class="fas fa-list"></i> Tất cả
                        </button>
                        <button class="music-tab" data-tab="favorites">
                            <i class="fas fa-heart"></i> Yêu thích
                        </button>
                    </div>
                    
                    <div class="music-tracks" id="musicTracks">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    createMiniPlayer() {
        if (document.getElementById('miniPlayer')) return;

        const player = document.createElement('div');
        player.id = 'miniPlayer';
        player.className = 'mini-player hidden';
        player.innerHTML = `
            <div class="mini-player-info">
                <img src="/images/default-album.png" alt="" class="mini-player-cover" id="miniPlayerCover">
                <div class="mini-player-text">
                    <div class="mini-player-title" id="miniPlayerTitle">No track</div>
                    <div class="mini-player-artist" id="miniPlayerArtist">-</div>
                </div>
            </div>
            <div class="mini-player-controls">
                <button class="mini-btn" onclick="Music.prev()"><i class="fas fa-step-backward"></i></button>
                <button class="mini-btn play-btn" id="miniPlayBtn" onclick="Music.togglePlay()">
                    <i class="fas fa-play"></i>
                </button>
                <button class="mini-btn" onclick="Music.next()"><i class="fas fa-step-forward"></i></button>
            </div>
            <div class="mini-player-progress">
                <input type="range" id="miniProgress" value="0" max="100" onchange="Music.seek(this.value)">
            </div>
            <div class="mini-player-actions">
                <button class="mini-player-float" onclick="Music.floatMiniPlayer()" title="Floating">
                    <i class="fas fa-compress-alt"></i>
                </button>
                <button class="mini-player-minimize" onclick="Music.minimizeMiniPlayer()" title="Thu nhỏ">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <button class="mini-player-close" onclick="Music.closeMiniPlayer()" title="Đóng">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <button class="floating-expand-btn" onclick="Music.floatMiniPlayer()" title="Mở rộng">
                <i class="fas fa-expand"></i>
            </button>
            <audio id="audioPlayer"></audio>
        `;
        document.body.appendChild(player);

        this.audioPlayer = document.getElementById('audioPlayer');
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.next());
        this.audioPlayer.addEventListener('play', () => this.updatePlayButton(true));
        this.audioPlayer.addEventListener('pause', () => this.updatePlayButton(false));

        // Click on floating player to expand
        player.addEventListener('click', (e) => {
            if (player.classList.contains('floating') && !e.target.closest('button')) {
                this.floatMiniPlayer(); // Toggle back to full
            }
        });
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Category filter
            if (e.target.closest('.category-btn')) {
                const btn = e.target.closest('.category-btn');
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadTracks(btn.dataset.id);
            }

            // Tab switch
            if (e.target.closest('.music-tab')) {
                const tab = e.target.closest('.music-tab');
                document.querySelectorAll('.music-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (tab.dataset.tab === 'favorites') {
                    this.loadFavorites();
                } else {
                    this.loadTracks();
                }
            }

            // Play track
            if (e.target.closest('.track-play-btn')) {
                const btn = e.target.closest('.track-play-btn');
                const trackId = parseInt(btn.dataset.id);
                const track = this.playlist.find(t => t.id === trackId);
                if (track) this.play(track);
            }

            // Favorite toggle
            if (e.target.closest('.track-fav-btn')) {
                const btn = e.target.closest('.track-fav-btn');
                this.toggleFavorite(parseInt(btn.dataset.id), btn);
            }
        });
    },

    async loadTracks(categoryId = '') {
        const container = document.getElementById('musicTracks');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const params = categoryId ? { category_id: categoryId } : {};
            const result = await API.get('/music/tracks', params);

            if (result.success) {
                // Update categories
                const catContainer = document.getElementById('musicCategories');
                if (catContainer && result.categories) {
                    catContainer.innerHTML = `
                        <button class="category-btn ${!categoryId ? 'active' : ''}" data-id="">
                            <i class="fas fa-globe"></i> Tất cả
                        </button>
                        ${result.categories.map(c => `
                            <button class="category-btn ${categoryId == c.id ? 'active' : ''}" data-id="${c.id}">
                                <i class="fas ${c.icon}"></i> ${c.name}
                            </button>
                        `).join('')}
                    `;
                }

                this.playlist = result.tracks;
                this.renderTracks(result.tracks);
            }
        } catch (e) {
            container.innerHTML = '<p class="text-muted">Không thể tải danh sách nhạc</p>';
        }
    },

    async loadFavorites() {
        const container = document.getElementById('musicTracks');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const result = await API.get('/music/favorites');
            if (result.success) {
                this.playlist = result.tracks;
                if (result.tracks.length === 0) {
                    container.innerHTML = '<p class="text-muted text-center">Chưa có bài hát yêu thích</p>';
                } else {
                    this.renderTracks(result.tracks);
                }
            }
        } catch (e) {
            container.innerHTML = '<p class="text-muted">Không thể tải danh sách yêu thích</p>';
        }
    },

    renderTracks(tracks) {
        const container = document.getElementById('musicTracks');
        if (!container) return;

        if (tracks.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có bài hát nào</p>';
            return;
        }

        container.innerHTML = tracks.map((track, index) => `
            <div class="track-card ${this.currentTrack?.id === track.id ? 'playing' : ''}" data-id="${track.id}">
                <div class="track-cover">
                    <img src="${track.cover_image || '/images/default-album.png'}" alt="${track.title}">
                    <button class="track-play-btn" data-id="${track.id}">
                        <i class="fas ${this.currentTrack?.id === track.id && this.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                </div>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist || 'Unknown Artist'}</div>
                    <div class="track-meta">
                        <span class="track-category"><i class="fas ${track.category_icon}"></i> ${track.category_name}</span>
                        ${track.bpm ? `<span class="track-bpm">${track.bpm} BPM</span>` : ''}
                    </div>
                </div>
                <div class="track-actions">
                    <button class="track-fav-btn ${track.is_favorite ? 'active' : ''}" data-id="${track.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <span class="track-plays"><i class="fas fa-play"></i> ${track.play_count || 0}</span>
                </div>
            </div>
        `).join('');
    },

    play(track) {
        this.currentTrack = track;
        this.currentIndex = this.playlist.findIndex(t => t.id === track.id);

        this.audioPlayer.src = track.file_url;
        this.audioPlayer.play();
        this.isPlaying = true;

        // Update mini player
        document.getElementById('miniPlayer').classList.remove('hidden');
        document.getElementById('miniPlayerTitle').textContent = track.title;
        document.getElementById('miniPlayerArtist').textContent = track.artist || 'Unknown';
        document.getElementById('miniPlayerCover').src = track.cover_image || '/images/default-album.png';

        // Update track cards
        document.querySelectorAll('.track-card').forEach(card => {
            card.classList.remove('playing');
            if (parseInt(card.dataset.id) === track.id) {
                card.classList.add('playing');
            }
        });

        // Increment play count
        API.post('/music/play', { track_id: track.id });
    },

    togglePlay() {
        if (!this.currentTrack) return;

        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play();
        }
        this.isPlaying = !this.isPlaying;
    },

    updatePlayButton(playing) {
        this.isPlaying = playing;
        const btn = document.getElementById('miniPlayBtn');
        if (btn) {
            btn.innerHTML = `<i class="fas fa-${playing ? 'pause' : 'play'}"></i>`;
        }

        // Update track card buttons
        document.querySelectorAll('.track-play-btn').forEach(btn => {
            if (parseInt(btn.dataset.id) === this.currentTrack?.id) {
                btn.innerHTML = `<i class="fas fa-${playing ? 'pause' : 'play'}"></i>`;
            }
        });
    },

    prev() {
        if (this.playlist.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.play(this.playlist[this.currentIndex]);
    },

    next() {
        if (this.playlist.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.play(this.playlist[this.currentIndex]);
    },

    updateProgress() {
        const progress = document.getElementById('miniProgress');
        if (progress && this.audioPlayer.duration) {
            progress.value = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        }
    },

    seek(value) {
        if (this.audioPlayer.duration) {
            this.audioPlayer.currentTime = (value / 100) * this.audioPlayer.duration;
        }
    },

    closeMiniPlayer() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.currentTrack = null;
        document.getElementById('miniPlayer').classList.add('hidden');
    },

    async toggleFavorite(trackId, btn) {
        const isFav = btn.classList.contains('active');

        try {
            if (isFav) {
                await API.delete('/music/favorites', { track_id: trackId });
                btn.classList.remove('active');
                App.showNotification('Đã xóa khỏi yêu thích', 'info');
            } else {
                await API.post('/music/favorites', { track_id: trackId });
                btn.classList.add('active');
                App.showNotification('Đã thêm vào yêu thích', 'success');
            }
        } catch (e) {
            App.showNotification('Có lỗi xảy ra', 'error');
        }
    },

    minimizeMiniPlayer() {
        const player = document.getElementById('miniPlayer');
        player.classList.toggle('minimized');
        const minimizeBtn = player.querySelector('.mini-player-minimize i');
        if (player.classList.contains('minimized')) {
            minimizeBtn.className = 'fas fa-chevron-up';
        } else {
            minimizeBtn.className = 'fas fa-chevron-down';
        }
    },

    floatMiniPlayer() {
        const player = document.getElementById('miniPlayer');
        player.classList.toggle('floating');
        player.classList.remove('minimized');

        const floatBtn = player.querySelector('.mini-player-float i');
        if (player.classList.contains('floating')) {
            floatBtn.className = 'fas fa-expand-alt';
            this.makeDraggable(player);
        } else {
            floatBtn.className = 'fas fa-compress-alt';
            player.style.left = '';
            player.style.top = '';
            player.style.bottom = '';
        }
    },

    makeDraggable(element) {
        let isDragging = false;
        let hasDragged = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return; // Don't drag when clicking buttons
            if (!element.classList.contains('floating')) return;

            isDragging = true;
            hasDragged = false;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            hasDragged = true;

            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Keep within viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
            newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging && !hasDragged && element.classList.contains('floating')) {
                // It was a click, not a drag - expand back
                Music.floatMiniPlayer();
            }
            isDragging = false;
            element.style.cursor = '';
        });

        // Touch support
        element.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            if (!element.classList.contains('floating')) return;

            const touch = e.touches[0];
            offsetX = touch.clientX - element.getBoundingClientRect().left;
            offsetY = touch.clientY - element.getBoundingClientRect().top;
            isDragging = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const touch = e.touches[0];
            let newX = touch.clientX - offsetX;
            let newY = touch.clientY - offsetY;

            newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
            newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
};
