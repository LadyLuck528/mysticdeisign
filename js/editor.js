/* --------------------------------------------------
   product.js — Product Page Logic for Mystic POD
   - Variant switching
   - Price updates
   - Upload handling
   - DPI check
   - Mockup preview
   - Add to cart
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on, delegate } = PODApp.dom;
    const Events = PODApp.events;

    let productData = null;

    /* -------------------------
       INIT PRODUCT PAGE
    -------------------------- */

    function initProductPage() {
        const container = $("[data-product]");
        if (!container) return;

        try {
            productData = JSON.parse(container.dataset.product);
        } catch (e) {
            return PODApp.handleError(e, "Invalid product JSON");
        }

        initVariantSelector();
        initUploadButton();
        initAddToCart();
        initMockupPreview();

        if (PODApp.config.debug) {
            console.log("%cProduct Page Ready", "color:#ff7a00;font-weight:bold;");
        }
    }

    document.addEventListener("DOMContentLoaded", initProductPage);

    /* -------------------------
       VARIANT SWITCHING
    -------------------------- */

    function initVariantSelector() {
        delegate(document, "[data-variant]", "click", (e, btn) => {
            const variantId = btn.dataset.variant;

            // Update active state
            $$("[data-variant]").forEach(v => v.classList.remove("active"));
            btn.classList.add("active");

            // Update price
            const variant = productData.variants.find(v => v.id === variantId);
            if (variant) {
                $("[data-price]").textContent = `$${variant.price.toFixed(2)}`;
            }

            // Update mockup
            if (variant?.mockup) {
                updateMockup(variant.mockup);
            }
        });
    }

    /* -------------------------
       UPLOAD BUTTON
    -------------------------- */

    function initUploadButton() {
        const uploadInput = $("#uploadInput");
        const uploadBtn = $("#uploadBtn");

        if (!uploadInput || !uploadBtn) return;

        on(uploadBtn, "click", () => uploadInput.click());

        on(uploadInput, "change", async () => {
            const file = uploadInput.files[0];
            if (!file) return;

            // Basic DPI check
            const isValid = await checkDPI(file);
            if (!isValid) {
                PODApp.ui.showToast("Image resolution may be too low for printing", "warning");
            }

            // Preview
            previewUpload(file);

            // Save to session
            PODApp.storage.set("uploadedImage", {
                name: file.name,
                size: file.size,
                type: file.type
            });

            Events.emit("product:imageSelected", file);
        });
    }

    /* -------------------------
       DPI CHECK
    -------------------------- */

    async function checkDPI(file) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const dpi = img.width / 10; // rough estimate
                resolve(dpi >= 150);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    /* -------------------------
       UPLOAD PREVIEW
    -------------------------- */

    function previewUpload(file) {
        const preview = $("#uploadPreview");
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.classList.add("show");
        };
        reader.readAsDataURL(file);
    }

    /* -------------------------
       MOCKUP PREVIEW
    -------------------------- */

    function initMockupPreview() {
        const defaultMockup = productData.mockup || null;
        if (defaultMockup) updateMockup(defaultMockup);
    }

    function updateMockup(url) {
        const mockup = $("#mockupImage");
        if (mockup) mockup.src = url;
    }

    /* -------------------------
       ADD TO CART
    -------------------------- */

    function initAddToCart() {
        const btn = $("#addToCart");
        if (!btn) return;

        on(btn, "click", () => {
            const variantBtn = $("[data-variant].active");
            if (!variantBtn) {
                return PODApp.ui.showToast("Please select a variant", "warning");
            }

            const variantId = variantBtn.dataset.variant;
            const variant = productData.variants.find(v => v.id === variantId);

            const uploaded = PODApp.storage.get("uploadedImage");

            const cartItem = {
                id: crypto.randomUUID(),
                productId: productData.id,
                title: productData.title,
                variantId: variant.id,
                variantName: variant.name,
                price: variant.price,
                mockup: variant.mockup || productData.mockup,
                uploadedImage: uploaded || null,
                qty: 1
            };

            // Add to cart
            const cart = PODApp.storage.get("cart", []);
            cart.push(cartItem);
            PODApp.storage.set("cart", cart);

            PODApp.ui.showToast("Added to cart", "success");
            Events.emit("cart:updated", cart);
        });
    }

})();
/* --------------------------------------------------
   editor.js — Phase 2 (Advanced Tools)
   - Scaling handles
   - Rotation handle
   - Bounding box
   - Snapping
   - Centering tools
   - Delete layer
   - Undo / redo
   - Keyboard shortcuts
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on } = PODApp.dom;
    const Events = PODApp.events;
    const Editor = PODApp.editor;

    /* -------------------------
       UNDO / REDO STACK
    -------------------------- */

    Editor.history = [];
    Editor.future = [];

    function saveState() {
        Editor.history.push(JSON.stringify(Editor.layers));
        Editor.future = [];
    }

    Editor.undo = function () {
        if (Editor.history.length === 0) return;
        Editor.future.push(JSON.stringify(Editor.layers));
        Editor.layers = JSON.parse(Editor.history.pop());
        PODApp.editor.activeLayer = null;
        render();
    };

    Editor.redo = function () {
        if (Editor.future.length === 0) return;
        Editor.history.push(JSON.stringify(Editor.layers));
        Editor.layers = JSON.parse(Editor.future.pop());
        PODApp.editor.activeLayer = null;
        render();
    };

    /* -------------------------
       BOUNDING BOX + HANDLES
    -------------------------- */

    function drawBoundingBox(layer) {
        const ctx = Editor.ctx;

        const x = layer.x;
        const y = layer.y;
        const w = layer.w * layer.scale;
        const h = layer.h * layer.scale;

        ctx.save();
        ctx.strokeStyle = "#ffffffaa";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Handles
        const size = 12;
        const handles = [
            { x: x, y: y },                     // top-left
            { x: x + w, y: y },                 // top-right
            { x: x, y: y + h },                 // bottom-left
            { x: x + w, y: y + h }              // bottom-right
        ];

        ctx.fillStyle = "#ffffff";
        handles.forEach(h => {
            ctx.fillRect(h.x - size / 2, h.y - size / 2, size, size);
        });

        // Rotation handle
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 30, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /* -------------------------
       SCALING + ROTATION LOGIC
    -------------------------- */

    Editor.action = null; // "drag" | "scale" | "rotate"

    function detectHandle(layer, x, y) {
        const w = layer.w * layer.scale;
        const h = layer.h * layer.scale;

        const handles = [
            { name: "tl", x: layer.x, y: layer.y },
            { name: "tr", x: layer.x + w, y: layer.y },
            { name: "bl", x: layer.x, y: layer.y + h },
            { name: "br", x: layer.x + w, y: layer.y + h }
        ];

        for (let h of handles) {
            if (Math.abs(x - h.x) < 12 && Math.abs(y - h.y) < 12) {
                return { type: "scale", corner: h.name };
            }
        }

        // Rotation handle
        if (Math.abs(x - (layer.x + w / 2)) < 12 && Math.abs(y - (layer.y - 30)) < 12) {
            return { type: "rotate" };
        }

        return null;
    }

    /* -------------------------
       CENTERING TOOLS
    -------------------------- */

    Editor.centerHorizontally = function () {
        if (!Editor.activeLayer) return;
        Editor.activeLayer.x = (Editor.width - Editor.activeLayer.w * Editor.activeLayer.scale) / 2;
        saveState();
        render();
    };

    Editor.centerVertically = function () {
        if (!Editor.activeLayer) return;
        Editor.activeLayer.y = (Editor.height - Editor.activeLayer.h * Editor.activeLayer.scale) / 2;
        saveState();
        render();
    };

    /* -------------------------
       DELETE LAYER
    -------------------------- */

    Editor.deleteLayer = function () {
        if (!Editor.activeLayer) return;
        Editor.layers = Editor.layers.filter(l => l !== Editor.activeLayer);
        Editor.activeLayer = null;
        saveState();
        render();
    };

    /* -------------------------
       KEYBOARD SHORTCUTS
    -------------------------- */

    document.addEventListener("keydown", e => {
        if (e.key === "Delete") Editor.deleteLayer();
        if (e.ctrlKey && e.key === "z") Editor.undo();
        if (e.ctrlKey && e.key === "y") Editor.redo();
        if (e.ctrlKey && e.key === "ArrowLeft") Editor.centerHorizontally();
        if (e.ctrlKey && e.key === "ArrowUp") Editor.centerVertically();
    });

    /* -------------------------
       EXTEND RENDER FUNCTION
    -------------------------- */

    const originalRender = Editor.render || function () {};

    function render() {
        originalRender();

        if (Editor.activeLayer) {
            drawBoundingBox(Editor.activeLayer);
        }
    }

    Editor.render = render;

})();
