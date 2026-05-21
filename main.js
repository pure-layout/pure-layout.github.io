/**
 * PURE LAYOUT — EXPERIÊNCIA DIGITAL CINEMATOGRÁFICA
 * Sem Scroll Hijacking - Scroll Nativo Rápido e Preciso
 */

// ─── 1. CORE PHYSICS & UTILS (Motor de Matemática) ───
const MathUtils = {
  lerp: (start, end, factor) => start + (end - start) * factor,
  clamp: (min, max, value) => Math.min(Math.max(value, min), max)
};

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });


// ─── 2. CUSTOM CURSOR (Interação de Elite) ───
const CustomCursor = {
  init() {
    this.cursor = document.getElementById('custom-cursor');
    this.follower = document.getElementById('cursor-follower');
    if (!this.cursor || !this.follower) return;

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: this.pos.x, y: this.pos.y };
    this.speed = 0.2;

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.cursor.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
    });

    const render = () => {
      this.pos.x = MathUtils.lerp(this.pos.x, this.mouse.x, this.speed);
      this.pos.y = MathUtils.lerp(this.pos.y, this.mouse.y, this.speed);
      
      this.follower.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }
};

// ─── 3. PARALLAX INTERATIVO & HERO CINEMÁTICO ───
const CinematicHero = {
  init() {
    this.heroSection = document.getElementById('hero');
    this.mockupElement = document.querySelector('.hero-3d-element');
    
    if (!this.heroSection || !this.mockupElement) return;

    const render = () => {
      mouse.x = MathUtils.lerp(mouse.x, mouse.targetX, 0.05);
      mouse.y = MathUtils.lerp(mouse.y, mouse.targetY, 0.05);

      const rotateX = -(mouse.y * 12);
      const rotateY = mouse.x * 15;  
      const translateZ = Math.abs(mouse.x * 30); 

      this.mockupElement.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(0.98)`;

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
};

// ─── 4. BOTÕES MAGNÉTICOS (Física Elástica) ───
const PremiumMagnetism = {
  init() {
    const magnets = document.querySelectorAll('[data-magnetic]');

    magnets.forEach(btn => {
      let rafId;
      let state = { x: 0, y: 0, targetX: 0, targetY: 0 };

      const move = () => {
        state.x = MathUtils.lerp(state.x, state.targetX, 0.1);
        state.y = MathUtils.lerp(state.y, state.targetY, 0.1);

        btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(1.02)`;

        const text = btn.querySelector('.relative.z-10') || btn.firstChild;
        if(text && text.style) {
          text.style.transform = `translate3d(${state.x * 0.3}px, ${state.y * 0.3}px, 0)`;
        }

        rafId = requestAnimationFrame(move);
      };

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        state.targetX = (e.clientX - centerX) * 0.3;
        state.targetY = (e.clientY - centerY) * 0.3;
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
          btn.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
          btn.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          
          const text = btn.querySelector('.relative.z-10');
          if(text) {
             text.style.transform = `translate3d(0px, 0px, 0px)`;
             text.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          }
        }, 400);
      });
    });
  }
};

// ─── 5. DYNAMIC SPOTLIGHT (Hover de Iluminação nos Cards) ───
const CinematicSpotlight = {
  init() {
    const cards = document.querySelectorAll('.bento-card, .portfolio-item, .spotlight-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
};

// ─── 6. GSAP REVEALS & SCROLL ANIMATIONS ───
const CinematicReveals = {
  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Text Reveal (Fade up + Blur)
    const reveals = document.querySelectorAll('.reveal-up');
    if (reveals.length) {
      gsap.fromTo(reveals, 
        { y: 50, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top 80%',
          }
        }
      );
    }

    // Bento Grid Stagger
    const bentoCards = document.querySelectorAll('.bento-card');
    if (bentoCards.length) {
      gsap.fromTo(bentoCards,
        { y: 80, opacity: 0, scale: 0.95, rotationX: 5 },
        {
          y: 0, opacity: 1, scale: 1, rotationX: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#diferenciais',
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Parallax das Imagens do Portfólio
    const portfolioImages = document.querySelectorAll('.portfolio-item .absolute.inset-4');
    portfolioImages.forEach(img => {
      gsap.fromTo(img,
        { y: 40, scale: 0.9, opacity: 0.8 },
        {
          y: 0, scale: 1, opacity: 1,
          duration: 1.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 85%',
            scrub: 1 
          }
        }
      );
    });
  }
};

// ─── 7. NAVBAR GLASS & MOBILE MENU ───
const InterfaceLogic = {
  init() {
    this.header = document.getElementById('navbar');
    
    if (this.header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          this.header.classList.add('py-2');
          this.header.firstElementChild.classList.add('bg-white/[0.05]', 'border-white/10');
          this.header.firstElementChild.classList.remove('bg-white/[0.02]', 'border-white/5');
        } else {
          this.header.classList.remove('py-2');
          this.header.firstElementChild.classList.remove('bg-white/[0.05]', 'border-white/10');
          this.header.firstElementChild.classList.add('bg-white/[0.02]', 'border-white/5');
        }
      }, { passive: true });
    }
  }
};

// ─── BOOTSTRAP (Engine de Inicialização) ───
window.addEventListener('DOMContentLoaded', () => {
    
    // Função para forçar a criação dos ícones
    const refreshIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            // Log para você ver no console (F12) se funcionou
            console.log('Lucide: Ícones renderizados com sucesso.'); 
        } else {
            console.error('Lucide: Biblioteca não encontrada no Global Scope.');
        }
    };

    // Executa imediatamente
    refreshIcons();

    // Executa após um pequeno delay (Garante que elementos dinâmicos apareçam)
    setTimeout(refreshIcons, 100);
    setTimeout(refreshIcons, 500); // "Seguro" para conexões lentas

    // Inicia os outros módulos
    requestAnimationFrame(() => {
        CustomCursor.init();
        CinematicHero.init();
        PremiumMagnetism.init();
        CinematicSpotlight.init();
        InterfaceLogic.init();
        
        setTimeout(() => CinematicReveals.init(), 150);
    });
});