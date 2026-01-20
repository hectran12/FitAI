/**
 * FitAI - Market Module
 * 
 * E-commerce functionality for fitness products
 */

const Market = {
    currentCategory: null,
    currentSort: 'newest',
    currentPage: 1,
    cart: [],

    /**
     * Render main shop page
     */
    renderMarketPage() {
        return `
            <div class="market-page">
                <div class="container">
                    <div class="market-header">
                        <h1><i class="fas fa-store"></i> FitAI Shop</h1>
                        <p class="text-muted">Sản phẩm chất lượng cho người tập gym</p>
                    </div>
                    
                    <div class="market-layout">
                        <aside class="market-sidebar">
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-list"></i> Danh mục</h3>
                                <div id="categoryList" class="category-list">
                                    <div class="loading"><div class="spinner"></div></div>
                                </div>
                            </div>
                            
                            <div class="sidebar-card card">
                                <h3><i class="fas fa-shopping-cart"></i> Giỏ hàng</h3>
                                <div id="cartMini" class="cart-mini">
                                    <p class="text-muted">Trống</p>
                                </div>
                            </div>
                        </aside>
                        
                        <main class="market-main">
                            <div class="market-toolbar">
                                <div class="search-box">
                                    <i class="fas fa-search"></i>
                                    <input type="text" id="productSearch" placeholder="Tìm sản phẩm...">
                                </div>
                                <select id="productSort" class="sort-select">
                                    <option value="newest">Mới nhất</option>
                                    <option value="price_asc">Giá thấp → cao</option>
                                    <option value="price_desc">Giá cao → thấp</option>
                                    <option value="popular">Bán chạy</option>
                                    <option value="rating">Đánh giá</option>
                                </select>
                            </div>
                            
                            <div id="productGrid" class="product-grid">
                                <div class="loading"><div class="spinner"></div></div>
                            </div>
                            
                            <div id="productPagination" class="pagination"></div>
                        </main>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize market page
     */
    initMarketPage() {
        this.currentCategory = null;
        this.currentPage = 1;
        this.bindEvents();
        this.loadCategories();
        this.loadProducts();
        this.loadCart();
    },

    bindEvents() {
        // Search
        const search = document.getElementById('productSearch');
        if (search) {
            search.addEventListener('keyup', this.debounce(() => {
                this.loadProducts();
            }, 500));
        }

        // Sort
        const sort = document.getElementById('productSort');
        if (sort) {
            sort.addEventListener('change', () => {
                this.currentSort = sort.value;
                this.loadProducts();
            });
        }
    },

    async loadCategories() {
        try {
            const result = await API.get('/market/products.php');
            if (result.success) {
                const container = document.getElementById('categoryList');
                container.innerHTML = `
                    <a href="#" class="category-item ${!this.currentCategory ? 'active' : ''}" 
                       onclick="Market.filterCategory(null); return false;">
                        <span>Tất cả</span>
                        <span class="count">${result.total}</span>
                    </a>
                    ${result.categories.map(c => `
                        <a href="#" class="category-item ${this.currentCategory == c.id ? 'active' : ''}"
                           onclick="Market.filterCategory(${c.id}); return false;">
                            <span>${c.name}</span>
                            <span class="count">${c.count}</span>
                        </a>
                    `).join('')}
                `;
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    },

    filterCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentPage = 1;
        this.loadCategories();
        this.loadProducts();
    },

    async loadProducts() {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const search = document.getElementById('productSearch')?.value || '';
            let url = `/market/products.php?page=${this.currentPage}&sort=${this.currentSort}`;
            if (this.currentCategory) url += `&category_id=${this.currentCategory}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const result = await API.get(url);

            if (result.success) {
                if (result.products.length === 0) {
                    grid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>Không tìm thấy sản phẩm</p></div>';
                } else {
                    grid.innerHTML = result.products.map(p => this.renderProductCard(p)).join('');
                }

                this.renderPagination(result.page, result.total_pages);
            }
        } catch (error) {
            grid.innerHTML = '<div class="alert alert-error">Lỗi tải sản phẩm</div>';
        }
    },

    renderProductCard(product) {
        const hasDiscount = product.sale_price && product.sale_price < product.price;
        const discountPercent = hasDiscount
            ? Math.round((1 - product.sale_price / product.price) * 100)
            : 0;

        return `
            <div class="product-card card" onclick="Market.viewProduct(${product.id})">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-image">
                    ${product.primary_image
                ? `<img src="${product.primary_image}" alt="${product.name}">`
                : '<i class="fas fa-image"></i>'
            }
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-category">${product.category_name || ''}</div>
                    <div class="product-rating">
                        ${this.renderStars(product.rating_avg)}
                        <span>(${product.rating_count || 0})</span>
                    </div>
                    <div class="product-price">
                        ${hasDiscount
                ? `<span class="original-price">${product.price_formatted}</span>
                               <span class="sale-price">${product.sale_price_formatted}</span>`
                : `<span class="current-price">${product.price_formatted}</span>`
            }
                    </div>
                    <button class="btn btn-primary btn-sm btn-add-cart" 
                            onclick="event.stopPropagation(); Market.addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Thêm
                    </button>
                </div>
            </div>
        `;
    },

    renderStars(rating) {
        const full = Math.floor(rating || 0);
        const half = (rating % 1) >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return `
            ${'<i class="fas fa-star"></i>'.repeat(full)}
            ${half ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(empty)}
        `;
    },

    renderPagination(current, total) {
        const container = document.getElementById('productPagination');
        if (!container || total <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= total; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" 
                            onclick="Market.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async viewProduct(productId) {
        App.navigate('product/' + productId);
    },

    /**
     * Render product detail page
     */
    async renderProductDetailPage(productId) {
        return `
            <div class="product-detail-page">
                <div class="container">
                    <div id="productDetail">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    async initProductDetailPage(productId) {
        try {
            const result = await API.get(`/market/products.php?id=${productId}`);

            if (result.success) {
                const p = result.product;
                const container = document.getElementById('productDetail');

                container.innerHTML = `
                    <a href="#" onclick="App.navigate('market'); return false;" class="back-link">
                        <i class="fas fa-arrow-left"></i> Quay lại shop
                    </a>
                    
                    <div class="product-detail-layout">
                        <div class="product-gallery">
                            <div class="main-image" id="mainImage">
                                ${p.images.length > 0
                        ? `<img src="${p.images[0].image_path}" alt="${p.name}">`
                        : '<i class="fas fa-image"></i>'
                    }
                            </div>
                            ${p.images.length > 1 ? `
                                <div class="thumbnail-list">
                                    ${p.images.map((img, i) => `
                                        <div class="thumbnail ${i === 0 ? 'active' : ''}" 
                                             onclick="Market.selectImage('${img.image_path}', this)">
                                            <img src="${img.image_path}" alt="">
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="product-details">
                            <span class="product-category-tag">${p.category_name}</span>
                            <h1>${p.name}</h1>
                            
                            <div class="product-rating-large">
                                ${this.renderStars(p.rating_avg)}
                                <span>${p.rating_avg || 0}/5 (${p.rating_count || 0} đánh giá)</span>
                            </div>
                            
                            <div class="product-price-large">
                                ${p.sale_price && p.sale_price < p.price
                        ? `<span class="original">${p.price_formatted}</span>
                                       <span class="sale">${p.sale_price_formatted}</span>`
                        : `<span class="current">${p.price_formatted}</span>`
                    }
                            </div>
                            
                            <div class="product-stock">
                                ${p.stock > 0
                        ? `<i class="fas fa-check-circle text-green"></i> Còn ${p.stock} sản phẩm`
                        : '<i class="fas fa-times-circle text-red"></i> Hết hàng'
                    }
                            </div>
                            
                            <div class="product-quantity">
                                <label>Số lượng:</label>
                                <div class="qty-selector">
                                    <button onclick="Market.changeQty(-1)">-</button>
                                    <input type="number" id="productQty" value="1" min="1" max="${p.stock}">
                                    <button onclick="Market.changeQty(1)">+</button>
                                </div>
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn btn-primary btn-lg" onclick="Market.addToCart(${p.id})"
                                        ${p.stock <= 0 ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                                </button>
                                <button class="btn btn-secondary btn-lg" onclick="Market.buyNow(${p.id})"
                                        ${p.stock <= 0 ? 'disabled' : ''}>
                                    <i class="fas fa-bolt"></i> Mua ngay
                                </button>
                            </div>
                            
                            ${p.tags ? `
                                <div class="product-tags">
                                    ${p.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="product-description card">
                        <h3><i class="fas fa-info-circle"></i> Mô tả sản phẩm</h3>
                        <div class="description-content">${p.description || 'Chưa có mô tả'}</div>
                    </div>
                    
                    <div class="product-reviews card">
                        <h3><i class="fas fa-star"></i> Đánh giá (${p.rating_count || 0})</h3>
                        <div id="reviewsList">
                            ${p.reviews.length > 0
                        ? p.reviews.map(r => this.renderReview(r)).join('')
                        : '<p class="text-muted">Chưa có đánh giá</p>'
                    }
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById('productDetail').innerHTML =
                '<div class="alert alert-error">Không tìm thấy sản phẩm</div>';
        }
    },

    renderReview(review) {
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-avatar">
                        ${review.avatar
                ? `<img src="${review.avatar}" alt="">`
                : '<i class="fas fa-user"></i>'
            }
                    </div>
                    <div class="review-meta">
                        <strong>${review.display_name || 'Người dùng'}</strong>
                        <span class="review-date">${review.created_at_formatted}</span>
                    </div>
                    <div class="review-rating">${this.renderStars(review.rating)}</div>
                </div>
                ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
            </div>
        `;
    },

    selectImage(src, el) {
        document.getElementById('mainImage').innerHTML = `<img src="${src}" alt="">`;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    },

    changeQty(delta) {
        const input = document.getElementById('productQty');
        let val = parseInt(input.value) + delta;
        val = Math.max(1, Math.min(val, parseInt(input.max)));
        input.value = val;
    },

    // Cart functions
    async loadCart() {
        try {
            const result = await API.get('/market/cart.php');
            if (result.success) {
                this.cart = result.items;
                this.updateCartMini(result);
                this.updateCartBadge(result.item_count);
            }
        } catch (error) {
            console.error('Load cart error:', error);
        }
    },

    updateCartMini(data) {
        const container = document.getElementById('cartMini');
        if (!container) return;

        if (data.items.length === 0) {
            container.innerHTML = '<p class="text-muted">Giỏ hàng trống</p>';
        } else {
            container.innerHTML = `
                <div class="cart-mini-items">
                    ${data.items.slice(0, 3).map(item => `
                        <div class="cart-mini-item">
                            <span>${item.name}</span>
                            <span>x${item.quantity}</span>
                        </div>
                    `).join('')}
                    ${data.items.length > 3 ? `<p class="text-muted">+${data.items.length - 3} sản phẩm khác</p>` : ''}
                </div>
                <div class="cart-mini-total">
                    <strong>Tổng: ${data.total_formatted}</strong>
                </div>
                <button class="btn btn-primary btn-block" onclick="App.navigate('cart')">
                    <i class="fas fa-shopping-cart"></i> Xem giỏ hàng
                </button>
            `;
        }
    },

    updateCartBadge(count) {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    async addToCart(productId) {
        try {
            const qty = document.getElementById('productQty')?.value || 1;
            const result = await API.post('/market/cart.php', {
                product_id: productId,
                quantity: parseInt(qty)
            });

            if (result.success) {
                alert('Đã thêm vào giỏ hàng!');
                this.loadCart();
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async buyNow(productId) {
        await this.addToCart(productId);
        App.navigate('checkout');
    },

    /**
     * Render cart page
     */
    renderCartPage() {
        return `
            <div class="cart-page">
                <div class="container">
                    <h1><i class="fas fa-shopping-cart"></i> Giỏ hàng của bạn</h1>
                    <div id="cartContent">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    async initCartPage() {
        try {
            const result = await API.get('/market/cart.php');
            const container = document.getElementById('cartContent');

            if (result.items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Giỏ hàng trống</h3>
                        <p>Hãy thêm sản phẩm vào giỏ hàng</p>
                        <button class="btn btn-primary" onclick="App.navigate('market')">
                            <i class="fas fa-store"></i> Tiếp tục mua sắm
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="cart-layout">
                        <div class="cart-items">
                            ${result.items.map(item => `
                                <div class="cart-item card">
                                    <div class="cart-item-image">
                                        ${item.image
                        ? `<img src="${item.image}" alt="">`
                        : '<i class="fas fa-image"></i>'
                    }
                                    </div>
                                    <div class="cart-item-info">
                                        <h4>${item.name}</h4>
                                        <div class="cart-item-price">${item.price_formatted}</div>
                                    </div>
                                    <div class="cart-item-qty">
                                        <button onclick="Market.updateCartQty(${item.product_id}, -1)">-</button>
                                        <span>${item.quantity}</span>
                                        <button onclick="Market.updateCartQty(${item.product_id}, 1)">+</button>
                                    </div>
                                    <div class="cart-item-subtotal">${item.subtotal_formatted}</div>
                                    <button class="btn-remove" onclick="Market.removeFromCart(${item.product_id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="cart-summary card">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div class="summary-row">
                                <span>Tạm tính (${result.item_count} sản phẩm)</span>
                                <span>${result.total_formatted}</span>
                            </div>
                            <div class="summary-row">
                                <span>Phí vận chuyển</span>
                                <span class="text-green">Miễn phí</span>
                            </div>
                            <div class="summary-total">
                                <span>Tổng cộng</span>
                                <span>${result.total_formatted}</span>
                            </div>
                            <button class="btn btn-primary btn-lg btn-block" onclick="App.navigate('checkout')">
                                <i class="fas fa-credit-card"></i> Thanh toán
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="App.navigate('market')">
                                <i class="fas fa-arrow-left"></i> Tiếp tục mua
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById('cartContent').innerHTML =
                '<div class="alert alert-error">Lỗi tải giỏ hàng</div>';
        }
    },

    async updateCartQty(productId, delta) {
        try {
            await API.post('/market/cart.php', {
                product_id: productId,
                quantity: delta,
                action: 'add'
            });
            this.initCartPage();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    async removeFromCart(productId) {
        if (!confirm('Xóa sản phẩm khỏi giỏ hàng?')) return;

        try {
            await API.delete('/market/cart.php', { product_id: productId });
            this.initCartPage();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    /**
     * Render checkout page
     */
    renderCheckoutPage() {
        return `
            <div class="checkout-page">
                <div class="container">
                    <h1><i class="fas fa-credit-card"></i> Thanh toán</h1>
                    <div id="checkoutContent">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    async initCheckoutPage() {
        try {
            const result = await API.get('/market/cart.php');
            const container = document.getElementById('checkoutContent');

            if (result.items.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-warning">
                        Giỏ hàng trống. <a href="#" onclick="App.navigate('market'); return false;">Quay lại shop</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="checkout-layout">
                    <div class="checkout-form card">
                        <h3><i class="fas fa-truck"></i> Thông tin giao hàng</h3>
                        <form id="checkoutForm">
                            <div class="form-group">
                                <label class="form-label">Họ tên người nhận *</label>
                                <input type="text" class="form-input" id="recipientName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Số điện thoại *</label>
                                <input type="tel" class="form-input" id="phone" 
                                       pattern="[0-9]{10,11}" required placeholder="0xxxxxxxxx">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Địa chỉ giao hàng *</label>
                                <textarea class="form-input" id="address" rows="3" required
                                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ghi chú</label>
                                <textarea class="form-input" id="note" rows="2" 
                                          placeholder="Ghi chú cho shipper (không bắt buộc)"></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="checkout-summary card">
                        <h3><i class="fas fa-list"></i> Đơn hàng của bạn</h3>
                        <div class="order-items">
                            ${result.items.map(item => `
                                <div class="order-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>${item.subtotal_formatted}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total">
                            <span>Tổng cộng</span>
                            <span>${result.total_formatted}</span>
                        </div>
                        <button class="btn btn-primary btn-lg btn-block" onclick="Market.placeOrder()">
                            <i class="fas fa-check"></i> Đặt hàng
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            document.getElementById('checkoutContent').innerHTML =
                '<div class="alert alert-error">Lỗi tải thông tin</div>';
        }
    },

    async placeOrder() {
        const recipientName = document.getElementById('recipientName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const note = document.getElementById('note').value.trim();

        if (!recipientName || !phone || !address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        try {
            const result = await API.post('/market/checkout.php', {
                recipient_name: recipientName,
                phone,
                address,
                note
            });

            if (result.success) {
                alert(`Đặt hàng thành công!\nMã đơn: ${result.order.order_code}\nTổng: ${result.order.total_formatted}`);
                App.navigate('orders');
            }
        } catch (error) {
            alert('Lỗi đặt hàng: ' + error.message);
        }
    },

    /**
     * Render orders page
     */
    renderOrdersPage() {
        return `
            <div class="orders-page">
                <div class="container">
                    <h1><i class="fas fa-box"></i> Đơn hàng của tôi</h1>
                    <div id="ordersContent">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    async initOrdersPage() {
        try {
            const result = await API.get('/market/orders.php');
            const container = document.getElementById('ordersContent');

            if (result.orders.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>Chưa có đơn hàng</h3>
                        <button class="btn btn-primary" onclick="App.navigate('market')">
                            <i class="fas fa-store"></i> Mua sắm ngay
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = result.orders.map(order => `
                    <div class="order-card card" onclick="Market.viewOrder(${order.id})">
                        <div class="order-header">
                            <div>
                                <strong>Đơn hàng #${order.order_code}</strong>
                                <span class="order-date">${order.created_at_formatted}</span>
                            </div>
                            <span class="order-status status-${order.status}">${order.status_label}</span>
                        </div>
                        <div class="order-summary">
                            <span>${order.item_count} sản phẩm</span>
                            <span class="order-total">${order.total_formatted}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            document.getElementById('ordersContent').innerHTML =
                '<div class="alert alert-error">Lỗi tải đơn hàng</div>';
        }
    },

    async viewOrder(orderId) {
        App.navigate('order/' + orderId);
    },

    /**
     * Render order detail page
     */
    renderOrderDetailPage() {
        return `
            <div class="order-detail-page">
                <div class="container">
                    <div id="orderDetail">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        `;
    },

    async initOrderDetailPage(orderId) {
        try {
            const result = await API.get(`/market/orders.php?id=${orderId}`);
            const container = document.getElementById('orderDetail');
            const order = result.order;

            const statusSteps = ['pending', 'confirmed', 'shipping', 'delivered'];
            const currentStep = statusSteps.indexOf(order.status);

            container.innerHTML = `
                <a href="#" onclick="App.navigate('orders'); return false;" class="back-link">
                    <i class="fas fa-arrow-left"></i> Quay lại danh sách
                </a>
                
                <div class="order-detail-header card">
                    <h2>Đơn hàng #${order.order_code}</h2>
                    <span class="order-status status-${order.status}">${order.status_label}</span>
                </div>
                
                ${order.status !== 'cancelled' ? `
                    <div class="order-progress card">
                        <div class="progress-steps">
                            ${statusSteps.map((s, i) => `
                                <div class="progress-step ${i <= currentStep ? 'completed' : ''}">
                                    <div class="step-icon">
                                        <i class="fas fa-${i === 0 ? 'clock' : i === 1 ? 'check' : i === 2 ? 'truck' : 'home'}"></i>
                                    </div>
                                    <span>${i === 0 ? 'Chờ xác nhận' : i === 1 ? 'Đã xác nhận' : i === 2 ? 'Đang giao' : 'Đã giao'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="order-info-grid">
                    <div class="order-shipping card">
                        <h3><i class="fas fa-truck"></i> Thông tin giao hàng</h3>
                        <p><strong>${order.recipient_name}</strong></p>
                        <p><i class="fas fa-phone"></i> ${order.phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${order.address}</p>
                        ${order.note ? `<p><i class="fas fa-sticky-note"></i> ${order.note}</p>` : ''}
                    </div>
                    
                    <div class="order-items-detail card">
                        <h3><i class="fas fa-box"></i> Sản phẩm</h3>
                        ${order.items.map(item => `
                            <div class="order-item-row">
                                <div class="item-image">
                                    ${item.product_image
                    ? `<img src="${item.product_image}" alt="">`
                    : '<i class="fas fa-image"></i>'
                }
                                </div>
                                <div class="item-info">
                                    <strong>${item.product_name}</strong>
                                    <span>${item.price_formatted} x ${item.quantity}</span>
                                </div>
                                <div class="item-subtotal">${item.subtotal_formatted}</div>
                                ${order.status === 'delivered' ? `
                                    <button class="btn btn-sm btn-secondary" 
                                            onclick="Market.showReviewModal(${item.product_id}, ${order.id}, '${item.product_name}')">
                                        <i class="fas fa-star"></i> Đánh giá
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                        <div class="order-total-row">
                            <span>Tổng cộng</span>
                            <span>${order.total_formatted}</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            document.getElementById('orderDetail').innerHTML =
                '<div class="alert alert-error">Không tìm thấy đơn hàng</div>';
        }
    },

    showReviewModal(productId, orderId, productName) {
        const html = `
            <div class="modal-overlay active" id="reviewModal" onclick="Market.closeReviewModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="Market.closeReviewModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>Đánh giá: ${productName}</h2>
                    
                    <div class="rating-select">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <i class="far fa-star rating-star" data-rating="${i}" 
                               onclick="Market.selectRating(${i})"></i>
                        `).join('')}
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Nhận xét (không bắt buộc)</label>
                        <textarea class="form-input" id="reviewComment" rows="4" 
                                  placeholder="Chia sẻ trải nghiệm của bạn..."></textarea>
                    </div>
                    
                    <button class="btn btn-primary btn-block" 
                            onclick="Market.submitReview(${productId}, ${orderId})">
                        <i class="fas fa-paper-plane"></i> Gửi đánh giá
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
        this.selectedRating = 0;
    },

    closeReviewModal(event) {
        if (event && event.target.id !== 'reviewModal') return;
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    selectedRating: 0,

    selectRating(rating) {
        this.selectedRating = rating;
        document.querySelectorAll('.rating-star').forEach((star, i) => {
            if (i < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    },

    async submitReview(productId, orderId) {
        if (!this.selectedRating) {
            alert('Vui lòng chọn số sao');
            return;
        }

        const comment = document.getElementById('reviewComment').value.trim();

        try {
            const result = await API.post('/market/reviews.php', {
                product_id: productId,
                order_id: orderId,
                rating: this.selectedRating,
                comment
            });

            if (result.success) {
                alert(result.message);
                this.closeReviewModal();
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    },

    // Utility
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
};
