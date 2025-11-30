/**
 * ScaleEdge ICE - Fixtures Loader
 * Loads all data fixtures from JSON files with fallback support
 */

/**
 * Load all fixtures from the fixtures directory
 * @returns {Promise<Object>} Object containing all loaded fixtures
 */
async function loadAllFixtures() {
    const fixtureFiles = [
        'inputs',
        'pains',
        'drip',
        'prospects',
        'payments',
        'bonuses',
        'proofloop',
        'traffic'
    ];

    const fixtures = {};

    for (const file of fixtureFiles) {
        try {
            const response = await fetch(`./fixtures/${file}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            fixtures[file] = await response.json();

            if (window.APP && window.APP.log) {
                window.APP.log('fixture.loaded', `Loaded ${file}.json`, {
                    size: JSON.stringify(fixtures[file]).length
                });
            }
        } catch (error) {
            console.warn(`Failed to load fixtures/${file}.json:`, error);

            if (window.APP && window.APP.log) {
                window.APP.log('fixture.error', `Failed to load ${file}.json`, {
                    error: error.message
                });
            }

            // Provide fallback data
            fixtures[file] = getFallbackData(file);
        }
    }

    return fixtures;
}

/**
 * Load data files from the data directory
 * @returns {Promise<Object>} Object containing all loaded data files
 */
async function loadAllData() {
    const dataFiles = [
        'niches',
        'questions',
        'scoring_rules',
        'messages',
        'closing_snippets',
        'proofloop',
        'applicants',
        'knowledge_base',
        'proof',
        'testimonials'
    ];

    const data = {};

    for (const file of dataFiles) {
        try {
            const response = await fetch(`./data/${file}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            data[file] = await response.json();

            if (window.APP && window.APP.log) {
                window.APP.log('data.loaded', `Loaded ${file}.json`, {
                    size: JSON.stringify(data[file]).length
                });
            }
        } catch (error) {
            console.warn(`Failed to load data/${file}.json:`, error);

            if (window.APP && window.APP.log) {
                window.APP.log('data.error', `Failed to load ${file}.json`, {
                    error: error.message
                });
            }

            // Provide fallback data
            data[file] = getDataFallback(file);
        }
    }

    return data;
}

/**
 * Get fallback data for fixtures
 * @param {string} filename - Name of the fixture file
 * @returns {any} Fallback data
 */
function getFallbackData(filename) {
    const fallbacks = {
        inputs: {
            icp: "B2B SaaS Founders",
            niche: "b2b_saas",
            offer: "Revenue Acceleration Program",
            ticket: "₹5-15L",
            salesModel: "retainer",
            pains: [
                "Pipeline unpredictable hai",
                "Long sales cycles",
                "Unqualified demos waste time"
            ]
        },
        pains: [
            "Pipeline unpredictable hai",
            "Selling nahi aati",
            "Manual grinding daily",
            "Long sales cycles",
            "Unqualified demos",
            "Revenue inconsistent"
        ],
        drip: [
            {
                id: "t_minus_72h",
                timing: "T-72h",
                title: "Call Confirmed",
                message: "Hey {name}! Your call is confirmed for {date} at {time}. Excited to chat!",
                type: "whatsapp"
            },
            {
                id: "t_minus_24h",
                timing: "T-24h",
                title: "Tomorrow Reminder",
                message: "Reminder: We have our call tomorrow at {time}. See you then!",
                type: "whatsapp"
            },
            {
                id: "t_minus_2h",
                timing: "T-2h",
                title: "Today's Call",
                message: "Our call is in 2 hours. Calendar link: {calendar_link}",
                type: "whatsapp"
            }
        ],
        prospects: [
            {
                name: "Rahul Sharma",
                email: "rahul@example.com",
                phone: "+91 98765 43210",
                score: 85,
                qualified: true
            }
        ],
        payments: [
            {
                prospect: "Rahul Sharma",
                stage: "token_paid",
                amount: "₹50,000",
                due: "₹4,50,000"
            }
        ],
        bonuses: [
            {
                id: "playbook_1",
                title: "10 High-Intent Keywords for Your Niche",
                description: "Research-backed keywords that convert",
                format: "PDF",
                expiry: "72h"
            }
        ],
        proofloop: {
            enabled: true,
            triggerScore: 40,
            collectAfter: "video_complete",
            bonusDelay: "immediate"
        },
        traffic: {
            search_harvest: [
                {
                    keyword: "B2B client acquisition system",
                    intent: "High",
                    volume: "1.2K/mo"
                }
            ],
            piggyback: [
                {
                    channel: "Growth Talks India",
                    audience: "45K",
                    type: "Podcast"
                }
            ],
            partner_taps: [
                {
                    community: "B2B Leaders Slack",
                    members: "2.5K",
                    activity: "High"
                }
            ]
        }
    };

    return fallbacks[filename] || {};
}

/**
 * Get fallback data for data files
 * @param {string} filename - Name of the data file
 * @returns {any} Fallback data
 */
function getDataFallback(filename) {
    const fallbacks = {
        niches: [
            {
                id: "b2b_saas",
                label: "B2B SaaS",
                pains: ["Long sales cycles", "Unqualified demos", "Churn high"]
            },
            {
                id: "agency",
                label: "Agency Owner",
                pains: ["Client acquisition expensive", "Retention low", "Scaling hard"]
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Current monthly revenue?",
                type: "number",
                weight: 25,
                scoring: { "0-100k": 5, "100k-500k": 15, "500k+": 25 }
            },
            {
                id: "q2",
                text: "Biggest pain point?",
                type: "select",
                weight: 20,
                options: ["Getting leads", "Converting leads", "Retention"]
            }
        ],
        scoring_rules: {
            qualified_threshold: 60,
            ice_nurture_threshold: 60,
            proofloop_threshold: 40
        },
        messages: {
            whatsapp: {
                t_minus_72h: "Call confirmed for {date} at {time}",
                t_minus_24h: "Reminder: Call tomorrow at {time}",
                t_minus_2h: "Call in 2 hours: {link}"
            }
        },
        closing_snippets: {
            opening: "Great to connect, {name}! Let's dive into your {pain}...",
            diagnosis: "Based on what you shared, the core issue is {diagnosis}...",
            prescription: "Here's what I recommend: {solution}...",
            close: "Does this sound like a fit?"
        },
        proofloop: {
            enabled: true,
            config: {
                trigger_score: 40,
                collect_after: "video_complete"
            },
            feedback: []
        },
        applicants: [],
        knowledge_base: {
            ice: {
                title: "What is ICE?",
                content: "Integrated Client Engine - automated qualification, nurturing, and closing system"
            },
            proofloop: {
                title: "What is ProofLoop?",
                content: "System to convert unqualified leads into social proof and testimonials"
            }
        },
        proof: [],
        testimonials: [
            {
                name: "Priya M.",
                niche: "Agency Owner",
                rating: 5,
                text: "ICE system transformed my pipeline. Highly recommend!",
                verified: true
            }
        ]
    };

    return fallbacks[filename] || {};
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAllFixtures,
        loadAllData,
        getFallbackData,
        getDataFallback
    };
}
