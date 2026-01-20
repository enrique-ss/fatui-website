document.addEventListener('DOMContentLoaded', () => {
    // SELETORES
    const carouselTrack = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.harbinger-card');
    const indicators = document.querySelectorAll('.indicator-dot');
    const bgVideo = document.querySelector('.carousel-bg-video');

    let currentIndex = 0;
    const totalCards = cards.length;

    // SEARCH HEADER
    const searchInput = document.getElementById('searchInput');
    const harbingerCards = document.querySelectorAll('.harbinger-card');

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();

        harbingerCards.forEach(card => {
            const name = card.querySelector('.card-title-gothic')
                .textContent.toLowerCase();

            card.style.display = name.includes(value) ? '' : 'none';
        });
    });


    // INICIALIZAÇÃO
    function init() {
        updateCarousel();
        createIndicators();
    }

    // ATUALIZAR CARROSSEL
    function updateCarousel() {
        // Calcular deslocamento
        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(carouselTrack).gap) || 40;
        const offset = -(currentIndex * (cardWidth + gap));

        carouselTrack.style.transform = `translateX(calc(50% - ${cardWidth / 2}px + ${offset}px))`;

        // Atualizar classes ativas
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });

        // Atualizar indicadores
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // Atualizar vídeo de fundo
        updateBackgroundVideo();
    }

    // ATUALIZAR VÍDEO DE FUNDO
    function updateBackgroundVideo() {
        const activeCard = cards[currentIndex];
        const videoSource = activeCard.dataset.video;

        if (videoSource && bgVideo && bgVideo.src !== videoSource) {
            bgVideo.src = videoSource;
            bgVideo.load();
            bgVideo.play().catch(() => { });
        }
    }

    // CRIAR INDICADORES
    function createIndicators() {
        indicators.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
    }

    // NAVEGAÇÃO - PRÓXIMO
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }

    // NAVEGAÇÃO - ANTERIOR
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
    }

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
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }
    }

    // CLICK NOS CARDS PARA NAVEGAR
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            // Se não é o card ativo, navega para ele
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
            updateCarousel();
        }, 250);
    });

    // ANIMAÇÃO DE ENTRADA
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