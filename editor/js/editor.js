/* ---------------------------------------------------------
   Mystic Design - Full Editor Engine
   File: editor.js
   --------------------------------------------------------- */

/* ===========================
   GLOBAL ELEMENTS
   =========================== */
const canvas = document.getElementById("designCanvas");
const ctx = canvas.getContext("2d");
const drawLayer = document.getElementById("drawLayer");
const drawCtx = drawLayer.getContext("2d");

let layers = [];
let history = [];
let redoStack = [];

let currentZoom = 1;
let isDrawing = false;
let drawSettings = {
    size: 12,
    opacity: 1,
    smoothing: 0.4
};

/* ===========================
   INITIAL SETUP
   =========================== */
function initEditor() {
    resizeCanvas();
    attachUIEvents();
    updateLayerList();
}
window.addEventListener("load", initEditor);

function resizeCanvas() {
    const container = document.querySelector(".editor-canvas-inner");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawLayer.width = canvas.width;
    drawLayer.height = canvas.height;
}

/* ===========================
   LAYER SYSTEM
   =========================== */
function addLayer(type, data) {
    const layer = { id: Date.now(), type, data };
    layers.push(layer);
    saveHistory();
    updateLayerList();
    renderCanvas();
}

function updateLayerList() {
    const simpleList = document.getElementById("layerList");
    const proList = document.getElementById("proLayerList");

    if (!simpleList || !proList) return;

    simpleList.innerHTML = "";
    proList.innerHTML = "";

    layers.forEach(layer => {
        const item = document.createElement("div");
        item.className = "layer-item";
        item.textContent = `${layer.type} Layer`;
        simpleList.appendChild(item);

        const item2 = item.cloneNode(true);
        proList.appendChild(item2);
    });
}

/* ===========================
   RENDERING
   =========================== */
function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach(layer => {
        if (layer.type === "image") {
            ctx.drawImage(layer.data, 0, 0, canvas.width, canvas.height);
        }
        if (layer.type === "text") {
            ctx.font = "40px Arial";
            ctx.fillStyle = layer.data.color;
            ctx.fillText(layer.data.text, layer.data.x, layer.data.y);
        }
    });

    // Draw layer sits on top
    ctx.drawImage(drawLayer, 0, 0);
}

/* ===========================
   HISTORY (Undo / Redo)
   =========================== */
function saveHistory() {
    history.push(JSON.stringify(layers));
    redoStack = [];
}

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        layers = JSON.parse(history[history.length - 1]);
        updateLayerList();
        renderCanvas();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        history.push(state);
        layers = JSON.parse(state);
        updateLayerList();
        renderCanvas();
    }
}

/* ===========================
   IMAGE UPLOAD
   =========================== */
document.getElementById("uploadImage").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => addLayer("image", img);
    img.src = URL.createObjectURL(file);
});

/* ===========================
   ADD TEXT
   =========================== */
document.getElementById("addTextButton").addEventListener("click", () => {
    const text = document.getElementById("textInput").value.trim();
    if (!text) return;

    addLayer("text", {
        text,
        x: 100,
        y: 100,
        color: document.getElementById("colorPicker").value
    });
});

/* ===========================
   DRAWING TOOLS
   =========================== */
document.getElementById("brushSize").addEventListener("input", e => {
    drawSettings.size = Number(e.target.value);
});
document.getElementById("brushOpacity").addEventListener("input", e => {
    drawSettings.opacity = Number(e.target.value) / 100;
});
document.getElementById("brushSmoothing").addEventListener("input", e => {
    drawSettings.smoothing = Number(e.target.value) / 100;
});

document.getElementById("enableDrawMode").addEventListener("click", () => {
    isDrawing = true;
});
document.getElementById("disableDrawMode").addEventListener("click", () => {
    isDrawing = false;
});
document.getElementById("clearDrawLayer").addEventListener("click", () => {
    drawCtx.clearRect(0, 0, drawLayer.width, drawLayer.height);
    renderCanvas();
});

drawLayer.addEventListener("mousedown", startDraw);
drawLayer.addEventListener("mousemove", draw);
drawLayer.addEventListener("mouseup", endDraw);

function startDraw(e) {
    if (!isDrawing) return;
    drawCtx.lineWidth = drawSettings.size;
    drawCtx.strokeStyle = `rgba(255,255,255,${drawSettings.opacity})`;
    drawCtx.lineCap = "round";
    drawCtx.beginPath();
    drawCtx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    drawCtx.lineTo(e.offsetX, e.offsetY);
    drawCtx.stroke();
    renderCanvas();
}

function endDraw() {
    if (!isDrawing) return;
    saveHistory();
}

/* ===========================
   ZOOM
   =========================== */
document.getElementById("zoomInBtn").addEventListener("click", () => {
    currentZoom += 0.1;
    canvas.style.transform = `scale(${currentZoom})`;
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
    currentZoom = Math.max(0.2, currentZoom - 0.1);
    canvas.style.transform = `scale(${currentZoom})`;
});

/* ===========================
   GRID TOGGLE
   =========================== */
document.getElementById("toggleGridBtn").addEventListener("click", () => {
    const grid = document.getElementById("gridOverlay");
    grid.classList.toggle("active");
});

/* ===========================
   RESET DESIGN
   =========================== */
document.getElementById("resetDesign").addEventListener("click", () => {
    layers = [];
    drawCtx.clearRect(0, 0, drawLayer.width, drawLayer.height);
    saveHistory();
    updateLayerList();
    renderCanvas();
});

/* ===========================
   EXPORT DESIGN
   =========================== */
document.getElementById("exportDesign").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "mystic-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

/* ===========================
   SIMPLE / PRO MODE
   =========================== */
document.getElementById("simpleModeBtn").addEventListener("click", () => {
    document.querySelector(".editor-page").classList.add("simple-mode");
});
document.getElementById("proModeBtn").addEventListener("click", () => {
    document.querySelector(".editor-page").classList.remove("simple-mode");
});

/* ===========================
   AI IMAGE GENERATOR
   =========================== */
const aiBtn = document.getElementById("aiGenerateBtn");
const aiPromptInput = document.getElementById("aiPrompt");
const aiStatus = document.getElementById("aiStatus");

aiBtn.addEventListener("click", async () => {
    const prompt = aiPromptInput.value.trim();
    if (!prompt) {
        aiStatus.textContent = "Please enter a prompt.";
        return;
    }

    aiStatus.textContent = "Generating...";
    aiBtn.disabled = true;

    try {
        const result = await puter.ai.generateImage({ prompt });
        const blobUrl = URL.createObjectURL(result.image);

        const img = new Image();
        img.onload = () => {
            addLayer("image", img);
            aiStatus.textContent = "Done!";
        };
        img.src = blobUrl;

    } catch (e) {
        aiStatus.textContent = "AI failed. Try again.";
    } finally {
        aiBtn.disabled = false;
    }
});

/* ===========================
   3D VIEWER HOOK (placeholder)
   =========================== */
if (window.init3DViewer) {
    window.init3DViewer();
}

/* ===========================
   UNDO / REDO BUTTONS
   =========================== */
document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);

/* ===========================
   CONTINUE SHOPPING
   =========================== */
document.getElementById("continueShoppingLink").addEventListener("click", () => {
    window.location.href = "shop.html";
});
