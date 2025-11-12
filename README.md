# HVSP AI Twin Engine Demo

**A complete, runnable, static demo showcasing our India-first High-Value Sales Presentation (HVSP) generation system.**

Perfect for 5-minute live webinar demos with zero setup required.

---

## 🚀 Quick Start

### Option 1: Direct Open (Simplest)
```bash
# Just open the file in your browser
open index.html
# or double-click index.html
```

### Option 2: Local Server (Recommended for video playback)
```bash
# If you have Python installed
python -m http.server 8000

# Or use npx (if you have Node.js)
npx http-server

# Then open: http://localhost:8000
```

### Option 3: Demo Mode (Auto-run)
```bash
# Open with demo parameter for auto-flow
open index.html?demo=1
# or navigate to: http://localhost:8000?demo=1
```

---

## ✨ Features

- **3-Step Intake Form**: Business model → Niche → Business specifics
- **Believability Engine**: Realistic progress pipeline, typing logs, matched data chips
- **HVSP Generation**: Auto-generated Hook/Value/Story/Pitch outline from inputs
- **Slide Deck Preview**: 12 auto-generated slides with presenter notes
- **Video Renderer**: Fake progress to 100% → placeholder video with download
- **Demo Mode**: `?demo=1` auto-fills and runs entire flow
- **Keyboard Shortcuts**: Quick navigation for presenters
- **India-First Copy**: Hinglish tone, doctor-frame positioning, compliance disclaimers
- **Zero Network Calls**: Everything runs offline (except Tailwind CDN)

---

## ⌨️ Keyboard Shortcuts

Perfect for live demos and presentations:

| Key | Action |
|-----|--------|
| `1` | Prefill form with demo preset |
| `2` | Start HVSP generation (when on Step 3) |
| `3` | Open Slides Preview (when HVSP outline is ready) |
| `4` | Start Video Render (when slides are visible) |
| `H` | Toggle Presenter Notes panel |

---

## 📁 File Structure

```
/
├── index.html              # Main application (single-page app)
├── css/
│   └── styles.css         # Custom CSS (animations, utilities)
├── js/
│   └── app.js            # All application logic
├── data/
│   ├── niches.json       # 24 niche options across 4 business models
│   ├── frameworks.json   # HVSP-Core framework, slide templates, logs
│   └── testimonials.json # Proof micro-tiles with disclaimers
├── assets/
│   ├── hvsp_ready.mp4    # Placeholder video (see VIDEO_PLACEHOLDER.md)
│   └── VIDEO_PLACEHOLDER.md
└── README.md             # This file
```

---

## 🎬 Demo Mode Flow

When you open `index.html?demo=1`, the app automatically:

1. **Waits 600ms** (for dramatic effect)
2. **Pre-fills the form** with B2B Consulting preset:
   - Model: Consulting
   - Niche: B2B Growth Consultant
   - Persona: Founders 5-50 CR ARR
   - Ticket: ₹1.2L
   - Language: Hinglish
   - Tone: Doctor-frame
   - Pains: Unpredictable pipeline, Long cycles, Unqualified demos
3. **Opens Step 3** of the form
4. **Clicks "Generate HVSP"** after 1s
5. **Runs the entire pipeline** (12-15 seconds of believable progress)

Perfect for screen-sharing where you just narrate over the automation.

---

## 🎯 Presenter Script (5 Minutes)

Use this timing guide for live demos:

### 0:00–0:40 • Set the Scene
> "This is our HVSP AI Twin Engine — camera-off, slide-based presentations optimized for India market. 80/20 value-pitch balance. Trained on ₹53Cr+ sales data across 44+ niches. Not generic AI — this is structured for high-value conversions."

### 0:40–1:40 • Fill Form (or Auto)
> "Let me show you the intake. We capture business model, niche, target persona, language, tone... all India-market specific. I'll use our demo preset for a B2B consultant."

**Action**: Press `1` to prefill, or click "Use Demo Preset"

### 1:40–3:00 • Generate
> "Watch the believability engine. We're matching assets from our training clusters, applying 80/20 balance, doctor-frame tone, India-market psychology layers. See the logs — framework selection, proof attachment with disclaimers, slide optimization..."

**Action**: Press `2` or click "Generate HVSP"

### 3:00–4:10 • Slides Preview
> "Here's the auto-generated outline — Hook addresses specific pains, Value modules give 80% actionable content, Story connects personally, Pitch is soft with doctor-frame. Now the slide deck... 12 slides, fully customized. Notice slide 9: 'Generic AI ≠ Our Engine' — that's Structure, Balance, Data."

**Action**: Press `3` or click "Preview Slides"

### 4:10–4:40 • Render Video
> "Now we render. Compiling slides, generating narration template, captions... and done. Voiceover is optional for webinars. Download ready."

**Action**: Press `4` or click "Render Video"

### 4:40–5:00 • CTA
> "Next step: GrowthMap — ₹499 refundable deposit that screens for seriousness. 60-min roadmap session. Not a course — this is 3-month consulting with 9 AI Agents System. Up to 90% automation."

**Action**: Point at bottom sticky CTA

---

## 🛠️ Customization

### Update Default Copy

**Niches**: Edit `data/niches.json` to add/modify niche options
```json
{
  "id": "your_niche",
  "label": "Your Niche Label",
  "pains": ["Pain 1", "Pain 2", "Pain 3"],
  "objections": ["Objection 1", "Objection 2"],
  "examples": ["Module 1", "Module 2", "Module 3"]
}
```

**Framework**: Edit `data/frameworks.json` for hook templates, slide templates, log lines

**Testimonials**: Edit `data/testimonials.json` to add proof examples (always include `"disclaimer": true`)

### Change Demo Preset

Edit `DEMO_PRESET` object in `js/app.js` (around line 18):
```javascript
const DEMO_PRESET = {
    businessModel: 'Your Model',
    niche: 'Your Niche',
    // ... other fields
};
```

### Modify Brand Colors

Edit Tailwind config in `index.html` (around line 9):
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#your-color',
                // ...
            }
        }
    }
}
```

---

## 📹 Video Placeholder

The demo references `assets/hvsp_ready.mp4`. If the file doesn't exist:

1. **Download any short video** (6-10 seconds)
2. **Rename to** `hvsp_ready.mp4`
3. **Place in** `assets/` folder

Or create a custom one:

```bash
# Using ffmpeg (if installed)
ffmpeg -f lavfi -i color=c=0x1e293b:s=1280x720:d=8 \
  -vf "drawtext=text='HVSP Ready':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -t 8 -pix_fmt yuv420p assets/hvsp_ready.mp4
```

The app will work without the video file — it just won't play in the final step.

---

## 🎨 Brand Guidelines

The demo enforces these brand elements:

### Required Phrases
- "AI Agents System" / "AI Agents Funnel"
- "HVCO" (High-Value Conversion Offer)
- "Up to 90% automation" (never as success-rate %)
- "Doctor-frame: Accept/Reject"
- "Not a course — 3-Month Consulting + 9 AI Agents System"

### Proof Stats (with disclaimers)
- "₹53Cr+ high-ticket sales attributed"
- "~3.8x ROAS"
- "CPL ₹179–₹210"
- "₹13Cr+ ad spend (₹10Cr+ YouTube)"

### Compliance
All proof/testimonials include: **"Illustrative; results vary. Roadmap ≠ guarantee."**

### Tone
- **Hinglish** by default (can switch to Hindi/English)
- **Doctor-frame** positioning (we accept/reject clients)
- **India-first** psychology and market context

---

## 🧪 Testing Checklist

Before your demo, verify:

- [ ] Open `index.html` — loads without errors
- [ ] Click through all 3 steps manually
- [ ] Fill form and click "Generate HVSP" — progress runs
- [ ] HVSP outline appears with correct data
- [ ] Click "Preview Slides" — 12 slides render
- [ ] Click any slide — modal opens with notes
- [ ] Click "Render Video" — progress reaches 100%
- [ ] Video card appears (with or without actual MP4)
- [ ] Bottom sticky CTA is visible
- [ ] Press `H` — Presenter Notes toggle
- [ ] Press `1` — Form prefills
- [ ] Open `?demo=1` — Auto-runs entire flow
- [ ] All disclaimers visible in footer and proof sections

---

## 🔧 Troubleshooting

### Tailwind styles not loading
- **Check internet connection** (Tailwind loads from CDN)
- Fallback: Download Tailwind CSS and link locally

### Data not loading
- **Check console** for fetch errors
- Ensure `data/*.json` files are in correct location
- If running via `file://`, some browsers block fetch — use local server

### Video not playing
- **Use local server** instead of opening file directly
- Browser autoplay policies may block muted videos
- Click the play overlay manually

### Form validation issues
- **Check console** for JavaScript errors
- Ensure all required fields have values
- Try demo preset (`1` key or "Use Demo Preset" button)

### Demo mode not working
- Ensure URL has `?demo=1` parameter
- Check browser console for errors
- Manually trigger with `1` then `2` keys

---

## 📦 Deployment

To share this demo:

### GitHub Pages
```bash
# Push to GitHub, enable Pages on main branch
# Access at: https://username.github.io/repo-name
```

### Netlify Drop
```bash
# Drag entire folder to: https://app.netlify.com/drop
# Get instant URL
```

### Zip & Share
```bash
# Zip the entire folder
zip -r hvsp-demo.zip . -x "*.git*" "node_modules/*"
# Share the zip file
```

---

## 🎓 Educational Notes

### Why Static?
- **Zero dependencies** (except Tailwind CDN)
- **Instant load** — no build step
- **Portable** — runs anywhere
- **Believable** — feels like real AI processing

### Architecture Decisions
- **Vanilla JS** for simplicity and transparency
- **Tailwind** for rapid UI development
- **JSON data files** for easy customization
- **Typing effects** for believability
- **Randomized durations** for organic feel

### Demo Psychology
- **Progress bars** = trust (users see "work" happening)
- **Typing logs** = transparency (detailed process)
- **Matched chips** = specificity (not generic)
- **Disclaimers** = honesty (builds credibility)
- **Doctor-frame** = authority (we choose clients)

---

## 📄 License

Proprietary demo for Edges • AI Agents System.
Not for redistribution or white-labeling without permission.

---

## 🤝 Support

For issues or customization requests:
1. Check this README thoroughly
2. Review `js/app.js` comments for logic flow
3. Inspect browser console for errors
4. Test with `?demo=1` mode first

---

## 🎉 You're Ready!

**For a 5-minute demo:**
1. Open `index.html?demo=1`
2. Press `H` to open Presenter Notes
3. Follow the 5-min script
4. Use keyboard shortcuts (1/2/3/4/H) as needed

**For live filling:**
1. Open `index.html`
2. Click "Start Demo"
3. Fill each step, explaining as you go
4. Generate → Slides → Video

**Happy presenting! 🚀**
