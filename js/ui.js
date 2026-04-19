// UI wiring: init, AI button, bottom buttons, zoom, delete, etc.

window.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupToolButtons();
    setupAI();
    setupBottomButtons();
    setupKeyboardShortcuts();
});

function setupAI() {
    const btn = document.getElementById('ai-generate-btn');
    if (btn) {
        btn.addEventListener('click', handleAIGenerate);
    }
}

function setupBottomButtons() {
    const buttons = document.querySelectorAll('#bottom-buttons .primary-btn');
    buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if (text === 'Upload') {
            btn.addEventListener('click', triggerUpload);
        } else if (text === 'Preview') {
            btn.addEventListener('click', () => {
                console.log('Preview export placeholder');
                // later: export canvas → mockup
            });
        } else if (text === 'Add to Cart') {
            btn.addEventListener('click', () => {
                console.log('Add to cart placeholder');
            });
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            deleteActiveObject();
        }
        if (e.ctrlKey && e.key === '+') {
            zoomIn();
        }
        if (e.ctrlKey && e.key === '-') {
            zoomOut();
        }
    });
}
