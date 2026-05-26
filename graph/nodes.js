const nodes = {
    W1_1: [250, 200], W1_2: [950, 200], W1_3: [1650, 200],
    W2_1: [250, 550], W2_2: [950, 550], W2_3: [1650, 550],
    W3_1: [250, 900], W3_2: [950, 900], W3_3: [1650, 900],
    W4_1: [250, 1250], W4_2: [950, 1250], W4_3: [1650, 1250],
    W5_1: [250, 1600], W5_2: [950, 1600], W5_3: [1650, 1600]
};

// Semantic metadata for nodes
const nodeMeta = {};

// Helper to populate node metadata based on ID patterns
function buildNodeMeta() {
    // Basic walkways (Platforms)
    for (let r = 1; r <= 5; r++) {
        let platformLabel = "";
        if (r === 1) platformLabel = "Platform 8";
        if (r === 2) platformLabel = "Platform 6/7";
        if (r === 3) platformLabel = "Platform 4/5";
        if (r === 4) platformLabel = "Platform 2/3";
        if (r === 5) platformLabel = "Platform 1";

        for (let c = 1; c <= 3; c++) {
            let loc = c === 1 ? "South" : (c === 2 ? "Central" : "North");
            nodeMeta[`W${r}_${c}`] = {
                label: `${platformLabel} ${loc}`,
                type: "walkway"
            };
            
            // FOB overhead points
            nodeMeta[`FOB_${r}_${c}`] = {
                label: `${loc} FOB at ${platformLabel}`,
                type: "fob"
            };
            
            // Transition nodes
            // L, R, S, E nodes get created in graph.js but we can define their meta dynamically
            nodeMeta[`S${r}_${c}`] = { label: "Stairs", type: "stairs" };
            nodeMeta[`R${r}_${c}`] = { label: "Ramp", type: "ramp" };
            nodeMeta[`E${r}_${c}`] = { label: "Escalator", type: "escalator" };
            nodeMeta[`L${r}_${c}`] = { label: "Lift", type: "lift" };
        }
    }
    
    // Header/Footer FOB nodes (Concourse)
    for (let c = 1; c <= 3; c++) {
        let loc = c === 1 ? "South" : (c === 2 ? "Central" : "North");
        nodeMeta[`FOBT_${c}`] = { label: `${loc} FOB Ground Concourse (Top)`, type: "fob" };
        nodeMeta[`FOBB_${c}`] = { label: `${loc} FOB Ground Concourse (Bottom)`, type: "fob" };
    }
    
    // Add specific gates mapping in graph.js
}

buildNodeMeta();
