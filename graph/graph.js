const HORZ_MARGIN = 85;
const graph = {};

function addEdge(n1, n2) {
    if (!graph[n1]) graph[n1] = [];
    if (!graph[n2]) graph[n2] = [];
    if (!graph[n1].includes(n2)) graph[n1].push(n2);
    if (!graph[n2].includes(n1)) graph[n2].push(n1);
}

function buildGraph() {
    // Horizontal Walkways
    for (let r = 1; r <= 5; r++) { 
        addEdge(`W${r}_1`, `W${r}_2`); 
        addEdge(`W${r}_2`, `W${r}_3`); 
    }

    // Structured Nodes & Amenities
    for (let r = 1; r <= 5; r++) {
        for (let c = 1; c <= 3; c++) {
            let wNodeId = `W${r}_${c}`;
            let wNode = nodes[wNodeId];
            let x = wNode[0], y = wNode[1];

            // FOB Node at this platform level
            let fobNodeId = `FOB_${r}_${c}`;
            nodes[fobNodeId] = [x, y];
            if (r > 1) {
                addEdge(fobNodeId, `FOB_${r - 1}_${c}`); // Connect vertically
            }

            // Header Nodes at very top and very bottom
            if (r === 1) {
                let headerNodeId = `FOBT_${c}`;
                nodes[headerNodeId] = [x, 50];
                addEdge(wNodeId, headerNodeId); // Concourse accessible from ground level
            }
            if (r === 5) {
                let footerNodeId = `FOBB_${c}`;
                nodes[footerNodeId] = [x, 1750];
                addEdge(wNodeId, footerNodeId); // Concourse accessible from ground level
            }

            // Determine types for Left (S) and Right (R)
            let typeL = 'S', typeR = 'R';

            if (c === 1) { // SOUTH FOB
                if (r === 5) { typeL = 'R'; typeR = 'R'; } // P1 Both Ramps
            } else if (c === 2) { // CENTRAL FOB
                typeR = 'E'; // Right Escalators
                if (r === 1 || r === 5) typeL = 'R'; // P8, P1 Left Ramps
            } else if (c === 3) { // NORTH FOB
                if (r === 2) { typeL = 'L'; typeR = 'S'; } // P6/7 Left Lift, Right Stairs
                else { typeR = 'L'; } // Others Right Lift
            }

            let leftId = `${typeL}${r}_${c}`;
            let rightId = `${typeR}${r}_${c}`;

            nodes[leftId] = [x - HORZ_MARGIN, y];
            nodes[rightId] = [x + HORZ_MARGIN, y];

            addEdge(wNodeId, leftId); addEdge(leftId, fobNodeId);
            addEdge(wNodeId, rightId); addEdge(rightId, fobNodeId);
        }
    }
}

// Ensure nodes object exists from nodes.js before running this
buildGraph();

// Exact Position Data Structures
const platformMap = { "8": "W1", "7": "W2", "6": "W2", "5": "W3", "4": "W3", "3": "W4", "2": "W4", "1": "W5" };
const fobNames = { "FOB1": "South FOB", "FOB2": "Central FOB", "FOB3": "North FOB" };
const fobMap = { "FOB1": "1", "FOB2": "2", "FOB3": "3" };
const posMap = { "FOB1": "1", "FOB2": "2", "FOB3": "3" }; // Used for UI selections

const gateMap = { 'G1': 'FOBB_1', 'G2': 'FOBB_2', 'G3': 'FOBB_3', 'G4': 'FOBT_1', 'G5': 'FOBT_2' };
const reverseGateMap = {};
for (const [k, v] of Object.entries(gateMap)) { 
    reverseGateMap[v] = k; 
    if (nodeMeta[v]) nodeMeta[v].label = `Gate ${k.substring(1)}`;
}
