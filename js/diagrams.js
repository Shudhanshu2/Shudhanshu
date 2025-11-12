// ScaleEdge AI Twin Engine - Diagram Generators
// ==============================================

// Simple SVG diagram generators for slides

function svgFunnel(labels = ['Awareness', 'Interest', 'Decision'], brandColor = '#DC2626') {
    return `
<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="max-width: 180px; max-height: 140px;">
    <defs>
        <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${brandColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${brandColor};stop-opacity:0.3" />
        </linearGradient>
    </defs>
    <!-- Top section -->
    <path d="M 20 20 L 180 20 L 160 60 L 40 60 Z" fill="url(#funnelGrad)" stroke="${brandColor}" stroke-width="2"/>
    <text x="100" y="45" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="600">${labels[0] || ''}</text>
    <!-- Middle section -->
    <path d="M 40 60 L 160 60 L 140 100 L 60 100 Z" fill="url(#funnelGrad)" stroke="${brandColor}" stroke-width="2"/>
    <text x="100" y="85" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="600">${labels[1] || ''}</text>
    <!-- Bottom section -->
    <path d="M 60 100 L 140 100 L 120 140 L 80 140 Z" fill="url(#funnelGrad)" stroke="${brandColor}" stroke-width="2"/>
    <text x="100" y="125" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="600">${labels[2] || ''}</text>
</svg>`;
}

function svgTimeline(steps = ['Phase 1', 'Phase 2', 'Phase 3'], brandColor = '#DC2626') {
    const stepWidth = 160 / (steps.length - 1 || 1);
    return `
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" style="max-width: 180px; max-height: 110px;">
    <!-- Timeline line -->
    <line x1="30" y1="50" x2="170" y2="50" stroke="${brandColor}" stroke-width="3"/>
    ${steps.map((step, i) => {
        const x = 30 + i * stepWidth;
        return `
    <!-- Step ${i + 1} -->
    <circle cx="${x}" cy="50" r="8" fill="${brandColor}" stroke="#0B0F1A" stroke-width="2"/>
    <text x="${x}" y="75" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="500">${step}</text>
        `;
    }).join('')}
</svg>`;
}

function svgMatrix(labels = {topLeft: 'Quick', topRight: 'Strategic', bottomLeft: 'Reactive', bottomRight: 'Planned'}, brandColor = '#DC2626') {
    return `
<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="max-width: 180px; max-height: 150px;">
    <!-- Grid -->
    <line x1="100" y1="20" x2="100" y2="140" stroke="#374151" stroke-width="2"/>
    <line x1="20" y1="80" x2="180" y2="80" stroke="#374151" stroke-width="2"/>

    <!-- Quadrant labels -->
    <text x="60" y="50" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">${labels.topLeft}</text>
    <text x="140" y="50" text-anchor="middle" fill="${brandColor}" font-size="11" font-weight="700">${labels.topRight}</text>
    <text x="60" y="115" text-anchor="middle" fill="#4b5563" font-size="11">${labels.bottomLeft}</text>
    <text x="140" y="115" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">${labels.bottomRight}</text>

    <!-- Highlight star in top-right (strategic) -->
    <circle cx="140" cy="45" r="12" fill="none" stroke="${brandColor}" stroke-width="2" stroke-dasharray="2,2"/>
</svg>`;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { svgFunnel, svgTimeline, svgMatrix };
}
