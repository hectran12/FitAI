/**
 * Author Page Module
 * Display author/creator information
 */

const Author = {
    async renderPage() {
        try {
            const result = await API.get('/author/info');

            if (!result.success) {
                return '<div class="container"><div class="alert alert-error">Không thể tải thông tin tác giả</div></div>';
            }

            const author = result.author;
            const socialLinks = author.social_links || {};

            // Social icons mapping
            const socialIcons = {
                facebook: 'fab fa-facebook',
                instagram: 'fab fa-instagram',
                twitter: 'fab fa-twitter',
                linkedin: 'fab fa-linkedin',
                github: 'fab fa-github'
            };

            const socialNames = {
                facebook: 'Facebook',
                instagram: 'Instagram',
                twitter: 'Twitter',
                linkedin: 'LinkedIn',
                github: 'GitHub'
            };

            return `
                <div class="author-page">
                    <div class="container">
                        <div class="author-card">
                            <div class="author-avatar-wrapper">
                                <img src="${author.avatar || '/images/logo.png'}" 
                                     alt="${author.name}" 
                                     class="author-avatar">
                            </div>
                            
                            <h1 class="author-name">${author.name || 'FitAI Team'}</h1>
                            
                            ${author.location ? `
                                <div class="author-location">
                                    <i class="fas fa-map-marker-alt"></i> ${author.location}
                                </div>
                            ` : ''}
                            
                            ${author.bio ? `
                                <div class="author-bio">
                                    ${author.bio.replace(/\n/g, '<br>')}
                                </div>
                            ` : ''}
                            
                            ${author.email || author.website ? `
                                <div class="author-contact">
                                    ${author.email ? `
                                        <a href="mailto:${author.email}" class="author-contact-item">
                                            <i class="fas fa-envelope"></i> ${author.email}
                                        </a>
                                    ` : ''}
                                    ${author.website ? `
                                        <a href="${author.website}" target="_blank" class="author-contact-item">
                                            <i class="fas fa-globe"></i> ${author.website}
                                        </a>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            ${Object.keys(socialLinks).length > 0 ? `
                                <div class="author-social">
                                    <div class="author-social-title">Kết nối với tôi</div>
                                    <div class="author-social-links">
                                        ${Object.entries(socialLinks).map(([platform, url]) => `
                                            <a href="${url}" 
                                               target="_blank" 
                                               rel="noopener noreferrer"
                                               class="author-social-link"
                                               title="${socialNames[platform] || platform}">
                                                <i class="${socialIcons[platform] || 'fas fa-link'}"></i>
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="author-footer">
                                <a href="/" class="btn btn-primary">
                                    <i class="fas fa-home"></i> Về trang chủ
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Author page error:', error);
            return '<div class="container"><div class="alert alert-error">Lỗi tải trang</div></div>';
        }
    }
};
