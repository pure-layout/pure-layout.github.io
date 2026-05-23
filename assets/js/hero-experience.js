// shaders.js ou no topo do seu script
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Função de ruído clássica (Simplex 2D fake para otimização)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i); // Evita truncamento
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ; m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = vUv;
        // Interação sutil com o mouse
        uv.x += uMouse.x * 0.05;
        uv.y += uMouse.y * 0.05;

        // Camadas de ruído (Fractal Brownian Motion simplificado)
        float n1 = snoise(uv * 3.0 + uTime * 0.1);
        float n2 = snoise(uv * 6.0 - uTime * 0.15);
        float noise =
        n1 * 0.55 +
        n2 * 0.35 +
        snoise(uv * 12.0 + uTime * 0.05) * 0.1;

        // Cores premium (Deep Navy -> Cyan -> Black)
        vec3 color1 = vec3(0.01, 0.02, 0.05); // Preto acinzentado/azulado (fundo)
        vec3 color2 = vec3(0.02, 0.08, 0.25); // Deep Blue
        vec3 color3 = vec3(0.13, 0.82, 0.93); // Cyan neon suave
        
        // Mistura procedural
        vec3 finalColor = mix(color1, color2, noise + 0.5);
        finalColor = mix(finalColor, color3, smoothstep(0.4, 1.0, noise) * 0.3); // Brilho cyan sutil nas cristas

        // Vinheta radial embutida no shader
        float dist = length(vUv - 0.5);
        finalColor *= smoothstep(0.8, 0.2, dist);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

class PremiumHeroExperience {
    
    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        if (!this.canvas) return;

        this.isMobile = window.innerWidth < 768;
        
        // Variáveis de Inércia (Lerp) do mouse
        this.mouse = { target: new THREE.Vector2(), current: new THREE.Vector2() };
        this.scroll = { target: 0, current: 0 };
        
        this.initThreeJS();
        this.createShaderBackground();
        this.createPremiumParticles();
        this.initDOMParallax();
        this.initCinematicEntrance();
        this.bindEvents();
        
        this.animate();
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance"
        });
        
        // Controle de pixel ratio para performance
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createShaderBackground() {
        const geometry = new THREE.PlaneGeometry(16, 16, 32, 32);
        
        this.shaderUniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2() },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.shaderUniforms,
            transparent: true,
            depthWrite: false
        });

        this.backgroundMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.backgroundMesh);
    }

    createPremiumParticles() {
        const particleCount = this.isMobile ? 150 : 400; // Otimização mobile
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;     // x
            positions[i + 1] = (Math.random() - 0.5) * 15; // y
            positions[i + 2] = (Math.random() - 0.5) * 10; // z (profundidade real)
            sizes[i/3] = Math.random() * 2.5; // Tamanho base
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        // Partículas elegantes com Additive Blending
        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x22d3ee, // Cyan Tailwind
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending, // Segredo do efeito glow
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    initDOMParallax() {
        this.mockupElement = document.querySelector('.hero-3d-element');
        this.cardGlows = document.querySelectorAll('.mockup-glow');
    }

    initCinematicEntrance() {
        // Inicializa opacidades para 0
        gsap.set(['.hero-eyebrow', '.hero-headline', '.hero-lead', '.hero-actions', '.hero-trust', '.credibility-bar', '.hero-cinematic__stage'], {
            opacity: 0,
            y: 30
        });
        
        gsap.set(this.canvas, { opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(this.canvas, { opacity: 1, duration: 2 })
          .to('.hero-cinematic__stage', { opacity: 1, y: 0, duration: 1.5, ease: "expo.out" }, "-=1.5")
          .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8 }, "-=1.0")
          .to('.hero-headline', { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.6")
          .to('.hero-lead', { opacity: 1, y: 0, duration: 0.8 }, "-=0.8")
          .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
          .to(['.hero-trust', '.credibility-bar'], { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.4");
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            // Normaliza mouse de -1 a 1
            this.mouse.target.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.target.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.shaderUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
            this.isMobile = window.innerWidth < 768;
        });
    }

    animate(time) {
        requestAnimationFrame(this.animate.bind(this));

        const t = time * 0.001; // Segundos

        // LERP: Suavização extrema do mouse (Inércia)
        this.mouse.current.lerp(this.mouse.target, 0.05);

        // 1. Atualiza Shader
        if (this.shaderUniforms) {
            this.shaderUniforms.uTime.value = t;
            this.shaderUniforms.uMouse.value.copy(this.mouse.current);
        }

        // 2. Anima Partículas (rotação lenta + deslocamento pelo mouse)
        if (this.particles) {
            this.particles.rotation.y = t * 0.05 + (this.mouse.current.x * 0.1);
            this.particles.rotation.x = t * 0.02 + (this.mouse.current.y * 0.1);
        }

        // 3. Parallax do DOM (O Mockup 3D)
        if (this.mockupElement && !this.isMobile) {
            // Rotação suave baseada no mouse lerpado
            const rotX = this.mouse.current.y * 10; // Graus
            const rotY = this.mouse.current.x * 15; // Graus
            
            // Movimento flutuante procedural (seno e cosseno)
            const floatY = Math.sin(t * 1.5) * 10;
            
            this.mockupElement.style.transform = `
                rotateX(${rotX + 12}deg) 
                rotateY(${rotY - 4}deg) 
                translateY(${floatY}px)
                scale(0.97)
            `;

            // Movimenta os glows internos do dashboard opostos ao mouse para criar refração
            this.cardGlows.forEach(glow => {
                glow.style.transform = `translate(${this.mouse.current.x * -20}px, ${this.mouse.current.y * 20}px)`;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// COREOGRAFIA DO LOADER AAA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('premium-loader');
    
    if (!loader) {
        // Fallback caso não tenha colocado o HTML do loader
        new PremiumHeroExperience();
        return;
    }

    // Trava o scroll durante o loading
    document.body.style.overflow = 'hidden';
    
    const tl = gsap.timeline();

    // 1. Textos sobem
    tl.to(['.loader-label', '.loader-percent', '.loader-percent-symbol', '.loader-status'], {
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1
    });

    // 2. Progresso de 0 a 100
    let progressProxy = { value: 0 };
    const statusText = document.querySelector('.loader-status');
    const statuses = [
        "Iniciando protocolos...", 
        "Compilando shaders...", 
        "Renderizando ambiente 3D...", 
        "Pronto."
    ];

    tl.to(progressProxy, {
        value: 100,
        duration: 2.5,
        ease: "power3.inOut",
        onUpdate: () => {
            const percentEl = document.querySelector('.loader-percent');
            if(percentEl) percentEl.innerText = Math.round(progressProxy.value);
            
            gsap.set('.loader-progress', { width: `${progressProxy.value}%` });
            
            let statusIndex = Math.floor((progressProxy.value / 100) * (statuses.length - 1));
            if(statusText) statusText.innerText = statuses[statusIndex];
        }
    });

    // 3. Recolhe os elementos do loader
    tl.to('.loader-progress', { opacity: 0, duration: 0.4, ease: "power2.inOut" }, "+=0.3")
      .to(['.loader-label', '.loader-percent', '.loader-percent-symbol', '.loader-status'], {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
          stagger: 0.05
      }, "<");

    // 4. Fadeout do fundo escuro
    tl.to(loader, {
        backgroundColor: "rgba(2, 2, 3, 0)",
        backdropFilter: "blur(0px)",
        duration: 1.5,
        ease: "power4.inOut"
    });

    // 5. Inicia a Hero Section DURANTE o fadeout do Loader (Handoff perfeito)
    tl.add(() => {
        // Dispara a sua cena 3D original
        new PremiumHeroExperience();
        
        document.body.style.overflow = ''; // Libera o scroll
        
        // Remove do DOM após 2 segundos para liberar memória
        setTimeout(() => loader.remove(), 2000); 
    }, "-=1.2"); // Este "-=1.2" é o segredo do crossfade cinematográfico
});