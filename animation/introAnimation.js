function runIntroAnimation() {
    introAnimationCompleted = false;
    
    // Disable any interaction
    disableMovementButton();
    const navigateBtn = document.getElementById('navigateBtn');
    if (navigateBtn) navigateBtn.disabled = true;

    // Define the showcase pan route (Start at P8 North, move to P1 South)
    const startPoint = [-200, 250]; // Near W1_1
    const midPoint = [-900, 950];   // Center
    const endPoint = [-1600, 1650]; // Near W5_3

    // Ensure map is initialized and ready
    if (!map) return;

    // Start at a closer zoom
    map.setView(startPoint, -1.5, { animate: false });

    // Step 1: Pan to center after a short delay
    setTimeout(() => {
        map.flyTo(midPoint, -2.0, {
            animate: true,
            duration: 2.0,
            easeLinearity: 0.25
        });

        // Step 2: Pan to end
        setTimeout(() => {
            map.flyTo(endPoint, -1.8, {
                animate: true,
                duration: 2.0,
                easeLinearity: 0.25
            });

            // Step 3: Zoom out to show full map and finish
            setTimeout(() => {
                const centerLat = -925; 
                const centerLng = 950;
                map.flyTo([centerLat, centerLng], -2.2, {
                    animate: true,
                    duration: 1.5
                });

                setTimeout(() => {
                    // Animation complete
                    introAnimationCompleted = true;
                    showMovementButton();
                    enableMovementButton();
                    updateState(); // Re-evaluate button state based on selections
                }, 1500);

            }, 2000);

        }, 2000);

    }, 1000);
}

// Attach to document load after initMap
document.addEventListener('DOMContentLoaded', () => {
    // Need to give leaflet a moment to initialize in map.js
    setTimeout(() => {
        runIntroAnimation();
    }, 500);
});
