// ScaleEdge Authority Close Engine - Main Application
// ====================================================

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
    videoGated: true, videoComplete: false }
};

// Data Loading
async function loadData() {
  try {
    const [niches, questions, scoring, applicants, messages, closing, proof, kb] =
      await Promise.all([
        fetch('data/niches.json').then(r => r.json()),
        fetch('data/questions.json').then(r => r.json()),
        fetch('data/scoring_rules.json').then(r => r.json()),
        fetch('data/applicants.json').then(r => r.json()),
        fetch('data/messages.json').then(r => r.json()),
        fetch('data/closing_snippets.json').then(r => r.json()),
        fetch('data/proof.json').then(r => r.json()),
        fetch('data/knowledge_base.json').then(r => r.json())
      ]);

    Object.assign(state, {niches, questions, scoringRules: scoring, applicants,
      messages, closingSnippets: closing, proof, knowledgeBase: kb});
    initializeUI();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// UI Initialization
function initializeUI() {
  populateNicheDropdown();
  populateProofTiles();
  populateKnowledgeBase();
  attachEventListeners();
  checkDemoMode();
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
  alert('WhatsApp drip scheduled (simulated). No messages sent.');
  document.getElementById('section-booking').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('section-booking').scrollIntoView({ behavior: 'smooth' });
  }, 100);
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
  const timings = ['1:20', '0:45', '2:10', '1:35', '0:50', '1:15', '2:00', '1:40', '0:55'];

  for (let i = 0; i < 9; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'slide-thumb';
    thumb.style.borderColor = state.setup.brandColor;
    thumb.innerHTML = '<div class="slide-thumb-content">' +
      '<div class="slide-thumb-title">Slide ' + (i + 1) + '</div>' +
      '<div class="slide-thumb-dots">• • •</div>' +
      '<div class="slide-thumb-timing">' + timings[i] + '</div></div>';
    container.appendChild(thumb);
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
  document.getElementById('section-closing-script').classList.remove('hidden');
  document.getElementById('section-followup').classList.remove('hidden');
  document.getElementById('section-workflow').classList.remove('hidden');
  document.getElementById('section-result').classList.remove('hidden');

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

// Cleanup
window.addEventListener('beforeunload', () => {
  if (state.setup.logoObjectURL) {
    URL.revokeObjectURL(state.setup.logoObjectURL);
  }
});

// Init
document.addEventListener('DOMContentLoaded', loadData);
