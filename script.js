document.addEventListener('DOMContentLoaded', () => {

    // 1. CONFIGURAÇÕES GLOBAIS
    const CONFIG = {
        selectors: {
            carousel: {
                track: '.carousel-track',
                cards: '.harbinger-card',
                indicators: '.indicator-dot',
                video: '.carousel-bg-video',
                section: '.carousel-section',
                btnPrev: '.carousel-btn-prev',
                btnNext: '.carousel-btn-next'
            },
            sidebar: {
                menu: '#sidebarMenu',
                btnOpen: '#hamburgerBtn',
                btnClose: '#sidebarClose',
                overlay: '#sidebarOverlay',
                items: '.sidebar-item'
            },
            parallax: {
                elements: '.parallax-element',
                intro: '.intro-content'
            }
        },
        animation: {
            duration: 600,
            gap: 40,
            stepDelay: 120
        },
        carousel: {
            visibleSides: 2 // Quantos cards visíveis de cada lado
        }
    };

    // 2. MÓDULO SIDEBAR
    class Sidebar {
        constructor() {
            this.menu = document.querySelector(CONFIG.selectors.sidebar.menu);
            this.overlay = document.querySelector(CONFIG.selectors.sidebar.overlay);
            this.btnOpen = document.querySelector(CONFIG.selectors.sidebar.btnOpen);
            this.btnClose = document.querySelector(CONFIG.selectors.sidebar.btnClose);
            this.items = document.querySelectorAll(CONFIG.selectors.sidebar.items);

            this.init();
        }

        init() {
            if (!this.menu) return;

            this.btnOpen?.addEventListener('click', () => this.toggle(true));
            this.btnClose?.addEventListener('click', () => this.toggle(false));
            this.overlay?.addEventListener('click', () => this.toggle(false));

            this.items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetIndex = parseInt(item.dataset.index);

                    document.dispatchEvent(new CustomEvent('carousel:navigate', {
                        detail: { index: targetIndex }
                    }));

                    this.toggle(false);

                    setTimeout(() => {
                        document.querySelector('#carousel-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                });
            });
        }

        toggle(isActive) {
            const action = isActive ? 'add' : 'remove';
            this.menu.classList[action]('active');
            this.overlay.classList[action]('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        }
    }

    // 3. MÓDULO PARALLAX
    class ParallaxManager {
        constructor() {
            this.elements = document.querySelectorAll(CONFIG.selectors.parallax.elements);
            this.introContent = document.querySelector(CONFIG.selectors.parallax.intro);
            this.ticking = false;
            this.mouse = { x: 0, y: 0, currentX: 0, currentY: 0 };

            this.init();
        }

        init() {
            window.addEventListener('scroll', () => this.requestTick(), { passive: true });
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.animateMouse();
        }

        requestTick() {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollParallax();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }

        updateScrollParallax() {
            const scrolled = window.pageYOffset;
            const windowHeight = window.innerHeight;

            this.elements.forEach((el, index) => {
                const speed = 0.3 + (index * 0.1);
                el.style.transform = `translateY(${-scrolled * speed}px)`;
            });

            if (this.introContent && scrolled < windowHeight) {
                const progress = scrolled / windowHeight;
                this.introContent.style.opacity = Math.max(0, 1 - progress * 1.5);
                this.introContent.style.transform = `translateY(${scrolled * 0.5}px) scale(${Math.max(0.8, 1 - progress * 0.2)})`;
            }
        }

        handleMouseMove(e) {
            this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        }

        animateMouse() {
            this.mouse.currentX += (this.mouse.x - this.mouse.currentX) * 0.05;
            this.mouse.currentY += (this.mouse.y - this.mouse.currentY) * 0.05;
            requestAnimationFrame(() => this.animateMouse());
        }
    }

    // 4. MÓDULO CARROSSEL (OTIMIZADO E MELHORADO)
    class Carousel {
        constructor() {
            const s = CONFIG.selectors.carousel;
            this.track = document.querySelector(s.track);
            this.originalCards = document.querySelectorAll(s.cards);
            this.indicators = document.querySelectorAll(s.indicators);
            this.bgVideo = document.querySelector(s.video);
            this.btnPrev = document.querySelector(s.btnPrev);
            this.btnNext = document.querySelector(s.btnNext);
            this.section = document.querySelector(s.section);

            this.totalOriginal = this.originalCards.length;
            this.currentIndex = 0; // Será ajustado após setup dos clones
            this.isTransitioning = false;
            this.cardWidth = 0;
            this.gap = 0;
            this.rafId = null;
            this.cloneOffset = 0;

            if (this.track && this.totalOriginal > 0) {
                this.init();
            }
        }

        init() {
            this.setupMultipleClones();
            this.currentIndex = this.cloneOffset; // Posição inicial após clones
            this.calculateDimensions();
            this.setupEventListeners();
            this.setupVideoObserver();
            this.update(false);
            this.revealCards();

            document.addEventListener('carousel:navigate', (e) => {
                this.navigateTo(e.detail.index + this.cloneOffset);
            });
        }

        setupMultipleClones() {
            const fragment = document.createDocumentFragment();
            const cloneCount = CONFIG.carousel.visibleSides + 1; // +1 para garantir buffer extra

            // Clones no INÍCIO (últimos cards)
            for (let i = this.totalOriginal - cloneCount; i < this.totalOriginal; i++) {
                const clone = this.originalCards[i].cloneNode(true);
                clone.classList.remove('active');
                clone.classList.add('clone', 'clone-start');
                fragment.appendChild(clone);
            }

            this.track.insertBefore(fragment, this.track.firstChild);

            // Clones no FINAL (primeiros cards)
            const fragmentEnd = document.createDocumentFragment();
            for (let i = 0; i < cloneCount; i++) {
                const clone = this.originalCards[i].cloneNode(true);
                clone.classList.remove('active');
                clone.classList.add('clone', 'clone-end');
                fragmentEnd.appendChild(clone);
            }

            this.track.appendChild(fragmentEnd);

            this.allCards = document.querySelectorAll(CONFIG.selectors.carousel.cards);
            this.cloneOffset = CONFIG.carousel.visibleSides + 1;
        }

        calculateDimensions() {
            this.cardWidth = this.originalCards[0].offsetWidth;
            this.gap = parseInt(getComputedStyle(this.track).gap) || CONFIG.animation.gap;
        }

        setupEventListeners() {
            this.btnPrev?.addEventListener('click', () => this.move(-1));
            this.btnNext?.addEventListener('click', () => this.move(1));

            // Resize otimizado
            let resizeTimeout;
            const resizeObserver = new ResizeObserver(() => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.calculateDimensions();
                    this.update(false);
                }, 150);
            });
            resizeObserver.observe(this.track);

            // Touch melhorado
            let startX = 0, startY = 0, isDragging = false;

            this.track.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
            }, { passive: true });

            this.track.addEventListener('touchmove', e => {
                if (!isDragging) return;
                const diffY = Math.abs(e.touches[0].clientY - startY);
                if (diffY > 10) isDragging = false;
            }, { passive: true });

            this.track.addEventListener('touchend', e => {
                if (!isDragging) return;
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) this.move(diff > 0 ? 1 : -1);
                isDragging = false;
            }, { passive: true });

            // Teclado
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.move(-1);
                if (e.key === 'ArrowRight') this.move(1);
            });

            // Click nos Cards
            this.allCards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    if (!this.isTransitioning && index !== this.currentIndex) {
                        this.navigateTo(index);
                    }
                });
            });

            // Indicadores
            this.indicators.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    if (!this.isTransitioning) {
                        this.navigateTo(index + this.cloneOffset);
                    }
                });
            });
        }

        move(direction) {
            if (this.isTransitioning) return;

            this.isTransitioning = true;
            this.currentIndex += direction;
            this.update(true);

            // Aguarda a transição completa antes de verificar loop
            setTimeout(() => {
                this.isTransitioning = false;
            }, CONFIG.animation.duration);
        }

        checkLoop() {
            const cloneCount = CONFIG.carousel.visibleSides;
            const lastRealIndex = this.totalOriginal + cloneCount;

            // Se passou do último card real, volta pro início
            if (this.currentIndex >= lastRealIndex) {
                this.currentIndex = cloneCount;
                this.update(false);
            }
            // Se passou do primeiro card real, volta pro final
            else if (this.currentIndex < cloneCount) {
                this.currentIndex = lastRealIndex - 1;
                this.update(false);
            }
        }

        navigateTo(targetIndex) {
            if (this.isTransitioning || this.currentIndex === targetIndex) return;

            const distance = Math.abs(targetIndex - this.currentIndex);

            // Navegação direta para adjacentes
            if (distance <= 1) {
                this.move(targetIndex > this.currentIndex ? 1 : -1);
                return;
            }

            // Caminho mais curto considerando loop infinito
            const directDistance = Math.abs(targetIndex - this.currentIndex);
            const loopDistance = this.totalOriginal - directDistance;

            let direction, steps;

            if (loopDistance < directDistance) {
                // Ir pelo outro lado é mais rápido
                direction = targetIndex > this.currentIndex ? -1 : 1;
                steps = loopDistance;
            } else {
                // Ir direto é mais rápido
                direction = targetIndex > this.currentIndex ? 1 : -1;
                steps = directDistance;
            }

            // Navegação suave passo a passo
            this.isTransitioning = true;
            let step = 0;

            const animate = () => {
                if (step >= steps) {
                    this.isTransitioning = false;
                    return;
                }

                this.currentIndex += direction;
                this.update(true);
                step++;

                setTimeout(animate, CONFIG.animation.stepDelay);
            };

            animate();
        }

        update(animate) {
            const offset = -(this.currentIndex * (this.cardWidth + this.gap));

            // Desabilita transição para reposicionamentos instantâneos
            if (!animate) {
                this.track.style.transition = 'none';
                this.track.style.willChange = 'auto';
            } else {
                this.track.style.willChange = 'transform';
                this.track.style.transition = `transform ${CONFIG.animation.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            }

            if (this.rafId) cancelAnimationFrame(this.rafId);

            this.rafId = requestAnimationFrame(() => {
                this.track.style.transform = `translateX(calc(50% - ${this.cardWidth / 2}px + ${offset}px))`;

                // Atualiza UI
                if (animate) {
                    setTimeout(() => this.updateUI(), CONFIG.animation.duration / 2);
                } else {
                    this.updateUI();
                }

                // Verifica loop após a animação terminar
                if (animate) {
                    setTimeout(() => {
                        const lastRealIndex = this.totalOriginal + this.cloneOffset;

                        if (this.currentIndex >= lastRealIndex) {
                            // Passou do último: volta pro primeiro real
                            this.currentIndex = this.cloneOffset;
                            // Aguarda 1 frame para garantir que a transição anterior terminou
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    this.update(false);
                                });
                            });
                        } else if (this.currentIndex < this.cloneOffset) {
                            // Passou do primeiro: volta pro último real
                            this.currentIndex = lastRealIndex - 1;
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    this.update(false);
                                });
                            });
                        }
                    }, CONFIG.animation.duration);
                }
            });
        }

        updateUI() {
            const realIndex = this.getRealIndex();

            requestAnimationFrame(() => {
                this.allCards.forEach((c, i) => {
                    c.classList.toggle('active', i === this.currentIndex);
                });

                this.indicators.forEach((dot, i) => {
                    dot.classList.toggle('active', i === realIndex);
                });

                this.updateVideo();
            });
        }

        getRealIndex() {
            return this.currentIndex - this.cloneOffset;
        }

        updateVideo() {
            if (!this.bgVideo) return;

            const activeCard = this.allCards[this.currentIndex];
            const videoSrc = activeCard.dataset.video;

            if (videoSrc && !this.bgVideo.src.includes(videoSrc)) {
                const finalSrc = videoSrc.startsWith('http')
                    ? videoSrc
                    : `${window.location.origin}/${videoSrc}`;

                this.bgVideo.style.opacity = '0';

                setTimeout(() => {
                    this.bgVideo.src = finalSrc;
                    this.bgVideo.play()
                        .then(() => {
                            this.bgVideo.style.transition = 'opacity 0.3s ease';
                            this.bgVideo.style.opacity = '1';
                        })
                        .catch(() => { });
                }, 150);
            }
        }

        setupVideoObserver() {
            if (!this.section || !this.bgVideo) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.bgVideo.play().catch(() => { });
                    } else {
                        this.bgVideo.pause();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(this.section);
        }

        revealCards() {
            // Entrada suave sem movimento vertical
            this.originalCards.forEach((card, i) => {
                card.style.opacity = '0';

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.6s ease';
                        card.style.opacity = '1';
                    });
                }, i * 80);
            });
        }

        destroy() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.track.style.willChange = 'auto';
        }
    }

    // 5. INICIALIZAÇÃO
    const sidebar = new Sidebar();
    const parallax = new ParallaxManager();

    requestAnimationFrame(() => {
        const carousel = new Carousel();
    });

});