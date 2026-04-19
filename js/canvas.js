// editor/js/canvas.js
window.EditorCanvas = {
    init(editor) {
        this.editor = editor;
        this.canvas = document.getElementById('editor-canvas');
        if (!this.canvas) {
            console.warn('Canvas element #editor-canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas initialized');
    },

    loadImage(src) {
        if (!this.canvas) return;
        const img = new Image();
        img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
            console.log('Image loaded on canvas');
        };
        img.src = src;
    },

    clear() {
        if (!this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
