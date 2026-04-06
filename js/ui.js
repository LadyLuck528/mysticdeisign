/* --------------------------------------------------
   ui.js — UI Layer for Mystic POD Platform
   - Toasts
   - Modals
   - Loaders
   - Tabs
   - Accordions
   - Theme toggle
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on, delegate } = PODApp.dom;
    const Events = PODApp.events;

    /* -------------------------
       TOAST SYSTEM
    -------------------------- */

    let toastContainer = null;

    function initToasts() {
        toastContainer = document.createElement("div");
        toastContainer.className = "toast-container";
        document.body.appendChild(toastContainer);

        Events.on("ui:toast", ({ message, type }) => {
            createToast(message, type);
        });
    }

    function createToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <div class="toast-close">&times;</div>
        `;

        toastContainer.appendChild(toast);

        // Close button
        on(toast.querySelector(".toast-close"), "click", () => {
            toast.remove();
        });

        // Auto-remove
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /* -------------------------
       MODAL SYSTEM
    -------------------------- */

    function initModals() {
        Events.on("ui:modal:open", ({ id, payload }) => openModal(id, payload));
        Events.on("ui:modal:close", ({ id }) => closeModal(id));

        // Close on overlay click
        delegate(document, ".modal", "click", (e, modal) => {
            if (e.target.classList.contains("modal")) {
                closeModal(modal.id);
            }
        });

        // Close on [data-close]
        delegate(document, "[data-close]", "click", (e, btn) => {
            const modal = btn.closest(".modal");
            if (modal) closeModal(modal.id);
        });
    }

    function openModal(id, payload = {}) {
        const modal = $(`#${id}`);
        if (!modal) return;

        modal.classList.add("show");
        modal.dataset.payload = JSON.stringify(payload);
    }

    function closeModal(id) {
        const modal = $(`#${id}`);
        if (!modal) return;

        modal.classList.remove("show");
        delete modal.dataset.payload;
    }

    /* -------------------------
       LOADER SYSTEM
    -------------------------- */

    const loaders = {};

    function initLoaders() {
        Events.on("ui:loader:show", ({ id }) => showLoader(id));
        Events.on("ui:loader:hide", ({ id }) => hideLoader(id));
    }

    function showLoader(id = "global") {
        if (!loaders[id]) {
            const loader = document.createElement("div");
            loader.className = "page-loader active";
            loader.innerHTML = `<div class="spinner-lg"></div>`;
            document.body.appendChild(loader);
            loaders[id] = loader;
        }
        loaders[id].classList.add("active");
    }

    function hideLoader(id = "global") {
        if (loaders[id]) {
            loaders[id].classList.remove("active");
        }
    }

    /* -------------------------
       TABS
    -------------------------- */

    function initTabs() {
        delegate(document, "[data-tab]", "click", (e, tab) => {
            const group = tab.dataset.group;
            const target = tab.dataset.tab;

            // Deactivate all tabs in group
            $$(`[data-tab][data-group="${group}"]`).forEach(t =>
                t.classList.remove("active")
            );

            // Activate clicked tab
            tab.classList.add("active");

            // Hide all panels
            $$(`[data-panel][data-group="${group}"]`).forEach(panel =>
                panel.classList.remove("active")
            );

            // Show target panel
            $(`[data-panel="${target}"][data-group="${group}"]`)?.classList.add("active");
        });
    }

    /* -------------------------
       ACCORDIONS
    -------------------------- */

    function initAccordions() {
        delegate(document, ".accordion-header", "click", (e, header) => {
            const item = header.closest(".accordion-item");
            item.classList.toggle("open");
        });
    }

    /* -------------------------
       THEME TOGGLE BUTTON
    -------------------------- */

    function initThemeToggle() {
        delegate(document, "[data-theme-toggle]", "click", () => {
            PODApp.theme.toggleTheme();
        });
    }

    /* -------------------------
       INIT UI
    -------------------------- */

    function initUI() {
        initToasts();
        initModals();
        initLoaders();
        initTabs();
        initAccordions();
        initThemeToggle();

        Events.emit("ui:ready");

        if (PODApp.config.debug) {
            console.log("%cUI Ready", "color:#7a3cff;font-weight:bold;");
        }
    }

    document.addEventListener("DOMContentLoaded", initUI);
})();
