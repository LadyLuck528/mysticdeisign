// Tool registry + simple actions

const MysticTools = {
    currentTool: null
};

function setTool(toolId) {
    MysticTools.currentTool = toolId;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active-tool', btn.dataset.tool === toolId);
    });

    if (toolId === 'text') {
        addTextObject();
    } else if (toolId === 'shapes-rect') {
        addRectObject();
    }
}

function setupToolButtons() {
    const map = {
        'Text': 'text',
        'Shapes': 'shapes-rect',
        'Upload': 'upload',
        'Brush': 'brush',
        'Eraser': 'eraser',
        'Select': 'select',
        'Zoom': 'zoom'
    };

    document.querySelectorAll('#left-toolbar .tool-btn').forEach(btn => {
        const label = btn.querySelector('.label')?.textContent.trim();
        const mapped = map[label];
        if (mapped) {
            btn.dataset.tool = mapped;
            btn.addEventListener('click', () => {
                if (mapped === 'upload') {
                    triggerUpload();
                } else if (mapped === 'zoom') {
                    zoomIn();
                } else {
                    setTool(mapped);
                }
            });
        }
    });
}

function triggerUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => addImageObject(img);
        img.src = URL.createObjectURL(file);
    };
    input.click();
}

window.MysticTools = MysticTools;
window.setupToolButtons = setupToolButtons;
