// ScaleEdge AI Twin Engine - Main Application
// ============================================

// Global State
const appState = {
    currentStep: 1,
    formData: {},
    selectedPains: [],
    selectedObjections: [],
    niches: [],
    frameworks: {},
    testimonials: [],
    knowledgeBase: [],
    generatedHVSP: null,
    generatedSlides: [],
    outputOptions: {
        voiceMode: 'tts', // 'tts' | 'upload' | 'extract'
        voiceFile: null,
        avatarEnabled: false,
        avatarFile: null,
        pipPosition: 'bottom-right'
    },
    renderETA: 0,
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
    offerName: 'Pipeline Accelerator',
    externalPromise: 'predictable pipeline',
    internalWin: 'freedom/time',
    pains: ['No predictable pipeline', 'Long sales cycles', 'Unqualified calls'],
    objections: ['Custom work needed', 'Budget concerns', 'Timeline unclear'],
    ctaText: 'Book clarity call'
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
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const offerName = document.getElementById('offer-name')?.value;
            const externalPromise = document.getElementById('external-promise')?.value;

            if (!offerName || !externalPromise) {
                showToast('Please fill in required fields');
                return;
            }

            appState.formData.offerName = offerName;
            appState.formData.externalPromise = externalPromise;
            appState.formData.internalWin = document.getElementById('internal-win')?.value || '';
            appState.formData.pains = appState.selectedPains;
            appState.formData.objections = appState.selectedObjections;
            appState.formData.ctaText = document.getElementById('cta-text')?.value || 'Book call';

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

function generateSlides() {
    const { nicheData, pains, examples } = appState.generatedHVSP;

    const slides = [
        {
            num: 1,
            title: `${appState.formData.offerName} — HVSP (India-First)`,
            content: ['Camera-off, slide-based', '80% value / 20% pitch', 'India market tuned'],
            notes: 'Title slide. Emphasize HVSP format and India-first approach.'
        },
        {
            num: 2,
            title: 'Agar yeh pains familiar lage…',
            content: pains.slice(0, 3),
            notes: 'Address top pains directly. Make it relatable.'
        },
        {
            num: 3,
            title: 'Problem approach ki hai, effort ki nahi',
            content: ['Structure chahiye', 'Balance chahiye', 'India-market psychology'],
            notes: 'Reframe: not about working harder, but smarter.'
        },
        {
            num: 4,
            title: 'Real Results',
            content: appState.testimonials.slice(0, 3).map(t => `${t.name}: ${t.blurb}`),
            notes: 'Proof tiles. Note: Illustrative; results vary.'
        },
        ...examples.slice(0, 3).map((ex, i) => ({
            num: 5 + i,
            title: `Step ${i + 1}: ${ex}`,
            content: ['Kyu kaam karta hai', 'Kaise apply karein', 'Common mistake'],
            notes: `Value module ${i + 1}. Provide actionable framework.`
        })),
        {
            num: 8,
            title: 'System Overview',
            content: ['[Visual: Simple diagram]', 'Structured approach', 'India-first methodology'],
            notes: 'Show system architecture at high level.'
        },
        {
            num: 9,
            title: 'Generic AI ≠ Our Approach',
            content: [
                'Structure: HVSP-Core framework',
                'Balance: 80/20 for India market',
                'Data: Multi-niche internal dataset'
            ],
            notes: 'Critical differentiation. Explain why this is different.'
        },
        {
            num: 10,
            title: 'Qualification & Fit',
            content: ['Mutual fit check', 'Clear yes/no path', 'No pressure approach'],
            notes: 'Establish selectivity. Not selling to everyone.'
        },
        {
            num: 11,
            title: `Next Step: ${appState.formData.ctaText}`,
            content: ['Clear next action', 'Neutral framing', 'No hard sell'],
            notes: 'CTA slide. Keep it low-pressure and clear.'
        },
        {
            num: 12,
            title: 'Recap & What You\'ll Get',
            content: [`Outcome: ${appState.formData.externalPromise}`, 'Structured delivery', 'India-market focus'],
            notes: 'Final recap. Reinforce key value points.'
        }
    ];

    appState.generatedSlides = slides;
    renderSlidesGrid(slides);
}

function renderSlidesGrid(slides) {
    const grid = document.getElementById('slides-grid');
    if (!grid) return;

    grid.innerHTML = slides.map(slide => `
        <div class="slide-card" data-slide="${slide.num}">
            <div class="slide-number">SLIDE ${slide.num}</div>
            <div class="slide-title">${slide.title}</div>
            <div class="slide-content">
                ${slide.content.slice(0, 2).map(c => `<div>• ${c}</div>`).join('')}
            </div>
        </div>
    `).join('');

    // Add click handlers
    grid.querySelectorAll('.slide-card').forEach(card => {
        card.addEventListener('click', () => {
            const slideNum = parseInt(card.dataset.slide);
            const slide = slides.find(s => s.num === slideNum);
            if (slide) openSlideModal(slide);
        });
    });
}

function openSlideModal(slide) {
    const modal = document.getElementById('slide-modal');
    if (!modal) return;

    const title = document.getElementById('slide-modal-title');
    const content = document.getElementById('slide-modal-content');
    const notes = document.getElementById('slide-notes-content');

    if (title) title.textContent = `Slide ${slide.num}: ${slide.title}`;
    if (content) {
        content.innerHTML = `<div class="space-y-2">${slide.content.map(c => `<p>• ${c}</p>`).join('')}</div>`;
    }
    if (notes) notes.textContent = slide.notes;

    modal.classList.remove('hidden');
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
                appState.outputOptions.avatarFile = e.target.files[0];
                showToast(`Avatar video selected: ${e.target.files[0].name}`);
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
    if (btn) {
        btn.classList.toggle('hidden', appState.outputOptions.voiceMode === 'tts');
    }
}

function updateAvatarUI() {
    const options = document.getElementById('avatar-options');
    if (options) {
        options.classList.toggle('hidden', !appState.outputOptions.avatarEnabled);
    }
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

    // Update every second
    const interval = setInterval(() => {
        elapsed++;
        const remaining = totalTime - elapsed;
        const progress = (elapsed / totalTime) * 100;

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
            clearInterval(interval);
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

    const logs = [
        '[init] render pipeline started',
        `[config] slides=${appState.generatedSlides.length} • voice=${mode} • avatar=${avatar}`,
        '[assets] loading slide templates',
        `[niche] matching data for ${appState.formData.nicheId || 'custom'}`
    ];

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
        } else {
            logs.push('[avatar] HeyGen sim: generating avatar • PIP mode');
            logs.push(`[avatar] positioning @ ${appState.outputOptions.pipPosition}`);
        }
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

    if (closeSlide) {
        closeSlide.addEventListener('click', () => {
            if (slideModal) slideModal.classList.add('hidden');
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

// Initialization
// ==============

async function init() {
    console.log('ScaleEdge AI Twin Engine starting...');

    await loadData();

    initFormHandlers();
    initSlidesHandlers();
    initOutputOptionsHandlers();
    initRenderHandlers();
    initResultHandlers();
    initKnowledgeBaseHandlers();
    initModalHandlers();
    initKeyboardShortcuts();
    initAutoMode();

    console.log('Application ready');
}

document.addEventListener('DOMContentLoaded', init);
