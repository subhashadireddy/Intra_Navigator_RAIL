// Global State
let introAnimationCompleted = false;
let isUserMoving = false;

document.addEventListener('DOMContentLoaded', () => {
    const holdToMoveBtn = document.getElementById('hold-to-move-btn');
    const movementBtnContainer = document.getElementById('movement-btn-container');

    if (!holdToMoveBtn || !movementBtnContainer) return;

    // Movement Start Handler
    const startMovement = (e) => {
        if (!introAnimationCompleted) return;
        // e.preventDefault(); // Removed because it might block scrolling if button covers a lot of area
        isUserMoving = true;
        holdToMoveBtn.classList.add('active-state');
    };

    // Movement Stop Handler
    const stopMovement = (e) => {
        // e.preventDefault();
        isUserMoving = false;
        holdToMoveBtn.classList.remove('active-state');
    };

    // Desktop
    holdToMoveBtn.addEventListener('mousedown', startMovement);
    holdToMoveBtn.addEventListener('mouseup', stopMovement);
    holdToMoveBtn.addEventListener('mouseleave', stopMovement);

    // Mobile
    holdToMoveBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startMovement(e); }, { passive: false });
    holdToMoveBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopMovement(e); }, { passive: false });
    holdToMoveBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopMovement(e); }, { passive: false });
});

function showMovementButton() {
    const movementBtnContainer = document.getElementById('movement-btn-container');
    if (movementBtnContainer) {
        movementBtnContainer.style.display = 'block';
    }
}

function hideMovementButton() {
    const movementBtnContainer = document.getElementById('movement-btn-container');
    if (movementBtnContainer) {
        movementBtnContainer.style.display = 'none';
    }
}

function enableMovementButton() {
    const holdToMoveBtn = document.getElementById('hold-to-move-btn');
    if (holdToMoveBtn) {
        holdToMoveBtn.disabled = false;
    }
}

function disableMovementButton() {
    const holdToMoveBtn = document.getElementById('hold-to-move-btn');
    if (holdToMoveBtn) {
        holdToMoveBtn.disabled = true;
    }
}
