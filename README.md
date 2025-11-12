# ScaleEdge Authority Close Engine

Complete static demo for the **Authority Close Engine** — a single-agent system that automates application building, scoring, pre-sell nurturing, booking orchestration, and closing workflows.

## Features

- **Application Form Auto-Builder**: Generates optimized forms from client inputs with live preview
- **Smart Scoring System**: PAIN/BUDGET/TIMELINE/FIT qualification with adjustable weights
- **WhatsApp Pre-Sell Drip**: 3-5 message sequences with Twin Engine assets
- **Booking Orchestration**: Gap calculation, reminders, and meeting platform integration (simulated)
- **Per-Prospect Closing Scripts**: Custom scripts generated from applicant data
- **Post-Call Follow-ups**: Branching workflows for Token/Balance/Defer/Thinking states
- **Workflow Visualization**: Interactive swim-lane map of the entire funnel
- **Multiple Exports**: WhatsApp JSON, Funnel JSON (Lovable), Follow-up CSV, Closing Scripts

## Tech Stack

- **100% Static** - No backend required, works offline
- **Tailwind CSS** - Via Play CDN for styling
- **Vanilla JavaScript** - No frameworks, pure ES6 modules
- **Local Data** - All data stored in JSON files
- **Privacy-First** - No network calls except Tailwind CDN

## Quick Start

### Option 1: Direct File Open

Simply open `index.html` in your browser:

```bash
open index.html
# or double-click the file
```

### Option 2: Local Server (Recommended)

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Demo Mode

Access the full auto-run demo:

```
http://localhost:8000?demo=authority
```

This will:
1. Prefill the form with B2B Consulting preset
2. Auto-build the application form
3. Start intake simulation with 20 applicants
4. Run through the entire workflow automatically

## Keyboard Shortcuts

Press these keys anywhere (not in input fields):

- `1` - Prefill form (B2B Consulting preset)
- `2` - Lock form & build application form
- `3` - Start intake simulation
- `4` - Assemble pre-sell pack
- `5` - Start parallel timers (slides + video)
- `H` - Toggle presenter notes

## File Structure

```
/
├── index.html              # Main application file
├── css/
│   └── styles.css          # ScaleEdge red theme + components
├── js/
│   └── app.js              # Complete application logic
├── data/
│   ├── niches.json         # 20+ niche definitions with pains/examples
│   ├── questions.json      # Application form question bank
│   ├── scoring_rules.json  # Weights & disqualification rules
│   ├── applicants.json     # 20 sample Indian market applicants
│   ├── messages.json       # WhatsApp pre-sell templates
│   ├── closing_snippets.json  # Closing script blocks
│   ├── proof.json          # Testimonial micro-tiles
│   └── knowledge_base.json # 30-40 KB folders
└── README.md               # This file
```

## Workflow Overview

1. **Client Setup**: Configure ICP, niche, offer, ticket, pains, branding
2. **Form Designer**: Auto-generate application questions with scoring rules
3. **Intake Simulation**: Load & score 20 applicants over 45-90 seconds
4. **Qualification**: Split into Top Picks (≥65) and Rejects with reasons
5. **Pre-Sell Pack**: 3-5 WhatsApp messages with timing (T-48h, T-24h, etc.)
6. **Parallel Timers**: 
   - Slides: 2:30-4:00 with real 16:9 thumbnails
   - Video: 10:00+ with 60% gate until slides complete
7. **Booking Orchestration**: Gap suggestion + reminder sequence
8. **Closing Script**: Per-prospect customized from their answers
9. **Follow-ups**: Token/Balance/Defer/Thinking branching workflows
10. **Workflow Map**: Interactive SVG visualization

## Key Features in Detail

### Realistic Timers

- **Slides Timer**: 150-240 seconds with live log updates
- **Video Timer**: 600-825 seconds with 60% gate dependency
- Both run in parallel with deterministic + randomized timing
- Progress bars, ETAs, and scrolling logs

### Scoring System

Adjustable weights (default):
- Pain: 40%
- Budget: 35%
- Timeline: 15%
- Fit: 10%

Composite score ≥65 = Qualified

### Privacy & Compliance

- All processing happens locally
- No data sent to servers
- Object URLs cleaned up on unload
- "Illustrative; results vary" disclaimers on proof
- "Local only—stays on your device" captions on uploads

### Mock Integrations

All connections are simulated:
- WhatsApp Business API (badge: Connected)
- Google Meet / Zoom (badge: Connected)
- Lovable (badge: Ready - export funnel JSON)

## Data Files

### niches.json
20+ Indian market niches with:
- Pains (8 per niche)
- Objections (5 per niche)
- Examples (3 per niche)
- Industry terms (5 per niche)

### applicants.json
20 realistic Indian applicants with:
- Names, companies, roles
- Pain narratives (Hinglish)
- Budget ranges (₹ notation)
- Timeline urgency
- Decision-maker status

### messages.json
Pre-sell templates:
- Value tips (2-3)
- Proof chips (2-3)
- Belief breaks (1-2)
- CTA reminders (T-1h, T-10m, no-show)
- Mini-video reference (hvsp_ready.mp4)

## Customization

### Change Brand Color

Edit in Client Setup or via CSS variable:
```css
:root {
  --brand: #DC2626;  /* ScaleEdge red */
}
```

### Add More Niches

Edit `data/niches.json`:
```json
{
  "id": "your_niche",
  "name": "Your Niche Name",
  "pains": ["pain 1", "pain 2", ...],
  "objections": [...],
  "examples": [...],
  "industry_terms": [...]
}
```

### Modify Scoring Rules

Edit `data/scoring_rules.json`:
```json
{
  "weights": {
    "pain": 0.40,
    "budget": 0.35,
    "timeline": 0.15,
    "fit": 0.10
  },
  "qualification_threshold": 65
}
```

## Export Formats

### WhatsApp JSON
```json
{
  "messages": [
    {
      "type": "Value Tip",
      "timing": "T-48h",
      "title": "...",
      "content": "..."
    }
  ]
}
```

### Funnel JSON (Lovable)
```json
{
  "funnel": "Authority Close Engine",
  "steps": [...],
  "config": { /* setup data */ }
}
```

### Follow-up CSV
```
State,Template
Token Paid,Kickoff confirmation + prep
Balance Due,Milestone proof + payment nudge
...
```

### Closing Script (TXT)
```
OPEN
[Custom opening from prospect's pain]

DIAGNOSE
[Revenue impact question]

...
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need to allow local file access)

## Notes

### Illustrative Data
All applicant data, testimonials, and examples are illustrative. Real implementations would connect to actual CRM/database systems.

### No Backend
This is a pure frontend demo. In production, you'd need:
- Real WhatsApp Business API integration
- CRM/database for applicant storage
- Payment processing integration
- Calendar API (Google/Zoom)
- Email/SMS automation platform

### Hinglish Microcopy
The app uses India-first Hinglish throughout:
- "Agar yeh problems familiar lage..."
- "Pipeline unpredictable hai"
- "Kab tak solve karna hai?"

This reflects the target market (India, 5-50CR ARR businesses).

## Development

### Code Structure

All logic is in `js/app.js`:
- **State Management**: Global `state` object
- **Data Loading**: Fetch all JSON files on init
- **Event Handlers**: Attached via `attachEventListeners()`
- **Timers**: `setInterval` with cleanup
- **Exports**: Blob downloads (CSV, JSON, TXT)

### Debugging

Open browser DevTools Console to see:
- Data loading confirmation
- Error messages (if any)
- State mutations (you can inspect `window.state`)

### Adding Features

1. Add UI in `index.html`
2. Add styles in `css/styles.css`
3. Add logic in `js/app.js`
4. Update data files in `data/` if needed

## License

This is a demonstration project. Modify as needed for your use case.

## Support

For issues or questions:
- Check browser console for errors
- Ensure all data files are present
- Try demo mode: `?demo=authority`

---

**ScaleEdge Authority Close Engine** - Built for India-first high-ticket consulting automation.

Illustrative; results vary. No messages actually sent. Local data only—stays on your device.
