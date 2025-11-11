document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        // Optional: Settings for smooth, non-repetitive animations
        duration: 900,        // slightly longer duration for smoother feel
        once: true,           // whether animation should only happen once - important for performance
        mirror: false,        // whether elements should animate out while scrolling past them
        easing: 'ease-out-cubic'
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
                button.textContent = 'completed (undo)';
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
                progressSummary.textContent = `your progress: ${completedCourses}/${totalCourses} courses (${percentage}%)`;
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
                button.textContent = 'mark complete';
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-success');
                localStorage.removeItem(courseId);
            } else {
                // Mark as complete
                item.classList.add('completed');
                button.textContent = 'completed (undo)';
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
                const source = (item.dataset && item.dataset.source) ? item.dataset.source.toLowerCase() : (item.querySelector('.small') ? item.querySelector('.small').textContent.toLowerCase() : '');
                const datasetCourse = (item.dataset && item.dataset.course) ? item.dataset.course.toLowerCase() : '';
                const match = q === '' || title.includes(q) || desc.includes(q) || source.includes(q) || datasetCourse.includes(q);
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
            const title = item.querySelector('.course-title') ? item.querySelector('.course-title').textContent.trim() : (item.querySelector('.card-title') ? item.querySelector('.card-title').textContent.trim() : 'course');
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
            const name = (document.getElementById('contactName') || {}).value ? document.getElementById('contactName').value.trim() : '';
            const email = (document.getElementById('contactEmail') || {}).value ? document.getElementById('contactEmail').value.trim() : '';
            const message = (document.getElementById('contactMessage') || {}).value ? document.getElementById('contactMessage').value.trim() : '';
            // contactPreference may not exist on every page — fall back gracefully
            const prefEl = document.getElementById('contactPreference');
            const pref = prefEl ? prefEl.value : 'General Inquiry';

            const subject = encodeURIComponent(`[cs expert roadmap] ${pref} inquiry from ${name}`);
            const body = encodeURIComponent(`name: ${name}%0Aemail: ${email}%0Apreferred: ${pref}%0A%0Amessage:%0A${message}`);
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

    // animate-on-load: add 'play' to marked elements with a small stagger for polish
    (function animateOnLoad(){
        try {
            const els = Array.from(document.querySelectorAll('[data-animate-on-load]'));
            if (!els.length) return;
            els.forEach((el, i) => {
                const delay = (i * 120) + 120; // slightly slower stagger for a smoother entrance
                setTimeout(() => el.classList.add('play'), delay);
            });

            // highlight primary CTAs slightly later
            const ctas = document.querySelectorAll('a.btn-primary[data-animate-on-load], button.btn-primary[data-animate-on-load]');
            ctas.forEach((b, i) => setTimeout(() => b.classList.add('play'), 360 + i * 160));

            // extra: on the curriculum page, stagger course-item entrances a bit to avoid large jank
            const curriculum = document.getElementById('curriculum');
            if (curriculum) {
                const courseEls = Array.from(curriculum.querySelectorAll('.course-item'));
                courseEls.forEach((cEl, idx) => {
                    // ensure course items use the same '.play' class for consistency
                    setTimeout(() => cEl.classList.add('play'), 600 + idx * 40);
                });
            }
        } catch (err) {
            // fail silently
            console.warn('animateOnLoad error', err);
        }
    })();

    // end of DOMContentLoaded
});

/* Diagnostic quiz: render questions, score, recommend a stage */
(function diagnosticQuiz(){
    // Elements exist only on diagnostic.html; guard early
    const diagForm = document.getElementById('diagnosticForm');
    const questionsEl = document.getElementById('questions');
    const resultWrap = document.getElementById('diagResult');
    const resultMsg = document.getElementById('diagMessage');
    const goToStageBtn = document.getElementById('goToStage');
    const resetBtn = document.getElementById('resetDiag');
    const retakeBtn = document.getElementById('retake');

    if (!diagForm || !questionsEl) return;

    /*
     * Dynamic diagnostic configuration
     * - each question targets a competency domain
     * - answers are mapped to numeric competency levels (0..2)
     * - questions can carry a weight to increase influence
     * Domains are used to compute per-area levels and a recommended start stage
     */
    const domains = [
        'programming','algorithms','data_structures','databases','web','math','systems','ml'
    ];

    // Per-domain stage mapping (level -> suggested stage). Tunable.
    // Beginners -> stage 1, intermediate -> middle stages, advanced -> specialization stages.
    // Updated to more precisely route algorithms/data-structures to later specialization stages.
    const domainStageMap = {
        programming:    [1,3,6],
        algorithms:     [1,4,7],
        data_structures:[1,4,7],
        databases:      [1,4,6],
        web:            [1,3,5],
        math:           [1,2,4],
        systems:        [1,3,5],
        ml:             [1,4,8]
    };

    // Tuned weights reflect the relative importance of core skills for placement.
    // Higher weight -> greater influence on the recommended start stage.
    const questions = [
        { q: 'how comfortable are you programming in python or a similar language?', domain: 'programming', weight: 1.5, a:['i\'m new to programming','i can write programs and small projects','i build larger projects and read other people\'s code'] },
        { q: 'can you read and reason about basic algorithms (sorting, binary search)?', domain: 'algorithms', weight: 1.4, a:['no','somewhat','yes, comfortably'] },
        { q: 'have you used data structures like lists/sets/maps/trees in code?', domain: 'data_structures', weight: 1.4, a:['no','yes occasionally','regularly'] },
        { q: 'do you know SQL or basic database concepts?', domain: 'databases', weight: 1.0, a:['no','i know basic queries','i design schemas and tune queries'] },
        { q: 'have you built a web backend or used REST APIs?', domain: 'web', weight: 1.0, a:['no','i have built simple backends','yes, production or complex backends'] },
        { q: 'have you completed math/algorithms coursework (proofs, complexity)?', domain: 'math', weight: 1.3, a:['no','intro level','advanced / theoretical'] },
        { q: 'do you have experience with linux/command line and basic systems?', domain: 'systems', weight: 1.0, a:['no','basic','yes, comfortable'] },
        { q: 'how experienced are you with machine learning / data science concepts?', domain: 'ml', weight: 0.9, a:['none','familiar with basics','experienced with projects'] }
    ];

    function renderQuestions(){
        questionsEl.innerHTML = '';
        questions.forEach((item, idx) => {
            const field = document.createElement('fieldset');
            field.className = 'mb-3';
            const legend = document.createElement('legend');
            legend.className = 'small text-secondary mb-2';
            legend.textContent = `${idx + 1}. ${item.q}`;
            field.appendChild(legend);

            item.a.forEach((opt, i) => {
                const id = `q${idx}_opt${i}`;
                const div = document.createElement('div');
                div.className = 'form-check';
                const input = document.createElement('input');
                input.className = 'form-check-input';
                input.type = 'radio';
                input.name = `q${idx}`;
                input.id = id;
                input.value = String(i);
                if (i === 0) input.checked = true;

                const label = document.createElement('label');
                label.className = 'form-check-label text-light';
                label.htmlFor = id;
                label.textContent = opt;

                div.appendChild(input);
                div.appendChild(label);
                field.appendChild(div);
            });

            // small helper hint about domain (hidden on small screens)
            const hint = document.createElement('div');
            hint.className = 'small text-muted mt-2 d-none d-md-block';
            hint.textContent = `area: ${item.domain.replace('_',' ')}`;
            field.appendChild(hint);

            questionsEl.appendChild(field);
        });
    }

    // Compute domain-weighted competency levels and overall meta-score
    function computeDomainScores(){
        const domainTotals = {};
        const domainWeights = {};
        const rawValues = {};
        domains.forEach(d => { domainTotals[d] = 0; domainWeights[d] = 0; rawValues[d] = 0; });

        questions.forEach((q, i) => {
            const sel = diagForm.querySelector(`input[name=q${i}]:checked`);
            const v = sel ? parseInt(sel.value,10) : 0; // 0..2
            const weight = typeof q.weight === 'number' ? q.weight : 1;
            if (!domainTotals[q.domain]) { domainTotals[q.domain] = 0; domainWeights[q.domain] = 0; rawValues[q.domain] = 0; }
            domainTotals[q.domain] += (isNaN(v) ? 0 : v) * weight;
            domainWeights[q.domain] += 2 * weight; // max possible per question is 2
        });

        const domainScores = {};
        const raws = [];
        Object.keys(domainTotals).forEach(d => {
            const raw = domainWeights[d] > 0 ? (domainTotals[d] / domainWeights[d]) : 0; // 0..1
            raws.push(raw);
            // map to 0..2 levels by rounding
            const level = Math.round(raw * 2);
            domainScores[d] = { raw: +(raw.toFixed(3)), level };
        });

        // meta score: weighted average across domains (0..1)
        const metaNumer = Object.keys(domainTotals).reduce((acc, d) => acc + (domainTotals[d] || 0), 0);
        const metaDenom = Object.keys(domainTotals).reduce((acc, d) => acc + (domainWeights[d] || 0), 0) || 1;
        const meta = +( (metaNumer / metaDenom).toFixed(3) );

        // compute simple stddev of raw domain scores for confidence adjustment
        const meanRaw = raws.reduce((a,b)=>a+b,0) / (raws.length || 1);
        const variance = raws.reduce((a,b)=>a + Math.pow(b-meanRaw,2),0) / (raws.length || 1);
        const stddev = Math.sqrt(variance);

        return { domainScores, meta, stddev, domainWeights };
    }

    // Recommendation strategy: 'weighted' uses weighted-average suggested stage;
    // 'conservative' uses max(suggested) so weakest area is covered. Change default here.
    const recommendationStrategy = 'weighted';

    function recommendStage(domainScores, meta, stddev, domainWeights){
        // For each domain, pick suggested stage based on level using domainStageMap
        const perDomain = {};
        Object.keys(domainScores).forEach(d => {
            const lvl = domainScores[d].level;
            const map = domainStageMap[d] || [1,3,6];
            const suggested = map[Math.max(0, Math.min(2, lvl))];
            perDomain[d] = { level: lvl, suggested };
        });

        let recommendedStage = 1;
        if (recommendationStrategy === 'conservative') {
            // Choose final recommended stage to address weakest areas: take MAX suggested
            const stages = Object.values(perDomain).map(x => x.suggested);
            recommendedStage = Math.max(...stages);
        } else {
            // Weighted-average strategy: weight each suggested stage by domainWeights
            const weights = Object.keys(perDomain).map(d => (domainWeights && domainWeights[d]) ? domainWeights[d] : 1);
            const suggs = Object.keys(perDomain).map(d => perDomain[d].suggested);
            const totalW = weights.reduce((a,b)=>a+b,0) || 1;
            const avg = suggs.reduce((acc, s, i) => acc + (s * weights[i]), 0) / totalW;
            // round to nearest integer within 1..8
            recommendedStage = Math.max(1, Math.min(8, Math.round(avg)));
        }

        // Compute confidence: base on meta score but penalize high variance across domains
        // higher stddev reduces confidence. Tweak multiplier to scale penalty.
        const base = Math.round(meta * 100);
        const penalty = Math.round(stddev * 30); // up to ~30pt penalty for very uneven skillset
        const confidence = Math.max(20, Math.min(98, base - penalty));

        return { recommendedStage, perDomain, confidence };
    }

    function humanLevel(l){
        return l === 0 ? 'beginner' : (l === 1 ? 'intermediate' : 'advanced');
    }

    function showResult(obj){
        if (!resultWrap) return;
        const stage = obj.recommendedStage || 1;

        // Build accessible message and visible summary
        let text = `recommended start: stage ${stage} — confidence ${obj.confidence}%\n\nper-domain summary:\n`;
        Object.keys(obj.perDomain).forEach(d => {
            const pd = obj.perDomain[d];
            text += `• ${d.replace('_',' ')}: ${humanLevel(pd.level)} (suggest stage ${pd.suggested})\n`;
        });

        resultMsg.textContent = `you: start at stage ${stage} — ${obj.confidence}% confidence`;
        resultMsg.setAttribute('title', text);
        resultMsg.setAttribute('aria-label', text);

        // render per-domain breakdown visibly
        const breakdown = document.getElementById('diagBreakdown');
        if (breakdown) {
            breakdown.innerHTML = '';
            Object.keys(obj.perDomain).forEach(d => {
                const pd = obj.perDomain[d];
                const raw = (obj.perDomainRaw && obj.perDomainRaw[d] !== undefined) ? obj.perDomainRaw[d] : null;

                const card = document.createElement('div');
                card.className = 'mb-2 p-2 bg-dark border rounded';
                const row = document.createElement('div');
                row.className = 'd-flex justify-content-between align-items-center';
                const title = document.createElement('div');
                title.innerHTML = `<strong class="text-light">${d.replace('_',' ')}</strong> <span class="small text-muted ms-2">${humanLevel(pd.level)}</span>`;
                const stageBadge = document.createElement('div');
                // color-code badge by level
                const levelClass = pd.level === 2 ? 'bg-success' : (pd.level === 1 ? 'bg-warning text-dark' : 'bg-danger');
                stageBadge.innerHTML = `<span class="badge ${levelClass}">stage ${pd.suggested}</span>`;
                row.appendChild(title);
                row.appendChild(stageBadge);

                card.appendChild(row);

                if (raw !== null) {
                    const progWrap = document.createElement('div');
                    progWrap.className = 'progress mt-2';
                    const bar = document.createElement('div');
                    bar.className = 'progress-bar bg-success';
                    bar.setAttribute('role','progressbar');
                    bar.style.width = `${Math.round(raw*100)}%`;
                    bar.setAttribute('aria-valuenow', Math.round(raw*100));
                    bar.setAttribute('aria-valuemin','0');
                    bar.setAttribute('aria-valuemax','100');
                    bar.textContent = `${Math.round(raw*100)}%`;
                    progWrap.appendChild(bar);
                    card.appendChild(progWrap);
                }

                // micro-recommendation: link to a mapped course or suggested stage in curriculum
                const actionRow = document.createElement('div');
                actionRow.className = 'mt-2 d-flex gap-2';
                const link = document.createElement('a');
                link.className = 'btn btn-sm btn-outline-light';
                // map domain -> representative course (data-course keys). Fallback to stage anchor.
                const domainCourseMap = {
                    programming: 'cs61a',
                    algorithms: 'algorithmsmit',
                    data_structures: 'algoexpert',
                    databases: 'postgres',
                    web: 'nodejs',
                    math: 'math',
                    systems: 'docker',
                    ml: 'mlcourse'
                };
                const preferred = domainCourseMap[d];
                let href = `curriculum.html#collapse${pd.suggested}`;
                if (preferred) {
                    const el = document.querySelector(`[data-course="${preferred}"]`);
                    const courseLink = el ? el.querySelector('a.course-link') : null;
                    if (courseLink && courseLink.href) href = courseLink.href;
                }
                link.href = href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = `review ${preferred ? preferred.replace(/_/g,' ') : 'stage ' + pd.suggested}`;
                actionRow.appendChild(link);
                // small hint
                const hint = document.createElement('div');
                hint.className = 'small text-muted align-self-center';
                hint.textContent = `${humanLevel(pd.level)} in ${d.replace('_',' ')}`;
                actionRow.appendChild(hint);
                card.appendChild(actionRow);

                breakdown.appendChild(card);
            });
        }

        if (goToStageBtn) goToStageBtn.href = `curriculum.html#collapse${stage}`;
        resultWrap.classList.remove('d-none');
        localStorage.setItem('diagnosticResult', JSON.stringify(obj));
    }

    diagForm.addEventListener('submit', (e) =>{
        e.preventDefault();
        const { domainScores, meta, stddev, domainWeights } = computeDomainScores();
        const rec = recommendStage(domainScores, meta, stddev, domainWeights);
        // include raw domain values so the UI can show percent bars
        const perDomainRaw = {};
        Object.keys(domainScores).forEach(d => perDomainRaw[d] = domainScores[d].raw);
        const out = { recommendedStage: rec.recommendedStage, perDomain: rec.perDomain, perDomainRaw, confidence: rec.confidence, meta };
        showResult(out);
        resultWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    resetBtn && resetBtn.addEventListener('click', ()=>{
        localStorage.removeItem('diagnosticResult');
        renderQuestions();
        resultWrap.classList.add('d-none');
    });

    retakeBtn && retakeBtn.addEventListener('click', ()=>{
        renderQuestions();
        resultWrap.classList.add('d-none');
    });

    const prev = localStorage.getItem('diagnosticResult');
    renderQuestions();
    if (prev){
        try{ const obj = JSON.parse(prev); showResult(obj); }catch(e){}
    }

})();