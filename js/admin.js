/* --------------------------------------------------
   admin.js — Mystic POD Admin Engine
   - Add/edit products
   - Upload mockups
   - Set print areas
   - Manage variants
   - Save product data
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on } = PODApp.dom;
    const Events = PODApp.events;

    /* -------------------------
       ADMIN STATE
    -------------------------- */

    const Admin = {
        product: {
            id: null,
            title: "",
            description: "",
            basePrice: 0,
            mockup: "",
            printArea: { x: 0, y: 0, w: 0, h: 0 },
            variants: []
        }
    };

    PODApp.admin = Admin;

    /* -------------------------
       INIT ADMIN PAGE
    -------------------------- */

    function initAdmin() {
        const container = $("#adminPage");
        if (!container) return;

        initMockupUpload();
        initPrintAreaControls();
        initVariantControls();
        initSaveButton();

        if (PODApp.config.debug) {
            console.log("%cAdmin Ready", "color:#ff44aa;font-weight:bold;");
        }
    }

    document.addEventListener("DOMContentLoaded", initAdmin);

    /* -------------------------
       MOCKUP UPLOAD
    -------------------------- */

    function initMockupUpload() {
        const input = $("#mockupUpload");
        const btn = $("#mockupUploadBtn");
        const preview = $("#mockupPreview");

        if (!input || !btn || !preview) return;

        on(btn, "click", () => input.click());

        on(input, "change", () => {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                Admin.product.mockup = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /* -------------------------
       PRINT AREA CONTROLS
    -------------------------- */

    function initPrintAreaControls() {
        const x = $("#paX");
        const y = $("#paY");
        const w = $("#paW");
        const h = $("#paH");

        if (!x || !y || !w || !h) return;

        const update = () => {
            Admin.product.printArea = {
                x: parseInt(x.value) || 0,
                y: parseInt(y.value) || 0,
                w: parseInt(w.value) || 0,
                h: parseInt(h.value) || 0
            };
        };

        on(x, "input", update);
        on(y, "input", update);
        on(w, "input", update);
        on(h, "input", update);
    }

    /* -------------------------
       VARIANT CONTROLS
    -------------------------- */

    function initVariantControls() {
        const addBtn = $("#addVariantBtn");
        const list = $("#variantList");

        if (!addBtn || !list) return;

        on(addBtn, "click", () => {
            const id = crypto.randomUUID();
            const variant = {
                id,
                name: "New Variant",
                price: 0,
                mockup: ""
            };

            Admin.product.variants.push(variant);
            renderVariants();
        });

        list.addEventListener("input", e => {
            const row = e.target.closest(".variant-row");
            if (!row) return;

            const id = row.dataset.id;
            const variant = Admin.product.variants.find(v => v.id === id);
            if (!variant) return;

            variant.name = row.querySelector(".v-name").value;
            variant.price = parseFloat(row.querySelector(".v-price").value) || 0;
            variant.mockup = row.querySelector(".v-mockup").value;
        });

        list.addEventListener("click", e => {
            const btn = e.target.closest("[data-remove]");
            if (!btn) return;

            const row = btn.closest(".variant-row");
            const id = row.dataset.id;

            Admin.product.variants = Admin.product.variants.filter(v => v.id !== id);
            renderVariants();
        });
    }

    function renderVariants() {
        const list = $("#variantList");
        if (!list) return;

        list.innerHTML = Admin.product.variants
            .map(v => {
                return `
                <div class="variant-row" data-id="${v.id}">
                    <input class="v-name" value="${v.name}" placeholder="Variant name" />
                    <input class="v-price" type="number" value="${v.price}" placeholder="Price" />
                    <input class="v-mockup" value="${v.mockup}" placeholder="Mockup URL" />
                    <button class="btn btn-danger" data-remove>&times;</button>
                </div>
            `;
            })
            .join("");
    }

    /* -------------------------
       SAVE PRODUCT
    -------------------------- */

    function initSaveButton() {
        const btn = $("#saveProductBtn");
        if (!btn) return;

        on(btn, "click", () => {
            Admin.product.title = $("#prodTitle").value.trim();
            Admin.product.description = $("#prodDesc").value.trim();
            Admin.product.basePrice = parseFloat($("#prodBasePrice").value) || 0;

            if (!Admin.product.title) {
                PODApp.ui.showToast("Product title is required", "warning");
                return;
            }

            PODApp.ui.showLoader("admin");

            // Simulate save
            setTimeout(() => {
                PODApp.ui.hideLoader("admin");
                PODApp.ui.showToast("Product saved!", "success");

                console.log("Saved product:", Admin.product);
            }, 1000);
        });
    }

})();
