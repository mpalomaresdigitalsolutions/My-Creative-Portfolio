// Modern Interactive Features for Portfolio
(function() {
    'use strict';

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Intersection Observer for animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all content sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Typing animation for title
    function initTypingAnimation() {
        const title = document.querySelector('.title');
        if (title) {
            const text = title.textContent;
            title.textContent = '';
            let index = 0;
            
            function typeWriter() {
                if (index < text.length) {
                    title.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeWriter, 50);
                }
            }
            
            setTimeout(typeWriter, 1000);
        }
    }

    // Dynamic skill counter
    function initSkillCounters() {
        const skills = document.querySelectorAll('.competencies-grid div');
        skills.forEach((skill, index) => {
            skill.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Parallax effect for profile image
    function initParallaxEffect() {
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                profileImg.style.transform = `translateY(${rate}px) scale(1)`;
            });
        }
    }

    // Enhanced mobile touch interactions
    function initTouchInteractions() {
        if ('ontouchstart' in window) {
            const interactiveElements = document.querySelectorAll('.content-section, .certificate-item, .ghl-sample, .reference');
            interactiveElements.forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                });
                
                element.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        }
    }

    // Loading animation

    function initCollapsibleSections() {
        const headers = document.querySelectorAll('.sidebar .content-section h2');
        headers.forEach(header => {
            const content = header.nextElementSibling;
            if (content) {
                // Check if the section is 'Core Competencies' or 'Key Achievements' to be initially expanded
                if (header.innerText.includes('Core Competencies') || header.innerText.includes('Key Achievements')) {
                    content.style.display = 'block';
                    header.classList.add('expanded');
                } else {
                    content.style.display = 'none';
                }

                header.classList.add('collapsible');
                header.addEventListener('click', () => {
                    const isVisible = content.style.display === 'block';
                    content.style.display = isVisible ? 'none' : 'block';
                    header.classList.toggle('expanded', !isVisible);
                });
            }
        });
    }
    function initLoadingAnimation() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Dynamic background gradient
    function initDynamicBackground() {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ];
        
        let currentIndex = 0;
        
        setInterval(() => {
            currentIndex = (currentIndex + 1) % colors.length;
            document.body.style.background = colors[currentIndex];
        }, 10000);
    }

    // Performance optimization
    function initPerformanceOptimization() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Accessibility improvements
    function initAccessibility() {
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Initialize all features
    function init() {
        initSmoothScroll();
        initScrollAnimations();
        initTypingAnimation();
        initSkillCounters();
        initParallaxEffect();
        initTouchInteractions();
        initCollapsibleSections();
        initLoadingAnimation();
        initDynamicBackground();
        initPerformanceOptimization();
        initAccessibility();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add CSS for animation classes
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .keyboard-navigation *:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .animate-in {
                animation: none;
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

})();