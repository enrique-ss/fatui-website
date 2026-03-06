/**
 * config.js
 * ─────────────────────────────────────────────
 * Centraliza TODAS as configurações do projeto.
 * Altere aqui para ajustar comportamentos globais
 * sem precisar mexer na lógica dos outros arquivos.
 */

const CONFIG = {

    // Seletores CSS usados por cada módulo
    selectors: {

        carousel: {
            track: '.carousel-track',
            cards: '.harbinger-card',
            indicators: '.indicator-dot',
            video: '.carousel-bg-video',
            section: '.carousel-section',
            btnPrev: '.carousel-btn-prev',
            btnNext: '.carousel-btn-next',
        },

        sidebar: {
            menu: '#sidebarMenu',
            btnOpen: '#hamburgerBtn',
            btnClose: '#sidebarClose',
            overlay: '#sidebarOverlay',
            items: '.sidebar-item',
        },

        parallax: {
            // NOTA: .parallax-element não é usado no HTML atual.
            // O array ficará vazio — sem erro, sem efeito.
            // Para ativar: adicione class="parallax-element" em
            // qualquer elemento que quiser animar no scroll.
            elements: '.parallax-element',
            intro: '.intro-content',  // fade ao rolar a intro
        },

    },

    // Configurações de animação (em milissegundos)
    animation: {
        duration: 600,  // duração de cada transição do carrossel
        gap: 40,   // espaço entre os cards (fallback se CSS não definir)
        stepDelay: 120,  // intervalo entre passos na navegação animada
    },

    // Configurações específicas do carrossel
    carousel: {
        visibleSides: 2, // quantos cards aparecem de cada lado do card ativo
    },

};