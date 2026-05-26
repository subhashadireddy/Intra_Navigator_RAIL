function distance(id1, id2) {
    const [x1, y1] = nodes[id1]; 
    const [x2, y2] = nodes[id2];
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function isStairNode(node) { return node.startsWith('S'); }
function isRampNode(node) { return node.startsWith('R'); }
function isLiftNode(node) { return node.startsWith('L'); }
function isEscalatorNode(node) { return node.startsWith('E'); }
function isAccessibleNode(node) { return node.startsWith('R') || node.startsWith('L') || node.startsWith('E'); }

function aStar(start, goal, resourcePref) {
    let openSet = [start]; 
    let cameFrom = {}; 
    let gScore = {}, fScore = {};
    
    for (let node of Object.keys(nodes)) { 
        gScore[node] = Infinity; 
        fScore[node] = Infinity; 
    }
    
    gScore[start] = 0; 
    fScore[start] = distance(start, goal);

    while (openSet.length > 0) {
        let current = openSet[0], lowestFIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (fScore[openSet[i]] < fScore[current]) { 
                current = openSet[i]; 
                lowestFIndex = i; 
            }
        }

        if (current === goal) return reconstructPath(cameFrom, current);
        
        openSet.splice(lowestFIndex, 1);

        for (let neighbor of graph[current]) {
            let walkwayPenalty = 0;

            // Transition Penalty: Climbing or Descending is expensive
            let levelChangePenalty = (isStairNode(neighbor) || isStairNode(current) || isAccessibleNode(neighbor) || isAccessibleNode(current)) ? 2000 : 0;

            let resourcePenalty = 0;
            if (resourcePref !== 'none') {
                const isStair = isStairNode(neighbor);
                const isRamp = isRampNode(neighbor);
                const isLift = isLiftNode(neighbor);
                const isEscalator = isEscalatorNode(neighbor);

                const isAnyResource = isStair || isRamp || isLift || isEscalator;

                if (isAnyResource) {
                    if (resourcePref === 'lifts' && !isLift) resourcePenalty = 50000;
                    else if (resourcePref === 'ramps' && !isRamp) resourcePenalty = 50000;
                    else if (resourcePref === 'stairs' && !isStair) resourcePenalty = 50000;
                    else if (resourcePref === 'escalators' && !isEscalator) resourcePenalty = 50000;
                    else resourcePenalty = -500; // Bonus for matching resource
                }
            }

            let tentative_gScore = gScore[current] + distance(current, neighbor) + walkwayPenalty + resourcePenalty + levelChangePenalty;

            if (tentative_gScore < gScore[neighbor]) {
                cameFrom[neighbor] = current; 
                gScore[neighbor] = tentative_gScore;
                fScore[neighbor] = gScore[neighbor] + distance(neighbor, goal);
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        }
    }
    return null;
}

function reconstructPath(cameFrom, current) {
    const total_path = [current];
    while (cameFrom[current]) { 
        current = cameFrom[current]; 
        total_path.unshift(current); 
    }
    return total_path;
}
