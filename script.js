// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const videos = document.querySelectorAll('[data-video]');
    const sections = document.querySelectorAll('section');
    const characterSections = document.querySelectorAll('section[data-theme]');
    const timeButtons = document.querySelectorAll('.time-btn');
    const navbar = document.getElementById('barra-nav');
    
    // Estado do tempo (presente ou passado)
    let currentTime = null;
    
    // ==================== CONTROLE DE TEMPO ====================
    
    // Oculta navbar e seções de personagens inicialmente
    navbar.style.display = 'none';
    characterSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Função para alternar entre presente e passado
    function setTimePeriod(time) {
        currentTime = time;
        
        // Mostra navbar e seções de personagens
        navbar.style.display = 'block';
        characterSections.forEach(section => {
            section.style.display = 'flex';
        });
        
        // Alterna títulos e subtítulos dos cards
        document.querySelectorAll('.title-presente, .subtitle-presente, .section-title-presente').forEach(el => {
            el.style.display = time === 'presente' ? 'inline' : 'none';
        });
        
        document.querySelectorAll('.title-passado, .subtitle-passado, .section-title-passado').forEach(el => {
            el.style.display = time === 'passado' ? 'inline' : 'none';
        });
        
        // Alterna conteúdo de história
        document.querySelectorAll('.history-content').forEach(content => {
            const contentTime = content.getAttribute('data-time');
            if (contentTime === time) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
        
        // Controla visibilidade de elementos que só aparecem no presente
        document.querySelectorAll('[data-show-in]').forEach(element => {
            const showIn = element.getAttribute('data-show-in');
            if (showIn === time) {
                element.style.display = element.classList.contains('info-grid') ? 'grid' : 
                                       element.classList.contains('video-container') ? 'block' : 
                                       element.tagName === 'H2' ? 'flex' : 'block';
            } else {
                element.style.display = 'none';
            }
        });
        
        // Scroll suave para a primeira seção de personagem após um delay
        setTimeout(() => {
            if (characterSections.length > 0) {
                characterSections[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 200);
    }
    
    // Event listeners dos botões de tempo
    timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const time = btn.getAttribute('data-time');
            setTimePeriod(time);
        });
    });
    
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
    // Scroll suave com centralização da seção (com pequeno delay para garantir posicionamento)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Pequeno delay para garantir que a seção está visível
                setTimeout(() => {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 50);
            }
        });
    });
});