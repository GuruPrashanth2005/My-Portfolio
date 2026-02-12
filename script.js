// ==================== THEME SWITCHING ====================
const themeButtons = document.querySelectorAll('.theme-btn');
const html = document.documentElement;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateActiveTheme(savedTheme);

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateActiveTheme(theme);
    });
});

function updateActiveTheme(theme) {
    themeButtons.forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ==================== NAVBAR SCROLL ====================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== ACTIVE NAV LINK ====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ==================== MOBILE MENU ====================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinksContainer = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinksContainer) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('open');
        navLinksContainer.classList.toggle('active');
        document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    const links = navLinksContainer.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('open');
            navLinksContainer.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ==================== SMOOTH SCROLL ====================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== SCROLL REVEAL ====================
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// ==================== FOOTER YEAR ====================
document.getElementById('year').textContent = new Date().getFullYear();

// ==================== PROFILE INTERACTION ====================
const profileContainer = document.getElementById('profileContainer');
const avatarVideo = profileContainer?.querySelector('.avatar-video');

if (profileContainer) {
    const triggerEffect = () => {
        if (profileContainer.classList.contains('reacting')) return;

        profileContainer.classList.add('reacting');
        avatarVideo?.play().catch(() => { }); // Play video on trigger

        // Duration of the longest part of the animation (scanner/shockwave)
        setTimeout(() => {
            profileContainer.classList.remove('reacting');
            // If mouse is no longer hovering, pause video
            if (!profileContainer.matches(':hover')) {
                avatarVideo?.pause();
            }
        }, 2000);
    };

    // Play/Pause on Hover for Desktop
    profileContainer.addEventListener('mouseenter', () => {
        avatarVideo?.play().catch(() => { });
    });

    profileContainer.addEventListener('mouseleave', () => {
        if (!profileContainer.classList.contains('reacting')) {
            avatarVideo?.pause();
            if (avatarVideo) avatarVideo.currentTime = 0; // Reset to start
        }
    });

    // Terminal Typing Logic
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const text = typingText.textContent;
        typingText.textContent = '';

        let i = 0;
        const speed = 100; // Typing speed in ms

        function typeWriter() {
            if (i === 0) {
                // Start avatar effect when typing begins
                profileContainer.classList.add('reacting');
                avatarVideo?.play().catch(() => { });
            }

            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // End avatar effect after typing completes
                // Give it a tiny delay for a smoother transition back
                setTimeout(() => {
                    profileContainer.classList.remove('reacting');
                    if (!profileContainer.matches(':hover')) {
                        avatarVideo?.pause();
                        if (avatarVideo) avatarVideo.currentTime = 0;
                    }
                }, 800);
            }
        }

        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }

    profileContainer.addEventListener('click', triggerEffect);
    profileContainer.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double trigger with click
        triggerEffect();
    }, { passive: false });
}

// ==================== RESUME GENERATION ====================
const downloadBtn = document.getElementById('downloadCV');
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        const element = document.body.cloneNode(true);

        // Preparation for PDF
        element.classList.add('pdf-export');

        // Clean up elements that shouldn't be in PDF
        const toRemove = element.querySelectorAll('.navbar, .hero-cta, .grid-background, .gradient-orbs, .scroll-indicator, .terminal-cursor, .mobile-menu-toggle, footer, .profile-ring, .profile-ring-2, .profile-scanner, .profile-pulse, .avatar-video');
        toRemove.forEach(el => el.remove());

        const opt = {
            margin: 10,
            filename: 'Guru_Prashanth_S_Resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // UI Loading State
        const originalContent = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>Generating...</span>';
        downloadBtn.disabled = true;

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Could not generate PDF. Please try again.');
        } finally {
            downloadBtn.innerHTML = originalContent;
            downloadBtn.disabled = false;
        }
    });
}

// ==================== FEATURED SPOTLIGHT ====================
const featuredCard = document.querySelector('.featured-card');
if (featuredCard) {
    featuredCard.addEventListener('mousemove', (e) => {
        const rect = featuredCard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        featuredCard.style.setProperty('--mouse-x', `${x}%`);
        featuredCard.style.setProperty('--mouse-y', `${y}%`);
    });
}

// ==================== CONSOLE MESSAGE ====================
console.log('%c🤖 AIML Portfolio Loaded', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cBuilt by Guru Prashanth S', 'color: #8b5cf6; font-size: 12px;');