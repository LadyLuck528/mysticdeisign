/* --------------------------------------------------
   core.js — Global Core for Mystic POD Platform
   - Namespace
   - DOM helpers
   - Event bus
   - Theme engine
   - Storage helpers
   - HTTP wrapper
   - Global UI hooks (toast, modal)
-------------------------------------------------- */

window.PODApp = window.PODApp || {};

(function () {
    "use strict";

    /* -------------------------
       NAMESPACE & CONFIG
    -------------------------- */

    const PODApp = window.PODApp;

    PODApp.config = {
        version: "1.0.0",
        env: "production", // or "dev"
        apiBase: "/api",   // adjust when backend is ready
        debug: true
    };

    /* -------------------------
       DOM HELPERS
    -------------------------- */

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const on = (el, event, handler, options) => {
        if (!el) return;
        el.addEventListener(event, handler, options || false);
    };

    const delegate = (parent, selector, event, handler) => {
        if (!parent) return;
        parent.addEventListener(event, e => {
            const target = e.target.closest(selector);
            if (target && parent.contains(target)) {
                handler(e, target);
            }
        });
    };

    PODApp.dom = { $, $$, on, delegate };

    /* -------------------------
       EVENT BUS
    -------------------------- */

    const EventBus = (() => {
        const events = {};

        return {
            on(event, handler) {
                if (!events[event]) events[event] = [];
                events[event].push(handler);
            },
            off(event, handler) {
                if (!events[event]) return;
                events[event] = events[event].filter(h => h !== handler);
            },
            emit(event, data) {
                if (!events[event]) return;
                events[event].forEach(h => {
                    try {
                        h(data);
                    } catch (err) {
                        console.error("Event handler error:", err);
                    }
                });
            }
        };
    })();

    PODApp.events = EventBus;

    /* -------------------------
       STORAGE HELPERS
    -------------------------- */

    const Storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("Storage set failed:", e);
            }
        },
        get(key, fallback = null) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return fallback;
                return JSON.parse(raw);
            } catch (e) {
                console.warn("Storage get failed:", e);
                return fallback;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn("Storage remove failed:", e);
            }
        }
    };

    PODApp.storage = Storage;

    /* -------------------------
       HTTP WRAPPER
    -------------------------- */

    const Http = {
        async get(url, options = {}) {
            const res = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json", ...(options.headers || {}) },
                ...options
            });
            return handleResponse(res);
        },
        async post(url, body = {}, options = {}) {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(options.headers || {}) },
                body: JSON.stringify(body),
                ...options
            });
            return handleResponse(res);
        }
    };

    async function handleResponse(res) {
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            // non-JSON or empty
        }

        if (!res.ok) {
            const error = new Error(data?.message || "Request failed");
            error.status = res.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    PODApp.http = Http;

    /* -------------------------
       THEME ENGINE
    -------------------------- */

    const THEME_KEY = "pod_theme";

    function applyTheme(themeName) {
        const root = document.documentElement;
        root.classList.remove("theme-light", "theme-dark", "theme-mystic");
        if (themeName) {
            root.classList.add(themeName);
        }
        Storage.set(THEME_KEY, themeName);
        EventBus.emit("theme:changed", themeName);
    }

    function initTheme() {
        const saved = Storage.get(THEME_KEY, null);
        if (saved) {
            applyTheme(saved);
            return;
        }

        // Fallback: respect system preference
        const prefersDark = window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        applyTheme(prefersDark ? "theme-dark" : "theme-light");
    }

    function toggleTheme() {
        const root = document.documentElement;
        if (root.classList.contains("theme-dark")) {
            applyTheme("theme-light");
        } else {
            applyTheme("theme-dark");
        }
    }

    PODApp.theme = { applyTheme, initTheme, toggleTheme };

    /* -------------------------
       GLOBAL UI HOOKS
       (toasts, modals, loaders)
    -------------------------- */

    function showToast(message, type = "info") {
        // Emit event so ui.js can render actual toast
        EventBus.emit("ui:toast", { message, type });
        if (PODApp.config.debug) {
            console.log("[TOAST]", type.toUpperCase(), message);
        }
    }

    function showModal(id, payload = {}) {
        EventBus.emit("ui:modal:open", { id, payload });
    }

    function hideModal(id) {
        EventBus.emit("ui:modal:close", { id });
    }

    function showLoader(id = "global") {
        EventBus.emit("ui:loader:show", { id });
    }

    function hideLoader(id = "global") {
        EventBus.emit("ui:loader:hide", { id });
    }

    PODApp.ui = {
        showToast,
        showModal,
        hideModal,
        showLoader,
        hideLoader
    };

    /* -------------------------
       GLOBAL ERROR HANDLER
    -------------------------- */

    function handleError(err, context = "") {
        console.error("PODApp Error:", context, err);

        const message =
            err?.message ||
            "Something went wrong in the mystical realm. Please try again.";

        showToast(message, "error");
        EventBus.emit("error", { error: err, context });
    }

    PODApp.handleError = handleError;

    /* -------------------------
       INIT
    -------------------------- */

    function initCore() {
        initTheme();
        EventBus.emit("core:ready");
        if (PODApp.config.debug) {
            console.log("%cPODApp Core Ready", "color:#b44cff;font-weight:bold;");
        }
    }

    PODApp.initCore = initCore;

    // Auto-init on DOM ready
    document.addEventListener("DOMContentLoaded", initCore);
})();
