#!/usr/bin/env python3
"""
Demo helper script for FireSight
Provides instructions for capturing screenshots and creating demo materials
"""

print("""
🔥 FireSight Demo Capture Guide
================================

To create demo materials for your presentation:

1. SCREENSHOTS TO CAPTURE:
   - Main 3D view with all hotspots visible
   - Zoomed view showing spread prediction rings
   - 2D map view
   - Info panel showing hotspot details
   - Empty state (zoom to ocean)
   - Error state (disconnect internet briefly)

2. SCREEN RECORDING:
   - Record a 30-60 second demo showing:
     • Initial load with 3D view
     • Hovering over hotspots (size change)
     • Clicking to show info panel
     • Switching between 3D/2D views
     • Manual refresh button

3. CONVERT TO GIF:
   Use online tool or command:
   ffmpeg -i demo.mov -vf "fps=10,scale=800:-1" -loop 0 demo.gif

4. DEPLOYMENT CHECKLIST:
   ✓ Test locally at http://localhost:8000
   ✓ Verify all files are committed to git
   ✓ Deploy to Netlify/GitHub Pages
   ✓ Test deployed version
   ✓ Share link in presentation

5. PRESENTATION TIPS:
   - Open presentation.html in full screen
   - Use arrow keys to navigate slides
   - Have live demo ready as backup
   - Test on projector beforehand

Good luck with your demo! 🚀
""") 