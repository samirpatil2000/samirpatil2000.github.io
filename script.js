// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-times');
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if(icon) {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link Update on Scroll
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    const headerHeight = document.querySelector('header').offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100; // offset
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').substring(1) === current) {
            item.classList.add('active');
        }
    });
});


// Intersection Observer for Statistics Counter Animation
const formatNumber = (num) => {
    return num + "+";
};

const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = formatNumber(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = formatNumber(end); // force exact end
        }
    };
    window.requestAnimationFrame(step);
}

const statsObserverOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            if (target && !entry.target.classList.contains('animated')) {
                animateValue(entry.target, 0, target, 2000);
                entry.target.classList.add('animated');
            }
        }
    });
}, statsObserverOptions);

document.querySelectorAll('.stat-value').forEach(item => {
    statsObserver.observe(item);
});



// API Fetching for Medium Articles
async function fetchMediumArticles() {
    const container = document.getElementById('medium-articles-container');
    if (!container) return;
    
    try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@samir00');
        const data = await response.json();
        const items = data.items.slice(0, 6);
        
        container.innerHTML = ''; // clear loading state
        
        items.forEach(item => {
            // Extract a short description snippet from content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.description;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const snippet = textContent.slice(0, 100).trim() + '...';
            
            const category = item.categories && item.categories.length > 0 
                ? item.categories[0].toUpperCase() 
                : 'ARTICLE';

            const cardHTML = `
                <div class="card blog-card">
                    <div class="card-body">
                        <div class="blog-meta">
                            <span class="system-label" style="margin: 0;">${category}</span>
                        </div>
                        <h3 class="card-title mb-2"><a href="${item.link}" target="_blank">${item.title}</a></h3>
                        <p>${snippet}</p>
                    </div>
                    <div class="card-footer" style="background-color: transparent;">
                        <a href="${item.link}" target="_blank" class="read-link">
                            Read Post <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error('Error fetching Medium articles:', error);
        container.innerHTML = '<p class="system-label" style="grid-column: 1 / -1; text-align: center; color: var(--color-danger);">ERR_FETCH_MEDIUM</p>';
    }
}

// Initialize fetch pipelines
document.addEventListener('DOMContentLoaded', () => {
    fetchMediumArticles();
});

