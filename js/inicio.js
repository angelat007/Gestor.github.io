// Loading animation
        window.addEventListener('load', function() {
            setTimeout(() => {
                document.getElementById('loadingOverlay').classList.add('hidden');
            }, 1000);
        });

        // Stats counter animation
        function animateStats() {
            const stats = document.querySelectorAll('.stat-number');
            
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const increment = target / 50;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.ceil(current);
                }, 50);
            });
        }

        // Intersection Observer for stats animation
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            const statsSection = document.querySelector('.stats');
            if (statsSection) {
                statsObserver.observe(statsSection);
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

        // Enter app function with redirect to tarea.html
        function enterApp() {
            // Show loading overlay
            const loadingOverlay = document.getElementById('loadingOverlay');
            loadingOverlay.classList.remove('hidden');
            
            // Add entrance animation
            document.body.style.transform = 'scale(0.95)';
            document.body.style.opacity = '0.7';
            
            setTimeout(() => {
                // Redirect to tarea.html
                window.location.href = 'tarea.html';
            }, 2000);
        }

        // Parallax effect for floating elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelectorAll('.floating-element');
            
            parallax.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
            });
        });

        // Add dynamic greeting based on time
        function setDynamicGreeting() {
            const hour = new Date().getHours();
            const subtitle = document.querySelector('.hero-subtitle');
            let greeting = '';

            if (hour < 12) {
                greeting = '¡Buenos días! ';
            } else if (hour < 18) {
                greeting = '¡Buenas tardes! ';
            } else {
                greeting = '¡Buenas noches! ';
            }

            subtitle.textContent = greeting + subtitle.textContent;
        }

        // Initialize dynamic greeting
        setDynamicGreeting();