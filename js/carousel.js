/**
 * carousel.js
 * ─────────────────────────────────────────────
 * Carrossel simples com índice e wrap-around.
 *
 * COMO FUNCIONA
 * ──────────────
 * Existe um número atual: currentIndex (começa em 0).
 * Ao navegar, esse número sobe ou desce.
 * Se passar do último, volta para 0.
 * Se passar do 0, vai para o último.
 * Nada de clones ou teleporte.
 *
 * Depende de: config.js  (CONFIG)
 */

class Carousel {

    constructor() {
        const s = CONFIG.selectors.carousel;

        this.track = document.querySelector(s.track);
        this.cards = Array.from(document.querySelectorAll(s.cards));
        this.indicators = document.querySelectorAll(s.indicators);
        this.bgVideo = document.querySelector(s.video);
        this.btnPrev = document.querySelector(s.btnPrev);
        this.btnNext = document.querySelector(s.btnNext);
        this.section = document.querySelector(s.section);

        this.total = this.cards.length;
        this.currentIndex = 0;
        this.isMoving = false;

        if (this.track && this.total > 0) this.init();
    }

    // ─── INICIALIZAÇÃO ───────────────────────────────────

    init() {
        this.setupEvents();
        this.setupVideoObserver();
        this.goTo(0, false);   // posiciona no card 0 sem animação
        this.revealCards();

        // Evento externo: sidebar e links da narrativa usam isso
        document.addEventListener('carousel:navigate', (e) => {
            this.goTo(e.detail.index);
        });
    }

    // ─── NAVEGAÇÃO ────────────────────────────────────────

    next() {
        // Passa do último? Volta para o 0
        const nextIndex = (this.currentIndex + 1) % this.total;
        this.goTo(nextIndex);
    }

    prev() {
        // Passou do 0? Vai para o último
        const prevIndex = (this.currentIndex - 1 + this.total) % this.total;
        this.goTo(prevIndex);
    }

    /**
     * Vai diretamente para um índice.
     * @param {number}  index    índice do card destino
     * @param {boolean} animate  false = sem animação (padrão: true)
     */
    goTo(index, animate = true) {
        if (this.isMoving && animate) return;
        if (index === this.currentIndex && animate) return;

        this.isMoving = true;
        this.currentIndex = index;

        this.moveTrack(animate);
        this.updateUI();

        // Libera o bloqueio após a animação terminar
        setTimeout(() => {
            this.isMoving = false;
        }, animate ? CONFIG.animation.duration : 0);
    }

    // ─── POSICIONAMENTO DA FAIXA ──────────────────────────

    /**
     * Desloca a faixa para mostrar o card atual no centro.
     */
    moveTrack(animate) {
        const cardWidth = this.cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(this.track).gap) || CONFIG.animation.gap;
        const offset = -(this.currentIndex * (cardWidth + gap));

        this.track.style.transition = animate
            ? `transform ${CONFIG.animation.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
            : 'none';

        this.track.style.transform =
            `translateX(calc(50% - ${cardWidth / 2}px + ${offset}px))`;
    }

    // ─── ATUALIZAÇÃO DA UI ────────────────────────────────

    updateUI() {
        // Marca o card ativo
        this.cards.forEach((card, i) =>
            card.classList.toggle('active', i === this.currentIndex)
        );

        // Marca o ponto indicador correspondente
        this.indicators.forEach((dot, i) =>
            dot.classList.toggle('active', i === this.currentIndex)
        );

        this.updateVideo();
    }

    // ─── VÍDEO DE FUNDO ───────────────────────────────────

    updateVideo() {
        if (!this.bgVideo) return;

        const videoSrc = this.cards[this.currentIndex]?.dataset.video;
        if (!videoSrc || this.bgVideo.src.includes(videoSrc)) return;

        const fullSrc = videoSrc.startsWith('http')
            ? videoSrc
            : `${window.location.origin}/${videoSrc}`;

        // Fade out → troca o src → fade in
        this.bgVideo.style.opacity = '0';
        setTimeout(() => {
            this.bgVideo.src = fullSrc;
            this.bgVideo.play().then(() => {
                this.bgVideo.style.transition = 'opacity 0.3s ease';
                this.bgVideo.style.opacity = '1';
            }).catch(() => { });
        }, 150);
    }

    setupVideoObserver() {
        if (!this.section || !this.bgVideo) return;

        // Pausa quando a seção sai da tela (economia de recursos)
        new IntersectionObserver((entries) => {
            entries.forEach(e =>
                e.isIntersecting
                    ? this.bgVideo.play().catch(() => { })
                    : this.bgVideo.pause()
            );
        }, { threshold: 0.5 }).observe(this.section);
    }

    // ─── EVENTOS ──────────────────────────────────────────

    setupEvents() {
        // Botões
        this.btnPrev?.addEventListener('click', () => this.prev());
        this.btnNext?.addEventListener('click', () => this.next());

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Clique direto em um card
        this.cards.forEach((card, i) => {
            card.addEventListener('click', () => {
                if (!this.isMoving) this.goTo(i);
            });
        });

        // Pontos indicadores
        this.indicators.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (!this.isMoving) this.goTo(i);
            });
        });

        // Swipe (touch)
        this.setupSwipe();

        // Recalcula posição ao redimensionar
        window.addEventListener('resize', () => this.goTo(this.currentIndex, false));
    }

    setupSwipe() {
        let startX = 0;

        this.track.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
        }, { passive: true });
    }

    // ─── ENTRADA ──────────────────────────────────────────

    revealCards() {
        this.cards.forEach((card, i) => {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease';
                card.style.opacity = '1';
            }, i * 80);
        });
    }
}