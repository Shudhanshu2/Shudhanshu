// ScaleEdge ICE - Slide Generation Engine
// ========================================

export class SlideEngine {
    constructor(formData) {
        this.formData = formData;
    }

    generate() {
        const slides = [
            this.generateSlide1(),
            this.generateSlide2(),
            this.generateSlide3(),
            this.generateSlide4(),
            this.generateSlide5(),
            this.generateSlide6(),
            this.generateSlide7(),
            this.generateSlide8(),
            this.generateSlide9(),
            this.generateSlide10(),
            this.generateSlide11(),
            this.generateSlide12()
        ];

        return slides;
    }

    generateSlide1() {
        return {
            title: this.formData.offer,
            type: 'Hook',
            content: `${this.formData.offer}\n\nASP via AI Twin\n\n80/20 Value-Pitch • Camera-Off • India-First`,
            notes: 'Opening hook. Establish credibility and format. Mention "not another webinar" - this is a systematic presentation.'
        };
    }

    generateSlide2() {
        return {
            title: 'Old Way (Manual Grinding)',
            type: 'Problem Agitation',
            content: `The Old Way:\n\n• Daily cold outreach\n• Manual follow-ups\n• Unqualified demos\n• Inconsistent pipeline\n• Selling nahi aati\n\nResult: Burnout + Unpredictable Revenue`,
            notes: 'Agitate the pain. Use Hinglish to create relatability. "Pipeline unpredictable hai" - mirror their internal dialogue.'
        };
    }

    generateSlide3() {
        return {
            title: 'New Way (Automation + AI)',
            type: 'Solution Vision',
            content: `The New Way:\n\n✅ AI Twin handles selling\n✅ Auto-qualified leads only\n✅ Pre-sold pipeline\n✅ System runs 24/7\n✅ You show up for closing only\n\n80% Value / 20% Pitch\nSystem sambhal lega`,
            notes: 'Paint the vision. Contrast with old way. "System sambhal lega" - you don\'t need to do the heavy lifting.'
        };
    }

    generateSlide4() {
        return {
            title: 'Your Biggest Pains',
            type: 'Personalization',
            content: `Based on your niche (${this.formData.niche}):\n\n${this.formData.pains.map(p => `• ${p}`).join('\n')}\n\nSound familiar?`,
            notes: 'Personalization moment. Show you understand them deeply. Pause here for acknowledgment.'
        };
    }

    generateSlide5() {
        return {
            title: 'The ACE Ecosystem',
            type: 'Framework',
            content: `3 Engines Working Together:\n\n🚗 Engine 1: ASP (Vehicle)\n   AI Twin Presentation\n\n⛽ Engine 2: Traffic + Trust (Fuel)\n   Search + Piggyback + Partners + ProofLoop\n\n🤖 Engine 3: ICE (Machine)\n   Auto-Qualify → Nurture → Close → Collect`,
            notes: 'Core framework. This is the "vehicle, fuel, machine" metaphor. Explain each briefly.'
        };
    }

    generateSlide6() {
        return {
            title: 'Engine 1: AI Twin (ASP)',
            type: 'Deep Dive - ASP',
            content: `Automated Sales Presentation\n\n• Camera-off slide presentation\n• 80% Value (free frameworks)\n• 20% Pitch (your offer)\n• Trained on ₹53Cr+ sales data\n• 44+ niches\n\nNot generic AI - structured for high-ticket`,
            notes: 'Differentiate from generic AI. Emphasize India-first training data and structured approach.'
        };
    }

    generateSlide7() {
        return {
            title: 'Engine 2: Traffic Sources',
            type: 'Deep Dive - Traffic',
            content: `3 Traffic Channels:\n\n1. Search Harvest\n   YouTube Search (High-Intent)\n\n2. Piggyback\n   Channel Placements (Established Audiences)\n\n3. Partners\n   Community Taps (Network Effect)`,
            notes: 'Explain each channel. Search = highest intent. Piggyback = leverage. Partners = trust transfer.'
        };
    }

    generateSlide8() {
        return {
            title: 'ProofLoop System',
            type: 'Deep Dive - Trust',
            content: `Convert Unqualified → Social Proof\n\n• Trigger feedback request\n• Collect genuine testimonials\n• Video/Voice notes\n• Auto-deliver bonus\n• Build proof wall\n\nEvery "no" becomes future "yes" fuel`,
            notes: 'ProofLoop is unique. Unqualified leads don\'t go to waste - they become social proof for future cohorts.'
        };
    }

    generateSlide9() {
        return {
            title: 'Engine 3: ICE Machine',
            type: 'Deep Dive - ICE',
            content: `Integrated Client Engine:\n\n1. Auto-Qualification (Score-based)\n2. ICE Nurturing (WhatsApp Drip)\n3. Pre-Sold Pipeline\n4. Closing Scripts (Generated)\n5. Payment Automation (Nudges)\n\nManual → 10% | Automated → 90%`,
            notes: 'The machine that runs without you. Emphasize "pre-sold" - they\'re warm by the time you talk to them.'
        };
    }

    generateSlide10() {
        return {
            title: 'Proof in Numbers',
            type: 'Credibility',
            content: `Track Record:\n\n• ₹53Cr+ Influenced Sales\n• ₹13Cr+ Ad Spend\n• ₹10Cr+ on YouTube alone\n• ~3.8x ROAS\n• CPL ₹179-₹210\n\n(Results vary. Roadmap ≠ Guarantee)`,
            notes: 'Credibility slide. Always include disclaimer. "Influenced sales" is truthful framing.'
        };
    }

    generateSlide11() {
        return {
            title: 'Your Offer Transformed',
            type: 'Application',
            content: `With ICE, your offer becomes:\n\n${this.formData.offer}\n\nTicket: ${this.formData.ticket}\n\n✅ AI Twin presents for you\n✅ Traffic auto-fills pipeline\n✅ Qualified leads only\n✅ Pre-sold before calls\n✅ Payment automation\n\nYou focus on delivery, system handles acquisition`,
            notes: 'Bring it back to them. Show how ICE applies to their specific offer.'
        };
    }

    generateSlide12() {
        return {
            title: 'Next Step: Application',
            type: 'CTA',
            content: `Not for everyone.\n\nThis is for:\n✓ High-ticket offers (₹1L+)\n✓ Proven delivery capability\n✓ Willing to systemize\n\nIf you fit → Apply\nWe screen → Accept/Reject (Doctor-frame)\n\nNo hard sell. Clear path only.`,
            notes: 'Doctor-frame CTA. "Not for everyone" creates qualification. "Accept/Reject" positions you as authority.'
        };
    }
}
