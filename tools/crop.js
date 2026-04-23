// /editor/js/tools/crop.js

import { EventBus } from '../event-bus.js';
import { History } from '../history.js';
import { Canvas } from '../canvas.js';

export const CropTool = {
    active: false,
    cropBox: null,
    productRatio: null, // auto-loaded from product data later
    minDPI: 300,

    activate(productData = null) {
        this.active = true;

        // Load product ratio if available
        if (productData && productData.printArea) {
            const w = productData.printArea.widthInches;
            const h = productData.printArea.heightInches;
            this.productRatio = w / h;
        } else {
            // fallback ratio (square)
            this.productRatio = 1;
        }

        this.createCropBox();
        EventBus.emit('panel:open', 'crop-panel');
    },

    deactivate() {
        this.active = false;
        this.removeCropBox();
        EventBus.emit('panel:close', 'crop-panel');
    },

    createCropBox() {
        const canvas = document.getElementById('editor-canvas');
        const box = document.createElement('div');
        box.id = 'crop-box';

        box.style.position = 'absolute';
        box.style.border = '2px solid #00e0ff';
        box.style.boxShadow = '0 0 20px rgba(0,255,255,0.4)';
        box.style.pointerEvents = 'auto';

        // Default size
        const size = 300;
        box.style.width = size + 'px';
        box.style.height = (size / this.productRatio) + 'px';

        box.style.left = (canvas.offsetWidth / 2 - size / 2) + 'px';
        box.style.top = (canvas.offsetHeight / 2 - size / 2) + 'px';

        canvas.parentElement.appendChild(box);
        this.cropBox = box;

        this.enableDragging();
        this.enableResizing();
        this.updateDPI();
    },

    removeCropBox() {
        if (this.cropBox) {
            this.cropBox.remove();
            this.cropBox = null;
        }
    },

    enableDragging() {
        let offsetX, offsetY;
        const box = this.cropBox;

        box.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('crop-handle')) return;

            offsetX = e.clientX - box.offsetLeft;
            offsetY = e.clientY - box.offsetTop;

            const move = (ev) => {
                box.style.left = (ev.clientX - offsetX) + 'px';
                box.style.top = (ev.clientY - offsetY) + 'px';
            };

            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });
    },

    enableResizing() {
        const handles = ['nw','ne','sw','se'];

        handles.forEach(pos => {
            const h = document.createElement('div');
            h.className = 'crop-handle ' + pos;
            this.cropBox.appendChild(h);

            h.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startResize(e, pos);
            });
        });
    },

    startResize(e, pos) {
        const box = this.cropBox;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = box.offsetWidth;
        const startH = box.offsetHeight;

        const move = (ev) => {
            let dx = ev.clientX - startX;
            let newW = startW + dx;
            let newH = newW / this.productRatio;

            box.style.width = newW + 'px';
            box.style.height = newH + 'px';

            this.updateDPI();
        };

        const up = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    },

    updateDPI() {
        const img = Canvas.getActiveImage();
        if (!img) return;

        const cropW = this.cropBox.offsetWidth;
        const cropH = this.cropBox.offsetHeight;

        const pxPerInchW = img.naturalWidth / (cropW / Canvas.scale);
        const pxPerInchH = img.naturalHeight / (cropH / Canvas.scale);

        const dpi = Math.min(pxPerInchW, pxPerInchH);

        EventBus.emit('crop:dpi-update', dpi);
    },

    applyCrop() {
        Canvas.cropToBox(this.cropBox);
        History.save();
        this.deactivate();
    },

    cancelCrop() {
        this.deactivate();
    }
};
