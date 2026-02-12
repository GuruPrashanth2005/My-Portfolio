/**
 * Theme-Aware Background Particles
 * Syncs colors with the website's dark, light, and warm themes.
 */

const ThemeColors = {
    dark: ['#3b82f6', '#8b5cf6', '#06b6d4'], // blue, purple, cyan
    light: ['#64748b', '#0ea5e9', '#3b82f6'], // slate, sky, blue
    warm: ['#f59e0b', '#f97316', '#ef4444']  // orange, coral, red
};

class Particle {
    constructor(canvas, theme = 'dark') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 40) + 5;
        this.theme = theme;
        this.color = this.getRandomColor(theme);
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
    }

    getRandomColor(theme) {
        const colors = ThemeColors[theme] || ThemeColors.dark;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateColor(theme) {
        this.theme = theme;
        this.color = this.getRandomColor(theme);
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Add glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.color;
    }

    update(mouse) {
        // Floating movement
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Bounce off edges
        if (this.x > this.canvas.width || this.x < 0) this.velocity.x *= -1;
        if (this.y > this.canvas.height || this.y < 0) this.velocity.y *= -1;

        // Magnetic effect
        let dx = (mouse.x || -1000) - this.x;
        let dy = (mouse.y || -1000) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to base position gently
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 50;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 50;
            }
        }
    }
}

const CursorInteraction = (() => {
    const canvas = document.getElementById('interactionCanvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    const trail = [];
    const maxTrailLength = 20;

    function init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particlesArray = [];
        let numberOfParticles = (canvas.width * canvas.height) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle(canvas, currentTheme));
        }
    }

    function detectThemeChange() {
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            if (newTheme !== currentTheme) {
                currentTheme = newTheme;
                particlesArray.forEach(p => p.updateColor(currentTheme));
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Trail (Sync with current theme's primary color)
        if (mouse.x && mouse.y) {
            trail.push({ x: mouse.x, y: mouse.y, opacity: 1 });
            if (trail.length > maxTrailLength) trail.shift();
        }

        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        const trailColor = ThemeColors[currentTheme][0]; // Use first color in palette for trail

        for (let i = 0; i < trail.length - 1; i++) {
            const p1 = trail[i];
            const p2 = trail[i + 1];
            p1.opacity -= 1 / maxTrailLength;

            ctx.strokeStyle = `${trailColor}${Math.floor(p1.opacity * 127).toString(16).padStart(2, '0')}`; // Approx hex alpha
            ctx.shadowBlur = 15;
            ctx.shadowColor = trailColor;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0; // Reset shadow for particles

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update(mouse);
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        init();
    });

    // Mobile touch support
    window.addEventListener('touchmove', (event) => {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    init();
    detectThemeChange();
    animate();
})();
