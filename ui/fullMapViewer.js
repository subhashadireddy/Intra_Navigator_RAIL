// Standalone SVG Full Map Viewer Engine
document.addEventListener('DOMContentLoaded', () => {
    const fullMapBtn = document.getElementById('full-map-btn');
    const fullMapModal = document.getElementById('full-map-modal');
    const fullMapClose = document.getElementById('full-map-close');
    const viewerContent = document.getElementById('svg-viewer-content');
    
    const zoomInBtn = document.getElementById('fm-zoom-in');
    const zoomOutBtn = document.getElementById('fm-zoom-out');
    const zoomResetBtn = document.getElementById('fm-zoom-reset');

    if (!fullMapBtn || !fullMapModal || !fullMapClose || !viewerContent) return;

    let svgElement = null;
    let svgLoaded = false;

    // Viewport Transformation State
    let scale = 1.0;
    let panX = 0;
    let panY = 0;

    // Drag Interaction State
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Open Modal and Lazy-Load SVG Map
    const openModal = () => {
        fullMapModal.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Lock main scroll
        
        if (!svgLoaded) {
            viewerContent.innerHTML = '<div class="fm-loader"><div class="spinner"></div>Loading High-Resolution Map...</div>';
            
            // Dynamic local fetch
            fetch('fullMap.svg')
                .then(res => {
                    if (!res.ok) throw new Error("Network response was not ok");
                    return res.text();
                })
                .then(svgText => {
                    viewerContent.innerHTML = svgText;
                    svgElement = viewerContent.querySelector('svg');
                    
                    if (svgElement) {
                        // Apply styling for sharp scales and origin points
                        svgElement.style.transformOrigin = '0 0';
                        svgElement.style.transition = 'none';
                        
                        svgLoaded = true;
                        // Fit to window size
                        setTimeout(resetView, 100);
                    } else {
                        throw new Error("Invalid SVG Content");
                    }
                })
                .catch(err => {
                    console.error("Failed to load map SVG:", err);
                    viewerContent.innerHTML = `<div class="fm-error">Could not load station map. Please check server.</div>`;
                });
        } else {
            setTimeout(resetView, 50);
        }
    };

    // Close Modal
    const closeModal = () => {
        fullMapModal.classList.remove('visible');
        document.body.style.overflow = ''; // Unlock main scroll
    };

    // Reset Zoom and Center SVG
    const resetView = () => {
        if (!svgElement) return;

        const containerWidth = viewerContent.clientWidth;
        const containerHeight = viewerContent.clientHeight;
        
        // Read SVG dimensions from attributes or viewBox
        let viewBoxWidth = 1440;
        let viewBoxHeight = 810;
        
        const viewBoxAttr = svgElement.getAttribute('viewBox');
        if (viewBoxAttr) {
            const parts = viewBoxAttr.split(/\s+/).map(Number);
            if (parts.length === 4) {
                viewBoxWidth = parts[2];
                viewBoxHeight = parts[3];
            }
        } else {
            const wAttr = parseFloat(svgElement.getAttribute('width'));
            const hAttr = parseFloat(svgElement.getAttribute('height'));
            if (wAttr && hAttr) {
                viewBoxWidth = wAttr;
                viewBoxHeight = hAttr;
            }
        }

        // Fit inside viewport with 8% padding margins
        const scaleX = containerWidth / viewBoxWidth;
        const scaleY = containerHeight / viewBoxHeight;
        scale = Math.min(scaleX, scaleY) * 0.92;

        // Calculate center offsets
        panX = (containerWidth - viewBoxWidth * scale) / 2;
        panY = (containerHeight - viewBoxHeight * scale) / 2;

        applyTransform();
    };

    // Apply Transformation Matrix styles
    const applyTransform = () => {
        if (!svgElement) return;
        svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    };

    // Cursor-Centered Zoom Calculations
    const zoomAtPoint = (factor, clientX, clientY) => {
        if (!svgElement) return;

        const rect = viewerContent.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Target coords in original SVG space before zoom shift
        const targetX = (mouseX - panX) / scale;
        const targetY = (mouseY - panY) / scale;

        // Calculate new clamped scale range
        const newScale = Math.min(8.0, Math.max(0.4, scale * factor));

        // Shift pan offsets so target remains under the same mouse coordinates
        panX = mouseX - targetX * newScale;
        panY = mouseY - targetY * newScale;
        scale = newScale;

        applyTransform();
    };

    // Wheel Zoom handler
    viewerContent.addEventListener('wheel', (e) => {
        if (!svgLoaded) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        zoomAtPoint(factor, e.clientX, e.clientY);
    }, { passive: false });

    // Drag-to-Pan (Mouse Events)
    viewerContent.addEventListener('mousedown', (e) => {
        if (!svgLoaded || e.button !== 0) return; // Only left click
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        viewerContent.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            viewerContent.style.cursor = 'grab';
        }
    });

    // Touch-to-Pan (Mobile Touch Events)
    let touchStartDist = 0;
    viewerContent.addEventListener('touchstart', (e) => {
        if (!svgLoaded) return;
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            // Capture pinch start distance
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    });

    viewerContent.addEventListener('touchmove', (e) => {
        if (!svgLoaded) return;
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            applyTransform();
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (touchStartDist > 0) {
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const factor = dist / touchStartDist;
                
                // Scale dampening to smooth pinching
                const zoomFactor = factor > 1 ? 1.05 : 0.95;
                zoomAtPoint(zoomFactor, midX, midY);
                touchStartDist = dist;
            }
        }
    }, { passive: false });

    viewerContent.addEventListener('touchend', () => {
        isDragging = false;
        touchStartDist = 0;
    });

    // Zoom Button Handlers
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            const cx = viewerContent.clientWidth / 2;
            const cy = viewerContent.clientHeight / 2;
            zoomAtPoint(1.3, cx, cy);
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            const cx = viewerContent.clientWidth / 2;
            const cy = viewerContent.clientHeight / 2;
            zoomAtPoint(0.75, cx, cy);
        });
    }

    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', resetView);
    }

    // Modal Triggers
    fullMapBtn.addEventListener('click', openModal);
    fullMapClose.addEventListener('click', closeModal);
    
    // Close on clicking darkened overlay margins
    fullMapModal.addEventListener('click', (e) => {
        if (e.target === fullMapModal) closeModal();
    });

    // ESC Key Closure support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullMapModal.classList.contains('visible')) {
            closeModal();
        }
    });
});
