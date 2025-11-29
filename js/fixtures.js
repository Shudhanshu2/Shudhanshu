// ============================================================================
// Fixtures Helper Module
// ============================================================================
// Helper utilities for loading and managing fixture data

/**
 * Load a JSON file from the fixtures directory
 * @param {string} filename - Name of the file (e.g., 'inputs.json')
 * @returns {Promise<object>} Parsed JSON data
 */
async function loadFixture(filename) {
    try {
        const response = await fetch(`fixtures/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`[Fixtures] Failed to load ${filename}:`, error);
        throw error;
    }
}

/**
 * Load a JSON file from the data directory
 * @param {string} filename - Name of the file (e.g., 'niches.json')
 * @returns {Promise<object>} Parsed JSON data
 */
async function loadData(filename) {
    try {
        const response = await fetch(`data/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`[Data] Failed to load ${filename}:`, error);
        throw error;
    }
}

/**
 * Load all fixtures in parallel
 * @returns {Promise<object>} Object with all fixture data
 */
async function loadAllFixtures() {
    const fixtureFiles = [
        'inputs.json',
        'pains.json',
        'drip.json',
        'prospects.json',
        'payments.json',
        'bonuses.json',
        'proofloop.json',
        'traffic.json'
    ];

    const results = {};
    const promises = fixtureFiles.map(async (filename) => {
        try {
            const data = await loadFixture(filename);
            const key = filename.replace('.json', '');
            results[key] = data;
            return { success: true, file: filename, size: JSON.stringify(data).length };
        } catch (error) {
            console.error(`[Fixtures] Error loading ${filename}:`, error);
            results[filename.replace('.json', '')] = null;
            return { success: false, file: filename, error: error.message };
        }
    });

    await Promise.all(promises);
    return results;
}

/**
 * Load all core data files in parallel
 * @returns {Promise<object>} Object with all data
 */
async function loadAllData() {
    const dataFiles = [
        'niches.json',
        'questions.json',
        'scoring_rules.json',
        'messages.json',
        'closing_snippets.json',
        'proofloop.json',
        'applicants.json',
        'knowledge_base.json',
        'proof.json',
        'testimonials.json'
    ];

    const results = {};
    const promises = dataFiles.map(async (filename) => {
        try {
            const data = await loadData(filename);
            const key = filename.replace('.json', '');
            results[key] = data;
            return { success: true, file: filename, size: JSON.stringify(data).length };
        } catch (error) {
            console.error(`[Data] Error loading ${filename}:`, error);
            results[filename.replace('.json', '')] = null;
            return { success: false, file: filename, error: error.message };
        }
    });

    await Promise.all(promises);
    return results;
}

/**
 * Merge fixture data into app state
 * @param {object} state - App state object
 * @param {object} fixtures - Fixtures data
 */
function applyFixtures(state, fixtures) {
    // Apply inputs fixture if available
    if (fixtures.inputs) {
        state.setup = {
            ...state.setup,
            ...fixtures.inputs.setup
        };
    }

    // Apply pains fixture
    if (fixtures.pains) {
        state.setup.pains = fixtures.pains.selected || [];
    }

    // Apply drip fixture
    if (fixtures.drip) {
        state.presellMessages = fixtures.drip.messages || [];
    }

    // Apply prospects fixture
    if (fixtures.prospects) {
        state.applicants = fixtures.prospects.applicants || [];
    }

    // Apply payments fixture
    if (fixtures.payments) {
        // Payment messages are typically in state.messages, but we can store them separately
        if (!state.paymentMessages) {
            state.paymentMessages = fixtures.payments.messages || [];
        }
    }

    // Apply bonuses fixture
    if (fixtures.bonuses) {
        state.proofloop.bonusLibrary = fixtures.bonuses.library || [];
    }

    // Apply proofloop fixture
    if (fixtures.proofloop) {
        state.proofloop = {
            ...state.proofloop,
            ...fixtures.proofloop
        };
    }

    // Apply traffic fixture
    if (fixtures.traffic) {
        if (!state.trafficStrategies) {
            state.trafficStrategies = fixtures.traffic.strategies || {};
        }
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadFixture,
        loadData,
        loadAllFixtures,
        loadAllData,
        applyFixtures
    };
}
