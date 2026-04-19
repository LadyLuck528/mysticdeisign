// Layers panel rendering

function updateLayersPanel() {
    const list = document.getElementById('layers-list');
    if (!list) return;

    list.innerHTML = '';

    // Top = last object (front)
    [...MysticEditor.objects].slice().reverse().forEach(obj => {
        const item = document.createElement('div');
        item.className = 'layer-item';
        if (obj.selected) item.classList.add('active-layer');

        const label = document.createElement('span');
        label.textContent = obj.type === 'text'
            ? `Text: "${obj.text}"`
            : obj.type === 'image'
            ? 'Image'
            : obj.type === 'rect'
            ? 'Rectangle'
            : obj.type;

        item.appendChild(label);

        item.addEventListener('click', () => {
            selectObject(obj.id);
        });

        list.appendChild(item);
    });
}

window.updateLayersPanel = updateLayersPanel;
