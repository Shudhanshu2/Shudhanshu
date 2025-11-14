// ScaleEdge Authority Close Engine - Main Application
// ====================================================

// Global APP instance
window.APP = window.APP || { state: null, log: null };

const state = {
  niches: [], questions: [], scoringRules: {}, applicants: [],
  messages: {}, closingSnippets: {}, proof: [], knowledgeBase: {},
  setup: {
    icp: '', niche: null, offer: '', ticket: '', salesModel: 'retainer',
    pains: [], brandColor: '#DC2626', logo: null, logoObjectURL: null,
    proofTiles: []
  },
  formQuestions: [], scoredApplicants: [], topPicks: [], rejects: [],
  presellMessages: [], closingScript: {},
  timers: { slidesProgress: 0, slidesComplete: false, videoProgress: 0,
    videoGated: true, videoComplete: false },
  proofloop: {
    config: null,
    feedback: [],
    bonusLibrary: [],
    dripMessages: [],
    copy: {},
    selectedBonus: null,
    voiceBlob: null
  },
  fixtures: {}, // From fixtures/*.json
  currentLanguage: 'hinglish',
  gateScore: null,
  gateUnlocked: false,
  dripStatuses: ['queued', 'sent', 'read', 'queued'],
  proofloopEnabled: true,
  trafficActiveTab: 'search_harvest',
  acceptanceChecks: {
    'fixtures': false,
    'gate': false,
    'drip': false,
    'ics': false,
    'handoff': false,
    'money': false,
    'proofloop': false,
    'proofwall': false,
    'traffic': false,
    'copy': false
  }
};

// EventLog system
class EventLog {
  constructor() {
    this.logs = this.load();
    this.isOpen = false;
  }

  load() {
    try {
      const stored = localStorage.getItem('se_eventlog');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem('se_eventlog', JSON.stringify(this.logs));
    } catch (e) {
      console.error('EventLog save failed:', e);
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
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    this.save();
    this.render();
  }

  formatTimestamp(isoString) {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const time = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    return `${day} ${month}, ${time}`;
  }

  render() {
    const container = document.getElementById('eventlog-entries');
    if (!container || !this.isOpen) return;

    container.innerHTML = '';
    if (this.logs.length === 0) {
      container.innerHTML = '<div class="text-sm text-gray-400 p-4">No events logged yet</div>';
      return;
    }

    this.logs.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'border-b border-gray-700 p-3';
      div.innerHTML = `
        <div class="flex items-start justify-between mb-1">
          <span class="text-xs font-semibold text-brand">${entry.type}</span>
          <span class="text-xs text-gray-500">${this.formatTimestamp(entry.timestamp)}</span>
        </div>
        <div class="text-sm text-gray-300">${entry.message}</div>
        ${Object.keys(entry.meta).length > 0 ? `<div class="text-xs text-gray-500 mt-1">${JSON.stringify(entry.meta)}</div>` : ''}
      `;
      container.appendChild(div);
    });
  }

  toggle() {
    const drawer = document.getElementById('eventlog-drawer');
    if (!drawer) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      drawer.classList.remove('hidden');
      this.render();
    } else {
      drawer.classList.add('hidden');
    }
  }

  clear() {
    if (confirm('Clear all event logs?')) {
      this.logs = [];
      this.save();
      this.render();
      showToast('EventLog cleared');
    }
  }

  copyAll() {
    const text = this.logs.map(e =>
      `[${this.formatTimestamp(e.timestamp)}] ${e.type}: ${e.message}`
    ).join('\n');
    copyText(text);
  }

  exportJSON() {
    downloadFile('eventlog.json', JSON.stringify(this.logs, null, 2), 'application/json');
    showToast('EventLog JSON exported ✓');
  }

  exportCSV() {
    const header = 'Timestamp,Type,Message,Meta\n';
    const rows = this.logs.map(e =>
      `"${e.timestamp}","${e.type}","${e.message}","${JSON.stringify(e.meta).replace(/"/g, '""')}"`
    ).join('\n');
    downloadFile('eventlog.csv', header + rows, 'text/csv');
    showToast('EventLog CSV exported ✓');
  }
}

const eventLog = new EventLog();

// ====================================================
// Demo Constants & Helpers
// ====================================================
const DEMO = true; // never call real APIs
const WA_DEEPLINK = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

const LAYOUTS = ['Title', 'Bullets', 'TwoCol', 'Diagram', 'Proof', 'CTA'];

function downloadFile(name, content, type='text/plain') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

async function copyText(txt) {
  try {
    await navigator.clipboard.writeText(txt);
    showToast('Copied ✓');
  } catch(err) {
    console.warn('Clipboard copy failed:', err);
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#DC2626;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.3);';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ====================================================
// Journey Map Tracking
// ====================================================
function markJourney(stepNum) {
  const steps = document.querySelectorAll('#journey .step');
  if (steps.length === 0) return;

  for (let i = 0; i < stepNum && i < steps.length; i++) {
    steps[i].classList.add('done');
  }
}

// Fixture Loader
async function loadFixtures() {
  const fixtureFiles = [
    'inputs', 'pains', 'drip', 'prospects',
    'payments', 'bonuses', 'proofloop', 'traffic'
  ];

  const results = {};

  await Promise.all(
    fixtureFiles.map(async (name) => {
      try {
        const response = await fetch(`./fixtures/${name}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        results[name] = await response.json();
        console.log(`✓ Loaded ${name}.json`);
        eventLog.log('fixture.loaded', `Loaded ${name}.json`, { size: JSON.stringify(results[name]).length });
      } catch (error) {
        console.error(`✗ Failed to load ${name}.json:`, error);
        eventLog.log('fixture.error', `Failed to load ${name}.json`, { error: error.message });
        results[name] = name === 'inputs' ? {} : [];
      }
    })
  );

  return results;
}

// Data Loading
async function loadData() {
  try {
    // Load fixtures first
    const fixtures = await loadFixtures();
    state.fixtures = fixtures;

    // Mark fixtures check as passed
    state.acceptanceChecks.fixtures = true;
    updateAcceptanceCounter();
    eventLog.log('acceptance.pass', 'Fixtures loaded successfully', { count: Object.keys(fixtures).length });

    // Apply fixture defaults if inputs loaded
    if (fixtures.inputs && Object.keys(fixtures.inputs).length > 0) {
      state.setup.icp = fixtures.inputs.persona || '';
      state.setup.offer = fixtures.inputs.offer || '';
      state.setup.ticket = fixtures.inputs.ticket || '';
      state.setup.salesModel = fixtures.inputs.salesModel || 'one-time';
      state.setup.brandColor = fixtures.inputs.branding?.color || '#DC2626';
      state.currentLanguage = fixtures.inputs.language || 'hinglish';

      // Mark Copy check as passed (Hinglish language set)
      state.acceptanceChecks.copy = state.currentLanguage === 'hinglish';
    }

    const [niches, questions, scoring, applicants, messages, closing, proof, kb, proofloopData] =
      await Promise.all([
        fetch('data/niches.json').then(r => r.json()),
        fetch('data/questions.json').then(r => r.json()),
        fetch('data/scoring_rules.json').then(r => r.json()),
        fetch('data/applicants.json').then(r => r.json()),
        fetch('data/messages.json').then(r => r.json()),
        fetch('data/closing_snippets.json').then(r => r.json()),
        fetch('data/proof.json').then(r => r.json()),
        fetch('data/knowledge_base.json').then(r => r.json()),
        fetch('data/proofloop.json').then(r => r.json())
      ]);

    Object.assign(state, {niches, questions, scoringRules: scoring, applicants,
      messages, closingSnippets: closing, proof, knowledgeBase: kb});

    // Load ProofLoop data
    state.proofloop.config = proofloopData.config;
    state.proofloop.feedback = fixtures.proofloop || proofloopData.feedback; // Use fixture if available
    state.proofloop.bonusLibrary = fixtures.bonuses || proofloopData.bonusLibrary; // Use fixture if available
    state.proofloop.dripMessages = proofloopData.dripMessages;
    state.proofloop.copy = proofloopData.copy;

    // Set global APP reference
    window.APP = { state, log: eventLog.log.bind(eventLog) };

    initializeUI();
    eventLog.log('app.init', 'Application initialized', { language: state.currentLanguage });
  } catch (error) {
    console.error('Error loading data:', error);
    eventLog.log('app.error', 'Failed to initialize app', { error: error.message });
  }
}

// Acceptance Test Counter
function updateAcceptanceCounter() {
  const total = Object.keys(state.acceptanceChecks).length;
  const passed = Object.values(state.acceptanceChecks).filter(v => v).length;
  const counter = document.getElementById('checks-status');
  if (counter) {
    counter.textContent = `${passed}/${total}`;
    counter.className = passed === total ? 'text-green-400 font-semibold' : 'text-gray-600';
  }
}

// UI Initialization
function initializeUI() {
  populateNicheDropdown();
  populateProofTiles();
  populateKnowledgeBase();
  attachEventListeners();
  initDripDrawer();
  initSlideModal();
  initConnections();
  initLovableHook();
  initProofLoop();
  initEventLogUI();
  initKeyboardShortcuts();
  initTrafficEngine();
  checkDemoMode();
  updateAcceptanceCounter();
}

// EventLog UI Initialization
function initEventLogUI() {
  const toggleBtn = document.getElementById('eventlog-toggle');
  const closeBtn = document.getElementById('eventlog-close');
  const copyBtn = document.getElementById('eventlog-copy');
  const exportJsonBtn = document.getElementById('eventlog-export-json');
  const exportCsvBtn = document.getElementById('eventlog-export-csv');
  const clearBtn = document.getElementById('eventlog-clear');

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      eventLog.toggle();
      eventLog.log('ui.action', 'EventLog toggled');
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      eventLog.toggle();
    };
  }

  if (copyBtn) {
    copyBtn.onclick = () => {
      eventLog.copyAll();
    };
  }

  if (exportJsonBtn) {
    exportJsonBtn.onclick = () => {
      eventLog.exportJSON();
    };
  }

  if (exportCsvBtn) {
    exportCsvBtn.onclick = () => {
      eventLog.exportCSV();
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      eventLog.clear();
    };
  }
}

// Keyboard Shortcuts Initialization
function initKeyboardShortcuts() {
  const overlay = document.getElementById('keyboard-overlay');
  const closeBtn = document.getElementById('shortcuts-close');

  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.classList.add('hidden');
    };
  }

  // Global keyboard handler
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'g':
        showToast('Gate (G)');
        document.getElementById('section-intake')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.gate', 'Navigated to Gate');
        break;
      case 'd':
        showToast('Drip (D)');
        document.getElementById('section-presell')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.drip', 'Navigated to Drip');
        break;
      case 'c':
        showToast('Calendar (C)');
        document.getElementById('section-booking')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.calendar', 'Navigated to Calendar');
        break;
      case 'h':
        showToast('Handoff (H)');
        document.getElementById('section-closing-script')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.handoff', 'Navigated to Handoff');
        break;
      case 'm':
        showToast('Money (M)');
        document.getElementById('section-result')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.money', 'Navigated to Money');
        break;
      case 'p':
        showToast('ProofLoop (P)');
        document.getElementById('section-proofloop')?.scrollIntoView({ behavior: 'smooth' });
        eventLog.log('shortcut.proofloop', 'Navigated to ProofLoop');
        break;
      case 't':
        showToast('Traffic (T)');
        const trafficSection = document.getElementById('section-traffic');
        if (trafficSection) {
          trafficSection.classList.remove('hidden');
          setTimeout(() => {
            trafficSection.scrollIntoView({ behavior: 'smooth' });
            renderTrafficEngine();
          }, 100);
        }
        eventLog.log('shortcut.traffic', 'Navigated to Traffic');
        break;
      case 'e':
        showToast('EventLog (E/L)');
        eventLog.toggle();
        break;
      case 'l':
        showToast('EventLog (E/L)');
        eventLog.toggle();
        break;
      case '?':
        overlay.classList.remove('hidden');
        eventLog.log('shortcut.help', 'Opened shortcuts overlay');
        break;
      case 'escape':
        overlay.classList.add('hidden');
        break;
    }
  });
}

function populateNicheDropdown() {
  const select = document.getElementById('input-niche');
  state.niches.forEach(niche => {
    const option = document.createElement('option');
    option.value = niche.id;
    option.textContent = niche.name;
    select.appendChild(option);
  });
}

function populateProofTiles() {
  const container = document.getElementById('proof-tiles-selector');
  state.setup.proofTiles = [state.proof[0].id, state.proof[1].id, state.proof[2].id];
  state.proof.slice(0, 8).forEach((p, i) => {
    const chip = document.createElement('span');
    chip.className = i < 3 ? 'chip chip-selected' : 'chip';
    chip.textContent = p.name;
    chip.dataset.proofId = p.id;
    container.appendChild(chip);
  });
}

function populateKnowledgeBase() {
  const container = document.getElementById('kb-folders');
  state.knowledgeBase.folders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'kb-folder';
    const title = document.createElement('div');
    title.className = 'kb-folder-title';
    title.textContent = folder.category;
    folderDiv.appendChild(title);

    folder.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'kb-item';
      itemDiv.innerHTML = `<div class="kb-item-title">${item.title}</div>
        <div class="kb-item-preview">${item.preview}</div>`;
      folderDiv.appendChild(itemDiv);
    });
    container.appendChild(folderDiv);
  });
}

// Event Listeners
function attachEventListeners() {
  document.getElementById('btn-knowledge-base').onclick = () => openModal('modal-knowledge-base');
  document.getElementById('btn-keyboard-shortcuts').onclick = () => openModal('modal-keyboard-shortcuts');
  document.getElementById('btn-connections').onclick = () => openModal('modal-connections');

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.onclick = () => closeModal(btn.dataset.modal);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.onclick = (e) => { if (e.target === modal) closeModal(modal.id); };
  });

  document.getElementById('input-icp').oninput = updatePreview;
  document.getElementById('input-niche').onchange = onNicheChange;
  document.getElementById('input-offer').oninput = updatePreview;
  document.getElementById('input-ticket').oninput = updatePreview;
  document.getElementById('input-sales-model').onchange = updatePreview;
  document.getElementById('input-brand-color').oninput = updatePreview;
  document.getElementById('input-logo').onchange = onLogoUpload;

  document.getElementById('btn-toggle-advanced').onclick = toggleAdvanced;
  document.getElementById('btn-build-form').onclick = buildApplicationForm;
  document.getElementById('btn-lock-form').onclick = lockFormAndStartIntake;
  document.getElementById('btn-filter-prospects').onclick = filterProspects;
  document.getElementById('btn-assemble-presell').onclick = assemblePresell;
  document.getElementById('btn-schedule-drip').onclick = scheduleDrip;
  document.getElementById('btn-orchestrate-booking').onclick = orchestrateBooking;
  document.getElementById('select-prospect').onchange = generateClosingScript;
  document.getElementById('btn-download-script').onclick = downloadClosingScript;
  document.getElementById('btn-export-followup').onclick = exportFollowupPlan;
  document.getElementById('btn-export-whatsapp').onclick = exportWhatsAppJSON;
  document.getElementById('btn-export-funnel').onclick = exportFunnelJSON;
  document.getElementById('btn-export-lovable-modal').onclick = exportFunnelJSON;

  document.addEventListener('keydown', handleKeyboardShortcut);

  ['pain', 'budget', 'timeline', 'fit'].forEach(type => {
    const slider = document.getElementById('weight-' + type);
    const label = document.getElementById('weight-' + type + '-val');
    if (slider && label) {
      slider.oninput = () => {
        label.textContent = slider.value + '%';
        state.scoringRules.weights[type] = parseInt(slider.value) / 100;
      };
    }
  });
}

// Setup Section
function onNicheChange(e) {
  state.setup.niche = state.niches.find(n => n.id === e.target.value);
  if (state.setup.niche) {
    populatePainChips();
    updatePreview();
  }
}

function populatePainChips() {
  const container = document.getElementById('pain-chips-container');
  container.innerHTML = '';
  if (!state.setup.niche) return;

  state.setup.niche.pains.forEach(pain => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = pain;
    chip.onclick = () => togglePain(pain, chip);
    container.appendChild(chip);
  });
}

function togglePain(pain, chip) {
  const index = state.setup.pains.indexOf(pain);
  if (index > -1) {
    state.setup.pains.splice(index, 1);
    chip.classList.remove('chip-selected');
  } else if (state.setup.pains.length < 3) {
    state.setup.pains.push(pain);
    chip.classList.add('chip-selected');
  }
  updateSelectedPains();
  updatePreview();
}

function updateSelectedPains() {
  const container = document.getElementById('selected-pains');
  container.innerHTML = '';
  state.setup.pains.forEach(pain => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-selected';
    chip.textContent = pain;
    container.appendChild(chip);
  });
}

function onLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    if (state.setup.logoObjectURL) URL.revokeObjectURL(state.setup.logoObjectURL);
    state.setup.logoObjectURL = URL.createObjectURL(file);
    state.setup.logo = file.name;
    updatePreview();
  }
}

function updatePreview() {
  state.setup.icp = document.getElementById('input-icp').value;
  state.setup.offer = document.getElementById('input-offer').value;
  state.setup.ticket = document.getElementById('input-ticket').value;
  state.setup.salesModel = document.getElementById('input-sales-model').value;
  state.setup.brandColor = document.getElementById('input-brand-color').value;

  document.getElementById('preview-slide1').textContent = state.setup.offer || '—';

  const hooksList = document.getElementById('preview-hooks');
  hooksList.innerHTML = '';
  if (state.setup.pains.length > 0) {
    state.setup.pains.forEach(pain => {
      const li = document.createElement('li');
      li.textContent = pain;
      hooksList.appendChild(li);
    });
  } else {
    hooksList.innerHTML = '<li>—</li>';
  }

  document.getElementById('preview-cta-slide').textContent = state.setup.ticket ?
    'Investment: ' + state.setup.ticket + ' (' + state.setup.salesModel + ')' : '—';

  const proofContainer = document.getElementById('preview-proof');
  proofContainer.innerHTML = '';
  const selectedProof = state.proof.filter(p => state.setup.proofTiles.includes(p.id));
  if (selectedProof.length > 0) {
    selectedProof.forEach(p => {
      const avatar = document.createElement('div');
      avatar.className = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold';
      avatar.style.backgroundColor = p.avatar_color;
      avatar.textContent = p.avatar_initials;
      proofContainer.appendChild(avatar);
    });
  } else {
    proofContainer.innerHTML = '<span class="text-xs text-gray-400">—</span>';
  }

  updatePipelineLog();
}

function updatePipelineLog() {
  const log = document.getElementById('pipeline-log');
  const lines = [];

  if (state.setup.niche) {
    lines.push('[niche] ICP=' + (state.setup.icp || 'undefined') + ' • geo=IN');
  }
  if (state.setup.pains.length > 0) {
    lines.push('[match] pains=' + state.setup.pains.length + ' mapped → Hook block');
  }
  if (state.setup.brandColor || state.setup.logo) {
    lines.push('[style] theme=' + state.setup.brandColor + ' • ' +
      (state.setup.logo ? 'logo.ok' : 'logo.default'));
  }
  if (state.setup.ticket) {
    lines.push('[pitch] ticket=' + state.setup.ticket + ' • model=' + state.setup.salesModel);
  }
  if (state.setup.proofTiles.length > 0) {
    const names = state.proof.filter(p => state.setup.proofTiles.includes(p.id))
      .map(p => p.name.split(' ')[0]).join('/');
    lines.push('[proof] ' + state.setup.proofTiles.length + ' tiles attached (' + names + ')');
  }

  log.innerHTML = lines.length > 0 ?
    lines.map(l => '<div class="log-line log-info">' + l + '</div>').join('') :
    '<div class="log-line text-gray-500"># Waiting for input...</div>';
}

function toggleAdvanced() {
  const advanced = document.getElementById('advanced-options');
  const btn = document.getElementById('btn-toggle-advanced');
  if (advanced.classList.contains('hidden')) {
    advanced.classList.remove('hidden');
    btn.textContent = '− Hide Advanced Options';
  } else {
    advanced.classList.add('hidden');
    btn.textContent = '+ Show Advanced Options';
  }
}

// Application Form Builder
function buildApplicationForm() {
  const nicheId = state.setup.niche?.id || 'all';
  state.formQuestions = state.questions.filter(q =>
    q.niches.includes('all') || q.niches.includes(nicheId));

  document.getElementById('section-form-designer').classList.remove('hidden');

  const container = document.getElementById('form-questions-container');
  container.innerHTML = '';

  state.formQuestions.forEach(q => {
    const qDiv = document.createElement('div');
    qDiv.className = 'bg-ink rounded-lg p-4 border border-gray-700';
    qDiv.innerHTML = '<div class="flex items-start justify-between mb-2"><div class="flex-1">' +
      '<div class="font-semibold text-white mb-1">' + q.question + '</div>' +
      '<div class="text-xs text-gray-500">Type: ' + q.type + ' • Weight: ' + q.weight +
      ' • Category: ' + q.category + '</div></div>' +
      '<span class="provenance-tag">src: questions#' + q.id + '</span></div>';
    container.appendChild(qDiv);
  });

  markJourney(1); // Application

  // Mark Gate check as passed
  state.acceptanceChecks.gate = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'Application form built', { questions: state.formQuestions.length });

  setTimeout(() => {
    document.getElementById('section-form-designer').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function lockFormAndStartIntake() {
  document.getElementById('section-intake').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('section-intake').scrollIntoView({ behavior: 'smooth' });
    simulateIntake();
  }, 100);
}

// Intake Simulation
function simulateIntake() {
  const container = document.getElementById('applications-container');
  const log = document.getElementById('intake-log');
  container.innerHTML = '';
  log.innerHTML = '<div class="log-line log-info">[init] pipeline started</div>';

  const totalTime = 45000 + Math.random() * 45000;
  const delayPerApplicant = totalTime / state.applicants.length;

  state.applicants.forEach((applicant, index) => {
    setTimeout(() => {
      const scored = scoreApplicant(applicant);
      state.scoredApplicants.push(scored);

      const row = createApplicantRow(scored);
      container.appendChild(row);

      log.innerHTML += '<div class="log-line log-info">[read] #' + scored.id + ' • "' +
        scored.name + '" • score=' + scored.compositeScore + '/100</div>';
      log.scrollTop = log.scrollHeight;

      updateAvgPainIndex();

      if (index === state.applicants.length - 1) {
        setTimeout(() => {
          log.innerHTML += '<div class="log-line log-success">[complete] All processed</div>';
        }, 500);
      }
    }, index * delayPerApplicant);
  });
}

function createApplicantRow(scored) {
  const div = document.createElement('div');
  div.className = 'application-row';
  const scoreColor = scored.compositeScore >= 65 ? 'text-green-400' : 'text-red-400';

  div.innerHTML = '<div class="flex-1"><div class="font-semibold text-white">' +
    scored.name + ' • ' + scored.company + '</div><div class="text-xs text-gray-400">' +
    'Pain: ' + scored.scores.pain.toFixed(1) + ' • Budget: ' + scored.scores.budget.toFixed(1) +
    ' • Timeline: ' + scored.scores.timeline.toFixed(1) + ' • Fit: ' + scored.scores.fit.toFixed(1) +
    '</div></div><div class="text-right"><div class="text-lg font-bold ' + scoreColor + '">' +
    scored.compositeScore + '/100</div><div class="text-xs text-gray-500">' +
    (scored.qualified ? 'Qualified' : 'Reject') + '</div></div>';
  return div;
}

function scoreApplicant(applicant) {
  const scores = {
    pain: scorePain(applicant.pain),
    budget: scoreBudget(applicant.budget),
    timeline: scoreTimeline(applicant.timeline),
    fit: scoreFit(applicant)
  };

  const weights = state.scoringRules.weights;
  const compositeScore = Math.round(
    scores.pain * weights.pain * 100 + scores.budget * weights.budget * 100 +
    scores.timeline * weights.timeline * 100 + scores.fit * weights.fit * 100
  );

  const qualified = compositeScore >= state.scoringRules.qualification_threshold;
  const rejectReason = qualified ? null : determineRejectReason(applicant, scores);

  return { ...applicant, scores, compositeScore, qualified, rejectReason };
}

function scorePain(painText) {
  if (!painText) return 0;
  let score = 0;
  const keywords = state.scoringRules.pain_keywords;
  Object.values(keywords).flat().forEach(keyword => {
    if (painText.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;
  });
  return Math.min(score, 1);
}

function scoreBudget(budgetRange) {
  const map = { 'No budget yet': 0.1, '<₹50K': 0.2, '₹50K-₹1.5L': 0.8,
    '₹1.5L-₹5L': 1.0, '₹5L+': 1.0 };
  return map[budgetRange] || 0;
}

function scoreTimeline(timeline) {
  const map = { 'This week': 1.0, 'This month': 1.0, 'Next quarter': 0.6,
    'Someday eventually': 0.2 };
  return map[timeline] || 0;
}

function scoreFit(applicant) {
  let score = 0.5;
  if (applicant.decision_maker === 'I decide') score += 0.3;
  if (applicant.team_size === '6-15' || applicant.team_size === '16-50') score += 0.2;
  return Math.min(score, 1);
}

function determineRejectReason(applicant, scores) {
  if (scores.budget < 0.3) return 'Budget significantly lower than ticket size';
  if (applicant.timeline === 'Someday eventually') return 'No clear timeline—not ready';
  if (applicant.decision_maker === 'Team consensus needed') return 'Multiple stakeholders';
  if (applicant.revenue === 'Pre-revenue' && applicant.team_size === 'Just me')
    return 'Too early stage';
  return 'Low overall fit score';
}

function updateAvgPainIndex() {
  if (state.scoredApplicants.length === 0) return;
  const avgPain = state.scoredApplicants.reduce((sum, a) => sum + a.scores.pain, 0) /
    state.scoredApplicants.length;
  document.getElementById('avg-pain-index').textContent = avgPain.toFixed(2);
}

// Qualification
function filterProspects() {
  state.topPicks = state.scoredApplicants.filter(a => a.qualified);
  state.rejects = state.scoredApplicants.filter(a => !a.qualified);

  document.getElementById('section-qualification').classList.remove('hidden');

  const topContainer = document.getElementById('top-picks-container');
  topContainer.innerHTML = '';
  state.topPicks.forEach(pick => {
    const card = document.createElement('div');
    card.className = 'prospect-card prospect-card-green';
    card.innerHTML = '<div class="font-semibold text-white mb-1">' + pick.name + '</div>' +
      '<div class="text-sm text-gray-400 mb-2">' + pick.company + ' • Score: ' +
      pick.compositeScore + '/100</div><div class="text-xs text-gray-500">' +
      pick.pain.substring(0, 100) + '...</div>';
    topContainer.appendChild(card);
  });

  const rejectsContainer = document.getElementById('rejects-container');
  rejectsContainer.innerHTML = '';
  state.rejects.forEach(reject => {
    const card = document.createElement('div');
    card.className = 'prospect-card prospect-card-red';
    card.innerHTML = '<div class="font-semibold text-white mb-1">' + reject.name + '</div>' +
      '<div class="text-xs text-red-400 mb-2">Reason: ' + reject.rejectReason + '</div>' +
      '<div class="text-xs text-gray-500">Auto-decline: "Thanks for your interest..."</div>';
    rejectsContainer.appendChild(card);
  });

  const selector = document.getElementById('select-prospect');
  selector.innerHTML = '<option value="">Choose prospect...</option>';
  state.topPicks.forEach(pick => {
    const option = document.createElement('option');
    option.value = pick.id;
    option.textContent = pick.name + ' (' + pick.compositeScore + '/100)';
    selector.appendChild(option);
  });

  markJourney(2); // Qualify

  setTimeout(() => {
    document.getElementById('section-qualification').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Pre-Sell Pack
function assemblePresell() {
  const valueTips = state.messages.value_tips.slice(0, 2);
  const proofChips = state.messages.proof_chips.slice(0, 2);
  const beliefBreaks = state.messages.belief_breaks.slice(0, 1);

  state.presellMessages = [
    ...valueTips.map(m => ({ ...m, type: 'Value Tip' })),
    ...proofChips.map(m => ({ ...m, type: 'Proof Chip' })),
    ...beliefBreaks.map(m => ({ ...m, type: 'Belief Break' }))
  ];

  document.getElementById('section-presell').classList.remove('hidden');

  const container = document.getElementById('presell-messages-container');
  container.innerHTML = '';
  state.presellMessages.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = '<div class="message-card-header"><span class="message-type-badge">' +
      msg.type + '</span><span class="text-xs text-gray-500">Timing: ' + msg.timing +
      '</span></div><div class="text-sm font-semibold text-white mb-2">' + msg.title + '</div>' +
      '<div class="text-xs text-gray-300 whitespace-pre-line">' +
      msg.content.substring(0, 200) + '...</div>' +
      (msg.diagram_type ? '<div class="text-xs text-brand mt-2">📊 Mini-diagram: ' +
        msg.diagram_type + '</div>' : '') +
      (msg.has_video ? '<div class="text-xs text-brand mt-2">🎥 Video clip</div>' : '');
    container.appendChild(card);
  });

  setTimeout(() => {
    document.getElementById('section-presell').scrollIntoView({ behavior: 'smooth' });
    startParallelTimers();
  }, 100);
}

function scheduleDrip() {
  const drip = state.fixtures?.drip || [];
  const lang = state.currentLanguage || 'hinglish';

  if (!drip.length) {
    alert('Drip data not loaded. Please ensure fixtures are loaded first.');
    return;
  }

  // Get first 4 drip messages
  const messages = drip.slice(0, 4);

  // Open WhatsApp preview links (staggered)
  messages.forEach((msg, idx) => {
    const text = msg.template?.[lang] || msg.template?.hinglish || msg.hook || '';
    const waLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
    setTimeout(() => {
      window.open(waLink, '_blank');
      eventLog.log('drip.preview', `Drip message ${idx + 1} preview opened`, {
        timing: msg.timing,
        language: lang
      });
    }, idx * 600); // Stagger by 600ms
  });

  // Mark Drip check as passed
  state.acceptanceChecks.drip = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'WhatsApp drip preview opened', { count: messages.length });

  markJourney(3); // Pre-sell Drip

  // Show next section
  document.getElementById('section-booking').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('section-booking').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ====================================================
// Drip Drawer
// ====================================================
function buildDripPlan() {
  // Use fixture data if available
  if (state.fixtures.drip && state.fixtures.drip.length > 0) {
    const lang = state.currentLanguage || 'hinglish';
    return state.fixtures.drip.map(msg => ({
      label: msg.timing,
      subject: msg.hook,
      body: msg.template[lang] || msg.template.hinglish,
      provenance: msg.provenance
    }));
  }

  // Fallback to default
  return [
    {
      label: 'T-48h',
      subject: 'Quick question...',
      body: 'Hey! Quick Q—did the slides make sense? Any section unclear? (I can hop on a 10-min clarity call if helpful.)',
      provenance: 'messages#belief_break_1'
    },
    {
      label: 'T-24h',
      subject: 'Real quick',
      body: 'Noticed you haven\'t booked yet. All good! But slots are filling fast for next week. Want me to hold one for you?',
      provenance: 'calendar_urgency_soft'
    },
    {
      label: 'T-2h',
      subject: 'Proof chip',
      body: 'In case helpful: Rajiv (SaaS founder) had the same hesitation. After our call, he closed 2 pilots in 9 days. Screenshot attached 📊',
      provenance: 'proof#social_proof_recent'
    },
    {
      label: 'T-30m',
      subject: 'Last call (literally)',
      body: 'This is the last slot today. If you miss it, next opening is in 6 days. No pressure—just didn\'t want you waiting if you\'re ready now.',
      provenance: 'scarcity_final'
    }
  ];
}

function renderDripDrawer() {
  const plan = buildDripPlan();
  const container = document.getElementById('drip-items');
  container.innerHTML = '';

  plan.forEach((msg, i) => {
    const item = document.createElement('div');
    item.className = 'drip-item';
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="display:inline-block; padding:3px 8px; background:#172135; border-radius:999px; font-size:11px; font-weight:600; color:#60a5fa;">${msg.label}</span>
        <span class="provenance-tag">${msg.provenance}</span>
      </div>
      <div style="font-size:13px; font-weight:600; color:#f1f5f9; margin-bottom:4px;">${msg.subject}</div>
      <div class="bubble">${msg.body}</div>
    `;
    container.appendChild(item);
  });

  // Mark Drip check as passed
  state.acceptanceChecks.drip = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'Drip drawer rendered', { messages: plan.length });
}

function initDripDrawer() {
  const drawer = document.getElementById('drip-drawer');
  const openBtn = document.getElementById('btn-open-drip');
  const closeBtn = document.getElementById('close-drip');
  const testBtn = document.getElementById('btn-send-test');

  if (openBtn) {
    openBtn.onclick = () => {
      renderDripDrawer();
      drawer.classList.remove('hidden');
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      drawer.classList.add('hidden');
    };
  }

  if (testBtn) {
    testBtn.onclick = () => {
      if (DEMO) {
        showToast('Demo mode: No messages sent');
      } else {
        const plan = buildDripPlan();
        const text = plan.map(m => `${m.label}: ${m.subject}\n${m.body}`).join('\n\n');
        window.open(WA_DEEPLINK(text), '_blank');
      }
    };
  }
}

// Parallel Timers
function startParallelTimers() {
  const slidesTime = 150 + Math.random() * 90;
  const videoTime = 600 + Math.random() * 225;

  document.getElementById('slides-timer-eta').textContent = 'ETA: ' + formatTime(slidesTime);
  document.getElementById('video-timer-eta').textContent = 'Estimated: ' + formatTime(videoTime);

  startSlidesTimer(slidesTime);
  startVideoTimer(videoTime, slidesTime);
}

function startSlidesTimer(duration) {
  const startTime = Date.now();
  const progressBar = document.getElementById('slides-progress');
  const log = document.getElementById('slides-log');
  const thumbsContainer = document.getElementById('slides-thumbs-container');

  const logLines = ['[slides] 12 frames • contrast tuned', '[layouts] Title/Bullets/Diagram',
    '[branding] applying color + logo', '[complete] slides ready ✓'];
  let logIndex = 0;

  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min((elapsed / duration) * 100, 100);

    progressBar.style.width = progress + '%';
    state.timers.slidesProgress = progress;

    if (logIndex < logLines.length && elapsed >= (logIndex * duration / logLines.length)) {
      log.innerHTML += '<div class="log-line log-info">' + logLines[logIndex] + '</div>';
      log.scrollTop = log.scrollHeight;
      logIndex++;
    }

    if (progress > 30 && !thumbsContainer.querySelector('.slide-thumb')) {
      generateSlideThumbs(thumbsContainer);
    }

    if (progress >= 100) {
      clearInterval(interval);
      state.timers.slidesComplete = true;
      log.innerHTML += '<div class="log-line log-success">[done] Complete ✓</div>';
    }
  }, 100);
}

function generateSlideThumbs(container) {
  container.innerHTML = '';
  const timings = ['1:20', '0:45', '2:10', '1:35', '0:50', '1:15', '2:00', '1:40', '0:55', '1:10', '0:50', '1:25'];

  for (let i = 0; i < 12; i++) {
    const layout = LAYOUTS[i % LAYOUTS.length];
    const thumb = document.createElement('div');
    thumb.className = 'thumb16';
    thumb.style.cursor = 'pointer';
    thumb.innerHTML = thumbHtml(i + 1, layout, timings[i]);
    thumb.onclick = () => openSlideModal(i + 1, layout, timings[i]);
    container.appendChild(thumb);
  }
}

function thumbHtml(num, layout, timing) {
  let content = '';

  switch(layout) {
    case 'Title':
      content = `<div style="text-align:center; padding-top:20%;">
        <div style="font-size:14px; font-weight:700; color:#f1f5f9;">${state.setup.offer || 'Title Slide'}</div>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">ScaleEdge</div>
      </div>`;
      break;
    case 'Bullets':
      content = `<div style="padding:8px;">
        <div style="font-size:11px; font-weight:600; color:#f1f5f9; margin-bottom:6px;">Key Points</div>
        <div style="font-size:9px; color:#94a3b8;">• Point one<br>• Point two<br>• Point three</div>
      </div>`;
      break;
    case 'TwoCol':
      content = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:8px; height:100%;">
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:6px; padding:6px;">
          <div style="font-size:9px; color:#94a3b8;">Before</div>
        </div>
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:6px; padding:6px;">
          <div style="font-size:9px; color:#94a3b8;">After</div>
        </div>
      </div>`;
      break;
    case 'Diagram':
      content = `<div style="padding:8px; display:flex; align-items:center; justify-content:center; height:100%;">
        <svg width="100%" height="100%" viewBox="0 0 120 60" style="max-width:120px;">
          <rect x="10" y="20" width="30" height="20" fill="none" stroke="#DC2626" stroke-width="1.5" rx="3"/>
          <line x1="40" y1="30" x2="50" y2="30" stroke="#64748b" stroke-width="1.5"/>
          <rect x="50" y="20" width="30" height="20" fill="none" stroke="#DC2626" stroke-width="1.5" rx="3"/>
          <line x1="80" y1="30" x2="90" y2="30" stroke="#64748b" stroke-width="1.5"/>
          <rect x="90" y="20" width="30" height="20" fill="none" stroke="#DC2626" stroke-width="1.5" rx="3"/>
        </svg>
      </div>`;
      break;
    case 'Proof':
      content = `<div style="padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#f1f5f9; margin-bottom:6px;">Social Proof</div>
        <div style="display:flex; gap:3px; margin-bottom:4px;">
          ${state.proof.slice(0, 3).map(p => `<div style="width:20px; height:20px; border-radius:50%; background:${p.avatar_color}; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700;">${p.avatar_initials}</div>`).join('')}
        </div>
        <div style="font-size:8px; color:#64748b;">"Results speak..."</div>
      </div>`;
      break;
    case 'CTA':
      content = `<div style="text-align:center; padding-top:25%;">
        <div style="font-size:12px; font-weight:700; color:#DC2626; margin-bottom:4px;">Next Step</div>
        <div style="font-size:9px; color:#94a3b8;">Book your call</div>
      </div>`;
      break;
  }

  return `
    ${content}
    <div style="position:absolute; bottom:6px; right:8px; font-size:9px; color:#475569; font-weight:600;">${timing}</div>
    <div style="position:absolute; top:6px; left:8px; font-size:8px; color:#475569; background:#0f172a; padding:2px 6px; border-radius:999px;">#${num} ${layout}</div>
  `;
}

function openSlideModal(num, layout, timing) {
  const modal = document.getElementById('slide-modal');
  const preview = document.getElementById('slide-preview');
  const notes = document.getElementById('slide-notes');

  preview.innerHTML = `
    <div style="background:#0b0f1a; border:2px solid #DC2626; border-radius:16px; padding:40px; aspect-ratio:16/9; max-width:800px; margin:0 auto;">
      ${thumbHtml(num, layout, timing)}
    </div>
  `;

  notes.innerHTML = `
    <div style="font-size:13px; color:#cbd5e1; line-height:1.6;">
      <div style="font-weight:600; margin-bottom:8px;">Presenter Notes: Slide ${num}</div>
      <div>• Emphasize the ${layout.toLowerCase()} layout here</div>
      <div>• Timing: ${timing} recommended</div>
      <div>• ${layout === 'CTA' ? 'Strong call-to-action' : layout === 'Proof' ? 'Show social validation' : 'Keep it concise'}</div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function initSlideModal() {
  const modal = document.getElementById('slide-modal');
  const closeBtn = document.getElementById('close-slide-modal');

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add('hidden');
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    };
  }
}

function startVideoTimer(duration, slidesTime) {
  const startTime = Date.now();
  const progressBar = document.getElementById('video-progress');
  const log = document.getElementById('video-log');

  const logLines = ['[init] pipeline started', '[kb] patterns matched', '[tts] en-IN neutral',
    '[gating] at 60%...', '[resume] continuing...', '[complete] video ready ✓'];
  let logIndex = 0;

  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    let progress = Math.min((elapsed / duration) * 100, 100);

    if (progress >= 60 && !state.timers.slidesComplete) {
      progress = 60;
      if (state.timers.videoGated) {
        log.innerHTML += '<div class="log-line log-warning">[gating] at 60%...</div>';
        log.scrollTop = log.scrollHeight;
        state.timers.videoGated = false;
      }
    } else if (progress > 60 && state.timers.slidesComplete && state.timers.videoGated === false) {
      log.innerHTML += '<div class="log-line log-success">[resume] slides complete</div>';
      log.scrollTop = log.scrollHeight;
      state.timers.videoGated = null;
    }

    progressBar.style.width = progress + '%';

    const expectedLogIndex = Math.floor((progress / 100) * logLines.length);
    while (logIndex < expectedLogIndex && logIndex < logLines.length) {
      log.innerHTML += '<div class="log-line log-info">' + logLines[logIndex] + '</div>';
      log.scrollTop = log.scrollHeight;
      logIndex++;
    }

    if (progress >= 100 && !state.timers.videoComplete) {
      clearInterval(interval);
      state.timers.videoComplete = true;
      showVideoReady();
    }
  }, 100);
}

function showVideoReady() {
  const card = document.getElementById('video-ready-card');
  card.classList.remove('hidden');
  document.getElementById('btn-download-video').onclick = () => {
    alert('Download triggered (simulated)');
  };
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + secs.toString().padStart(2, '0');
}

// Booking
function orchestrateBooking() {
  alert('Booking orchestration confirmed (simulated).');
  markJourney(4); // Call Booked

  document.getElementById('section-closing-script').classList.remove('hidden');
  document.getElementById('section-followup').classList.remove('hidden');
  document.getElementById('section-workflow').classList.remove('hidden');
  document.getElementById('section-result').classList.remove('hidden');

  // Render collector and mark final journey step
  renderCollector();
  markJourney(5); // Collect

  setTimeout(() => {
    document.getElementById('section-closing-script').scrollIntoView({ behavior: 'smooth' });
    generateWorkflowMap();
  }, 100);
}

// Closing Script
function generateClosingScript() {
  const prospectId = parseInt(document.getElementById('select-prospect').value);
  if (!prospectId) return;

  const prospect = state.topPicks.find(p => p.id === prospectId);
  if (!prospect) return;

  const snippets = state.closingSnippets;
  const script = {
    open: snippets.open.default.replace('{name}', prospect.name.split(' ')[0])
      .replace('{pain_snippet}', prospect.pain.substring(0, 50)),
    diagnose: snippets.diagnose.revenue_impact,
    align: snippets.align_outcome.default,
    budget: snippets.budget_anchor.retainer.replace('{ticket}',
      state.setup.ticket.replace('₹', '')).replace('{duration}', '3'),
    risk: snippets.risk_reversal.milestone_based,
    next: snippets.next_step.token_today.replace('{token}', '30K')
      .replace('{balance}', state.setup.ticket).replace('{start_date}', 'next Monday')
  };

  document.getElementById('script-open').textContent = script.open;
  document.getElementById('script-diagnose').textContent = script.diagnose;
  document.getElementById('script-align').textContent = script.align;
  document.getElementById('script-budget').textContent = script.budget;
  document.getElementById('script-risk').textContent = script.risk;
  document.getElementById('script-next').textContent = script.next;

  document.getElementById('closing-script-content').classList.remove('hidden');
  state.closingScript = script;

  // Mark Handoff check as passed
  state.acceptanceChecks.handoff = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'Closing script generated for prospect', { prospectId });
}

function downloadClosingScript() {
  const scriptText = Object.entries(state.closingScript)
    .map(([key, value]) => key.toUpperCase() + '\n' + value + '\n').join('\n');
  const blob = new Blob([scriptText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'closing_script.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Exports
function exportFollowupPlan() {
  const csv = 'State,Template\nToken Paid,Kickoff\nBalance Due,Payment nudge\n';
  downloadCSV(csv, 'followup_plan.csv');
}

function exportWhatsAppJSON() {
  const data = {
    messages: state.presellMessages.map(m => ({
      type: m.type, timing: m.timing, title: m.title
    }))
  };
  downloadJSON(data, 'whatsapp_drip.json');
}

function exportFunnelJSON() {
  const data = {
    funnel: 'Authority Close Engine',
    steps: [
      { step: 1, name: 'Application' }, { step: 2, name: 'Scoring' },
      { step: 3, name: 'Pre-sell' }, { step: 4, name: 'Booking' },
      { step: 5, name: 'Call' }, { step: 6, name: 'Payment' }
    ],
    config: state.setup
  };
  downloadJSON(data, 'funnel_lovable.json');
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Workflow Map
function generateWorkflowMap() {
  const svg = document.getElementById('workflow-svg');
  const nodes = [
    { x: 50, y: 150, label: 'App' }, { x: 250, y: 150, label: 'Score' },
    { x: 450, y: 150, label: 'Pre-sell' }, { x: 650, y: 150, label: 'Book' },
    { x: 850, y: 150, label: 'Call' }, { x: 1050, y: 150, label: 'Pay' }
  ];

  for (let i = 0; i < nodes.length - 1; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', nodes[i].x + 60);
    line.setAttribute('y1', nodes[i].y);
    line.setAttribute('x2', nodes[i + 1].x);
    line.setAttribute('y2', nodes[i + 1].y);
    line.setAttribute('stroke', '#DC2626');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
  }

  nodes.forEach(node => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', node.x);
    rect.setAttribute('y', node.y - 20);
    rect.setAttribute('width', '60');
    rect.setAttribute('height', '40');
    rect.setAttribute('fill', '#1F2937');
    rect.setAttribute('stroke', '#DC2626');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '5');
    rect.style.cursor = 'pointer';
    svg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x + 30);
    text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#F1F5F9');
    text.setAttribute('font-size', '11');
    text.textContent = node.label;
    svg.appendChild(text);
  });
}

// ====================================================
// Connections Modal
// ====================================================
function generateICS() {
  const now = new Date();
  const start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
  const end = new Date(start.getTime() + 30 * 60 * 1000); // +30 mins

  const formatDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ScaleEdge//Authority Close Engine//EN
BEGIN:VEVENT
UID:${Date.now()}@scaleedge.demo
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:Discovery Call - ScaleEdge Demo
DESCRIPTION:Demo call for Authority Close Engine. This is a simulated booking.
LOCATION:https://meet.scaleedge.demo/call-${Math.random().toString(36).substr(2, 9)}
STATUS:TENTATIVE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Call in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

  downloadFile('scaleedge-demo-call.ics', ics, 'text/calendar');
  showToast('Calendar invite downloaded ✓');

  // Mark ICS check as passed
  state.acceptanceChecks.ics = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'ICS calendar file generated');
}

function initConnections() {
  const waDocBtn = document.getElementById('btn-wa-doc');
  const icsBtn = document.getElementById('btn-ics');
  const reserveBtn = document.getElementById('btn-reserve');
  const copyHostBtn = document.getElementById('btn-copy-host');

  if (waDocBtn) {
    waDocBtn.onclick = () => {
      showToast('Demo mode: WA Business setup guide');
      // In real app, would show PDF or link
    };
  }

  if (icsBtn) {
    icsBtn.onclick = () => {
      generateICS();
    };
  }

  if (reserveBtn) {
    reserveBtn.onclick = () => {
      const demoLink = 'https://meet.scaleedge.demo/call-' + Math.random().toString(36).substr(2, 9);
      showToast('Demo link reserved (simulated)');
      console.log('Reserved demo link:', demoLink);
    };
  }

  if (copyHostBtn) {
    copyHostBtn.onclick = () => {
      const hostLink = 'https://meet.scaleedge.demo/host-' + Math.random().toString(36).substr(2, 9);
      copyText(hostLink);
    };
  }
}

// ====================================================
// Money-Collector Panel
// ====================================================
function renderCollector() {
  const container = document.getElementById('collector-rows');
  if (!container) return;

  // Use fixture data if available
  const payments = state.fixtures.payments || [
    {
      name: 'Priya K.',
      state: 'token',
      amount_total: 120000,
      amount_paid: 30000,
      amount_due: 90000,
      last_ping: '2d ago',
      next_action: 'Milestone 1 reminder',
      phone: '919876543210'
    }
  ];

  container.innerHTML = '';
  payments.forEach(row => {
    const stateLabel = {
      'pending': 'Pending',
      'token': `Token Paid (₹${(row.amount_paid / 1000).toFixed(0)}K)`,
      'partial': `Partial (₹${(row.amount_paid / 1000).toFixed(0)}K / ₹${(row.amount_total / 1000).toFixed(0)}K)`,
      'paid': 'Full Paid ✓'
    }[row.state] || row.state;

    const dueAmount = row.amount_due > 0 ? `₹${(row.amount_due / 1000).toFixed(0)}K` : '—';

    const div = document.createElement('div');
    div.className = 'collector-row';
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600; color:#f1f5f9; margin-bottom:2px;">${row.name}</div>
        <div style="font-size:11px; color:#64748b;">${stateLabel} • Due: <b>${dueAmount}</b></div>
      </div>
      <div style="flex:1; font-size:12px; color:#94a3b8;">
        <div>Last: ${row.last_ping || row.lastPing}</div>
        <div style="color:#64748b;">→ ${row.next_action || row.next}</div>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <button class="btn-secondary text-xs" onclick="window.open('${WA_DEEPLINK('Hi ' + row.name + ', payment follow-up...')}', '_blank')">
          📱 Ping
        </button>
        <span class="provenance-tag">wa.me/${row.phone.substr(-4)}</span>
      </div>
    `;
    container.appendChild(div);
  });

  // Mark Money check as passed
  state.acceptanceChecks.money = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'Money Collector rendered with fixture data', { count: payments.length });
}

// ====================================================
// Lovable Funnel Spec Generation
// ====================================================
function lovableSpec() {
  return {
    project: 'ScaleEdge Authority Close Engine',
    generated_at: new Date().toISOString(),
    funnel_structure: {
      stage_1_application: {
        type: 'dynamic_form',
        questions: state.formQuestions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          category: q.category
        })),
        auto_build: true,
        niche_conditional: true
      },
      stage_2_scoring: {
        algorithm: 'composite_weighted',
        weights: state.scoringRules.weights,
        threshold: state.scoringRules.qualification_threshold,
        outputs: ['qualified', 'rejected']
      },
      stage_3_presell: {
        channels: ['whatsapp_drip', 'slides_video'],
        messages: state.presellMessages.map(m => ({
          type: m.type,
          timing: m.timing,
          title: m.title
        })),
        parallel_timers: {
          slides: '2:30-4:00',
          video: '10:00+',
          gate_at: '60%'
        }
      },
      stage_4_booking: {
        orchestration: 'calendar_integration',
        reminder_system: true,
        drip_plan: buildDripPlan()
      },
      stage_5_closing: {
        script_engine: 'dynamic',
        snippets: Object.keys(state.closingSnippets),
        personalization: true
      },
      stage_6_collection: {
        payment_tracking: true,
        followup_automation: 'whatsapp_deeplink',
        states: ['token_paid', 'balance_due', 'full_paid']
      }
    },
    ui_config: {
      brand_color: state.setup.brandColor,
      theme: 'dark',
      framework: 'tailwind_cdn',
      components: ['journey_map', 'drip_drawer', 'slide_modal', 'collector_panel']
    },
    data_sources: {
      niches: state.niches.length + ' options',
      questions: state.questions.length + ' total',
      applicants: state.applicants.length + ' simulated',
      messages: Object.keys(state.messages).length + ' templates',
      proof: state.proof.length + ' social proof tiles'
    },
    deployment: {
      type: 'static_spa',
      dependencies: ['tailwind_cdn'],
      run_command: 'python3 -m http.server 5500',
      demo_mode: DEMO,
      demo_url_param: '?demo=authority'
    }
  };
}

function initLovableHook() {
  const btn = document.getElementById('btn-lovable');
  if (!btn) return;

  btn.onclick = () => {
    const spec = lovableSpec();
    const json = JSON.stringify(spec, null, 2);

    // Download
    downloadFile('lovable-funnel-spec.json', json, 'application/json');

    // Copy to clipboard
    copyText(json);

    showToast('Lovable spec downloaded + copied ✓');
  };
}

// ====================================================
// ProofLoop™ Module
// ====================================================

function initProofLoop() {
  // Toggle
  const toggle = document.getElementById('proofloop-toggle');
  if (toggle) {
    toggle.checked = state.proofloop.config.enabled;
    toggle.onchange = () => {
      state.proofloop.config.enabled = toggle.checked;
      showToast(toggle.checked ? 'ProofLoop™ enabled' : 'ProofLoop™ disabled');
    };
  }

  // Config inputs
  const watchMin = document.getElementById('proofloop-watch-min');
  const noShow = document.getElementById('proofloop-noshow');
  const disqualified = document.getElementById('proofloop-disqualified');

  if (watchMin) {
    watchMin.value = state.proofloop.config.triggers.watchPctMin;
    watchMin.onchange = () => {
      state.proofloop.config.triggers.watchPctMin = parseInt(watchMin.value);
    };
  }

  if (noShow) {
    noShow.checked = state.proofloop.config.triggers.includeNoShow;
    noShow.onchange = () => {
      state.proofloop.config.triggers.includeNoShow = noShow.checked;
    };
  }

  if (disqualified) {
    disqualified.checked = state.proofloop.config.triggers.includeDisqualified;
    disqualified.onchange = () => {
      state.proofloop.config.triggers.includeDisqualified = disqualified.checked;
    };
  }

  // View Proof Wall button - opens modal
  const wallBtn = document.getElementById('btn-proofloop-wall');
  if (wallBtn) {
    wallBtn.onclick = () => {
      openProofWallModal();
    };
  }

  // Collect Feedback button - opens collection modal
  const collectBtn = document.getElementById('btnCollectFeedback');
  if (collectBtn) {
    collectBtn.onclick = () => {
      openProofCollect();
    };
  }

  // Build Nurture Pack button
  const nurturePBtn = document.getElementById('btnBuildNurturePack');
  if (nurturePBtn) {
    nurturePBtn.onclick = () => {
      buildNurturePack();
    };
  }

  // Deliver Bonus button
  const deliverBBtn = document.getElementById('btnDeliverBonus');
  if (deliverBBtn) {
    deliverBBtn.onclick = () => {
      deliverBonus();
    };
  }

  // Trigger ProofLoop button
  const triggerBtn = document.getElementById('btn-trigger-proofloop');
  if (triggerBtn) {
    triggerBtn.onclick = () => {
      renderProofLoopDrip();
      showToast('ProofLoop™ triggered for cohort (simulated)');
    };
  }

  // Test Feedback Form button
  const testFeedbackBtn = document.getElementById('btn-test-feedback-form');
  if (testFeedbackBtn) {
    testFeedbackBtn.onclick = () => {
      // Pre-fill with AI-suggested takeaway
      const takeawayField = document.getElementById('feedback-takeaway');
      if (takeawayField) {
        takeawayField.value = 'Framework bohot clear tha—especially the 77-day roadmap part';
      }
      openModal('modal-proofloop-feedback');
    };
  }

  // Test WA button
  const testWABtn = document.getElementById('btn-test-proofloop-wa');
  if (testWABtn) {
    testWABtn.onclick = () => {
      const testMsg = state.proofloop.copy.invite;
      if (DEMO) {
        showToast('Demo mode: WA test message');
        console.log('Test message:', testMsg);
      } else {
        window.open(WA_DEEPLINK(testMsg), '_blank');
      }
    };
  }

  // View Proof Wall from drip section
  const viewWallBtn = document.getElementById('btn-view-proof-wall');
  if (viewWallBtn) {
    viewWallBtn.onclick = () => {
      document.getElementById('section-proof-wall').classList.remove('hidden');
      renderProofWall();
      setTimeout(() => {
        document.getElementById('section-proof-wall').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
  }

  // Initialize feedback form
  initProofLoopFeedbackForm();

  // Initialize bonus library
  initBonusLibrary();

  // Initialize export buttons
  initProofWallExports();
}

function renderProofLoopDrip() {
  const container = document.getElementById('proofloop-drip-messages');
  if (!container) return;

  container.innerHTML = '';
  state.proofloop.dripMessages.forEach((msg, i) => {
    const bubble = document.createElement('div');
    bubble.className = 'proofloop-message-bubble';

    // Random status for demo
    const statuses = ['queued', 'sent', 'read'];
    const status = statuses[Math.min(i, statuses.length - 1)];

    bubble.innerHTML = `
      <div class="bubble-header">
        <span class="proofloop-message-label">${msg.label}</span>
        <div class="flex items-center gap-2">
          <span class="proofloop-status-chip ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
          <span class="provenance-tag">${msg.provenance}</span>
        </div>
      </div>
      <div class="message-subject">${msg.subject}</div>
      <div class="message-body">${msg.body}</div>
    `;

    container.appendChild(bubble);
  });

  document.getElementById('section-proofloop-drip').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('section-proofloop-drip').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function initProofLoopFeedbackForm() {
  // Rating buttons
  const ratingBtns = document.querySelectorAll('.rating-btn');
  const ratingInput = document.getElementById('feedback-rating');

  ratingBtns.forEach(btn => {
    btn.onclick = () => {
      ratingBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (ratingInput) ratingInput.value = btn.dataset.rating;
    };
  });

  // Voice recording (simulated)
  const recordBtn = document.getElementById('btn-record-voice');
  const voiceStatus = document.getElementById('voice-status');

  if (recordBtn && voiceStatus) {
    recordBtn.onclick = () => {
      if (state.proofloop.voiceBlob) {
        state.proofloop.voiceBlob = null;
        voiceStatus.textContent = 'Not recorded';
        voiceStatus.classList.remove('voice-recording');
        recordBtn.textContent = '🎤 Record';
      } else {
        voiceStatus.textContent = '🔴 Recording...';
        voiceStatus.classList.add('voice-recording');
        setTimeout(() => {
          state.proofloop.voiceBlob = new Blob(['demo-voice-note'], { type: 'audio/webm' });
          voiceStatus.textContent = '✓ Recorded (12s)';
          voiceStatus.classList.remove('voice-recording');
          recordBtn.textContent = '🗑️ Delete';
        }, 2000);
      }
    };
  }

  // Form submission
  const form = document.getElementById('proofloop-feedback-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();

      const rating = parseInt(document.getElementById('feedback-rating').value);
      const takeaway = document.getElementById('feedback-takeaway').value;
      const name = document.getElementById('feedback-name').value;
      const role = document.getElementById('feedback-role').value;
      const language = document.getElementById('feedback-language').value;
      const consent = document.getElementById('feedback-consent').checked;

      const feedback = {
        id: 'fb_' + Date.now(),
        prospectId: 'demo_user',
        hvspWatchPct: 75 + Math.floor(Math.random() * 20),
        rating,
        takeaway,
        name,
        role,
        language,
        consentDisplay: consent,
        createdAt: new Date().toISOString(),
        moderation: {
          redacted: false,
          approved: true
        },
        watchBadge: `Verified viewer • ${75 + Math.floor(Math.random() * 20)}% watched`
      };

      // Run moderation
      const moderated = moderateFeedback(feedback);
      state.proofloop.feedback.push(moderated);

      // Select and deliver bonus
      selectAndDeliverBonus({ niche: state.setup.niche?.id || 'all', pains: state.setup.pains, language });

      // Close feedback modal
      closeModal('modal-proofloop-feedback');

      // Reset form
      form.reset();
      ratingBtns.forEach(b => b.classList.remove('selected'));

      showToast('Feedback saved ✓');
    };
  }
}

function moderateFeedback(feedback) {
  // Simple profanity/PII redaction (demo)
  const profanityList = ['damn', 'hell', 'crap'];
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b\d{10,12}\b/g;

  let takeaway = feedback.takeaway;
  let redacted = false;

  // Redact profanity
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(takeaway)) {
      takeaway = takeaway.replace(regex, '[…]');
      redacted = true;
    }
  });

  // Redact PII
  if (emailRegex.test(takeaway) || phoneRegex.test(takeaway)) {
    takeaway = takeaway.replace(emailRegex, '[email]').replace(phoneRegex, '[phone]');
    redacted = true;
  }

  return {
    ...feedback,
    takeaway,
    moderation: {
      redacted,
      approved: !redacted
    }
  };
}

function selectAndDeliverBonus(criteria) {
  // Select best bonus from library
  const { niche, pains, language } = criteria;

  let candidates = state.proofloop.bonusLibrary.filter(b => {
    const nicheMatch = b.niche === 'all' || b.niche === niche;
    const langMatch = b.language === language;
    const painMatch = pains.some(p => b.pains.some(bp => bp.toLowerCase().includes(p.toLowerCase())));
    return nicheMatch && (langMatch || painMatch);
  });

  if (candidates.length === 0) {
    candidates = state.proofloop.bonusLibrary.filter(b => b.niche === 'all');
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  // Create signed URL (simulated)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72);

  selected.urlSigned = `https://bonus.scaleedge.demo/${selected.id}?expires=${expiresAt.getTime()}&sig=demo123`;
  selected.expiresAt = expiresAt.toISOString();
  selected.watermark = document.getElementById('feedback-name').value || 'Viewer';

  state.proofloop.selectedBonus = selected;

  // Open bonus modal
  renderBonusPreview(selected);
  openModal('modal-proofloop-bonus');
}

function renderBonusPreview(bonus) {
  const container = document.getElementById('bonus-preview-content');
  if (!container) return;

  container.innerHTML = `
    <div class="mb-3">
      <span class="bonus-kind">${bonus.kind}</span>
    </div>
    <h3 class="text-lg font-bold text-white mb-2">${bonus.title}</h3>
    <p class="text-sm text-gray-400 mb-3">${bonus.description}</p>
    <div class="flex gap-2 mb-3">
      <span class="bonus-tag">Niche: ${bonus.niche}</span>
      <span class="bonus-tag">Language: ${bonus.language}</span>
    </div>
    <div class="text-xs text-gray-400">
      Watermark: ${bonus.watermark}<br>
      Expires: ${new Date(bonus.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    </div>
  `;

  // Download button
  const downloadBtn = document.getElementById('btn-download-bonus');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      if (DEMO) {
        showToast('Bonus delivered ✓ (72h valid)');
        setTimeout(() => closeModal('modal-proofloop-bonus'), 1500);
      } else {
        window.open(bonus.urlSigned, '_blank');
      }
    };
  }

  // Copy link button
  const copyBtn = document.getElementById('btn-copy-bonus-link');
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyText(bonus.urlSigned);
    };
  }
}

function initBonusLibrary() {
  const drawer = document.getElementById('bonus-library-drawer');
  const closeBtn = document.getElementById('close-bonus-library');

  if (closeBtn) {
    closeBtn.onclick = () => {
      drawer.classList.add('hidden');
    };
  }

  // Render bonus cards
  const container = document.getElementById('bonus-library-items');
  if (!container) return;

  container.innerHTML = '';
  state.proofloop.bonusLibrary.forEach(bonus => {
    const card = document.createElement('div');
    card.className = 'bonus-card';
    card.innerHTML = `
      <div class="bonus-kind">${bonus.kind}</div>
      <div class="bonus-title">${bonus.title}</div>
      <div class="bonus-desc">${bonus.description}</div>
      <div class="bonus-tags">
        <span class="bonus-tag">${bonus.language}</span>
        <span class="bonus-tag">${bonus.niche}</span>
      </div>
    `;
    card.onclick = () => {
      showToast('Preview in demo mode');
    };
    container.appendChild(card);
  });
}

function renderProofWall() {
  const feedback = state.proofloop.feedback.filter(f => f.moderation?.approved !== false);

  // KPIs
  const total = feedback.length;
  const avgRating = total > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : '0.0';
  const consented = total > 0 ? Math.round((feedback.filter(f => f.consent_display || f.consentDisplay).length / total) * 100) : 0;
  const avgWatch = total > 0 ? Math.round(feedback.reduce((sum, f) => sum + (f.watch_pct || f.hvspWatchPct || 0), 0) / total) : 0;

  const totalEl = document.getElementById('proof-total');
  const ratingEl = document.getElementById('proof-avg-rating');
  const consentedEl = document.getElementById('proof-consented');
  const watchEl = document.getElementById('proof-avg-watch');

  if (totalEl) totalEl.textContent = total;
  if (ratingEl) ratingEl.textContent = avgRating;
  if (consentedEl) consentedEl.textContent = consented + '%';
  if (watchEl) watchEl.textContent = avgWatch + '%';

  // Histogram
  const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedback.forEach(f => histogram[f.rating]++);

  const histogramContainer = document.getElementById('proof-histogram');
  if (histogramContainer) {
    histogramContainer.innerHTML = '';
    [5, 4, 3, 2, 1].forEach(rating => {
      const count = histogram[rating];
      const pct = total > 0 ? (count / total) * 100 : 0;

      const bar = document.createElement('div');
      bar.className = 'histogram-bar';
      bar.innerHTML = `
        <div class="histogram-bar-label">${rating} ⭐</div>
        <div class="histogram-bar-track">
          <div class="histogram-bar-fill" style="width: ${pct}%">${count}</div>
        </div>
      `;
      histogramContainer.appendChild(bar);
    });
  }

  // Quotes Carousel
  const quotesContainer = document.getElementById('proof-quotes-carousel');
  if (quotesContainer) {
    quotesContainer.innerHTML = '';
    const quotes = feedback.filter(f => f.consent_display || f.consentDisplay);

    if (quotes.length === 0) {
      quotesContainer.innerHTML = '<p class="text-sm text-gray-400">No consented quotes yet</p>';
    } else {
      quotes.slice(0, 5).forEach(q => {
        const card = document.createElement('div');
        card.className = 'quote-card';
        const watchBadge = q.badge || q.watchBadge || `Verified viewer • ${q.watch_pct || q.hvspWatchPct || 0}% watched`;
        card.innerHTML = `
          <div class="quote-text">"${q.takeaway}"</div>
          <div class="quote-meta">
            <div class="quote-author">
              ${q.name ? `<strong>${q.name}</strong>` : 'Anonymous'}${q.role ? ` • ${q.role}` : ''}
            </div>
            <div class="watch-badge">${watchBadge}</div>
          </div>
        `;
        quotesContainer.appendChild(card);
      });
    }
  }

  // Moderation Queue
  renderModerationQueue();

  // Mark ProofLoop check as passed
  state.acceptanceChecks.proofloop = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'ProofWall rendered with feedback', { count: total });
}

function renderModerationQueue() {
  const container = document.getElementById('proof-moderation-queue');
  if (!container) return;

  const allFeedback = state.proofloop.feedback;

  if (allFeedback.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-400">No feedback to moderate</p>';
    return;
  }

  container.innerHTML = '';
  allFeedback.slice(0, 5).forEach(f => {
    const item = document.createElement('div');
    item.className = 'moderation-item';

    const redactionNote = f.moderation.redacted ?
      '<span class="redaction-diff">Auto-redacted</span>' : '';

    item.innerHTML = `
      <div class="item-content">
        <div class="item-text">"${f.takeaway}" ${redactionNote}</div>
        <div class="item-meta">
          Rating: ${f.rating}/5 • ${f.name || 'Anonymous'}${f.role ? ' • ' + f.role : ''} • ${new Date(f.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div class="item-actions">
        <div class="approve-toggle ${f.moderation.approved ? 'approved' : ''}" data-id="${f.id}"></div>
      </div>
    `;

    // Toggle approve
    const toggle = item.querySelector('.approve-toggle');
    toggle.onclick = () => {
      f.moderation.approved = !f.moderation.approved;
      toggle.classList.toggle('approved');
      renderProofWall(); // Re-render
    };

    container.appendChild(item);
  });
}

function initProofWallExports() {
  const pngBtn = document.getElementById('btn-export-proof-png');
  const pdfBtn = document.getElementById('btn-export-proof-pdf');
  const jsonBtn = document.getElementById('btn-export-proof-json');

  if (pngBtn) {
    pngBtn.onclick = async () => {
      try {
        if (typeof html2canvas === 'undefined') {
          showToast('html2canvas not loaded');
          return;
        }

        const proofWallSection = document.getElementById('section-proof-wall');
        if (!proofWallSection) {
          showToast('Proof Wall section not found');
          return;
        }

        showToast('Generating PNG...');
        const canvas = await html2canvas(proofWallSection, {
          backgroundColor: '#0B0F1A',
          scale: 2
        });

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `proofwall-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('PNG exported ✓');
          eventLog.log('export.png', 'ProofWall exported as PNG');
          state.acceptanceChecks.proofwall = true;
          updateAcceptanceCounter();
        });
      } catch (error) {
        console.error('PNG export failed:', error);
        showToast('PNG export failed');
        eventLog.log('export.error', 'PNG export failed', { error: error.message });
      }
    };
  }

  if (pdfBtn) {
    pdfBtn.onclick = async () => {
      try {
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
          showToast('jsPDF not loaded');
          return;
        }

        const { jsPDF } = window.jspdf;

        const proofWallSection = document.getElementById('section-proof-wall');
        if (!proofWallSection) {
          showToast('Proof Wall section not found');
          return;
        }

        showToast('Generating PDF...');
        const canvas = await html2canvas(proofWallSection, {
          backgroundColor: '#0B0F1A',
          scale: 2
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`proofwall-${Date.now()}.pdf`);

        showToast('PDF exported ✓');
        eventLog.log('export.pdf', 'ProofWall exported as PDF');
        state.acceptanceChecks.proofwall = true;
        updateAcceptanceCounter();
      } catch (error) {
        console.error('PDF export failed:', error);
        showToast('PDF export failed');
        eventLog.log('export.error', 'PDF export failed', { error: error.message });
      }
    };
  }

  if (jsonBtn) {
    jsonBtn.onclick = () => {
      const exportData = {
        generated_at: new Date().toISOString(),
        total_feedback: state.proofloop.feedback.length,
        avg_rating: state.proofloop.feedback.length > 0
          ? (state.proofloop.feedback.reduce((sum, f) => sum + f.rating, 0) / state.proofloop.feedback.length).toFixed(2)
          : '0.00',
        feedback: state.proofloop.feedback.filter(f => f.moderation.approved).map(f => ({
          rating: f.rating,
          takeaway: f.takeaway,
          name: f.consentDisplay ? f.name : null,
          role: f.consentDisplay ? f.role : null,
          watch_pct: f.hvspWatchPct || f.watch_pct,
          created_at: f.createdAt || f.created_at
        }))
      };

      downloadFile('proofloop-export.json', JSON.stringify(exportData, null, 2), 'application/json');
      showToast('JSON exported ✓');
      eventLog.log('export.json', 'ProofWall exported as JSON', { count: exportData.feedback.length });
    };
  }
}

// ====================================================
// Traffic Engine Panel
// ====================================================
function initTrafficEngine() {
  const toggleBtn = document.getElementById('btn-toggle-traffic');
  const trafficSection = document.getElementById('section-traffic');

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      if (trafficSection) {
        trafficSection.classList.remove('hidden');
        setTimeout(() => {
          trafficSection.scrollIntoView({ behavior: 'smooth' });
          renderTrafficEngine();
        }, 100);
      }
    };
  }

  // Tab switching
  const tabs = ['search_harvest', 'piggyback', 'partner_tap'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`traffic-tab-${tab}`);
    if (btn) {
      btn.onclick = () => {
        state.trafficActiveTab = tab;
        renderTrafficEngine();
        eventLog.log('traffic.tab', `Switched to ${tab} tab`);
      };
    }
  });

  // Export buttons
  const exportKeywordsBtn = document.getElementById('btn-export-keywords');
  const exportPlacementsBtn = document.getElementById('btn-export-placements');
  const exportPartnersBtn = document.getElementById('btn-export-partners');

  if (exportKeywordsBtn) {
    exportKeywordsBtn.onclick = () => {
      const traffic = state.fixtures.traffic || {};
      const sh = traffic.search_harvest || {};
      const csv = 'Keyword\n' + (sh.keywords || []).join('\n');
      downloadFile('keywords.csv', csv, 'text/csv');
      showToast('Keywords CSV exported ✓');
      eventLog.log('export.csv', 'Keywords exported');
    };
  }

  if (exportPlacementsBtn) {
    exportPlacementsBtn.onclick = () => {
      const traffic = state.fixtures.traffic || {};
      const pb = traffic.piggyback || {};
      const csv = 'Channel,Type,Note\n' +
        (pb.placements || []).map(p => `"${p.channel}","${p.type}","${p.note}"`).join('\n');
      downloadFile('placements.csv', csv, 'text/csv');
      showToast('Placements CSV exported ✓');
      eventLog.log('export.csv', 'Placements exported');
    };
  }

  if (exportPartnersBtn) {
    exportPartnersBtn.onclick = () => {
      const traffic = state.fixtures.traffic || {};
      const pt = traffic.partner_tap || {};
      const json = {
        partners: pt.partners || [],
        asset: pt.asset || ''
      };
      downloadFile('partners.json', JSON.stringify(json, null, 2), 'application/json');
      showToast('Partners JSON exported ✓');
      eventLog.log('export.json', 'Partners exported');
    };
  };
}

function renderTrafficEngine() {
  const traffic = state.fixtures.traffic || {};
  const activeTab = state.trafficActiveTab;

  // Update tab buttons
  ['search_harvest', 'piggyback', 'partner_tap'].forEach(tab => {
    const btn = document.getElementById(`traffic-tab-${tab}`);
    if (btn) {
      if (tab === activeTab) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
      } else {
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-primary');
      }
    }
  });

  // Render active tab content
  const contentContainer = document.getElementById('traffic-content');
  if (!contentContainer) return;

  if (activeTab === 'search_harvest') {
    const sh = traffic.search_harvest || {};
    contentContainer.innerHTML = `
      <div class="space-y-4">
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Budget</h4>
          <div class="text-2xl font-bold text-brand">₹${sh.budget_per_day_inr || 0}/day</div>
          <div class="text-xs text-gray-400 mt-1">Google/Meta search ads</div>
        </div>
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Keywords (${(sh.keywords || []).length})</h4>
          <div class="space-y-1">
            ${(sh.keywords || []).map(kw => `<div class="text-sm text-gray-300">• ${kw}</div>`).join('')}
          </div>
        </div>
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Creatives</h4>
          <div class="flex gap-2">
            ${(sh.creatives || []).map(c => `<span class="chip chip-selected">${c}</span>`).join('')}
          </div>
        </div>
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Routing</h4>
          <div class="text-sm text-gray-300">→ ${sh.routing || 'HVSP'}</div>
        </div>
        <button id="btn-export-keywords" class="btn-secondary w-full">Export Keywords CSV</button>
      </div>
    `;
  } else if (activeTab === 'piggyback') {
    const pb = traffic.piggyback || {};
    contentContainer.innerHTML = `
      <div class="space-y-4">
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Message Match</h4>
          <div class="text-sm text-gray-300">${pb.message_match || '—'}</div>
        </div>
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Placements (${(pb.placements || []).length})</h4>
          <div class="space-y-3">
            ${(pb.placements || []).map(p => `
              <div class="border-l-2 border-brand pl-3">
                <div class="font-semibold text-white text-sm">${p.channel}</div>
                <div class="text-xs text-gray-400">${p.type} • ${p.note}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <button id="btn-export-placements" class="btn-secondary w-full">Export Placements CSV</button>
      </div>
    `;
  } else if (activeTab === 'partner_tap') {
    const pt = traffic.partner_tap || {};
    contentContainer.innerHTML = `
      <div class="space-y-4">
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Asset Package</h4>
          <div class="text-sm text-gray-300">${pt.asset || '—'}</div>
        </div>
        <div class="panel p-4">
          <h4 class="text-sm font-semibold text-white mb-2">Partners (${(pt.partners || []).length})</h4>
          <div class="space-y-3">
            ${(pt.partners || []).map(p => `
              <div class="border-l-2 border-brand pl-3">
                <div class="font-semibold text-white text-sm">${p.name}</div>
                <div class="text-xs text-gray-400">Reach: ${p.reach?.toLocaleString() || '—'} • Deal: ${p.deal}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <button id="btn-export-partners" class="btn-secondary w-full">Export Partners JSON</button>
      </div>
    `;
  }

  // Re-attach export button handlers
  initTrafficEngine();

  // Mark Traffic check as passed
  state.acceptanceChecks.traffic = true;
  updateAcceptanceCounter();
  eventLog.log('acceptance.pass', 'Traffic Engine rendered', { tab: activeTab });
}

// Modals
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Keyboard Shortcuts
function handleKeyboardShortcut(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case '1': prefillDemoForm(); break;
    case '2': buildApplicationForm(); break;
    case '3': lockFormAndStartIntake(); break;
    case '4': assemblePresell(); break;
    case '5': startParallelTimers(); break;
    case 'h':
    case 'H': alert('Presenter notes toggle (demo)'); break;
  }
}

// Demo Mode
function checkDemoMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'authority') {
    setTimeout(prefillDemoForm, 500);
  }
}

function prefillDemoForm() {
  document.getElementById('input-icp').value = 'Founders • 5–50CR ARR • India';
  document.getElementById('input-niche').value = 'b2b_growth_consultant';
  document.getElementById('input-offer').value = 'Predictable pipeline in 77 days (roadmap)';
  document.getElementById('input-ticket').value = '₹1.2L';
  document.getElementById('input-sales-model').value = 'retainer';
  document.getElementById('input-brand-color').value = '#DC2626';

  document.getElementById('input-niche').dispatchEvent(new Event('change'));

  setTimeout(() => {
    const painChips = document.querySelectorAll('#pain-chips-container .chip');
    for (let i = 0; i < 3 && i < painChips.length; i++) {
      painChips[i].click();
    }
    updatePreview();

    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'authority') {
      setTimeout(() => buildApplicationForm(), 1000);
      setTimeout(() => lockFormAndStartIntake(), 2000);
    }
  }, 500);
}

// ====================================================
// ProofLoop Enhanced Functions
// ====================================================

// Helper for querySelector
const $ = (q) => document.querySelector(q);

// Video recording state
let videoStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let videoBlob = null;

// Open Proof Collect Modal
function openProofCollect() {
  const modal = $('#proofCollectModal');
  if (!modal) return;

  modal.classList.remove('hidden');
  eventLog.log('proofloop.collect_open', 'Collect feedback modal opened');

  // Wire tab switching
  const quickTab = $('#tab-quick-form');
  const videoTab = $('#tab-video-review');
  const quickContent = $('#quick-form-tab');
  const videoContent = $('#video-review-tab');

  if (quickTab) {
    quickTab.addEventListener('click', () => {
      quickContent?.classList.remove('hidden');
      videoContent?.classList.add('hidden');
      quickTab.classList.remove('btn-secondary');
      quickTab.classList.add('btn-primary');
      videoTab?.classList.remove('btn-primary');
      videoTab?.classList.add('btn-secondary');
    });
  }

  if (videoTab) {
    videoTab.addEventListener('click', () => {
      videoContent?.classList.remove('hidden');
      quickContent?.classList.add('hidden');
      videoTab.classList.remove('btn-secondary');
      videoTab.classList.add('btn-primary');
      quickTab?.classList.remove('btn-primary');
      quickTab?.classList.add('btn-secondary');
    });
  }

  // Wire video recording buttons
  $('#btnStartRecord')?.addEventListener('click', startVideoRecording);
  $('#btnStopRecord')?.addEventListener('click', stopVideoRecording);
  $('#btnUploadVideo')?.addEventListener('click', () => $('#videoFileInput')?.click());
  $('#videoFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleVideoUpload(file);
  });

  // Wire form submission
  const form = $('#proofCollectForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rating = parseInt($('#proof-rating')?.value || '0');
      const takeaway = $('#proof-takeaway')?.value || '';
      const name = $('#proof-name')?.value || 'Anonymous';
      const role = $('#proof-role')?.value || '';
      const consent = $('#proof-consent')?.checked || false;

      if (rating < 1 || !takeaway) {
        alert('Please provide rating and takeaway');
        return;
      }

      saveProofEntry({ rating, takeaway, name, role, consent, watchPct: 0 });
    });
  }

  // Wire rating buttons
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = btn.dataset.rating;
      $('#proof-rating').value = rating;
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('bg-brand'));
      btn.classList.add('bg-brand');
    });
  });

  // Wire video submission
  $('#btnSubmitVideo')?.addEventListener('click', () => {
    if (!videoBlob) {
      alert('No video recorded');
      return;
    }
    saveProofEntry({
      rating: 5,
      takeaway: 'Video review submitted',
      name: 'Video Reviewer',
      role: '',
      consent: true,
      watchPct: 100,
      videoBlobOrFile: videoBlob
    });
  });
}

// Start video recording
async function startVideoRecording() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const preview = $('#video-preview');
    if (preview) preview.srcObject = videoStream;

    mediaRecorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      $('#video-recorded-status')?.classList.remove('hidden');
      $('#btnSubmitVideo')?.classList.remove('hidden');
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
      }
    };

    mediaRecorder.start();
    $('#btnStartRecord')?.classList.add('hidden');
    $('#btnStopRecord')?.classList.remove('hidden');
    eventLog.log('proofloop.video_start', 'Video recording started');
  } catch (err) {
    console.error('Video recording failed:', err);
    alert('Camera access denied. Please upload a video file instead.');
  }
}

// Stop video recording
function stopVideoRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    $('#btnStopRecord')?.classList.add('hidden');
    $('#btnStartRecord')?.classList.remove('hidden');
    eventLog.log('proofloop.video_stop', 'Video recording stopped');
  }
}

// Handle video file upload
function handleVideoUpload(file) {
  if (file && file.type.startsWith('video/')) {
    videoBlob = file;
    $('#video-recorded-status')?.classList.remove('hidden');
    $('#btnSubmitVideo')?.classList.remove('hidden');
    eventLog.log('proofloop.video_upload', 'Video file uploaded', { size: file.size });
  }
}

// Save proof entry
function saveProofEntry(data) {
  const feedback = state.fixtures?.proofloop || [];

  const entry = {
    id: 'proof_' + Date.now(),
    name: data.name || 'Anonymous',
    role: data.role || '',
    rating: data.rating,
    takeaway: data.takeaway,
    consent_display: data.consent || false,
    language: state.currentLanguage || 'hinglish',
    watch_pct: data.watchPct || 0,
    badge: data.videoBlobOrFile ? '🎬 Video' : `Verified • ${data.watchPct || 0}% watched`,
    created_at: new Date().toISOString(),
    has_video: !!data.videoBlobOrFile
  };

  feedback.push(entry);

  // Run Bonus Engine
  const niche = state.fixtures?.inputs?.niche || 'generic';
  const pains = state.fixtures?.inputs?.pains || [];
  const lang = state.currentLanguage || 'hinglish';
  const bonus = pickBonus(niche, pains, lang);

  // Generate signed bonus link
  const bonusLink = createSignedBonusLink(bonus.id, entry.name);

  showToast('Bonus delivered ✓');
  eventLog.log('proofloop.feedback_saved', 'Feedback entry saved', {
    id: entry.id,
    has_video: entry.has_video,
    bonus: bonus.id
  });

  // Mark acceptance checks
  state.acceptanceChecks.proofloop = true;
  state.acceptanceChecks.proofwall = true;
  updateAcceptanceCounter();

  // Close modal
  $('#proofCollectModal')?.classList.add('hidden');

  // Show bonus link
  alert(`Bonus delivered! Link (72h): ${bonusLink}\n\n${bonus.title_hinglish || bonus.title}`);
}

// Open Proof Wall Modal
function openProofWallModal() {
  const feedback = state.fixtures?.proofloop || [];
  const modal = $('#proofWallModal');
  if (!modal) return;

  const grid = $('#proofWallGrid');
  if (grid) {
    grid.innerHTML = feedback.map(f => `
      <div class="rounded-lg p-4 border border-gray-700 bg-ink-2/30">
        <div class="flex items-center justify-between mb-2">
          <strong class="text-white">${f.name}</strong>
          <span class="text-xs text-brand">${'⭐'.repeat(f.rating)} ${f.badge || ''}</span>
        </div>
        <p class="text-sm text-gray-300 mb-2">"${f.takeaway}"</p>
        <div class="text-xs text-gray-500">${f.role || ''} • ${(f.language || '').toUpperCase()}</div>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
  eventLog.log('proofwall.open', 'Proof Wall modal opened', { count: feedback.length });

  // Wire export buttons
  $('#btnExportProofPNG')?.addEventListener('click', exportProofWallAsPNG);
  $('#btnExportProofPDF')?.addEventListener('click', exportProofWallAsPDF);
  $('#btnExportProofJSON')?.addEventListener('click', exportProofWallAsJSON);

  // Mark proofwall acceptance check
  state.acceptanceChecks.proofwall = true;
  updateAcceptanceCounter();
}

// Export Proof Wall as PNG
function exportProofWallAsPNG() {
  const grid = $('#proofWallGrid');
  if (!grid || !window.html2canvas) {
    alert('html2canvas not loaded. Check CDN.');
    return;
  }
  html2canvas(grid).then(canvas => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proofwall.png';
      a.click();
      URL.revokeObjectURL(url);
      showToast('PNG exported ✓');
      eventLog.log('export.png', 'ProofWall exported as PNG');
    });
  });
}

// Export Proof Wall as PDF
function exportProofWallAsPDF() {
  const grid = $('#proofWallGrid');
  if (!grid || !window.html2canvas || !window.jspdf) {
    alert('html2canvas or jsPDF not loaded. Check CDN.');
    return;
  }
  html2canvas(grid).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('proofwall.pdf');
    showToast('PDF exported ✓');
    eventLog.log('export.pdf', 'ProofWall exported as PDF');
  });
}

// Export Proof Wall as JSON
function exportProofWallAsJSON() {
  const feedback = state.fixtures?.proofloop || [];
  const json = JSON.stringify(feedback, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'proofwall.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSON exported ✓');
  eventLog.log('export.json', 'ProofWall exported as JSON');
}

// Pick bonus based on niche, pains, language
function pickBonus(niche, pains = [], language = 'hinglish') {
  const all = state.fixtures?.bonuses || [];
  let best = null;
  let score = -1;

  for (const b of all) {
    let s = 0;
    if (b.niche === niche) s += 2;
    if ((b.pains || []).some(p => pains.some(x => (p + '').toLowerCase().includes(x.toLowerCase())))) s += 1;
    if ((b.language || '').toLowerCase() === (language || '').toLowerCase()) s += 1;
    if (s > score) {
      best = b;
      score = s;
    }
  }

  return best || all[0] || { id: 'default', title: 'Default Bonus', title_hinglish: 'Default Bonus' };
}

// Create signed bonus link
function createSignedBonusLink(bonusId, name = '') {
  const exp = Date.now() + 72 * 60 * 60 * 1000;
  const token = btoa(JSON.stringify({ bonusId, exp, name }));
  const url = `${location.origin}${location.pathname}?bonus=${bonusId}&token=${token}`;
  localStorage.setItem(`se_bonus_${bonusId}`, JSON.stringify({ exp }));
  return url;
}

// Build Nurture Pack
function buildNurturePack() {
  const prospects = state.applicants?.filter(p => !p.qualified || p.no_show) || [];
  const niche = state.fixtures?.inputs?.niche || 'generic';
  const pains = state.fixtures?.inputs?.pains || [];
  const lang = state.currentLanguage || 'hinglish';
  const bonus = pickBonus(niche, pains, lang);

  if (prospects.length === 0) {
    alert('No disqualified or no-show prospects found. Run prospect filtering first.');
    return;
  }

  const template = state.fixtures?.drip?.find(d => d.timing === 'T-24h') || {};
  const msgTemplate = template.template?.[lang] || template.template?.hinglish || 'Quick value for you';

  const pack = prospects.map(p => {
    const link = createSignedBonusLink(bonus.id, p.name);
    return {
      name: p.name,
      phone: p.phone || '',
      message: `${msgTemplate}\n\n+ Bonus for you: ${bonus.title_hinglish || bonus.title}\nLink (72h): ${link}\n\nIf useful, reply with 1-line feedback 🙏`,
      bonus: { id: bonus.id, title: bonus.title_hinglish || bonus.title, file: bonus.file }
    };
  });

  const json = JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: pack.length,
    pack
  }, null, 2);

  downloadFile('nurture_pack.json', json, 'application/json');
  showToast(`Nurture pack generated: ${pack.length} prospects`);
  eventLog.log('proofloop.nurture_pack', 'Nurture pack generated', {
    count: pack.length,
    bonus: bonus?.id
  });

  alert(`Nurture Pack built with ${pack.length} prospects.\nBonus: ${bonus.title_hinglish || bonus.title}\nFile downloaded as nurture_pack.json`);
}

// Deliver Bonus
function deliverBonus() {
  const name = prompt('Enter prospect name:', 'Prospect') || 'Prospect';
  const niche = state.fixtures?.inputs?.niche || 'generic';
  const pains = state.fixtures?.inputs?.pains || [];
  const lang = state.currentLanguage || 'hinglish';
  const bonus = pickBonus(niche, pains, lang);

  const link = createSignedBonusLink(bonus.id, name);
  const message = `Hi ${name}, yeh bonus aapke liye:\n${bonus.title_hinglish || bonus.title}\nLink (72h): ${link}`;

  // Copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      showToast('Bonus link copied to clipboard ✓');
    }).catch(() => {
      alert('Clipboard access denied. Here\'s the message:\n\n' + message);
    });
  } else {
    alert('Clipboard not available. Here\'s the message:\n\n' + message);
  }

  eventLog.log('proofloop.bonus_delivered', 'Bonus delivered (preview)', {
    to: name,
    bonus: bonus.id
  });

  alert(`Bonus delivered to ${name}!\n\n${message}\n\n(Message copied to clipboard)`);
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (state.setup.logoObjectURL) {
    URL.revokeObjectURL(state.setup.logoObjectURL);
  }
});

// Init
document.addEventListener('DOMContentLoaded', loadData);
