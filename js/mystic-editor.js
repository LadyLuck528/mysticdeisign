// ---------- MODULE IMPORTS ----------
import { tools } from "./tools.js";

// ---------- TOOL & FLYOUT HELPERS ----------

function setActiveTool(btn) {
    const all = document.querySelectorAll('#left-toolbar .tool-btn');
    all.forEach(b => b.classList.remove('active-tool'));
    if (btn) btn.classList.add('active-tool');
}

function showFlyout(id) {
    document.querySelectorAll('.tool-flyout').forEach(f => f.classList.remove('visible'));
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

function hideFlyouts() {
    document.querySelectorAll('.tool-flyout').forEach(f => f.classList.remove('visible'));
}

// expose tool activation using tools.js
window.editor = window.editor || {};
editor.activateTool = function (name) {
    if (tools[name]) {
        tools[name].activate(editor);
    }
};

// ---------- IMAGE UPLOAD ----------

let hiddenFileInput = null;

function openImageUpload() {
    if (!hiddenFileInput) {
        hiddenFileInput = document.createElement('input');
        hiddenFileInput.type = 'file';
        hiddenFileInput.accept = 'image/*';
        hiddenFileInput.style.display = 'none';
        document.body.appendChild(hiddenFileInput);

        hiddenFileInput.addEventListener('change', () => {
            const file = hiddenFileInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => addImageObject(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    hiddenFileInput.value = '';
    hiddenFileInput.click();
}

// ---------- TOOLS WIRING ----------

function initTools() {
    const textBtn   = document.getElementById('text-tool');
    const shapesBtn = document.getElementById('shape-tool');
    const uploadBtn = document.getElementById('upload-tool');
    const zoomTool  = document.getElementById('zoom-tool');
    const undoBtn   = document.getElementById('undo-btn');
    const redoBtn   = document.getElementById('redo-btn');

    // LEFT TOOLBAR

    if (textBtn) {
        textBtn.addEventListener('click', () => {
            setActiveTool(textBtn);
            showFlyout('text-flyout');
        });
    }

    if (shapesBtn) {
        shapesBtn.addEventListener('click', () => {
            addRectObject();
            setActiveTool(shapesBtn);
            hideFlyouts();
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            openImageUpload();
            setActiveTool(uploadBtn);
            hideFlyouts();
        });
    }

    if (zoomTool) {
        zoomTool.addEventListener('click', () => {
            if (MysticEditor.zoom < 1.5) {
                zoomIn();
            } else {
                zoomOut();
            }
            setActiveTool(zoomTool);
        });
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            undo();
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            redo();
        });
    }

    // BOTTOM BUTTONS

    const bottomButtons = document.querySelectorAll('#bottom-buttons .primary-btn');
    bottomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Bottom button clicked:', btn.textContent.trim());
            // TODO: hook Upload/Preview/Add to Cart to Square + D1/R2
        });
    });

    // TEXT FLYOUT — ADD TEXT BUTTON

    const addTextBtn = document.getElementById('add-text-btn');
    if (addTextBtn) {
        addTextBtn.addEventListener('click', () => {
            editor.activateTool('text');
        });
    }

    // TEXT FLYOUT — REAL FONTS

    const fontList = document.getElementById('font-list');

    if (fontList) {
        const wait = setInterval(() => {
            if (window.MysticFonts && window.MysticFonts.length > 0) {
                clearInterval(wait);
                fontList.innerHTML = '';

                window.MysticFonts.forEach(name => {
                    const item = document.createElement('div');
                    item.className = 'font-item';
                    item.textContent = name;
                    item.style.fontFamily = name;

                    item.addEventListener('click', () => {
                        const active = MysticEditor.objects.find(
                            o => o.id === MysticEditor.activeObjectId && o.type === 'text'
                        );
                        if (active) {
                            active.fontFamily = name;
                            redrawCanvas();
                            updateLayersPanel();
                        } else {
                            addTextObject('New Text', name);
                        }
                    });

                    fontList.appendChild(item);
                });
            }
        }, 200);
    }

    // Click outside text flyout to close it
    document.addEventListener('click', e => {
        const flyout   = document.getElementById('text-flyout');
        const textBtnEl = document.getElementById('text-tool');
        if (!flyout || !textBtnEl) return;

        if (!flyout.contains(e.target) && !textBtnEl.contains(e.target)) {
            flyout.classList.remove('visible');
        }
    });
}

// ---------- BOOTSTRAP ----------

window.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initTools();
    initAIPanel();

    if (typeof loadMysticFonts === 'function') {
        loadMysticFonts();
    } else {
        console.warn('loadMysticFonts is not defined. Check fontloader.js load order.');
    }
});
