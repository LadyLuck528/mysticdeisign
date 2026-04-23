// ---------- TOOL DEFINITIONS ----------

export const tools = {
  text: {
    activate(editor) {
      addNewText(editor);
    }
  },

  shape: {
    activate(editor) {
      addRectObject(editor);
    }
  },

  // Add more tools here as needed
};

function initTools() {
    const textBtn = document.querySelector('.tool-btn[data-flyout="text-flyout"]');
    const shapesBtn = document.querySelector('.tool-btn[data-flyout="shapes-flyout"]');
    const uploadBtn = document.getElementById('upload-tool');
    const zoomTool = document.getElementById('zoom-tool');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (textBtn) {
        textBtn.addEventListener('click', () => {
            addTextObject('New Text');
            setActiveTool(textBtn);
        });
    }

    if (shapesBtn) {
        shapesBtn.addEventListener('click', () => {
            addRectObject();
            setActiveTool(shapesBtn);
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            openImageUpload();
            setActiveTool(uploadBtn);
        });
    }

    if (zoomTool) {
        zoomTool.addEventListener('click', () => {
            // simple toggle: zoom in once, then out
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

    // bottom buttons (Upload / Preview / Add to Cart) – stubs for now
    const bottomButtons = document.querySelectorAll('#bottom-buttons .primary-btn');
    bottomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Bottom button clicked:', btn.textContent.trim());
        });
    });
}

/* ---------- IMAGE UPLOAD ---------- */

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

window.initTools = initTools;
