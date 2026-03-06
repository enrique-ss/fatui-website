/**
 * main.js
 * ─────────────────────────────────────────────
 * Ponto de entrada da aplicação.
 *
 * Responsabilidades:
 *  - Aguardar o DOM estar pronto
 *  - Instanciar cada módulo na ordem correta
 *  - Conectar os links da narrativa ao carrossel
 *
 * NÃO contém lógica de negócio.
 * Cada módulo cuida do próprio comportamento.
 *
 * Ordem de carregamento no HTML:
 *  <script src="js/config.js"></script>
 *  <script src="js/sidebar.js"></script>
 *  <script src="js/parallax.js"></script>
 *  <script src="js/carousel.js"></script>
 *  <script src="js/main.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {

    // Instancia os módulos
    const sidebar = new Sidebar();
    const parallax = new ParallaxManager();

    // O carrossel é adiado um frame para garantir que o layout
    // já foi calculado pelo browser antes de medir os cards
    requestAnimationFrame(() => {
        const carousel = new Carousel();
    });

    // ─── Links da narrativa → carrossel ──────────────────
    // Elementos com classe .harbinger-link e data-index="N"
    // fazem scroll até o carrossel e abrem o card N ao clicar.

    document.querySelectorAll('.harbinger-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetIndex = parseInt(link.dataset.index);

            // 1. Scroll suave até a seção do carrossel
            document.querySelector('#carousel-section')
                ?.scrollIntoView({ behavior: 'smooth' });

            // 2. Aguarda o scroll terminar antes de trocar o card
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('carousel:navigate', {
                    detail: { index: targetIndex }
                }));
            }, 800);
        });
    });

});