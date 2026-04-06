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
