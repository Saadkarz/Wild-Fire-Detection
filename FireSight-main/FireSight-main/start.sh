#!/bin/bash

echo "🔥 Starting FireSight..."
echo ""
echo "Server will start at: http://localhost:8000"
echo "Main application: http://localhost:8000/src/"
echo "Press Ctrl+C to stop"
echo ""

# Start the server from project root
python -m http.server 8000 