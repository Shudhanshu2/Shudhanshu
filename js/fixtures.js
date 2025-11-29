// ScaleEdge ICE - Data Fixtures Loader
// =====================================

export async function loadFixtures() {
    try {
        const [niches, questions, scoring, drip, proofloop, traffic] = await Promise.all([
            loadJSON('/data/niches.json'),
            loadJSON('/data/questions.json'),
            loadJSON('/data/scoring.json'),
            loadJSON('/data/drip.json'),
            loadJSON('/data/proofloop.json'),
            loadJSON('/data/traffic.json')
        ]);

        return {
            niches,
            questions,
            scoring,
            drip,
            proofloop,
            traffic
        };
    } catch (error) {
        console.error('Error loading fixtures:', error);
        // Return fallback data if JSON files fail to load
        return getFallbackData();
    }
}

async function loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return response.json();
}

// Fallback data in case JSON files are missing
function getFallbackData() {
    return {
        niches: [
            {
                name: 'B2B Consulting',
                pains: ['Pipeline unpredictable hai', 'Selling nahi aati', 'Manual grinding']
            },
            {
                name: 'Agency Owner',
                pains: ['Client acquisition expensive hai', 'Retention low hai', 'Scaling mushkil hai']
            },
            {
                name: 'Coach/Course Creator',
                pains: ['Launch fatigue hai', 'Evergreen nahi bann raha', 'Ads costly hain']
            }
        ],
        questions: [],
        scoring: {
            thresholds: {
                qualified: 60,
                nurture: 40
            }
        },
        drip: [
            {
                timing: 'T-72h',
                title: 'Confirmation & What to Expect',
                message: 'Hey! Call confirmed. Yeh rahega agenda: 1) Your current situation 2) Fit check 3) Clear next steps. No pressure, doctor-frame.',
                type: 'WhatsApp'
            },
            {
                timing: 'T-24h',
                title: 'Preparation Reminder',
                message: 'Reminder: Call tomorrow. Quick prep: Revenue target, current bottleneck, ideal scenario. 30 min focused conversation.',
                type: 'WhatsApp'
            },
            {
                timing: 'T-2h',
                title: 'Final Reminder',
                message: 'Call in 2 hours. Calendar link attached. On time aana - value your time and mine both.',
                type: 'WhatsApp'
            }
        ],
        proofloop: [
            {
                name: 'Rajesh K.',
                niche: 'B2B SaaS Consultant',
                rating: 5,
                feedback: 'AI Twin ne presentation ka kaam bilkul transform kar diya. Pehle 10 demos karne padte the, ab sirf qualified leads aate hain.'
            },
            {
                name: 'Priya S.',
                niche: 'Agency Owner',
                rating: 5,
                feedback: 'ICE system se pipeline predictable ho gayi. WhatsApp automation alone saved 15 hours/week. Highly recommend!'
            },
            {
                name: 'Amit D.',
                niche: 'Executive Coach',
                rating: 4,
                feedback: 'Skeptical tha initially but results speak. 3 months mein ₹12L ki pipeline just from AI Twin + ICE nurturing.'
            },
            {
                name: 'Sneha M.',
                niche: 'Marketing Consultant',
                rating: 5,
                feedback: 'ProofLoop is genius. Unqualified leads se bhi value nikal liya. Social proof automatically build ho raha hai.'
            },
            {
                name: 'Vikram R.',
                niche: 'B2B Growth Advisor',
                rating: 5,
                feedback: 'Doctor-frame approach alag hai. No pushy sales. System genuine hai aur results bhi. Worth every rupee.'
            },
            {
                name: 'Kavya T.',
                niche: 'Business Coach',
                rating: 4,
                feedback: 'AI Twin slides bahut structured hain. Clients ko value mila selling se pehle hi. Closing easy ho gayi.'
            }
        ],
        traffic: {
            search: [
                { query: 'B2B client acquisition system', intent: 'High', volume: '1.2K' },
                { query: 'automated sales funnel India', intent: 'High', volume: '890' },
                { query: 'high ticket coaching system', intent: 'High', volume: '720' }
            ],
            piggyback: [
                { name: 'Growth Talks India', audience: '45K', type: 'Business' },
                { name: 'Scale Podcast', audience: '32K', type: 'Startups' }
            ],
            partners: [
                { name: 'B2B Leaders Community', network: 'Slack', reach: '2.5K members' },
                { name: 'Founder Circle India', network: 'WhatsApp', reach: '1.8K members' }
            ]
        }
    };
}
