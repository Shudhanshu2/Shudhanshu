// ScaleEdge AI Twin Engine - Realistic Slide Generation Engine
// ============================================================

function buildRealisticSlides(appState) {
    // Generate seed from inputs for deterministic results
    appState.slideSeed = seedFromInputs();
    const seed = appState.slideSeed;
    const slideCount = appState.formData.slideLength || 12;
    const { nicheData, pains, examples } = appState.generatedHVSP;
    const brandColor = appState.formData.brandColor || '#DC2626';

    const slides = [];

    for (let i = 1; i <= slideCount; i++) {
        const layout = getLayoutForSlide(i, seed);
        const time = getSlideTime(i, seed);
        const buildDots = getBuildDots(i, seed);
        const provenance = getProvenance(i, seed);

        let slide = {
            num: i,
            layout,
            timeSec: time,
            buildDots,
            provenance,
            title: '',
            bullets: [],
            diagramSVG: null,
            proof: null,
            notes: ''
        };

        // Generate content based on layout
        switch (layout) {
            case 'TITLE':
                slide.title = humanize(appState.formData.offerName || 'HVSP', i);
                slide.bullets = [
                    'Camera-off, slide-based',
                    '80% value / 20% pitch',
                    'India market tuned'
                ];
                slide.notes = `Title slide. ${humanize('Emphasize HVSP format and India-first approach', i)}.`;
                break;

            case 'BULLETS':
                slide.title = humanize(pains[i % pains.length] || `Key Point ${i}`, i);
                slide.bullets = (examples.slice(0, 3) || ['Point 1', 'Point 2', 'Point 3']).map((ex, idx) =>
                    humanize(ex, i + idx)
                );
                slide.notes = `Bullet slide ${i}. ${humanize('Keep points concise', i)}.`;
                break;

            case 'TWOCOL':
                slide.title = humanize('System Overview', i);
                slide.bullets = [
                    humanize('Structured approach', i),
                    humanize('India-first methodology', i),
                    humanize('Proven framework', i + 1)
                ];
                // Generate simple diagram for right column
                slide.diagramSVG = svgTimeline(['Step 1', 'Step 2', 'Step 3'], brandColor);
                slide.notes = `Two-column layout. ${humanize('Left: bullets, Right: diagram', i)}.`;
                break;

            case 'DIAGRAM':
                slide.title = humanize(i === 6 ? 'The Process' : 'Framework', i);
                const diagramType = seededRandom(seed + i * 1000) > 0.5 ? 'funnel' : 'matrix';
                if (diagramType === 'funnel') {
                    slide.diagramSVG = svgFunnel(
                        [pains[0] || 'Awareness', pains[1] || 'Interest', 'Action'],
                        brandColor
                    );
                } else {
                    slide.diagramSVG = svgMatrix({
                        topLeft: 'Quick',
                        topRight: 'Strategic',
                        bottomLeft: 'Reactive',
                        bottomRight: 'Planned'
                    }, brandColor);
                }
                slide.bullets = [];
                slide.notes = `Full diagram slide. ${humanize('Explain visual framework', i)}.`;
                break;

            case 'PROOF':
                slide.title = humanize('Real Results', i);
                // Auto-pick 3 proof tiles
                const proofs = appState.testimonials.slice(0, 3).map(t => ({
                    name: t.name,
                    initials: t.name.split(' ').map(n => n[0]).join(''),
                    blurb: humanize(t.blurb, i)
                }));
                slide.proof = proofs;
                slide.bullets = [];
                slide.notes = `Proof slide. Note: ${humanize('Illustrative; results vary', i)}.`;
                break;

            case 'CTA':
                slide.title = `Next Step: ${appState.formData.ctaText || 'Book Call'}`;
                slide.bullets = [
                    `Investment: ₹${appState.formData.ticket || '1.2L'} (${appState.formData.salesModel})`,
                    appState.formData.ctaLink ? `Link: ${appState.formData.ctaLink}` : 'Schedule a clarity call',
                    humanize('No pressure, mutual fit check', i)
                ];
                slide.notes = `CTA slide. ${humanize('Keep it low-pressure and clear', i)}.`;
                break;
        }

        slides.push(slide);
    }

    return slides;
}

function renderSlideThumb(slide, logoURL) {
    const buildDotsHTML = Array(slide.buildDots).fill(0).map(() => '<div class="build-dot"></div>').join('');
    const timeFormatted = `${Math.floor(slide.timeSec / 60)}:${(slide.timeSec % 60).toString().padStart(2, '0')}`;

    let contentHTML = '';

    if (slide.layout === 'PROOF' && slide.proof) {
        // Render proof chips
        contentHTML = slide.proof.map(p => `
            <div class="proof-chip">
                <div class="proof-avatar">${p.initials}</div>
                <div class="proof-content">
                    <div class="proof-name">${p.name}</div>
                    <div class="proof-blurb">${p.blurb}</div>
                </div>
            </div>
        `).join('') + '<div class="proof-disclaimer">Illustrative; results vary.</div>';
    } else if (slide.layout === 'DIAGRAM' && slide.diagramSVG) {
        // Render diagram
        contentHTML = `<div class="slide-diagram">${slide.diagramSVG}</div>`;
    } else if (slide.layout === 'TWOCOL' && slide.diagramSVG) {
        // Two column: bullets + diagram
        contentHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 100%;">
                <div>${slide.bullets.map(b => `<div>• ${b}</div>`).join('')}</div>
                <div class="slide-diagram">${slide.diagramSVG}</div>
            </div>
        `;
    } else {
        // Regular bullets
        contentHTML = slide.bullets.slice(0, 3).map(b => `<div>• ${b}</div>`).join('');
    }

    return `
        <div class="slide-card" data-slide="${slide.num}">
            <div class="slide-16x9">
                <div class="slide-16x9-content">
                    <div class="slide-layout-badge">${slide.layout}</div>
                    <div class="slide-time-pill">${timeFormatted}</div>
                    <div class="slide-title">${slide.title}</div>
                    <div class="slide-content">${contentHTML}</div>
                    <div class="slide-provenance">${slide.provenance}</div>
                    <div class="slide-build-dots">${buildDotsHTML}</div>
                    ${logoURL ? `<img src="${logoURL}" class="slide-watermark" alt="Logo">` : ''}
                </div>
            </div>
            <div class="slide-note-icon"></div>
            <button class="slide-shuffle-btn" data-slide="${slide.num}">🔀 Shuffle</button>
        </div>
    `;
}

function shuffleSlide(slideNum) {
    // Regenerate single slide with slight noise
    const oldSeed = appState.slideSeed;
    appState.slideSeed = oldSeed + Math.floor(Math.random() * 1000);

    const newSlides = buildRealisticSlides(appState);
    const newSlide = newSlides.find(s => s.num === slideNum);

    if (newSlide) {
        // Replace in array
        const idx = appState.generatedSlides.findIndex(s => s.num === slideNum);
        if (idx !== -1) {
            appState.generatedSlides[idx] = newSlide;
        }

        // Re-render just this slide
        const grid = document.getElementById('slides-grid');
        const cards = grid.querySelectorAll('.slide-card');
        cards.forEach(card => {
            if (parseInt(card.dataset.slide) === slideNum) {
                card.outerHTML = renderSlideThumb(newSlide, appState.preview.logoURL);
            }
        });

        // Re-attach event listeners
        attachSlideListeners();
        console.log(`[slides] shuffled slide ${slideNum} • seed=${appState.slideSeed}`);
    }
}

function attachSlideListeners() {
    // Attach click handlers for slide cards
    const grid = document.getElementById('slides-grid');
    if (!grid) return;

    grid.querySelectorAll('.slide-card').forEach(card => {
        // Remove old listeners by cloning
        const newCard = card.cloneNode(true);
        card.replaceWith(newCard);

        newCard.addEventListener('click', (e) => {
            // Don't trigger on shuffle button click
            if (e.target.closest('.slide-shuffle-btn')) return;

            const slideNum = parseInt(newCard.dataset.slide);
            openSlideModal(slideNum);
        });

        const shuffleBtn = newCard.querySelector('.slide-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                shuffleSlide(parseInt(shuffleBtn.dataset.slide));
            });
        }
    });
}

function openSlideModal(slideNum) {
    const modal = document.getElementById('slide-modal');
    if (!modal) return;

    const slide = appState.generatedSlides.find(s => s.num === slideNum);
    if (!slide) return;

    appState.currentModalSlide = slideNum;

    const title = document.getElementById('slide-modal-title');
    const content = document.getElementById('slide-modal-content');
    const notes = document.getElementById('slide-notes-content');

    if (title) title.textContent = `Slide ${slide.num}: ${slide.title}`;

    if (content) {
        let modalContent = `<div class="slide-title text-2xl mb-4">${slide.title}</div>`;

        if (slide.layout === 'PROOF' && slide.proof) {
            modalContent += slide.proof.map(p => `
                <div class="proof-chip" style="margin-bottom: 1rem;">
                    <div class="proof-avatar" style="width: 3rem; height: 3rem; font-size: 1rem;">${p.initials}</div>
                    <div class="proof-content">
                        <div class="proof-name" style="font-size: 1rem;">${p.name}</div>
                        <div class="proof-blurb" style="font-size: 0.875rem; white-space: normal;">${p.blurb}</div>
                    </div>
                </div>
            `).join('');
        } else if (slide.diagramSVG) {
            modalContent += `<div class="slide-diagram" style="padding: 2rem;">${slide.diagramSVG}</div>`;
        } else {
            modalContent += `<div class="space-y-3">${slide.bullets.map(b => `<p class="text-lg">• ${b}</p>`).join('')}</div>`;
        }

        content.innerHTML = modalContent;
    }

    if (notes) notes.textContent = slide.notes;

    modal.classList.remove('hidden');
}

function navigateSlideModal(direction) {
    const newNum = appState.currentModalSlide + direction;
    if (newNum >= 1 && newNum <= appState.generatedSlides.length) {
        openSlideModal(newNum);
    }
}

// Export for use (not actually used in browser, but good practice)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buildRealisticSlides,
        renderSlideThumb,
        shuffleSlide,
        attachSlideListeners,
        openSlideModal,
        navigateSlideModal
    };
}
