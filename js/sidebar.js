/**
 * sidebar.js
 * ─────────────────────────────────────────────
 * Controla o menu lateral (hambúrguer):
 *  - Abre / fecha o painel
 *  - Bloqueia o scroll da página quando aberto
 *  - Ao clicar em um item, navega para o card
 *    correspondente no carrossel via evento customizado
 *
 * Depende de: config.js  (CONFIG)
 */

class Sidebar {

    constructor() {
        // Seleciona os elementos do DOM usando os seletores do config
        const s = CONFIG.selectors.sidebar;

        this.menu = document.querySelector(s.menu);
        this.overlay = document.querySelector(s.overlay);
        this.btnOpen = document.querySelector(s.btnOpen);
        this.btnClose = document.querySelector(s.btnClose);
        this.items = document.querySelectorAll(s.items);

        // Só inicializa se o menu existir na página
        if (this.menu) this.init();
    }

    init() {
        // Botão de abrir (ícone hambúrguer)
        this.btnOpen?.addEventListener('click', () => this.toggle(true));

        // Botão de fechar (X dentro do menu)
        this.btnClose?.addEventListener('click', () => this.toggle(false));

        // Clique no overlay escuro fecha o menu
        this.overlay?.addEventListener('click', () => this.toggle(false));

        // Cada item do menu navega para um card do carrossel
        this.items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const targetIndex = parseInt(item.dataset.index);

                // Avisa o carrossel qual card deve ficar ativo
                document.dispatchEvent(new CustomEvent('carousel:navigate', {
                    detail: { index: targetIndex }
                }));

                this.toggle(false);

                // Aguarda o menu fechar antes de fazer o scroll
                setTimeout(() => {
                    document.querySelector('#carousel-section')
                        ?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            });
        });
    }

    /**
     * Abre ou fecha o menu lateral.
     * @param {boolean} isActive  true = abre, false = fecha
     */
    toggle(isActive) {
        const action = isActive ? 'add' : 'remove';

        this.menu.classList[action]('active');
        this.overlay.classList[action]('active');

        // Impede o scroll da página enquanto o menu está aberto
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}