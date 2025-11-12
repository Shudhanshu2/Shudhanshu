#!/bin/bash

# HVSP AI Twin Engine - Quick Start Script
# ========================================

echo "🚀 HVSP AI Twin Engine - Quick Start"
echo "===================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "📡 Starting local server on http://localhost:8000"
    echo ""
    echo "🎯 Demo Mode: http://localhost:8000?demo=1"
    echo "📋 Normal Mode: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "📡 Starting local server on http://localhost:8000"
    echo ""
    echo "🎯 Demo Mode: http://localhost:8000?demo=1"
    echo "📋 Normal Mode: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found"
    echo ""
    echo "Option 1: Install Python and run this script again"
    echo "Option 2: Use npx (requires Node.js):"
    echo "  npx http-server -p 8000"
    echo ""
    echo "Option 3: Open index.html directly in your browser"
    echo "  (Video playback may not work in file:// mode)"
    echo ""
    exit 1
fi
