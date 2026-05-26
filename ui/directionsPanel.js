function updateDirectionsUI() {
    const panel = document.getElementById('directions-panel');
    const pathInfo = document.getElementById('pathInfo'); // The old mobile path steps container
    
    // Check if we have an active route
    const startNode = getSourceNode();
    const endNode = endSelect.value ? gateMap[endSelect.value] : null;
    
    if (!startNode || !endNode || currentInstructions.length === 0) {
        panel.style.display = 'none';
        if (pathInfo) pathInfo.style.display = 'none';
        return;
    }

    // Display the panel
    panel.style.display = 'flex';
    
    // Update the panel content
    panel.innerHTML = `
        <div class="directions-header">
            Navigation Instructions
        </div>
    `;

    currentInstructions.forEach((step, index) => {
        const stepNumber = index + 1;
        const div = document.createElement('div');
        div.className = `instruction-card`;
        div.id = `instruction-step-${index}`;
        div.innerHTML = `
            <div class="instruction-number">${stepNumber}</div>
            <div class="instruction-text">${step.text}</div>
        `;
        panel.appendChild(div);
    });

    // Reset instruction active state
    highlightInstructionStep(0);
}

function highlightInstructionStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= currentInstructions.length) return;

    // Remove active class from all
    const cards = document.querySelectorAll('.instruction-card');
    cards.forEach(card => card.classList.remove('active'));

    // Add active class to current
    const activeCard = document.getElementById(`instruction-step-${stepIndex}`);
    if (activeCard) {
        activeCard.classList.add('active');
        
        // Auto-scroll the panel to the active instruction smoothly
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
