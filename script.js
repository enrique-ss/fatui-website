document.addEventListener('DOMContentLoaded', () => {
    // Seletores Principais
    const navLogo = document.querySelector('.nav-logo');
    const navLateral = document.querySelector('.nav-lateral');
    const navLinks = document.querySelectorAll('.btn-nav-mod');
    const videos = document.querySelectorAll('.video-fundo');
    const sections = document.querySelectorAll('section');
    const characterSections = document.querySelectorAll('section[id]:not(#intro)');

    // 1. LÓGICA DA SIDEBAR (ABRIR/FECHAR)
    if (navLogo) {
        navLogo.addEventListener('click', () => {
            navLateral.classList.toggle('active');
        });
    }

    // Fechar a sidebar ao clicar em um link (útil para mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 900) {
                navLateral.classList.remove('active');
            }
        });
    });

    // 2. OBSERVER DE VÍDEOS (DESEMPENHO)
    // Dá play apenas no vídeo da seção que está na tela e pausa os outros
    const videoObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const v = e.target.querySelector('.video-fundo');
            if (v) {
                if (e.isIntersecting) {
                    v.play().catch(() => {}); // O catch evita erros de política de autoplay
                } else {
                    v.pause();
                }
            }
        });
    }, { threshold: 0.4 }); // Só ativa quando 40% da seção estiver visível

    // 3. OBSERVER DE ANIMAÇÕES (REVELAR CARDS)
    const animObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    // 4. OBSERVER DE SEÇÃO ATIVA (DESTACAR RANK NA SIDEBAR)
    const activeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.getAttribute('id');
                // Remove destaque de todos os links
                navLinks.forEach(link => {
                    link.style.borderColor = 'rgba(255,255,255,0.1)';
                    link.style.background = 'rgba(255,255,255,0.05)';
                    
                    // Se o link apontar para a seção atual, destaca ele
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.borderColor = '#fff';
                        link.style.background = 'rgba(255,255,255,0.2)';
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' });

    // Aplicar todos os Observers
    sections.forEach(s => {
        videoObs.observe(s);
        animObs.observe(s);
    });
    
    characterSections.forEach(s => activeObs.observe(s));

    // 5. COMPORTAMENTOS EXTRAS
    
    // Pausar tudo se o usuário mudar de aba no navegador
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videos.forEach(v => v.pause());
        } else {
            // Ao voltar, tenta dar play no vídeo da seção visível
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
                const posicao = target.offsetTop;
                window.scrollTo({
                    top: posicao,
                    behavior: 'auto'
                });
            }
        });
    });
});