// Core Mystic Editor engine: canvas, objects, layers, AI hook

const MysticEditor = {
    canvas: null,
    ctx: null,
    objects: [],      // { id, type, x, y, w, h, text, img, selected }
    activeObjectId: null,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    zoom: 1
};

function initCanvas() {
    const canvas = document.getElementById('design-canvas');
    MysticEditor.canvas = canvas;
    MysticEditor.ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', onCanvasMouseUp);
    canvas.addEventListener('mouseleave', onCanvasMouseUp);

    redrawCanvas();
}

function redrawCanvas() {
    const { ctx, canvas, objects, zoom } = MysticEditor;
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
        if (obj.type === 'text') {
            ctx.font = `${obj.fontSize || 48}px ${obj.fontFamily || 'Arial'}`;
            ctx.fillStyle = obj.color || '#000000';
            ctx.fillText(obj.text, obj.x, obj.y);
        } else if (obj.type === 'image' && obj.img) {
            ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
        } else if (obj.type === 'rect') {
            ctx.fillStyle = obj.fill || '#cccccc';
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
        if (obj.selected) {
            ctx.strokeStyle = '#b06cff';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.w || 120, obj.h || 60);
        }
    });

    ctx.restore();
}

function addTextObject(text = 'New Text') {
    const id = crypto.randomUUID();
    const obj = {
        id,
        type: 'text',
        text,
        x: 200,
        y: 200,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#000000',
        selected: true
    };
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    selectObject(id);
    updateLayersPanel();
    redrawCanvas();
}

function addImageObject(img) {
    const id = crypto.randomUUID();
    const obj = {
        id,
        type: 'image',
        img,
        x: 200,
        y: 200,
        w: img.width * 0.4,
        h: img.height * 0.4,
        selected: true
    };
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    selectObject(id);
    updateLayersPanel();
    redrawCanvas();
}

function addRectObject() {
    const id = crypto.randomUUID();
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
    MysticEditor.objects.push(obj);
    MysticEditor.activeObjectId = id;
    selectObject(id);
    updateLayersPanel();
    redrawCanvas();
}

function getObjectAt(x, y) {
    const { objects } = MysticEditor;
    for (let i = objects.length - 1; i >= 0; i--) {
        const o = objects[i];
        const w = o.w || 200;
        const h = o.h || 80;
        if (x >= o.x && x <= o.x + w && y >= o.y && y <= o.y + h) {
            return o;
        }
    }
    return null;
}

function selectObject(id) {
    MysticEditor.objects.forEach(o => {
        o.selected = (o.id === id);
    });
    MysticEditor.activeObjectId = id;
    updateLayersPanel();
    redrawCanvas();
}

function onCanvasMouseDown(e) {
    const rect = MysticEditor.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / MysticEditor.zoom;
    const y = (e.clientY - rect.top) / MysticEditor.zoom;

    const obj = getObjectAt(x, y);
    if (obj) {
        selectObject(obj.id);
        MysticEditor.isDragging = true;
        MysticEditor.dragOffsetX = x - obj.x;
        MysticEditor.dragOffsetY = y - obj.y;
    } else {
        MysticEditor.activeObjectId = null;
        MysticEditor.objects.forEach(o => (o.selected = false));
        updateLayersPanel();
        redrawCanvas();
    }
}

function onCanvasMouseMove(e) {
    if (!MysticEditor.isDragging || !MysticEditor.activeObjectId) return;

    const rect = MysticEditor.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / MysticEditor.zoom;
    const y = (e.clientY - rect.top) / MysticEditor.zoom;

    const obj = MysticEditor.objects.find(o => o.id === MysticEditor.activeObjectId);
    if (!obj) return;

    obj.x = x - MysticEditor.dragOffsetX;
    obj.y = y - MysticEditor.dragOffsetY;
    redrawCanvas();
}

function onCanvasMouseUp() {
    MysticEditor.isDragging = false;
}

function zoomIn() {
    MysticEditor.zoom = Math.min(MysticEditor.zoom + 0.1, 3);
    redrawCanvas();
}

function zoomOut() {
    MysticEditor.zoom = Math.max(MysticEditor.zoom - 0.1, 0.3);
    redrawCanvas();
}

function deleteActiveObject() {
    if (!MysticEditor.activeObjectId) return;
    MysticEditor.objects = MysticEditor.objects.filter(
        o => o.id !== MysticEditor.activeObjectId
    );
    MysticEditor.activeObjectId = null;
    updateLayersPanel();
    redrawCanvas();
}

// AI: when image URL is ready, load and add to canvas
function addAIImageToCanvas(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => addImageObject(img);
    img.src = imageUrl;
}

// Placeholder AI handler (you’ll wire to real API later)
function handleAIGenerate() {
    const prompt = document.getElementById('ai-prompt').value.trim();
    if (!prompt) return;

    console.log('AI prompt:', prompt);
    // For now, just add a placeholder rectangle labeled "AI"
    addTextObject('AI Image');
}

window.MysticEditor = MysticEditor;
window.initCanvas = initCanvas;
window.addTextObject = addTextObject;
window.addRectObject = addRectObject;
window.addImageObject = addImageObject;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.deleteActiveObject = deleteActiveObject;
window.handleAIGenerate = handleAIGenerate;
window.selectObject = selectObject;
