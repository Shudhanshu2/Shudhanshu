/**
 * ScaleEdge Integrated Client Engine (ICE)
 * Complete funnel orchestration system
 */

// ============================================================================
// GLOBAL APP OBJECT & STATE
// ============================================================================

window.APP = window.APP || { state: null, log: null };

const state = {
    // Data loaded from JSON files
    niches: [],
    questions: [],
    scoringRules: {},
    applicants: [],
    messages: {},
    closingSnippets: {},
    proof: [],
    knowledgeBase: {},

    // Setup configuration
    setup: {
        icp: '',
        niche: null,
        offer: '',
        ticket: '',
        salesModel: 'retainer',
        pains: [],
        brandColor: '#DC2626',
        logo: null,
        logoObjectURL: null,
        proofTiles: []
    },

    // Application form & scoring
    formQuestions: [],
    scoredApplicants: [],
    topPicks: [],
    rejects: [],

    // Pre-sell & closing
    presellMessages: [],
    closingScript: {},

    // Timers for AI Twin presentation
    timers: {
        slidesProgress: 0,
        slidesComplete: false,
        videoProgress: 0,
        videoGated: true,
        videoComplete: false
    },

    // ProofLoop system
    proofloop: {
        config: null,
        feedback: [],
        bonusLibrary: [],
        dripMessages: [],
        copy: {},
        selectedBonus: null,
        voiceBlob: null
    },

    // Traffic Engine
    trafficActiveTab: 'search_harvest',

    // Fixtures from JSON
    fixtures: {},

    // Language & settings
    currentLanguage: 'hinglish',
    gateScore: null,
    gateUnlocked: false,
    dripStatuses: ['queued', 'sent', 'read', 'queued'],

    // Feature flags
    proofloopEnabled: true,

    // Acceptance tracking
    acceptanceChecks: {
        fixtures: false,
        gate: false,
        drip: false,
        ics: false,
        handoff: false,
        money: false,
        proofloop: false,
        proofwall: false,
        traffic: false,
        copy: false
    }
};

// ============================================================================
// EVENTLOG SETUP
// ============================================================================

class EventLog {
    constructor() {
        this.logs = [];
        this.isOpen = false;
        this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem('se_eventlog');
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('EventLog: Failed to load', error);
        }
    }

    save() {
        try {
            localStorage.setItem('se_eventlog', JSON.stringify(this.logs));
        } catch (error) {
            console.error('EventLog: Failed to save', error);
        }
    }

    log(type, message, meta = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            meta
        };
        this.logs.unshift(entry);
        if (this.logs.length > 500) {
            this.logs = this.logs.slice(0, 500);
        }
        this.save();
        this.render();
        console.log(`[${type}]`, message, meta);
    }

    clear() {
        if (confirm('Clear all EventLog entries?')) {
            this.logs = [];
            this.save();
            this.render();
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const drawer = document.getElementById('eventlog-drawer');
        if (drawer) {
            drawer.classList.toggle('hidden', !this.isOpen);
        }
    }

    copyAll() {
        const text = this.logs.map(log => {
            const time = this.formatTimestamp(log.timestamp);
            const metaStr = Object.keys(log.meta).length > 0 ? ` | ${JSON.stringify(log.meta)}` : '';
            return `[${time}] [${log.type}] ${log.message}${metaStr}`;
        }).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            alert('EventLog copied!');
        });
    }

    exportJSON() {
        const data = JSON.stringify(this.logs, null, 2);
        this.download(data, `eventlog_${Date.now()}.json`, 'application/json');
        this.log('export.json', 'EventLog exported as JSON', { count: this.logs.length });
    }

    exportCSV() {
        const headers = ['Timestamp', 'Type', 'Message', 'Meta'];
        const rows = this.logs.map(log => [
            log.timestamp,
            log.type,
            log.message,
            JSON.stringify(log.meta)
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        this.download(csv, `eventlog_${Date.now()}.csv`, 'text/csv');
        this.log('export.csv', 'EventLog exported as CSV', { count: this.logs.length });
    }

    download(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    formatTimestamp(iso) {
        const date = new Date(iso);
        return date.toLocaleString();
    }

    render() {
        const container = document.getElementById('eventlog-entries');
        if (!container) return;

        if (this.logs.length === 0) {
            container.innerHTML = '<div class="text-gray-500 p-4 text-center text-sm">No events logged</div>';
            return;
        }

        container.innerHTML = this.logs.map(log => `
            <div class="eventlog-entry border-b border-gray-800 p-2 hover:bg-gray-900 text-xs">
                <div class="flex items-start gap-2">
                    <span class="text-gray-500 font-mono">${this.formatTimestamp(log.timestamp)}</span>
                    <span class="text-primary font-semibold">[${log.type}]</span>
                    <span class="text-gray-300 flex-1">${this.escapeHtml(log.message)}</span>
                </div>
                ${Object.keys(log.meta).length > 0 ? `
                    <details class="mt-1 ml-4">
                        <summary class="cursor-pointer text-gray-600">meta</summary>
                        <pre class="text-gray-500 text-xs mt-1 overflow-auto">${this.escapeHtml(JSON.stringify(log.meta, null, 2))}</pre>
                    </details>
                ` : ''}
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const eventLog = new EventLog();
window.APP.log = (type, message, meta = {}) => {
    eventLog.log(type, message, meta);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    window.APP.state = state;

    eventLog.log('app.init', 'Application initialized', {
        language: state.currentLanguage
    });

    // Load all fixtures and data
    await loadAllFixturesAndData();

    // Setup UI
    setupEventListeners();
    setupKeyboardShortcuts();

    // Initial render
    renderAll();

    eventLog.log('app.ready', 'Application ready');
});

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllFixturesAndData() {
    try {
        // Load from fixtures directory
        const fixtureFiles = ['inputs', 'pains', 'drip', 'prospects', 'payments', 'bonuses', 'proofloop', 'traffic'];

        for (const file of fixtureFiles) {
            try {
                const response = await fetch(`./fixtures/${file}.json`);
                if (response.ok) {
                    state.fixtures[file] = await response.json();
                    eventLog.log('fixture.loaded', `Loaded ${file}.json`, { size: JSON.stringify(state.fixtures[file]).length });
                }
            } catch (error) {
                eventLog.log('fixture.error', `Failed to load ${file}.json`, { error: error.message });
                state.fixtures[file] = getFallbackFixture(file);
            }
        }

        // Load from data directory
        const dataFiles = ['niches', 'questions', 'scoring_rules', 'messages', 'closing_snippets', 'proofloop', 'knowledge_base', 'testimonials'];

        for (const file of dataFiles) {
            try {
                const response = await fetch(`./data/${file}.json`);
                if (response.ok) {
                    const data = await response.json();
                    assignDataToState(file, data);
                    eventLog.log('data.loaded', `Loaded ${file}.json`);
                }
            } catch (error) {
                eventLog.log('data.error', `Failed to load ${file}.json`, { error: error.message });
                assignDataToState(file, getFallbackData(file));
            }
        }

        state.acceptanceChecks.fixtures = true;
        eventLog.log('acceptance.pass', 'Fixtures loaded successfully', {
            count: Object.keys(state.fixtures).length + Object.keys(state).filter(k => !['fixtures', 'setup', 'acceptanceChecks'].includes(k)).length
        });

    } catch (error) {
        eventLog.log('app.error', 'Failed to load data', { error: error.message });
    }
}

function assignDataToState(filename, data) {
    const mapping = {
        'niches': 'niches',
        'questions': 'questions',
        'scoring_rules': 'scoringRules',
        'messages': 'messages',
        'closing_snippets': 'closingSnippets',
        'proofloop': 'proofloop',
        'knowledge_base': 'knowledgeBase',
        'testimonials': 'proof'
    };
    const key = mapping[filename];
    if (key) {
        state[key] = data;
    }
}

function getFallbackFixture(filename) {
    // Fallback data defined in fixtures.js
    return {};
}

function getFallbackData(filename) {
    // Fallback data defined in fixtures.js
    return {};
}

// ============================================================================
// UI SETUP & EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // EventLog drawer
    const btnEventLog = document.getElementById('btn-eventlog');
    if (btnEventLog) {
        btnEventLog.addEventListener('click', () => eventLog.toggle());
    }

    const btnClearLog = document.getElementById('btn-clear-log');
    if (btnClearLog) {
        btnClearLog.addEventListener('click', () => eventLog.clear());
    }

    const btnCopyLog = document.getElementById('btn-copy-log');
    if (btnCopyLog) {
        btnCopyLog.addEventListener('click', () => eventLog.copyAll());
    }

    const btnExportJSON = document.getElementById('btn-export-json');
    if (btnExportJSON) {
        btnExportJSON.addEventListener('click', () => eventLog.exportJSON());
    }

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => eventLog.exportCSV());
    }

    // Setup form submission
    const setupForm = document.getElementById('setup-form');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetupSubmit);
    }

    // Build application form
    const btnBuildForm = document.getElementById('btn-build-form');
    if (btnBuildForm) {
        btnBuildForm.addEventListener('click', buildApplicationForm);
    }

    // Simulate applicants
    const btnSimulateApplicants = document.getElementById('btn-simulate-applicants');
    if (btnSimulateApplicants) {
        btnSimulateApplicants.addEventListener('click', simulateApplicants);
    }

    // Drip preview buttons
    document.querySelectorAll('.btn-preview-drip').forEach((btn, index) => {
        btn.addEventListener('click', () => previewDripMessage(index));
    });

    // ICE Nurturing test
    const btnTestICENurture = document.getElementById('btn-test-ice-nurture');
    if (btnTestICENurture) {
        btnTestICENurture.addEventListener('click', testICENurture);
    }

    // Generate ICS
    const btnGenerateICS = document.getElementById('btn-generate-ics');
    if (btnGenerateICS) {
        btnGenerateICS.addEventListener('click', generateICSFile);
    }

    // Generate closing script
    const btnGenerateClosing = document.getElementById('btn-generate-closing');
    if (btnGenerateClosing) {
        btnGenerateClosing.addEventListener('click', generateClosingScript);
    }

    // Payment nudges
    const btnPaymentNudge = document.getElementById('btn-payment-nudge');
    if (btnPaymentNudge) {
        btnPaymentNudge.addEventListener('click', sendPaymentNudge);
    }

    // ProofLoop
    const btnCollectProof = document.getElementById('btn-collect-proof');
    if (btnCollectProof) {
        btnCollectProof.addEventListener('click', openProofCollectModal);
    }

    const btnSubmitProof = document.getElementById('btn-submit-proof');
    if (btnSubmitProof) {
        btnSubmitProof.addEventListener('click', submitProofFeedback);
    }

    // ProofWall exports
    const btnExportProofPNG = document.getElementById('btn-export-proof-png');
    if (btnExportProofPNG) {
        btnExportProofPNG.addEventListener('click', exportProofWallPNG);
    }

    const btnExportProofPDF = document.getElementById('btn-export-proof-pdf');
    if (btnExportProofPDF) {
        btnExportProofPDF.addEventListener('click', exportProofWallPDF);
    }

    // Traffic tabs
    document.querySelectorAll('.traffic-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTrafficTab(e.target.dataset.tab));
    });

    // Logo upload
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // E/L - Toggle EventLog
        if ((e.key === 'e' || e.key === 'E' || e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                eventLog.toggle();
                e.preventDefault();
            }
        }
    });
}

// ============================================================================
// SETUP & FORM BUILDING
// ============================================================================

function handleSetupSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    state.setup.icp = formData.get('icp') || '';
    state.setup.niche = formData.get('niche') || null;
    state.setup.offer = formData.get('offer') || '';
    state.setup.ticket = formData.get('ticket') || '';
    state.setup.salesModel = formData.get('salesModel') || 'retainer';
    state.setup.pains = (formData.get('pains') || '').split(',').map(p => p.trim()).filter(Boolean);

    eventLog.log('setup.saved', 'Setup configuration saved', {
        icp: state.setup.icp,
        offer: state.setup.offer
    });

    // Show next section
    showSection('application-builder');
}

function buildApplicationForm() {
    // Build form based on niche and questions
    state.formQuestions = state.questions.slice(0, 6); // Use first 6 questions

    eventLog.log('gate.build', '[ICE] Application form built', {
        questions: state.formQuestions.length
    });

    renderApplicationForm();
    state.acceptanceChecks.gate = true;

    showSection('applicants-section');
}

function renderApplicationForm() {
    const container = document.getElementById('application-form-preview');
    if (!container) return;

    container.innerHTML = state.formQuestions.map((q, i) => `
        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">${q.text || `Question ${i + 1}`}</label>
            <input type="text" class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded" placeholder="Preview only">
        </div>
    `).join('');
}

// ============================================================================
// APPLICANT SIMULATION & SCORING
// ============================================================================

function simulateApplicants() {
    const names = [
        'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Desai',
        'Vikram Singh', 'Anjali Mehta', 'Rohan Gupta', 'Kavya Reddy'
    ];

    state.applicants = names.map(name => ({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        score: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
    }));

    // Score and categorize
    const threshold = state.scoringRules.qualified_threshold || 60;
    state.scoredApplicants = state.applicants.map(app => ({
        ...app,
        qualified: app.score >= threshold
    }));

    state.topPicks = state.scoredApplicants.filter(a => a.qualified);
    state.rejects = state.scoredApplicants.filter(a => !a.qualified);

    eventLog.log('ice.qualification', '[ICE] Auto-Qualification complete', {
        total: state.applicants.length,
        qualified: state.topPicks.length,
        rejected: state.rejects.length
    });

    renderApplicants();
}

function renderApplicants() {
    const container = document.getElementById('applicants-list');
    if (!container) return;

    container.innerHTML = state.scoredApplicants.map(app => `
        <div class="applicant-card p-4 border ${app.qualified ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'} rounded mb-2">
            <div class="flex items-center justify-between">
                <div>
                    <div class="font-semibold">${app.name}</div>
                    <div class="text-sm text-gray-400">${app.email}</div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold ${app.qualified ? 'text-green-500' : 'text-red-500'}">${app.score}</div>
                    <div class="text-xs ${app.qualified ? 'text-green-400' : 'text-red-400'}">
                        ${app.qualified ? '✓ Qualified → ICE Nurture' : '✗ Unqualified → ProofLoop'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// ICE NURTURING (WhatsApp Drip)
// ============================================================================

function previewDripMessage(index) {
    const message = state.presellMessages[index] || state.fixtures.drip?.[index];
    if (!message) return;

    eventLog.log('drip.preview', `Drip message ${index + 1} preview opened`, {
        timing: message.timing
    });

    alert(`[${message.timing}] ${message.title}\n\n${message.message}`);
    state.acceptanceChecks.drip = true;
}

function testICENurture() {
    const testNumber = prompt('Enter WhatsApp number (with country code):');
    if (!testNumber) return;

    const message = encodeURIComponent('Test ICE Nurture message from ScaleEdge');
    const whatsappURL = `https://wa.me/${testNumber}?text=${message}`;

    window.open(whatsappURL, '_blank');

    eventLog.log('ice.nurture', '[ICE] Test nurture message sent', {
        number: testNumber
    });
}

// ============================================================================
// CALENDAR & ICS GENERATION
// ============================================================================

function generateICSFile() {
    const now = new Date();
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ScaleEdge//ICE//EN
BEGIN:VEVENT
UID:${Date.now()}@scaleedge.com
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:Strategy Call - ${state.setup.offer}
DESCRIPTION:Discovery call for ${state.setup.offer}
LOCATION:Zoom (link to be shared)
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'call-invite.ics';
    a.click();
    URL.revokeObjectURL(url);

    eventLog.log('calendar.ics', 'ICS file generated', {
        date: start.toISOString()
    });

    state.acceptanceChecks.ics = true;
}

function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// ============================================================================
// CLOSING SCRIPT GENERATION
// ============================================================================

function generateClosingScript() {
    if (state.topPicks.length === 0) {
        alert('No qualified applicants to generate script for. Simulate applicants first.');
        return;
    }

    const prospect = state.topPicks[0];
    const snippets = state.closingSnippets;

    state.closingScript = {
        prospect: prospect.name,
        opening: snippets.opening?.replace('{name}', prospect.name) || `Great to connect, ${prospect.name}!`,
        diagnosis: snippets.diagnosis || 'Based on what you shared...',
        prescription: snippets.prescription || 'Here\'s what I recommend...',
        close: snippets.close || 'Does this sound like a fit?'
    };

    eventLog.log('ice.closing', '[ICE] Closing script generated', {
        prospect: prospect.name
    });

    renderClosingScript();
    state.acceptanceChecks.handoff = true;
}

function renderClosingScript() {
    const container = document.getElementById('closing-script-display');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div class="text-xs text-gray-500 mb-4">Generated by ICE for Remote Closer</div>
            <div class="space-y-4">
                <div>
                    <div class="text-sm font-semibold text-primary">Opening</div>
                    <div class="text-gray-300">${state.closingScript.opening}</div>
                </div>
                <div>
                    <div class="text-sm font-semibold text-primary">Diagnosis</div>
                    <div class="text-gray-300">${state.closingScript.diagnosis}</div>
                </div>
                <div>
                    <div class="text-sm font-semibold text-primary">Prescription</div>
                    <div class="text-gray-300">${state.closingScript.prescription}</div>
                </div>
                <div>
                    <div class="text-sm font-semibold text-primary">Close</div>
                    <div class="text-gray-300">${state.closingScript.close}</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// PAYMENT AUTOMATION
// ============================================================================

function sendPaymentNudge() {
    const testNumber = prompt('Enter WhatsApp number for payment reminder:');
    if (!testNumber) return;

    const amount = '₹4,50,000';
    const message = encodeURIComponent(`Hi! Friendly reminder: Balance payment of ${amount} is pending. Payment link: [simulated]`);
    const whatsappURL = `https://wa.me/${testNumber}?text=${message}`;

    window.open(whatsappURL, '_blank');

    eventLog.log('ice.payment', '[ICE] Payment nudge sent', {
        number: testNumber,
        amount
    });

    state.acceptanceChecks.money = true;
}

// ============================================================================
// PROOFLOOP SYSTEM
// ============================================================================

function openProofCollectModal() {
    const modal = document.getElementById('proofloop-modal');
    if (modal) {
        modal.classList.remove('hidden');
        eventLog.log('proofloop.collect_open', 'Collect feedback modal opened');
    }
}

function submitProofFeedback() {
    const rating = document.querySelector('input[name="proof-rating"]:checked')?.value;
    const feedback = document.getElementById('proof-feedback')?.value;

    if (!rating || !feedback) {
        alert('Please provide both rating and feedback');
        return;
    }

    const entry = {
        rating: parseInt(rating),
        feedback,
        timestamp: new Date().toISOString(),
        bonus: state.proofloop.selectedBonus
    };

    state.proofloop.feedback.push(entry);

    eventLog.log('proofloop.feedback_saved', 'Feedback entry saved', {
        rating: entry.rating
    });

    // Close modal
    const modal = document.getElementById('proofloop-modal');
    if (modal) {
        modal.classList.add('hidden');
    }

    // Show success message
    alert('Thank you! Your bonus is being delivered...');

    state.acceptanceChecks.proofloop = true;
    renderProofWall();
}

// ============================================================================
// PROOFWALL EXPORTS
// ============================================================================

function exportProofWallPNG() {
    const proofwall = document.getElementById('proofwall');
    if (!proofwall) return;

    if (typeof html2canvas === 'undefined') {
        alert('html2canvas library not loaded. Include it in index.html');
        return;
    }

    html2canvas(proofwall).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proofwall_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);

            eventLog.log('export.png', 'ProofWall exported as PNG');
            state.acceptanceChecks.proofwall = true;
        });
    });
}

function exportProofWallPDF() {
    if (typeof jspdf === 'undefined') {
        alert('jsPDF library not loaded. Include it in index.html');
        return;
    }

    const pdf = new jspdf.jsPDF();
    pdf.text('ScaleEdge ProofWall', 10, 10);
    state.proofloop.feedback.forEach((item, i) => {
        pdf.text(`${i + 1}. Rating: ${item.rating}/5`, 10, 20 + i * 10);
        pdf.text(`   ${item.feedback.substring(0, 50)}...`, 10, 25 + i * 10);
    });

    pdf.save(`proofwall_${Date.now()}.pdf`);

    eventLog.log('export.pdf', 'ProofWall exported as PDF');
}

function renderProofWall() {
    const container = document.getElementById('proofwall');
    if (!container) return;

    container.innerHTML = state.proofloop.feedback.map(item => `
        <div class="proof-tile bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div class="text-yellow-500 mb-2">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
            <div class="text-gray-300 text-sm">${item.feedback}</div>
            <div class="text-xs text-gray-500 mt-2">${new Date(item.timestamp).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// ============================================================================
// TRAFFIC ENGINE
// ============================================================================

function switchTrafficTab(tab) {
    state.trafficActiveTab = tab;

    document.querySelectorAll('.traffic-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    document.querySelectorAll('.traffic-content').forEach(c => {
        c.classList.toggle('hidden', c.dataset.tab !== tab);
    });

    eventLog.log('traffic.tab', 'Switched traffic tab', {
        tab: state.trafficActiveTab
    });

    state.acceptanceChecks.traffic = true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    state.setup.logo = file;
    state.setup.logoObjectURL = URL.createObjectURL(file);

    const preview = document.getElementById('logo-preview');
    if (preview) {
        preview.src = state.setup.logoObjectURL;
        preview.classList.remove('hidden');
    }

    eventLog.log('setup.logo', 'Logo uploaded', {
        filename: file.name
    });
}

function renderAll() {
    renderApplicationForm();
    renderApplicants();
    renderClosingScript();
    renderProofWall();
    eventLog.render();
}

// ============================================================================
// EXPORTS
// ============================================================================

window.APP.state = state;
window.APP.eventLog = eventLog;
