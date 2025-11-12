#!/bin/bash
# Generate complete knowledge_base.json with 48 niches

cat > /home/user/Shudhanshu/data/knowledge_base.json << 'EOFKB'
[
EOFKB

# Generate 48 niches programmatically
NICHES=(
  "B2B Consulting:1.2" "Fitness Coach B2C:0.8" "SaaS Agency:1.5" "Real Estate Coach:0.9"
  "E-commerce Store Owner:1.1" "Career Coach:0.7" "Freelance Designer:0.6" "Content Creator Coach:1.0"
  "Financial Advisor:1.3" "Life Coach:0.8" "Sales Training:1.1" "Marketing Consultant:1.4"
  "HR Consultant:0.9" "Legal Services:1.6" "Nutrition Coach:0.7" "Yoga Instructor:0.6"
  "Business Coach:1.3" "Tech Consultant:1.5" "Brand Strategist:1.1" "SEO Specialist:0.9"
  "PPC Agency:1.2" "Email Marketing:0.8" "Social Media Agency:1.0" "Video Production:1.4"
  "Copywriting Agency:1.1" "Web Design Agency:1.3" "App Development:1.7" "Product Manager Coach:1.2"
  "Startup Advisor:1.4" "Investment Coach:1.5" "Crypto Consultant:1.1" "NFT Strategist:0.9"
  "Gaming Coach:0.8" "Esports Training:1.0" "Music Production:1.2" "Photography Business:0.9"
  "Event Planning:1.0" "Interior Design:1.1" "Fashion Stylist:0.8" "Beauty Consultant:0.7"
  "Pet Training:0.6" "Language Coach:0.8" "Public Speaking:0.9" "Executive Coaching:1.5"
  "Leadership Training:1.3" "Team Building:1.0" "Recruitment Agency:1.2" "Talent Development:1.1"
)

for i in "${!NICHES[@]}"; do
  IFS=':' read -r name size <<< "${NICHES[$i]}"
  if [ $i -gt 0 ]; then echo "," >> /home/user/Shudhanshu/data/knowledge_base.json; fi
  
  cat >> /home/user/Shudhanshu/data/knowledge_base.json << EOFNICHE
  {
    "name": "$name",
    "sizeGB": $size,
    "folders": [
      {"name": "Offer", "files": [{"name": "offer.md", "sizeKB": 18, "preview": "# Offer\\nOutcome-focused offer framing.\\nStructured delivery vehicle."}]},
      {"name": "Positioning", "files": [{"name": "positioning.md", "sizeKB": 25, "preview": "# Positioning\\nCategory → Vehicle → Proof.\\nIndia-first approach."}]},
      {"name": "Tone", "files": [{"name": "tone.json", "sizeKB": 4, "preview": "{\\n  \\"tone\\": \\"authoritative\\",\\n  \\"style\\": \\"clear\\"\\n}"}]},
      {"name": "Expressions", "files": [{"name": "expressions.json", "sizeKB": 6, "preview": "{\\n  \\"phrases\\": [\\"seedha point\\", \\"clear path\\"]\\n}"}]},
      {"name": "Scripts", "files": [{"name": "outlines.md", "sizeKB": 22, "preview": "# Script Outlines\\n- Hook\\n- Value (80%)\\n- Story\\n- Pitch (20%)"}]},
      {"name": "Psychology", "files": [{"name": "pains.csv", "sizeKB": 9, "preview": "pain,description\\nclarity,Need clear direction\\nresults,Want measurable outcomes"}]},
      {"name": "Frameworks/HVSP", "files": [{"name": "structure.md", "sizeKB": 16, "preview": "# HVSP Structure\\nHook → Value(80%) → Story → Pitch(20%)"}]},
      {"name": "Frameworks/Objections", "files": [{"name": "common.md", "sizeKB": 14, "preview": "# Objections\\n- Price: value demonstration\\n- Time: ROI focus"}]},
      {"name": "Examples", "files": [{"name": "slide_snippets.md", "sizeKB": 12, "preview": "# Examples\\nSlide templates and frameworks."}]}
    ]
  }
EOFNICHE
done

cat >> /home/user/Shudhanshu/data/knowledge_base.json << 'EOFKB'
]
EOFKB

echo "✓ Generated knowledge_base.json with ${#NICHES[@]} niches"
wc -l /home/user/Shudhanshu/data/knowledge_base.json

