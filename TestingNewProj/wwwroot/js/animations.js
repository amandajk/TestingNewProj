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
    navScrollHandler();
};

window.disposeNavScroll = () => {
    if (navScrollHandler) {
        window.removeEventListener('scroll', navScrollHandler);
        navScrollHandler = null;
    }
};

// ── Horizontal Gallery Scroll ──
window.initHorizontalGallery = (el) => {
    if (!el) return;

    const items = Array.from(el.querySelectorAll('.gallery-item'));
    const speeds = [0.4, 0.8, 1.4, 0.6, 1.0, 1.6];
    items.forEach((item, i) => { item._parallaxSpeed = speeds[i % speeds.length]; });

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    let scrollPos = 0, targetScroll = 0, rafId = null;
    const lerp = (a, b, t) => a + (b - a) * t;

    const applyParallax = () => {
        if (isMobile()) return; // skip parallax on mobile vertical layout
        items.forEach(item => {
            const extra = scrollPos * (item._parallaxSpeed - 1) * 0.18;
            item.style.transform = `translateY(${extra}px)`;
        });
    };

    const tick = () => {
        if (!isMobile()) {
            scrollPos = lerp(scrollPos, targetScroll, 0.08);
            el.scrollLeft = scrollPos;
            applyParallax();
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // wheel hijack (desktop only)
    const onWheel = (e) => {
        if (isMobile()) return;
        const atLeft = targetScroll <= 0;
        const atRight = targetScroll + el.clientWidth >= el.scrollWidth - 1;
        if ((e.deltaY < 0 && atLeft) || (e.deltaY > 0 && atRight)) return;
        e.preventDefault();
        targetScroll = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, targetScroll + e.deltaY * 1.5));
    };

    // click + drag (desktop only)
    let isDown = false, startX, scrollStart;
    const onMouseDown = (e) => { if (isMobile()) return; isDown = true; startX = e.pageX; scrollStart = targetScroll; };
    const onMouseUp = () => { isDown = false; };
    const onMouseMove = (e) => {
        if (!isDown || isMobile()) return;
        e.preventDefault();
        targetScroll = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, scrollStart - (e.pageX - startX)));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    el._galleryCleanup = () => {
        cancelAnimationFrame(rafId);
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mouseleave', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
    };
};

window.disposeHorizontalGallery = (el) => {
    if (el && el._galleryCleanup) el._galleryCleanup();
};