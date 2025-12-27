// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const videos = document.querySelectorAll('[data-video]');
    const sections = document.querySelectorAll('section');
    const characterSections = document.querySelectorAll('section[data-theme]');
    
    // ==================== CONFIGURAÇÕES DOS OBSERVERS ====================
    
    // Observer para controlar vídeos (play/pause)
    const videoObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    // Observer para animações de entrada das seções
    const animationObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    // Observer para detectar seção ativa (centralizada)
    const activeObserverOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    };
    
    // ==================== OBSERVER DE VÍDEOS ====================
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('[data-video]');
            
            if (entry.isIntersecting) {
                if (video) {
                    video.play().catch(err => {
                        console.log('Autoplay bloqueado:', err);
                    });
                }
            } else {
                if (video) {
                    video.pause();
                }
            }
        });
    }, videoObserverOptions);
    
    // ==================== OBSERVER DE ANIMAÇÕES ====================
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, animationObserverOptions);
    
    // ==================== OBSERVER DE SEÇÃO ATIVA ====================
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove 'active' de todas as seções
                characterSections.forEach(sec => sec.classList.remove('active'));
                // Adiciona 'active' à seção centralizada
                entry.target.classList.add('active');
            }
        });
    }, activeObserverOptions);
    
    // ==================== APLICAÇÃO DOS OBSERVERS ====================
    
    // Observa todas as seções para vídeos e animações
    sections.forEach(section => {
        videoObserver.observe(section);
        animationObserver.observe(section);
    });
    
    // Observa seções de personagens para destaque ativo
    characterSections.forEach(section => {
        activeObserver.observe(section);
    });
    
    // Primeira seção começa visível
    if (sections.length > 0) {
        sections[0].classList.add('visible');
    }
    
    // ==================== CONTROLE DE VISIBILIDADE DA PÁGINA ====================
    // Pausa todos os vídeos quando a página perde o foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videos.forEach(video => video.pause());
        }
    });
    
    // ==================== SMOOTH SCROLL ====================
    // Scroll suave com centralização da seção
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
});