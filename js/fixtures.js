// Fixture Loader
// Loads all JSON fixtures with graceful error handling

export async function loadFixtures() {
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

  const results = {};

  await Promise.all(
    fixtureFiles.map(async (name) => {
      try {
        const response = await fetch(`./fixtures/${name}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        results[name] = await response.json();
        console.log(`✓ Loaded ${name}.json`);
      } catch (error) {
        console.error(`✗ Failed to load ${name}.json:`, error);
        window.log && window.log('fixture.error', `Failed to load ${name}.json`, { error: error.message });
        results[name] = name === 'inputs' ? {} : [];
      }
    })
  );

  return results;
}

// Initialize global state
export function initState(fixtures) {
  return {
    fixtures,
    currentLanguage: fixtures.inputs?.language || 'hinglish',
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
}
