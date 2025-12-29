document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('[data-video]');
    const sections = document.querySelectorAll('section');
    const characterSections = document.querySelectorAll('section[data-theme]');
    
    // Observer de vídeos
    const videoObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const v = e.target.querySelector('[data-video]');
            if (v) {
                e.isIntersecting ? v.play().catch(() => {}) : v.pause();
            }
        });
    }, { threshold: 0.5 });
    
    // Observer de animações
    const animObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });
    
    // Observer de seção ativa
    const activeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                characterSections.forEach(s => s.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' });
    
    // Aplicar observers
    sections.forEach(s => {
        videoObs.observe(s);
        animObs.observe(s);
    });
    
    characterSections.forEach(s => activeObs.observe(s));
    
    // Primeira seção visível
    if (sections.length > 0) sections[0].classList.add('visible');
    
    // Pausar vídeos quando aba perde foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) videos.forEach(v => v.pause());
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
});