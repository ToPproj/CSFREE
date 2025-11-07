document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        // Optional: Settings for smooth, non-repetitive animations
        duration: 800,        // duration of the animation
        once: true,           // whether animation should only happen once - important for performance
        mirror: false,        // whether elements should animate out while scrolling past them
    });

    const curriculumContainer = document.getElementById('curriculum');
    const progressSummary = document.getElementById('progress-summary');

    // If there's no curriculum on the current page, skip curriculum-specific initialization.
    let courseItems = [];
    let totalCourses = 0;

    if (curriculumContainer) {
        courseItems = Array.from(curriculumContainer.querySelectorAll('.course-item'));
        totalCourses = courseItems.length;
    }

    function loadProgress() {
        if (!courseItems.length) return;
        courseItems.forEach(item => {
            const button = item.querySelector('.complete-btn');
            if (!button) return;
            const courseId = button.dataset.course;

            // Check Local Storage for completion status
            if (localStorage.getItem(courseId) === 'true') {
                item.classList.add('completed');
                button.textContent = 'Completed (Undo)';
                // Change button style to primary/success for completed state
                button.classList.remove('btn-outline-success');
                button.classList.add('btn-success');
            }
        });
        updateProgressSummary();
    }

    function updateProgressSummary() {
        if (!progressSummary) return;
        if (!curriculumContainer || totalCourses === 0) {
            progressSummary.textContent = `Your Progress: 0/0 courses (0%)`;
            return;
        }
        const completedCourses = curriculumContainer.querySelectorAll('.course-item.completed').length;
        const percentage = totalCourses > 0 ? ((completedCourses / totalCourses) * 100).toFixed(0) : 0;
        progressSummary.textContent = `Your Progress: ${completedCourses}/${totalCourses} courses (${percentage}%)`;
    }

    // Update top progress bar (keeps visual in sync)
    function updateTopProgressBar() {
        const completedCourses = curriculumContainer.querySelectorAll('.course-item.completed').length;
        const percentage = totalCourses > 0 ? ((completedCourses / totalCourses) * 100) : 0;
        const bar = document.getElementById('top-progress');
        const txt = document.getElementById('top-progress-text');
        if (bar) {
            bar.style.width = `${percentage}%`;
            bar.setAttribute('aria-valuenow', Math.round(percentage));
        }
        if (txt) {
            txt.textContent = `${Math.round(percentage)}% complete`;
        }
    }

    // Mark Complete Button Handler
    curriculumContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('complete-btn')) {
            const button = event.target;
            const item = button.closest('.course-item');
            const courseId = button.dataset.course;

            if (item.classList.contains('completed')) {
                // Mark as incomplete
                item.classList.remove('completed');
                button.textContent = 'Mark Complete';
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-success');
                localStorage.removeItem(courseId);
            } else {
                // Mark as complete
                item.classList.add('completed');
                button.textContent = 'Completed (Undo)';
                button.classList.remove('btn-outline-success');
                button.classList.add('btn-success');
                localStorage.setItem(courseId, 'true');
            }
            updateProgressSummary();
            updateTopProgressBar();
        }
    });

    // Ensure all stages are expanded by default
    const stages = document.querySelectorAll('.accordion-collapse');
    stages.forEach(stage => {
        stage.classList.add('show'); // Add 'show' class to expand all stages
    });

    // Initialize the website state
    loadProgress();

    // Keep top progress bar in sync on initial load
    updateTopProgressBar();

    // Smooth scrolling for navbar links + collapse on mobile
    (function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const getNavHeight = () => navbar.offsetHeight;
        const navLinks = document.querySelectorAll('.navbar a.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (!target) return;
                e.preventDefault();
                const y = target.getBoundingClientRect().top + window.pageYOffset - getNavHeight() - 8;
                window.scrollTo({ top: y, behavior: 'smooth' });

                // collapse responsive navbar
                const shownCollapse = document.querySelector('.navbar-collapse.show');
                if (shownCollapse) {
                    const bsCollapse = bootstrap.Collapse.getInstance(shownCollapse) || new bootstrap.Collapse(shownCollapse);
                    bsCollapse.hide();
                }
            });
        });

        // Active link highlighting using IntersectionObserver
    const sectionIds = ['curriculum', 'support', 'about'];
        const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
        if (sections.length) {
            const options = { root: null, rootMargin: `-${getNavHeight() + 10}px 0px 0px 0px`, threshold: 0.35 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const id = entry.target.id;
                    const navLink = document.querySelector(`.navbar a.nav-link[href="#${id}"]`);
                    if (navLink) {
                        if (entry.isIntersecting) {
                            document.querySelectorAll('.navbar .nav-link').forEach(n => n.classList.remove('active'));
                            navLink.classList.add('active');
                        }
                    }
                });
            }, options);
            sections.forEach(s => observer.observe(s));
        }
    })();

    // Course search/filter
    (function courseSearch(){
        const input = document.getElementById('courseSearch');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            const items = document.querySelectorAll('.course-item');
            items.forEach(item => {
                const titleEl = item.querySelector('.course-title') || item.querySelector('.card-title');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                const descEl = item.querySelector('.card-text');
                const desc = descEl ? descEl.textContent.toLowerCase() : '';
                const source = item.dataset.source ? item.dataset.source.toLowerCase() : (item.querySelector('.small') ? item.querySelector('.small').textContent.toLowerCase() : '');
                const match = q === '' || title.includes(q) || desc.includes(q) || source.includes(q) || item.dataset.course.includes(q);
                item.style.display = match ? '' : 'none';
            });
        });
    })();

    // Course details modal population
    (function courseDetails(){
        const modalEl = document.getElementById('courseDetailsModal');
        if (!modalEl) return;
        const bsModal = new bootstrap.Modal(modalEl);

        function openDetailsForItem(item){
            const title = item.querySelector('.course-title') ? item.querySelector('.course-title').textContent.trim() : (item.querySelector('.card-title') ? item.querySelector('.card-title').textContent.trim() : 'Course');
            const source = item.dataset.source || (item.querySelector('.small') ? item.querySelector('.small').textContent.trim() : '');
            const desc = item.querySelector('.card-text') ? item.querySelector('.card-text').textContent.trim() : '';
            const linkEl = item.querySelector('a.course-link');
            const link = linkEl ? linkEl.href : (item.dataset.link || '#');

            document.getElementById('detail-title').textContent = title;
            document.getElementById('detail-source').textContent = source;
            document.getElementById('detail-desc').textContent = desc;
            const detailLink = document.getElementById('detail-link');
            detailLink.href = link;

            bsModal.show();
        }

        document.addEventListener('click', (e) => {
            const t = e.target;
            if (t.classList.contains('course-title') || t.classList.contains('details-btn')) {
                const item = t.closest('.course-item');
                if (item) openDetailsForItem(item);
            }
        });
    })();

    // Contact form: open mail client with prefilled message (mailto fallback)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            const pref = document.getElementById('contactPreference').value;

            const subject = encodeURIComponent(`[CS Expert Roadmap] ${pref} inquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}%0AEmail: ${email}%0APreferred: ${pref}%0A%0AMessage:%0A${message}`);
            const mailto = `mailto:hello@example.com?subject=${subject}&body=${body}`; // TODO: replace with real contact

            // Show confirmation and open mailto
            const alertEl = document.getElementById('contactAlert');
            if (alertEl) alertEl.classList.remove('d-none');
            window.location.href = mailto;
        });
    }

    // Wire side TOC and top nav links to smooth scroll (also highlight active)
    (function wireExtraLinks(){
        const extraLinks = document.querySelectorAll('#side-toc a, #view-pricing');
        extraLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                e.preventDefault();
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (!target) return;
                const nav = document.querySelector('.navbar');
                const offset = nav ? nav.offsetHeight + 8 : 80;
                const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            });
        });
    })();
});