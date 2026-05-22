/**
 * PURE LAYOUT — Mobile-first cinematic experience
 * Performance: disables heavy effects on touch devices
 */

const Device = {
  isTouch: () => window.matchMedia('(hover: none), (pointer: coarse)').matches,
  isMobile: () => window.innerWidth < 768,
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const MathUtils = {
  lerp: (start, end, factor) => start + (end - start) * factor,
};

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

// ─── Page Loader ───
const PageLoader = {
  init() {
    this.el = document.getElementById('page-loader');
    if (!this.el) return;

    const hide = () => {
      this.el.classList.add('is-done');
      setTimeout(() => this.el.remove(), 600);
    };

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
      setTimeout(hide, 2500);
    }
  },
};

// ─── Lazy Images ───
const LazyImages = {
  init() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        });
      },
      { rootMargin: '200px 0px' }
    );

    images.forEach((img) => observer.observe(img));
  },
};

// ─── Custom Cursor (desktop only) ───
const CustomCursor = {
  init() {
    if (Device.isTouch() || Device.isMobile()) return;

    this.cursor = document.getElementById('custom-cursor');
    this.follower = document.getElementById('cursor-follower');
    if (!this.cursor || !this.follower) return;

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: this.pos.x, y: this.pos.y };
    this.speed = 0.2;
    this.rafId = null;

    window.addEventListener(
      'mousemove',
      (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.cursor.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
      },
      { passive: true }
    );

    const render = () => {
      this.pos.x = MathUtils.lerp(this.pos.x, this.mouse.x, this.speed);
      this.pos.y = MathUtils.lerp(this.pos.y, this.mouse.y, this.speed);
      this.follower.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);

    document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  },

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  },
};

// ─── Hero 3D Parallax (desktop only) ───
const CinematicHero = {
  init() {
    if (Device.isTouch() || Device.isMobile() || Device.prefersReducedMotion()) return;

    this.mockupElement = document.querySelector('.hero-3d-element');
    if (!this.mockupElement) return;

    this.rafId = null;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    const render = () => {
      mouse.x = MathUtils.lerp(mouse.x, mouse.targetX, 0.05);
      mouse.y = MathUtils.lerp(mouse.y, mouse.targetY, 0.05);

      const rotateX = -(mouse.y * 8);
      const rotateY = mouse.x * 10;
      const translateZ = Math.abs(mouse.x * 20);

      this.mockupElement.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(0.98)`;
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  },
};

// ─── Magnetic Buttons (desktop only) ───
const PremiumMagnetism = {
  init() {
    if (Device.isTouch() || Device.prefersReducedMotion()) return;

    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      let rafId;
      const state = { x: 0, y: 0, targetX: 0, targetY: 0 };

      const move = () => {
        state.x = MathUtils.lerp(state.x, state.targetX, 0.1);
        state.y = MathUtils.lerp(state.y, state.targetY, 0.1);
        btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
        rafId = requestAnimationFrame(move);
      };

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        state.targetX = (e.clientX - rect.left - rect.width / 2) * 0.25;
        state.targetY = (e.clientY - rect.top - rect.height / 2) * 0.25;
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
        rafId = requestAnimationFrame(move);
      });

      btn.addEventListener('mouseleave', () => {
        state.targetX = 0;
        state.targetY = 0;
        setTimeout(() => {
          cancelAnimationFrame(rafId);
          btn.style.transform = '';
          btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }, 300);
      });
    });
  },
};

// ─── Card Spotlight (desktop only) ───
const CinematicSpotlight = {
  init() {
    if (Device.isTouch()) return;

    document.querySelectorAll('.bento-card, .portfolio-item').forEach((card) => {
      card.addEventListener(
        'mousemove',
        (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });
  },
};

// ─── GSAP Reveals (lighter on mobile) ───
const CinematicReveals = {
  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (Device.prefersReducedMotion()) {
      document.querySelectorAll('.reveal-up, .bento-card').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = Device.isMobile();
    const revealDuration = isMobile ? 0.7 : 1.2;
    const revealBlur = isMobile ? 0 : 10;

    const reveals = document.querySelectorAll('.reveal-up');
    if (reveals.length) {
      gsap.fromTo(
        reveals,
        { y: isMobile ? 24 : 50, opacity: 0, filter: `blur(${revealBlur}px)` },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: revealDuration,
          stagger: isMobile ? 0.06 : 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#hero', start: 'top 85%' },
        }
      );
    }

    const bentoCards = document.querySelectorAll('.bento-card');
    if (bentoCards.length) {
      gsap.fromTo(
        bentoCards,
        { y: isMobile ? 30 : 80, opacity: 0, scale: isMobile ? 1 : 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: isMobile ? 0.6 : 1,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#diferenciais',
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    if (!isMobile) {
      document.querySelectorAll('.portfolio-item img').forEach((img) => {
        gsap.fromTo(
          img,
          { y: 30, scale: 0.95 },
          {
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: img.closest('.portfolio-item'), start: 'top 85%', scrub: 0.5 },
          }
        );
      });
    }
  },
};

// ─── Mobile Menu (scroll lock + a11y) ───
const MobileMenu = {
  scrollY: 0,

  init() {
    this.menu = document.getElementById('mobile-menu');
    this.toggle = document.getElementById('menu-toggle');
    this.closeBtn = document.getElementById('menu-close');
    if (!this.menu || !this.toggle) return;

    this.toggle.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());

    this.menu.querySelectorAll('[data-menu-close]').forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menu.classList.contains('is-open')) this.close();
    });
  },

  open() {
    this.scrollY = window.scrollY;
    this.menu.classList.add('is-open');
    this.menu.setAttribute('aria-hidden', 'false');
    this.toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    document.body.style.top = `-${this.scrollY}px`;
  },

  close() {
    if (!this.menu?.classList.contains('is-open')) return;
    this.menu.classList.remove('is-open');
    this.menu.setAttribute('aria-hidden', 'true');
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, this.scrollY);
  },
};

// ─── Navbar & FAB ───
const InterfaceLogic = {
  init() {
    this.header = document.getElementById('navbar');
    this.fab = document.getElementById('fab-whatsapp');

    if (this.header) {
      const onScroll = () => {
        const scrolled = window.scrollY > 40;
        this.header.classList.toggle('is-scrolled', scrolled);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (this.fab) {
      let lastY = 0;
      window.addEventListener(
        'scroll',
        () => {
          const y = window.scrollY;
          const nearBottom = y + window.innerHeight > document.body.scrollHeight - 120;
          const scrollingDown = y > lastY && y > 200;
          this.fab.classList.toggle('is-hidden', scrollingDown || nearBottom);
          lastY = y;
        },
        { passive: true }
      );
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = this.header?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: Device.prefersReducedMotion() ? 'auto' : 'smooth' });
        MobileMenu.close();
      });
    });
  },
};

// ─── Lucide Icons ───
const Icons = {
  init() {
    const refresh = () => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };
    refresh();
    window.addEventListener('load', refresh, { once: true });
  },
};

// ─── Bootstrap ───
const bootstrap = () => {
  PageLoader.init();
  LazyImages.init();
  Icons.init();
  MobileMenu.init();
  InterfaceLogic.init();

  if (!Device.isTouch() && !Device.isMobile()) {
    CustomCursor.init();
    CinematicHero.init();
    PremiumMagnetism.init();
    CinematicSpotlight.init();
  }

  requestAnimationFrame(() => {
    setTimeout(() => CinematicReveals.init(), 100);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
