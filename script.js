// Global variables
let darkBackground, lightBackground;

// Direct fix for project links - execute immediately
(function() {
    // Function to ensure project links are clickable
    function fixProjectLinks() {
        // Get all project links
        const projectLinks = document.querySelectorAll('.project-link');
        
        // Apply direct fixes to each link
        projectLinks.forEach(link => {
            // Ensure pointer cursor
            link.style.cursor = 'pointer';
            link.style.pointerEvents = 'auto';
            
            // Add direct click event
            link.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const url = this.getAttribute('href');
                if (url && url !== '#') {
                    console.log('Opening link:', url);
                    window.open(url, '_blank');
                }
                return false;
            };
            
            // Ensure the icon is also clickable
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.pointerEvents = 'none'; // Let the parent handle clicks
            }
        });
    }
    
    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixProjectLinks);
    } else {
        fixProjectLinks();
    }
    
    // Also run after a short delay to ensure everything is loaded
    setTimeout(fixProjectLinks, 500);
})();

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing preloader...');
    initPreloader();
    optimizeProjectLinks();
});

// Initialize preloader with 3D animated 'S'
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const preloaderText = document.getElementById('preloader-text');
    
    // Create a new scene for preloader
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 200 / 200, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    
    // Append renderer to preloader
    preloaderText.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x3c99dc, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xff5895, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Create 'S' geometry if font loading is available
    const fontLoader = new THREE.FontLoader();
    let textMesh;
    
    // Create a default cube as a placeholder while font loads
    const cubeGeom = new THREE.BoxGeometry(2, 2, 0.5);
    const cubeMat = new THREE.MeshPhongMaterial({
        color: 0xff5895,
        emissive: 0x3c99dc,
        emissiveIntensity: 0.5,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const cube = new THREE.Mesh(cubeGeom, cubeMat);
    scene.add(cube);
    
    // Animation function for the placeholder cube
    function animateCube() {
        requestAnimationFrame(animateCube);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.02;
        renderer.render(scene, camera);
    }
    
    // Start cube animation
    animateCube();
    
    // Try to load font and create 'S' text
    try {
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
            // Remove placeholder cube once font is loaded
            scene.remove(cube);
            
            // Create 'S' geometry
            const textGeometry = new THREE.TextGeometry('S', {
                font: font,
                size: 3,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelOffset: 0,
                bevelSegments: 5
            });
            
            // Center the geometry
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            textGeometry.translate(-textWidth/2, -textHeight/2, 0);
            
            // Create material with gradient
            const textMaterial = new THREE.MeshPhongMaterial({
                color: 0xff5895,
                emissive: 0x3c99dc,
                emissiveIntensity: 0.5,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            // Create mesh
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(textMesh);
            
            // New animation function for the text
            function animateText() {
                requestAnimationFrame(animateText);
                textMesh.rotation.x += 0.01;
                textMesh.rotation.y += 0.02;
                renderer.render(scene, camera);
            }
            
            // Stop cube animation and start text animation
            cancelAnimationFrame(animateCube);
            animateText();
        });
    } catch (error) {
        console.warn('Font loading failed, using cube animation instead:', error);
    }
    
    // Simulate loading (3 seconds) then hide preloader and initialize site
    setTimeout(function() {
        gsap.to(preloader, {
            opacity: 0,
            duration: 1,
            onComplete: function() {
                preloader.style.display = 'none';
                
                // Initialize the main site after preloader
                console.log('Preloader complete, initializing main site...');
                initMainSite();
            }
        });
    }, 3000);
}

// Initialize the main site functionality
function initMainSite() {
    console.log('Initializing main site functionality...');
    
    // Theme Toggling
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add animation class
        themeToggle.classList.add('animate');
        
        // Dispatch a custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: newTheme } 
        }));
        
        // Wait for animation and then change theme
        setTimeout(() => {
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Remove animation class after theme change
            setTimeout(() => {
                themeToggle.classList.remove('animate');
            }, 500);
        }, 250);
    });
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Show loading state
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> Sending...';
            submitBtn.disabled = true;
            
            // Form will submit normally to Formspree since we added the action attribute
            // This is just for UI feedback
            
            // After successful submission, Formspree will redirect back
            // Add fallback in case no redirect happens
            setTimeout(() => {
                if(submitBtn.innerHTML.includes('Sending')) {
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                }
            }, 8000); // Fallback in case submission takes too long
        });
    }
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const header = document.querySelector('header');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            header.classList.toggle('mobile-menu-open');
        });
    }

    // Scroll Animation
    const fadeElements = document.querySelectorAll('.fade-in');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => {
        scrollObserver.observe(element);
    });

    // Skill Progress Animation
    const skillBars = document.querySelectorAll('.skill-progress-bar');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });

    // Enhanced 3D Card Effect
    const enhanceCards = document.querySelectorAll('.card-3d-content');
    
    enhanceCards.forEach(card => {
        const parent = card.closest('.skill-card, .project-card, .contact-form, .contact-item');
        if (!parent) return;
        
        parent.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = parent.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            // Move the content for 3D effect
            card.style.transform = `translateZ(30px) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`;
            
            // Add dynamic shadow based on mouse position
            const shadowX = x * 20;
            const shadowY = y * 20;
            parent.style.boxShadow = `
                ${-shadowX}px ${-shadowY}px 20px rgba(0, 0, 0, 0.2),
                ${shadowX}px ${shadowY}px 20px rgba(60, 153, 220, 0.2)
            `;
            
            // Light effect
            const layer = card.querySelector('.card-3d-layer');
            if (layer) {
                layer.style.background = `radial-gradient(
                    circle at ${e.clientX - left}px ${e.clientY - top}px,
                    rgba(255, 255, 255, 0.1),
                    transparent 40%
                )`;
            }
            
            // Add subtle light reflection effect
            const highlight = parent.querySelector('.skill-icon, .project-category, .contact-icon');
            if (highlight) {
                highlight.style.background = `linear-gradient(
                    ${135 + x * 30}deg, 
                    var(--accent-pink) 0%, 
                    var(--accent-blue) 100%
                )`;
            }
        });
        
        parent.addEventListener('mouseleave', () => {
            card.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
            parent.style.boxShadow = 'var(--shadow-soft)';
            
            // Reset highlight
            const highlight = parent.querySelector('.skill-icon, .project-category, .contact-icon');
            if (highlight) {
                highlight.style.background = 'var(--gradient-primary)';
            }
            
            // Reset layer
            const layer = card.querySelector('.card-3d-layer');
            if (layer) {
                layer.style.background = 'linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05))';
            }
        });
    });

    // Ensure project cards are clickable to their URLs
    document.querySelectorAll('.project-card-link').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger for clicks on the action buttons
            if (e.target.closest('.project-link')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Otherwise, let the link navigate
        });
    });
    
    // Make project links clickable and work properly
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const url = this.getAttribute('href');
            if (url && url !== '#') {
                window.open(url, '_blank');
            }
        });
    });

    // Initialize 3D Backgrounds
    console.log('Initializing 3D backgrounds...');
    initBackgrounds();

    // Initialize GSAP animations
    console.log('Initializing GSAP animations...');
    initGSAPAnimations();
}

// Initialize 3D backgrounds
function initBackgrounds() {
    try {
        console.log('Initializing 3D backgrounds with Three.js version:', THREE.REVISION);
        
        // Initialize both backgrounds
        darkBackground = new TorusFlowDarkBackground();
        lightBackground = new TorusFlowLightBackground();
        
        // Set initial state based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.getElementById('scene-container').style.opacity = '0';
            document.getElementById('scene-container-light').style.opacity = '1';
        }
    } catch (error) {
        console.error('Error initializing 3D backgrounds:', error);
    }
}

// Initialize GSAP animations
function initGSAPAnimations() {
    // Register ScrollTrigger plugin if available
    if (gsap.registerPlugin && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Hero animations
    gsap.from(".hero-content", {
        duration: 1.5,
        y: 100,
        opacity: 0,
        ease: "power3.out"
    });

    // Theme change animation
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        // Animate elements on theme change
        gsap.to("body", {
            duration: 0.5,
            ease: "power2.inOut",
            onStart: function() {
                // Add subtle page transition effect
                gsap.to(".container", { 
                    y: 10, 
                    opacity: 0.8, 
                    duration: 0.3, 
                    stagger: 0.05,
                    ease: "power2.inOut"
                });
                
                // Fade transition between backgrounds
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                if (newTheme === 'light') {
                    gsap.to("#scene-container", { opacity: 0, duration: 0.5 });
                    gsap.to("#scene-container-light", { opacity: 1, duration: 0.5 });
                } else {
                    gsap.to("#scene-container", { opacity: 1, duration: 0.5 });
                    gsap.to("#scene-container-light", { opacity: 0, duration: 0.5 });
                }
            },
            onComplete: function() {
                // Bring elements back
                gsap.to(".container", { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.3, 
                    stagger: 0.05,
                    ease: "power2.out"
                });
            }
        });
    });

    // Scroll-triggered animations
    if (ScrollTrigger) {
        gsap.utils.toArray("section").forEach((section, i) => {
            gsap.from(section.querySelectorAll(".fade-in"), {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none none"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            const header = document.querySelector('header');
            header.classList.remove('mobile-menu-open');
        });
    });
}

// Dark Mode 3D Animated Torus Background
class TorusFlowDarkBackground {
    constructor() {
        this.container = document.getElementById('scene-container');
        
        // Check if container exists
        if (!this.container) {
            console.error('Scene container for dark background not found!');
            return;
        }
        
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        
        this.createCamera();
        this.createRenderer();
        this.setup();
        this.bindEvents();
        
        console.log('Dark 3D background initialized');
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 50;
        this.camera.position.y = 0;
        this.camera.position.x = 0;
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a192f, 0);
        
        // Clear container first
        while(this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setup() {
        // Create main torus
        this.createTorus();
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Add accent lights
        this.createAccentLights();
        
        // Add particles
        this.createParticles();
        
        // Start animation loop
        this.animate();
    }
    
    createTorus() {
        // Create toroid group
        this.torusGroup = new THREE.Group();
        this.scene.add(this.torusGroup);
        
        // Main outer torus
        const torusGeometry = new THREE.TorusGeometry(15, 3, 30, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: 0x3c99dc,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x3c99dc,
            emissiveIntensity: 0.2
        });
        
        this.mainTorus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torusGroup.add(this.mainTorus);
        
        // Inner torus with different color
        const innerTorusGeometry = new THREE.TorusGeometry(10, 2, 30, 100);
        const innerTorusMaterial = new THREE.MeshStandardMaterial({
            color: 0xff5895,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0xff5895,
            emissiveIntensity: 0.2
        });
        
        this.innerTorus = new THREE.Mesh(innerTorusGeometry, innerTorusMaterial);
        this.innerTorus.rotation.x = Math.PI / 2;
        this.torusGroup.add(this.innerTorus);
        
        // Add a third torus
        const thirdTorusGeometry = new THREE.TorusGeometry(20, 1.5, 20, 100);
        const thirdTorusMaterial = new THREE.MeshStandardMaterial({
            color: 0xff7b54,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0xff7b54,
            emissiveIntensity: 0.2
        });
        
        this.thirdTorus = new THREE.Mesh(thirdTorusGeometry, thirdTorusMaterial);
        this.thirdTorus.rotation.y = Math.PI / 4;
        this.torusGroup.add(this.thirdTorus);
        
        // Add floating spheres along the torus
        this.spheres = [];
        for (let i = 0; i < 12; i++) {
            // Calculate position along the torus
            const angle = (i / 12) * Math.PI * 2;
            const radius = 15;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Create glowing sphere
            const sphereGeometry = new THREE.SphereGeometry(0.8, 20, 20);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x3c99dc,
                emissive: 0x3c99dc,
                emissiveIntensity: 0.5,
                shininess: 100
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, 0, y);
            
            this.spheres.push({
                mesh: sphere,
                basePosition: { x, y: 0, z: y },
                phaseOffset: i * (Math.PI / 6)
            });
            
            this.torusGroup.add(sphere);
        }
        
        // Add inner spheres along the inner torus
        this.innerSpheres = [];
        for (let i = 0; i < 8; i++) {
            // Calculate position along the inner torus
            const angle = (i / 8) * Math.PI * 2;
            const radius = 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Create glowing sphere with pink color
            const sphereGeometry = new THREE.SphereGeometry(0.6, 20, 20);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xff5895,
                emissive: 0xff5895,
                emissiveIntensity: 0.5,
                shininess: 100
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, z, 0);
            
            this.innerSpheres.push({
                mesh: sphere,
                basePosition: { x, y: z, z: 0 },
                phaseOffset: i * (Math.PI / 4)
            });
            
            this.torusGroup.add(sphere);
        }
    }
    
    createAccentLights() {
        // Add point lights in theme colors
        this.lights = [];
        
        // Blue light
        const blueLight = new THREE.PointLight(0x3c99dc, 2, 100);
        blueLight.position.set(30, 0, 0);
        this.scene.add(blueLight);
        this.lights.push(blueLight);
        
        // Pink light
        const pinkLight = new THREE.PointLight(0xff5895, 2, 100);
        pinkLight.position.set(-30, 0, 0);
        this.scene.add(pinkLight);
        this.lights.push(pinkLight);
        
        // Orange light
        const orangeLight = new THREE.PointLight(0xff7b54, 2, 100);
        orangeLight.position.set(0, 30, 0);
        this.scene.add(orangeLight);
        this.lights.push(orangeLight);
        
        // Add directional light for overall illumination
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);
    }
    
    createParticles() {
        // Create particle system
        this.particles = [];
        const particleCount = 200;
        
        // Create a geometry for all particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        const particleColors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in a sphere around the torus
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + (Math.random() * 20 - 10);
            const height = Math.random() * 20 - 10;
            
            const x = Math.cos(angle) * radius;
            const y = height;
            const z = Math.sin(angle) * radius;
            
            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;
            
            // Random size
            particleSizes[i] = Math.random() * 0.5 + 0.1;
            
            // Random color from the theme colors
            const colorChoice = Math.floor(Math.random() * 3);
            if (colorChoice === 0) {
                // Blue
                particleColors[i * 3] = 0.235;
                particleColors[i * 3 + 1] = 0.6;
                particleColors[i * 3 + 2] = 0.863;
            } else if (colorChoice === 1) {
                // Pink
                particleColors[i * 3] = 1.0;
                particleColors[i * 3 + 1] = 0.345;
                particleColors[i * 3 + 2] = 0.584;
            } else {
                // Orange
                particleColors[i * 3] = 1.0;
                particleColors[i * 3 + 1] = 0.482;
                particleColors[i * 3 + 2] = 0.33;
            }
            
            // Store particle data for animation
            this.particles.push({
                position: { x, y, z },
                speed: Math.random() * 0.05 + 0.02,
                amplitude: Math.random() * 2 + 1,
                phaseOffset: Math.random() * Math.PI * 2,
                index: i
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        // Create a shader material for particles
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particleSystem);
    }
    
    animate() {
        if (this.animationStopped) return;
        
        requestAnimationFrame(this.animate.bind(this));
        
        const time = this.clock.getElapsedTime();
        
        // Rotate torus group slowly
        this.torusGroup.rotation.y = time * 0.1;
        this.torusGroup.rotation.x = Math.sin(time * 0.05) * 0.2;
        
        // Animate individual toruses
        this.mainTorus.rotation.x = time * 0.2;
        this.innerTorus.rotation.y = time * 0.3;
        this.thirdTorus.rotation.z = time * 0.15;
        
        // Animate spheres along the torus
        this.spheres.forEach(sphere => {
            const floatOffset = Math.sin(time + sphere.phaseOffset) * 1;
            sphere.mesh.position.y = sphere.basePosition.y + floatOffset;
            
            // Pulse the spheres
            const scale = 0.8 + Math.sin(time * 2 + sphere.phaseOffset) * 0.2;
            sphere.mesh.scale.set(scale, scale, scale);
        });
        
        // Animate inner spheres
        this.innerSpheres.forEach(sphere => {
            const floatOffset = Math.sin(time * 1.2 + sphere.phaseOffset) * 1;
            sphere.mesh.position.z = sphere.basePosition.z + floatOffset;
            
            // Pulse the spheres
            const scale = 0.8 + Math.sin(time * 2.5 + sphere.phaseOffset) * 0.2;
            sphere.mesh.scale.set(scale, scale, scale);
        });
        
        // Animate particles
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        this.particles.forEach(particle => {
            const i = particle.index;
            
            // Float movement
            const y = particle.position.y + Math.sin(time * particle.speed + particle.phaseOffset) * particle.amplitude;
            
            // Update position
            positions[i * 3 + 1] = y;
            
            // Subtle circular movement
            const radius = Math.sqrt(Math.pow(particle.position.x, 2) + Math.pow(particle.position.z, 2));
            const angle = Math.atan2(particle.position.z, particle.position.x) + (particle.speed * 0.2);
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        });
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Animate lights
        this.lights.forEach((light, index) => {
            // Circular movement
            const lightRadius = 30;
            const angle = time * 0.2 + (index * (Math.PI * 2 / 3));
            
            light.position.x = Math.cos(angle) * lightRadius;
            light.position.z = Math.sin(angle) * lightRadius;
            
            // Pulse intensity
            light.intensity = 1.5 + Math.sin(time + index) * 0.5;
        });
        
        // Camera movement based on mouse position
        if (this.mouseX && this.mouseY) {
            this.camera.position.x += (this.mouseX * 30 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouseY * 30 - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    bindEvents() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Stop animation when switching to light theme
        window.addEventListener('themechange', (e) => {
            if (e.detail.theme === 'light') {
                this.animationStopped = true;
            } else {
                this.animationStopped = false;
                this.animate();
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }
}

// Light Mode 3D Background
class TorusFlowLightBackground {
    constructor() {
        this.container = document.getElementById('scene-container-light');
        
        // Check if container exists
        if (!this.container) {
            console.error('Scene container for light background not found!');
            return;
        }
        
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        
        this.createCamera();
        this.createRenderer();
        this.setup();
        this.bindEvents();
        
        // Start paused if in dark mode
        this.animationStopped = document.documentElement.getAttribute('data-theme') === 'dark';
        if (!this.animationStopped) {
            this.animate();
        }
        
        console.log('Light 3D background initialized');
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 50;
        this.camera.position.y = 0;
        this.camera.position.x = 0;
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0xf5f8ff, 0);
        
        // Clear container first
        while(this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setup() {
        // Create main torus group
        this.torusGroup = new THREE.Group();
        this.scene.add(this.torusGroup);
        
        // Create the three main tori with colors matching the image
        this.createTori();
        
        // Add particles around the tori
        this.createParticles();
        
        // Add lights
        this.createLights();
    }
    
    createTori() {
        // Parameters for the tori
        const torusParams = [
            { color: 0x4279db, radius: 12, tube: 2.5, radialSegments: 30, tubularSegments: 100, rotation: [0, 0, 0] },
            { color: 0xe358a6, radius: 15, tube: 2, radialSegments: 30, tubularSegments: 100, rotation: [Math.PI/2, 0, 0] },
            { color: 0x26cfcb, radius: 18, tube: 1.5, radialSegments: 20, tubularSegments: 100, rotation: [0, Math.PI/4, Math.PI/6] }
        ];
        
        this.tori = [];
        
        torusParams.forEach(params => {
            const geometry = new THREE.TorusGeometry(
                params.radius, 
                params.tube, 
                params.radialSegments, 
                params.tubularSegments
            );
            
            const material = new THREE.MeshStandardMaterial({
                color: params.color,
                metalness: 0.4,
                roughness: 0.1,
                emissive: params.color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.9
            });
            
            const torus = new THREE.Mesh(geometry, material);
            torus.rotation.set(params.rotation[0], params.rotation[1], params.rotation[2]);
            
            this.torusGroup.add(torus);
            this.tori.push(torus);
        });
    }
    
    createParticles() {
        // Create particle groups for each color
        const particleColors = [
            0x4279db, // Blue
            0xe358a6, // Pink
            0x26cfcb  // Cyan
        ];
        
        this.particleGroups = [];
        
        particleColors.forEach(color => {
            const particleCount = 30;
            const particles = new THREE.Group();
            
            for (let i = 0; i < particleCount; i++) {
                // Random position in the scene
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 20;
                
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
                
                // Create particle
                const size = 0.2 + Math.random() * 0.6;
                const geometry = new THREE.SphereGeometry(size, 12, 12);
                
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.7,
                    transparent: true,
                    opacity: 0.7 + Math.random() * 0.3
                });
                
                const particle = new THREE.Mesh(geometry, material);
                particle.position.set(x, y, z);
                
                // Add animation data
                particle.userData = {
                    originalPosition: { x, y, z },
                    animationSpeed: 0.5 + Math.random() * 1.5,
                    animationOffset: Math.random() * Math.PI * 2,
                    animationRadius: 1 + Math.random() * 3
                };
                
                particles.add(particle);
            }
            
            this.scene.add(particles);
            this.particleGroups.push(particles);
        });
    }
    
    createLights() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
        
        // Add colored point lights
        const lightColors = [
            { color: 0x4279db, position: [20, 0, 0], intensity: 2 },
            { color: 0xe358a6, position: [-20, 10, 0], intensity: 2 },
            { color: 0x26cfcb, position: [0, -20, 10], intensity: 2 }
        ];
        
        this.lights = [];
        
        lightColors.forEach(config => {
            const light = new THREE.PointLight(
                config.color,
                config.intensity,
                100
            );
            light.position.set(
                config.position[0],
                config.position[1],
                config.position[2]
            );
            this.scene.add(light);
            this.lights.push(light);
        });
    }
    
    animate() {
        if (this.animationStopped) return;
        
        requestAnimationFrame(this.animate.bind(this));
        
        const time = this.clock.getElapsedTime();
        
        // Rotate the overall torus group
        this.torusGroup.rotation.y = time * 0.1;
        this.torusGroup.rotation.x = Math.sin(time * 0.05) * 0.1;
        
        // Animate individual tori
        this.tori.forEach((torus, index) => {
            const rotationSpeed = 0.1 + (index * 0.05);
            const axis = index % 3;
            
            if (axis === 0) torus.rotation.x += rotationSpeed * 0.01;
            else if (axis === 1) torus.rotation.y += rotationSpeed * 0.01;
            else torus.rotation.z += rotationSpeed * 0.01;
        });
        
        // Animate particles
        this.particleGroups.forEach(group => {
            group.children.forEach(particle => {
                const data = particle.userData;
                
                // Create a floating effect
                const xOffset = Math.sin(time * data.animationSpeed + data.animationOffset) * data.animationRadius;
                const yOffset = Math.cos(time * data.animationSpeed + data.animationOffset) * data.animationRadius;
                const zOffset = Math.sin(time * data.animationSpeed * 0.5 + data.animationOffset) * data.animationRadius;
                
                particle.position.x = data.originalPosition.x + xOffset;
                particle.position.y = data.originalPosition.y + yOffset;
                particle.position.z = data.originalPosition.z + zOffset;
                
                // Pulse the particles
                const scale = 0.8 + Math.sin(time * data.animationSpeed + data.animationOffset) * 0.2;
                particle.scale.set(scale, scale, scale);
            });
        });
        
        // Animate lights
        this.lights.forEach((light, index) => {
            const radius = 30;
            const speed = 0.3 + (index * 0.1);
            const angle = time * speed + (index * Math.PI * 2 / 3);
            
            light.position.x = Math.cos(angle) * radius;
            light.position.z = Math.sin(angle) * radius;
            
            // Pulse intensity
            light.intensity = 1 + Math.sin(time + index) * 0.5;
        });
        
        // Camera movement based on mouse position
        if (this.mouseX && this.mouseY) {
            this.camera.position.x += (this.mouseX * 30 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouseY * 30 - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    bindEvents() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Start/stop animation when switching themes
        window.addEventListener('themechange', (e) => {
            if (e.detail.theme === 'light') {
                this.animationStopped = false;
                this.animate();
            } else {
                this.animationStopped = true;
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }
}

// Modify optimizeProjectLinks function to fix click functionality
function optimizeProjectLinks() {
    // Debounce function to limit the rate at which a function can fire
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Get all project links
    const projectLinks = document.querySelectorAll('.project-link');
    
    // Apply optimizations to prevent flickering
    projectLinks.forEach(link => {
        // Use hardware acceleration
        link.style.transform = 'translateZ(0)';
        
        // Add event listeners with debounce
        link.addEventListener('mouseenter', debounce(function() {
            this.classList.add('hovering');
            this.style.cursor = 'pointer';
        }, 10));
        
        link.addEventListener('mouseleave', debounce(function() {
            this.classList.remove('hovering');
        }, 10));
        
        // Direct event handling for clicks
        link.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const url = this.getAttribute('href');
            console.log("Link clicked, URL:", url);
            
            if (url && url !== '#') {
                window.open(url, '_blank');
            }
        });
    });
    
    // Add direct click handling to GitHub and View icons
    document.querySelectorAll('.project-link .fa-eye, .project-link .fa-github').forEach(icon => {
        icon.style.pointerEvents = 'auto';
        icon.style.cursor = 'pointer';
        
        icon.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Navigate to the parent link's href
            const parentLink = this.closest('.project-link');
            if (parentLink) {
                const url = parentLink.getAttribute('href');
                console.log("Icon clicked, URL:", url);
                
                if (url && url !== '#') {
                    window.open(url, '_blank');
                }
            }
        });
    });
    
    // Ensure project cards don't interfere with link clicks
    document.querySelectorAll('.project-card-link').forEach(cardLink => {
        cardLink.addEventListener('click', function(event) {
            // If clicking on a project link inside the card, don't navigate the card
            if (event.target.closest('.project-link') || 
                event.target.closest('.fa-eye') || 
                event.target.closest('.fa-github')) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        });
    });
}

// Call this function immediately to fix links on page load
document.addEventListener('DOMContentLoaded', function() {
    optimizeProjectLinks();
    
    // Also call it after a short delay to ensure all elements are properly loaded
    setTimeout(optimizeProjectLinks, 500);
});