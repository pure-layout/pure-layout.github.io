/**
 * PURE LAYOUT — Cinematic Elite Experience
 * Performance-first: heavy effects only on desktop + fine pointer
 */

const Device = {
  isTouch: () => window.matchMedia('(hover: none), (pointer: coarse)').matches,
  isMobile: () => window.innerWidth < 768,
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  canAnimate: () => !Device.prefersReducedMotion(),
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
    if (document.readyState === 'complete') hide();
    else {
      window.addEventListener('load', hide, { once: true });
      setTimeout(hide, 2000);
    }
  },
};

// ─── Scroll Progress ───
const ScrollProgress = {
  init() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      this.bar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  },
};

// ─── Reveal on scroll (CSS class toggle — zero GSAP cost) ───
const RevealObserver = {
  init() {
    const heroItems = document.querySelectorAll('.reveal-hero');
    const sections = document.querySelectorAll('.reveal-section');

    if (!Device.canAnimate()) {
      [...heroItems, ...sections].forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const showHero = () => {
      heroItems.forEach((el, i) => {
        const delay = Number(el.dataset.delay || 0) * 80;
        setTimeout(() => el.classList.add('is-visible'), delay);
      });
    };

    if ('IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            showHero();
            heroObs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      const hero = document.getElementById('hero');
      if (hero) heroObs.observe(hero);
      else showHero();

      const sectionObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              sectionObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
      );
      sections.forEach((s) => sectionObs.observe(s));
    } else {
      showHero();
      sections.forEach((s) => s.classList.add('is-visible'));
    }
  },
};

// ─── Lazy Images ───
const LazyImages = {
  init() {
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
      { rootMargin: '200px' }
    );
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => observer.observe(img));
  },
};

// ─── Custom Cursor ───
const CustomCursor = {
  init() {
    if (Device.isTouch() || Device.isMobile()) return;
    this.cursor = document.getElementById('custom-cursor');
    this.follower = document.getElementById('cursor-follower');
    if (!this.cursor || !this.follower) return;

    this.pos = { x: innerWidth / 2, y: innerHeight / 2 };
    this.mouse = { x: this.pos.x, y: this.pos.y };

    window.addEventListener(
      'mousemove',
      (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      },
      { passive: true }
    );

    const tick = () => {
      this.pos.x = MathUtils.lerp(this.pos.x, this.mouse.x, 0.18);
      this.pos.y = MathUtils.lerp(this.pos.y, this.mouse.y, 0.18);
      this.follower.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  },
};

// ─── Hero parallax (transform only) ───
const CinematicHero = {
  init() {
    if (Device.isTouch() || Device.isMobile() || !Device.canAnimate()) return;

    this.mockup = document.querySelector('.hero-3d-element');
      this.glowAccent = document.querySelector('.hero-glow--accent');
      if (!this.mockup) return;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouse.targetX = (e.clientX / innerWidth) * 2 - 1;
        mouse.targetY = (e.clientY / innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    const tick = () => {
      mouse.x = MathUtils.lerp(mouse.x, mouse.targetX, 0.06);
      mouse.y = MathUtils.lerp(mouse.y, mouse.targetY, 0.06);

      const rx = -(mouse.y * 6);
      const ry = mouse.x * 8;
      this.mockup.style.transform = `perspective(2000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(0.98)`;

      this.glows.forEach((g, i) => {
        const factor = (i + 1) * 8;
        g.style.transform = `translate(${mouse.x * factor}px, ${mouse.y * factor}px)`;
      });

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};

// ─── Magnetic buttons ───
const PremiumMagnetism = {
  init() {
    if (Device.isTouch() || !Device.canAnimate()) return;

    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      let rafId;
      const state = { x: 0, y: 0, tx: 0, ty: 0 };

      const move = () => {
        state.x = MathUtils.lerp(state.x, state.tx, 0.12);
        state.y = MathUtils.lerp(state.y, state.ty, 0.12);
        btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
        rafId = requestAnimationFrame(move);
      };

      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        state.tx = (e.clientX - r.left - r.width / 2) * 0.2;
        state.ty = (e.clientY - r.top - r.height / 2) * 0.2;
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
        rafId = requestAnimationFrame(move);
      });
      btn.addEventListener('mouseleave', () => {
        state.tx = 0;
        state.ty = 0;
        setTimeout(() => {
          cancelAnimationFrame(rafId);
          btn.style.transform = '';
          btn.style.transition = 'transform 0.4s var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1))';
        }, 280);
      });
    });
  },
};

// ─── Card spotlight ───
const CinematicSpotlight = {
  init() {
    if (Device.isTouch()) return;
    document.querySelectorAll('.bento-card, .portfolio-item').forEach((card) => {
      card.addEventListener(
        'mousemove',
        (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        },
        { passive: true }
      );
    });
  },
};

// ─── GSAP scroll polish (desktop, light) ───
const CinematicReveals = {
  init() {
    if (!Device.canAnimate() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    if (!Device.isMobile()) {
      document.querySelectorAll('.portfolio-item').forEach((item) => {
        const visual = item.querySelector('.portfolio-visual');
        if (!visual) return;
        gsap.fromTo(
          visual,
          { y: 40, opacity: 0.85 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 82%', scrub: 0.4 },
          }
        );
      });
    }

    const bento = document.querySelectorAll('.bento-card');
    if (bento.length) {
      gsap.fromTo(
        bento,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#diferenciais', start: 'top 75%' },
        }
      );
    }
  },
};

// ─── Mobile menu ───
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
      if (e.key === 'Escape') this.close();
    });
  },
  open() {
    this.scrollY = scrollY;
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
    this.toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    scrollTo(0, this.scrollY);
  },
};

// ─── Navbar, FAB, anchors ───
const InterfaceLogic = {
  init() {
    this.header = document.getElementById('navbar');
    this.fab = document.getElementById('fab-whatsapp');

    if (this.header) {
      const onScroll = () => this.header.classList.toggle('is-scrolled', scrollY > 40);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (this.fab) {
      let lastY = 0;
      window.addEventListener(
        'scroll',
        () => {
          const y = scrollY;
          const nearBottom = y + innerHeight > document.body.scrollHeight - 100;
          this.fab.classList.toggle('is-hidden', (y > lastY && y > 200) || nearBottom);
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
        const offset = (this.header?.offsetHeight || 72) + 8;
        const top = target.getBoundingClientRect().top + scrollY - offset;
        scrollTo({ top, behavior: Device.canAnimate() ? 'smooth' : 'auto' });
        MobileMenu.close();
      });
    });
  },
};

const Icons = {
  init() {
    const go = () => typeof lucide !== 'undefined' && lucide.createIcons();
    go();
    window.addEventListener('load', go, { once: true });
  },
};

const bootstrap = () => {
  PageLoader.init();
  ScrollProgress.init();
  LazyImages.init();
  Icons.init();
  MobileMenu.init();
  InterfaceLogic.init();
  RevealObserver.init();

  if (!Device.isTouch() && !Device.isMobile()) {
    CustomCursor.init();
    CinematicHero.init();
    PremiumMagnetism.init();
    CinematicSpotlight.init();
  }

  requestAnimationFrame(() => {
    setTimeout(() => CinematicReveals.init(), 120);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

