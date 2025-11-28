// ScaleEdge AI Twin Engine - Main Application
// ============================================

// Global State
const appState = {
    currentStep: 1,
    formData: {
        brandColor: '#DC2626',
        logoFile: null,
        salesModel: 'one-time',
        ctaLink: '',
        slideLength: 12,
        proofTiles: []
    },
    selectedPains: [],
    selectedObjections: [],
    niches: [],
    frameworks: {},
    testimonials: [],
    knowledgeBase: [],
    generatedHVSP: null,
    generatedSlides: [],
    slideSeed: 0,
    currentModalSlide: 0,
    outputOptions: {
        voiceMode: 'tts', // 'tts' | 'upload' | 'extract'
        voiceFile: null,
        avatarEnabled: false,
        avatarFile: null,
        pipPosition: 'bottom-right'
    },
    ui: {
        uploadProgress: 0,
        slideTimer: null,
        renderTimer: null,
        gatedMax: 0.6,
        slideTimerComplete: false
    },
    preview: {
        avatarURL: null,
        logoURL: null
    },
    renderETA: 0,
    slideETA: 0,
    presenterNotesVisible: false
};

// Preset Data (for keyboard shortcut 1 and ?demo=1)
const PRESET_DATA = {
    businessModel: 'consulting',
    niche: 'b2b_consulting',
    customNiche: '',
    persona: 'Founders (5-50 Cr ARR)',
    ticket: '₹1.2L',
    language: 'hinglish',
    tone: 'authoritative',
    offerName: 'Automated Sales System',
    externalPromise: 'predictable revenue without selling',
    internalWin: 'Stop being the Salesman',
    pains: ['Selling nahi aati', 'Manual grinding (12hr/day)', 'Inconsistent revenue'],
    objections: ['Custom work needed', 'Budget concerns', 'Timeline unclear'],
    ctaText: 'Scaling GrowthMap Call (Refundable)'
};

// Utility Functions
// =================

function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function detectOS() {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    if (platform.includes('mac') || userAgent.includes('mac')) return 'macos';
    if (platform.includes('win') || userAgent.includes('win')) return 'windows';
    return 'macos'; // default
}

function generateSavedPath(niche, slug) {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHmmss
    const os = detectOS();

    if (os === 'windows') {
        return `C:\\Users\\<User>\\Documents\\ScaleEdge\\Exports\\${niche}\\${date}\\HVSP_${slug}_${time}.mp4`;
    } else {
        return `~/Documents/ScaleEdge/Exports/${niche}/${date}/HVSP_${slug}_${time}.mp4`;
    }
}

// Data Loading
// ============

async function loadData() {
    try {
        const responses = await Promise.all([
            fetch('data/niches.json').catch(() => null),
            fetch('data/frameworks.json').catch(() => null),
            fetch('data/testimonials.json').catch(() => null),
            fetch('data/knowledge_base.json').catch(() => null)
        ]);

        if (responses[0]) appState.niches = await responses[0].json();
        if (responses[1]) appState.frameworks = await responses[1].json();
        if (responses[2]) appState.testimonials = await responses[2].json();
        if (responses[3]) appState.knowledgeBase = await responses[3].json();

        populateNicheDropdown();
    } catch (error) {
        console.error('Data loading error:', error);
    }
}

function populateNicheDropdown() {
    const dropdown = document.getElementById('niche-select');
    if (!dropdown) return;

    appState.niches.forEach(niche => {
        const option = document.createElement('option');
        option.value = niche.id;
        option.textContent = niche.label;
        dropdown.appendChild(option);
    });
}

// Form & Stepper Logic
// ====================

function initFormHandlers() {
    // Hero buttons
    const btnStart = document.getElementById('btn-start');
    const btnPreset = document.getElementById('btn-preset');

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            document.getElementById('hero').classList.add('hidden');
            document.getElementById('stepper-section').classList.remove('hidden');
        });
    }

    if (btnPreset) {
        btnPreset.addEventListener('click', () => {
            prefillPreset();
            document.getElementById('hero').classList.add('hidden');
            document.getElementById('stepper-section').classList.remove('hidden');
        });
    }

    // Step 1: Business Model
    const btnNext1 = document.getElementById('btn-next-1');
    if (btnNext1) {
        btnNext1.addEventListener('click', () => {
            const selected = document.querySelector('input[name="business_model"]:checked');
            if (!selected) {
                showToast('Please select a business model');
                return;
            }
            appState.formData.businessModel = selected.value;
            goToStep(2);
        });
    }

    // Step 2: Niche & Market
    const btnBack2 = document.getElementById('btn-back-2');
    const btnNext2 = document.getElementById('btn-next-2');

    if (btnBack2) btnBack2.addEventListener('click', () => goToStep(1));
    if (btnNext2) {
        btnNext2.addEventListener('click', () => {
            const nicheId = document.getElementById('niche-select')?.value;
            const customNiche = document.getElementById('niche-custom')?.value;
            const persona = document.getElementById('persona')?.value;

            if (!nicheId && !customNiche) {
                showToast('Please select or enter a niche');
                return;
            }
            if (!persona) {
                showToast('Please enter target persona');
                return;
            }

            appState.formData.nicheId = nicheId;
            appState.formData.customNiche = customNiche;
            appState.formData.persona = persona;
            appState.formData.ticket = document.getElementById('ticket')?.value || '';
            appState.formData.language = document.getElementById('language')?.value || 'hinglish';
            appState.formData.tone = document.querySelector('input[name="tone"]:checked')?.value || 'authoritative';

            populateStep3FromNiche(nicheId);
            goToStep(3);
        });
    }

    // Step 3: Business Details
    const btnBack3 = document.getElementById('btn-back-3');
    const btnGenerate = document.getElementById('btn-generate');

    if (btnBack3) btnBack3.addEventListener('click', () => goToStep(2));

    // Brand color picker
    const brandColor = document.getElementById('brand-color');
    const brandColorText = document.getElementById('brand-color-text');
    if (brandColor && brandColorText) {
        brandColor.addEventListener('input', (e) => {
            const color = e.target.value;
            appState.formData.brandColor = color;
            brandColorText.value = color;
            document.documentElement.style.setProperty('--brand', color);
            console.log(`[style] theme=${color} • applied live`);
        });
    }

    // Logo upload
    const logoUpload = document.getElementById('logo-upload');
    const btnLogoUpload = document.getElementById('btn-logo-upload');
    if (logoUpload && btnLogoUpload) {
        btnLogoUpload.addEventListener('click', () => logoUpload.click());
        logoUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                appState.formData.logoFile = file;
                if (appState.preview.logoURL) {
                    URL.revokeObjectURL(appState.preview.logoURL);
                }
                appState.preview.logoURL = URL.createObjectURL(file);
                console.log(`[style] logo=${file.name} • ready for watermark`);
                showToast(`Logo uploaded: ${file.name}`);
            }
        });
    }

    // Sales model dropdown
    const salesModel = document.getElementById('sales-model');
    if (salesModel) {
        salesModel.addEventListener('change', (e) => {
            appState.formData.salesModel = e.target.value;
            console.log(`[pitch] model=${e.target.value}`);
        });
    }

    // Advanced section toggle
    const toggleAdvanced = document.getElementById('toggle-advanced');
    const advancedSection = document.getElementById('advanced-section');
    const advancedArrow = document.getElementById('advanced-arrow');
    if (toggleAdvanced && advancedSection && advancedArrow) {
        toggleAdvanced.addEventListener('click', () => {
            const isHidden = advancedSection.classList.contains('hidden');
            advancedSection.classList.toggle('hidden');
            advancedArrow.textContent = isHidden ? '▾' : '▸';
        });
    }

    // Advanced fields
    const ctaLink = document.getElementById('cta-link');
    if (ctaLink) {
        ctaLink.addEventListener('input', (e) => {
            appState.formData.ctaLink = e.target.value;
        });
    }

    const slideLength = document.getElementById('slide-length');
    if (slideLength) {
        slideLength.addEventListener('change', (e) => {
            appState.formData.slideLength = parseInt(e.target.value);
            const countSpan = document.getElementById('slide-count');
            if (countSpan) countSpan.textContent = e.target.value;
        });
    }

    const language = document.getElementById('language');
    if (language) {
        language.addEventListener('change', (e) => {
            appState.formData.language = e.target.value;
        });
    }

    const tone = document.getElementById('tone');
    if (tone) {
        tone.addEventListener('change', (e) => {
            appState.formData.tone = e.target.value;
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const offerName = document.getElementById('offer-name')?.value;
            const ticket = document.getElementById('ticket')?.value;

            if (!offerName || !ticket) {
                showToast('Please fill in required fields');
                return;
            }

            appState.formData.offerName = offerName;
            appState.formData.ticket = ticket;
            appState.formData.pains = appState.selectedPains;

            // Log AI Twin calibration
            console.log(`[ai-twin] calibrating Indian market context • ICP=${appState.formData.persona || 'not set'}`);
            console.log(`[asp] mapping ${appState.selectedPains.length} pain points → value framework`);
            console.log(`[ai-twin] applying brand identity • theme=${appState.formData.brandColor} • logo=${appState.formData.logoFile ? 'ready' : 'none'}`);
            console.log(`[asp] structuring pitch mechanics • ticket=₹${ticket} • model=${appState.formData.salesModel}`);

            generateHVSP();
        });
    }
}

function goToStep(step) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) stepEl.classList.add('hidden');
    }

    // Show target step
    const targetStep = document.getElementById(`step-${step}`);
    if (targetStep) targetStep.classList.remove('hidden');

    // Update indicators
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((ind, idx) => {
        if (idx < step) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });

    // Update progress bar
    const progress = document.getElementById('stepper-progress');
    if (progress) {
        progress.style.width = `${(step / 3) * 100}%`;
    }

    appState.currentStep = step;
}

function populateStep3FromNiche(nicheId) {
    const niche = appState.niches.find(n => n.id === nicheId);
    if (!niche) return;

    // Populate pains
    const painsList = document.getElementById('pains-list');
    if (painsList && niche.pains) {
        painsList.innerHTML = niche.pains.map((pain, idx) =>
            `<span class="chip chip-clickable" data-pain="${pain}">${pain}</span>`
        ).join('');

        painsList.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => togglePain(chip));
        });
    }

    // Populate objections
    const objectionsList = document.getElementById('objections-list');
    if (objectionsList && niche.objections) {
        objectionsList.innerHTML = niche.objections.map(obj =>
            `<label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value="${obj}" class="objection-check">
                <span class="text-sm">${obj}</span>
            </label>`
        ).join('');

        objectionsList.querySelectorAll('.objection-check').forEach(check => {
            check.addEventListener('change', updateObjections);
        });
    }
}

function togglePain(chip) {
    const pain = chip.dataset.pain;
    if (chip.classList.contains('chip-selected')) {
        chip.classList.remove('chip-selected');
        appState.selectedPains = appState.selectedPains.filter(p => p !== pain);
    } else {
        if (appState.selectedPains.length >= 3) {
            showToast('Maximum 3 pains allowed');
            return;
        }
        chip.classList.add('chip-selected');
        appState.selectedPains.push(pain);
    }
    updateSelectedPainsDisplay();
}

function updateSelectedPainsDisplay() {
    const container = document.getElementById('selected-pains');
    if (!container) return;
    container.innerHTML = appState.selectedPains.map(pain =>
        `<span class="chip chip-selected">${pain}</span>`
    ).join('');
}

function updateObjections() {
    const checks = document.querySelectorAll('.objection-check:checked');
    appState.selectedObjections = Array.from(checks).map(c => c.value);
}

// HVSP Generation
// ===============

async function generateHVSP() {
    // Hide form, show matching section
    document.getElementById('stepper-section').classList.add('hidden');
    document.getElementById('matching-section').classList.remove('hidden');

    const nicheData = appState.niches.find(n => n.id === appState.formData.nicheId) || {
        id: 'custom',
        label: appState.formData.customNiche || 'Custom',
        pains: appState.formData.pains || [],
        examples: ['Approach 1', 'Approach 2', 'Approach 3']
    };

    // Populate matched data chips
    const matchedChips = document.getElementById('matched-chips');
    if (matchedChips) {
        const chips = [
            'Framework: HVSP-Core (Hook/Value/Story/Pitch)',
            'Balance: 80/20',
            `Linguistics: ${appState.formData.language} (India)`,
            `Tone: ${appState.formData.tone}`,
            `Cluster hits: ${Math.floor(Math.random() * 8) + 8} assets`,
            'Source scope: internal multi-niche dataset'
        ];
        matchedChips.innerHTML = chips.map(c => `<div class="chip">${c}</div>`).join('');
    }

    // Start slide timer (2:30-4:00) immediately
    appState.slideETA = 150 + Math.floor(Math.random() * 91); // 150-240 seconds (2:30-4:00)
    appState.ui.slideTimerComplete = false;
    startSlideTimer();

    // Run pipeline
    await runPipeline(nicheData);

    // Generate outline
    generateOutline(nicheData);

    // Show outline section
    document.getElementById('outline-section').classList.remove('hidden');
}

async function runPipeline(nicheData) {
    const stages = [
        { name: 'Parsing intake & normalizing…', duration: 1200 },
        { name: 'Framework selection (HVSP-Core + Niche-Adapt)…', duration: 2000 },
        { name: 'Value block synthesis (India psych)…', duration: 2400 },
        { name: 'Slides layout pass (contrast, clarity)…', duration: 2200 },
        { name: 'Pitch graft & recap…', duration: 1800 }
    ];

    const pipelineBars = document.getElementById('pipeline-bars');
    if (pipelineBars) {
        pipelineBars.innerHTML = stages.map((s, i) => `
            <div class="pipeline-bar">
                <div class="pipeline-bar-text">${s.name}</div>
                <div class="pipeline-bar-progress">
                    <div class="pipeline-bar-fill" id="pipeline-fill-${i}" style="width: 0%"></div>
                </div>
                <div class="pipeline-bar-time">${(s.duration / 1000).toFixed(1)}s</div>
            </div>
        `).join('');
    }

    // Generate logs
    const logLines = [
        `[match] niche=${nicheData.id} • language=${appState.formData.language} • tone=${appState.formData.tone}`,
        `[cluster] ${Math.floor(Math.random() * 8) + 8} assets matched from India-B2B pool`,
        '[apply] balance=80/20',
        '[slides] generating 12 frames; optimizing legibility ratios',
        `[objections] ${appState.selectedObjections.join(', ')} included`,
        '[safety] marking outputs: "Illustrative; results vary."',
        '[framework] HVSP-Core structure loaded',
        `[pains] ${appState.selectedPains.slice(0, 3).join(' / ')}`,
        '[value] 3 modules synthesized',
        '[story] India-market narrative layer active',
        `[tone] ${appState.formData.tone} microcopy applied`,
        '[pitch] soft next-step copy prepared',
        '[quality] checking India relevance: 92.4%',
        '[captions] optional subtitle track ready',
        '[export] HVSP outline compiled'
    ];

    const logConsole = document.getElementById('log-console');
    let logIndex = 0;

    const logInterval = setInterval(() => {
        if (logIndex < logLines.length && logConsole) {
            const line = document.createElement('div');
            line.className = 'log-line';
            line.textContent = logLines[logIndex];
            logConsole.appendChild(line);
            logConsole.scrollTop = logConsole.scrollHeight;
            logIndex++;
        }
    }, 400);

    // Animate stages
    for (let i = 0; i < stages.length; i++) {
        await animateStage(i, stages[i].duration);
    }

    clearInterval(logInterval);
}

async function animateStage(index, duration) {
    const fill = document.getElementById(`pipeline-fill-${index}`);
    if (!fill) return;

    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
        fill.style.width = `${(i / steps) * 100}%`;
        await sleep(stepDuration);
    }
}

function generateOutline(nicheData) {
    const outlineContent = document.getElementById('outline-content');
    if (!outlineContent) return;

    const pains = appState.selectedPains.length > 0 ? appState.selectedPains : nicheData.pains || [];
    const examples = nicheData.examples || ['Approach 1', 'Approach 2', 'Approach 3'];

    outlineContent.innerHTML = `
        <div class="outline-section-box hook">
            <h4 class="text-lg font-bold mb-2" style="color: #3b82f6;">Hook</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-300">
                <li>Agar ${appState.formData.persona} ho aur ${pains[0] || 'challenges'} face kar rahe ho</li>
                <li>${pains[1] || 'Common struggle'} se pareshan</li>
                <li>Camera-off, slide-based HVSP jo 80/20 balance maintain karta hai</li>
            </ul>
        </div>

        <div class="outline-section-box value">
            <h4 class="text-lg font-bold mb-2" style="color: #10b981;">Value (80%)</h4>
            ${examples.slice(0, 3).map((ex, i) => `
                <div class="mb-3">
                    <h5 class="font-semibold text-slate-200">Module ${i + 1}: ${ex}</h5>
                    <ul class="list-disc list-inside text-sm text-slate-400 ml-4">
                        <li>Kyu kaam karta hai</li>
                        <li>Kaise apply karein</li>
                        <li>Common mistake to avoid</li>
                    </ul>
                </div>
            `).join('')}
        </div>

        <div class="outline-section-box story">
            <h4 class="text-lg font-bold mb-2" style="color: #8b5cf6;">Story</h4>
            <p class="text-slate-300">India-market realities ko dhyan me rakhkar HVSP ko 80/20 balance ke saath banaya gaya. Camera-off presentation, slide-based delivery.</p>
        </div>

        <div class="outline-section-box pitch">
            <h4 class="text-lg font-bold mb-2" style="color: #f59e0b;">Pitch (20%)</h4>
            <p class="text-slate-300">Next step: ${appState.formData.ctaText}. Clear path forward, koi hard sell nahi. (Illustrative; results vary.)</p>
        </div>
    `;

    appState.generatedHVSP = { nicheData, pains, examples };
}

function startSlideTimer() {
    console.log(`[asp] structuring 80/20 value block • ETA: ${appState.slideETA}s (${formatTime(appState.slideETA)})`);

    let elapsed = 0;
    const totalTime = appState.slideETA;

    // Show skeleton slides immediately
    showSkeletonSlides();

    appState.ui.slideTimer = setInterval(() => {
        elapsed++;
        const remaining = totalTime - elapsed;

        console.log(`[asp] weaving narrative framework... ${formatTime(remaining)} remaining`);

        if (elapsed >= totalTime) {
            clearInterval(appState.ui.slideTimer);
            appState.ui.slideTimerComplete = true;
            console.log('[asp] slide structure complete • 12 slides ready for preview');
        }
    }, 1000);
}

function showSkeletonSlides() {
    // This would show a loading state for slides
    // For now, we'll just log it
    console.log('[asp] initializing 16:9 preview grid • 12 placeholder slots');
}

// Slides Generation & Preview
// ============================

function initSlidesHandlers() {
    const btnPreview = document.getElementById('btn-preview-slides');
    if (btnPreview) {
        btnPreview.addEventListener('click', () => {
            generateSlides();
            document.getElementById('outline-section').classList.add('hidden');
            document.getElementById('slides-section').classList.remove('hidden');
        });
    }
}

// Slide Engine Helpers
// ====================

function seedFromInputs() {
    // Deterministic seed from: nicheId + persona + offer + ticket
    const str = `${appState.formData.nicheId || ''}${appState.formData.persona || ''}${appState.formData.offerName || ''}${appState.formData.ticket || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function seededRandom(seed) {
    // Simple seeded random generator
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function humanize(text, seedOffset = 0) {
    // Add micro-imperfections: vary bullets, em-dashes, ellipsis
    const seed = appState.slideSeed + seedOffset;
    const rand = seededRandom(seed);

    const variations = [
        text,
        text.replace(/\.$/, '…'),
        text.replace(/ - /, ' — '),
        text.replace(/:/g, ' —'),
        text + '.',
        text.replace(/\./g, '')
    ];

    return variations[Math.floor(rand * variations.length)];
}

function getLayoutForSlide(slideNum, seed) {
    // Deterministic layout assignment
    const layouts = ['TITLE', 'BULLETS', 'TWOCOL', 'DIAGRAM', 'PROOF', 'CTA'];
    const rand = seededRandom(seed + slideNum);

    if (slideNum === 1) return 'TITLE';
    if (slideNum === appState.formData.slideLength) return 'CTA';
    if (slideNum === 4) return 'PROOF';
    if (slideNum === 6 || slideNum === 8) return 'DIAGRAM';

    return rand < 0.5 ? 'BULLETS' : 'TWOCOL';
}

function getSlideTime(slideNum, seed) {
    // Random time per slide: 40-120 seconds
    const rand = seededRandom(seed + slideNum * 100);
    return Math.floor(40 + rand * 80);
}

function getBuildDots(slideNum, seed) {
    // 1-3 build dots per slide
    const rand = seededRandom(seed + slideNum * 200);
    return Math.floor(1 + rand * 3);
}

function getProvenance(slideNum, seed) {
    // Fake provenance: "src: pains.csv#12, examples#3"
    const rand1 = seededRandom(seed + slideNum * 300);
    const rand2 = seededRandom(seed + slideNum * 400);
    const sources = ['pains.csv', 'examples', 'objections', 'frameworks'];
    const src = sources[Math.floor(rand1 * sources.length)];
    const num = Math.floor(rand2 * 50) + 1;
    return `src: ${src}#${num}`;
}

function generateSlides() {
    // Use new realistic slide engine
    const slides = buildRealisticSlides(appState);
    appState.generatedSlides = slides;
    console.log(`[asp] rendered ${slides.length} realistic slides • seed=${appState.slideSeed} • layouts: TITLE/BULLETS/DIAGRAM/PROOF/CTA`);
    renderSlidesGrid(slides);
}

function renderSlidesGrid(slides) {
    const grid = document.getElementById('slides-grid');
    if (!grid) return;

    // Render using new engine with 16:9 thumbs
    grid.innerHTML = slides.map(slide => renderSlideThumb(slide, appState.preview.logoURL)).join('');

    // Attach event listeners
    attachSlideListeners();
}

// Output Options
// ==============

function initOutputOptionsHandlers() {
    // Voice mode selection
    document.querySelectorAll('input[name="voice"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.outputOptions.voiceMode = e.target.value;
            updateVoiceUploadUI();
        });
    });

    // Voice file upload
    const voiceUpload = document.getElementById('voice-upload');
    const btnVoiceUpload = document.getElementById('btn-voice-upload');

    if (voiceUpload && btnVoiceUpload) {
        btnVoiceUpload.addEventListener('click', () => voiceUpload.click());
        voiceUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                appState.outputOptions.voiceFile = e.target.files[0];
                showToast(`Voice file selected: ${e.target.files[0].name}`);
            }
        });
    }

    // Avatar toggle
    const avatarToggle = document.getElementById('avatar-toggle');
    if (avatarToggle) {
        avatarToggle.addEventListener('change', (e) => {
            appState.outputOptions.avatarEnabled = e.target.checked;
            updateAvatarUI();
        });
    }

    // Avatar file upload
    const avatarUpload = document.getElementById('avatar-upload');
    const btnAvatarUpload = document.getElementById('btn-avatar-upload');

    if (avatarUpload && btnAvatarUpload) {
        btnAvatarUpload.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                appState.outputOptions.avatarFile = file;

                // File size warning at 50MB
                if (file.size > 50 * 1024 * 1024) {
                    showToast('Warning: File size > 50MB. This may take longer to process.', 5000);
                }

                // Create Object URL for preview
                if (appState.preview.avatarURL) {
                    URL.revokeObjectURL(appState.preview.avatarURL);
                }
                appState.preview.avatarURL = URL.createObjectURL(file);

                // Start fake upload progress
                fakeUploadProgress(file);
            }
        });
    }

    // PIP position
    const pipPosition = document.getElementById('pip-position');
    if (pipPosition) {
        pipPosition.addEventListener('change', (e) => {
            appState.outputOptions.pipPosition = e.target.value;
        });
    }
}

function updateVoiceUploadUI() {
    const btn = document.getElementById('btn-voice-upload');
    const caption = document.getElementById('voice-upload-caption');
    const showUpload = appState.outputOptions.voiceMode !== 'tts';

    if (btn) {
        btn.classList.toggle('hidden', !showUpload);
    }
    if (caption) {
        caption.classList.toggle('hidden', !showUpload);
    }
}

function updateAvatarUI() {
    const options = document.getElementById('avatar-options');
    if (options) {
        options.classList.toggle('hidden', !appState.outputOptions.avatarEnabled);
    }
}

function fakeUploadProgress(file) {
    // Simulate upload progress: 80-140 seconds
    const duration = 80000 + Math.random() * 60000; // 80-140s in ms
    const startTime = performance.now();
    appState.ui.uploadProgress = 0;

    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        appState.ui.uploadProgress = progress;

        console.log(`[upload] ${file.name} • progress: ${progress.toFixed(1)}%`);

        if (progress < 100) {
            requestAnimationFrame(animate);
        } else {
            console.log(`[upload] ${file.name} • complete • ready for render`);
            showToast(`${file.name} uploaded successfully`);
        }
    };

    requestAnimationFrame(animate);
}

// Video Rendering
// ===============

function initRenderHandlers() {
    const btnRender = document.getElementById('btn-render');
    if (btnRender) {
        btnRender.addEventListener('click', startRender);
    }
}

function calculateETA() {
    // Base: 9:30 (570 seconds)
    let eta = 570;

    // Add jitter: 0-180s
    eta += Math.floor(Math.random() * 181);

    // +60s if avatar enabled with HeyGen (no file uploaded)
    if (appState.outputOptions.avatarEnabled && !appState.outputOptions.avatarFile) {
        eta += 60;
    }

    // +45s if TTS (ElevenLabs)
    if (appState.outputOptions.voiceMode === 'tts') {
        eta += 45;
    }

    // +30s if slides > 12
    if (appState.generatedSlides.length > 12) {
        eta += 30;
    }

    // Ensure minimum 10:00 (600 seconds)
    eta = Math.max(eta, 600);

    return eta;
}

async function startRender() {
    // Hide slides section, show renderer
    document.getElementById('slides-section').classList.add('hidden');
    document.getElementById('renderer-section').classList.remove('hidden');

    // Calculate ETA
    appState.renderETA = calculateETA();
    const etaLabel = document.getElementById('eta-label');
    if (etaLabel) {
        etaLabel.textContent = formatTime(appState.renderETA);
    }

    // Setup stages
    const stagesList = [
        'Preparing assets & matching niche data',
        'Building slides timeline (12 scenes)',
        getVoiceStageText(),
        getAvatarStageText(),
        'Merging slides + avatar PIP + audio',
        'Encoding H.264 (mp4)',
        'Finalizing & saving'
    ];

    const stagesContainer = document.getElementById('render-stages');
    if (stagesContainer) {
        stagesContainer.innerHTML = stagesList.map((text, i) => `
            <div class="render-stage" id="stage-${i}">
                <img src="assets/icon_spinner.svg" class="render-stage-icon animate-spin" id="stage-icon-${i}">
                <div class="render-stage-text">${text}</div>
            </div>
        `).join('');
    }

    // Start countdown and progress
    await runRenderSimulation();

    // Show result
    showVideoReady();
}

function getVoiceStageText() {
    const mode = appState.outputOptions.voiceMode;
    if (mode === 'upload') return 'Using uploaded voice';
    if (mode === 'extract') return 'Extracting voice from uploaded video';
    return 'Generating TTS (ElevenLabs)';
}

function getAvatarStageText() {
    if (!appState.outputOptions.avatarEnabled) return 'Skipping avatar (camera-off)';
    if (appState.outputOptions.avatarFile) return 'Using uploaded avatar video (PIP)';
    return 'Generating avatar (HeyGen)';
}

async function runRenderSimulation() {
    const totalTime = appState.renderETA;
    let elapsed = 0;

    const countdownLabel = document.getElementById('countdown-label');
    const progressPercent = document.getElementById('progress-percent');
    const progressBar = document.getElementById('render-progress');
    const logContainer = document.getElementById('render-log');

    // Generate logs
    const logs = generateRenderLogs();
    const logInterval = totalTime / logs.length;
    let logIndex = 0;
    let gateWarningShown = false;

    // Update every second
    appState.ui.renderTimer = setInterval(() => {
        elapsed++;
        const remaining = totalTime - elapsed;
        let progress = (elapsed / totalTime) * 100;

        // Apply gating: cap at 60% until slides complete
        if (!appState.ui.slideTimerComplete && progress > (appState.ui.gatedMax * 100)) {
            progress = appState.ui.gatedMax * 100;

            if (!gateWarningShown) {
                console.log(`[render] progress gated at ${Math.floor(progress)}% • waiting for slides to complete`);
                gateWarningShown = true;
            }
        }

        // Update UI
        if (countdownLabel) countdownLabel.textContent = formatTime(remaining);
        if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}%`;
        if (progressBar) progressBar.style.width = `${progress}%`;

        // Add log line
        if (logContainer && logIndex < logs.length && elapsed % Math.ceil(logInterval) === 0) {
            const line = document.createElement('div');
            line.className = 'log-line';
            line.textContent = logs[logIndex];
            logContainer.appendChild(line);
            logContainer.scrollTop = logContainer.scrollHeight;
            logIndex++;
        }

        // Update stages
        updateRenderStages(progress);

        // Complete
        if (elapsed >= totalTime) {
            clearInterval(appState.ui.renderTimer);
            if (countdownLabel) countdownLabel.textContent = '00:00';
            if (progressPercent) progressPercent.textContent = '100%';
            if (progressBar) progressBar.style.width = '100%';
            completeAllStages();
        }
    }, 1000);

    // Wait for completion
    await sleep(totalTime * 1000);
}

function updateRenderStages(progress) {
    const stages = [0, 15, 35, 55, 70, 85, 95];
    stages.forEach((threshold, i) => {
        const stage = document.getElementById(`stage-${i}`);
        const icon = document.getElementById(`stage-icon-${i}`);

        if (stage && icon && progress >= threshold) {
            if (!stage.classList.contains('complete')) {
                icon.src = 'assets/icon_check.svg';
                icon.classList.remove('animate-spin');
                stage.classList.add('complete');
            }
        } else if (stage && progress >= threshold - 5 && !stage.classList.contains('active')) {
            stage.classList.add('active');
        }
    });
}

function completeAllStages() {
    for (let i = 0; i < 7; i++) {
        const stage = document.getElementById(`stage-${i}`);
        const icon = document.getElementById(`stage-icon-${i}`);
        if (stage && icon) {
            icon.src = 'assets/icon_check.svg';
            icon.classList.remove('animate-spin');
            stage.classList.add('complete');
        }
    }
}

function generateRenderLogs() {
    const mode = appState.outputOptions.voiceMode;
    const avatar = appState.outputOptions.avatarEnabled;
    const avatarFile = appState.outputOptions.avatarFile;
    const voiceFile = appState.outputOptions.voiceFile;

    const logs = [
        '[init] render pipeline started',
        `[config] slides=${appState.generatedSlides.length} • voice=${mode} • avatar=${avatar}`,
        '[assets] loading slide templates',
        `[niche] matching data for ${appState.formData.nicheId || 'custom'}`
    ];

    // Local file handling
    if (avatarFile || voiceFile) {
        logs.push('[local] using local files • stays on your device');
        if (avatarFile) {
            logs.push(`[local] avatar file: ${avatarFile.name} (${(avatarFile.size / (1024 * 1024)).toFixed(1)}MB)`);
        }
        if (voiceFile) {
            logs.push(`[local] voice file: ${voiceFile.name} (${(voiceFile.size / (1024 * 1024)).toFixed(1)}MB)`);
        }
    }

    if (mode === 'tts') {
        logs.push('[tts] ElevenLabs sim: en-IN neutral • 16kHz • 0.25 jitter');
        logs.push('[tts] generating voice track • duration: 8m 34s');
    } else if (mode === 'upload') {
        logs.push('[voice] using uploaded audio file');
        logs.push('[voice] normalizing levels • 16kHz conversion');
    } else {
        logs.push('[voice] extracting from uploaded video');
        logs.push('[voice] audio track isolated • cleanup applied');
    }

    if (avatar) {
        if (avatarFile) {
            logs.push(`[avatar] using uploaded video • PIP @ ${appState.outputOptions.pipPosition}`);
            logs.push('[avatar] scaling to 240x240 • overlay prepared');
            logs.push('[avatar] local file processing • no API calls');
        } else {
            logs.push('[avatar] HeyGen sim: generating avatar • PIP mode');
            logs.push(`[avatar] positioning @ ${appState.outputOptions.pipPosition}`);
        }
    }

    // Gating awareness
    if (!appState.ui.slideTimerComplete) {
        logs.push('[gating] render will wait at 60% for slides to complete');
    }

    logs.push('[timeline] building 12 scenes • transitions added');
    logs.push('[slides] slide_01 → slide_12 compiled');
    logs.push('[captions] SRT track injected (optional)');
    logs.push('[mux] merging video + audio + PIP layers');
    logs.push('[encode] h264 yuv420p • crf=21 • preset=veryfast');
    logs.push('[optimize] filesize check: 42.3 MB');
    logs.push('[metadata] title, tags, timestamp embedded');
    logs.push('[validate] playback compatibility check');
    logs.push('[save] path prepared • file written');
    logs.push('[complete] HVSP video ready for download');

    return logs;
}

function showVideoReady() {
    // Hide renderer, show result
    document.getElementById('renderer-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');

    // Setup video player
    const video = document.getElementById('result-video');
    if (video) {
        // Try to use the actual file if it exists
        fetch('assets/hvsp_ready.mp4', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    video.src = 'assets/hvsp_ready.mp4';
                }
            })
            .catch(() => {
                // If file doesn't exist, create a placeholder blob
                createPlaceholderVideo(video);
            });
    }

    // Generate saved path
    const nicheLabel = appState.generatedHVSP?.nicheData?.label || 'custom';
    const slug = appState.formData.offerName.toLowerCase().replace(/\s+/g, '_').substring(0, 20);
    const path = generateSavedPath(nicheLabel, slug);

    const pathEl = document.getElementById('saved-path');
    if (pathEl) pathEl.textContent = path;

    showToast('Video ready!');
}

function createPlaceholderVideo(videoElement) {
    // Create a minimal video blob (1x1 pixel, 1 frame)
    // This is a fallback if hvsp_ready.mp4 doesn't exist
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Draw a simple gradient
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, '#DC2626');
    gradient.addColorStop(1, '#0B0F1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ScaleEdge HVSP Video Ready', 960, 540);

    canvas.toBlob(blob => {
        if (blob) {
            videoElement.src = URL.createObjectURL(blob);
        }
    });
}

// Result Actions
// ==============

function initResultHandlers() {
    const btnDownload = document.getElementById('btn-download');
    const btnCopyPath = document.getElementById('btn-copy-path');

    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const video = document.getElementById('result-video');
            if (video && video.src) {
                const link = document.createElement('a');
                link.href = video.src;
                link.download = 'HVSP_Video.mp4';
                link.click();
                showToast('Download started');
            }
        });
    }

    if (btnCopyPath) {
        btnCopyPath.addEventListener('click', () => {
            const pathEl = document.getElementById('saved-path');
            if (pathEl) {
                navigator.clipboard.writeText(pathEl.textContent).then(() => {
                    showToast('Path copied to clipboard');
                }).catch(() => {
                    showToast('Failed to copy path');
                });
            }
        });
    }
}

// Knowledge Base Modal
// ====================

function initKnowledgeBaseHandlers() {
    const btnKB = document.getElementById('btn-knowledge-base');
    const closeKB = document.getElementById('close-knowledge');
    const modal = document.getElementById('knowledge-modal');

    if (btnKB) {
        btnKB.addEventListener('click', () => {
            if (modal) modal.classList.remove('hidden');
            renderKnowledgeBaseTree();
        });
    }

    if (closeKB) {
        closeKB.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
        });
    }

    // Close on overlay click
    if (modal) {
        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}

function renderKnowledgeBaseTree() {
    const tree = document.getElementById('kb-tree');
    if (!tree) return;

    const data = appState.knowledgeBase.length > 0 ? appState.knowledgeBase : generateLightweightKB();

    tree.innerHTML = data.map((niche, nicheIdx) => `
        <div class="kb-niche-item" data-niche="${nicheIdx}">
            <span>▸ ${niche.name} (${niche.sizeGB}GB)</span>
        </div>
        <div class="kb-folder hidden" id="kb-niche-${nicheIdx}">
            ${(niche.folders || []).map((folder, folderIdx) => `
                <div class="kb-folder-item" data-niche="${nicheIdx}" data-folder="${folderIdx}">
                    <span>📁 ${folder.name}</span>
                </div>
                <div class="kb-file hidden" id="kb-folder-${nicheIdx}-${folderIdx}">
                    ${(folder.files || []).map((file, fileIdx) => `
                        <div class="kb-file-item" data-niche="${nicheIdx}" data-folder="${folderIdx}" data-file="${fileIdx}">
                            ${file.name} (${file.sizeKB}KB)
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `).join('');

    // Add interaction handlers
    tree.querySelectorAll('.kb-niche-item').forEach(item => {
        item.addEventListener('click', () => toggleNiche(item));
    });

    tree.querySelectorAll('.kb-folder-item').forEach(item => {
        item.addEventListener('click', () => toggleFolder(item));
    });

    tree.querySelectorAll('.kb-file-item').forEach(item => {
        item.addEventListener('click', () => viewFile(item));
    });
}

function toggleNiche(item) {
    const nicheIdx = item.dataset.niche;
    const folder = document.getElementById(`kb-niche-${nicheIdx}`);
    if (folder) {
        folder.classList.toggle('hidden');
        item.classList.toggle('expanded');
        const arrow = item.querySelector('span');
        if (arrow) {
            arrow.textContent = folder.classList.contains('hidden') ?
                `▸ ${arrow.textContent.substring(2)}` :
                `▾ ${arrow.textContent.substring(2)}`;
        }
    }
}

function toggleFolder(item) {
    const nicheIdx = item.dataset.niche;
    const folderIdx = item.dataset.folder;
    const files = document.getElementById(`kb-folder-${nicheIdx}-${folderIdx}`);
    if (files) {
        files.classList.toggle('hidden');
        item.classList.toggle('expanded');
    }
}

function viewFile(item) {
    const nicheIdx = parseInt(item.dataset.niche);
    const folderIdx = parseInt(item.dataset.folder);
    const fileIdx = parseInt(item.dataset.file);

    const data = appState.knowledgeBase.length > 0 ? appState.knowledgeBase : generateLightweightKB();
    const file = data[nicheIdx]?.folders?.[folderIdx]?.files?.[fileIdx];

    if (file) {
        const viewer = document.getElementById('kb-viewer');
        if (viewer) {
            viewer.innerHTML = `
                <div class="code-viewer">
                    <div class="text-slate-400 text-xs mb-2">${file.name} • ${file.sizeKB}KB</div>
                    <pre class="text-slate-300">${file.preview || 'No preview available'}</pre>
                </div>
            `;
        }

        // Highlight active file
        document.querySelectorAll('.kb-file-item').forEach(f => f.classList.remove('active'));
        item.classList.add('active');
    }
}

function generateLightweightKB() {
    // Lightweight fallback if knowledge_base.json doesn't load
    return [
        {
            name: 'B2B Consulting',
            sizeGB: 1.2,
            folders: [
                {
                    name: 'Offer',
                    files: [{name: 'offer.md', sizeKB: 18, preview: '# Offer\nOutcome-focused framing\nStructured delivery'}]
                },
                {
                    name: 'Positioning',
                    files: [{name: 'positioning.md', sizeKB: 25, preview: '# Positioning\nCategory → Vehicle → Proof\nIndia-first approach'}]
                }
            ]
        }
    ];
}

// Modals & UI Interactions
// =========================

function initModalHandlers() {
    // Shortcuts modal
    const btnShortcuts = document.getElementById('btn-shortcuts');
    const closeShortcuts = document.getElementById('close-shortcuts');
    const shortcutsModal = document.getElementById('shortcuts-modal');

    if (btnShortcuts) {
        btnShortcuts.addEventListener('click', () => {
            if (shortcutsModal) shortcutsModal.classList.remove('hidden');
        });
    }

    if (closeShortcuts) {
        closeShortcuts.addEventListener('click', () => {
            if (shortcutsModal) shortcutsModal.classList.add('hidden');
        });
    }

    // Slide modal
    const closeSlide = document.getElementById('close-slide');
    const slideModal = document.getElementById('slide-modal');
    const prevSlide = document.getElementById('prev-slide');
    const nextSlide = document.getElementById('next-slide');

    if (closeSlide) {
        closeSlide.addEventListener('click', () => {
            if (slideModal) slideModal.classList.add('hidden');
        });
    }

    if (prevSlide) {
        prevSlide.addEventListener('click', () => {
            navigateSlideModal(-1);
        });
    }

    if (nextSlide) {
        nextSlide.addEventListener('click', () => {
            navigateSlideModal(1);
        });
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    });
}

// Keyboard Shortcuts
// ==================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing
        if (e.target.matches('input, textarea, select')) return;

        switch(e.key) {
            case '1':
                prefillPreset();
                break;
            case '2':
                if (appState.currentStep === 3) {
                    document.getElementById('btn-generate')?.click();
                }
                break;
            case '3':
                if (!document.getElementById('outline-section')?.classList.contains('hidden')) {
                    document.getElementById('btn-preview-slides')?.click();
                }
                break;
            case '4':
                if (!document.getElementById('slides-section')?.classList.contains('hidden')) {
                    document.getElementById('btn-render')?.click();
                }
                break;
            case 'h':
            case 'H':
                togglePresenterNotes();
                break;
        }
    });
}

function togglePresenterNotes() {
    const slideModal = document.getElementById('slide-modal');
    const notes = document.getElementById('slide-modal-notes');

    if (slideModal && !slideModal.classList.contains('hidden') && notes) {
        appState.presenterNotesVisible = !appState.presenterNotesVisible;
        notes.classList.toggle('hidden', !appState.presenterNotesVisible);
        showToast(appState.presenterNotesVisible ? 'Presenter notes shown' : 'Presenter notes hidden');
    }
}

// Prefill Preset
// ==============

function prefillPreset() {
    // Step 1
    const modelRadio = document.querySelector(`input[name="business_model"][value="${PRESET_DATA.businessModel}"]`);
    if (modelRadio) modelRadio.checked = true;
    appState.formData.businessModel = PRESET_DATA.businessModel;

    // Step 2
    const nicheSelect = document.getElementById('niche-select');
    if (nicheSelect) nicheSelect.value = PRESET_DATA.niche;

    const personaInput = document.getElementById('persona');
    if (personaInput) personaInput.value = PRESET_DATA.persona;

    const ticketInput = document.getElementById('ticket');
    if (ticketInput) ticketInput.value = PRESET_DATA.ticket;

    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.value = PRESET_DATA.language;

    const toneRadio = document.querySelector(`input[name="tone"][value="${PRESET_DATA.tone}"]`);
    if (toneRadio) toneRadio.checked = true;

    // Step 3
    const offerInput = document.getElementById('offer-name');
    if (offerInput) offerInput.value = PRESET_DATA.offerName;

    const promiseInput = document.getElementById('external-promise');
    if (promiseInput) promiseInput.value = PRESET_DATA.externalPromise;

    const winInput = document.getElementById('internal-win');
    if (winInput) winInput.value = PRESET_DATA.internalWin;

    const ctaInput = document.getElementById('cta-text');
    if (ctaInput) ctaInput.value = PRESET_DATA.ctaText;

    // Set selected pains
    appState.selectedPains = [...PRESET_DATA.pains];
    appState.selectedObjections = [...PRESET_DATA.objections];

    // Populate step 3 data
    populateStep3FromNiche(PRESET_DATA.niche);

    // Mark preset pains as selected
    setTimeout(() => {
        PRESET_DATA.pains.forEach(pain => {
            const chip = document.querySelector(`.chip[data-pain="${pain}"]`);
            if (chip) chip.classList.add('chip-selected');
        });
        updateSelectedPainsDisplay();
    }, 100);

    showToast('Preset loaded');
}

// Auto Mode (?demo=1)
// ===================

function initAutoMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
        setTimeout(() => {
            prefillPreset();

            setTimeout(() => {
                document.getElementById('hero')?.classList.add('hidden');
                document.getElementById('stepper-section')?.classList.remove('hidden');
                goToStep(3);

                setTimeout(() => {
                    document.getElementById('btn-generate')?.click();

                    // Auto-continue through steps
                    setTimeout(() => {
                        document.getElementById('btn-preview-slides')?.click();

                        setTimeout(() => {
                            document.getElementById('btn-render')?.click();
                        }, 3000);
                    }, 2000);
                }, 1000);
            }, 600);
        }, 600);
    }
}

// Memory Management & Cleanup
// ============================

function initCleanupHandlers() {
    // Cleanup Object URLs when user leaves or refreshes page
    window.addEventListener('beforeunload', () => {
        if (appState.preview.avatarURL) {
            console.log('[cleanup] revoking Object URL for avatar preview');
            URL.revokeObjectURL(appState.preview.avatarURL);
            appState.preview.avatarURL = null;
        }
    });
}

// Initialization
// ==============

async function init() {
    console.log('[ai-twin] initializing Engine 1: ASP Generator...');

    await loadData();

    initFormHandlers();
    initSlidesHandlers();
    initOutputOptionsHandlers();
    initRenderHandlers();
    initResultHandlers();
    initKnowledgeBaseHandlers();
    initModalHandlers();
    initKeyboardShortcuts();
    initCleanupHandlers();
    initAutoMode();

    console.log('[ai-twin] all systems ready • Engine 1 online');
}

document.addEventListener('DOMContentLoaded', init);
