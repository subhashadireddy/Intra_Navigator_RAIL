let animationTimer = null;

function animateMarker(latlngs, pathNodes) {
    if (latlngs.length < 2) return;
    
    // Clear existing
    animationLayer.clearLayers();
    if (animationTimer) cancelAnimationFrame(animationTimer);

    const movingIcon = L.divIcon({ className: 'moving-marker', iconSize: [16, 16], iconAnchor: [8, 8] });
    const marker = L.marker(latlngs[0], { icon: movingIcon }).addTo(animationLayer);

    let currentSegmentIndex = 0;
    
    // Map nodes to instruction step index
    // currentInstructions has { text, nodeIds }
    function getInstructionIndexForNode(nodeId) {
        if (!currentInstructions) return 0;
        for (let i = 0; i < currentInstructions.length; i++) {
            if (currentInstructions[i].nodeIds.includes(nodeId)) {
                return i;
            }
        }
        return 0;
    }

    let frame = 0;
    let frames = 0;
    let start = null, end = null;
    let isPaused = false;

    function moveToNextSegment() {
        if (currentSegmentIndex >= latlngs.length - 1) {
            // Done
            setTimeout(() => {
                if (map.hasLayer(marker)) {
                    animationLayer.removeLayer(marker);
                }
                // Highlight final step
                if (currentInstructions && currentInstructions.length > 0) {
                    highlightInstructionStep(currentInstructions.length - 1);
                }
            }, 1000);
            return;
        }

        start = latlngs[currentSegmentIndex];
        end = latlngs[currentSegmentIndex + 1];
        
        const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
        const speed = 450;
        const duration = (dist / speed) * 1000;

        frames = Math.max(duration / 16, 1);
        frame = 0;

        // Sync instruction panel with current node
        const currentNodeId = pathNodes[currentSegmentIndex];
        const stepIndex = getInstructionIndexForNode(currentNodeId);
        highlightInstructionStep(stepIndex);

        animateLoop();
    }

    function animateLoop() {
        if (!isUserMoving) {
            // Wait for user to hold button
            animationTimer = requestAnimationFrame(animateLoop);
            return;
        }

        frame++; 
        const progress = frame / frames;
        marker.setLatLng([start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress]);
        
        if (frame < frames) { 
            animationTimer = requestAnimationFrame(animateLoop); 
        } else {
            currentSegmentIndex++;
            moveToNextSegment();
        }
    }

    // Delay start slightly
    setTimeout(() => {
        moveToNextSegment();
    }, 500);
}

// Override the original index.html drawPath caller to integrate pathNodes
// We will modify navigateBtn click logic in index.html to pass pathNodes
