// ScaleEdge ICE - Main Application Logic
// ========================================

import { loadFixtures } from './fixtures.js';
import { EventLog } from './eventlog.js';
import { SlideEngine } from './slideEngine.js';

// Application State
const state = {
    niches: [],
    questions: [],
    scoring: {},
    drip: [],
    proofloop: [],
    traffic: {},
    currentSlides: [],
    applicants: [],
    acceptanceCount: 0,
    stats: {
        asp: 0,
        qualified: 0,
        nurture: 0,
        proof: 0
    }
};

// Initialize EventLog
const eventLog = new EventLog();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    eventLog.log('SYSTEM', 'ICE Engine initializing...');

    // Load all data fixtures
    try {
        const data = await loadFixtures();
        state.niches = data.niches;
        state.questions = data.questions;
        state.scoring = data.scoring;
        state.drip = data.drip;
        state.proofloop = data.proofloop;
        state.traffic = data.traffic;

        eventLog.log('SYSTEM', 'All fixtures loaded successfully');
        initializeApp();
    } catch (error) {
        eventLog.log('ERROR', `Failed to load fixtures: ${error.message}`);
        console.error(error);
    }
});

function initializeApp() {
    // Populate niche dropdown
    populateNicheDropdown();

    // Load traffic data
    loadTrafficData();

    // Load proof wall
    loadProofWall();

    // Load drip timeline
    loadDripTimeline();

    // Setup event listeners
    setupEventListeners();

    // Setup modal handlers
    setupModals();

    // Load initial stats
    updateStats();

    // Setup payment table
    setTimeout(setupPaymentActions, 500);

    eventLog.log('SYSTEM', 'ICE Engine ready');
}

function populateNicheDropdown() {
    const select = document.getElementById('nicheSelect');
    state.niches.forEach(niche => {
        const option = document.createElement('option');
        option.value = niche.name;
        option.textContent = niche.name;
        select.appendChild(option);
    });

    // Set default to B2B Consulting
    select.value = 'B2B Consulting';

    // Prefill form with default
    prefillDefaultNiche();
}

function prefillDefaultNiche() {
    const niche = state.niches.find(n => n.name === 'B2B Consulting');
    if (niche) {
        document.getElementById('offerInput').value = 'High-Ticket B2B Consulting Program';
        document.getElementById('ticketInput').value = '₹3-10L';
        document.getElementById('painsInput').value = niche.pains.join(', ');
        document.getElementById('brandingInput').value = 'ScaleEdge Systems';
    }
}

function loadTrafficData() {
    // Search Keywords
    const searchContainer = document.getElementById('searchKeywords');
    state.traffic.search.forEach(keyword => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-900 rounded-lg';
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-300">"${keyword.query}"</span>
                <span class="px-2 py-1 bg-primary text-xs rounded">${keyword.intent}</span>
            </div>
            <span class="text-sm text-gray-500">~${keyword.volume}/mo</span>
        `;
        searchContainer.appendChild(div);
    });

    // Piggyback Channels
    const piggybacking Container = document.getElementById('piggybacking');
    state.traffic.piggyback.forEach(channel => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-900 rounded-lg';
        div.innerHTML = `
            <div>
                <div class="text-sm font-medium text-white">${channel.name}</div>
                <div class="text-xs text-gray-500">${channel.audience} subscribers</div>
            </div>
            <span class="text-xs px-2 py-1 bg-gray-700 rounded">${channel.type}</span>
        `;
        piggybacking Container.appendChild(div);
    });

    // Partners
    const partnersContainer = document.getElementById('partners');
    state.traffic.partners.forEach(partner => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-900 rounded-lg';
        div.innerHTML = `
            <div>
                <div class="text-sm font-medium text-white">${partner.name}</div>
                <div class="text-xs text-gray-500">${partner.network}</div>
            </div>
            <span class="text-xs px-2 py-1 bg-gray-700 rounded">${partner.reach}</span>
        `;
        partnersContainer.appendChild(div);
    });
}

function loadProofWall() {
    const container = document.getElementById('proofWall');
    container.innerHTML = '';

    state.proofloop.slice(0, 6).forEach(proof => {
        const card = document.createElement('div');
        card.className = 'proof-card';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        ${proof.name.charAt(0)}
                    </div>
                    <div>
                        <div class="text-sm font-medium text-white">${proof.name}</div>
                        <div class="text-xs text-gray-500">${proof.niche}</div>
                    </div>
                </div>
                <div class="verified-badge">
                    ✓ Verified
                </div>
            </div>
            <div class="flex items-center mb-2">
                ${'⭐'.repeat(proof.rating)}
            </div>
            <p class="text-sm text-gray-400">${proof.feedback}</p>
        `;
        container.appendChild(card);
    });

    updateStats();
}

function loadDripTimeline() {
    const container = document.getElementById('dripTimeline');
    container.innerHTML = '';

    state.drip.forEach(item => {
        const div = document.createElement('div');
        div.className = 'drip-item';
        div.innerHTML = `
            <div class="drip-time">${item.timing}</div>
            <div class="drip-content">
                <div class="text-sm font-medium text-white mb-1">${item.title}</div>
                <div class="text-xs text-gray-400 mb-2">${item.message}</div>
                <div class="text-xs text-gray-600">Type: ${item.type}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function setupEventListeners() {
    // ASP Form Submit
    document.getElementById('aspForm').addEventListener('submit', (e) => {
        e.preventDefault();
        generateSlides();
    });

    // Niche selection change
    document.getElementById('nicheSelect').addEventListener('change', (e) => {
        const niche = state.niches.find(n => n.name === e.target.value);
        if (niche) {
            document.getElementById('painsInput').value = niche.pains.join(', ');
        }
    });

    // Download PDF
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        eventLog.log('ASP', 'PDF download initiated (simulated)');
        incrementAcceptance();
        alert('PDF download simulated. In production, this would generate a PDF of all slides.');
    });

    // Trigger ProofLoop
    document.getElementById('triggerProofLoopBtn').addEventListener('click', () => {
        openProofFeedbackModal();
        eventLog.log('PROOFLOOP', 'Feedback modal opened for cohort');
        incrementAcceptance();
    });

    // Export Proof Wall
    document.getElementById('exportProofBtn').addEventListener('click', () => {
        eventLog.log('PROOFLOOP', 'Proof wall export initiated (simulated)');
        incrementAcceptance();
        alert('Proof wall export simulated. In production, this would generate a PNG image.');
    });

    // Simulate Applicants
    document.getElementById('simulateApplicantsBtn').addEventListener('click', () => {
        simulateApplicants();
    });

    // Test Drip
    document.getElementById('testDripBtn').addEventListener('click', () => {
        sendTestDrip();
    });

    // Generate Script
    document.getElementById('generateScriptBtn').addEventListener('click', () => {
        generateClosingScript();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Header buttons
    document.getElementById('knowledgeBtn').addEventListener('click', () => {
        openModal('knowledgeModal');
    });

    document.getElementById('eventLogBtn').addEventListener('click', () => {
        openModal('eventLogModal');
        renderEventLog();
    });

    document.getElementById('connectionsBtn').addEventListener('click', () => {
        openModal('connectionsModal');
        incrementAcceptance();
    });

    // Clear log
    document.getElementById('clearLogBtn').addEventListener('click', () => {
        eventLog.clear();
        renderEventLog();
    });

    // ProofLoop feedback
    setupProofLoopHandlers();
}

function generateSlides() {
    const formData = {
        niche: document.getElementById('nicheSelect').value,
        offer: document.getElementById('offerInput').value,
        ticket: document.getElementById('ticketInput').value,
        pains: document.getElementById('painsInput').value.split(',').map(p => p.trim()),
        branding: document.getElementById('brandingInput').value
    };

    eventLog.log('ASP', `Generating slides for ${formData.niche}`);

    // Generate slides using SlideEngine
    const slideEngine = new SlideEngine(formData);
    state.currentSlides = slideEngine.generate();

    // Render thumbnails
    renderSlideThumbnails();

    // Show preview container
    document.getElementById('slidePreviewContainer').classList.remove('hidden');

    // Update stats
    state.stats.asp++;
    updateStats();

    eventLog.log('ASP', '12 slides generated successfully');
    incrementAcceptance();
}

function renderSlideThumbnails() {
    const container = document.getElementById('slideThumbnails');
    container.innerHTML = '';

    state.currentSlides.forEach((slide, index) => {
        const div = document.createElement('div');
        div.className = 'slide-thumbnail';
        div.innerHTML = `
            <div class="slide-number">${index + 1}</div>
            <div class="slide-content">
                <div class="font-semibold mb-2">${slide.title}</div>
                <div class="text-xs text-gray-500">${slide.type}</div>
            </div>
        `;
        div.addEventListener('click', () => openSlidePreview(index));
        container.appendChild(div);
    });
}

function openSlidePreview(index) {
    const slide = state.currentSlides[index];
    const modal = document.getElementById('slideModal');
    const title = document.getElementById('slideModalTitle');
    const body = document.getElementById('slideModalBody');
    const notes = document.getElementById('slideModalNotes');

    title.textContent = `Slide ${index + 1}: ${slide.title}`;
    body.innerHTML = `
        <div class="p-8 text-center">
            <h2 class="text-2xl font-bold text-white mb-4">${slide.title}</h2>
            <div class="text-gray-400">${slide.content}</div>
        </div>
    `;
    notes.textContent = slide.notes;

    modal.classList.add('active');
    eventLog.log('ASP', `Slide ${index + 1} previewed`);
}

function simulateApplicants() {
    eventLog.log('ICE', 'Simulating 20 applicants...');

    const container = document.getElementById('applicantsList');
    container.innerHTML = '';

    const names = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha P.', 'Vikram R.', 'Anjali D.', 'Rohan G.', 'Kavya T.', 'Sanjay B.', 'Divya N.', 'Arjun W.', 'Meera L.', 'Karan J.', 'Pooja C.', 'Varun E.', 'Nisha F.', 'Aditya H.', 'Riya S.', 'Harsh M.', 'Tanvi P.'];

    state.applicants = [];
    let qualified = 0;
    let unqualified = 0;

    names.forEach((name, i) => {
        const score = Math.floor(Math.random() * 100);
        const isQualified = score >= 60;

        const applicant = {
            name,
            score,
            qualified: isQualified
        };

        state.applicants.push(applicant);

        if (isQualified) qualified++;
        else unqualified++;

        const div = document.createElement('div');
        div.className = `applicant-item ${isQualified ? 'applicant-qualified' : 'applicant-unqualified'}`;
        div.innerHTML = `
            <div class="flex-1">
                <div class="text-sm font-medium text-white">${name}</div>
                <div class="text-xs text-gray-500">Score: ${score}/100</div>
            </div>
            <div class="px-3 py-1 rounded text-xs font-medium ${isQualified ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}">
                ${isQualified ? 'Qualified → ICE Nurture' : 'Unqualified → ProofLoop'}
            </div>
        `;
        container.appendChild(div);

        eventLog.log('ICE', `${name} scored ${score} - ${isQualified ? 'QUALIFIED' : 'UNQUALIFIED'}`);
    });

    state.stats.qualified = qualified;
    state.stats.nurture = qualified;
    state.stats.proof += unqualified;
    updateStats();

    incrementAcceptance();

    // Update journey
    updateJourneyStep(2);
    setTimeout(() => updateJourneyStep(3), 1000);
}

function sendTestDrip() {
    const testMessage = encodeURIComponent(state.drip[0].message);
    const whatsappUrl = `https://wa.me/?text=${testMessage}`;

    eventLog.log('ICE', 'Opening WhatsApp with test drip message');
    window.open(whatsappUrl, '_blank');
    incrementAcceptance();
}

function generateClosingScript() {
    const script = `
CLOSING SCRIPT (Generated by ICE)
==================================

Prospect: [Name from applicant]
Pain Points: Pipeline unpredictable hai, Selling nahi aati, Manual grinding
Offer: High-Ticket B2B Consulting Program
Ticket: ₹3-10L

OPENING:
"Bahut accha laga aapke application ko dekhke. Aapki situation bilkul clear hai - aapko ek predictable system chahiye, not just another strategy."

DIAGNOSIS (Doctor-Frame):
"Maine dekha aapke forms mein - pipeline inconsistent hai, daily grind se pareshan ho, aur selling mein struggle hai. Sahi samjha na?"

PRESCRIPTION:
"Dekhiye, humara system 3 engines pe kaam karta hai:
1. ASP (AI Twin) - Selling aapke liye handle karega
2. Traffic Engine - High-intent leads automatically
3. ICE - Nurturing se lekar payment tak, system sambhal lega

Aapko sirf show up karna hai for closing calls. Baaki sab automated."

CLOSE:
"Ab main aapko force nahi karunga. Agar aapko lagta hai ki ye fit hai, we move forward. Nahi toh no hard feelings. Aap decide karo."

[PAUSE - Let them decide]

NEXT STEPS:
"Perfect. Token payment ₹X leke hum aapka system setup shuru karte hain. Balance call se pehle clear kar dena. Sound good?"
    `;

    document.getElementById('closingScript').textContent = script.trim();
    eventLog.log('ICE', 'Closing script generated');
    incrementAcceptance();
}

function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active to selected
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.classList.remove('active');
        });
    });

    // Click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function renderEventLog() {
    const container = document.getElementById('eventLogContent');
    const logs = eventLog.getLogs();

    container.innerHTML = logs.map(log => `
        <div class="log-entry">
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-engine">[${log.engine}]</span>
            <span class="log-message">${log.message}</span>
        </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function setupProofLoopHandlers() {
    // Star rating
    let selectedRating = 0;
    document.querySelectorAll('#starRating .star').forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            document.querySelectorAll('#starRating .star').forEach((s, i) => {
                if (i < selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Recording buttons
    document.getElementById('recordVideoBtn').addEventListener('click', () => {
        document.getElementById('recordingStatus').textContent = '📹 Video recording simulated (requires MediaRecorder API)';
        setTimeout(() => {
            document.getElementById('recordingStatus').textContent = '';
        }, 3000);
    });

    document.getElementById('recordVoiceBtn').addEventListener('click', () => {
        document.getElementById('recordingStatus').textContent = '🎤 Voice recording simulated (requires MediaRecorder API)';
        setTimeout(() => {
            document.getElementById('recordingStatus').textContent = '';
        }, 3000);
    });

    // Submit feedback
    document.getElementById('submitFeedbackBtn').addEventListener('click', () => {
        const feedback = document.getElementById('feedbackText').value;
        if (!feedback) {
            alert('Please provide written feedback');
            return;
        }

        eventLog.log('PROOFLOOP', `Feedback submitted: ${selectedRating} stars`);

        // Close modal
        document.getElementById('proofFeedbackModal').classList.remove('active');

        // Show bonus
        alert('Thank you! Your bonus has been generated:\n\n🎁 Exclusive: "10 High-Intent Keywords for Your Niche"\n\nValid for 72 hours. Check your email.');

        // Add to proof wall
        const newProof = {
            name: 'You',
            niche: document.getElementById('nicheSelect').value,
            rating: selectedRating,
            feedback: feedback
        };
        state.proofloop.unshift(newProof);
        state.stats.proof++;
        loadProofWall();

        // Reset form
        document.getElementById('feedbackText').value = '';
        selectedRating = 0;
        document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('active'));

        incrementAcceptance();
    });
}

function openProofFeedbackModal() {
    document.getElementById('proofFeedbackModal').classList.add('active');
}

function updateStats() {
    document.getElementById('stat-asp').textContent = state.stats.asp;
    document.getElementById('stat-qualified').textContent = state.stats.qualified;
    document.getElementById('stat-nurture').textContent = state.stats.nurture;
    document.getElementById('stat-proof').textContent = state.stats.proof;
}

function updateJourneyStep(step) {
    document.querySelectorAll('.journey-step').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelector(`.journey-step[data-step="${step}"]`).classList.add('active');
}

function incrementAcceptance() {
    state.acceptanceCount++;
    document.getElementById('acceptanceCounter').textContent = state.acceptanceCount;

    if (state.acceptanceCount >= 10) {
        eventLog.log('SYSTEM', '🎉 Full system acceptance achieved!');
    }
}

// Simulate payment actions
function setupPaymentActions() {
    const paymentData = [
        { name: 'Rahul S.', stage: 'Token Paid', amount: '₹50,000', balance: '₹2,50,000' },
        { name: 'Priya M.', stage: 'Balance Due', amount: '₹3,00,000', balance: '₹3,00,000' },
        { name: 'Amit K.', stage: 'Fully Paid', amount: '₹5,00,000', balance: '₹0' }
    ];

    const tbody = document.getElementById('paymentTable');
    tbody.innerHTML = paymentData.map(p => `
        <tr class="border-b border-gray-800">
            <td class="py-3 text-white">${p.name}</td>
            <td class="py-3">
                <span class="px-2 py-1 rounded text-xs ${p.stage === 'Fully Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}">
                    ${p.stage}
                </span>
            </td>
            <td class="py-3 text-gray-400">${p.amount}</td>
            <td class="py-3">
                ${p.balance !== '₹0' ? `
                    <button class="text-xs px-3 py-1 bg-primary hover:bg-red-700 rounded nudge-payment" data-name="${p.name}" data-amount="${p.balance}">
                        Nudge Payment
                    </button>
                ` : '<span class="text-xs text-green-500">✓ Complete</span>'}
            </td>
        </tr>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.nudge-payment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const amount = e.target.dataset.amount;
            const message = encodeURIComponent(`Hi ${name}, reminder: Balance payment of ${amount} pending. Please complete by EOD tomorrow. Payment link: [simulated]`);
            const whatsappUrl = `https://wa.me/?text=${message}`;

            eventLog.log('ICE', `Payment nudge sent to ${name}`);
            window.open(whatsappUrl, '_blank');
            incrementAcceptance();
            updateJourneyStep(5);
        });
    });
}

export { state, eventLog };
