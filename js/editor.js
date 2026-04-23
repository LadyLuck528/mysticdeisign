// CONFIG: plug your AI key here later (used server-side, placeholder here)
const MYSTIC_AI_API_KEY = 'YOUR_AI_KEY_HERE';

// Core editor state
const MysticEditor = {
    canvas: null,
    ctx: null,
    objects: [],
    activeObjectId: null,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    zoom: 1,
    history: [],
    future: []
};

/* ---------- CANVAS INIT & RENDER ---------- */

function initCanvas() {
    const canvas = document.getElementById('design-canvas');
    if (!canvas) return;

    MysticEditor.canvas = canvas;
    MysticEditor.ctx = canvas.getContext('2d');

    // base size; CSS wrapper will scale visually
    canvas.width = 1200;
    canvas.height = 600;

    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', onCanvasMouseUp);
    canvas.addEventListener('mouseleave', onCanvasMouseUp);

    saveHistory();
    redrawCanvas();
}

function redrawCanvas() {
    const { ctx, canvas, objects, zoom } = MysticEditor;
    if (!ctx || !canvas) return;

    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
        if (obj.type === 'text') {
            ctx.font = `${obj.fontSize || 48}px ${obj.fontFamily || 'Arial'}`;
            ctx.fillStyle = obj.color || '#000000';
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text, obj.x, obj.y);
        } else if (obj.type === 'image' && obj.img) {
            ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
        } else if (obj.type === 'rect') {
            ctx.fillStyle = obj.fill || '#cccccc';
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }

        if (obj.selected) {
            const bounds = getObjectBounds(obj);
            ctx.strokeStyle = '#b06cff';
            ctx.lineWidth = 2;
            ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
    });

    ctx.restore();
}

/* ---------- OBJECT HELPERS ---------- */

function getObjectBounds(obj) {
    if (obj.type === 'text') {
        const { ctx } = MysticEditor;
        if (!ctx) return { x: obj.x, y: obj.y, w: 120, h: 60 };
        ctx.save();
        ctx.font = `${obj.fontSize || 48}px ${obj.fontFamily || 'Arial'}`;
        const metrics = ctx.measureText(obj.text || '');
        ctx.restore();
        const w = metrics.width || 120;
        const h = (obj.fontSize || 48) * 1.2;
        return { x: obj.x, y: obj.y, w, h };
    }
    return { x: obj.x, y: obj.y, w: obj.w || 200, h: obj.h || 80 };
}

function getObjectAt(x, y) {
    const { objects } = MysticEditor;
    for (let i = objects.length - 1; i >= 0; i--) {
        const o = objects[i];
        const b = getObjectBounds(o);
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return o;
        }
    }
    return null;
}

function selectObject(id) {
    MysticEditor.objects.forEach(o => {
        o.selected = (o.id === id);
    });
    MysticEditor.activeObjectId = id || null;
    updateLayersPanel();
    redrawCanvas();
}

/* ---------- OBJECT CREATION ---------- */

function newId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function addTextObject(text = 'New Text', fontFamily = 'Arial') {
    const id = newId();
    const obj = {
        id,
        type: 'text',
        text,
        x: 200,
        y: 200,
        fontSize: 48,
        fontFamily,
        color: '#000000',
        selected: true
    };
    MysticEditor.objects.forEach(o => (o.selected = false));
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    saveHistory();
    updateLayersPanel();
    redrawCanvas();
}

function addRectObject() {
    const id = newId();
    const obj = {
        id,
        type: 'rect',
        x: 250,
        y: 250,
        w: 200,
        h: 120,
        fill: '#cccccc',
        selected: true
    };
    MysticEditor.objects.forEach(o => (o.selected = false));
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    saveHistory();
    updateLayersPanel();
    redrawCanvas();
}

function addImageObject(img) {
    const id = newId();
    const scale = 0.4;
    const w = img.width * scale;
    const h = img.height * scale;
    const obj = {
        id,
        type: 'image',
        img,
        x: 200,
        y: 200,
        w,
        h,
        selected: true
    };
    MysticEditor.objects.forEach(o => (o.selected = false));
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    saveHistory();
    updateLayersPanel();
    redrawCanvas();
}

/* ---------- MOUSE EVENTS ---------- */

function getCanvasCoords(e) {
    const rect = MysticEditor.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / MysticEditor.zoom;
    const y = (e.clientY - rect.top) / MysticEditor.zoom;
    return { x, y };
}

function onCanvasMouseDown(e) {
    const { x, y } = getCanvasCoords(e);
    const obj = getObjectAt(x, y);

    if (obj) {
        selectObject(obj.id);
        MysticEditor.isDragging = true;
        const b = getObjectBounds(obj);
        MysticEditor.dragOffsetX = x - b.x;
        MysticEditor.dragOffsetY = y - b.y;
    } else {
        MysticEditor.activeObjectId = null;
        MysticEditor.objects.forEach(o => (o.selected = false));
        updateLayersPanel();
        redrawCanvas();
    }
}

function onCanvasMouseMove(e) {
    if (!MysticEditor.isDragging || !MysticEditor.activeObjectId) return;

    const { x, y } = getCanvasCoords(e);
    const obj = MysticEditor.objects.find(o => o.id === MysticEditor.activeObjectId);
    if (!obj) return;

    const dx = x - MysticEditor.dragOffsetX;
    const dy = y - MysticEditor.dragOffsetY;

    obj.x = dx;
    obj.y = dy;

    redrawCanvas();
}

function onCanvasMouseUp() {
    if (MysticEditor.isDragging) {
        MysticEditor.isDragging = false;
        saveHistory();
    }
}

/* ---------- ZOOM & HISTORY ---------- */

function zoomIn() {
    MysticEditor.zoom = Math.min(MysticEditor.zoom + 0.1, 3);
    redrawCanvas();
}

function zoomOut() {
    MysticEditor.zoom = Math.max(MysticEditor.zoom - 0.1, 0.3);
    redrawCanvas();
}

function saveHistory() {
    const snapshot = JSON.stringify(
        MysticEditor.objects.map(o => ({
            ...o,
            img: undefined
        }))
    );
    MysticEditor.history.push(snapshot);
    MysticEditor.future = [];
}

function restoreFromSnapshot(snapshot) {
    const data = JSON.parse(snapshot);
    MysticEditor.objects = data.map(o => ({ ...o, img: null }));
    MysticEditor.activeObjectId = null;
    updateLayersPanel();
    redrawCanvas();
}

function undo() {
    if (MysticEditor.history.length <= 1) return;
    const current = MysticEditor.history.pop();
    MysticEditor.future.push(current);
    const prev = MysticEditor.history[MysticEditor.history.length - 1];
    restoreFromSnapshot(prev);
}

function redo() {
    if (!MysticEditor.future.length) return;
    const next = MysticEditor.future.pop();
    MysticEditor.history.push(next);
    restoreFromSnapshot(next);
}

/* ---------- LAYERS PANEL ---------- */

function updateLayersPanel() {
    const list = document.getElementById('layers-list');
    if (!list) return;

    list.innerHTML = '';

    const objects = [...MysticEditor.objects].slice().reverse();

    objects.forEach((obj, index) => {
        const item = document.createElement('div');
        item.className = 'layer-item';

        if (obj.selected) {
            item.style.borderColor = '#b06cff';
            item.style.boxShadow = '0 0 15px #b06cff';
            item.style.background = '#1a0a22';
        }

        const label = document.createElement('span');
        label.textContent = getLayerLabel(obj);

        const small = document.createElement('span');
        small.style.opacity = '0.7';
        small.style.fontSize = '12px';
        small.textContent = `#${MysticEditor.objects.length - index}`;

        item.appendChild(label);
        item.appendChild(small);

        item.addEventListener('click', () => {
            selectObject(obj.id);
        });

        list.appendChild(item);
    });
}

function getLayerLabel(obj) {
    if (obj.type === 'text') {
        return `Text: "${(obj.text || '').slice(0, 12)}"`;
    }
    if (obj.type === 'image') {
        return 'Image';
    }
    if (obj.type === 'rect') {
        return 'Rectangle';
    }
    return obj.type || 'Object';
}

/* ---------- AI PANEL ---------- */

function initAIPanel() {
    const promptEl = document.getElementById('ai-prompt');
    const btn = document.getElementById('ai-generate-btn');

    if (!btn || !promptEl) return;

    btn.addEventListener('click', async () => {
        const prompt = promptEl.value.trim();
        if (!prompt) return;

        console.log('AI prompt:', prompt);

        // TODO: call your Cloudflare Worker / AI endpoint here
        // using MYSTIC_AI_API_KEY from env on the server side.
        // For now, just drop a placeholder text object:
        addTextObject('AI Image');
    });
}