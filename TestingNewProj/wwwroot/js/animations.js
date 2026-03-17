// ── Scroll Animations ──
window.initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(el => {
            if (el.isIntersecting) {
                el.target.classList.add('visible');
                observer.unobserve(el.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
};

// ── Transparent Navbar on Hero ──
let navScrollHandler = null;

window.initNavScroll = (dotnetRef) => {
    navScrollHandler = () => {
        const scrolled = window.scrollY > 60;
        dotnetRef.invokeMethodAsync('SetScrolled', scrolled);
    };
    window.addEventListener('scroll', navScrollHandler);
    // set initial state
    navScrollHandler();
};

window.disposeNavScroll = () => {
    if (navScrollHandler) {
        window.removeEventListener('scroll', navScrollHandler);
        navScrollHandler = null;
    }
};