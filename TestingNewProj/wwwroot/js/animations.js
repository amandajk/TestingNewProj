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

    const items = Array.from(el.querySelectorAll('.gallery-item:not(.gallery-item-clone)'));
    const allItems = Array.from(el.querySelectorAll('.gallery-item'));
    const speeds = [0.4, 0.8, 1.4, 0.6, 1.0, 1.6];
    allItems.forEach((item, i) => { item._parallaxSpeed = speeds[i % speeds.length]; });

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    let scrollPos = 0, targetScroll = 0, rafId = null;
    const lerp = (a, b, t) => a + (b - a) * t;

    const getHalfWidth = () => {
        // width of the original set only (half of total track)
        return el.scrollWidth / 2;
    };

    const applyParallax = () => {
        allItems.forEach(item => {
            const extra = scrollPos * (item._parallaxSpeed - 1) * 0.18;
            item.style.transform = `translateY(${extra}px)`;
        });
    };

    const tick = () => {
        if (!isMobile()) {
            scrollPos = lerp(scrollPos, targetScroll, 0.08);

            // seamless loop
            const half = getHalfWidth();
            if (scrollPos >= half) {
                scrollPos -= half;
                targetScroll -= half;
            } else if (scrollPos < 0) {
                scrollPos += half;
                targetScroll += half;
            }

            el.scrollLeft = scrollPos;
            applyParallax();
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // wheel hijack
    const onWheel = (e) => {
        if (isMobile()) return;
        e.preventDefault();
        targetScroll += e.deltaY * 1.5;
    };

    // click + drag
    let isDown = false, startX, scrollStart;
    const onMouseDown = (e) => { if (isMobile()) return; isDown = true; startX = e.pageX; scrollStart = targetScroll; };
    const onMouseUp = () => { isDown = false; };
    const onMouseMove = (e) => {
        if (!isDown || isMobile()) return;
        e.preventDefault();
        targetScroll = scrollStart - (e.pageX - startX);
    };

    const onResize = () => {
        if (isMobile()) allItems.forEach(item => { item.style.transform = ''; });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    el._galleryCleanup = () => {
        cancelAnimationFrame(rafId);
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mouseleave', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
    };
};

window.disposeHorizontalGallery = (el) => {
    if (el && el._galleryCleanup) el._galleryCleanup();
};