let map;
let markerLayer = L.layerGroup();
let edgeLayer = L.layerGroup();
let pathLayer = L.layerGroup();
let animationLayer = L.layerGroup();
let pinLayer = L.layerGroup();

const startSel = document.getElementById('startPlatform');
const posSel = document.getElementById('startPosition');
const endSelect = document.getElementById('endNode');
const resourcePrefSel = document.getElementById('resourcePref');
const navigateBtn = document.getElementById('navigateBtn');

function getLatLng(nodeId) { 
    const [x, y] = nodes[nodeId]; 
    return [-y, x]; 
}

function updateMapStyles() {
    if (!map) return;
    const zoom = map.getZoom();
    const scale = Math.pow(2, zoom);

    edgeLayer.eachLayer(layer => {
        if (layer instanceof L.Polyline && layer.feature) {
            if (layer.feature.type === 'fob') {
                layer.setStyle({ weight: Math.max(2, 60 * scale) });
            } else if (layer.feature.type === 'walkway') {
                layer.setStyle({ weight: Math.max(2, 120 * scale) });
            } else if (layer.feature.type === 'rail') {
                layer.setStyle({ weight: Math.max(1, 4 * scale) });
            } else if (layer.feature.type === 'sleeper') {
                layer.setStyle({ weight: Math.max(1, 8 * scale) });
            }
        }
    });

    const fobFontSize = Math.max(6, 8 + (zoom + 2.2) * 5);
    document.documentElement.style.setProperty('--fob-font', `${fobFontSize}px`);
}

function initMap() {
    // Lock panning within the station coordinate bounds (plus padding)
    const bounds = [
        [-1900, -200], // Bottom-Left limit
        [100, 2100]    // Top-Right limit
    ];

    map = L.map('map', {
        crs: L.CRS.Simple, 
        minZoom: -2.2, 
        maxZoom: 0.5,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0, // Hard lock pan boundary
        zoomControl: false, 
        attributionControl: false,
        zoomSnap: 0.1, 
        zoomDelta: 0.1
    });

    map.createPane('pathUnderPane');
    map.getPane('pathUnderPane').style.zIndex = 410;
    map.createPane('fobPane');
    map.getPane('fobPane').style.zIndex = 450;
    map.createPane('pathAbovePane');
    map.getPane('pathAbovePane').style.zIndex = 500;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.addLayer(edgeLayer); map.addLayer(pathLayer);
    map.addLayer(markerLayer); map.addLayer(animationLayer); map.addLayer(pinLayer);

    drawBaseGraph();

    const centerLat = -925; 
    const centerLng = 950;  
    setTimeout(() => {
        map.setView([centerLat, centerLng], -2.2);
        map.invalidateSize();
        updateMapStyles();
    }, 100);

    map.on('zoomend', updateMapStyles);

    map.on('click', function (e) {
        if (typeof introAnimationCompleted !== 'undefined' && !introAnimationCompleted) return;
        
        const coords = [e.latlng.lng, -e.latlng.lat];
        let closest = null, minD = Infinity;
        for (let r = 1; r <= 5; r++) {
            for (let c = 1; c <= 3; c++) {
                const n = `W${r}_${c}`;
                const [nx, ny] = nodes[n];
                const dist = Math.sqrt((coords[0] - nx) ** 2 + (coords[1] - ny) ** 2);
                if (dist < minD) { minD = dist; closest = n; }
            }
        }
        if (closest) setSourceNodeFromId(closest);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const qrNode = urlParams.get('qr');
    if (qrNode && nodes[qrNode] && qrNode.startsWith('W')) {
        setSourceNodeFromId(qrNode);
    }
}

function drawBaseGraph() {
    // Draw Tracks Between Platforms
    for (let r = 1; r < 5; r++) {
        const y1 = nodes[`W${r}_1`][1], y2 = nodes[`W${r + 1}_1`][1];
        const midY = (y1 + y2) / 2;
        const startX = nodes[`W${r}_1`][0] - 350, endX = nodes[`W${r}_3`][0] + 350;

        [midY - 20, midY + 20].forEach(trackY => {
            const r1 = L.polyline([[-trackY - 8, startX], [-trackY - 8, endX]], { color: '#0d0d0d', weight: 4, opacity: 1, interactive: false }).addTo(edgeLayer);
            r1.feature = { type: 'rail' };
            const r2 = L.polyline([[-trackY + 8, startX], [-trackY + 8, endX]], { color: '#0d0d0d', weight: 4, opacity: 1, interactive: false }).addTo(edgeLayer);
            r2.feature = { type: 'rail' };

            for (let sx = startX; sx <= endX; sx += 32) {
                const sL = L.polyline([[-trackY - 14, sx], [-trackY + 14, sx]], {
                    color: '#080808', weight: 8, opacity: 1, interactive: false
                }).addTo(edgeLayer);
                sL.feature = { type: 'sleeper' };
            }
        });
    }

    for (let r = 1; r <= 5; r++) {
        const y = nodes[`W${r}_1`][1], x1 = nodes[`W${r}_1`][0], x3 = nodes[`W${r}_3`][0];
        const wL = L.polyline([[-y, x1 - 350], [-y, x3 + 350]], { color: '#1a1a1a', weight: 40, opacity: 1, lineCap: 'butt', lineJoin: 'round', interactive: false }).addTo(edgeLayer);
        wL.feature = { type: 'walkway' };

        let pLabel = "";
        if (r === 1) pLabel = "P 8"; if (r === 2) pLabel = "P 7 / 6"; if (r === 3) pLabel = "P 5 / 4";
        if (r === 4) pLabel = "P 3 / 2"; if (r === 5) pLabel = "P 1";

        let lLabel = L.divIcon({ className: 'custom-div-icon', html: `<div class="platform-label">${pLabel}</div>`, iconSize: [80, 24], iconAnchor: [150, 12] });
        L.marker([-y, x1 - 350], { icon: lLabel, interactive: false }).addTo(markerLayer);

        if (r === 1) { 
            let pbIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="amenity-label parcel-box">Parcel Box</div>`, iconSize: [80, 20], iconAnchor: [150, -12] });
            L.marker([-y, x1 - 350], { icon: pbIcon, interactive: false }).addTo(markerLayer);
        }
        if (r === 2) { 
            let btIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="amenity-label bio-toilet">Bio Toilet</div>`, iconSize: [80, 20], iconAnchor: [-10, 12] });
            L.marker([-y, x3 + 350], { icon: btIcon, interactive: false }).addTo(markerLayer);
        }
        if (r === 3 || r === 4) { 
            let btIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="amenity-label bio-toilet">Bio Toilet</div>`, iconSize: [80, 20], iconAnchor: [150, -12] });
            L.marker([-y, x1 - 350], { icon: btIcon, interactive: false }).addTo(markerLayer);
        }
        if (r === 5) { 
            let putIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="amenity-label pay-use-toilet">Pay & Use Toilet</div>`, iconSize: [120, 20], iconAnchor: [180, -12] });
            L.marker([-y, x1 - 350], { icon: putIcon, interactive: false }).addTo(markerLayer);
        }
    }

    for (let c = 1; c <= 3; c++) {
        const fobX = nodes[`W1_${c}`][0], topY = 50, bottomY = nodes[`W5_${c}`][1];

        const fobL = L.polyline([[-topY, fobX], [-bottomY, fobX]], {
            color: '#161616', weight: 60, opacity: 1, lineCap: 'butt', interactive: false,
            pane: 'fobPane'
        }).addTo(edgeLayer);
        fobL.feature = { type: 'fob' };

        const nameStr = fobNames[`FOB${c}`].toUpperCase().split('').join('<br>');
        const height = bottomY - topY;
        const vTextIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="fob-vertical-label" style="height: ${height}px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">${nameStr}</div>`,
            iconSize: [52, height],
            iconAnchor: [26, height / 2]
        });
        L.marker([-(topY + bottomY) / 2, fobX], { icon: vTextIcon, interactive: false, pane: 'fobPane' }).addTo(markerLayer);
    }

    for (const [gateName, nodeId] of Object.entries(gateMap)) {
        const [gx, gy] = nodes[nodeId];
        let anchorOffset;
        if (nodeId.startsWith('FOBT')) anchorOffset = [20, 75]; 
        else anchorOffset = [20, -25]; 

        const gLabel = L.divIcon({
            className: 'custom-div-icon', html: `<div class="gate-label">${gateName}</div>`,
            iconSize: [40, 20], iconAnchor: anchorOffset
        });
        L.marker([-gy, gx], { icon: gLabel, interactive: false }).addTo(markerLayer);
    }

    for (const id of Object.keys(nodes)) {
        let size, htmlStr, className = "node-marker", isHoverNode = false;

        if (id.startsWith('W')) {
            size = 18; className += " junction-dot";
            htmlStr = `<div class="${className}"></div>`;
            isHoverNode = true;
        }
        else if (id.startsWith('S')) { size = 24; className += " stair"; htmlStr = `<div class="${className}">S</div>`; }
        else if (id.startsWith('R')) { size = 24; className += " ramp"; htmlStr = `<div class="${className}">R</div>`; }
        else if (id.startsWith('E')) { size = 24; className += " escalator"; htmlStr = `<div class="${className}">E</div>`; }
        else if (id.startsWith('L')) { size = 24; className += " lift"; htmlStr = `<div class="${className}">L</div>`; }
        else continue;

        const customIcon = L.divIcon({ className: 'custom-div-icon', html: htmlStr, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
        const marker = L.marker(getLatLng(id), { icon: customIcon }).addTo(markerLayer);

        if (id.startsWith('S')) marker.bindTooltip("Stairs", { direction: 'top', offset: [0, -12] });
        if (id.startsWith('R')) marker.bindTooltip("Ramp", { direction: 'top', offset: [0, -12] });
        if (id.startsWith('E')) marker.bindTooltip("Escalator", { direction: 'top', offset: [0, -12] });
        if (id.startsWith('L')) marker.bindTooltip("Lift", { direction: 'top', offset: [0, -12] });

        if (isHoverNode) {
            let disp = reverseGateMap[id] ? `${reverseGateMap[id]} (${id})` : id;
            marker.bindTooltip(disp, { direction: 'top', offset: [0, -(size / 2 + 2)], className: 'custom-tooltip', permanent: false });

            marker.on('click', (e) => {
                if (typeof introAnimationCompleted !== 'undefined' && !introAnimationCompleted) return;
                L.DomEvent.stopPropagation(e);
                setSourceNodeFromId(id);
            });
        }
    }
}

function setSourceNodeFromId(nodeId) {
    const [wKey, posKey] = nodeId.split('_');

    let mPlat = "";
    for (const [p, walk] of Object.entries(platformMap)) { if (walk === wKey) { mPlat = p; break; } }

    let mPos = "";
    for (const [k, v] of Object.entries(posMap)) { if (v === posKey) { mPos = k; break; } }

    if (mPlat && mPos) {
        startSel.value = mPlat;
        posSel.value = mPos;
        // Also update custom dropdown UI if it exists
        const nativeSelects = document.querySelectorAll('select');
        nativeSelects.forEach(sel => {
            sel.dispatchEvent(new Event('change'));
        });
        updateState();
    }
}

function placePins(startNode, endNode) {
    pinLayer.clearLayers();
    if (startNode) {
        const youIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="pin-you">You</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
        L.marker(getLatLng(startNode), { icon: youIcon }).addTo(pinLayer);
    }
    if (endNode) {
        const destIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pin-dest"><svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
        L.marker(getLatLng(endNode), { icon: destIcon }).addTo(pinLayer);
    }
}

function isFOBNode(id) {
    return id.startsWith('FOB') || id.startsWith('S') || id.startsWith('R') || id.startsWith('E') || id.startsWith('L');
}

function drawPath(path) {
    pathLayer.clearLayers(); 
    animationLayer.clearLayers();
    
    for (let i = 0; i < path.length - 1; i++) {
        const u = path[i], v = path[i + 1];
        const latlngs = [getLatLng(u), getLatLng(v)];

        let pane = 'pathUnderPane';
        if (isFOBNode(v)) {
            pane = 'pathAbovePane';
        }

        L.polyline(latlngs, {
            color: 'rgba(255, 255, 255, 0.8)',
            weight: 12,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
            pane: pane
        }).addTo(pathLayer);
    }

    const fullLatLngs = path.map(id => getLatLng(id));
    const dummyLine = L.polyline(fullLatLngs);
    map.flyToBounds(dummyLine.getBounds(), { padding: [100, 100], duration: 1.5, easeLinearity: 0.25 });
}
