/**
 * parallax.js
 * ─────────────────────────────────────────────
 * Cria dois efeitos visuais de profundidade:
 *
 *  1. SCROLL PARALLAX
 *     Elementos com `.parallax-element` se movem
 *     em velocidades diferentes durante o scroll,
 *     criando sensação de profundidade.
 *
 *  2. INTRO FADE
 *     O conteúdo da intro some suavemente
 *     conforme o usuário rola a página para baixo.
 *
 * Depende de: config.js  (CONFIG)
 */

class ParallaxManager {

    constructor() {
        this.elements = document.querySelectorAll(CONFIG.selectors.parallax.elements);
        this.introContent = document.querySelector(CONFIG.selectors.parallax.intro);

        // Controle de performance: evita múltiplas chamadas de scroll por frame
        this.ticking = false;

        // Posição do mouse (suavizada com lerp)
        this.mouse = { x: 0, y: 0, currentX: 0, currentY: 0 };

        this.init();
    }

    init() {
        // Scroll usa { passive: true } para não travar a rolagem nativa
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Loop contínuo para suavizar o movimento do mouse
        this.animateMouse();
    }

    /**
     * Garante que o parallax de scroll seja processado
     * apenas uma vez por frame de animação.
     */
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollParallax();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    /**
     * Move cada elemento parallax em velocidade própria
     * e aplica o efeito de fade na intro.
     */
    updateScrollParallax() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;

        // Cada elemento tem velocidade ligeiramente diferente (profundidade)
        this.elements.forEach((el, index) => {
            const speed = 0.3 + (index * 0.1);
            el.style.transform = `translateY(${-scrolled * speed}px)`;
        });

        // Fade + encolhimento da intro conforme o usuário rola
        if (this.introContent && scrolled < windowHeight) {
            const progress = scrolled / windowHeight;

            this.introContent.style.opacity = Math.max(0, 1 - progress * 1.5);
            this.introContent.style.transform =
                `translateY(${scrolled * 0.5}px) scale(${Math.max(0.8, 1 - progress * 0.2)})`;
        }
    }

    /**
     * Captura a posição normalizada do mouse:
     * -1 = esquerda/topo  |  0 = centro  |  +1 = direita/base
     */
    handleMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    /**
     * Suaviza o movimento do mouse com lerp (linear interpolation).
     * Roda em loop via requestAnimationFrame.
     */
    animateMouse() {
        this.mouse.currentX += (this.mouse.x - this.mouse.currentX) * 0.05;
        this.mouse.currentY += (this.mouse.y - this.mouse.currentY) * 0.05;

        requestAnimationFrame(() => this.animateMouse());
    }
}