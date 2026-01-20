document.addEventListener('DOMContentLoaded', () => {
    // SELETORES
    const carouselTrack = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.harbinger-card');
    const indicators = document.querySelectorAll('.indicator-dot');
    const bgVideo = document.querySelector('.carousel-bg-video');
    const btnPrev = document.querySelector('.carousel-btn-prev');
    const btnNext = document.querySelector('.carousel-btn-next');

    let currentIndex = 0;
    const totalCards = cards.length;

    // Criar clones para efeito infinito
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[totalCards - 1].cloneNode(true);

    firstClone.classList.remove('active');
    lastClone.classList.remove('active');

    carouselTrack.appendChild(firstClone);
    carouselTrack.insertBefore(lastClone, cards[0]);

    // Atualizar referências após adicionar clones
    const allCards = document.querySelectorAll('.harbinger-card');
    let isTransitioning = false;

    // SEARCH HEADER
    const searchInput = document.getElementById('searchInput');
    const harbingerCards = document.querySelectorAll('.harbinger-card');

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();

        harbingerCards.forEach(card => {
            const titleElement = card.querySelector('.card-title-gothic');
            if (titleElement) {
                const name = titleElement.textContent.toLowerCase();
                card.style.display = name.includes(value) ? '' : 'none';
            }
        });
    });

    // INICIALIZAÇÃO
    function init() {
        // Posicionar no primeiro card real (índice 1 por causa do clone)
        currentIndex = 1;
        updateCarousel(false);
        createIndicators();
    }

    // ATUALIZAR CARROSSEL
    function updateCarousel(animate = true) {
        const cardWidth = allCards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(carouselTrack).gap) || 40;
        const offset = -(currentIndex * (cardWidth + gap));

        if (!animate) {
            carouselTrack.style.transition = 'none';
        } else {
            carouselTrack.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        carouselTrack.style.transform = `translateX(calc(50% - ${cardWidth / 2}px + ${offset}px))`;

        // Atualizar classes ativas (apenas nos cards originais)
        const realIndex = getRealIndex();
        allCards.forEach((card, index) => {
            card.classList.remove('active');
        });
        allCards[currentIndex].classList.add('active');

        // Atualizar indicadores
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === realIndex);
        });

        // Atualizar vídeo de fundo
        updateBackgroundVideo();
    }

    // OBTER ÍNDICE REAL (sem contar clones)
    function getRealIndex() {
        if (currentIndex === 0) return totalCards - 1; // Clone do último
        if (currentIndex === totalCards + 1) return 0; // Clone do primeiro
        return currentIndex - 1; // Índice real
    }

    // ATUALIZAR VÍDEO DE FUNDO
    function updateBackgroundVideo() {
        const activeCard = allCards[currentIndex];
        const videoSource = activeCard.dataset.video;

        if (videoSource && bgVideo) {
            const currentSrc = bgVideo.src;
            const newSrc = videoSource.startsWith('http') ? videoSource : window.location.origin + '/' + videoSource;

            if (!currentSrc.includes(videoSource)) {
                bgVideo.src = videoSource;
                bgVideo.load();
                bgVideo.play().catch(() => { });
            }
        }
    }

    // CRIAR INDICADORES
    function createIndicators() {
        indicators.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                currentIndex = index + 1; // +1 por causa do clone no início
                updateCarousel();
            });
        });
    }

    // NAVEGAÇÃO - PRÓXIMO
    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarousel();

        // Verificar se chegou no clone
        if (currentIndex === totalCards + 1) {
            setTimeout(() => {
                currentIndex = 1;
                updateCarousel(false);
                isTransitioning = false;
            }, 600);
        } else {
            setTimeout(() => {
                isTransitioning = false;
            }, 600);
        }
    }

    // NAVEGAÇÃO - ANTERIOR
    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateCarousel();

        // Verificar se chegou no clone
        if (currentIndex === 0) {
            setTimeout(() => {
                currentIndex = totalCards;
                updateCarousel(false);
                isTransitioning = false;
            }, 600);
        } else {
            setTimeout(() => {
                isTransitioning = false;
            }, 600);
        }
    }

    // EVENT LISTENERS - BOTÕES
    btnPrev.addEventListener('click', prevSlide);
    btnNext.addEventListener('click', nextSlide);

    // NAVEGAÇÃO POR TECLADO
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // TOUCH SWIPE (MOBILE)
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // CLICK NOS CARDS PARA NAVEGAR
    allCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (isTransitioning) return;
            if (index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    // OBSERVER DE VÍDEO (para pausar quando não visível)
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (bgVideo) {
                if (entry.isIntersecting) {
                    bgVideo.play().catch(() => { });
                } else {
                    bgVideo.pause();
                }
            }
        });
    }, { threshold: 0.5 });

    const carouselSection = document.querySelector('.carousel-section');
    if (carouselSection) {
        videoObserver.observe(carouselSection);
    }

    // PAUSAR VÍDEO QUANDO ABA INATIVA
    document.addEventListener('visibilitychange', () => {
        if (bgVideo) {
            if (document.hidden) {
                bgVideo.pause();
            } else {
                bgVideo.play().catch(() => { });
            }
        }
    });

    // REDIMENSIONAMENTO
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel(false);
        }, 250);
    });

    // ANIMAÇÃO DE ENTRADA (apenas cards originais)
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '';
            card.style.transform = '';
        }, index * 100);
    });

    // INICIALIZAR
    init();
});