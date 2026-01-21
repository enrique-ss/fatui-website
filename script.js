document.addEventListener('DOMContentLoaded', () => {

    // 1. CONFIGURAÇÕES GLOBAIS
    // Centraliza todos os "números mágicos" e seletores
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
            duration: 600, // ms
            gap: 40, // px (fallback)
            stepDelay: 150 // ms (para navegação passo-a-passo)
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

            // Bindings
            this.btnOpen?.addEventListener('click', () => this.toggle(true));
            this.btnClose?.addEventListener('click', () => this.toggle(false));
            this.overlay?.addEventListener('click', () => this.toggle(false));

            // Navegação externa (conecta com o carrossel via evento customizado se necessário, 
            // ou acessa a instância global se estiver disponível)
            this.items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetIndex = parseInt(item.dataset.index);

                    // Dispara evento para o carrossel ouvir
                    document.dispatchEvent(new CustomEvent('carousel:navigate', {
                        detail: { index: targetIndex }
                    }));

                    this.toggle(false);

                    // Scroll suave
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

    // 3. MÓDULO PARALLAX & VISUAL EFFECTS
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

            // Elementos Flutuantes
            this.elements.forEach((el, index) => {
                const speed = 0.3 + (index * 0.1);
                el.style.transform = `translateY(${-scrolled * speed}px)`;
            });

            // Fade Intro
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
            // Interpolação linear (Lerp) para suavidade
            this.mouse.currentX += (this.mouse.x - this.mouse.currentX) * 0.05;
            this.mouse.currentY += (this.mouse.y - this.mouse.currentY) * 0.05;

            this.elements.forEach((el, index) => {
                const depth = (index + 1) * 10;
                // Nota: somamos ao transform existente via CSS ou JS seria ideal, 
                // mas aqui aplicamos direto para simplificar o exemplo visual
                // O ideal seria ter um container wrapper para o scroll e um inner para o mouse.
                const currentTransform = el.style.transform || '';
                // Pequeno hack para manter o scroll Y junto com o mouse move se necessário,
                // mas para manter simples, aplicamos apenas o translate relativo aqui se o scroll não estiver sobrescrevendo tudo
            });

            requestAnimationFrame(() => this.animateMouse());
        }
    }

    // 4. MÓDULO CARROSSEL (CORE)
    class Carousel {
        constructor() {
            // Elementos
            const s = CONFIG.selectors.carousel;
            this.track = document.querySelector(s.track);
            this.originalCards = document.querySelectorAll(s.cards);
            this.indicators = document.querySelectorAll(s.indicators);
            this.bgVideo = document.querySelector(s.video);
            this.btnPrev = document.querySelector(s.btnPrev);
            this.btnNext = document.querySelector(s.btnNext);
            this.section = document.querySelector(s.section);

            // Estado
            this.totalOriginal = this.originalCards.length;
            this.currentIndex = 1; // Começa no 1 por causa do clone
            this.isTransitioning = false;
            this.cardWidth = 0;
            this.gap = 0;

            if (this.track && this.totalOriginal > 0) {
                this.init();
            }
        }

        init() {
            this.setupClones();
            this.calculateDimensions();
            this.setupEventListeners();
            this.setupVideoObserver();

            // Entrada Inicial
            this.update(false);
            this.revealCards();

            // Listener Global de Navegação (vindo da Sidebar)
            document.addEventListener('carousel:navigate', (e) => {
                this.smartNavigateTo(e.detail.index + 1); // +1 offset do clone
            });
        }

        setupClones() {
            const firstClone = this.originalCards[0].cloneNode(true);
            const lastClone = this.originalCards[this.totalOriginal - 1].cloneNode(true);

            firstClone.classList.remove('active');
            lastClone.classList.remove('active');

            // Adiciona classe clone para facilitar identificação futura
            firstClone.classList.add('clone');
            lastClone.classList.add('clone');

            this.track.appendChild(firstClone);
            this.track.insertBefore(lastClone, this.originalCards[0]);

            // Atualiza lista de todos os cards
            this.allCards = document.querySelectorAll(CONFIG.selectors.carousel.cards);
        }

        calculateDimensions() {
            this.cardWidth = this.originalCards[0].offsetWidth;
            this.gap = parseInt(getComputedStyle(this.track).gap) || CONFIG.animation.gap;
        }

        setupEventListeners() {
            // Botões
            this.btnPrev?.addEventListener('click', () => this.move(-1));
            this.btnNext?.addEventListener('click', () => this.move(1));

            // Resize com Debounce
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.calculateDimensions();
                    this.update(false);
                }, 200);
            });

            // Touch Swipe
            let startX = 0;
            this.track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
            this.track.addEventListener('touchend', e => {
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) this.move(diff > 0 ? 1 : -1);
            }, { passive: true });

            // Teclado
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.move(-1);
                if (e.key === 'ArrowRight') this.move(1);
            });

            // Click nos Cards
            this.allCards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    if (!this.isTransitioning) this.smartNavigateTo(index);
                });
            });

            // Indicadores
            this.indicators.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    if (!this.isTransitioning) this.smartNavigateTo(index + 1);
                });
            });
        }

        // Movimento Básico (Next/Prev)
        move(direction) {
            if (this.isTransitioning) return;

            this.isTransitioning = true;
            this.currentIndex += direction;
            this.update(true);
            this.handleInfiniteLoop();
        }

        // Lógica do Loop Infinito
        handleInfiniteLoop() {
            // Espera a animação terminar e verifica se precisa pular
            setTimeout(() => {
                if (this.currentIndex === this.allCards.length - 1) {
                    this.currentIndex = 1;
                    this.update(false);
                } else if (this.currentIndex === 0) {
                    this.currentIndex = this.totalOriginal;
                    this.update(false);
                }
                this.isTransitioning = false;
            }, CONFIG.animation.duration);
        }

        // Navegação Inteligente (Caminho mais curto)
        smartNavigateTo(targetIndex) {
            if (this.isTransitioning || this.currentIndex === targetIndex) return;

            this.isTransitioning = true;

            // Se a distância for pequena, vai direto
            if (Math.abs(targetIndex - this.currentIndex) === 1) {
                this.currentIndex = targetIndex;
                this.update(true);
                this.handleInfiniteLoop();
                return;
            }

            // Animação passo a passo (Simula a navegação rápida)
            const direction = targetIndex > this.currentIndex ? 1 : -1;
            const steps = Math.abs(targetIndex - this.currentIndex);
            let currentStep = 0;

            const stepInterval = setInterval(() => {
                currentStep++;
                this.currentIndex += direction;
                this.update(true);

                if (currentStep >= steps) {
                    clearInterval(stepInterval);
                    this.handleInfiniteLoop();
                }
            }, 100); // Rápido entre cards intermediários
        }

        // Renderização
        update(animate) {
            const offset = -(this.currentIndex * (this.cardWidth + this.gap));

            this.track.style.transition = animate
                ? `transform ${CONFIG.animation.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none';

            this.track.style.transform = `translateX(calc(50% - ${this.cardWidth / 2}px + ${offset}px))`;

            // Atualiza Classes e Vídeo apenas se for um card válido
            // O timeout garante que a classe active troque apenas quando o card chegar
            const updateUI = () => {
                const realIndex = this.getRealIndex();

                // Classes dos Cards
                this.allCards.forEach(c => c.classList.remove('active'));
                this.allCards[this.currentIndex].classList.add('active');

                // Indicadores
                this.indicators.forEach((dot, i) => dot.classList.toggle('active', i === realIndex));

                // Vídeo
                this.updateVideo();
            };

            if (animate) {
                // Pequeno delay para sincronizar troca de vídeo com a chegada do slide
                setTimeout(updateUI, CONFIG.animation.duration / 2);
            } else {
                updateUI();
            }
        }

        getRealIndex() {
            if (this.currentIndex === 0) return this.totalOriginal - 1;
            if (this.currentIndex === this.allCards.length - 1) return 0;
            return this.currentIndex - 1;
        }

        updateVideo() {
            if (!this.bgVideo) return;

            const activeCard = this.allCards[this.currentIndex];
            const videoSrc = activeCard.dataset.video;

            if (videoSrc && !this.bgVideo.src.includes(videoSrc)) {
                // Verifica se é URL completa ou relativa
                const finalSrc = videoSrc.startsWith('http') ? videoSrc : `${window.location.origin}/${videoSrc}`;

                this.bgVideo.src = finalSrc;
                // Promise catch para evitar erros de play interrompido
                this.bgVideo.play().catch(e => console.log("Video play interrupted/prevented"));
            }
        }

        setupVideoObserver() {
            if (!this.section || !this.bgVideo) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    entry.isIntersecting ? this.bgVideo.play().catch(() => { }) : this.bgVideo.pause();
                });
            }, { threshold: 0.5 });

            observer.observe(this.section);
        }

        revealCards() {
            this.originalCards.forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }
    }

    // 5. INICIALIZAÇÃO
    // Instancia as classes
    const sidebar = new Sidebar();
    const parallax = new ParallaxManager();

    // Pequeno delay para garantir que o layout renderizou
    requestAnimationFrame(() => {
        const carousel = new Carousel();
    });

});