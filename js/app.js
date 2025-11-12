// HVSP AI Twin Engine - Main Application Logic
// ============================================

// Global State
let appState = {
    currentStep: 1,
    formData: {},
    niches: [],
    frameworks: {},
    testimonials: [],
    generatedHVSP: null,
    generatedSlides: []
};

// Demo Preset Data
const DEMO_PRESET = {
    businessModel: 'Consulting',
    niche: 'B2B Growth Consultant',
    customNiche: '',
    targetPersona: 'Founders 5-50 CR ARR',
    ticketValue: '₹1.2L',
    language: 'Hinglish',
    tone: 'Doctor-frame',
    offerName: 'Growth Accelerator Program',
    corePromise: '10L/month predictable pipeline',
    internalOutcome: 'Freedom from daily firefighting',
    topPains: 'Unpredictable pipeline, Long sales cycles, Unqualified demos',
    ctaType: 'GrowthMap (₹499) • refundable screen',
    calendarLink: 'https://cal.example.com/growthmap'
};

// Utility Functions
// =================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(element, text, speed = 30) {
    element.textContent = '';
    for (let char of text) {
        element.textContent += char;
        await sleep(speed);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Data Loading
// ============

async function loadData() {
    try {
        const [nichesRes, frameworksRes, testimonialsRes] = await Promise.all([
            fetch('data/niches.json'),
            fetch('data/frameworks.json'),
            fetch('data/testimonials.json')
        ]);

        appState.niches = await nichesRes.json();
        appState.frameworks = await frameworksRes.json();
        appState.testimonials = await testimonialsRes.json();

        populateNicheDropdown();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data files. Please check console.');
    }
}

function populateNicheDropdown() {
    const dropdown = document.getElementById('nicheDropdown');
    appState.niches.forEach(niche => {
        const option = document.createElement('option');
        option.value = niche.id;
        option.textContent = niche.label;
        dropdown.appendChild(option);
    });
}

// Form & Stepper Logic
// ====================

function initStepperHandlers() {
    // Step 1
    document.getElementById('btnNext1').addEventListener('click', () => {
        const selected = document.querySelector('input[name="businessModel"]:checked');
        if (!selected) {
            showToast('Please select a business model');
            return;
        }
        appState.formData.businessModel = selected.value;
        goToStep(2);
    });

    // Step 2
    document.getElementById('btnBack2').addEventListener('click', () => goToStep(1));
    document.getElementById('btnNext2').addEventListener('click', () => {
        const nicheId = document.getElementById('nicheDropdown').value;
        const customNiche = document.getElementById('customNiche').value;
        const targetPersona = document.getElementById('targetPersona').value;
        const ticketValue = document.getElementById('ticketValue').value;

        if (!nicheId && !customNiche) {
            showToast('Please select or enter a niche');
            return;
        }

        if (!targetPersona) {
            showToast('Please enter target persona');
            return;
        }

        appState.formData.nicheId = nicheId;
        appState.formData.customNiche = customNiche;
        appState.formData.targetPersona = targetPersona;
        appState.formData.ticketValue = ticketValue;
        appState.formData.language = document.getElementById('language').value;
        appState.formData.tone = document.getElementById('tone').value;

        goToStep(3);
    });

    // Step 3
    document.getElementById('btnBack3').addEventListener('click', () => goToStep(2));
    document.getElementById('btnGenerate').addEventListener('click', () => {
        const offerName = document.getElementById('offerName').value;
        const corePromise = document.getElementById('corePromise').value;
        const internalOutcome = document.getElementById('internalOutcome').value;
        const topPains = document.getElementById('topPains').value;

        if (!offerName || !corePromise || !topPains) {
            showToast('Please fill in all required fields');
            return;
        }

        appState.formData.offerName = offerName;
        appState.formData.corePromise = corePromise;
        appState.formData.internalOutcome = internalOutcome;
        appState.formData.topPains = topPains;
        appState.formData.ctaType = document.getElementById('ctaType').value;
        appState.formData.calendarLink = document.getElementById('calendarLink').value;

        generateHVSP();
    });
}

function goToStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));

    // Show target step
    document.getElementById(`step${stepNum}`).classList.remove('hidden');

    // Update progress indicators
    document.querySelectorAll('.step-indicator').forEach((el, idx) => {
        if (idx < stepNum - 1) {
            el.classList.add('active');
            el.querySelector('div').classList.remove('bg-gray-200', 'text-gray-600');
            el.querySelector('div').classList.add('bg-blue-600', 'text-white');
        } else if (idx === stepNum - 1) {
            el.classList.add('active');
            el.querySelector('div').classList.remove('bg-gray-200', 'text-gray-600');
            el.querySelector('div').classList.add('bg-blue-600', 'text-white');
        } else {
            el.classList.remove('active');
            el.querySelector('div').classList.remove('bg-blue-600', 'text-white');
            el.querySelector('div').classList.add('bg-gray-200', 'text-gray-600');
        }
    });

    // Update progress bars
    document.getElementById('progress1').style.width = stepNum >= 2 ? '100%' : '0%';
    document.getElementById('progress2').style.width = stepNum >= 3 ? '100%' : '0%';

    appState.currentStep = stepNum;

    // Scroll to top of stepper
    document.getElementById('stepperCard').scrollIntoView({ behavior: 'smooth' });
}

// HVSP Generation Logic
// =====================

async function generateHVSP() {
    // Hide form, show progress
    document.getElementById('stepperCard').classList.add('hidden');
    document.getElementById('progressSection').classList.remove('hidden');
    document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });

    // Get niche data
    const nicheData = appState.niches.find(n => n.id === appState.formData.nicheId) || {
        id: 'custom',
        label: appState.formData.customNiche || 'Custom Niche',
        pains: appState.formData.topPains.split(',').map(p => p.trim()),
        objections: [],
        examples: ['Strategic approach', 'Implementation framework', 'Metrics tracking']
    };

    // Populate matched data chips
    populateMatchedChips(nicheData);

    // Run pipeline
    await runPipeline(nicheData);

    // Generate HVSP outline
    generateOutline(nicheData);

    // Show outline section
    document.getElementById('hvspOutline').classList.remove('hidden');
    document.getElementById('hvspOutline').scrollIntoView({ behavior: 'smooth' });

    // Show bottom CTA
    document.getElementById('bottomCTA').classList.remove('hidden');
}

function populateMatchedChips(nicheData) {
    const container = document.getElementById('matchedChips');
    const chips = [
        { label: 'Framework: HVSP-Core (Hook/Value/Story/Pitch)', color: 'blue' },
        { label: 'Balance: 80/20', color: 'green' },
        { label: `Linguistics: ${appState.formData.language} (India)`, color: 'purple' },
        { label: `Tone: ${appState.formData.tone}`, color: 'pink' },
        { label: `Cluster hits: ${getRandomInt(8, 15)} assets`, color: 'yellow' },
        { label: 'Source scope: ₹53Cr+ sales / 44+ niches', color: 'indigo' }
    ];

    container.innerHTML = chips.map(chip => `
        <span class="px-3 py-1 bg-${chip.color}-100 text-${chip.color}-700 rounded-full text-xs font-medium border border-${chip.color}-200">
            ${chip.label}
        </span>
    `).join('');
}

async function runPipeline(nicheData) {
    const stages = [
        { name: 'Parsing intake & normalizing…', duration: 1200 },
        { name: 'Framework selection (HVSP-Core + Niche-Adapt)…', duration: 2000 },
        { name: 'Value block synthesis (India market psych)…', duration: 2400 },
        { name: 'Slides layout pass (contrast, clarity)…', duration: 2200 },
        { name: 'Pitch graft (CTA + Doctor-frame)…', duration: 1800 }
    ];

    const pipelineContainer = document.getElementById('pipelineStages');
    pipelineContainer.innerHTML = stages.map((stage, idx) => `
        <div class="pipeline-stage">
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-700">${stage.name}</span>
                <span id="stagePercent${idx}" class="text-xs font-semibold text-blue-600">0%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div id="stageBar${idx}" class="bg-blue-600 h-2 rounded-full transition-all" style="width: 0%"></div>
            </div>
        </div>
    `).join('');

    // Prepare log lines
    const logLines = generateLogLines(nicheData);
    const logContainer = document.getElementById('typingLog');

    let logIdx = 0;
    const logInterval = setInterval(() => {
        if (logIdx < logLines.length) {
            const line = document.createElement('div');
            line.textContent = logLines[logIdx];
            line.className = 'opacity-0 transition-opacity';
            logContainer.appendChild(line);
            setTimeout(() => line.classList.remove('opacity-0'), 10);
            logContainer.scrollTop = logContainer.scrollHeight;
            logIdx++;
        }
    }, 350);

    // Run stages
    for (let i = 0; i < stages.length; i++) {
        await animateStage(i, stages[i].duration);
    }

    clearInterval(logInterval);

    // Add final log
    const finalLine = document.createElement('div');
    finalLine.textContent = '[final] HVSP outline ready • slide deck compiled • video render queued';
    finalLine.className = 'text-green-400 font-bold';
    logContainer.appendChild(finalLine);
}

function generateLogLines(nicheData) {
    const pains = nicheData.pains || [];
    const examples = nicheData.examples || [];

    return [
        `[init] session_start • timestamp=${new Date().toISOString()}`,
        `[match] niche=${nicheData.id} • language=${appState.formData.language} • tone=${appState.formData.tone}`,
        `[cluster] ${getRandomInt(8, 15)} assets matched from ${nicheData.label} pool`,
        `[apply] balance=80/20 • pitch=${appState.formData.ctaType}`,
        `[linguistics] ${appState.formData.language} mode • India-market psychology layer active`,
        `[framework] HVSP-Core selected • Hook/Value/Story/Pitch structure`,
        `[proof] attaching ${appState.testimonials.length} micro-tiles • disclaimer on`,
        `[pains] identified: ${pains.slice(0, 3).join(' / ')}`,
        `[value] synthesizing 3 modules from ${examples.join(', ')}`,
        `[slides] generating 12 frames • optimizing contrast/legibility`,
        `[tone] ${appState.formData.tone} microcopy injected`,
        `[cta] doc-frame copy injected • refund note added`,
        `[story] personal angle: ${nicheData.label} journey`,
        `[objections] pre-handled: pricing, timeline, fit`,
        `[quality] checking India-market relevance score: 94.2%`,
        `[export] preparing slide deck assets • video render queue`
    ];
}

async function animateStage(idx, duration) {
    const bar = document.getElementById(`stageBar${idx}`);
    const percent = document.getElementById(`stagePercent${idx}`);

    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
        const progress = (i / steps) * 100;
        bar.style.width = `${progress}%`;
        percent.textContent = `${Math.round(progress)}%`;
        await sleep(stepDuration);
    }
}

function generateOutline(nicheData) {
    const framework = appState.frameworks.hvsp_core;
    const pains = nicheData.pains || appState.formData.topPains.split(',').map(p => p.trim());
    const examples = nicheData.examples || ['Strategic approach', 'Implementation framework', 'Results tracking'];

    // Hook
    const hookContent = document.getElementById('hookContent');
    hookContent.innerHTML = `
        <p class="font-semibold">Agar aap ${nicheData.label} ho aur yeh challenges face kar rahe ho:</p>
        <ul class="list-disc list-inside space-y-1 ml-4">
            ${pains.slice(0, 3).map(pain => `<li>${pain}</li>`).join('')}
        </ul>
        <p class="mt-2">Camera-off, slide-based HVSP jo India market ke liye tuned hai — 80/20 value-pitch balance.</p>
    `;

    // Value
    const valueContent = document.getElementById('valueContent');
    valueContent.innerHTML = examples.slice(0, 3).map((example, idx) => `
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h5 class="font-bold text-green-800 mb-2">Module ${idx + 1}: ${example}</h5>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Kyu kaam karta hai (psychology + India market context)</li>
                <li>Kaise apply karein (actionable framework)</li>
                <li>Common mistake jo avoid karna hai</li>
            </ul>
        </div>
    `).join('');

    // Story
    const storyContent = document.getElementById('storyContent');
    storyContent.innerHTML = `
        <p>Main bhi ${nicheData.label.toLowerCase()} ki tarah <strong>${pains[0] || 'challenges'}</strong> se guzra hoon — issi liye HVSP ko India ke liye 80/20 balance ke saath banaya. Camera-off presentation, slide-based delivery, aur high-value conversion focus. Yeh system ₹53Cr+ sales data se trained hai across 44+ niches.</p>
    `;

    // Pitch
    const pitchContent = document.getElementById('pitchContent');
    pitchContent.innerHTML = `
        <p class="font-semibold mb-2">Next step simple hai — ${appState.formData.ctaType}</p>
        <p class="text-sm">60-min deep-dive session jahaan hum <strong>${appState.formData.corePromise}</strong> ka roadmap banate hain aur fit check karte hain.</p>
        <p class="mt-2 text-sm"><strong>Doctor-frame:</strong> Hum pehle screen karte hain — fit hue to aage chalte hain, warna clear path batate hain. No hard sell.</p>
        <div class="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p class="text-sm font-semibold text-orange-800">Bonus on call:</p>
            <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
                <li>Templates & frameworks</li>
                <li>AI Agents System overview</li>
                <li>Custom roadmap to ${appState.formData.corePromise}</li>
            </ul>
        </div>
    `;

    // Store for slides
    appState.generatedHVSP = {
        nicheData,
        pains,
        examples
    };
}

// Slides Generation
// =================

function initSlidesHandler() {
    document.getElementById('btnPreviewSlides').addEventListener('click', () => {
        generateSlides();
        document.getElementById('slidesPreview').classList.remove('hidden');
        document.getElementById('slidesPreview').scrollIntoView({ behavior: 'smooth' });
    });
}

function generateSlides() {
    const { nicheData, pains, examples } = appState.generatedHVSP;
    const slides = [];

    // Slide 1: Title
    slides.push({
        num: 1,
        title: `${appState.formData.offerName} — ${nicheData.label} ke liye HVSP`,
        content: ['Camera-off • Slide-based', '80/20 value-pitch', 'India-first AI Engine'],
        notes: 'Start with offer name and positioning. Emphasize camera-off, slide-based format.'
    });

    // Slide 2: Pain
    slides.push({
        num: 2,
        title: 'Agar yeh problems familiar lage…',
        content: pains.slice(0, 3),
        notes: 'Address top 3 pains directly. Make it relatable and specific to niche.'
    });

    // Slide 3: Reframe
    slides.push({
        num: 3,
        title: 'Problem yeh nahi ki aap koshish nahi kar rahe…',
        content: ['Structure, balance, aur India-market psychology ki zaroorat hai.', 'Generic AI ≠ Our Engine'],
        notes: 'Reframe the problem. It\'s not about effort, it\'s about approach.'
    });

    // Slide 4: Proof
    slides.push({
        num: 4,
        title: 'Real Results (Illustrative; results vary)',
        content: appState.testimonials.slice(0, 3).map(t => `${t.name}: ${t.blurb}`),
        notes: 'Show proof but ALWAYS include disclaimer. These are examples, not guarantees.'
    });

    // Slides 5-7: Value Modules
    examples.slice(0, 3).forEach((example, idx) => {
        slides.push({
            num: 5 + idx,
            title: `Module ${idx + 1}: ${example}`,
            content: [
                'Kyu kaam karta hai (psychology + India context)',
                'Kaise apply karein (actionable framework)',
                'Common mistake jo avoid karna hai'
            ],
            notes: `Deep dive into ${example}. Provide actionable value, not just theory.`
        });
    });

    // Slide 8: Diagram
    slides.push({
        num: 8,
        title: 'AI Agents Funnel — System Overview',
        content: ['[Visual: Funnel diagram with 9 AI Agents]', 'Lead → Qualify → Nurture → Convert → Deliver', 'Up to 90% automation'],
        notes: 'Show the system architecture. Visual representation of AI Agents Funnel.'
    });

    // Slide 9: Differentiation
    slides.push({
        num: 9,
        title: 'Generic AI ≠ Our Engine',
        content: [
            'Structure: HVSP-Core framework (Hook/Value/Story/Pitch)',
            'Balance: 80/20 optimized for India market trust-building',
            'Data: Trained on ₹53Cr+ sales across 44+ niches'
        ],
        notes: 'Critical differentiation slide. Explain why our engine is different from ChatGPT.'
    });

    // Slide 10: Doctor Frame
    slides.push({
        num: 10,
        title: 'Doctor-frame • Accept/Reject',
        content: [
            'Hum pehle screen karte hain',
            'Fit hue to aage, warna clear path',
            'No hard sell — mutual decision'
        ],
        notes: 'Establish authority and selectivity. We choose clients, not just sell to anyone.'
    });

    // Slide 11: CTA
    slides.push({
        num: 11,
        title: `${appState.formData.ctaType}`,
        content: [
            'Deep-dive roadmap session (60 min)',
            'Deposit screens for seriousness',
            'Bonus: templates & frameworks on call',
            appState.formData.calendarLink
        ],
        notes: 'Clear CTA with deposit barrier. Emphasize refundable and screening purpose.'
    });

    // Slide 12: Final
    slides.push({
        num: 12,
        title: 'Not a course — 3-Month Consulting + 9 AI Agents System',
        content: [
            'Up to 90% automation',
            'Done-with-you implementation',
            'India-first, high-ticket focused'
        ],
        notes: 'Final positioning. Emphasize it\'s consulting, not a course. Implementation support.'
    });

    appState.generatedSlides = slides;
    renderSlidesGrid(slides);
}

function renderSlidesGrid(slides) {
    const grid = document.getElementById('slidesGrid');
    grid.innerHTML = slides.map(slide => `
        <div class="slide-card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" data-slide="${slide.num}">
            <div class="text-xs font-bold text-gray-500 mb-2">SLIDE ${slide.num}</div>
            <h4 class="font-bold text-sm mb-3 text-gray-900 line-clamp-2">${slide.title}</h4>
            <div class="text-xs text-gray-600 space-y-1">
                ${slide.content.slice(0, 3).map(c => `<div class="line-clamp-1">• ${c}</div>`).join('')}
            </div>
            <div class="mt-3 pt-3 border-t border-gray-300">
                <p class="text-xs text-gray-500 italic">Illustrative; results vary.</p>
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.slide-card').forEach(card => {
        card.addEventListener('click', () => {
            const slideNum = parseInt(card.dataset.slide);
            openSlideModal(slides.find(s => s.num === slideNum));
        });
    });
}

function openSlideModal(slide) {
    const modal = document.getElementById('slideModal');
    document.getElementById('modalSlideTitle').textContent = `Slide ${slide.num}: ${slide.title}`;
    document.getElementById('modalSlideContent').innerHTML = `
        <div class="space-y-2">
            ${slide.content.map(c => `<p class="text-gray-700">• ${c}</p>`).join('')}
        </div>
    `;
    document.getElementById('modalSlideNotes').textContent = slide.notes;
    modal.classList.remove('hidden');
}

// Video Rendering
// ===============

function initVideoHandler() {
    document.getElementById('btnRenderVideo').addEventListener('click', async () => {
        document.getElementById('videoRenderer').classList.remove('hidden');
        document.getElementById('videoRenderer').scrollIntoView({ behavior: 'smooth' });
        await renderVideo();
    });
}

async function renderVideo() {
    const renderBar = document.getElementById('renderBar');
    const renderStatus = document.getElementById('renderStatus');
    const renderLogs = document.getElementById('renderLogs');

    const stages = [
        'Compiling slides into frames…',
        'Generating narration template…',
        'Applying transitions & animations…',
        'Rendering captions (India-market style)…',
        'Muxing audio tracks (optional)…',
        'Final packaging & optimization…',
        'Quality check: contrast, legibility…',
        'Exporting video file…'
    ];

    renderLogs.innerHTML = '';

    for (let i = 0; i < stages.length; i++) {
        renderStatus.textContent = stages[i];
        const log = document.createElement('div');
        log.textContent = `[${new Date().toLocaleTimeString()}] ${stages[i]}`;
        renderLogs.appendChild(log);

        const progress = ((i + 1) / stages.length) * 100;
        renderBar.style.width = `${progress}%`;

        await sleep(getRandomInt(800, 1400));
    }

    renderStatus.textContent = 'Video ready! 🎉';
    await sleep(500);

    // Show video card
    document.getElementById('renderProgress').classList.add('hidden');
    document.getElementById('videoCard').classList.remove('hidden');

    // Add confetti effect (optional)
    showToast('🎉 Video rendered successfully!');
}

// Modal & Interaction Handlers
// =============================

function initModalHandlers() {
    // Slide modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('slideModal').classList.add('hidden');
    });

    document.getElementById('slideModal').addEventListener('click', (e) => {
        if (e.target.id === 'slideModal') {
            document.getElementById('slideModal').classList.add('hidden');
        }
    });

    // GrowthMap modal
    document.getElementById('btnBookGrowthMap').addEventListener('click', () => {
        document.getElementById('growthMapModal').classList.remove('hidden');
        document.getElementById('growthMapCalendar').value = appState.formData.calendarLink || 'https://cal.example.com/growthmap';
    });

    document.getElementById('closeGrowthMapModal').addEventListener('click', () => {
        document.getElementById('growthMapModal').classList.add('hidden');
    });

    // Presenter notes
    document.getElementById('closeNotes').addEventListener('click', () => {
        document.getElementById('presenterNotes').classList.add('hidden');
    });

    // Video interactions
    document.getElementById('playOverlay')?.addEventListener('click', () => {
        const video = document.getElementById('renderedVideo');
        if (video) {
            video.play();
            document.getElementById('playOverlay').style.display = 'none';
        }
    });

    document.getElementById('btnDownloadVideo')?.addEventListener('click', () => {
        // In real implementation, this would trigger download
        showToast('Downloading HVSP_Ready.mp4...');
        // Simulate download
        const link = document.createElement('a');
        link.href = 'assets/hvsp_ready.mp4';
        link.download = 'HVSP_Ready.mp4';
        link.click();
    });

    document.getElementById('btnCopyLink')?.addEventListener('click', () => {
        // Copy placeholder link
        navigator.clipboard.writeText(window.location.href + '#video-ready').then(() => {
            showToast('Link copied to clipboard!');
        });
    });
}

// Demo Mode & Keyboard Shortcuts
// ===============================

function initDemoMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1') {
        setTimeout(() => {
            prefillDemoPreset();
            setTimeout(() => {
                goToStep(3);
                setTimeout(() => {
                    document.getElementById('btnGenerate').click();
                }, 1000);
            }, 600);
        }, 600);
    }
}

function prefillDemoPreset() {
    // Business model
    document.querySelector(`input[name="businessModel"][value="${DEMO_PRESET.businessModel}"]`).checked = true;

    // Niche
    const nicheOption = Array.from(document.getElementById('nicheDropdown').options)
        .find(opt => opt.textContent === DEMO_PRESET.niche);
    if (nicheOption) {
        document.getElementById('nicheDropdown').value = nicheOption.value;
    }

    document.getElementById('customNiche').value = DEMO_PRESET.customNiche;
    document.getElementById('targetPersona').value = DEMO_PRESET.targetPersona;
    document.getElementById('ticketValue').value = DEMO_PRESET.ticketValue;
    document.getElementById('language').value = DEMO_PRESET.language;
    document.getElementById('tone').value = DEMO_PRESET.tone;

    // Business specifics
    document.getElementById('offerName').value = DEMO_PRESET.offerName;
    document.getElementById('corePromise').value = DEMO_PRESET.corePromise;
    document.getElementById('internalOutcome').value = DEMO_PRESET.internalOutcome;
    document.getElementById('topPains').value = DEMO_PRESET.topPains;
    document.getElementById('ctaType').value = DEMO_PRESET.ctaType;
    document.getElementById('calendarLink').value = DEMO_PRESET.calendarLink;

    // Update form data
    appState.formData = { ...DEMO_PRESET };

    showToast('Demo preset loaded!');
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        switch (e.key) {
            case '1':
                prefillDemoPreset();
                break;
            case '2':
                if (appState.currentStep === 3) {
                    document.getElementById('btnGenerate').click();
                }
                break;
            case '3':
                if (document.getElementById('hvspOutline').classList.contains('hidden') === false) {
                    document.getElementById('btnPreviewSlides').click();
                }
                break;
            case '4':
                if (document.getElementById('slidesPreview').classList.contains('hidden') === false) {
                    document.getElementById('btnRenderVideo').click();
                }
                break;
            case 'h':
            case 'H':
                const notes = document.getElementById('presenterNotes');
                notes.classList.toggle('hidden');
                break;
        }
    });
}

// Hero Button Handlers
// ====================

function initHeroHandlers() {
    document.getElementById('btnStartDemo').addEventListener('click', () => {
        document.getElementById('stepperCard').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnDemoPreset').addEventListener('click', () => {
        prefillDemoPreset();
        goToStep(1);
        document.getElementById('stepperCard').scrollIntoView({ behavior: 'smooth' });
    });
}

// Initialization
// ==============

async function init() {
    console.log('🚀 HVSP AI Twin Engine initializing...');

    await loadData();

    initStepperHandlers();
    initSlidesHandler();
    initVideoHandler();
    initModalHandlers();
    initKeyboardShortcuts();
    initHeroHandlers();
    initDemoMode();

    console.log('✅ Application ready!');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
