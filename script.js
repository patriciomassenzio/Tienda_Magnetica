document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. SISTEMA DE GALERÍA MANUAL (PRODUCT SLIDERS)
       ========================================== */
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const wrapper = card.querySelector('.slides-wrapper');
        const slides = card.querySelectorAll('.slide-img');
        const prevBtn = card.querySelector('.prev-btn');
        const nextBtn = card.querySelector('.next-btn');
        const dots = card.querySelectorAll('.dot');
        
        let currentIndex = 0;
        const totalSlides = slides.length;

        // Inicializar los puntos si es que hay más de 1 imagen y existen botones
        if (totalSlides > 1 && prevBtn && nextBtn) {
            function updateSlider() {
                wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex > 0) {
                    currentIndex--;
                } else {
                    currentIndex = totalSlides - 1; // bucle al final
                }
                updateSlider();
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex < totalSlides - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0; // bucle al inicio
                }
                updateSlider();
            });

            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = index;
                    updateSlider();
                });
            });
        }
    });


    /* ==========================================
       2. CONTROLADORES DE TALLAS (SIZE SELECTION)
       ========================================== */
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Buscar solo dentro de la tarjeta de este producto específico
            const sizesContainer = btn.closest('.sizes');
            sizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    /* ==========================================
       2.5 CONTROLADORES DE COLORES (COLOR SELECTION)
       ========================================== */
    const colorButtons = document.querySelectorAll('.color-btn');
    
    colorButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const colorsContainer = btn.closest('.colors');
            colorsContainer.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Comportamiento dinámico para Top Mallorca (Blanco = solo L, Negro = S, M, L)
            const card = btn.closest('.product-card');
            const isMallorca = card.querySelector('.product-name').textContent.includes('Mallorca');
            if (isMallorca) {
                const color = btn.getAttribute('data-color');
                const sizeSelector = card.querySelector('.size-selector');
                const sizeButtons = sizeSelector.querySelectorAll('.size-btn');
                
                if (color === 'Blanco') {
                    sizeButtons.forEach(b => {
                        const size = b.getAttribute('data-size');
                        if (size === 'L') {
                            b.style.display = 'inline-flex';
                            b.classList.add('active');
                        } else {
                            b.style.display = 'none';
                            b.classList.remove('active');
                        }
                    });
                } else {
                    sizeButtons.forEach(b => {
                        b.style.display = 'inline-flex';
                        const size = b.getAttribute('data-size');
                        if (size === 'M') {
                            b.classList.add('active');
                        } else {
                            b.classList.remove('active');
                        }
                    });
                }
            }
        });
    });


    /* ==========================================
       3. FILTRADO DINÁMICO DE CATEGORÍAS (COLLECTION FILTER)
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const grid = document.getElementById('product-grid');

    function applyFilter(category) {
        // Activar botones correctos en la UI de filtros principales
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Activar enlaces correctos en el Menú Superior
        navLinks.forEach(link => {
            if (link.getAttribute('data-filter') === category) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Efecto suave de fade-out antes de filtrar
        grid.style.opacity = '0';

        setTimeout(() => {
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            // Regresar la visibilidad con fade-in
            grid.style.opacity = '1';
        }, 300);
    }

    // Eventos para botones de la sección filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.getAttribute('data-filter');
            applyFilter(category);
        });
    });

    // Eventos para el menú superior
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-filter');
            applyFilter(category);
            
            // Hacer scroll hasta la sección de la colección de manera suave
            document.getElementById('collection').scrollIntoView({behavior: 'smooth'});
        });
    });


    /* ==========================================
       4. SISTEMA DE MALETA DE VIAJE (CARRITO DE COMPRAS)
       ========================================== */
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Abrir Carrito
    cartTrigger.addEventListener('click', () => {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    });

    // Cerrar Carrito (desde la X o dando clic al fondo desenfocado)
    const closeCart = () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    };
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);


    // --- Lógica de la Base de Datos del Carrito ---
    let cart = [];

    const cartContainer = document.getElementById('cart-items-container');
    const cartBadge = document.getElementById('cart-badge');
    const cartSubtotal = document.getElementById('cart-subtotal');

    // Botones de "Añadir a la Bolsa"
    const addCartButtons = document.querySelectorAll('.btn-add-cart');

    addCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const img = button.getAttribute('data-img');
            
            // Obtener talla seleccionada de esta tarjeta
            const card = button.closest('.product-card');
            const activeSizeBtn = card.querySelector('.size-btn.active');
            const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'M';

            // Obtener color seleccionado de esta tarjeta
            const activeColorBtn = card.querySelector('.color-btn.active');
            const color = activeColorBtn ? activeColorBtn.getAttribute('data-color') : 'Único';

            // Agregar a la maleta
            addToCart(id, name, price, img, size, color);
        });
    });

    function addToCart(id, name, price, img, size, color) {
        // Buscamos si ya existe el mismo artículo con la misma talla y color en el carrito
        const existingItem = cart.find(item => item.id === id && item.size === size && item.color === color);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                name,
                price,
                img,
                size,
                color,
                quantity: 1
            });
        }

        // Actualizar UI, abrir carrito para dar feedback y reproducir sumatoria
        updateCartUI();
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    }

    function updateCartUI() {
        // Limpiamos el contenedor
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            // Mostrar mensaje de vacío
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Tu maleta está vacía en este momento.</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 10px;">¡Añade tus favoritos para el verano europeo!</p>
                    <button class="btn-primary" style="margin-top: 20px; padding: 10px 20px;" id="cart-empty-explore">Empezar a Explorar</button>
                </div>
            `;
            
            document.getElementById('cart-empty-explore').addEventListener('click', () => {
                closeCart();
            });

            cartBadge.textContent = '0';
            cartSubtotal.textContent = '$0.00 USD';
            return;
        }

        let total = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalItems += item.quantity;

            const cartItemHTML = `
                <div class="cart-item">
                    <img class="cart-item-img" src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-meta">Talla: ${item.size} | Color: ${item.color}</span>
                        <span class="cart-item-price">$${item.price.toFixed(2)} USD</span>
                        <div class="cart-item-quantity">
                            <button class="qty-btn dec-qty" data-index="${index}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-index="${index}">+</button>
                            <button class="remove-item-btn" data-index="${index}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.innerHTML += cartItemHTML;
        });

        // Actualizar badge y subtotal
        cartBadge.textContent = totalItems;
        cartSubtotal.textContent = `$${total.toFixed(2)} USD`;

        // Añadir eventos a los botones de control de cantidad dentro del carrito
        attachCartEvents();
    }

    function attachCartEvents() {
        // Disminuir cantidad
        const decButtons = document.querySelectorAll('.dec-qty');
        decButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                } else {
                    cart.splice(index, 1); // eliminar del carrito si llega a cero
                }
                updateCartUI();
            });
        });

        // Incrementar cantidad
        const incButtons = document.querySelectorAll('.inc-qty');
        incButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                cart[index].quantity++;
                updateCartUI();
            });
        });

        // Eliminar directamente
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }


    /* ==========================================
       5. FINALIZAR COMPRA POR WHATSAPP
       ========================================== */
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu maleta de viaje está vacía. ¡Añade algunos artículos antes de comprar!');
                return;
            }

            // Número de WhatsApp (puedes cambiarlo por tu número real con código de país, ej: 549...)
            // 54 es el código de Argentina, 9 es para celular, seguido del código de área (ej: 3407) y número de Ramallo
            const whatsappPhone = '3407431964'; // Reemplazar con su número de WhatsApp real de atención al cliente

            // Construir el mensaje elegante
            let message = '¡Hola! ☀️ Vengo de la tienda online *Riviera Concept* y me gustaría realizar el siguiente pedido:\n\n';
            message += '🛒 *DETALLE DEL PEDIDO:*\n';
            message += '------------------------------------\n';

            let grandTotal = 0;
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                grandTotal += itemTotal;
                
                message += `🛍️ *${index + 1}. ${item.name}*\n`;
                message += `   • Talle: *${item.size}*\n`;
                message += `   • Color: *${item.color}*\n`;
                message += `   • Cantidad: *${item.quantity}*\n`;
                message += `   • Subtotal: *$${itemTotal.toFixed(2)} USD*\n\n`;
            });

            message += '------------------------------------\n';
            message += `💰 *Monto Total a Pagar:* *$${grandTotal.toFixed(2)} USD*\n\n`;
            message += '📍 *Método de Pago elegido:* Efectivo / Transferencia\n';
            message += '💬 ¡Quedo a la espera para coordinar el pago y el envío en la zona de Ramallo / Villa Ramallo!\n';

            // Codificar el mensaje para la URL
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

            // Abrir WhatsApp en una pestaña nueva
            window.open(whatsappUrl, '_blank');
        });
    }
});