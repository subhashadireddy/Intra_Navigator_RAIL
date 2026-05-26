// Global variable to store current generated instructions
let currentInstructions = [];

function generateInstructions(path, lang = currentLanguage) {
    if (!path || path.length === 0) return [];

    let rawSteps = [];
    
    // Pass 1: Map nodes to semantic steps
    for (let i = 0; i < path.length; i++) {
        const nodeId = path[i];
        let meta = nodeMeta[nodeId];
        
        // If it's the last node and it's a gate, it's an exit
        if (i === path.length - 1) {
            let label = meta ? meta.label : nodeId;
            if (reverseGateMap[nodeId]) {
                 label = `Gate ${reverseGateMap[nodeId].substring(1)}`;
            }
            rawSteps.push({
                type: 'gate',
                label: label,
                nodeIds: [nodeId]
            });
            break; // Done
        }

        if (meta) {
            rawSteps.push({
                type: meta.type,
                label: meta.label,
                nodeIds: [nodeId]
            });
        }
    }

    // Pass 2: Squash contiguous identical types (e.g., walkway -> walkway)
    let squashedSteps = [];
    if (rawSteps.length > 0) {
        let currentStep = { ...rawSteps[0] };
        
        for (let i = 1; i < rawSteps.length; i++) {
            const nextStep = rawSteps[i];
            
            // Squash if they share the same base label/type (e.g., both are "Platform 1")
            // We can check if the type is the same and the label implies the same platform/fob
            let shouldSquash = false;
            
            if (currentStep.type === 'walkway' && nextStep.type === 'walkway') {
                const currPlat = currentStep.label.split(' ')[0]; // e.g. "Platform"
                const currNum = currentStep.label.split(' ')[1]; // e.g. "1"
                const nextPlat = nextStep.label.split(' ')[0];
                const nextNum = nextStep.label.split(' ')[1];
                if (currPlat === nextPlat && currNum === nextNum) {
                    shouldSquash = true;
                }
            } else if (currentStep.type === 'fob' && nextStep.type === 'fob') {
                const currFob = currentStep.label.split(' ')[0]; // e.g. "South"
                const nextFob = nextStep.label.split(' ')[0];
                if (currFob === nextFob) {
                    shouldSquash = true;
                }
            }
            
            if (shouldSquash) {
                currentStep.nodeIds.push(...nextStep.nodeIds);
                // Keep the initial label or update it if needed
            } else {
                squashedSteps.push(currentStep);
                currentStep = { ...nextStep };
            }
        }
        squashedSteps.push(currentStep);
    }

    // Pass 3: Convert to human-readable strings based on language
    const finalInstructions = squashedSteps.map(step => {
        let label = step.label;
        if (step.type === 'walkway') {
             // Just use the platform name without "South/North" for the generic instruction
             label = step.label.split(' ').slice(0, 2).join(' ');
        } else if (step.type === 'fob') {
             label = step.label; // e.g., "South FOB at Platform 1" -> we could simplify to "South FOB"
             if (label.includes("FOB at")) {
                 label = label.split(" at ")[0];
             }
        }
        
        return {
            text: getInstructionString(step.type, label, lang),
            nodeIds: step.nodeIds,
            type: step.type
        };
    });

    currentInstructions = finalInstructions;
    return finalInstructions;
}
