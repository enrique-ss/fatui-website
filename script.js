document.addEventListener('DOMContentLoaded', () => {
    // Seletores Principais
    const navLogo = document.querySelector('.nav-logo');
    const navLateral = document.querySelector('.nav-lateral');
    const navLinks = document.querySelectorAll('.btn-nav-mod');
    const videos = document.querySelectorAll('.video-fundo');
    const sections = document.querySelectorAll('section');
    const characterSections = document.querySelectorAll('section[id]:not(#intro)');

    // SISTEMA DE "ÍMÃ" - SEMPRE ALINHA NA SEÇÃO MAIS PRÓXIMA
let scrollTimeout;
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (isScrolling) return;
    
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        snapToNearestSection();
    }, 150);
});

function snapToNearestSection() {
    const scrollTop = window.scrollY;
    let closestSection = sections[0];
    let minDistance = Math.abs(scrollTop - sections[0].offsetTop);

    // Encontra a seção mais próxima do topo da tela
    sections.forEach(section => {
        const distance = Math.abs(scrollTop - section.offsetTop);
        if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
        }
    });

    // Se não tá exatamente no topo da seção, alinha
    if (Math.abs(scrollTop - closestSection.offsetTop) > 10) {
        isScrolling = true;
        window.scrollTo({
            top: closestSection.offsetTop,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            isScrolling = false;
        }, 700);
    }
}

function snapToNearestSection(direction) {
    const scrollTop = window.scrollY;
    let currentIndex = -1;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollTop >= sectionTop - 50 && scrollTop < sectionBottom) {
            currentIndex = index;
        }
    });

    let targetSection = null;

    if (direction === 'down' && currentIndex < sections.length - 1) {
        targetSection = sections[currentIndex + 1];
    } else if (direction === 'up' && currentIndex > 0) {
        targetSection = sections[currentIndex - 1];
    }

    if (targetSection) {
        isScrolling = true;
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            isScrolling = false;
            lastScrollTop = window.scrollY;
            scrollAmount = 0;
        }, 800);
    }
}

    // 1. LÓGICA DA SIDEBAR (ABRIR/FECHAR)
    if (navLogo) {
        navLogo.addEventListener('click', () => {
            navLateral.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 900) {
                navLateral.classList.remove('active');
            }
        });
    });

    // 2. OBSERVER DE VÍDEOS
    const videoObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const v = e.target.querySelector('.video-fundo');
            if (v) {
                if (e.isIntersecting) {
                    v.play().catch(() => {});
                } else {
                    v.pause();
                }
            }
        });
    }, { threshold: 0.4 });

    // 3. OBSERVER DE ANIMAÇÕES
    const animObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    // 4. OBSERVER DE SEÇÃO ATIVA
    const activeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.style.borderColor = 'rgba(255,255,255,0.1)';
                    link.style.background = 'rgba(255,255,255,0.05)';
                    
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.borderColor = '#fff';
                        link.style.background = 'rgba(255,255,255,0.2)';
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' });

    sections.forEach(s => {
        videoObs.observe(s);
        animObs.observe(s);
    });
    
    characterSections.forEach(s => activeObs.observe(s));

    // 5. COMPORTAMENTOS EXTRAS
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videos.forEach(v => v.pause());
        } else {
            const activeSection = document.querySelector('section.visible');
            if (activeSection) {
                const v = activeSection.querySelector('.video-fundo');
                if (v) v.play().catch(() => {});
            }
        }
    });

    // Scroll direto pra posição exata da seção
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                isScrolling = true;
                const posicao = target.offsetTop;
                window.scrollTo({
                    top: posicao,
                    behavior: 'auto'
                });
                setTimeout(() => {
                    isScrolling = false;
                    lastScrollTop = window.scrollY;
                }, 100);
            }
        });
    });
});