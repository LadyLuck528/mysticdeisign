/* ---------------------------------------------------------
   SECTION 1 — CORE DOM HELPERS + QUERY SHORTCUTS
   Clean, safe, reusable utilities for Mystic Design
--------------------------------------------------------- */

/* Short query selector */
const $ = (selector, scope = document) => scope.querySelector(selector);

/* Query all */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* Create element */
const createEl = (tag, className = "") => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
};

/* Add event listener (safe) */
const on = (el, event, handler) => {
    if (!el) return;
    el.addEventListener(event, handler);
};

/* Toggle class */
const toggleClass = (el, className) => {
    if (!el) return;
    el.classList.toggle(className);
};

/* Add class */
const addClass = (el, className) => {
    if (!el) return;
    el.classList.add(className);
};

/* Remove class */
const removeClass = (el, className) => {
    if (!el) return;
    el.classList.remove(className);
};

/* Check if element exists */
const exists = (selector) => document.querySelector(selector) !== null;

/* Safe text setter */
const setText = (el, text) => {
    if (!el) return;
    el.textContent = text;
};

/* Safe HTML setter */
const setHTML = (el, html) => {
    if (!el) return;
    el.innerHTML = html;
};

/* Delay helper */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ---------------------------------------------------------
   SECTION 2 — GLOBAL STATE + CONFIG
   Centralized platform settings for Mystic Design
--------------------------------------------------------- */

/* Global state object */
const MD = {
    theme: "dark",          // "dark" | "light" | future themes
    user: null,             // populated after login
    env: "production",      // "development" | "production"
    debug: false,           // enable console logs for dev
    flags: {},              // feature flags
    cache: {},              // lightweight in-memory cache
    version: "1.0.0",       // platform version
};

/* Toggle theme */
const setTheme = (theme) => {
    MD.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
};

/* Set user session */
const setUser = (userData) => {
    MD.user = userData;
};

/* Enable/disable debug mode */
const setDebug = (state) => {
    MD.debug = state;
    if (state) console.log("%cDebug mode enabled", "color:#d7b3ff");
};

/* Feature flag setter */
const setFlag = (key, value) => {
    MD.flags[key] = value;
};

/* Cache setter */
const setCache = (key, value) => {
    MD.cache[key] = value;
};

/* Cache getter */
const getCache = (key) => MD.cache[key];

/* Safe debug logger */
const log = (...args) => {
    if (MD.debug) console.log("[MD]", ...args);
};
/* ---------------------------------------------------------
   SECTION 3 — EVENT BUS (GLOBAL PUB/SUB SYSTEM)
   Decoupled communication layer for Mystic Design
--------------------------------------------------------- */

const EventBus = {
    events: {},

    /* Subscribe to an event */
    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    },

    /* Unsubscribe */
    off(event, handler) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    },

    /* Emit event */
    emit(event, data = null) {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(data));
    }
};

/* Debug helper */
if (MD.debug) {
    console.log("%cEventBus ready", "color:#d7b3ff");
}
/* ---------------------------------------------------------
   SECTION 4 — STORAGE ENGINE (LOCAL + SESSION WRAPPERS)
   Safe, unified storage helpers for Mystic Design
--------------------------------------------------------- */

const Storage = {
    /* Save to localStorage */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            log("Storage.set error:", err);
        }
    },

    /* Read from localStorage */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            log("Storage.get error:", err);
            return null;
        }
    },

    /* Remove from localStorage */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            log("Storage.remove error:", err);
        }
    },

    /* Clear all localStorage */
    clear() {
        try {
            localStorage.clear();
        } catch (err) {
            log("Storage.clear error:", err);
        }
    }
};

const Session = {
    /* Save to sessionStorage */
    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            log("Session.set error:", err);
        }
    },

    /* Read from sessionStorage */
    get(key) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            log("Session.get error:", err);
            return null;
        }
    },

    /* Remove from sessionStorage */
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (err) {
            log("Session.remove error:", err);
        }
    },

    /* Clear all sessionStorage */
    clear() {
        try {
            sessionStorage.clear();
        } catch (err) {
            log("Session.clear error:", err);
        }
    }
};
/* ---------------------------------------------------------
   SECTION 5 — TOAST NOTIFICATION ENGINE
   Lightweight, animated toast system for Mystic Design
--------------------------------------------------------- */

const Toast = {
    container: null,

    /* Initialize container */
    init() {
        this.container = document.createElement("div");
        this.container.className = "toast-container";
        document.body.appendChild(this.container);
    },

    /* Create toast */
    show(message, type = "info", duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement("div");
        toast.className = `toast toast-${type} fade-in`;

        const text = document.createElement("span");
        text.className = "toast-message";
        text.textContent = message;

        toast.appendChild(text);
        this.container.appendChild(toast);

        /* Auto-remove */
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    /* Quick helpers */
    success(msg, duration) { this.show(msg, "success", duration); },
    error(msg, duration) { this.show(msg, "error", duration); },
    warning(msg, duration) { this.show(msg, "warning", duration); },
    info(msg, duration) { this.show(msg, "info", duration); }
};

/* Debug */
if (MD.debug) log("Toast engine ready");
/* ---------------------------------------------------------
   SECTION 6 — MODAL ENGINE (OPEN/CLOSE/OVERLAY)
   Universal modal system for Mystic Design
--------------------------------------------------------- */

const Modal = {
    activeModal: null,

    /* Open modal by ID */
    open(id) {
        const modal = document.getElementById(id);
        if (!modal) return;

        this.activeModal = modal;

        modal.classList.add("modal-open");
        modal.classList.remove("modal-closed");

        /* Show overlay */
        const overlay = $(".modal-overlay");
        if (overlay) overlay.classList.add("visible");

        EventBus.emit("modal:open", id);
    },

    /* Close modal */
    close() {
        if (!this.activeModal) return;

        this.activeModal.classList.remove("modal-open");
        this.activeModal.classList.add("modal-closed");

        /* Hide overlay */
        const overlay = $(".modal-overlay");
        if (overlay) overlay.classList.remove("visible");

        EventBus.emit("modal:close", this.activeModal.id);

        this.activeModal = null;
    },

    /* Toggle modal */
    toggle(id) {
        if (this.activeModal && this.activeModal.id === id) {
            this.close();
        } else {
            this.open(id);
        }
    },

    /* Bind all [data-modal-open] and [data-modal-close] buttons */
    bindTriggers() {
        $$("[data-modal-open]").forEach(btn => {
            on(btn, "click", () => {
                const id = btn.getAttribute("data-modal-open");
                this.open(id);
            });
        });

        $$("[data-modal-close]").forEach(btn => {
            on(btn, "click", () => this.close());
        });

        /* Close when clicking overlay */
        const overlay = $(".modal-overlay");
        if (overlay) {
            on(overlay, "click", () => this.close());
        }
    }
};

/* Auto-bind triggers on load */
document.addEventListener("DOMContentLoaded", () => {
    Modal.bindTriggers();
    log("Modal engine ready");
});

/* ---------------------------------------------------------
   SECTION 7 — DROPDOWN ENGINE (CLICK + AUTO-CLOSE)
   Universal dropdown logic for Mystic Design
--------------------------------------------------------- */

const Dropdown = {
    active: null,

    /* Open dropdown */
    open(el) {
        if (this.active && this.active !== el) {
            this.close(this.active);
        }

        el.classList.add("dropdown-open");
        this.active = el;

        EventBus.emit("dropdown:open", el);
    },

    /* Close dropdown */
    close(el) {
        if (!el) return;

        el.classList.remove("dropdown-open");

        if (this.active === el) {
            this.active = null;
        }

        EventBus.emit("dropdown:close", el);
    },

    /* Toggle dropdown */
    toggle(el) {
        if (el.classList.contains("dropdown-open")) {
            this.close(el);
        } else {
            this.open(el);
        }
    },

    /* Close when clicking outside */
    bindOutsideClick() {
        document.addEventListener("click", (e) => {
            if (!this.active) return;

            if (!this.active.contains(e.target)) {
                this.close(this.active);
            }
        });
    },

    /* Bind triggers */
    bindTriggers() {
        $$("[data-dropdown]").forEach(trigger => {
            const target = $("#" + trigger.getAttribute("data-dropdown"));

            if (!target) return;

            on(trigger, "click", (e) => {
                e.stopPropagation();
                this.toggle(target);
            });
        });
    }
};

/* Initialize dropdown system */
document.addEventListener("DOMContentLoaded", () => {
    Dropdown.bindTriggers();
    Dropdown.bindOutsideClick();
    log("Dropdown engine ready");
});
/* ---------------------------------------------------------
   SECTION 9 — TABS ENGINE (SWITCH PANELS)
   Universal tab switching system for Mystic Design
--------------------------------------------------------- */

const Tabs = {
    init() {
        $$("[data-tabs]").forEach(tabGroup => {
            const buttons = tabGroup.querySelectorAll("[data-tab]");
            const panels = tabGroup.querySelectorAll("[data-tab-panel]");

            buttons.forEach(btn => {
                on(btn, "click", () => {
                    const target = btn.getAttribute("data-tab");

                    /* Deactivate all buttons */
                    buttons.forEach(b => b.classList.remove("active"));

                    /* Activate clicked button */
                    btn.classList.add("active");

                    /* Hide all panels */
                    panels.forEach(panel => {
                        panel.classList.remove("active");
                        panel.style.display = "none";
                    });

                    /* Show target panel */
                    const activePanel = tabGroup.querySelector(`[data-tab-panel="${target}"]`);
                    if (activePanel) {
                        activePanel.classList.add("active");
                        activePanel.style.display = "block";
                    }

                    EventBus.emit("tabs:change", { group: tabGroup, tab: target });
                });
            });
        });
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Tabs.init();
    log("Tabs engine ready");
});
/* ---------------------------------------------------------
   SECTION 10 — LOADING SPINNER ENGINE
   Global loader overlay for Mystic Design
--------------------------------------------------------- */

const Loader = {
    el: null,

    /* Create loader element */
    init() {
        this.el = document.createElement("div");
        this.el.className = "global-loader hidden";

        this.el.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">Loading...</div>
        `;

        document.body.appendChild(this.el);
    },

    /* Show loader */
    show(text = "Loading...") {
        if (!this.el) this.init();

        const label = this.el.querySelector(".loader-text");
        if (label) label.textContent = text;

        this.el.classList.remove("hidden");
        this.el.classList.add("visible");

        EventBus.emit("loader:show", text);
    },

    /* Hide loader */
    hide() {
        if (!this.el) return;

        this.el.classList.remove("visible");
        this.el.classList.add("hidden");

        EventBus.emit("loader:hide");
    },

    /* Wrap async functions */
    async wrap(promise, text = "Loading...") {
        this.show(text);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide();
        }
    }
};

/* Debug */
if (MD.debug) log("Loader engine ready");
/* ---------------------------------------------------------
   SECTION 11 — FORM VALIDATION ENGINE
   Universal form validation for Mystic Design
--------------------------------------------------------- */

const Validator = {
    /* Validate required fields */
    required(el) {
        return el.value.trim().length > 0;
    },

    /* Validate email format */
    email(el) {
        const value = el.value.trim();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value);
    },

    /* Validate min length */
    minLength(el, length) {
        return el.value.trim().length >= length;
    },

    /* Validate max length */
    maxLength(el, length) {
        return el.value.trim().length <= length;
    },

    /* Show error message */
    showError(el, message) {
        let error = el.parentElement.querySelector(".form-error");

        if (!error) {
            error = document.createElement("div");
            error.className = "form-error";
            el.parentElement.appendChild(error);
        }

        error.textContent = message;
        el.classList.add("input-error");
    },

    /* Clear error message */
    clearError(el) {
        const error = el.parentElement.querySelector(".form-error");
        if (error) error.remove();
        el.classList.remove("input-error");
    },

    /* Validate form based on data attributes */
    validateForm(form) {
        let valid = true;

        $$("[data-validate]", form).forEach(el => {
            const rules = el.getAttribute("data-validate").split("|");

            this.clearError(el);

            for (const rule of rules) {
                if (rule === "required" && !this.required(el)) {
                    this.showError(el, "This field is required");
                    valid = false;
                    break;
                }

                if (rule === "email" && !this.email(el)) {
                    this.showError(el, "Enter a valid email");
                    valid = false;
                    break;
                }

                if (rule.startsWith("min:")) {
                    const len = parseInt(rule.split(":")[1]);
                    if (!this.minLength(el, len)) {
                        this.showError(el, `Minimum ${len} characters`);
                        valid = false;
                        break;
                    }
                }

                if (rule.startsWith("max:")) {
                    const len = parseInt(rule.split(":")[1]);
                    if (!this.maxLength(el, len)) {
                        this.showError(el, `Maximum ${len} characters`);
                        valid = false;
                        break;
                    }
                }
            }
        });

        return valid;
    },

    /* Bind all forms with data-validate-form */
    bindForms() {
        $$("form[data-validate-form]").forEach(form => {
            on(form, "submit", (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    EventBus.emit("form:invalid", form);
                    Toast.error("Please fix the errors above");
                } else {
                    EventBus.emit("form:valid", form);
                }
            });
        });
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Validator.bindForms();
    log("Form validation engine ready");
});
/* ---------------------------------------------------------
   SECTION 12 — IMAGE UPLOADER ENGINE
   Image preview + validation for Mystic Design
--------------------------------------------------------- */

const ImageUploader = {
    /* Initialize all uploaders */
    init() {
        $$("[data-image-upload]").forEach(wrapper => {
            const input = wrapper.querySelector("input[type='file']");
            const preview = wrapper.querySelector("[data-image-preview]");
            const maxSize = parseInt(wrapper.getAttribute("data-max-size")) || 5; // MB
            const allowed = (wrapper.getAttribute("data-allowed") || "jpg,png,jpeg,webp").split(",");

            if (!input) return;

            on(input, "change", () => {
                const file = input.files[0];
                if (!file) return;

                /* Validate type */
                const ext = file.name.split(".").pop().toLowerCase();
                if (!allowed.includes(ext)) {
                    Toast.error(`Invalid file type: .${ext}`);
                    input.value = "";
                    return;
                }

                /* Validate size */
                const sizeMB = file.size / (1024 * 1024);
                if (sizeMB > maxSize) {
                    Toast.error(`File too large. Max ${maxSize}MB`);
                    input.value = "";
                    return;
                }

                /* Preview */
                if (preview) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.classList.add("visible");
                    };
                    reader.readAsDataURL(file);
                }

                EventBus.emit("image:uploaded", { file, wrapper });
            });
        });
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ImageUploader.init();
    log("Image uploader engine ready");
});
/* ---------------------------------------------------------
   SECTION 13 — SCROLL & VIEWPORT ENGINE
   Sticky headers, reveal animations, viewport detection
--------------------------------------------------------- */

const ScrollEngine = {
    listeners: [],

    /* Add scroll listener */
    onScroll(handler) {
        this.listeners.push(handler);
    },

    /* Check if element is in viewport */
    inView(el, offset = 0) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= 0
        );
    },

    /* Reveal-on-scroll animations */
    initReveal() {
        const revealEls = $$("[data-reveal]");

        const checkReveal = () => {
            revealEls.forEach(el => {
                if (!el.classList.contains("revealed") && this.inView(el, 100)) {
                    el.classList.add("revealed");
                    EventBus.emit("reveal:enter", el);
                }
            });
        };

        this.onScroll(checkReveal);
        checkReveal();
    },

    /* Sticky header logic */
    initSticky() {
        const sticky = $("[data-sticky]");
        if (!sticky) return;

        const originalOffset = sticky.offsetTop;

        const checkSticky = () => {
            if (window.scrollY > originalOffset) {
                sticky.classList.add("is-sticky");
                EventBus.emit("sticky:on", sticky);
            } else {
                sticky.classList.remove("is-sticky");
                EventBus.emit("sticky:off", sticky);
            }
        };

        this.onScroll(checkSticky);
        checkSticky();
    },

    /* Back-to-top button */
    initBackToTop() {
        const btn = $("[data-back-to-top]");
        if (!btn) return;

        on(btn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

        const checkBtn = () => {
            if (window.scrollY > 300) {
                btn.classList.add("visible");
            } else {
                btn.classList.remove("visible");
            }
        };

        this.onScroll(checkBtn);
        checkBtn();
    },

    /* Master scroll handler */
    init() {
        window.addEventListener("scroll", () => {
            this.listeners.forEach(fn => fn());
        });

        this.initReveal();
        this.initSticky();
        this.initBackToTop();

        log("Scroll engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ScrollEngine.init();
});
/* ---------------------------------------------------------
   SECTION 14 — KEYBOARD SHORTCUT ENGINE
   Global hotkeys for Mystic Design
--------------------------------------------------------- */

const Hotkeys = {
    bindings: {},

    /* Register a hotkey */
    register(combo, handler) {
        this.bindings[combo.toLowerCase()] = handler;
    },

    /* Parse key event into combo string */
    getCombo(e) {
        let combo = [];

        if (e.ctrlKey || e.metaKey) combo.push("ctrl");
        if (e.shiftKey) combo.push("shift");
        if (e.altKey) combo.push("alt");

        combo.push(e.key.toLowerCase());

        return combo.join("+");
    },

    /* Initialize global listener */
    init() {
        document.addEventListener("keydown", (e) => {
            const combo = this.getCombo(e);

            if (this.bindings[combo]) {
                e.preventDefault();
                this.bindings[combo](e);
                EventBus.emit("hotkey:trigger", combo);
            }

            /* Built-in: ESC closes modals */
            if (e.key === "Escape") {
                Modal.close();
                EventBus.emit("hotkey:escape");
            }
        });

        log("Hotkey engine ready");
    }
};

/* Default hotkeys */
document.addEventListener("DOMContentLoaded", () => {
    Hotkeys.init();

    /* CTRL+S — Save */
    Hotkeys.register("ctrl+s", () => {
        EventBus.emit("save:trigger");
        Toast.info("Save triggered");
    });

    /* CTRL+P — Print */
    Hotkeys.register("ctrl+p", () => {
        EventBus.emit("print:trigger");
        window.print();
    });

    /* CTRL+K — Open command palette (future feature) */
    Hotkeys.register("ctrl+k", () => {
        EventBus.emit("command:palette");
        Toast.info("Command palette coming soon");
    });
});
/* ---------------------------------------------------------
   SECTION 15 — CLIPBOARD ENGINE
   Copy-to-clipboard system for Mystic Design
--------------------------------------------------------- */

const Clipboard = {
    /* Copy text to clipboard */
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            Toast.success("Copied to clipboard");
            EventBus.emit("clipboard:copy", text);
        } catch (err) {
            Toast.error("Unable to copy");
            log("Clipboard error:", err);
        }
    },

    /* Bind all [data-copy] buttons */
    bindButtons() {
        $$("[data-copy]").forEach(btn => {
            on(btn, "click", () => {
                const text = btn.getAttribute("data-copy");
                if (text) this.copy(text);
            });
        });
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Clipboard.bindButtons();
    log("Clipboard engine ready");
});
/* ---------------------------------------------------------
   SECTION 16 — TOOLTIP ENGINE
   Hover tooltips with delay + smart positioning
--------------------------------------------------------- */

const Tooltip = {
    el: null,
    delayTimer: null,

    /* Create tooltip element */
    init() {
        this.el = document.createElement("div");
        this.el.className = "md-tooltip hidden";
        document.body.appendChild(this.el);

        this.bindTriggers();
        log("Tooltip engine ready");
    },

    /* Bind all tooltip triggers */
    bindTriggers() {
        $$("[data-tooltip]").forEach(el => {
            on(el, "mouseenter", (e) => this.showDelayed(e, el));
            on(el, "mouseleave", () => this.hide());
            on(el, "mousemove", (e) => this.move(e));
        });
    },

    /* Show tooltip after delay */
    showDelayed(e, el) {
        clearTimeout(this.delayTimer);

        this.delayTimer = setTimeout(() => {
            const text = el.getAttribute("data-tooltip");
            if (!text) return;

            this.el.textContent = text;
            this.el.classList.remove("hidden");
            this.move(e);

            EventBus.emit("tooltip:show", text);
        }, 300);
    },

    /* Move tooltip with cursor */
    move(e) {
        if (!this.el || this.el.classList.contains("hidden")) return;

        const offset = 15;
        this.el.style.left = e.pageX + offset + "px";
        this.el.style.top = e.pageY + offset + "px";
    },

    /* Hide tooltip */
    hide() {
        clearTimeout(this.delayTimer);
        if (!this.el) return;

        this.el.classList.add("hidden");
        EventBus.emit("tooltip:hide");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Tooltip.init();
});
/* ---------------------------------------------------------
   SECTION 17 — CAROUSEL / SLIDER ENGINE
   Touch + drag + auto-slide carousel for Mystic Design
--------------------------------------------------------- */

const Carousel = {
    instances: [],

    init() {
        $$("[data-carousel]").forEach(carousel => {
            const track = carousel.querySelector(".carousel-track");
            const slides = carousel.querySelectorAll(".carousel-slide");
            const nextBtn = carousel.querySelector("[data-carousel-next]");
            const prevBtn = carousel.querySelector("[data-carousel-prev]");
            const auto = parseInt(carousel.getAttribute("data-auto")) || 0;

            if (!track || slides.length === 0) return;

            let index = 0;
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let autoTimer = null;

            const update = () => {
                track.style.transform = `translateX(-${index * 100}%)`;
                EventBus.emit("carousel:change", { carousel, index });
            };

            const next = () => {
                index = (index + 1) % slides.length;
                update();
            };

            const prev = () => {
                index = (index - 1 + slides.length) % slides.length;
                update();
            };

            /* Auto-slide */
            if (auto > 0) {
                autoTimer = setInterval(next, auto);
            }

            /* Buttons */
            if (nextBtn) on(nextBtn, "click", next);
            if (prevBtn) on(prevBtn, "click", prev);

            /* Drag / touch support */
            const startDrag = (x) => {
                isDragging = true;
                startX = x;
                currentX = x;
                track.classList.add("dragging");
            };

            const moveDrag = (x) => {
                if (!isDragging) return;
                currentX = x;
                const diff = currentX - startX;
                track.style.transform = `translateX(calc(-${index * 100}% + ${diff}px))`;
            };

            const endDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                track.classList.remove("dragging");

                const diff = currentX - startX;

                if (diff > 50) prev();
                else if (diff < -50) next();
                else update();
            };

            /* Mouse events */
            on(track, "mousedown", (e) => startDrag(e.pageX));
            on(window, "mousemove", (e) => moveDrag(e.pageX));
            on(window, "mouseup", endDrag);

            /* Touch events */
            on(track, "touchstart", (e) => startDrag(e.touches[0].pageX));
            on(track, "touchmove", (e) => moveDrag(e.touches[0].pageX));
            on(track, "touchend", endDrag);

            update();

            this.instances.push({ carousel, next, prev, update });
        });

        log("Carousel engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Carousel.init();
});
/* ---------------------------------------------------------
   SECTION 18 — DARK MODE ENGINE
   Theme toggle + persistent storage for Mystic Design
--------------------------------------------------------- */

const Theme = {
    key: "md-theme",

    /* Load saved theme or detect system preference */
    init() {
        let saved = Storage.get(this.key);

        if (!saved) {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            saved = prefersDark ? "dark" : "light";
            Storage.set(this.key, saved);
        }

        this.apply(saved);
        this.bindToggle();

        log("Theme engine ready");
    },

    /* Apply theme to document */
    apply(mode) {
        document.documentElement.setAttribute("data-theme", mode);
        Storage.set(this.key, mode);
        EventBus.emit("theme:change", mode);
    },

    /* Toggle between light/dark */
    toggle() {
        const current = Storage.get(this.key) || "light";
        const next = current === "light" ? "dark" : "light";
        this.apply(next);
    },

    /* Bind any element with [data-theme-toggle] */
    bindToggle() {
        $$("[data-theme-toggle]").forEach(btn => {
            on(btn, "click", () => this.toggle());
        });
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Theme.init();
});
/* ---------------------------------------------------------
   SECTION 19 — NETWORK ENGINE
   Fetch wrapper + error handling + loader integration
--------------------------------------------------------- */

const Network = {
    async request(url, options = {}, showLoader = true) {
        try {
            if (showLoader) Loader.show("Loading...");

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            });

            const contentType = response.headers.get("content-type");
            let data = null;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMsg = data?.message || "Network error";
                Toast.error(errorMsg);
                EventBus.emit("network:error", { url, error: errorMsg });
                throw new Error(errorMsg);
            }

            EventBus.emit("network:success", { url, data });
            return data;

        } catch (err) {
            log("Network error:", err);
            throw err;

        } finally {
            if (showLoader) Loader.hide();
        }
    },

    /* GET request */
    get(url, showLoader = true) {
        return this.request(url, { method: "GET" }, showLoader);
    },

    /* POST request */
    post(url, body = {}, showLoader = true) {
        return this.request(
            url,
            {
                method: "POST",
                body: JSON.stringify(body)
            },
            showLoader
        );
    },

    /* PUT request */
    put(url, body = {}, showLoader = true) {
        return this.request(
            url,
            {
                method: "PUT",
                body: JSON.stringify(body)
            },
            showLoader
        );
    },

    /* DELETE request */
    delete(url, showLoader = true) {
        return this.request(url, { method: "DELETE" }, showLoader);
    }
};

/* Debug */
if (MD.debug) log("Network engine ready");
/* ---------------------------------------------------------
   SECTION 20 — ANIMATION ENGINE
   Utility animations + micro-interactions for Mystic Design
--------------------------------------------------------- */

const Animate = {
    /* Add a temporary animation class */
    pulse(el, duration = 300) {
        if (!el) return;
        el.classList.add("anim-pulse");
        setTimeout(() => el.classList.remove("anim-pulse"), duration);
        EventBus.emit("animate:pulse", el);
    },

    /* Fade in */
    fadeIn(el, duration = 300) {
        if (!el) return;
        el.style.opacity = 0;
        el.style.display = "block";

        setTimeout(() => {
            el.style.transition = `opacity ${duration}ms ease`;
            el.style.opacity = 1;
        }, 10);

        EventBus.emit("animate:fadeIn", el);
    },

    /* Fade out */
    fadeOut(el, duration = 300) {
        if (!el) return;
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = 0;

        setTimeout(() => {
            el.style.display = "none";
        }, duration);

        EventBus.emit("animate:fadeOut", el);
    },

    /* Slide down */
    slideDown(el, duration = 300) {
        if (!el) return;
        el.style.display = "block";
        const height = el.scrollHeight;

        el.style.height = "0px";
        el.style.overflow = "hidden";
        el.style.transition = `height ${duration}ms ease`;

        requestAnimationFrame(() => {
            el.style.height = height + "px";
        });

        setTimeout(() => {
            el.style.height = "";
            el.style.overflow = "";
        }, duration);

        EventBus.emit("animate:slideDown", el);
    },

    /* Slide up */
    slideUp(el, duration = 300) {
        if (!el) return;
        const height = el.scrollHeight;

        el.style.height = height + "px";
        el.style.overflow = "hidden";
        el.style.transition = `height ${duration}ms ease`;

        requestAnimationFrame(() => {
            el.style.height = "0px";
        });

        setTimeout(() => {
            el.style.display = "none";
            el.style.height = "";
            el.style.overflow = "";
        }, duration);

        EventBus.emit("animate:slideUp", el);
    }
};

/* Debug */
if (MD.debug) log("Animation engine ready");
/* ---------------------------------------------------------
   SECTION 21 — STORAGE SYNC ENGINE
   LocalStorage + SessionStorage with namespaced keys
--------------------------------------------------------- */

const Storage = {
    prefix: "md_",   // namespace for Mystic Design

    /* Build namespaced key */
    key(key) {
        return this.prefix + key;
    },

    /* Save to localStorage */
    set(key, value) {
        try {
            localStorage.setItem(this.key(key), JSON.stringify(value));
            EventBus.emit("storage:set", { key, value });
        } catch (err) {
            log("Storage set error:", err);
        }
    },

    /* Load from localStorage */
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(this.key(key));
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            log("Storage get error:", err);
            return fallback;
        }
    },

    /* Remove from localStorage */
    remove(key) {
        try {
            localStorage.removeItem(this.key(key));
            EventBus.emit("storage:remove", key);
        } catch (err) {
            log("Storage remove error:", err);
        }
    },

    /* Session storage helpers */
    session: {
        set(key, value) {
            try {
                sessionStorage.setItem(Storage.key(key), JSON.stringify(value));
                EventBus.emit("session:set", { key, value });
            } catch (err) {
                log("Session set error:", err);
            }
        },

        get(key, fallback = null) {
            try {
                const raw = sessionStorage.getItem(Storage.key(key));
                return raw ? JSON.parse(raw) : fallback;
            } catch (err) {
                log("Session get error:", err);
                return fallback;
            }
        },

        remove(key) {
            try {
                sessionStorage.removeItem(Storage.key(key));
                EventBus.emit("session:remove", key);
            } catch (err) {
                log("Session remove error:", err);
            }
        }
    }
};

/* Debug */
if (MD.debug) log("Storage engine ready");
/* ---------------------------------------------------------
   SECTION 22 — ROUTER ENGINE
   Hash-based routing for Mystic Design
--------------------------------------------------------- */

const Router = {
    routes: {},

    /* Register a route */
    register(name, handler) {
        this.routes[name] = handler;
    },

    /* Get current route from URL hash */
    current() {
        return location.hash.replace("#", "") || "home";
    },

    /* Navigate programmatically */
    go(route) {
        location.hash = route;
        EventBus.emit("router:navigate", route);
    },

    /* Handle route change */
    handle() {
        const route = this.current();

        if (this.routes[route]) {
            this.routes[route]();
            EventBus.emit("router:change", route);
        } else {
            log(`No handler for route: ${route}`);
        }

        /* Update active nav links */
        $$("[data-route]").forEach(link => {
            const target = link.getAttribute("data-route");
            if (target === route) link.classList.add("active");
            else link.classList.remove("active");
        });
    },

    /* Initialize router */
    init() {
        window.addEventListener("hashchange", () => this.handle());
        this.handle(); // initial load
        log("Router engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Router.init();
});
/* ---------------------------------------------------------
   SECTION 23 — NOTIFICATION BADGE ENGINE
   Live counters + alert badges for Mystic Design
--------------------------------------------------------- */

const Badges = {
    /* Update a badge by name */
    set(name, value) {
        const els = $$(`[data-badge="${name}"]`);
        els.forEach(el => {
            el.textContent = value;

            if (parseInt(value) > 0) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });

        EventBus.emit("badge:update", { name, value });
    },

    /* Increment a badge */
    increment(name, amount = 1) {
        const current = this.get(name);
        this.set(name, current + amount);
    },

    /* Decrement a badge */
    decrement(name, amount = 1) {
        const current = this.get(name);
        this.set(name, Math.max(0, current - amount));
    },

    /* Get current badge value */
    get(name) {
        const el = $(`[data-badge="${name}"]`);
        if (!el) return 0;

        const val = parseInt(el.textContent);
        return isNaN(val) ? 0 : val;
    },

    /* Bind any element with [data-badge-trigger] */
    bindTriggers() {
        $$("[data-badge-trigger]").forEach(btn => {
            on(btn, "click", () => {
                const name = btn.getAttribute("data-badge-trigger");
                this.increment(name);
            });
        });
    },

    init() {
        this.bindTriggers();
        log("Badge engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Badges.init();
});
/* ---------------------------------------------------------
   SECTION 24 — SOUND ENGINE
   UI sound effects for Mystic Design
--------------------------------------------------------- */

const Sound = {
    sounds: {},

    /* Preload sounds */
    load(name, src) {
        const audio = new Audio(src);
        this.sounds[name] = audio;
        EventBus.emit("sound:loaded", name);
    },

    /* Play a sound */
    play(name, volume = 1) {
        const audio = this.sounds[name];
        if (!audio) return;

        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(err => log("Sound play error:", err));

        EventBus.emit("sound:play", name);
    },

    /* Bind elements with [data-sound] */
    bindTriggers() {
        $$("[data-sound]").forEach(el => {
            const soundName = el.getAttribute("data-sound");
            on(el, "click", () => this.play(soundName));
        });
    },

    init() {
        /* Default sounds (you can replace these with your own files) */
        this.load("click", "/sounds/click.mp3");
        this.load("success", "/sounds/success.mp3");
        this.load("error", "/sounds/error.mp3");
        this.load("toggle", "/sounds/toggle.mp3");

        this.bindTriggers();
        log("Sound engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Sound.init();
});
/* ---------------------------------------------------------
   SECTION 25 — OFFLINE ENGINE
   Connection detection + offline mode for Mystic Design
--------------------------------------------------------- */

const Offline = {
    isOffline: false,

    /* Show offline banner */
    showBanner() {
        let banner = $("#offline-banner");

        if (!banner) {
            banner = document.createElement("div");
            banner.id = "offline-banner";
            banner.textContent = "You are offline. Some features may not work.";
            banner.className = "offline-banner";
            document.body.appendChild(banner);
        }

        banner.classList.add("visible");
    },

    /* Hide offline banner */
    hideBanner() {
        const banner = $("#offline-banner");
        if (banner) banner.classList.remove("visible");
    },

    /* Handle offline state */
    goOffline() {
        if (this.isOffline) return;
        this.isOffline = true;

        this.showBanner();
        EventBus.emit("offline:enter");

        Toast.error("Connection lost");
    },

    /* Handle online state */
    goOnline() {
        if (!this.isOffline) return;
        this.isOffline = false;

        this.hideBanner();
        EventBus.emit("offline:exit");

        Toast.success("Reconnected");
    },

    /* Initialize listeners */
    init() {
        window.addEventListener("offline", () => this.goOffline());
        window.addEventListener("online", () => this.goOnline());

        /* Initial state check */
        if (!navigator.onLine) this.goOffline();

        log("Offline engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Offline.init();
});
/* ---------------------------------------------------------
   SECTION 26 — TAB SYNC ENGINE
   Cross-tab communication + multi-window sync
--------------------------------------------------------- */

const TabSync = {
    channel: null,

    init() {
        /* BroadcastChannel API (modern browsers) */
        if ("BroadcastChannel" in window) {
            this.channel = new BroadcastChannel("mystic_design_channel");

            this.channel.onmessage = (e) => {
                const { type, key, value } = e.data;

                if (type === "storage:update") {
                    Storage.set(key, value);
                    EventBus.emit("tabsync:update", { key, value });
                }

                if (type === "event") {
                    EventBus.emit(`tabsync:event:${key}`, value);
                }
            };

            log("TabSync engine ready (BroadcastChannel)");
        } else {
            /* Fallback: storage event */
            window.addEventListener("storage", (e) => {
                if (!e.key || !e.key.startsWith("md_")) return;

                const key = e.key.replace("md_", "");
                const value = JSON.parse(e.newValue);

                EventBus.emit("tabsync:update", { key, value });
            });

            log("TabSync engine ready (storage fallback)");
        }

        this.bindStorageSync();
    },

    /* Sync storage changes across tabs */
    bindStorageSync() {
        EventBus.on("storage:set", ({ key, value }) => {
            this.broadcast("storage:update", { key, value });
        });
    },

    /* Broadcast custom events */
    send(eventName, payload = {}) {
        this.broadcast("event", { key: eventName, value: payload });
    },

    /* Internal broadcast helper */
    broadcast(type, data) {
        if (this.channel) {
            this.channel.postMessage({ type, ...data });
        } else {
            /* Fallback: write to localStorage to trigger storage event */
            localStorage.setItem("md_sync_temp", Date.now());
        }
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    TabSync.init();
});
/* ---------------------------------------------------------
   SECTION 27 — ACCESSIBILITY ENGINE
   Focus traps, ARIA helpers, keyboard navigation
--------------------------------------------------------- */

const A11y = {
    /* Trap focus inside an element (e.g., modal) */
    trapFocus(container) {
        if (!container) return;

        const focusable = container.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handler = (e) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        container.addEventListener("keydown", handler);
        container._a11yHandler = handler;

        EventBus.emit("a11y:trap", container);
    },

    /* Release focus trap */
    releaseFocus(container) {
        if (!container || !container._a11yHandler) return;
        container.removeEventListener("keydown", container._a11yHandler);
        delete container._a11yHandler;

        EventBus.emit("a11y:release", container);
    },

    /* Apply ARIA attributes */
    aria(el, attrs = {}) {
        if (!el) return;
        Object.entries(attrs).forEach(([key, val]) => {
            el.setAttribute(`aria-${key}`, val);
        });
        EventBus.emit("a11y:aria", { el, attrs });
    },

    /* Auto-assign roles based on data attributes */
    autoRoles() {
        $$("[data-role]").forEach(el => {
            const role = el.getAttribute("data-role");
            el.setAttribute("role", role);
        });
    },

    /* Keyboard navigation helpers */
    bindKeyboardNav() {
        $$("[data-nav]").forEach(el => {
            on(el, "keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    el.click();
                }
            });
        });
    },

    init() {
        this.autoRoles();
        this.bindKeyboardNav();
        log("Accessibility engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    A11y.init();
});
/* ---------------------------------------------------------
   SECTION 28 — FORM ENGINE
   Validation, formatting, error messages, success states
--------------------------------------------------------- */

const FormEngine = {
    validators: {
        required: (value) => value.trim().length > 0,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        number: (value) => !isNaN(value),
        min: (value, arg) => value.length >= parseInt(arg),
        max: (value, arg) => value.length <= parseInt(arg)
    },

    /* Validate a single field */
    validateField(field) {
        const rules = field.getAttribute("data-validate");
        if (!rules) return true;

        const value = field.value || "";
        const ruleList = rules.split("|");

        for (let rule of ruleList) {
            let arg = null;

            if (rule.includes(":")) {
                const parts = rule.split(":");
                rule = parts[0];
                arg = parts[1];
            }

            const validator = this.validators[rule];
            if (validator && !validator(value, arg)) {
                this.showError(field, rule, arg);
                return false;
            }
        }

        this.showSuccess(field);
        return true;
    },

    /* Validate an entire form */
    validateForm(form) {
        let valid = true;

        const fields = form.querySelectorAll("[data-validate]");
        fields.forEach(field => {
            if (!this.validateField(field)) valid = false;
        });

        return valid;
    },

    /* Show error message */
    showError(field, rule, arg) {
        const msg = this.getErrorMessage(rule, arg);

        field.classList.add("error");
        field.classList.remove("success");

        let errorEl = field.parentElement.querySelector(".form-error");
        if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.className = "form-error";
            field.parentElement.appendChild(errorEl);
        }

        errorEl.textContent = msg;

        EventBus.emit("form:error", { field, rule });
    },

    /* Show success state */
    showSuccess(field) {
        field.classList.remove("error");
        field.classList.add("success");

        const errorEl = field.parentElement.querySelector(".form-error");
        if (errorEl) errorEl.textContent = "";

        EventBus.emit("form:success", field);
    },

    /* Error message generator */
    getErrorMessage(rule, arg) {
        const messages = {
            required: "This field is required.",
            email: "Please enter a valid email address.",
            number: "Please enter a valid number.",
            min: `Minimum length is ${arg} characters.`,
            max: `Maximum length is ${arg} characters.`
        };

        return messages[rule] || "Invalid input.";
    },

    /* Bind real-time validation */
    bindRealtime() {
        $$("[data-validate]").forEach(field => {
            on(field, "input", () => this.validateField(field));
        });
    },

    /* Bind form submissions */
    bindForms() {
        $$("form[data-validate-form]").forEach(form => {
            on(form, "submit", (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    Toast.error("Please fix the errors above.");
                }
            });
        });
    },

    init() {
        this.bindRealtime();
        this.bindForms();
        log("Form engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    FormEngine.init();
});
/* ---------------------------------------------------------
   SECTION 29 — FILE UPLOAD ENGINE
   Drag-and-drop, preview, validation, size limits
--------------------------------------------------------- */

const FileUpload = {
    maxSizeMB: 25, // adjustable
    allowedTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],

    /* Validate file */
    validate(file) {
        if (!this.allowedTypes.includes(file.type)) {
            Toast.error("Invalid file type");
            EventBus.emit("upload:error", { file, reason: "type" });
            return false;
        }

        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > this.maxSizeMB) {
            Toast.error(`File too large (max ${this.maxSizeMB}MB)`);
            EventBus.emit("upload:error", { file, reason: "size" });
            return false;
        }

        return true;
    },

    /* Preview image files */
    preview(file, previewEl) {
        if (!previewEl) return;

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewEl.src = e.target.result;
                previewEl.classList.add("visible");
            };
            reader.readAsDataURL(file);
        } else {
            previewEl.classList.remove("visible");
        }
    },

    /* Handle file selection */
    handleFiles(files, zone) {
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!this.validate(file)) return;

        const previewEl = zone.querySelector("[data-upload-preview]");
        this.preview(file, previewEl);

        EventBus.emit("upload:success", file);
    },

    /* Bind click-to-upload */
    bindInputs() {
        $$("[data-upload-input]").forEach(input => {
            const zone = input.closest("[data-upload-zone]");

            on(input, "change", (e) => {
                this.handleFiles(e.target.files, zone);
            });
        });
    },

    /* Bind drag-and-drop zones */
    bindDropzones() {
        $$("[data-upload-zone]").forEach(zone => {
            on(zone, "dragover", (e) => {
                e.preventDefault();
                zone.classList.add("dragover");
            });

            on(zone, "dragleave", () => {
                zone.classList.remove("dragover");
            });

            on(zone, "drop", (e) => {
                e.preventDefault();
                zone.classList.remove("dragover");

                const files = e.dataTransfer.files;
                this.handleFiles(files, zone);
            });

            /* Clicking the zone triggers file input */
            const input = zone.querySelector("[data-upload-input]");
            if (input) {
                on(zone, "click", () => input.click());
            }
        });
    },

    init() {
        this.bindInputs();
        this.bindDropzones();
        log("File upload engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    FileUpload.init();
});
/* ---------------------------------------------------------
   SECTION 30 — IMAGE PROCESSING ENGINE
   Auto-crop, resize, orientation fix, metadata strip
--------------------------------------------------------- */

const ImageProcessor = {
    /* Load image into a canvas */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /* Fix EXIF orientation (mobile uploads) */
    async fixOrientation(img) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        return canvas;
    },

    /* Resize image */
    resize(canvas, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height, 1);

        const newCanvas = document.createElement("canvas");
        newCanvas.width = canvas.width * ratio;
        newCanvas.height = canvas.height * ratio;

        const ctx = newCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

        return newCanvas;
    },

    /* Auto-crop transparent edges */
    autoCrop(canvas) {
        const ctx = canvas.getContext("2d");
        const { width, height } = canvas;
        const imgData = ctx.getImageData(0, 0, width, height).data;

        let top = null, bottom = null, left = null, right = null;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = imgData[(y * width + x) * 4 + 3];
                if (alpha !== 0) {
                    if (top === null) top = y;
                    bottom = y;
                    if (left === null || x < left) left = x;
                    if (right === null || x > right) right = x;
                }
            }
        }

        if (top === null) return canvas;

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = right - left + 1;
        cropCanvas.height = bottom - top + 1;

        const cropCtx = cropCanvas.getContext("2d");
        cropCtx.drawImage(canvas, left, top, cropCanvas.width, cropCanvas.height, 0, 0, cropCanvas.width, cropCanvas.height);

        return cropCanvas;
    },

    /* Strip metadata by re-rendering to canvas */
    stripMetadata(canvas) {
        return canvas.toDataURL("image/png");
    },

    /* Full processing pipeline */
    async process(file, options = {}) {
        const {
            maxWidth = 2000,
            maxHeight = 2000,
            autoCrop = true,
            fixOrientation = true
        } = options;

        try {
            EventBus.emit("image:processing:start", file);

            let img = await this.loadImage(file);
            let canvas = await this.fixOrientation(img);

            canvas = this.resize(canvas, maxWidth, maxHeight);

            if (autoCrop) {
                canvas = this.autoCrop(canvas);
            }

            const output = this.stripMetadata(canvas);

            EventBus.emit("image:processing:complete", { file, output });
            return output;

        } catch (err) {
            log("Image processing error:", err);
            Toast.error("Image processing failed");
            EventBus.emit("image:processing:error", err);
            return null;
        }
    }
};

/* Debug */
if (MD.debug) log("Image processing engine ready");
/* ---------------------------------------------------------
   SECTION 31 — COLOR ENGINE
   Hex <-> RGB <-> HSL, palette extraction, contrast checking
--------------------------------------------------------- */

const ColorEngine = {
    /* HEX → RGB */
    hexToRgb(hex) {
        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map(c => c + c).join("");
        }

        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    },

    /* RGB → HEX */
    rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map(x => x.toString(16).padStart(2, "0"))
                .join("")
        );
    },

    /* RGB → HSL */
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
                case g: h = ((b - r) / d + 2); break;
                case b: h = ((r - g) / d + 4); break;
            }

            h /= 6;
        }

        return { h, s, l };
    },

    /* HSL → RGB */
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    /* Luminance for contrast checking */
    luminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow((v + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    },

    /* Contrast ratio (WCAG) */
    contrast(hex1, hex2) {
        const rgb1 = this.hexToRgb(hex1);
        const rgb2 = this.hexToRgb(hex2);

        const L1 = this.luminance(rgb1.r, rgb1.g, rgb1.b);
        const L2 = this.luminance(rgb2.r, rgb2.g, rgb2.b);

        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        return ratio;
    },

    /* Extract dominant colors (simple sampling) */
    extractPalette(img, count = 5) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = {};

        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const hex = this.rgbToHex(r, g, b);
            colors[hex] = (colors[hex] || 0) + 1;
        }

        return Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([hex]) => hex);
    }
};

/* Debug */
if (MD.debug) log("Color engine ready");
/* ---------------------------------------------------------
   SECTION 32 — KEYBOARD SHORTCUT ENGINE
   Global + contextual keyboard shortcuts
--------------------------------------------------------- */

const Shortcuts = {
    shortcuts: {},

    /* Register a shortcut */
    register(combo, handler, options = {}) {
        const key = combo.toLowerCase();
        this.shortcuts[key] = { handler, options };
    },

    /* Parse key event into a combo string */
    parseEvent(e) {
        const parts = [];

        if (e.ctrlKey) parts.push("ctrl");
        if (e.metaKey) parts.push("meta");
        if (e.shiftKey) parts.push("shift");
        if (e.altKey) parts.push("alt");

        parts.push(e.key.toLowerCase());
        return parts.join("+");
    },

    /* Handle keydown events */
    handle(e) {
        const combo = this.parseEvent(e);

        if (this.shortcuts[combo]) {
            const { handler, options } = this.shortcuts[combo];

            if (options.prevent !== false) {
                e.preventDefault();
            }

            if (options.stop !== false) {
                e.stopPropagation();
            }

            handler(e);
            EventBus.emit("shortcut:trigger", combo);
        }
    },

    /* Initialize global listener */
    init() {
        document.addEventListener("keydown", (e) => this.handle(e));
        log("Keyboard shortcut engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Shortcuts.init();
});
/* ---------------------------------------------------------
   SECTION 33 — COMMAND PALETTE ENGINE
   Quick actions, fuzzy search, global command launcher
--------------------------------------------------------- */

const CommandPalette = {
    commands: [],
    isOpen: false,
    paletteEl: null,
    inputEl: null,
    listEl: null,

    /* Register a command */
    register(name, action, keywords = "") {
        this.commands.push({ name, action, keywords });
    },

    /* Create DOM elements */
    buildUI() {
        const wrapper = document.createElement("div");
        wrapper.id = "command-palette";
        wrapper.className = "command-palette";

        wrapper.innerHTML = `
            <div class="cp-inner">
                <input type="text" id="cp-input" placeholder="Type a command..." autocomplete="off" />
                <ul id="cp-list"></ul>
            </div>
        `;

        document.body.appendChild(wrapper);

        this.paletteEl = wrapper;
        this.inputEl = $("#cp-input");
        this.listEl = $("#cp-list");
    },

    /* Open palette */
    open() {
        this.isOpen = true;
        this.paletteEl.classList.add("open");
        this.inputEl.value = "";
        this.updateList("");
        this.inputEl.focus();

        EventBus.emit("palette:open");
    },

    /* Close palette */
    close() {
        this.isOpen = false;
        this.paletteEl.classList.remove("open");

        EventBus.emit("palette:close");
    },

    /* Toggle palette */
    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    /* Filter commands */
    filter(query) {
        const q = query.toLowerCase();

        return this.commands.filter(cmd =>
            cmd.name.toLowerCase().includes(q) ||
            cmd.keywords.toLowerCase().includes(q)
        );
    },

    /* Update list UI */
    updateList(query) {
        const results = this.filter(query);

        this.listEl.innerHTML = "";

        results.forEach(cmd => {
            const li = document.createElement("li");
            li.textContent = cmd.name;

            li.addEventListener("click", () => {
                cmd.action();
                this.close();
            });

            this.listEl.appendChild(li);
        });
    },

    /* Bind input events */
    bindInput() {
        this.inputEl.addEventListener("input", (e) => {
            this.updateList(e.target.value);
        });

        this.inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.close();
        });
    },

    /* Bind global shortcut (Ctrl+K or Cmd+K) */
    bindShortcut() {
        document.addEventListener("keydown", (e) => {
            const isMac = navigator.platform.toUpperCase().includes("MAC");

            if ((isMac && e.metaKey && e.key === "k") ||
                (!isMac && e.ctrlKey && e.key === "k")) {

                e.preventDefault();
                this.toggle();
            }
        });
    },

    init() {
        this.buildUI();
        this.bindInput();
        this.bindShortcut();

        log("Command palette engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    CommandPalette.init();
});
/* ---------------------------------------------------------
   SECTION 34 — HISTORY ENGINE
   Undo / Redo stack + state snapshots
--------------------------------------------------------- */

const History = {
    stack: [],
    pointer: -1,
    maxDepth: 100,

    /* Save a snapshot of state */
    push(state) {
        // Remove any redo states
        this.stack = this.stack.slice(0, this.pointer + 1);

        // Add new state
        this.stack.push(JSON.parse(JSON.stringify(state)));

        // Move pointer
        this.pointer = this.stack.length - 1;

        // Limit depth
        if (this.stack.length > this.maxDepth) {
            this.stack.shift();
            this.pointer--;
        }

        EventBus.emit("history:push", state);
    },

    /* Undo */
    undo() {
        if (this.pointer <= 0) {
            Toast.error("Nothing to undo");
            return null;
        }

        this.pointer--;
        const state = this.stack[this.pointer];

        EventBus.emit("history:undo", state);
        return JSON.parse(JSON.stringify(state));
    },

    /* Redo */
    redo() {
        if (this.pointer >= this.stack.length - 1) {
            Toast.error("Nothing to redo");
            return null;
        }

        this.pointer++;
        const state = this.stack[this.pointer];

        EventBus.emit("history:redo", state);
        return JSON.parse(JSON.stringify(state));
    },

    /* Clear history */
    clear() {
        this.stack = [];
        this.pointer = -1;
        EventBus.emit("history:clear");
    },

    /* Bind default shortcuts */
    bindShortcuts() {
        Shortcuts.register("ctrl+z", () => this.undo());
        Shortcuts.register("meta+z", () => this.undo());

        Shortcuts.register("ctrl+shift+z", () => this.redo());
        Shortcuts.register("meta+shift+z", () => this.redo());
    },

    init() {
        this.bindShortcuts();
        log("History engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    History.init();
});
/* ---------------------------------------------------------
   SECTION 35 — CLIPBOARD ENGINE
   Copy, cut, paste, internal + system clipboard
--------------------------------------------------------- */

const Clipboard = {
    internal: null, // internal clipboard object

    /* Copy data to internal + system clipboard */
    async copy(data) {
        this.internal = JSON.parse(JSON.stringify(data));

        // Try system clipboard
        try {
            await navigator.clipboard.writeText(JSON.stringify(data));
            Toast.success("Copied");
        } catch (err) {
            log("System clipboard unavailable, using internal only");
        }

        EventBus.emit("clipboard:copy", data);
    },

    /* Cut = copy + notify */
    async cut(data) {
        await this.copy(data);
        EventBus.emit("clipboard:cut", data);
    },

    /* Paste from internal or system clipboard */
    async paste() {
        let data = null;

        // Try system clipboard first
        try {
            const text = await navigator.clipboard.readText();
            data = JSON.parse(text);
        } catch (err) {
            data = this.internal;
        }

        if (!data) {
            Toast.error("Clipboard is empty");
            return null;
        }

        const clone = JSON.parse(JSON.stringify(data));
        EventBus.emit("clipboard:paste", clone);
        return clone;
    },

    /* Bind default shortcuts */
    bindShortcuts() {
        Shortcuts.register("ctrl+c", () => EventBus.emit("clipboard:requestCopy"));
        Shortcuts.register("meta+c", () => EventBus.emit("clipboard:requestCopy"));

        Shortcuts.register("ctrl+x", () => EventBus.emit("clipboard:requestCut"));
        Shortcuts.register("meta+x", () => EventBus.emit("clipboard:requestCut"));

        Shortcuts.register("ctrl+v", async () => {
            const data = await this.paste();
            if (data) EventBus.emit("clipboard:paste:complete", data);
        });

        Shortcuts.register("meta+v", async () => {
            const data = await this.paste();
            if (data) EventBus.emit("clipboard:paste:complete", data);
        });
    },

    init() {
        this.bindShortcuts();
        log("Clipboard engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Clipboard.init();
});
/* ---------------------------------------------------------
   SECTION 36 — SELECTION ENGINE
   Multi-select, shift-select, drag-select, bounding boxes
--------------------------------------------------------- */

const Selection = {
    selected: new Set(),
    dragStart: null,
    dragBox: null,

    /* Select a single element */
    select(el, additive = false) {
        if (!additive) this.clear();

        this.selected.add(el);
        el.classList.add("selected");

        EventBus.emit("selection:change", this.get());
    },

    /* Toggle selection (for shift-click) */
    toggle(el) {
        if (this.selected.has(el)) {
            this.selected.delete(el);
            el.classList.remove("selected");
        } else {
            this.selected.add(el);
            el.classList.add("selected");
        }

        EventBus.emit("selection:change", this.get());
    },

    /* Clear all selections */
    clear() {
        this.selected.forEach(el => el.classList.remove("selected"));
        this.selected.clear();

        EventBus.emit("selection:clear");
    },

    /* Get selected elements as array */
    get() {
        return Array.from(this.selected);
    },

    /* Start drag-select box */
    startDrag(x, y) {
        this.dragStart = { x, y };

        this.dragBox = document.createElement("div");
        this.dragBox.className = "selection-box";
        document.body.appendChild(this.dragBox);
    },

    /* Update drag-select box */
    updateDrag(x, y) {
        if (!this.dragBox) return;

        const minX = Math.min(this.dragStart.x, x);
        const minY = Math.min(this.dragStart.y, y);
        const width = Math.abs(x - this.dragStart.x);
        const height = Math.abs(y - this.dragStart.y);

        this.dragBox.style.left = minX + "px";
        this.dragBox.style.top = minY + "px";
        this.dragBox.style.width = width + "px";
        this.dragBox.style.height = height + "px";
    },

    /* Finish drag-select */
    finishDrag() {
        if (!this.dragBox) return;

        const box = this.dragBox.getBoundingClientRect();
        this.dragBox.remove();
        this.dragBox = null;

        this.clear();

        $$("[data-selectable]").forEach(el => {
            const rect = el.getBoundingClientRect();

            const overlap =
                rect.left < box.right &&
                rect.right > box.left &&
                rect.top < box.bottom &&
                rect.bottom > box.top;

            if (overlap) {
                this.selected.add(el);
                el.classList.add("selected");
            }
        });

        EventBus.emit("selection:change", this.get());
    },

    /* Bind click + shift-click selection */
    bindClickSelection() {
        document.addEventListener("click", (e) => {
            const el = e.target.closest("[data-selectable]");
            if (!el) return;

            if (e.shiftKey) {
                this.toggle(el);
            } else {
                this.select(el);
            }
        });
    },

    /* Bind drag-select */
    bindDragSelection() {
        document.addEventListener("mousedown", (e) => {
            if (e.target.closest("[data-selectable]")) return;

            this.startDrag(e.clientX, e.clientY);
        });

        document.addEventListener("mousemove", (e) => {
            if (this.dragStart) this.updateDrag(e.clientX, e.clientY);
        });

        document.addEventListener("mouseup", () => {
            if (this.dragStart) {
                this.finishDrag();
                this.dragStart = null;
            }
        });
    },

    init() {
        this.bindClickSelection();
        this.bindDragSelection();
        log("Selection engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Selection.init();
});
/* ---------------------------------------------------------
   SECTION 37 — TRANSFORM ENGINE
   Move, scale, rotate, resize handles
--------------------------------------------------------- */

const Transform = {
    activeEl: null,
    mode: null, // move | resize | rotate
    startX: 0,
    startY: 0,
    startBox: null,
    handle: null,

    /* Begin transform */
    start(e, el, mode, handle = null) {
        this.activeEl = el;
        this.mode = mode;
        this.handle = handle;

        const rect = el.getBoundingClientRect();
        this.startBox = {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
            rotation: parseFloat(el.dataset.rotation || 0)
        };

        this.startX = e.clientX;
        this.startY = e.clientY;

        document.body.classList.add("transforming");

        EventBus.emit("transform:start", { el, mode });
    },

    /* Move element */
    move(e) {
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        const x = this.startBox.x + dx;
        const y = this.startBox.y + dy;

        this.applyTransform({ x, y });
    },

    /* Resize element */
    resize(e) {
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        let w = this.startBox.w;
        let h = this.startBox.h;

        if (this.handle.includes("right")) w += dx;
        if (this.handle.includes("left")) w -= dx;
        if (this.handle.includes("bottom")) h += dy;
        if (this.handle.includes("top")) h -= dy;

        w = Math.max(10, w);
        h = Math.max(10, h);

        this.applyTransform({ w, h });
    },

    /* Rotate element */
    rotate(e) {
        const cx = this.startBox.x + this.startBox.w / 2;
        const cy = this.startBox.y + this.startBox.h / 2;

        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const deg = (angle * 180) / Math.PI;

        this.applyTransform({ rotation: deg });
    },

    /* Apply transform to element */
    applyTransform({ x, y, w, h, rotation }) {
        if (!this.activeEl) return;

        if (x !== undefined) this.activeEl.style.left = x + "px";
        if (y !== undefined) this.activeEl.style.top = y + "px";
        if (w !== undefined) this.activeEl.style.width = w + "px";
        if (h !== undefined) this.activeEl.style.height = h + "px";

        if (rotation !== undefined) {
            this.activeEl.dataset.rotation = rotation;
            this.activeEl.style.transform = `rotate(${rotation}deg)`;
        }

        EventBus.emit("transform:update", this.activeEl);
    },

    /* End transform */
    end() {
        if (!this.activeEl) return;

        EventBus.emit("transform:end", this.activeEl);

        this.activeEl = null;
        this.mode = null;
        this.handle = null;

        document.body.classList.remove("transforming");
    },

    /* Bind dragging */
    bindMove() {
        document.addEventListener("mousedown", (e) => {
            const el = e.target.closest("[data-transform]");
            if (!el) return;

            if (e.target.classList.contains("resize-handle")) return;

            this.start(e, el, "move");
        });
    },

    /* Bind resize handles */
    bindResize() {
        document.addEventListener("mousedown", (e) => {
            if (!e.target.classList.contains("resize-handle")) return;

            const el = e.target.closest("[data-transform]");
            const handle = e.target.dataset.handle;

            this.start(e, el, "resize", handle);
        });
    },

    /* Bind rotation handle */
    bindRotate() {
        document.addEventListener("mousedown", (e) => {
            if (!e.target.classList.contains("rotate-handle")) return;

            const el = e.target.closest("[data-transform]");
            this.start(e, el, "rotate");
        });
    },

    /* Bind global mousemove + mouseup */
    bindGlobal() {
        document.addEventListener("mousemove", (e) => {
            if (!this.activeEl) return;

            if (this.mode === "move") this.move(e);
            if (this.mode === "resize") this.resize(e);
            if (this.mode === "rotate") this.rotate(e);
        });

        document.addEventListener("mouseup", () => this.end());
    },

    init() {
        this.bindMove();
        this.bindResize();
        this.bindRotate();
        this.bindGlobal();

        log("Transform engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Transform.init();
});
/* ---------------------------------------------------------
   SECTION 38 — ALIGNMENT ENGINE
   Smart align, distribute, snap-to-grid, snap-to-object
--------------------------------------------------------- */

const Align = {
    gridSize: 10,
    snapDistance: 6,
    guides: [],

    /* Snap a value to grid */
    snapToGrid(value) {
        return Math.round(value / this.gridSize) * this.gridSize;
    },

    /* Snap a value to another value if close enough */
    snap(value, target) {
        return Math.abs(value - target) <= this.snapDistance ? target : value;
    },

    /* Clear alignment guides */
    clearGuides() {
        this.guides.forEach(g => g.remove());
        this.guides = [];
    },

    /* Draw a guide line */
    drawGuide(x1, y1, x2, y2) {
        const line = document.createElement("div");
        line.className = "align-guide";
        line.style.left = Math.min(x1, x2) + "px";
        line.style.top = Math.min(y1, y2) + "px";
        line.style.width = Math.abs(x2 - x1) + "px";
        line.style.height = Math.abs(y2 - y1) + "px";

        document.body.appendChild(line);
        this.guides.push(line);
    },

    /* Smart snapping logic */
    applySmartSnap(el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.clearGuides();

        $$("[data-transform]").forEach(other => {
            if (other === el) return;

            const r = other.getBoundingClientRect();
            const oCenterX = r.left + r.width / 2;
            const oCenterY = r.top + r.height / 2;

            /* Snap left edges */
            const snappedLeft = this.snap(rect.left, r.left);
            if (snappedLeft === r.left) {
                el.style.left = snappedLeft + "px";
                this.drawGuide(r.left, 0, r.left, window.innerHeight);
            }

            /* Snap right edges */
            const snappedRight = this.snap(rect.right, r.right);
            if (snappedRight === r.right) {
                const newLeft = r.right - rect.width;
                el.style.left = newLeft + "px";
                this.drawGuide(r.right, 0, r.right, window.innerHeight);
            }

            /* Snap centers horizontally */
            const snappedCenterX = this.snap(centerX, oCenterX);
            if (snappedCenterX === oCenterX) {
                const newLeft = oCenterX - rect.width / 2;
                el.style.left = newLeft + "px";
                this.drawGuide(oCenterX, 0, oCenterX, window.innerHeight);
            }

            /* Snap top edges */
            const snappedTop = this.snap(rect.top, r.top);
            if (snappedTop === r.top) {
                el.style.top = snappedTop + "px";
                this.drawGuide(0, r.top, window.innerWidth, r.top);
            }

            /* Snap bottom edges */
            const snappedBottom = this.snap(rect.bottom, r.bottom);
            if (snappedBottom === r.bottom) {
                const newTop = r.bottom - rect.height;
                el.style.top = newTop + "px";
                this.drawGuide(0, r.bottom, window.innerWidth, r.bottom);
            }

            /* Snap centers vertically */
            const snappedCenterY = this.snap(centerY, oCenterY);
            if (snappedCenterY === oCenterY) {
                const newTop = oCenterY - rect.height / 2;
                el.style.top = newTop + "px";
                this.drawGuide(0, oCenterY, window.innerWidth, oCenterY);
            }
        });
    },

    /* Bind snapping to transform updates */
    bindTransform() {
        EventBus.on("transform:update", (el) => {
            this.applySmartSnap(el);
        });

        EventBus.on("transform:end", () => {
            this.clearGuides();
        });
    },

    init() {
        this.bindTransform();
        log("Alignment engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Align.init();
});
/* ---------------------------------------------------------
   SECTION 39 — LAYER ENGINE
   Z-index control, bring forward/backward, layer panel sync
--------------------------------------------------------- */

const Layers = {
    /* Get all transformable elements sorted by z-index */
    getAll() {
        return Array.from($$("[data-transform]")).sort((a, b) => {
            return (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0);
        });
    },

    /* Normalize z-index values to avoid huge gaps */
    normalize() {
        const items = this.getAll();
        items.forEach((el, i) => {
            el.style.zIndex = i + 1;
        });

        EventBus.emit("layers:normalize", items);
    },

    /* Bring element forward by one */
    bringForward(el) {
        const items = this.getAll();
        const index = items.indexOf(el);

        if (index === items.length - 1) return; // already on top

        const next = items[index + 1];
        const temp = el.style.zIndex;
        el.style.zIndex = next.style.zIndex;
        next.style.zIndex = temp;

        this.normalize();
        EventBus.emit("layers:change", el);
    },

    /* Send element backward by one */
    sendBackward(el) {
        const items = this.getAll();
        const index = items.indexOf(el);

        if (index === 0) return; // already at bottom

        const prev = items[index - 1];
        const temp = el.style.zIndex;
        el.style.zIndex = prev.style.zIndex;
        prev.style.zIndex = temp;

        this.normalize();
        EventBus.emit("layers:change", el);
    },

    /* Bring to front */
    bringToFront(el) {
        const items = this.getAll();
        const maxZ = items.length + 1;

        el.style.zIndex = maxZ;
        this.normalize();

        EventBus.emit("layers:change", el);
    },

    /* Send to back */
    sendToBack(el) {
        el.style.zIndex = 0;
        this.normalize();

        EventBus.emit("layers:change", el);
    },

    /* Sync with layer panel */
    syncPanel() {
        const items = this.getAll().reverse(); // top → bottom

        EventBus.emit("layers:panel:update", items);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("layers:change", () => this.syncPanel());
        EventBus.on("transform:end", () => this.syncPanel());
        EventBus.on("selection:change", () => this.syncPanel());
    },

    init() {
        this.normalize();
        this.bindEvents();
        log("Layer engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Layers.init();
});
/* ---------------------------------------------------------
   SECTION 40 — GROUPING ENGINE
   Group, ungroup, nested groups, multi-object containers
--------------------------------------------------------- */

const Groups = {
    groupCounter: 0,

    /* Create a new group container */
    createGroup(elements) {
        if (!elements || elements.length === 0) return null;

        const group = document.createElement("div");
        group.className = "group-container";
        group.dataset.transform = "true";
        group.dataset.groupId = "group-" + (++this.groupCounter);

        // Compute bounding box of all elements
        const rects = elements.map(el => el.getBoundingClientRect());
        const minX = Math.min(...rects.map(r => r.left));
        const minY = Math.min(...rects.map(r => r.top));
        const maxX = Math.max(...rects.map(r => r.right));
        const maxY = Math.max(...rects.map(r => r.bottom));

        const width = maxX - minX;
        const height = maxY - minY;

        // Position group container
        group.style.position = "absolute";
        group.style.left = minX + "px";
        group.style.top = minY + "px";
        group.style.width = width + "px";
        group.style.height = height + "px";
        group.style.zIndex = 9999;

        // Move elements into group
        elements.forEach(el => {
            const r = el.getBoundingClientRect();
            const offsetX = r.left - minX;
            const offsetY = r.top - minY;

            el.style.left = offsetX + "px";
            el.style.top = offsetY + "px";

            group.appendChild(el);
        });

        document.body.appendChild(group);

        EventBus.emit("group:create", group);
        return group;
    },

    /* Ungroup a group container */
    ungroup(group) {
        if (!group || !group.classList.contains("group-container")) return;

        const rect = group.getBoundingClientRect();

        Array.from(group.children).forEach(el => {
            const r = el.getBoundingClientRect();
            const newX = rect.left + parseFloat(el.style.left);
            const newY = rect.top + parseFloat(el.style.top);

            el.style.left = newX + "px";
            el.style.top = newY + "px";

            document.body.appendChild(el);
        });

        group.remove();
        EventBus.emit("group:ungroup");
    },

    /* Group selected elements */
    groupSelected() {
        const selected = Selection.get();
        if (selected.length <= 1) {
            Toast.error("Select 2 or more items to group");
            return;
        }

        const group = this.createGroup(selected);
        Selection.clear();
        Selection.select(group);

        EventBus.emit("group:complete", group);
    },

    /* Ungroup selected group */
    ungroupSelected() {
        const selected = Selection.get();
        if (selected.length !== 1) {
            Toast.error("Select a single group to ungroup");
            return;
        }

        const el = selected[0];
        if (!el.classList.contains("group-container")) {
            Toast.error("Selected item is not a group");
            return;
        }

        this.ungroup(el);
        Selection.clear();
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("ctrl+g", () => this.groupSelected());
        Shortcuts.register("meta+g", () => this.groupSelected());

        Shortcuts.register("ctrl+shift+g", () => this.ungroupSelected());
        Shortcuts.register("meta+shift+g", () => this.ungroupSelected());
    },

    init() {
        this.bindShortcuts();
        log("Grouping engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Groups.init();
});
/* ---------------------------------------------------------
   SECTION 41 — EXPORT ENGINE
   PNG, JPG, SVG, PDF export + canvas rendering
--------------------------------------------------------- */

const Exporter = {
    /* Render an element to canvas */
    async renderToCanvas(el) {
        return new Promise((resolve, reject) => {
            try {
                const rect = el.getBoundingClientRect();
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = rect.width;
                canvas.height = rect.height;

                // Use HTML-to-canvas rendering (placeholder for real renderer)
                html2canvas(el, {
                    backgroundColor: null,
                    scale: 2
                }).then(resolve).catch(reject);

            } catch (err) {
                reject(err);
            }
        });
    },

    /* Export as PNG */
    async exportPNG(el) {
        const canvas = await this.renderToCanvas(el);
        const dataURL = canvas.toDataURL("image/png");

        this.download(dataURL, "export.png");
        EventBus.emit("export:png", dataURL);
    },

    /* Export as JPG */
    async exportJPG(el, quality = 0.92) {
        const canvas = await this.renderToCanvas(el);
        const dataURL = canvas.toDataURL("image/jpeg", quality);

        this.download(dataURL, "export.jpg");
        EventBus.emit("export:jpg", dataURL);
    },

    /* Export as SVG (basic wrapper) */
    exportSVG(el) {
        const clone = el.cloneNode(true);
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);

        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        this.download(url, "export.svg");
        EventBus.emit("export:svg", url);
    },

    /* Export as PDF */
    async exportPDF(el) {
        const canvas = await this.renderToCanvas(el);
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jspdf.jsPDF("p", "pt", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const ratio = canvas.height / canvas.width;
        const height = pageWidth * ratio;

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, height);
        pdf.save("export.pdf");

        EventBus.emit("export:pdf");
    },

    /* Download helper */
    download(dataURL, filename) {
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = filename;
        a.click();
    },

    /* Bind export events */
    bindEvents() {
        EventBus.on("export:requestPNG", (el) => this.exportPNG(el));
        EventBus.on("export:requestJPG", (el) => this.exportJPG(el));
        EventBus.on("export:requestSVG", (el) => this.exportSVG(el));
        EventBus.on("export:requestPDF", (el) => this.exportPDF(el));
    },

    init() {
        this.bindEvents();
        log("Export engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Exporter.init();
});
/* ---------------------------------------------------------
   SECTION 42 — TEXT ENGINE
   Rich text, font loading, line height, letter spacing, text bounds
--------------------------------------------------------- */

const TextEngine = {
    loadedFonts: new Set(),

    /* Load a font dynamically */
    async loadFont(name, url) {
        if (this.loadedFonts.has(name)) return;

        const font = new FontFace(name, `url(${url})`);
        await font.load();
        document.fonts.add(font);

        this.loadedFonts.add(name);
        EventBus.emit("text:fontLoaded", name);
    },

    /* Apply text properties to an element */
    applyProperties(el, props) {
        if (!el) return;

        if (props.fontFamily) el.style.fontFamily = props.fontFamily;
        if (props.fontSize) el.style.fontSize = props.fontSize + "px";
        if (props.color) el.style.color = props.color;
        if (props.lineHeight) el.style.lineHeight = props.lineHeight;
        if (props.letterSpacing) el.style.letterSpacing = props.letterSpacing + "px";
        if (props.fontWeight) el.style.fontWeight = props.fontWeight;
        if (props.textAlign) el.style.textAlign = props.textAlign;

        EventBus.emit("text:propertiesApplied", { el, props });
    },

    /* Measure text bounds */
    measure(el) {
        const rect = el.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            x: rect.left,
            y: rect.top
        };
    },

    /* Update bounding box after text changes */
    autoResize(el) {
        const bounds = this.measure(el);
        el.style.width = bounds.width + "px";
        el.style.height = bounds.height + "px";

        EventBus.emit("text:autoResize", el);
    },

    /* Bind input events for live editing */
    bindLiveEditing() {
        document.addEventListener("input", (e) => {
            const el = e.target.closest("[data-text]");
            if (!el) return;

            this.autoResize(el);
            EventBus.emit("text:change", el);
        });
    },

    /* Create a new text element */
    createText(x, y, content = "New Text") {
        const el = document.createElement("div");
        el.className = "text-element";
        el.dataset.transform = "true";
        el.dataset.text = "true";

        el.contentEditable = "true";
        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.fontSize = "24px";
        el.style.fontFamily = "Arial";
        el.style.color = "#ffffff";
        el.style.lineHeight = "1.2";
        el.style.letterSpacing = "0px";

        el.innerText = content;

        document.body.appendChild(el);
        this.autoResize(el);

        EventBus.emit("text:create", el);
        return el;
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("t", () => {
            const x = window.innerWidth / 2 - 50;
            const y = window.innerHeight / 2 - 20;
            const el = this.createText(x, y);
            Selection.clear();
            Selection.select(el);
        });
    },

    init() {
        this.bindLiveEditing();
        this.bindShortcuts();
        log("Text engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    TextEngine.init();
});
/* ---------------------------------------------------------
   SECTION 43 — SHAPE ENGINE
   Rectangles, circles, lines, polygons, stroke + fill controls
--------------------------------------------------------- */

const Shapes = {
    shapeCounter: 0,

    /* Create base shape element */
    createBase(x, y) {
        const el = document.createElement("div");
        el.className = "shape-element";
        el.dataset.transform = "true";
        el.dataset.shape = "true";
        el.dataset.shapeId = "shape-" + (++this.shapeCounter);

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = "120px";
        el.style.height = "120px";
        el.style.backgroundColor = "#ffffff";
        el.style.border = "2px solid #000000";
        el.style.borderRadius = "0px";

        document.body.appendChild(el);
        return el;
    },

    /* Rectangle */
    createRectangle(x, y) {
        const el = this.createBase(x, y);
        el.dataset.shapeType = "rectangle";

        EventBus.emit("shape:create", el);
        return el;
    },

    /* Circle / Ellipse */
    createCircle(x, y) {
        const el = this.createBase(x, y);
        el.dataset.shapeType = "circle";
        el.style.borderRadius = "50%";

        EventBus.emit("shape:create", el);
        return el;
    },

    /* Line */
    createLine(x, y) {
        const el = document.createElement("div");
        el.className = "shape-line";
        el.dataset.transform = "true";
        el.dataset.shape = "true";
        el.dataset.shapeType = "line";
        el.dataset.shapeId = "shape-" + (++this.shapeCounter);

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = "150px";
        el.style.height = "2px";
        el.style.backgroundColor = "#ffffff";

        document.body.appendChild(el);

        EventBus.emit("shape:create", el);
        return el;
    },

    /* Polygon (simple triangle for now) */
    createTriangle(x, y) {
        const el = document.createElement("div");
        el.className = "shape-triangle";
        el.dataset.transform = "true";
        el.dataset.shape = "true";
        el.dataset.shapeType = "triangle";
        el.dataset.shapeId = "shape-" + (++this.shapeCounter);

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = "0";
        el.style.height = "0";
        el.style.borderLeft = "60px solid transparent";
        el.style.borderRight = "60px solid transparent";
        el.style.borderBottom = "120px solid #ffffff";

        document.body.appendChild(el);

        EventBus.emit("shape:create", el);
        return el;
    },

    /* Apply stroke + fill */
    applyStyle(el, style) {
        if (!el) return;

        if (style.fill) el.style.backgroundColor = style.fill;
        if (style.stroke) el.style.borderColor = style.stroke;
        if (style.strokeWidth !== undefined) el.style.borderWidth = style.strokeWidth + "px";

        EventBus.emit("shape:style", { el, style });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("r", () => {
            const x = window.innerWidth / 2 - 60;
            const y = window.innerHeight / 2 - 60;
            const el = this.createRectangle(x, y);
            Selection.clear();
            Selection.select(el);
        });

        Shortcuts.register("c", () => {
            const x = window.innerWidth / 2 - 60;
            const y = window.innerHeight / 2 - 60;
            const el = this.createCircle(x, y);
            Selection.clear();
            Selection.select(el);
        });

        Shortcuts.register("l", () => {
            const x = window.innerWidth / 2 - 75;
            const y = window.innerHeight / 2;
            const el = this.createLine(x, y);
            Selection.clear();
            Selection.select(el);
        });

        Shortcuts.register("p", () => {
            const x = window.innerWidth / 2 - 60;
            const y = window.innerHeight / 2 - 60;
            const el = this.createTriangle(x, y);
            Selection.clear();
            Selection.select(el);
        });
    },

    init() {
        this.bindShortcuts();
        log("Shape engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Shapes.init();
});
/* ---------------------------------------------------------
   SECTION 44 — IMAGE ENGINE
   Upload, replace, crop, mask, filters, adjustments
--------------------------------------------------------- */

const ImageEngine = {
    imageCounter: 0,

    /* Create base image element */
    createImage(x, y, src) {
        const el = document.createElement("div");
        el.className = "image-element";
        el.dataset.transform = "true";
        el.dataset.image = "true";
        el.dataset.imageId = "image-" + (++this.imageCounter);

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = "300px";
        el.style.height = "300px";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundImage = `url('${src}')`;

        document.body.appendChild(el);

        EventBus.emit("image:create", el);
        return el;
    },

    /* Replace image source */
    replaceImage(el, src) {
        if (!el || !el.dataset.image) return;

        el.style.backgroundImage = `url('${src}')`;
        EventBus.emit("image:replace", { el, src });
    },

    /* Apply filters */
    applyFilters(el, filters) {
        if (!el || !el.dataset.image) return;

        const {
            brightness = 1,
            contrast = 1,
            saturation = 1,
            blur = 0,
            grayscale = 0
        } = filters;

        el.style.filter = `
            brightness(${brightness})
            contrast(${contrast})
            saturate(${saturation})
            blur(${blur}px)
            grayscale(${grayscale})
        `;

        EventBus.emit("image:filters", { el, filters });
    },

    /* Apply mask (simple shape mask) */
    applyMask(el, maskType) {
        if (!el || !el.dataset.image) return;

        if (maskType === "circle") {
            el.style.borderRadius = "50%";
        } else if (maskType === "rounded") {
            el.style.borderRadius = "20px";
        } else {
            el.style.borderRadius = "0px";
        }

        EventBus.emit("image:mask", { el, maskType });
    },

    /* Crop (simple viewport crop) */
    crop(el, cropData) {
        if (!el || !el.dataset.image) return;

        const { x, y, w, h } = cropData;

        el.style.backgroundPosition = `-${x}px -${y}px`;
        el.style.backgroundSize = `${w}px ${h}px`;

        EventBus.emit("image:crop", { el, cropData });
    },

    /* Upload handler */
    bindUpload() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        document.body.appendChild(input);

        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const x = window.innerWidth / 2 - 150;
                const y = window.innerHeight / 2 - 150;

                const el = this.createImage(x, y, reader.result);
                Selection.clear();
                Selection.select(el);
            };
            reader.readAsDataURL(file);
        });

        EventBus.on("image:requestUpload", () => input.click());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("i", () => EventBus.emit("image:requestUpload"));
    },

    init() {
        this.bindUpload();
        this.bindShortcuts();
        log("Image engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ImageEngine.init();
});
/* ---------------------------------------------------------
   SECTION 45 — COLOR ENGINE
   Pickers, palettes, gradients, harmonies, brand colors
--------------------------------------------------------- */

const ColorEngine = {
    brandColors: ["#6a00ff", "#b300ff", "#ff00e6"], // Mystic Design defaults
    lastColor: "#ffffff",

    /* Convert hex to RGB */
    hexToRgb(hex) {
        const bigint = parseInt(hex.replace("#", ""), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    },

    /* Convert RGB to hex */
    rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    },

    /* Generate complementary color */
    complementary(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        return this.rgbToHex(255 - r, 255 - g, 255 - b);
    },

    /* Generate analogous colors */
    analogous(hex) {
        const base = tinycolor(hex);
        return [
            base.spin(-30).toHexString(),
            base.toHexString(),
            base.spin(30).toHexString()
        ];
    },

    /* Generate triadic colors */
    triadic(hex) {
        const base = tinycolor(hex);
        return [
            base.toHexString(),
            base.spin(120).toHexString(),
            base.spin(240).toHexString()
        ];
    },

    /* Apply solid color */
    applyColor(el, color) {
        if (!el) return;

        el.style.background = color;
        this.lastColor = color;

        EventBus.emit("color:apply", { el, color });
    },

    /* Apply gradient */
    applyGradient(el, gradient) {
        if (!el) return;

        el.style.background = gradient;
        EventBus.emit("color:gradient", { el, gradient });
    },

    /* Build color picker UI */
    buildPicker() {
        const input = document.createElement("input");
        input.type = "color";
        input.id = "mystic-color-picker";
        input.style.display = "none";

        document.body.appendChild(input);

        input.addEventListener("input", (e) => {
            const color = e.target.value;
            const selected = Selection.get()[0];
            if (selected) this.applyColor(selected, color);
        });

        EventBus.on("color:requestPicker", () => input.click());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("k", () => EventBus.emit("color:requestPicker"));
    },

    init() {
        this.buildPicker();
        this.bindShortcuts();
        log("Color engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ColorEngine.init();
});
/* ---------------------------------------------------------
   SECTION 46 — EFFECTS ENGINE
   Shadows, glows, blurs, layer effects
--------------------------------------------------------- */

const Effects = {
    /* Apply drop shadow */
    applyShadow(el, opts = {}) {
        if (!el) return;

        const {
            x = 0,
            y = 4,
            blur = 10,
            spread = 0,
            color = "rgba(0,0,0,0.3)"
        } = opts;

        el.style.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;

        EventBus.emit("effects:shadow", { el, opts });
    },

    /* Apply inner shadow */
    applyInnerShadow(el, opts = {}) {
        if (!el) return;

        const {
            x = 0,
            y = 4,
            blur = 10,
            spread = 0,
            color = "rgba(0,0,0,0.3)"
        } = opts;

        el.style.boxShadow = `inset ${x}px ${y}px ${blur}px ${spread}px ${color}`;

        EventBus.emit("effects:innerShadow", { el, opts });
    },

    /* Apply glow */
    applyGlow(el, opts = {}) {
        if (!el) return;

        const {
            size = 20,
            color = "rgba(255, 0, 255, 0.7)"
        } = opts;

        el.style.boxShadow = `0 0 ${size}px ${color}`;

        EventBus.emit("effects:glow", { el, opts });
    },

    /* Apply blur */
    applyBlur(el, amount = 5) {
        if (!el) return;

        el.style.filter = `blur(${amount}px)`;

        EventBus.emit("effects:blur", { el, amount });
    },

    /* Clear all effects */
    clearEffects(el) {
        if (!el) return;

        el.style.boxShadow = "none";
        el.style.filter = "none";

        EventBus.emit("effects:clear", el);
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Drop shadow
        Shortcuts.register("s", () => {
            const el = Selection.get()[0];
            if (el) this.applyShadow(el);
        });

        // Glow
        Shortcuts.register("g", () => {
            const el = Selection.get()[0];
            if (el) this.applyGlow(el);
        });

        // Blur
        Shortcuts.register("b", () => {
            const el = Selection.get()[0];
            if (el) this.applyBlur(el, 8);
        });

        // Clear effects
        Shortcuts.register("shift+e", () => {
            const el = Selection.get()[0];
            if (el) this.clearEffects(el);
        });
    },

    init() {
        this.bindShortcuts();
        log("Effects engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Effects.init();
});
/* ---------------------------------------------------------
   SECTION 47 — GRID & GUIDES ENGINE
   Rulers, custom guides, grid overlay, snapping controls
--------------------------------------------------------- */

const Guides = {
    gridEnabled: true,
    guides: [],
    rulerSize: 24,
    gridSize: 20,

    /* Create rulers */
    buildRulers() {
        const top = document.createElement("div");
        top.id = "ruler-top";
        top.className = "ruler horizontal-ruler";

        const left = document.createElement("div");
        left.id = "ruler-left";
        left.className = "ruler vertical-ruler";

        document.body.appendChild(top);
        document.body.appendChild(left);

        this.drawRulerTicks(top, "horizontal");
        this.drawRulerTicks(left, "vertical");
    },

    /* Draw ruler ticks */
    drawRulerTicks(ruler, orientation) {
        for (let i = 0; i < 5000; i += this.gridSize) {
            const tick = document.createElement("div");
            tick.className = "ruler-tick";

            if (orientation === "horizontal") {
                tick.style.left = i + "px";
            } else {
                tick.style.top = i + "px";
            }

            ruler.appendChild(tick);
        }
    },

    /* Create a custom guide */
    createGuide(position, orientation) {
        const guide = document.createElement("div");
        guide.className = `guide guide-${orientation}`;

        if (orientation === "vertical") {
            guide.style.left = position + "px";
        } else {
            guide.style.top = position + "px";
        }

        document.body.appendChild(guide);
        this.guides.push(guide);

        EventBus.emit("guides:create", { guide, orientation, position });
        return guide;
    },

    /* Drag to create guides from rulers */
    bindGuideCreation() {
        document.addEventListener("mousedown", (e) => {
            if (e.target.id === "ruler-top") {
                this.draggingGuide = this.createGuide(e.clientX, "vertical");
            }

            if (e.target.id === "ruler-left") {
                this.draggingGuide = this.createGuide(e.clientY, "horizontal");
            }
        });

        document.addEventListener("mousemove", (e) => {
            if (!this.draggingGuide) return;

            if (this.draggingGuide.classList.contains("guide-vertical")) {
                this.draggingGuide.style.left = e.clientX + "px";
            } else {
                this.draggingGuide.style.top = e.clientY + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            if (this.draggingGuide) {
                EventBus.emit("guides:finalize", this.draggingGuide);
                this.draggingGuide = null;
            }
        });
    },

    /* Grid overlay */
    buildGrid() {
        const grid = document.createElement("div");
        grid.id = "mystic-grid";
        grid.className = "grid-overlay";
        document.body.appendChild(grid);

        this.updateGrid();
    },

    /* Update grid visibility */
    updateGrid() {
        const grid = $("#mystic-grid");
        grid.style.display = this.gridEnabled ? "block" : "none";
    },

    /* Toggle grid */
    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        this.updateGrid();

        EventBus.emit("grid:toggle", this.gridEnabled);
    },

    /* Snap elements to guides */
    applyGuideSnap(el) {
        const rect = el.getBoundingClientRect();

        this.guides.forEach(guide => {
            const isVertical = guide.classList.contains("guide-vertical");
            const pos = parseFloat(isVertical ? guide.style.left : guide.style.top);

            if (isVertical) {
                const snapped = Align.snap(rect.left, pos);
                if (snapped === pos) el.style.left = snapped + "px";
            } else {
                const snapped = Align.snap(rect.top, pos);
                if (snapped === pos) el.style.top = snapped + "px";
            }
        });
    },

    /* Bind snapping to transform updates */
    bindSnapping() {
        EventBus.on("transform:update", (el) => {
            this.applyGuideSnap(el);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("shift+g", () => this.toggleGrid());
    },

    init() {
        this.buildRulers();
        this.buildGrid();
        this.bindGuideCreation();
        this.bindSnapping();
        this.bindShortcuts();

        log("Grid & Guides engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Guides.init();
});
/* ---------------------------------------------------------
   SECTION 48 — HISTORY TIMELINE ENGINE
   Visual timeline, state previews, jump-to-state
--------------------------------------------------------- */

const HistoryTimeline = {
    container: null,
    thumbnails: [],
    maxThumbs: 200,

    /* Build timeline UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "history-timeline";
        panel.className = "history-timeline";

        panel.innerHTML = `
            <div class="timeline-inner">
                <div id="timeline-track"></div>
            </div>
        `;

        document.body.appendChild(panel);
        this.container = $("#timeline-track");
    },

    /* Generate a thumbnail for a state */
    async generateThumbnail(state) {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = 160;
            canvas.height = 100;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#fff";
            ctx.font = "12px Arial";
            ctx.fillText("State " + (this.thumbnails.length + 1), 10, 20);

            resolve(canvas.toDataURL("image/png"));
        });
    },

    /* Add a new state to the timeline */
    async addState(state) {
        if (!this.container) return;

        const thumb = await this.generateThumbnail(state);

        const item = document.createElement("div");
        item.className = "timeline-item";

        item.innerHTML = `
            <img src="${thumb}" class="timeline-thumb" />
            <div class="timeline-index">${this.thumbnails.length + 1}</div>
        `;

        item.addEventListener("click", () => {
            const index = this.thumbnails.indexOf(thumb);
            if (index >= 0) {
                const restored = History.stack[index];
                EventBus.emit("history:jump", restored);
            }
        });

        this.container.appendChild(item);
        this.thumbnails.push(thumb);

        if (this.thumbnails.length > this.maxThumbs) {
            this.thumbnails.shift();
            this.container.removeChild(this.container.firstChild);
        }

        EventBus.emit("timeline:add", thumb);
    },

    /* Sync timeline when undo/redo happens */
    syncPointer() {
        const items = $$(".timeline-item");
        items.forEach((item, i) => {
            item.classList.toggle("active", i === History.pointer);
        });
    },

    /* Bind history events */
    bindEvents() {
        EventBus.on("history:push", (state) => this.addState(state));
        EventBus.on("history:undo", () => this.syncPointer());
        EventBus.on("history:redo", () => this.syncPointer());
        EventBus.on("history:jump", () => this.syncPointer());
    },

    init() {
        this.buildUI();
        this.bindEvents();
        log("History Timeline engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    HistoryTimeline.init();
});
/* ---------------------------------------------------------
   SECTION 49 — SHORTCUTS PANEL ENGINE
   Visual keyboard map, custom shortcuts, command binding UI
--------------------------------------------------------- */

const ShortcutPanel = {
    panel: null,
    bindings: {}, // { "ctrl+z": "undo", ... }
    listeningFor: null,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "shortcut-panel";
        panel.className = "shortcut-panel hidden";

        panel.innerHTML = `
            <div class="shortcut-header">Keyboard Shortcuts</div>
            <div class="shortcut-list" id="shortcut-list"></div>
            <div class="shortcut-footer">
                <button id="close-shortcuts">Close</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        $("#close-shortcuts").addEventListener("click", () => this.hide());
    },

    /* Show panel */
    show() {
        this.refreshList();
        this.panel.classList.remove("hidden");
    },

    /* Hide panel */
    hide() {
        this.panel.classList.add("hidden");
    },

    /* Register a shortcut for display */
    registerShortcut(keyCombo, commandName) {
        this.bindings[keyCombo] = commandName;
        EventBus.emit("shortcuts:register", { keyCombo, commandName });
    },

    /* Refresh list UI */
    refreshList() {
        const list = $("#shortcut-list");
        list.innerHTML = "";

        Object.entries(this.bindings).forEach(([key, cmd]) => {
            const item = document.createElement("div");
            item.className = "shortcut-item";

            item.innerHTML = `
                <div class="shortcut-command">${cmd}</div>
                <div class="shortcut-key">${key}</div>
                <button class="shortcut-edit" data-key="${key}">Edit</button>
            `;

            list.appendChild(item);
        });

        this.bindEditButtons();
    },

    /* Bind edit buttons */
    bindEditButtons() {
        $$(".shortcut-edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.key;
                this.startRebind(key);
            });
        });
    },

    /* Begin listening for new key combo */
    startRebind(oldKey) {
        this.listeningFor = oldKey;
        Toast.info("Press new shortcut…");

        const handler = (e) => {
            e.preventDefault();

            const combo = this.formatKeyCombo(e);
            if (!combo) return;

            // Check for conflicts
            if (this.bindings[combo]) {
                Toast.error("Shortcut already in use");
                return;
            }

            // Rebind
            const command = this.bindings[this.listeningFor];
            delete this.bindings[this.listeningFor];
            this.bindings[combo] = command;

            EventBus.emit("shortcuts:rebind", { oldKey: this.listeningFor, newKey: combo });

            this.listeningFor = null;
            this.refreshList();
            document.removeEventListener("keydown", handler);
        };

        document.addEventListener("keydown", handler);
    },

    /* Format key combo */
    formatKeyCombo(e) {
        let combo = [];
        if (e.ctrlKey) combo.push("ctrl");
        if (e.metaKey) combo.push("meta");
        if (e.shiftKey) combo.push("shift");
        if (e.altKey) combo.push("alt");

        const key = e.key.toLowerCase();
        if (!["control", "shift", "alt", "meta"].includes(key)) {
            combo.push(key);
        }

        return combo.join("+");
    },

    /* Bind panel toggle shortcut */
    bindToggle() {
        Shortcuts.register("?", () => this.show());
    },

    init() {
        this.buildUI();
        this.bindToggle();

        log("Shortcut Panel engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ShortcutPanel.init();
});
/* ---------------------------------------------------------
   SECTION 50 — COMMAND PALETTE ENGINE
   Searchable actions, quick commands, fuzzy matching
--------------------------------------------------------- */

const CommandPalette = {
    panel: null,
    input: null,
    list: null,
    actions: {}, // { "actionName": () => {...} }

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "command-palette";
        panel.className = "command-palette hidden";

        panel.innerHTML = `
            <input id="cmd-input" class="cmd-input" placeholder="Type a command..." />
            <div id="cmd-list" class="cmd-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.input = $("#cmd-input");
        this.list = $("#cmd-list");

        this.bindInput();
    },

    /* Register a command */
    register(name, callback) {
        this.actions[name] = callback;
        EventBus.emit("command:register", name);
    },

    /* Show palette */
    show() {
        this.panel.classList.remove("hidden");
        this.input.value = "";
        this.input.focus();
        this.refreshList("");
    },

    /* Hide palette */
    hide() {
        this.panel.classList.add("hidden");
    },

    /* Fuzzy search */
    search(query) {
        const q = query.toLowerCase();
        return Object.keys(this.actions).filter(name =>
            name.toLowerCase().includes(q)
        );
    },

    /* Refresh list */
    refreshList(query) {
        const results = this.search(query);
        this.list.innerHTML = "";

        results.forEach(name => {
            const item = document.createElement("div");
            item.className = "cmd-item";
            item.innerText = name;

            item.addEventListener("click", () => {
                this.execute(name);
            });

            this.list.appendChild(item);
        });
    },

    /* Execute command */
    execute(name) {
        if (this.actions[name]) {
            this.actions[name]();
            EventBus.emit("command:run", name);
        }
        this.hide();
    },

    /* Bind input events */
    bindInput() {
        this.input.addEventListener("input", (e) => {
            this.refreshList(e.target.value);
        });

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const first = this.list.querySelector(".cmd-item");
                if (first) this.execute(first.innerText);
            }
            if (e.key === "Escape") this.hide();
        });
    },

    /* Bind global shortcut */
    bindShortcut() {
        Shortcuts.register("ctrl+p", () => this.show());
        Shortcuts.register("meta+p", () => this.show());
    },

    /* Register core commands */
    registerCoreCommands() {
        this.register("Undo", () => EventBus.emit("history:undo"));
        this.register("Redo", () => EventBus.emit("history:redo"));
        this.register("Group", () => Groups.groupSelected());
        this.register("Ungroup", () => Groups.ungroupSelected());
        this.register("Export PNG", () => {
            const el = $("#canvas") || document.body;
            EventBus.emit("export:requestPNG", el);
        });
        this.register("Toggle Grid", () => Guides.toggleGrid());
        this.register("Open Shortcuts Panel", () => ShortcutPanel.show());
    },

    init() {
        this.buildUI();
        this.bindShortcut();
        this.registerCoreCommands();

        log("Command Palette engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    CommandPalette.init();
});
/* ---------------------------------------------------------
   SECTION 51 — ASSET LIBRARY ENGINE
   Uploads, categories, search, drag-into-canvas
--------------------------------------------------------- */

const AssetLibrary = {
    assets: [], // { id, src, category }
    categories: ["Uploads", "Logos", "Icons", "Textures", "Photos"],
    panel: null,
    list: null,
    searchInput: null,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "asset-library";
        panel.className = "asset-library hidden";

        panel.innerHTML = `
            <div class="asset-header">
                <div class="asset-title">Assets</div>
                <input id="asset-search" class="asset-search" placeholder="Search assets..." />
                <button id="asset-upload-btn">Upload</button>
            </div>

            <div class="asset-categories" id="asset-categories"></div>
            <div class="asset-list" id="asset-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#asset-list");
        this.searchInput = $("#asset-search");

        this.buildCategories();
        this.bindSearch();
        this.bindUploadButton();
        this.bindDragToCanvas();
    },

    /* Build category buttons */
    buildCategories() {
        const container = $("#asset-categories");
        container.innerHTML = "";

        this.categories.forEach(cat => {
            const btn = document.createElement("div");
            btn.className = "asset-category";
            btn.innerText = cat;

            btn.addEventListener("click", () => {
                this.filterByCategory(cat);
            });

            container.appendChild(btn);
        });
    },

    /* Add asset */
    addAsset(src, category = "Uploads") {
        const id = "asset-" + (this.assets.length + 1);
        this.assets.push({ id, src, category });

        this.refreshList();
        EventBus.emit("assets:add", { id, src, category });
    },

    /* Refresh asset list */
    refreshList(filter = "") {
        this.list.innerHTML = "";

        const q = filter.toLowerCase();

        this.assets
            .filter(a => a.category.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
            .forEach(asset => {
                const item = document.createElement("div");
                item.className = "asset-item";
                item.draggable = true;

                item.innerHTML = `
                    <img src="${asset.src}" class="asset-thumb" />
                    <div class="asset-id">${asset.id}</div>
                `;

                item.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("asset-src", asset.src);
                });

                this.list.appendChild(item);
            });
    },

    /* Filter by category */
    filterByCategory(cat) {
        this.refreshList(cat);
    },

    /* Bind search */
    bindSearch() {
        this.searchInput.addEventListener("input", (e) => {
            this.refreshList(e.target.value);
        });
    },

    /* Bind upload button */
    bindUploadButton() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        document.body.appendChild(input);

        $("#asset-upload-btn").addEventListener("click", () => input.click());

        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                this.addAsset(reader.result, "Uploads");
            };
            reader.readAsDataURL(file);
        });
    },

    /* Drag into canvas */
    bindDragToCanvas() {
        document.addEventListener("dragover", (e) => e.preventDefault());

        document.addEventListener("drop", (e) => {
            const src = e.dataTransfer.getData("asset-src");
            if (!src) return;

            const x = e.clientX - 150;
            const y = e.clientY - 150;

            const el = ImageEngine.createImage(x, y, src);
            Selection.clear();
            Selection.select(el);

            EventBus.emit("assets:drop", el);
        });
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Bind shortcut */
    bindShortcut() {
        Shortcuts.register("a", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcut();
        this.refreshList();

        log("Asset Library engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AssetLibrary.init();
});
/* ---------------------------------------------------------
   SECTION 52 — TEMPLATE ENGINE
   Template packs, auto-fill, smart layout injection
--------------------------------------------------------- */

const Templates = {
    templates: [], // { id, name, preview, structure }
    panel: null,
    list: null,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "template-panel";
        panel.className = "template-panel hidden";

        panel.innerHTML = `
            <div class="template-header">
                <div class="template-title">Templates</div>
                <input id="template-search" class="template-search" placeholder="Search templates..." />
            </div>
            <div class="template-list" id="template-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#template-list");

        this.bindSearch();
    },

    /* Register a template */
    registerTemplate(name, preview, structure) {
        const id = "template-" + (this.templates.length + 1);
        this.templates.push({ id, name, preview, structure });

        EventBus.emit("template:register", { id, name });
        this.refreshList();
    },

    /* Refresh template list */
    refreshList(filter = "") {
        this.list.innerHTML = "";

        const q = filter.toLowerCase();

        this.templates
            .filter(t => t.name.toLowerCase().includes(q))
            .forEach(t => {
                const item = document.createElement("div");
                item.className = "template-item";

                item.innerHTML = `
                    <img src="${t.preview}" class="template-thumb" />
                    <div class="template-name">${t.name}</div>
                `;

                item.addEventListener("click", () => {
                    this.applyTemplate(t);
                });

                this.list.appendChild(item);
            });
    },

    /* Bind search */
    bindSearch() {
        $("#template-search").addEventListener("input", (e) => {
            this.refreshList(e.target.value);
        });
    },

    /* Apply template to canvas */
    applyTemplate(tpl) {
        // Clear canvas
        $$("[data-transform]").forEach(el => el.remove());

        // Inject structure
        tpl.structure.forEach(node => {
            if (node.type === "text") {
                const el = TextEngine.createText(node.x, node.y, node.content || "Text");
                TextEngine.applyProperties(el, node.props || {});
            }

            if (node.type === "shape") {
                let el;
                if (node.shape === "rectangle") el = Shapes.createRectangle(node.x, node.y);
                if (node.shape === "circle") el = Shapes.createCircle(node.x, node.y);
                if (node.shape === "line") el = Shapes.createLine(node.x, node.y);

                if (node.style) Shapes.applyStyle(el, node.style);
            }

            if (node.type === "image") {
                const el = ImageEngine.createImage(node.x, node.y, node.src || "");
                if (node.filters) ImageEngine.applyFilters(el, node.filters);
                if (node.mask) ImageEngine.applyMask(el, node.mask);
            }
        });

        EventBus.emit("template:apply", tpl);
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Bind shortcut */
    bindShortcut() {
        Shortcuts.register("t", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcut();

        // Example templates
        this.registerTemplate("Minimal Poster", "assets/template1.png", [
            { type: "text", x: 200, y: 100, content: "TITLE", props: { fontSize: 48, fontWeight: "bold" } },
            { type: "text", x: 200, y: 180, content: "Subtitle goes here", props: { fontSize: 24 } },
            { type: "shape", shape: "rectangle", x: 180, y: 260, style: { fill: "#6a00ff" } }
        ]);

        this.registerTemplate("Photo Card", "assets/template2.png", [
            { type: "image", x: 150, y: 100, src: "assets/sample-photo.jpg" },
            { type: "text", x: 150, y: 420, content: "Your Caption", props: { fontSize: 32 } }
        ]);

        log("Template engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Templates.init();
});
/* ---------------------------------------------------------
   SECTION 53 — AI AUTO-FILL ENGINE
   Smart content injection, text replacement, image suggestions
--------------------------------------------------------- */

const AIAutoFill = {
    /* Map template fields to user content */
    fieldMap: {
        title: ["title", "headline", "main", "header"],
        subtitle: ["subtitle", "subheader", "tagline"],
        body: ["body", "description", "details"],
        image: ["image", "photo", "picture"]
    },

    /* Semantic match: find best field for user input */
    matchField(key) {
        key = key.toLowerCase();

        for (const field in this.fieldMap) {
            if (this.fieldMap[field].some(k => key.includes(k))) {
                return field;
            }
        }
        return "body"; // fallback
    },

    /* Auto-fill template with user data */
    applyAutoFill(templateStructure, userData) {
        const filled = JSON.parse(JSON.stringify(templateStructure));

        filled.forEach(node => {
            if (node.type === "text") {
                const match = Object.keys(userData).find(key =>
                    this.matchField(key) === this.matchField(node.role || "body")
                );

                if (match) {
                    node.content = userData[match];
                }
            }

            if (node.type === "image") {
                const match = Object.keys(userData).find(key =>
                    this.matchField(key) === "image"
                );

                if (match) {
                    node.src = userData[match];
                }
            }
        });

        return filled;
    },

    /* Replace text in existing canvas */
    replaceTextOnCanvas(userData) {
        $$("[data-text]").forEach(el => {
            const role = el.dataset.role || "body";
            const match = Object.keys(userData).find(key =>
                this.matchField(key) === this.matchField(role)
            );

            if (match) {
                el.innerText = userData[match];
                TextEngine.autoResize(el);
            }
        });

        EventBus.emit("ai:replaceText", userData);
    },

    /* Suggest images (placeholder logic) */
    suggestImage(keyword) {
        EventBus.emit("ai:imageSuggestion", {
            keyword,
            suggestions: [
                `https://source.unsplash.com/600x600/?${keyword}`,
                `https://source.unsplash.com/600x600/?${keyword},abstract`,
                `https://source.unsplash.com/600x600/?${keyword},texture`
            ]
        });
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("ai:autoFillTemplate", ({ template, data }) => {
            const filled = this.applyAutoFill(template.structure, data);
            Templates.applyTemplate({ ...template, structure: filled });
        });

        EventBus.on("ai:replaceText", (data) => {
            this.replaceTextOnCanvas(data);
        });

        EventBus.on("ai:suggestImages", (keyword) => {
            this.suggestImage(keyword);
        });
    },

    init() {
        this.bindEvents();
        log("AI Auto-Fill engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAutoFill.init();
});
/* ---------------------------------------------------------
   SECTION 54 — LAYOUT INTELLIGENCE ENGINE
   Auto-layout, smart spacing, responsive blocks
--------------------------------------------------------- */

const LayoutEngine = {
    layoutCounter: 0,

    /* Create an auto-layout container */
    createAutoLayout(x, y, direction = "vertical") {
        const el = document.createElement("div");
        el.className = "auto-layout-container";
        el.dataset.transform = "true";
        el.dataset.layout = "true";
        el.dataset.layoutId = "layout-" + (++this.layoutCounter);
        el.dataset.direction = direction;

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.display = "flex";
        el.style.flexDirection = direction === "horizontal" ? "row" : "column";
        el.style.gap = "16px";
        el.style.padding = "20px";
        el.style.background = "rgba(255,255,255,0.05)";
        el.style.border = "1px solid rgba(255,255,255,0.1)";
        el.style.borderRadius = "12px";

        document.body.appendChild(el);

        EventBus.emit("layout:create", el);
        return el;
    },

    /* Add element to layout container */
    addToLayout(layout, el) {
        if (!layout || !layout.dataset.layout) return;

        // Convert absolute position to relative inside layout
        const rect = layout.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        el.style.left = "0px";
        el.style.top = "0px";
        el.style.position = "relative";

        layout.appendChild(el);

        this.updateLayout(layout);
        EventBus.emit("layout:add", { layout, el });
    },

    /* Update layout (smart spacing + responsive sizing) */
    updateLayout(layout) {
        if (!layout) return;

        const direction = layout.dataset.direction;
        const children = Array.from(layout.children);

        // Smart spacing: detect average gap
        if (children.length > 1) {
            const gaps = [];

            for (let i = 1; i < children.length; i++) {
                const prev = children[i - 1].getBoundingClientRect();
                const curr = children[i].getBoundingClientRect();

                const gap = direction === "horizontal"
                    ? curr.left - prev.right
                    : curr.top - prev.bottom;

                if (gap > 0) gaps.push(gap);
            }

            if (gaps.length > 0) {
                const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
                layout.style.gap = Math.round(avg) + "px";
            }
        }

        // Responsive block sizing
        children.forEach(child => {
            if (direction === "horizontal") {
                child.style.height = "auto";
            } else {
                child.style.width = "auto";
            }
        });

        EventBus.emit("layout:update", layout);
    },

    /* Convert selected elements into auto-layout */
    wrapSelection(direction = "vertical") {
        const selected = Selection.get();
        if (selected.length <= 1) {
            Toast.error("Select 2 or more items to create auto-layout");
            return;
        }

        // Compute bounding box
        const rects = selected.map(el => el.getBoundingClientRect());
        const minX = Math.min(...rects.map(r => r.left));
        const minY = Math.min(...rects.map(r => r.top));

        const layout = this.createAutoLayout(minX, minY, direction);

        selected.forEach(el => {
            this.addToLayout(layout, el);
        });

        Selection.clear();
        Selection.select(layout);

        EventBus.emit("layout:wrap", layout);
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Vertical auto-layout
        Shortcuts.register("alt+v", () => {
            this.wrapSelection("vertical");
        });

        // Horizontal auto-layout
        Shortcuts.register("alt+h", () => {
            this.wrapSelection("horizontal");
        });
    },

    /* Bind transform updates */
    bindEvents() {
        EventBus.on("transform:end", (el) => {
            const parent = el.parentElement;
            if (parent && parent.dataset.layout) {
                this.updateLayout(parent);
            }
        });
    },

    init() {
        this.bindShortcuts();
        this.bindEvents();
        log("Layout Intelligence engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    LayoutEngine.init();
});
/* ---------------------------------------------------------
   SECTION 55 — RESPONSIVE RESIZE ENGINE
   Adaptive scaling, constraint logic, smart anchors
--------------------------------------------------------- */

const ResponsiveResize = {
    /* Default constraints for new elements */
    defaultConstraints: {
        horizontal: "left",   // left | right | center | stretch
        vertical: "top"       // top | bottom | center | stretch
    },

    /* Apply constraints to an element */
    setConstraints(el, constraints) {
        el.dataset.constraintH = constraints.horizontal || "left";
        el.dataset.constraintV = constraints.vertical || "top";

        EventBus.emit("responsive:setConstraints", { el, constraints });
    },

    /* Compute new position/size based on constraints */
    applyConstraints(el, oldCanvas, newCanvas) {
        const rect = el.getBoundingClientRect();

        const dx = newCanvas.width - oldCanvas.width;
        const dy = newCanvas.height - oldCanvas.height;

        const h = el.dataset.constraintH || "left";
        const v = el.dataset.constraintV || "top";

        let newLeft = parseFloat(el.style.left);
        let newTop = parseFloat(el.style.top);
        let newWidth = rect.width;
        let newHeight = rect.height;

        /* Horizontal constraints */
        if (h === "right") {
            newLeft += dx;
        } else if (h === "center") {
            newLeft += dx / 2;
        } else if (h === "stretch") {
            newWidth += dx;
        }

        /* Vertical constraints */
        if (v === "bottom") {
            newTop += dy;
        } else if (v === "center") {
            newTop += dy / 2;
        } else if (v === "stretch") {
            newHeight += dy;
        }

        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
        el.style.width = newWidth + "px";
        el.style.height = newHeight + "px";

        EventBus.emit("responsive:apply", el);
    },

    /* Apply constraints to all elements */
    applyAll(oldCanvas, newCanvas) {
        $$("[data-transform]").forEach(el => {
            this.applyConstraints(el, oldCanvas, newCanvas);
        });
    },

    /* Bind canvas resize event */
    bindCanvasResize() {
        let lastSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        window.addEventListener("resize", () => {
            const newSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            this.applyAll(lastSize, newSize);
            lastSize = newSize;

            EventBus.emit("responsive:canvasResize", newSize);
        });
    },

    /* Bind shortcut to set constraints */
    bindShortcuts() {
        // Pin left
        Shortcuts.register("alt+1", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { horizontal: "left" });
        });

        // Pin right
        Shortcuts.register("alt+2", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { horizontal: "right" });
        });

        // Center horizontally
        Shortcuts.register("alt+3", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { horizontal: "center" });
        });

        // Stretch horizontally
        Shortcuts.register("alt+4", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { horizontal: "stretch" });
        });

        // Pin top
        Shortcuts.register("alt+5", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { vertical: "top" });
        });

        // Pin bottom
        Shortcuts.register("alt+6", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { vertical: "bottom" });
        });

        // Center vertically
        Shortcuts.register("alt+7", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { vertical: "center" });
        });

        // Stretch vertically
        Shortcuts.register("alt+8", () => {
            const el = Selection.get()[0];
            if (el) this.setConstraints(el, { vertical: "stretch" });
        });
    },

    init() {
        this.bindCanvasResize();
        this.bindShortcuts();
        log("Responsive Resize engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ResponsiveResize.init();
});
/* ---------------------------------------------------------
   SECTION 56 — MULTI-PAGE ENGINE
   Pages, thumbnails, navigation, page-level layers
--------------------------------------------------------- */

const Pages = {
    pages: [],
    currentPage: null,
    panel: null,
    list: null,
    pageCounter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "page-panel";
        panel.className = "page-panel";

        panel.innerHTML = `
            <div class="page-header">
                <div class="page-title">Pages</div>
                <button id="add-page-btn">+</button>
            </div>
            <div class="page-list" id="page-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#page-list");

        $("#add-page-btn").addEventListener("click", () => this.addPage());
    },

    /* Create a new page */
    addPage() {
        const id = "page-" + (++this.pageCounter);

        const page = {
            id,
            elements: [],
            thumbnail: null
        };

        this.pages.push(page);

        this.renderPageThumbnail(page);
        this.switchToPage(page);

        EventBus.emit("pages:add", page);
    },

    /* Render thumbnail */
    async renderPageThumbnail(page) {
        const item = document.createElement("div");
        item.className = "page-item";
        item.dataset.pageId = page.id;

        item.innerHTML = `
            <div class="page-thumb"></div>
            <div class="page-label">${page.id}</div>
        `;

        item.addEventListener("click", () => {
            this.switchToPage(page);
        });

        this.list.appendChild(item);
    },

    /* Switch to a page */
    switchToPage(page) {
        if (this.currentPage) {
            this.savePageState(this.currentPage);
        }

        this.currentPage = page;

        // Clear canvas
        $$("[data-transform]").forEach(el => el.remove());

        // Restore elements
        page.elements.forEach(node => {
            const el = this.restoreElement(node);
            if (el) document.body.appendChild(el);
        });

        this.highlightActivePage(page);

        EventBus.emit("pages:switch", page);
    },

    /* Save current page state */
    savePageState(page) {
        const nodes = [];

        $$("[data-transform]").forEach(el => {
            nodes.push(this.serializeElement(el));
        });

        page.elements = nodes;
        EventBus.emit("pages:save", page);
    },

    /* Serialize element */
    serializeElement(el) {
        return {
            type: el.dataset.text ? "text" :
                  el.dataset.image ? "image" :
                  el.dataset.shape ? "shape" : "unknown",

            html: el.outerHTML
        };
    },

    /* Restore element from saved HTML */
    restoreElement(node) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = node.html.trim();
        return wrapper.firstChild;
    },

    /* Highlight active page */
    highlightActivePage(page) {
        $$(".page-item").forEach(item => {
            item.classList.toggle("active", item.dataset.pageId === page.id);
        });
    },

    /* Delete a page */
    deletePage(page) {
        if (this.pages.length <= 1) {
            Toast.error("Cannot delete the only page");
            return;
        }

        const index = this.pages.indexOf(page);
        this.pages.splice(index, 1);

        // Remove thumbnail
        const thumb = $(`.page-item[data-page-id="${page.id}"]`);
        if (thumb) thumb.remove();

        // Switch to previous or next page
        const newPage = this.pages[index - 1] || this.pages[index];
        this.switchToPage(newPage);

        EventBus.emit("pages:delete", page);
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // New page
        Shortcuts.register("ctrl+n", () => this.addPage());
        Shortcuts.register("meta+n", () => this.addPage());

        // Delete page
        Shortcuts.register("ctrl+backspace", () => {
            if (this.currentPage) this.deletePage(this.currentPage);
        });
    },

    init() {
        this.buildUI();
        this.bindShortcuts();
        this.addPage(); // Start with one page

        log("Multi-Page engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Pages.init();
});
/* ---------------------------------------------------------
   SECTION 57 — LAYER PANEL ENGINE
   Layer list, reorder, hide/show, lock/unlock
--------------------------------------------------------- */

const LayerPanel = {
    panel: null,
    list: null,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "layer-panel";
        panel.className = "layer-panel";

        panel.innerHTML = `
            <div class="layer-header">Layers</div>
            <div id="layer-list" class="layer-list"></div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
        this.list = $("#layer-list");

        this.bindDragEvents();
    },

    /* Refresh layer list */
    refresh() {
        this.list.innerHTML = "";

        const elements = Array.from($$("[data-transform]")).reverse(); 
        // Reverse so topmost appears first

        elements.forEach(el => {
            const item = document.createElement("div");
            item.className = "layer-item";
            item.dataset.targetId = el.dataset.transformId || this.assignId(el);

            item.innerHTML = `
                <div class="layer-name">${this.getLabel(el)}</div>
                <div class="layer-controls">
                    <button class="layer-eye">${el.style.display === "none" ? "👁️‍🗨️" : "👁️"}</button>
                    <button class="layer-lock">${el.dataset.locked ? "🔒" : "🔓"}</button>
                </div>
            `;

            /* Select element when clicking layer */
            item.addEventListener("click", () => {
                Selection.clear();
                Selection.select(el);
            });

            /* Hide/Show */
            item.querySelector(".layer-eye").addEventListener("click", (e) => {
                e.stopPropagation();
                el.style.display = el.style.display === "none" ? "block" : "none";
                this.refresh();
                EventBus.emit("layers:toggleVisibility", el);
            });

            /* Lock/Unlock */
            item.querySelector(".layer-lock").addEventListener("click", (e) => {
                e.stopPropagation();
                el.dataset.locked = el.dataset.locked ? "" : "true";
                this.refresh();
                EventBus.emit("layers:toggleLock", el);
            });

            /* Enable drag */
            item.draggable = true;

            this.list.appendChild(item);
        });
    },

    /* Assign unique ID if missing */
    assignId(el) {
        const id = "layer-" + Math.random().toString(36).substr(2, 9);
        el.dataset.transformId = id;
        return id;
    },

    /* Get label for element */
    getLabel(el) {
        if (el.dataset.text) return "Text";
        if (el.dataset.image) return "Image";
        if (el.dataset.shape) return "Shape";
        if (el.dataset.layout) return "Layout";
        return "Element";
    },

    /* Drag + reorder layers */
    bindDragEvents() {
        let dragged = null;

        this.list.addEventListener("dragstart", (e) => {
            dragged = e.target;
            e.target.classList.add("dragging");
        });

        this.list.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
            dragged = null;
        });

        this.list.addEventListener("dragover", (e) => {
            e.preventDefault();
            const after = this.getDragAfterElement(e.clientY);
            if (after == null) {
                this.list.appendChild(dragged);
            } else {
                this.list.insertBefore(dragged, after);
            }
        });

        this.list.addEventListener("drop", () => {
            this.applyReorder();
        });
    },

    /* Determine drop position */
    getDragAfterElement(y) {
        const items = [...this.list.querySelectorAll(".layer-item:not(.dragging)")];

        return items.find(item => {
            const box = item.getBoundingClientRect();
            return y < box.top + box.height / 2;
        });
    },

    /* Apply reorder to canvas */
    applyReorder() {
        const items = [...this.list.querySelectorAll(".layer-item")];

        // Reverse again because DOM order = back-to-front
        items.reverse().forEach(item => {
            const id = item.dataset.targetId;
            const el = $$(`[data-transform-id="${id}"]`)[0];
            if (el) document.body.appendChild(el);
        });

        EventBus.emit("layers:reorder");
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("transform:create", () => this.refresh());
        EventBus.on("transform:delete", () => this.refresh());
        EventBus.on("transform:update", () => this.refresh());
        EventBus.on("pages:switch", () => this.refresh());
    },

    init() {
        this.buildUI();
        this.bindEvents();
        this.refresh();

        log("Layer Panel engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    LayerPanel.init();
});
/* ---------------------------------------------------------
   SECTION 58 — EXPORT ENGINE
   PNG, JPG, SVG, PDF, multi-page export
--------------------------------------------------------- */

const ExportEngine = {
    /* Capture a single page as canvas */
    async capturePage() {
        const canvas = await html2canvas(document.body, {
            backgroundColor: null,
            scale: 2
        });
        return canvas;
    },

    /* Export PNG */
    async exportPNG() {
        const canvas = await this.capturePage();
        const link = document.createElement("a");
        link.download = "mystic-design.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        EventBus.emit("export:png");
    },

    /* Export JPG */
    async exportJPG() {
        const canvas = await this.capturePage();
        const link = document.createElement("a");
        link.download = "mystic-design.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.92);
        link.click();

        EventBus.emit("export:jpg");
    },

    /* Export SVG (DOM → SVG wrapper) */
    exportSVG() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${window.innerHeight}">
                <foreignObject width="100%" height="100%">
                    ${new XMLSerializer().serializeToString(document.body)}
                </foreignObject>
            </svg>
        `;

        const blob = new Blob([svg], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.download = "mystic-design.svg";
        link.href = URL.createObjectURL(blob);
        link.click();

        EventBus.emit("export:svg");
    },

    /* Export PDF (multi-page aware) */
    async exportPDF() {
        const pdf = new jspdf.jsPDF("p", "pt", "a4");

        for (let i = 0; i < Pages.pages.length; i++) {
            Pages.switchToPage(Pages.pages[i]);

            const canvas = await this.capturePage();
            const img = canvas.toDataURL("image/png");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);

            if (i < Pages.pages.length - 1) pdf.addPage();
        }

        pdf.save("mystic-design.pdf");

        EventBus.emit("export:pdf");
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("ctrl+e", () => this.exportPNG());
        Shortcuts.register("meta+e", () => this.exportPNG());

        Shortcuts.register("ctrl+shift+e", () => this.exportPDF());
        Shortcuts.register("meta+shift+e", () => this.exportPDF());
    },

    /* Bind command palette hooks */
    bindCommands() {
        CommandPalette.register("Export PNG", () => this.exportPNG());
        CommandPalette.register("Export JPG", () => this.exportJPG());
        CommandPalette.register("Export SVG", () => this.exportSVG());
        CommandPalette.register("Export PDF", () => this.exportPDF());
    },

    init() {
        this.bindShortcuts();
        this.bindCommands();
        log("Export engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ExportEngine.init();
});
/* ---------------------------------------------------------
   SECTION 59 — COMMENTING & COLLAB ENGINE
   Live comments, mentions, threads, pins
--------------------------------------------------------- */

const Comments = {
    comments: [], // { id, x, y, text, resolved, replies: [] }
    panel: null,
    thread: null,
    activeComment: null,
    counter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "comment-thread";
        panel.className = "comment-thread hidden";

        panel.innerHTML = `
            <div class="comment-header">
                <div class="comment-title">Comments</div>
                <button id="close-comments">×</button>
            </div>
            <div id="comment-messages" class="comment-messages"></div>
            <div class="comment-input-row">
                <input id="comment-input" class="comment-input" placeholder="Reply..." />
                <button id="comment-send">Send</button>
            </div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.thread = $("#comment-messages");

        $("#close-comments").addEventListener("click", () => this.hideThread());
        $("#comment-send").addEventListener("click", () => this.sendReply());
    },

    /* Create a pinned comment marker */
    createPin(x, y, comment) {
        const pin = document.createElement("div");
        pin.className = "comment-pin";
        pin.dataset.commentId = comment.id;

        pin.style.left = x + "px";
        pin.style.top = y + "px";

        pin.innerText = "💬";

        pin.addEventListener("click", () => {
            this.openThread(comment);
        });

        document.body.appendChild(pin);
    },

    /* Add a new comment */
    addComment(x, y, text) {
        const id = "comment-" + (++this.counter);

        const comment = {
            id,
            x,
            y,
            text,
            resolved: false,
            replies: []
        };

        this.comments.push(comment);
        this.createPin(x, y, comment);

        EventBus.emit("comments:add", comment);
        return comment;
    },

    /* Open thread panel */
    openThread(comment) {
        this.activeComment = comment;
        this.refreshThread();
        this.panel.classList.remove("hidden");

        EventBus.emit("comments:openThread", comment);
    },

    /* Hide thread panel */
    hideThread() {
        this.panel.classList.add("hidden");
        this.activeComment = null;
    },

    /* Refresh thread UI */
    refreshThread() {
        if (!this.activeComment) return;

        this.thread.innerHTML = "";

        const main = document.createElement("div");
        main.className = "comment-main";
        main.innerHTML = `
            <div class="comment-text">${this.formatMentions(this.activeComment.text)}</div>
            <div class="comment-meta">${this.activeComment.resolved ? "Resolved" : "Open"}</div>
        `;
        this.thread.appendChild(main);

        this.activeComment.replies.forEach(reply => {
            const el = document.createElement("div");
            el.className = "comment-reply";
            el.innerHTML = this.formatMentions(reply);
            this.thread.appendChild(el);
        });
    },

    /* Format @mentions */
    formatMentions(text) {
        return text.replace(/@(\w+)/g, `<span class="mention">@$1</span>`);
    },

    /* Send reply */
    sendReply() {
        if (!this.activeComment) return;

        const input = $("#comment-input");
        const text = input.value.trim();
        if (!text) return;

        this.activeComment.replies.push(text);
        input.value = "";

        this.refreshThread();
        EventBus.emit("comments:reply", { comment: this.activeComment, text });
    },

    /* Resolve comment */
    resolve(comment) {
        comment.resolved = true;
        this.refreshThread();
        EventBus.emit("comments:resolve", comment);
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Add comment at cursor
        Shortcuts.register("c", () => {
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            const text = prompt("New comment:");
            if (text) this.addComment(x, y, text);
        });
    },

    init() {
        this.buildUI();
        this.bindShortcuts();
        log("Commenting & Collaboration engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Comments.init();
});
/* ---------------------------------------------------------
   SECTION 60 — REAL-TIME COLLAB ENGINE
   Presence, live cursors, sync, broadcast events
--------------------------------------------------------- */

const RealTime = {
    socket: null,
    userId: "user-" + Math.random().toString(36).substr(2, 9),
    userName: "Guest",
    cursorColor: null,
    cursors: {}, // { userId: { el, x, y, name, color } }

    /* Connect to server (placeholder) */
    connect() {
        // Placeholder WebSocket (replace with real server)
        this.socket = {
            send: (msg) => EventBus.emit("realtime:mockSend", msg)
        };

        EventBus.on("realtime:mockSend", (msg) => {
            // Loopback for demo
            this.receive(JSON.parse(msg));
        });

        this.cursorColor = this.randomColor();
        this.broadcastPresence();
    },

    /* Broadcast presence */
    broadcastPresence() {
        this.send({
            type: "presence",
            userId: this.userId,
            name: this.userName,
            color: this.cursorColor
        });
    },

    /* Send message */
    send(data) {
        this.socket.send(JSON.stringify(data));
    },

    /* Receive message */
    receive(data) {
        if (data.userId === this.userId) return;

        switch (data.type) {
            case "presence":
                this.addCursor(data);
                break;

            case "cursor":
                this.updateCursor(data);
                break;

            case "transform":
                this.applyRemoteTransform(data);
                break;

            case "text":
                this.applyRemoteText(data);
                break;
        }
    },

    /* Add collaborator cursor */
    addCursor({ userId, name, color }) {
        if (this.cursors[userId]) return;

        const el = document.createElement("div");
        el.className = "live-cursor";
        el.style.borderColor = color;

        const label = document.createElement("div");
        label.className = "live-cursor-label";
        label.innerText = name;
        label.style.background = color;

        el.appendChild(label);
        document.body.appendChild(el);

        this.cursors[userId] = { el, x: 0, y: 0, name, color };
    },

    /* Update collaborator cursor */
    updateCursor({ userId, x, y }) {
        const cursor = this.cursors[userId];
        if (!cursor) return;

        cursor.x = x;
        cursor.y = y;

        cursor.el.style.left = x + "px";
        cursor.el.style.top = y + "px";
    },

    /* Apply remote transform */
    applyRemoteTransform({ targetId, left, top, width, height }) {
        const el = $$(`[data-transform-id="${targetId}"]`)[0];
        if (!el) return;

        el.style.left = left + "px";
        el.style.top = top + "px";
        if (width) el.style.width = width + "px";
        if (height) el.style.height = height + "px";
    },

    /* Apply remote text update */
    applyRemoteText({ targetId, text }) {
        const el = $$(`[data-transform-id="${targetId}"]`)[0];
        if (!el || !el.dataset.text) return;

        el.innerText = text;
        TextEngine.autoResize(el);
    },

    /* Broadcast cursor movement */
    bindCursorTracking() {
        document.addEventListener("mousemove", (e) => {
            this.send({
                type: "cursor",
                userId: this.userId,
                x: e.clientX,
                y: e.clientY
            });
        });
    },

    /* Broadcast transforms */
    bindTransformSync() {
        EventBus.on("transform:end", (el) => {
            this.send({
                type: "transform",
                userId: this.userId,
                targetId: el.dataset.transformId,
                left: parseFloat(el.style.left),
                top: parseFloat(el.style.top),
                width: parseFloat(el.style.width),
                height: parseFloat(el.style.height)
            });
        });
    },

    /* Broadcast text edits */
    bindTextSync() {
        EventBus.on("text:change", (el) => {
            this.send({
                type: "text",
                userId: this.userId,
                targetId: el.dataset.transformId,
                text: el.innerText
            });
        });
    },

    /* Random cursor color */
    randomColor() {
        const colors = ["#ff00e6", "#6a00ff", "#00e1ff", "#ff9a00", "#00ff88"];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    init() {
        this.connect();
        this.bindCursorTracking();
        this.bindTransformSync();
        this.bindTextSync();

        log("Real-Time Collaboration engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    RealTime.init();
});
/* ---------------------------------------------------------
   SECTION 61 — VERSIONING ENGINE
   Snapshots, named versions, restore points, compare states
--------------------------------------------------------- */

const Versioning = {
    versions: [], // { id, name, timestamp, pages, meta }
    panel: null,
    list: null,
    counter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "version-panel";
        panel.className = "version-panel hidden";

        panel.innerHTML = `
            <div class="version-header">
                <div class="version-title">Versions</div>
                <button id="close-versions">×</button>
            </div>
            <div id="version-list" class="version-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#version-list");

        $("#close-versions").addEventListener("click", () => this.toggle());
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Create a snapshot of all pages */
    snapshot(name = null) {
        const id = "version-" + (++this.counter);

        const pages = Pages.pages.map(page => ({
            id: page.id,
            elements: page.elements.map(el => ({ ...el }))
        }));

        const version = {
            id,
            name: name || `Snapshot ${this.counter}`,
            timestamp: new Date().toLocaleString(),
            pages,
            meta: {
                author: RealTime.userName,
                cursorColor: RealTime.cursorColor
            }
        };

        this.versions.push(version);
        this.renderVersion(version);

        EventBus.emit("version:create", version);
    },

    /* Render version entry */
    renderVersion(version) {
        const item = document.createElement("div");
        item.className = "version-item";

        item.innerHTML = `
            <div class="version-name">${version.name}</div>
            <div class="version-meta">${version.timestamp}</div>
            <button class="version-restore">Restore</button>
            <button class="version-compare">Compare</button>
        `;

        /* Restore version */
        item.querySelector(".version-restore").addEventListener("click", () => {
            this.restore(version);
        });

        /* Compare version */
        item.querySelector(".version-compare").addEventListener("click", () => {
            this.compare(version);
        });

        this.list.appendChild(item);
    },

    /* Restore a version */
    restore(version) {
        Pages.pages = version.pages.map(p => ({
            id: p.id,
            elements: p.elements.map(el => ({ ...el }))
        }));

        Pages.switchToPage(Pages.pages[0]);

        EventBus.emit("version:restore", version);
        Toast.info(`Restored: ${version.name}`);
    },

    /* Compare version to current */
    compare(version) {
        const diffs = [];

        version.pages.forEach((vPage, i) => {
            const cPage = Pages.pages[i];
            if (!cPage) return;

            const vEls = vPage.elements.map(e => e.html).join("");
            const cEls = cPage.elements.map(e => e.html).join("");

            if (vEls !== cEls) {
                diffs.push({
                    page: vPage.id,
                    changed: true
                });
            }
        });

        EventBus.emit("version:compare", diffs);

        if (diffs.length === 0) {
            Toast.info("No differences found");
        } else {
            Toast.info(`${diffs.length} page(s) changed`);
        }
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Create snapshot
        Shortcuts.register("ctrl+s", () => this.snapshot());
        Shortcuts.register("meta+s", () => this.snapshot());

        // Open version panel
        Shortcuts.register("ctrl+shift+s", () => this.toggle());
        Shortcuts.register("meta+shift+s", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcuts();

        // Create initial snapshot
        this.snapshot("Initial Version");

        log("Versioning engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Versioning.init();
});
/* ---------------------------------------------------------
   SECTION 61 — VERSIONING ENGINE
   Snapshots, named versions, restore points, compare states
--------------------------------------------------------- */

const Versioning = {
    versions: [], // { id, name, timestamp, pages, meta }
    panel: null,
    list: null,
    counter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "version-panel";
        panel.className = "version-panel hidden";

        panel.innerHTML = `
            <div class="version-header">
                <div class="version-title">Versions</div>
                <button id="close-versions">×</button>
            </div>
            <div id="version-list" class="version-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#version-list");

        $("#close-versions").addEventListener("click", () => this.toggle());
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Create a snapshot of all pages */
    snapshot(name = null) {
        const id = "version-" + (++this.counter);

        const pages = Pages.pages.map(page => ({
            id: page.id,
            elements: page.elements.map(el => ({ ...el }))
        }));

        const version = {
            id,
            name: name || `Snapshot ${this.counter}`,
            timestamp: new Date().toLocaleString(),
            pages,
            meta: {
                author: RealTime.userName,
                cursorColor: RealTime.cursorColor
            }
        };

        this.versions.push(version);
        this.renderVersion(version);

        EventBus.emit("version:create", version);
    },

    /* Render version entry */
    renderVersion(version) {
        const item = document.createElement("div");
        item.className = "version-item";

        item.innerHTML = `
            <div class="version-name">${version.name}</div>
            <div class="version-meta">${version.timestamp}</div>
            <button class="version-restore">Restore</button>
            <button class="version-compare">Compare</button>
        `;

        /* Restore version */
        item.querySelector(".version-restore").addEventListener("click", () => {
            this.restore(version);
        });

        /* Compare version */
        item.querySelector(".version-compare").addEventListener("click", () => {
            this.compare(version);
        });

        this.list.appendChild(item);
    },

    /* Restore a version */
    restore(version) {
        Pages.pages = version.pages.map(p => ({
            id: p.id,
            elements: p.elements.map(el => ({ ...el }))
        }));

        Pages.switchToPage(Pages.pages[0]);

        EventBus.emit("version:restore", version);
        Toast.info(`Restored: ${version.name}`);
    },

    /* Compare version to current */
    compare(version) {
        const diffs = [];

        version.pages.forEach((vPage, i) => {
            const cPage = Pages.pages[i];
            if (!cPage) return;

            const vEls = vPage.elements.map(e => e.html).join("");
            const cEls = cPage.elements.map(e => e.html).join("");

            if (vEls !== cEls) {
                diffs.push({
                    page: vPage.id,
                    changed: true
                });
            }
        });

        EventBus.emit("version:compare", diffs);

        if (diffs.length === 0) {
            Toast.info("No differences found");
        } else {
            Toast.info(`${diffs.length} page(s) changed`);
        }
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Create snapshot
        Shortcuts.register("ctrl+s", () => this.snapshot());
        Shortcuts.register("meta+s", () => this.snapshot());

        // Open version panel
        Shortcuts.register("ctrl+shift+s", () => this.toggle());
        Shortcuts.register("meta+shift+s", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcuts();

        // Create initial snapshot
        this.snapshot("Initial Version");

        log("Versioning engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Versioning.init();
});
/* ---------------------------------------------------------
   SECTION 62 — PERFORMANCE ENGINE
   Render queue, lazy layers, GPU hints, frame budgeting
--------------------------------------------------------- */

const PerformanceEngine = {
    queue: [],
    running: false,
    frameBudget: 6, // ms per frame for queued tasks

    /* Add a task to the render queue */
    enqueue(task, priority = 1) {
        this.queue.push({ task, priority });
        this.queue.sort((a, b) => b.priority - a.priority);

        if (!this.running) this.runQueue();
    },

    /* Run queue with frame budgeting */
    runQueue() {
        this.running = true;

        requestAnimationFrame(() => {
            const start = performance.now();

            while (this.queue.length > 0) {
                const next = this.queue.shift();
                next.task();

                if (performance.now() - start > this.frameBudget) {
                    break;
                }
            }

            if (this.queue.length > 0) {
                this.runQueue();
            } else {
                this.running = false;
            }
        });
    },

    /* Apply GPU acceleration hints */
    accelerate(el) {
        el.style.willChange = "transform, opacity";
        el.style.transform = "translateZ(0)";
    },

    /* Lazy render elements outside viewport */
    lazyRender() {
        const viewport = {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth
        };

        $$("[data-transform]").forEach(el => {
            const rect = el.getBoundingClientRect();

            const visible =
                rect.bottom > viewport.top &&
                rect.top < viewport.bottom &&
                rect.right > viewport.left &&
                rect.left < viewport.right;

            if (visible) {
                el.style.opacity = "1";
                el.style.pointerEvents = "auto";
            } else {
                el.style.opacity = "0";
                el.style.pointerEvents = "none";
            }
        });
    },

    /* Bind scroll + resize for lazy rendering */
    bindLazyEvents() {
        window.addEventListener("scroll", () => this.lazyRender());
        window.addEventListener("resize", () => this.lazyRender());
    },

    /* Batch DOM updates for transforms */
    bindTransformBatching() {
        EventBus.on("transform:update", (el) => {
            this.enqueue(() => {
                this.accelerate(el);
            }, 2);
        });

        EventBus.on("transform:end", (el) => {
            this.enqueue(() => {
                el.style.willChange = "auto";
            }, 1);
        });
    },

    /* Batch text updates */
    bindTextBatching() {
        EventBus.on("text:change", (el) => {
            this.enqueue(() => {
                TextEngine.autoResize(el);
            }, 3);
        });
    },

    /* Batch image filter updates */
    bindImageBatching() {
        EventBus.on("image:filter", (el) => {
            this.enqueue(() => {
                el.style.willChange = "filter";
            }, 2);
        });
    },

    init() {
        this.bindLazyEvents();
        this.bindTransformBatching();
        this.bindTextBatching();
        this.bindImageBatching();

        this.lazyRender();

        log("Performance engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    PerformanceEngine.init();
});
/* ---------------------------------------------------------
   SECTION 63 — ACCESSIBILITY ENGINE
   ARIA roles, keyboard navigation, focus rings, screen reader labels
--------------------------------------------------------- */

const Accessibility = {
    /* Apply ARIA roles to UI panels */
    applyRoles() {
        const panels = [
            { selector: "#layer-panel", role: "region", label: "Layer Panel" },
            { selector: "#page-panel", role: "region", label: "Page Panel" },
            { selector: "#asset-library", role: "region", label: "Asset Library" },
            { selector: "#template-panel", role: "region", label: "Template Panel" },
            { selector: "#shortcut-panel", role: "dialog", label: "Keyboard Shortcuts" },
            { selector: "#command-palette", role: "dialog", label: "Command Palette" },
            { selector: "#comment-thread", role: "dialog", label: "Comment Thread" },
            { selector: "#version-panel", role: "dialog", label: "Version History" }
        ];

        panels.forEach(p => {
            const el = document.querySelector(p.selector);
            if (el) {
                el.setAttribute("role", p.role);
                el.setAttribute("aria-label", p.label);
            }
        });
    },

    /* Add focus rings to interactive elements */
    applyFocusStyles() {
        const style = document.createElement("style");
        style.innerHTML = `
            [tabindex]:focus,
            button:focus,
            input:focus,
            .layer-item:focus,
            .page-item:focus,
            .asset-item:focus,
            .template-item:focus {
                outline: 3px solid #6a00ff;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    },

    /* Make all interactive elements keyboard-focusable */
    makeFocusable() {
        const selectors = [
            "button",
            "input",
            ".layer-item",
            ".page-item",
            ".asset-item",
            ".template-item",
            ".comment-pin",
            ".timeline-item",
            ".cmd-item"
        ];

        selectors.forEach(sel => {
            $$(sel).forEach(el => {
                el.setAttribute("tabindex", "0");
            });
        });
    },

    /* Keyboard navigation for lists */
    bindListNavigation() {
        const lists = [
            ".layer-list",
            ".page-list",
            ".asset-list",
            ".template-list",
            ".cmd-list"
        ];

        lists.forEach(selector => {
            const container = document.querySelector(selector);
            if (!container) return;

            container.addEventListener("keydown", (e) => {
                const items = [...container.querySelectorAll("[tabindex]")];
                const index = items.indexOf(document.activeElement);

                if (e.key === "ArrowDown") {
                    const next = items[index + 1] || items[0];
                    next.focus();
                }

                if (e.key === "ArrowUp") {
                    const prev = items[index - 1] || items[items.length - 1];
                    prev.focus();
                }
            });
        });
    },

    /* Auto-label elements for screen readers */
    autoLabelElements() {
        $$("[data-transform]").forEach(el => {
            if (el.dataset.text) {
                el.setAttribute("role", "textbox");
                el.setAttribute("aria-label", "Text element");
            }

            if (el.dataset.image) {
                el.setAttribute("role", "img");
                el.setAttribute("aria-label", "Image element");
            }

            if (el.dataset.shape) {
                el.setAttribute("role", "graphics-symbol");
                el.setAttribute("aria-label", "Shape element");
            }

            if (el.dataset.layout) {
                el.setAttribute("role", "group");
                el.setAttribute("aria-label", "Layout container");
            }
        });
    },

    /* Bind events to update labels dynamically */
    bindDynamicUpdates() {
        EventBus.on("transform:create", (el) => this.autoLabelElements());
        EventBus.on("text:change", (el) => {
            el.setAttribute("aria-label", "Text element: " + el.innerText);
        });
    },

    init() {
        this.applyRoles();
        this.applyFocusStyles();
        this.makeFocusable();
        this.bindListNavigation();
        this.autoLabelElements();
        this.bindDynamicUpdates();

        log("Accessibility engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Accessibility.init();
});
/* ---------------------------------------------------------
   SECTION 64 — PLUGIN ENGINE
   Plugin API, sandbox, events, extensions panel
--------------------------------------------------------- */

const PluginEngine = {
    plugins: [], // { id, name, enabled, code, sandbox }
    panel: null,
    list: null,
    counter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "plugin-panel";
        panel.className = "plugin-panel hidden";

        panel.innerHTML = `
            <div class="plugin-header">
                <div class="plugin-title">Extensions</div>
                <button id="close-plugins">×</button>
            </div>
            <div id="plugin-list" class="plugin-list"></div>
            <div class="plugin-footer">
                <button id="install-plugin">Install Plugin</button>
            </div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#plugin-list");

        $("#close-plugins").addEventListener("click", () => this.toggle());
        $("#install-plugin").addEventListener("click", () => this.installPrompt());
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Install plugin via prompt */
    installPrompt() {
        const name = prompt("Plugin name:");
        const code = prompt("Paste plugin code:");

        if (name && code) {
            this.installPlugin(name, code);
        }
    },

    /* Install plugin */
    installPlugin(name, code) {
        const id = "plugin-" + (++this.counter);

        const plugin = {
            id,
            name,
            enabled: true,
            code,
            sandbox: null
        };

        this.plugins.push(plugin);
        this.renderPlugin(plugin);
        this.runPlugin(plugin);

        EventBus.emit("plugin:install", plugin);
    },

    /* Render plugin entry */
    renderPlugin(plugin) {
        const item = document.createElement("div");
        item.className = "plugin-item";

        item.innerHTML = `
            <div class="plugin-name">${plugin.name}</div>
            <button class="plugin-toggle">${plugin.enabled ? "Disable" : "Enable"}</button>
            <button class="plugin-remove">Remove</button>
        `;

        /* Enable/Disable */
        item.querySelector(".plugin-toggle").addEventListener("click", () => {
            plugin.enabled = !plugin.enabled;
            item.querySelector(".plugin-toggle").innerText = plugin.enabled ? "Disable" : "Enable";

            if (plugin.enabled) {
                this.runPlugin(plugin);
            } else {
                this.stopPlugin(plugin);
            }

            EventBus.emit("plugin:toggle", plugin);
        });

        /* Remove plugin */
        item.querySelector(".plugin-remove").addEventListener("click", () => {
            this.removePlugin(plugin);
            item.remove();
        });

        this.list.appendChild(item);
    },

    /* Remove plugin */
    removePlugin(plugin) {
        this.stopPlugin(plugin);
        this.plugins = this.plugins.filter(p => p !== plugin);

        EventBus.emit("plugin:remove", plugin);
    },

    /* Run plugin in sandbox */
    runPlugin(plugin) {
        try {
            const sandbox = {
                id: plugin.id,
                name: plugin.name,
                api: this.getAPI(),
                console: {
                    log: (...args) => console.log(`[PLUGIN ${plugin.name}]`, ...args)
                }
            };

            plugin.sandbox = sandbox;

            const fn = new Function("sandbox", plugin.code);
            fn(sandbox);

            EventBus.emit("plugin:run", plugin);
        } catch (err) {
            console.error("Plugin error:", err);
            Toast.error(`Plugin "${plugin.name}" failed to load`);
        }
    },

    /* Stop plugin */
    stopPlugin(plugin) {
        plugin.sandbox = null;
        EventBus.emit("plugin:stop", plugin);
    },

    /* Safe API exposed to plugins */
    getAPI() {
        return {
            on: (event, handler) => EventBus.on(event, handler),
            emit: (event, data) => EventBus.emit(event, data),
            select: () => Selection.get(),
            createText: (x, y, text) => TextEngine.createText(x, y, text),
            createRect: (x, y) => Shapes.createRectangle(x, y),
            createImage: (x, y, src) => ImageEngine.createImage(x, y, src),
            notify: (msg) => Toast.info(msg),
            command: (name, fn) => CommandPalette.register(name, fn)
        };
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("p", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcuts();

        log("Plugin engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    PluginEngine.init();
});
/* ---------------------------------------------------------
   SECTION 65 — MARKETPLACE ENGINE
   Template packs, plugin listings, asset packs, ratings, install flow
--------------------------------------------------------- */

const Marketplace = {
    items: [], // { id, type, name, preview, rating, installs, data }
    panel: null,
    list: null,
    counter: 0,

    /* Build UI */
    buildUI() {
        const panel = document.createElement("div");
        panel.id = "marketplace-panel";
        panel.className = "marketplace-panel hidden";

        panel.innerHTML = `
            <div class="marketplace-header">
                <div class="marketplace-title">Marketplace</div>
                <button id="close-marketplace">×</button>
            </div>
            <div id="marketplace-list" class="marketplace-list"></div>
        `;

        document.body.appendChild(panel);

        this.panel = panel;
        this.list = $("#marketplace-list");

        $("#close-marketplace").addEventListener("click", () => this.toggle());
    },

    /* Toggle panel */
    toggle() {
        this.panel.classList.toggle("hidden");
    },

    /* Register marketplace item */
    registerItem(type, name, preview, data) {
        const id = "market-" + (++this.counter);

        const item = {
            id,
            type,       // template | plugin | assetpack
            name,
            preview,
            rating: 5,
            installs: 0,
            data
        };

        this.items.push(item);
        this.renderItem(item);

        EventBus.emit("marketplace:register", item);
    },

    /* Render marketplace item */
    renderItem(item) {
        const el = document.createElement("div");
        el.className = "market-item";

        el.innerHTML = `
            <img src="${item.preview}" class="market-thumb" />
            <div class="market-info">
                <div class="market-name">${item.name}</div>
                <div class="market-meta">
                    ⭐ ${item.rating} • ${item.installs} installs
                </div>
            </div>
            <button class="market-install">Install</button>
        `;

        el.querySelector(".market-install").addEventListener("click", () => {
            this.install(item);
        });

        this.list.appendChild(el);
    },

    /* Install item */
    install(item) {
        item.installs++;

        if (item.type === "template") {
            Templates.registerTemplate(item.name, item.preview, item.data.structure);
        }

        if (item.type === "plugin") {
            PluginEngine.installPlugin(item.name, item.data.code);
        }

        if (item.type === "assetpack") {
            item.data.assets.forEach(a => AssetLibrary.addAsset(a.src, a.category));
        }

        EventBus.emit("marketplace:install", item);
        Toast.info(`Installed: ${item.name}`);

        this.refresh();
    },

    /* Refresh marketplace list */
    refresh() {
        this.list.innerHTML = "";
        this.items.forEach(item => this.renderItem(item));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        Shortcuts.register("m", () => this.toggle());
    },

    init() {
        this.buildUI();
        this.bindShortcuts();

        /* Example marketplace items */
        this.registerItem("template", "Mystic Poster Pack", "assets/market-template1.png", {
            structure: [
                { type: "text", x: 200, y: 100, content: "MAGIC", props: { fontSize: 64, fontWeight: "bold" } },
                { type: "shape", shape: "rectangle", x: 180, y: 260, style: { fill: "#6a00ff" } }
            ]
        });

        this.registerItem("plugin", "Auto Gradient Generator", "assets/market-plugin1.png", {
            code: `
                sandbox.api.command("Generate Gradient", () => {
                    const el = sandbox.api.createRect(200, 200);
                    el.style.background = "linear-gradient(135deg, #6a00ff, #ff00e6)";
                    sandbox.api.notify("Gradient created!");
                });
            `
        });

        this.registerItem("assetpack", "Mystic Texture Pack", "assets/market-assets1.png", {
            assets: [
                { src: "assets/texture1.png", category: "Textures" },
                { src: "assets/texture2.png", category: "Textures" }
            ]
        });

        log("Marketplace engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    Marketplace.init();
});
/* ---------------------------------------------------------
   SECTION 66 — CLOUD SYNC ENGINE
   User library sync, autosave, cloud storage, remote fetch
--------------------------------------------------------- */

const CloudSync = {
    endpoint: "/api/cloudsync", // placeholder
    autosaveInterval: 5000,
    lastSaved: null,
    saving: false,

    /* Serialize full project */
    serializeProject() {
        return {
            pages: Pages.pages.map(p => ({
                id: p.id,
                elements: p.elements.map(el => ({ ...el }))
            })),
            versions: Versioning.versions,
            assets: AssetLibrary.assets,
            templates: Templates.templates,
            timestamp: Date.now()
        };
    },

    /* Send data to cloud */
    async upload(data) {
        try {
            this.saving = true;

            await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            this.lastSaved = Date.now();
            this.saving = false;

            EventBus.emit("cloud:upload", data);
        } catch (err) {
            console.error("Cloud upload failed:", err);
            this.saving = false;
        }
    },

    /* Fetch project from cloud */
    async fetch() {
        try {
            const res = await fetch(this.endpoint);
            const data = await res.json();

            this.restoreProject(data);

            EventBus.emit("cloud:fetch", data);
        } catch (err) {
            console.error("Cloud fetch failed:", err);
        }
    },

    /* Restore project from cloud */
    restoreProject(data) {
        if (!data) return;

        // Restore pages
        Pages.pages = data.pages.map(p => ({
            id: p.id,
            elements: p.elements.map(el => ({ ...el }))
        }));

        Pages.switchToPage(Pages.pages[0]);

        // Restore versions
        Versioning.versions = data.versions || [];

        // Restore assets
        AssetLibrary.assets = data.assets || [];
        AssetLibrary.refreshList();

        // Restore templates
        Templates.templates = data.templates || [];
        Templates.refreshList();

        EventBus.emit("cloud:restore", data);
    },

    /* Autosave loop */
    startAutosave() {
        setInterval(() => {
            const project = this.serializeProject();
            this.upload(project);
        }, this.autosaveInterval);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("transform:end", () => this.queueSave());
        EventBus.on("text:change", () => this.queueSave());
        EventBus.on("pages:add", () => this.queueSave());
        EventBus.on("pages:delete", () => this.queueSave());
        EventBus.on("assets:add", () => this.queueSave());
        EventBus.on("template:register", () => this.queueSave());
    },

    /* Queue save (debounced) */
    queueSave() {
        if (this.saving) return;

        const project = this.serializeProject();
        this.upload(project);
    },

    init() {
        this.bindEvents();
        this.startAutosave();

        // Attempt initial cloud fetch
        this.fetch();

        log("Cloud Sync engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    CloudSync.init();
});
/* ---------------------------------------------------------
   SECTION 67 — AI COLOR ENGINE
   Palette extraction, harmonies, brand colors, semantic mapping
--------------------------------------------------------- */

const AIColor = {
    /* Extract palette from an image */
    async extractPalette(imgSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgSrc;

        await img.decode();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        const colors = {};
        for (let i = 0; i < data.length; i += 4 * 50) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const key = `${r},${g},${b}`;
            colors[key] = (colors[key] || 0) + 1;
        }

        const sorted = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([rgb]) => `rgb(${rgb})`);

        EventBus.emit("color:paletteExtracted", sorted);
        return sorted;
    },

    /* Generate color harmonies */
    harmonies(base) {
        const [r, g, b] = this.rgbToHsl(base);

        return {
            analogous: [
                this.hslToRgb(r + 20, g, b),
                this.hslToRgb(r - 20, g, b)
            ],
            complementary: [
                this.hslToRgb(r + 180, g, b)
            ],
            triadic: [
                this.hslToRgb(r + 120, g, b),
                this.hslToRgb(r + 240, g, b)
            ],
            tetradic: [
                this.hslToRgb(r + 90, g, b),
                this.hslToRgb(r + 180, g, b),
                this.hslToRgb(r + 270, g, b)
            ]
        };
    },

    /* Semantic color mapping */
    semanticMap(palette) {
        return {
            primary: palette[0],
            accent: palette[1],
            background: palette[2],
            text: palette[3] || "#ffffff"
        };
    },

    /* Recolor selected elements */
    recolorSelection(map) {
        const selected = Selection.get();
        selected.forEach(el => {
            if (el.dataset.text) {
                el.style.color = map.text;
            }
            if (el.dataset.shape) {
                el.style.background = map.primary;
            }
            if (el.dataset.image) {
                el.style.borderColor = map.accent;
            }
        });

        EventBus.emit("color:recolor", map);
    },

    /* RGB → HSL */
    rgbToHsl(rgb) {
        const m = rgb.match(/\d+/g).map(Number);
        let [r, g, b] = m.map(v => v / 255);

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h *= 60;
        }

        return [h, s, l];
    },

    /* HSL → RGB */
    hslToRgb(h, s, l) {
        h = (h % 360 + 360) % 360;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;

        if (h < 60) [r, g, b] = [c, x, 0];
        else if (h < 120) [r, g, b] = [x, c, 0];
        else if (h < 180) [r, g, b] = [0, c, x];
        else if (h < 240) [r, g, b] = [0, x, c];
        else if (h < 300) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];

        return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("color:extractFromImage", async (src) => {
            const palette = await this.extractPalette(src);
            const map = this.semanticMap(palette);
            this.recolorSelection(map);
        });

        EventBus.on("color:applyPalette", (palette) => {
            const map = this.semanticMap(palette);
            this.recolorSelection(map);
        });
    },

    init() {
        this.bindEvents();
        log("AI Color engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIColor.init();
});
/* ---------------------------------------------------------
   SECTION 68 — AI SEMANTIC ENGINE
   Object detection, text meaning, layout intent, smart grouping
--------------------------------------------------------- */

const AISemantic = {
    /* Detect object type based on element properties */
    detectObject(el) {
        if (el.dataset.text) {
            return this.classifyText(el.innerText);
        }
        if (el.dataset.image) {
            return "image";
        }
        if (el.dataset.shape) {
            return "shape";
        }
        if (el.dataset.layout) {
            return "layout-container";
        }
        return "element";
    },

    /* Classify text meaning */
    classifyText(text) {
        const t = text.trim().toLowerCase();

        if (t.length < 12) return "label";
        if (t.length < 30) return "headline";
        if (t.includes("click") || t.includes("shop") || t.includes("buy")) return "cta";
        if (t.includes("@") || t.includes("http")) return "link";
        if (t.split(" ").length > 10) return "body-text";

        return "text";
    },

    /* Infer layout intent based on structure */
    inferLayout() {
        const elements = [...$$("[data-transform]")];

        const textCount = elements.filter(el => el.dataset.text).length;
        const imageCount = elements.filter(el => el.dataset.image).length;

        if (imageCount >= 1 && textCount >= 2) return "hero-section";
        if (imageCount >= 3) return "gallery";
        if (textCount >= 5) return "article";
        if (elements.length <= 3) return "poster";

        return "generic-layout";
    },

    /* Smart grouping based on semantic meaning */
    smartGroup() {
        const elements = [...$$("[data-transform]")];

        const groups = {
            headlines: [],
            body: [],
            ctas: [],
            images: [],
            shapes: []
        };

        elements.forEach(el => {
            const type = this.detectObject(el);

            if (type === "headline") groups.headlines.push(el);
            else if (type === "body-text") groups.body.push(el);
            else if (type === "cta") groups.ctas.push(el);
            else if (type === "image") groups.images.push(el);
            else if (type === "shape") groups.shapes.push(el);
        });

        EventBus.emit("semantic:groups", groups);
        return groups;
    },

    /* Apply semantic tags to elements */
    tagElements() {
        $$("[data-transform]").forEach(el => {
            const tag = this.detectObject(el);
            el.dataset.semantic = tag;
        });

        EventBus.emit("semantic:tagged");
    },

    /* Highlight semantic groups visually */
    highlightGroups(groups) {
        Object.values(groups).flat().forEach(el => {
            el.style.outline = "2px dashed rgba(255,255,255,0.2)";
        });

        setTimeout(() => {
            Object.values(groups).flat().forEach(el => {
                el.style.outline = "none";
            });
        }, 1200);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("transform:create", () => this.tagElements());
        EventBus.on("text:change", () => this.tagElements());
        EventBus.on("semantic:highlight", () => {
            const groups = this.smartGroup();
            this.highlightGroups(groups);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Highlight semantic groups
        Shortcuts.register("alt+g", () => {
            EventBus.emit("semantic:highlight");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.tagElements();

        log("AI Semantic engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AISemantic.init();
});
/* ---------------------------------------------------------
   SECTION 69 — AI LAYOUT INTENT ENGINE
   Hero detection, card detection, grid detection, auto-structure
--------------------------------------------------------- */

const AILayoutIntent = {
    /* Detect hero section */
    detectHero(elements) {
        const largeImage = elements.find(el => el.dataset.image && el.offsetWidth > 400);
        const headline = elements.find(el => el.dataset.semantic === "headline");

        if (largeImage && headline) {
            return {
                type: "hero",
                image: largeImage,
                headline
            };
        }

        return null;
    },

    /* Detect card layout */
    detectCards(elements) {
        const cards = [];

        elements.forEach(el => {
            if (el.dataset.layout) return;

            const rect = el.getBoundingClientRect();
            const siblings = elements.filter(other => {
                if (other === el) return false;
                const r = other.getBoundingClientRect();
                return Math.abs(r.top - rect.top) < 40 && Math.abs(r.height - rect.height) < 60;
            });

            if (siblings.length >= 2) {
                cards.push([el, ...siblings]);
            }
        });

        return cards.length ? cards[0] : null;
    },

    /* Detect grid layout */
    detectGrid(elements) {
        const rows = {};

        elements.forEach(el => {
            const y = Math.round(el.getBoundingClientRect().top / 50) * 50;
            rows[y] = rows[y] || [];
            rows[y].push(el);
        });

        const rowGroups = Object.values(rows).filter(r => r.length >= 3);

        if (rowGroups.length >= 2) {
            return {
                type: "grid",
                rows: rowGroups
            };
        }

        return null;
    },

    /* Auto-structure: wrap detected layout into auto-layout container */
    autoStructure(layout) {
        if (!layout) return;

        if (layout.type === "hero") {
            const container = LayoutEngine.createAutoLayout(
                layout.image.offsetLeft - 20,
                layout.image.offsetTop - 20,
                "horizontal"
            );

            LayoutEngine.addToLayout(container, layout.image);
            LayoutEngine.addToLayout(container, layout.headline);

            EventBus.emit("layoutIntent:hero", layout);
        }

        if (layout.type === "grid") {
            const firstRow = layout.rows[0];
            const container = LayoutEngine.createAutoLayout(
                firstRow[0].offsetLeft - 20,
                firstRow[0].offsetTop - 20,
                "vertical"
            );

            layout.rows.forEach(row => {
                const rowContainer = LayoutEngine.createAutoLayout(0, 0, "horizontal");
                row.forEach(el => LayoutEngine.addToLayout(rowContainer, el));
                LayoutEngine.addToLayout(container, rowContainer);
            });

            EventBus.emit("layoutIntent:grid", layout);
        }
    },

    /* Run full detection */
    analyze() {
        const elements = [...$$("[data-transform]")];

        const hero = this.detectHero(elements);
        if (hero) return this.autoStructure(hero);

        const cards = this.detectCards(elements);
        if (cards) {
            const container = LayoutEngine.createAutoLayout(
                cards[0].offsetLeft - 20,
                cards[0].offsetTop - 20,
                "horizontal"
            );
            cards.forEach(el => LayoutEngine.addToLayout(container, el));

            EventBus.emit("layoutIntent:cards", cards);
            return;
        }

        const grid = this.detectGrid(elements);
        if (grid) return this.autoStructure(grid);

        EventBus.emit("layoutIntent:none");
    },

    /* Highlight detected layout */
    highlight(layout) {
        if (!layout) return;

        const els = [];

        if (layout.type === "hero") {
            els.push(layout.image, layout.headline);
        }

        if (layout.type === "grid") {
            layout.rows.forEach(row => els.push(...row));
        }

        els.forEach(el => {
            el.style.outline = "3px solid rgba(255,255,255,0.3)";
        });

        setTimeout(() => {
            els.forEach(el => el.style.outline = "none");
        }, 1200);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("semantic:tagged", () => this.analyze());
        EventBus.on("transform:end", () => this.analyze());
        EventBus.on("layoutIntent:highlight", () => {
            const elements = [...$$("[data-transform]")];
            const hero = this.detectHero(elements);
            const grid = this.detectGrid(elements);
            const cards = this.detectCards(elements);

            this.highlight(hero || grid || cards);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Highlight layout intent
        Shortcuts.register("alt+l", () => {
            EventBus.emit("layoutIntent:highlight");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.analyze();

        log("AI Layout Intent engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AILayoutIntent.init();
});
/* ---------------------------------------------------------
   SECTION 70 — AI AUTO-DESIGN ENGINE
   Generate layouts, auto-arrange, smart composition, visual balance
--------------------------------------------------------- */

const AIAutoDesign = {
    /* Compute visual weight of an element */
    visualWeight(el) {
        const rect = el.getBoundingClientRect();
        let weight = rect.width * rect.height;

        if (el.dataset.text) weight *= 0.6;
        if (el.dataset.image) weight *= 1.2;
        if (el.dataset.shape) weight *= 0.8;

        return weight;
    },

    /* Compute center of mass for layout */
    centerOfMass(elements) {
        let totalWeight = 0;
        let xSum = 0;
        let ySum = 0;

        elements.forEach(el => {
            const w = this.visualWeight(el);
            const rect = el.getBoundingClientRect();

            totalWeight += w;
            xSum += (rect.left + rect.width / 2) * w;
            ySum += (rect.top + rect.height / 2) * w;
        });

        return {
            x: xSum / totalWeight,
            y: ySum / totalWeight
        };
    },

    /* Score visual balance */
    balanceScore(elements) {
        const center = this.centerOfMass(elements);
        const idealX = window.innerWidth / 2;
        const idealY = window.innerHeight / 2;

        const dx = Math.abs(center.x - idealX);
        const dy = Math.abs(center.y - idealY);

        return 1 - Math.min(1, (dx + dy) / 1000);
    },

    /* Auto-arrange elements into a clean layout */
    autoArrange(elements) {
        const sorted = [...elements].sort((a, b) => {
            return this.visualWeight(b) - this.visualWeight(a);
        });

        let x = 200;
        let y = 150;

        sorted.forEach(el => {
            PerformanceEngine.enqueue(() => {
                el.style.left = x + "px";
                el.style.top = y + "px";
            }, 3);

            y += el.offsetHeight + 40;
        });

        EventBus.emit("autodesign:autoArrange", sorted);
    },

    /* Generate a layout based on detected intent */
    generateLayout() {
        const elements = [...$$("[data-transform]")];

        const intent = AILayoutIntent.inferLayout();
        const groups = AISemantic.smartGroup();

        if (intent === "hero-section") {
            this.generateHero(groups);
        } else if (intent === "gallery") {
            this.generateGallery(groups);
        } else if (intent === "article") {
            this.generateArticle(groups);
        } else {
            this.autoArrange(elements);
        }

        EventBus.emit("autodesign:generate", intent);
    },

    /* Generate hero layout */
    generateHero(groups) {
        const headline = groups.headlines[0];
        const image = groups.images[0];

        if (!headline || !image) return this.autoArrange([...$$("[data-transform]")]);

        const container = LayoutEngine.createAutoLayout(200, 150, "horizontal");

        LayoutEngine.addToLayout(container, image);
        LayoutEngine.addToLayout(container, headline);

        EventBus.emit("autodesign:hero", { headline, image });
    },

    /* Generate gallery layout */
    generateGallery(groups) {
        const images = groups.images;
        if (images.length < 3) return this.autoArrange(images);

        const container = LayoutEngine.createAutoLayout(150, 150, "grid");
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
        container.style.gap = "20px";

        images.forEach(img => LayoutEngine.addToLayout(container, img));

        EventBus.emit("autodesign:gallery", images);
    },

    /* Generate article layout */
    generateArticle(groups) {
        const container = LayoutEngine.createAutoLayout(150, 150, "vertical");

        groups.headlines.forEach(h => LayoutEngine.addToLayout(container, h));
        groups.body.forEach(b => LayoutEngine.addToLayout(container, b));
        groups.images.forEach(i => LayoutEngine.addToLayout(container, i));

        EventBus.emit("autodesign:article", groups);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("autodesign:run", () => this.generateLayout());
        EventBus.on("transform:end", () => {
            const score = this.balanceScore([...$$("[data-transform]")]);
            EventBus.emit("autodesign:balanceScore", score);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Auto-design
        Shortcuts.register("alt+d", () => {
            EventBus.emit("autodesign:run");
        });

        // Auto-arrange
        Shortcuts.register("alt+a", () => {
            this.autoArrange([...$$("[data-transform]")]);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Auto-Design engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAutoDesign.init();
});
/* ---------------------------------------------------------
   SECTION 71 — AI STORY ENGINE
   Narrative awareness, tone detection, copy suggestions, story flow
--------------------------------------------------------- */

const AIStory = {
    /* Detect tone of text */
    detectTone(text) {
        const t = text.toLowerCase();

        if (t.includes("magic") || t.includes("mystic") || t.includes("dream"))
            return "mystical";

        if (t.includes("sale") || t.includes("limited") || t.includes("now"))
            return "promotional";

        if (t.includes("welcome") || t.includes("hello"))
            return "friendly";

        if (t.includes("professional") || t.includes("services"))
            return "professional";

        if (t.length < 20)
            return "minimal";

        return "neutral";
    },

    /* Rewrite text in a given tone */
    rewrite(text, tone) {
        const base = text.trim();

        const tones = {
            mystical: `✨ ${base} — wrapped in cosmic wonder.`,
            promotional: `${base}! Don’t miss out — act now.`,
            friendly: `Hey there! ${base}`,
            professional: `${base}. Delivered with clarity and precision.`,
            minimal: base,
            neutral: base
        };

        return tones[tone] || base;
    },

    /* Analyze story flow across text elements */
    analyzeFlow() {
        const texts = [...$$("[data-text]")].map(el => el.innerText.trim());

        if (texts.length < 2) return { flow: "fragmented", steps: [] };

        const steps = [];

        if (texts[0].length < 40) steps.push("intro");
        if (texts.some(t => t.length > 80)) steps.push("body");
        if (texts[texts.length - 1].length < 40) steps.push("closing");

        const flow =
            steps.includes("intro") &&
            steps.includes("body") &&
            steps.includes("closing")
                ? "complete"
                : "partial";

        EventBus.emit("story:flow", { flow, steps });
        return { flow, steps };
    },

    /* Suggest improvements to story flow */
    suggestFlowFix(flow) {
        if (flow.flow === "complete") {
            return "Your narrative arc is complete and balanced.";
        }

        if (!flow.steps.includes("intro")) {
            return "Consider adding a short intro to set the stage.";
        }

        if (!flow.steps.includes("body")) {
            return "Add a longer body section to expand your message.";
        }

        if (!flow.steps.includes("closing")) {
            return "A short closing statement will help wrap things up.";
        }

        return "Your story could use more structure.";
    },

    /* Apply tone to selected text elements */
    applyTone(tone) {
        const selected = Selection.get();
        selected.forEach(el => {
            if (el.dataset.text) {
                el.innerText = this.rewrite(el.innerText, tone);
                EventBus.emit("text:change", el);
            }
        });

        EventBus.emit("story:applyTone", tone);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("story:analyze", () => {
            const flow = this.analyzeFlow();
            const suggestion = this.suggestFlowFix(flow);
            Toast.info(suggestion);
        });

        EventBus.on("story:applyTone", (tone) => {
            Toast.info(`Applied ${tone} tone`);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Analyze story flow
        Shortcuts.register("alt+s", () => {
            EventBus.emit("story:analyze");
        });

        // Apply mystical tone
        Shortcuts.register("alt+m", () => {
            this.applyTone("mystical");
        });

        // Apply professional tone
        Shortcuts.register("alt+p", () => {
            this.applyTone("professional");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.analyzeFlow();

        log("AI Story engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIStory.init();
});
/* ---------------------------------------------------------
   SECTION 72 — AI BRAND ENGINE
   Brand voice, brand rules, brand assets, brand enforcement
--------------------------------------------------------- */

const AIBrand = {
    brand: {
        name: "Mystic Design",
        palette: ["#6a00ff", "#ff00e6", "#0d0221", "#ffffff"],
        fonts: ["Inter", "Poppins", "Montserrat"],
        tone: "mystical",
        bannedWords: ["studio", "generic", "template"],
        requiredWords: ["mystic", "cosmic", "enchanted"],
        logoKeywords: ["mystic", "cosmic", "sigil", "glyph"]
    },

    /* Detect if text matches brand voice */
    detectVoice(text) {
        const t = text.toLowerCase();

        if (t.includes("mystic") || t.includes("cosmic") || t.includes("enchanted"))
            return "on-brand";

        if (t.includes("sale") || t.includes("discount"))
            return "off-brand";

        if (t.length < 10)
            return "neutral";

        return "slightly-off";
    },

    /* Rewrite text to match brand tone */
    rewriteToBrand(text) {
        const base = text.trim();

        const mystical = [
            "wrapped in cosmic energy",
            "forged in enchanted light",
            "born from the astral weave",
            "shaped by the arcane currents"
        ];

        const suffix = mystical[Math.floor(Math.random() * mystical.length)];

        return `${base} — ${suffix}.`;
    },

    /* Enforce brand palette on selected elements */
    enforcePalette() {
        const selected = Selection.get();
        selected.forEach(el => {
            if (el.dataset.text) {
                el.style.color = this.brand.palette[3];
            }
            if (el.dataset.shape) {
                el.style.background = this.brand.palette[0];
            }
            if (el.dataset.image) {
                el.style.borderColor = this.brand.palette[1];
            }
        });

        EventBus.emit("brand:paletteEnforced");
    },

    /* Enforce brand fonts */
    enforceFonts() {
        const selected = Selection.get();
        selected.forEach(el => {
            if (el.dataset.text) {
                el.style.fontFamily = this.brand.fonts[0];
            }
        });

        EventBus.emit("brand:fontsEnforced");
    },

    /* Check for banned words */
    checkBannedWords(text) {
        return this.brand.bannedWords.some(w => text.toLowerCase().includes(w));
    },

    /* Check for required brand words */
    checkRequiredWords(text) {
        return this.brand.requiredWords.some(w => text.toLowerCase().includes(w));
    },

    /* Enforce brand voice on selected text */
    enforceVoice() {
        const selected = Selection.get();
        selected.forEach(el => {
            if (!el.dataset.text) return;

            const text = el.innerText;

            if (this.checkBannedWords(text)) {
                el.innerText = this.rewriteToBrand(text);
            }

            if (!this.checkRequiredWords(text)) {
                el.innerText = this.rewriteToBrand(text);
            }

            EventBus.emit("text:change", el);
        });

        EventBus.emit("brand:voiceEnforced");
    },

    /* Detect brand asset usage */
    detectBrandAssets() {
        const images = [...$$("[data-image]")];

        const brandImages = images.filter(img => {
            const alt = img.alt?.toLowerCase() || "";
            return this.brand.logoKeywords.some(k => alt.includes(k));
        });

        EventBus.emit("brand:assetsDetected", brandImages);
        return brandImages;
    },

    /* Full brand check */
    runBrandCheck() {
        const elements = [...$$("[data-transform]")];

        const issues = [];

        elements.forEach(el => {
            if (el.dataset.text) {
                const tone = this.detectVoice(el.innerText);
                if (tone !== "on-brand") {
                    issues.push({ el, issue: "voice" });
                }
            }

            if (el.dataset.shape) {
                const bg = el.style.background;
                if (bg && !this.brand.palette.includes(bg)) {
                    issues.push({ el, issue: "color" });
                }
            }
        });

        EventBus.emit("brand:check", issues);
        return issues;
    },

    /* Highlight brand issues */
    highlightIssues(issues) {
        issues.forEach(({ el }) => {
            el.style.outline = "3px solid #ff00e6";
        });

        setTimeout(() => {
            issues.forEach(({ el }) => {
                el.style.outline = "none";
            });
        }, 1200);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("brand:runCheck", () => {
            const issues = this.runBrandCheck();
            if (issues.length === 0) {
                Toast.info("Everything is on-brand");
            } else {
                Toast.info(`${issues.length} brand issues detected`);
                this.highlightIssues(issues);
            }
        });

        EventBus.on("brand:applyVoice", () => this.enforceVoice());
        EventBus.on("brand:applyPalette", () => this.enforcePalette());
        EventBus.on("brand:applyFonts", () => this.enforceFonts());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Brand check
        Shortcuts.register("alt+b", () => {
            EventBus.emit("brand:runCheck");
        });

        // Apply brand voice
        Shortcuts.register("alt+v", () => {
            EventBus.emit("brand:applyVoice");
        });

        // Apply brand palette
        Shortcuts.register("alt+c", () => {
            EventBus.emit("brand:applyPalette");
        });

        // Apply brand fonts
        Shortcuts.register("alt+f", () => {
            EventBus.emit("brand:applyFonts");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.detectBrandAssets();

        log("AI Brand engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIBrand.init();
});
/* ---------------------------------------------------------
   SECTION 73 — AI TRANSLATION ENGINE
   Tone-preserving translation, multilingual layout, RTL support
--------------------------------------------------------- */

const AITranslation = {
    /* Fake translation model (placeholder) */
    translateText(text, targetLang, tone = "neutral") {
        // Placeholder translation logic
        const translations = {
            es: `(${tone}) Traducción: ${text}`,
            fr: `(${tone}) Traduction: ${text}`,
            de: `(${tone}) Übersetzung: ${text}`,
            ar: `(${tone}) ترجمة: ${text}`,
            zh: `(${tone}) 翻译：${text}`
        };

        return translations[targetLang] || text;
    },

    /* Detect if language is RTL */
    isRTL(lang) {
        return ["ar", "he", "fa", "ur"].includes(lang);
    },

    /* Apply translation to selected elements */
    applyTranslation(lang, tone = "neutral") {
        const selected = Selection.get();

        selected.forEach(el => {
            if (!el.dataset.text) return;

            const original = el.innerText;
            const translated = this.translateText(original, lang, tone);

            el.innerText = translated;

            if (this.isRTL(lang)) {
                el.style.direction = "rtl";
                el.style.textAlign = "right";
            } else {
                el.style.direction = "ltr";
                el.style.textAlign = "left";
            }

            TextEngine.autoResize(el);
            EventBus.emit("text:change", el);
        });

        EventBus.emit("translation:applied", { lang, tone });
    },

    /* Auto-adapt layout for multilingual text */
    adaptLayout(lang) {
        const isRTL = this.isRTL(lang);

        $$("[data-layout]").forEach(container => {
            if (isRTL) {
                container.style.direction = "rtl";
                container.style.flexDirection = "row-reverse";
            } else {
                container.style.direction = "ltr";
                container.style.flexDirection = "row";
            }
        });

        EventBus.emit("translation:layoutAdapted", lang);
    },

    /* Full translation pipeline */
    runTranslation(lang, tone = "neutral") {
        this.applyTranslation(lang, tone);
        this.adaptLayout(lang);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("translation:run", ({ lang, tone }) => {
            this.runTranslation(lang, tone);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Quick Spanish translation
        Shortcuts.register("alt+1", () => {
            EventBus.emit("translation:run", { lang: "es", tone: "neutral" });
        });

        // Quick French translation
        Shortcuts.register("alt+2", () => {
            EventBus.emit("translation:run", { lang: "fr", tone: "neutral" });
        });

        // Quick Arabic translation (RTL)
        Shortcuts.register("alt+3", () => {
            EventBus.emit("translation:run", { lang: "ar", tone: "neutral" });
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Translation engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AITranslation.init();
});
/* ---------------------------------------------------------
   SECTION 74 — AI ACCESSIBILITY INTELLIGENCE
   Contrast fixing, alt-text generation, readability scoring, dyslexia-safe mode
--------------------------------------------------------- */

const AIAccessibility = {
    /* Calculate contrast ratio between two colors */
    contrastRatio(fg, bg) {
        const lum = (c) => {
            const rgb = c.match(/\d+/g).map(Number).map(v => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        };

        const L1 = lum(fg);
        const L2 = lum(bg);

        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    },

    /* Auto-fix contrast for selected elements */
    fixContrast() {
        const selected = Selection.get();

        selected.forEach(el => {
            if (!el.dataset.text) return;

            const fg = window.getComputedStyle(el).color;
            const bg = window.getComputedStyle(el).backgroundColor || "rgb(255,255,255)";

            const ratio = this.contrastRatio(fg, bg);

            if (ratio < 4.5) {
                el.style.color = "#ffffff";
                el.style.backgroundColor = "#000000";
            }

            EventBus.emit("text:change", el);
        });

        EventBus.emit("accessibility:contrastFixed");
    },

    /* Generate alt-text for images */
    generateAltText(el) {
        if (!el.dataset.image) return "";

        const w = el.offsetWidth;
        const h = el.offsetHeight;

        return `Image (${w}x${h}) with mystical styling`;
    },

    applyAltText() {
        const images = [...$$("[data-image]")];

        images.forEach(img => {
            const alt = this.generateAltText(img);
            img.setAttribute("aria-label", alt);
        });

        EventBus.emit("accessibility:altTextApplied");
    },

    /* Readability scoring */
    readabilityScore(text) {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]/).length;
        const avgWords = words / Math.max(1, sentences);

        if (avgWords < 10) return "easy";
        if (avgWords < 18) return "medium";
        return "hard";
    },

    analyzeReadability() {
        const texts = [...$$("[data-text]")];
        const results = [];

        texts.forEach(el => {
            const score = this.readabilityScore(el.innerText);
            results.push({ el, score });
        });

        EventBus.emit("accessibility:readability", results);
        return results;
    },

    /* Dyslexia-safe mode */
    enableDyslexiaMode() {
        document.body.classList.add("dyslexia-mode");

        const style = document.createElement("style");
        style.id = "dyslexia-style";
        style.innerHTML = `
            .dyslexia-mode [data-text] {
                font-family: 'OpenDyslexic', Arial, sans-serif !important;
                letter-spacing: 0.05em !important;
                line-height: 1.6 !important;
            }
        `;
        document.head.appendChild(style);

        EventBus.emit("accessibility:dyslexiaOn");
    },

    disableDyslexiaMode() {
        document.body.classList.remove("dyslexia-mode");
        const style = document.querySelector("#dyslexia-style");
        if (style) style.remove();

        EventBus.emit("accessibility:dyslexiaOff");
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("accessibility:runContrastFix", () => this.fixContrast());
        EventBus.on("accessibility:runAltText", () => this.applyAltText());
        EventBus.on("accessibility:runReadability", () => {
            const results = this.analyzeReadability();
            Toast.info(`Readability analyzed: ${results.length} text blocks`);
        });
        EventBus.on("accessibility:toggleDyslexia", () => {
            if (document.body.classList.contains("dyslexia-mode")) {
                this.disableDyslexiaMode();
            } else {
                this.enableDyslexiaMode();
            }
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Fix contrast
        Shortcuts.register("alt+x", () => {
            EventBus.emit("accessibility:runContrastFix");
        });

        // Apply alt-text
        Shortcuts.register("alt+t", () => {
            EventBus.emit("accessibility:runAltText");
        });

        // Readability analysis
        Shortcuts.register("alt+r", () => {
            EventBus.emit("accessibility:runReadability");
        });

        // Toggle dyslexia-safe mode
        Shortcuts.register("alt+d", () => {
            EventBus.emit("accessibility:toggleDyslexia");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.applyAltText();

        log("AI Accessibility Intelligence engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAccessibility.init();
});
/* ---------------------------------------------------------
   SECTION 75 — AI DOCUMENT ENGINE
   Summaries, descriptions, metadata, auto-docs
--------------------------------------------------------- */

const AIDocument = {
    /* Generate a summary of the current page */
    summarizePage() {
        const elements = [...$$("[data-transform]")];

        const textCount = elements.filter(el => el.dataset.text).length;
        const imageCount = elements.filter(el => el.dataset.image).length;
        const shapeCount = elements.filter(el => el.dataset.shape).length;

        const layoutIntent = AILayoutIntent.inferLayout();
        const storyFlow = AIStory.analyzeFlow();

        const summary = `
Page Summary:
- Text blocks: ${textCount}
- Images: ${imageCount}
- Shapes: ${shapeCount}
- Layout intent: ${layoutIntent}
- Story flow: ${storyFlow.flow} (${storyFlow.steps.join(", ")})
        `.trim();

        EventBus.emit("doc:summary", summary);
        return summary;
    },

    /* Generate description for selected elements */
    describeSelection() {
        const selected = Selection.get();
        if (selected.length === 0) return "No elements selected.";

        const descriptions = selected.map(el => {
            if (el.dataset.text) {
                return `Text element: "${el.innerText.slice(0, 40)}..."`;
            }
            if (el.dataset.image) {
                return `Image element (${el.offsetWidth}x${el.offsetHeight})`;
            }
            if (el.dataset.shape) {
                return `Shape element (${el.style.background || "color"})`;
            }
            return "Unknown element";
        });

        const result = descriptions.join("\n");
        EventBus.emit("doc:describeSelection", result);
        return result;
    },

    /* Generate project metadata */
    generateMetadata() {
        const pages = Pages.pages.length;
        const assets = AssetLibrary.assets.length;
        const versions = Versioning.versions.length;

        const metadata = {
            projectName: "Mystic Design Project",
            pageCount: pages,
            assetCount: assets,
            versionCount: versions,
            lastUpdated: new Date().toLocaleString()
        };

        EventBus.emit("doc:metadata", metadata);
        return metadata;
    },

    /* Generate full auto-documentation */
    generateAutoDoc() {
        const summary = this.summarizePage();
        const metadata = this.generateMetadata();

        const autoDoc = `
=== Mystic Design Auto-Documentation ===

Project Metadata:
- Pages: ${metadata.pageCount}
- Assets: ${metadata.assetCount}
- Versions: ${metadata.versionCount}
- Last Updated: ${metadata.lastUpdated}

Page Summary:
${summary}

Generated automatically by Mystic Design's AI Document Engine.
        `.trim();

        EventBus.emit("doc:autoDoc", autoDoc);
        return autoDoc;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("doc:runSummary", () => {
            const summary = this.summarizePage();
            Toast.info("Page summary generated");
            console.log(summary);
        });

        EventBus.on("doc:runDescribe", () => {
            const desc = this.describeSelection();
            Toast.info("Selection description generated");
            console.log(desc);
        });

        EventBus.on("doc:runMetadata", () => {
            const meta = this.generateMetadata();
            Toast.info("Metadata generated");
            console.log(meta);
        });

        EventBus.on("doc:runAutoDoc", () => {
            const doc = this.generateAutoDoc();
            Toast.info("Auto-documentation generated");
            console.log(doc);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Generate summary
        Shortcuts.register("ctrl+alt+s", () => {
            EventBus.emit("doc:runSummary");
        });

        // Describe selection
        Shortcuts.register("ctrl+alt+d", () => {
            EventBus.emit("doc:runDescribe");
        });

        // Generate metadata
        Shortcuts.register("ctrl+alt+m", () => {
            EventBus.emit("doc:runMetadata");
        });

        // Generate full auto-doc
        Shortcuts.register("ctrl+alt+a", () => {
            EventBus.emit("doc:runAutoDoc");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Document engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIDocument.init();
});
/* ---------------------------------------------------------
   SECTION 76 — AI INSIGHT ENGINE
   Design critique, suggestions, warnings, best practices
--------------------------------------------------------- */

const AIInsight = {
    /* Evaluate spacing consistency */
    evaluateSpacing(elements) {
        const gaps = [];

        for (let i = 0; i < elements.length - 1; i++) {
            const a = elements[i].getBoundingClientRect();
            const b = elements[i + 1].getBoundingClientRect();

            const gap = Math.abs(b.top - (a.top + a.height));
            gaps.push(gap);
        }

        const variance =
            gaps.length > 1
                ? gaps.reduce((a, b) => a + Math.abs(b - gaps[0]), 0) / gaps.length
                : 0;

        return variance < 20 ? "consistent" : "inconsistent";
    },

    /* Evaluate hierarchy strength */
    evaluateHierarchy(elements) {
        const textEls = elements.filter(el => el.dataset.text);
        if (textEls.length < 2) return "weak";

        const sizes = textEls.map(el =>
            parseFloat(window.getComputedStyle(el).fontSize)
        );

        const max = Math.max(...sizes);
        const min = Math.min(...sizes);

        return max - min > 8 ? "strong" : "weak";
    },

    /* Evaluate clutter */
    evaluateClutter(elements) {
        if (elements.length <= 6) return "clean";
        if (elements.length <= 12) return "moderate";
        return "cluttered";
    },

    /* Generate critique */
    critique() {
        const elements = [...$$("[data-transform]")];

        const spacing = this.evaluateSpacing(elements);
        const hierarchy = this.evaluateHierarchy(elements);
        const clutter = this.evaluateClutter(elements);
        const balance = AIAutoDesign.balanceScore(elements);

        const insights = [];

        if (spacing === "inconsistent")
            insights.push("Spacing between elements is inconsistent.");
        if (hierarchy === "weak")
            insights.push("Text hierarchy is weak — consider increasing contrast between sizes.");
        if (clutter === "cluttered")
            insights.push("The layout feels cluttered — consider grouping or removing elements.");
        if (balance < 0.6)
            insights.push("The composition is visually unbalanced — try centering or redistributing weight.");

        if (insights.length === 0)
            insights.push("Your design looks clean, balanced, and well‑structured.");

        EventBus.emit("insight:critique", insights);
        return insights;
    },

    /* Generate improvement suggestions */
    suggestions() {
        const suggestions = [
            "Try increasing spacing between sections for clearer structure.",
            "Use a stronger headline to establish hierarchy.",
            "Align elements to a consistent grid for cleaner layout.",
            "Reduce color variety to strengthen brand cohesion.",
            "Group related elements to reduce visual noise."
        ];

        const pick = suggestions[Math.floor(Math.random() * suggestions.length)];

        EventBus.emit("insight:suggestion", pick);
        return pick;
    },

    /* Generate warnings */
    warnings() {
        const warnings = [];

        const elements = [...$$("[data-transform]")];

        elements.forEach(el => {
            if (el.dataset.text) {
                const fg = window.getComputedStyle(el).color;
                const bg = window.getComputedStyle(el).backgroundColor || "rgb(255,255,255)";
                const ratio = AIAccessibility.contrastRatio(fg, bg);

                if (ratio < 4.5) {
                    warnings.push("Low contrast detected in text element.");
                }
            }
        });

        EventBus.emit("insight:warnings", warnings);
        return warnings;
    },

    /* Full insight package */
    fullInsight() {
        const critique = this.critique();
        const suggestion = this.suggestions();
        const warnings = this.warnings();

        const result = {
            critique,
            suggestion,
            warnings
        };

        EventBus.emit("insight:full", result);
        return result;
    },

    /* Highlight issues visually */
    highlightIssues(issues) {
        issues.forEach(msg => {
            if (msg.includes("contrast")) {
                $$("[data-text]").forEach(el => {
                    el.style.outline = "3px solid #ff00e6";
                });
            }
        });

        setTimeout(() => {
            $$("[data-text]").forEach(el => {
                el.style.outline = "none";
            });
        }, 1200);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("insight:runCritique", () => {
            const insights = this.critique();
            Toast.info("Critique generated");
            console.log(insights);
        });

        EventBus.on("insight:runSuggestions", () => {
            const s = this.suggestions();
            Toast.info("Suggestion generated");
            console.log(s);
        });

        EventBus.on("insight:runWarnings", () => {
            const w = this.warnings();
            Toast.info("Warnings generated");
            console.log(w);
            this.highlightIssues(w);
        });

        EventBus.on("insight:runFull", () => {
            const full = this.fullInsight();
            Toast.info("Full insight generated");
            console.log(full);
            this.highlightIssues(full.warnings);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Critique
        Shortcuts.register("shift+alt+c", () => {
            EventBus.emit("insight:runCritique");
        });

        // Suggestions
        Shortcuts.register("shift+alt+s", () => {
            EventBus.emit("insight:runSuggestions");
        });

        // Warnings
        Shortcuts.register("shift+alt+w", () => {
            EventBus.emit("insight:runWarnings");
        });

        // Full insight
        Shortcuts.register("shift+alt+i", () => {
            EventBus.emit("insight:runFull");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Insight engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIInsight.init();
});
/* ---------------------------------------------------------
   SECTION 77 — AI MOTION ENGINE
   Auto-animate, easing, keyframes, motion paths
--------------------------------------------------------- */

const AIMotion = {
    animations: [],

    /* Generate keyframes between two states */
    generateKeyframes(start, end) {
        return [
            {
                transform: `translate(${start.x}px, ${start.y}px) scale(${start.scale}) rotate(${start.rotate}deg)`,
                opacity: start.opacity
            },
            {
                transform: `translate(${end.x}px, ${end.y}px) scale(${end.scale}) rotate(${end.rotate}deg)`,
                opacity: end.opacity
            }
        ];
    },

    /* Auto-detect start/end states for animation */
    detectStates(el) {
        const rect = el.getBoundingClientRect();

        const start = {
            x: rect.left,
            y: rect.top,
            scale: 1,
            rotate: 0,
            opacity: 0
        };

        const end = {
            x: rect.left,
            y: rect.top,
            scale: 1,
            rotate: 0,
            opacity: 1
        };

        return { start, end };
    },

    /* Animate element with auto-generated keyframes */
    autoAnimate(el, duration = 600, easing = "ease-out") {
        const { start, end } = this.detectStates(el);
        const keyframes = this.generateKeyframes(start, end);

        const anim = el.animate(keyframes, {
            duration,
            easing,
            fill: "forwards"
        });

        this.animations.push(anim);

        EventBus.emit("motion:autoAnimate", el);
    },

    /* Animate along a motion path */
    motionPath(el, path, duration = 1000, easing = "ease-in-out") {
        const keyframes = path.map(p => ({
            transform: `translate(${p.x}px, ${p.y}px)`
        }));

        const anim = el.animate(keyframes, {
            duration,
            easing,
            fill: "forwards"
        });

        this.animations.push(anim);

        EventBus.emit("motion:path", { el, path });
    },

    /* Predefined motion paths */
    generatePath(type, startX, startY) {
        if (type === "arc") {
            return [
                { x: startX, y: startY },
                { x: startX + 80, y: startY - 60 },
                { x: startX + 160, y: startY }
            ];
        }

        if (type === "curve") {
            return [
                { x: startX, y: startY },
                { x: startX + 40, y: startY + 20 },
                { x: startX + 80, y: startY - 40 },
                { x: startX + 120, y: startY }
            ];
        }

        return [
            { x: startX, y: startY },
            { x: startX + 120, y: startY }
        ];
    },

    /* Animate selected elements */
    animateSelection(type = "fade") {
        const selected = Selection.get();

        selected.forEach(el => {
            if (type === "fade") {
                this.autoAnimate(el, 600, "ease-out");
            }

            if (type === "arc") {
                const rect = el.getBoundingClientRect();
                const path = this.generatePath("arc", rect.left, rect.top);
                this.motionPath(el, path);
            }

            if (type === "curve") {
                const rect = el.getBoundingClientRect();
                const path = this.generatePath("curve", rect.left, rect.top);
                this.motionPath(el, path);
            }
        });

        EventBus.emit("motion:selection", type);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("motion:runAuto", () => {
            this.animateSelection("fade");
        });

        EventBus.on("motion:runArc", () => {
            this.animateSelection("arc");
        });

        EventBus.on("motion:runCurve", () => {
            this.animateSelection("curve");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Auto-animate
        Shortcuts.register("ctrl+alt+f", () => {
            EventBus.emit("motion:runAuto");
        });

        // Arc motion
        Shortcuts.register("ctrl+alt+a", () => {
            EventBus.emit("motion:runArc");
        });

        // Curve motion
        Shortcuts.register("ctrl+alt+c", () => {
            EventBus.emit("motion:runCurve");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Motion engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMotion.init();
});
/* ---------------------------------------------------------
   SECTION 78 — AI EXPORT ENGINE
   Smart export, multi-format, auto-naming, brand-safe output
--------------------------------------------------------- */

const AIExport = {
    /* Auto-generate export filename */
    generateFilename(format = "png") {
        const layout = AILayoutIntent.inferLayout();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        return `mystic-${layout}-${timestamp}.${format}`;
    },

    /* Detect best export format */
    detectBestFormat() {
        const elements = [...$$("[data-transform]")];

        const hasTransparency = elements.some(el => {
            const bg = window.getComputedStyle(el).backgroundColor;
            return bg.includes("rgba") && bg.endsWith(", 0)");
        });

        if (hasTransparency) return "png";

        const hasPhotos = elements.some(el => el.dataset.image);
        if (hasPhotos) return "jpg";

        return "png";
    },

    /* Export canvas to image */
    exportImage(format = "png") {
        const filename = this.generateFilename(format);

        html2canvas(document.querySelector("#canvas"), {
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement("a");
            link.download = filename;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();

            EventBus.emit("export:image", { format, filename });
        });
    },

    /* Export as PDF */
    exportPDF() {
        const filename = this.generateFilename("pdf");

        html2canvas(document.querySelector("#canvas")).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jspdf.jsPDF("p", "pt", "a4");

            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(filename);

            EventBus.emit("export:pdf", filename);
        });
    },

    /* Export as SVG (vector) */
    exportSVG() {
        const filename = this.generateFilename("svg");

        const svg = CanvasToSVG.convert(document.querySelector("#canvas"));
        const blob = new Blob([svg], { type: "image/svg+xml" });

        const link = document.createElement("a");
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();

        EventBus.emit("export:svg", filename);
    },

    /* Brand-safe export check */
    brandSafeCheck() {
        const issues = AIBrand.runBrandCheck();
        return issues.length === 0;
    },

    /* Smart export pipeline */
    smartExport() {
        if (!this.brandSafeCheck()) {
            Toast.error("Export blocked: design is not brand-safe");
            return;
        }

        const format = this.detectBestFormat();
        this.exportImage(format);

        EventBus.emit("export:smart", format);
    },

    /* Export presets */
    exportPreset(type) {
        if (type === "social") {
            CanvasEngine.resize(1080, 1080);
            this.exportImage("png");
        }

        if (type === "story") {
            CanvasEngine.resize(1080, 1920);
            this.exportImage("png");
        }

        if (type === "print") {
            CanvasEngine.resize(2550, 3300); // 8.5x11 at 300dpi
            this.exportPDF();
        }

        if (type === "web") {
            CanvasEngine.resize(1920, 1080);
            this.exportImage("jpg");
        }

        EventBus.emit("export:preset", type);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("export:runSmart", () => this.smartExport());
        EventBus.on("export:runPNG", () => this.exportImage("png"));
        EventBus.on("export:runJPG", () => this.exportImage("jpg"));
        EventBus.on("export:runPDF", () => this.exportPDF());
        EventBus.on("export:runSVG", () => this.exportSVG());
        EventBus.on("export:presetSocial", () => this.exportPreset("social"));
        EventBus.on("export:presetStory", () => this.exportPreset("story"));
        EventBus.on("export:presetPrint", () => this.exportPreset("print"));
        EventBus.on("export:presetWeb", () => this.exportPreset("web"));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Smart export
        Shortcuts.register("ctrl+e", () => {
            EventBus.emit("export:runSmart");
        });

        // Export PNG
        Shortcuts.register("ctrl+shift+p", () => {
            EventBus.emit("export:runPNG");
        });

        // Export PDF
        Shortcuts.register("ctrl+shift+d", () => {
            EventBus.emit("export:runPDF");
        });

        // Export SVG
        Shortcuts.register("ctrl+shift+s", () => {
            EventBus.emit("export:runSVG");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Export engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIExport.init();
});
/* ---------------------------------------------------------
   SECTION 79 — AI PERFORMANCE ENGINE
   Task queue, frame budgeting, async rendering, priority scheduling
--------------------------------------------------------- */

const PerformanceEngine = {
    queue: {
        high: [],
        medium: [],
        low: []
    },

    frameBudget: 12, // ms per frame (for 60fps)
    lastFrameTime: performance.now(),

    /* Add task to queue */
    enqueue(fn, priority = 2) {
        if (priority === 1) this.queue.high.push(fn);
        else if (priority === 2) this.queue.medium.push(fn);
        else this.queue.low.push(fn);
    },

    /* Run tasks within frame budget */
    runFrame() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;

        if (delta < this.frameBudget) {
            requestAnimationFrame(() => this.runFrame());
            return;
        }

        this.lastFrameTime = now;

        let timeStart = performance.now();

        const runTasks = (list) => {
            while (list.length > 0) {
                const task = list.shift();
                task();

                if (performance.now() - timeStart > this.frameBudget) {
                    return false; // stop for this frame
                }
            }
            return true;
        };

        // Priority order
        runTasks(this.queue.high);
        runTasks(this.queue.medium);
        runTasks(this.queue.low);

        requestAnimationFrame(() => this.runFrame());
    },

    /* Batch DOM writes */
    batchWrites(callbacks) {
        requestAnimationFrame(() => {
            callbacks.forEach(cb => cb());
        });
    },

    /* Monitor performance */
    monitor() {
        setInterval(() => {
            const totalTasks =
                this.queue.high.length +
                this.queue.medium.length +
                this.queue.low.length;

            EventBus.emit("performance:stats", {
                tasks: totalTasks,
                high: this.queue.high.length,
                medium: this.queue.medium.length,
                low: this.queue.low.length
            });
        }, 1000);
    },

    /* Priority helpers */
    high(fn) { this.enqueue(fn, 1); }
    ,
    medium(fn) { this.enqueue(fn, 2); }
    ,
    low(fn) { this.enqueue(fn, 3); }
    ,

    /* Bind events */
    bindEvents() {
        EventBus.on("performance:flush", () => {
            this.queue.high = [];
            this.queue.medium = [];
            this.queue.low = [];
            Toast.info("Performance queues flushed");
        });

        EventBus.on("performance:optimize", () => {
            this.frameBudget = 10;
            Toast.info("Performance mode: High Optimization");
        });
    },

    init() {
        this.bindEvents();
        this.monitor();
        this.runFrame();

        log("AI Performance engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    PerformanceEngine.init();
});
/* ---------------------------------------------------------
   SECTION 80 — AI MEMORY ENGINE
   Design memory, user patterns, reuse detection, smart recall
--------------------------------------------------------- */

const AIMemory = {
    memory: {
        palettes: [],
        layouts: [],
        components: [],
        textStyles: [],
        usageHistory: []
    },

    /* Capture palette from current design */
    capturePalette() {
        const colors = new Set();

        $$("[data-transform]").forEach(el => {
            const styles = window.getComputedStyle(el);
            colors.add(styles.color);
            colors.add(styles.backgroundColor);
        });

        const palette = [...colors].slice(0, 8);
        this.memory.palettes.push(palette);

        EventBus.emit("memory:paletteCaptured", palette);
        return palette;
    },

    /* Capture layout structure */
    captureLayout() {
        const elements = [...$$("[data-transform]")];

        const layout = elements.map(el => ({
            x: el.offsetLeft,
            y: el.offsetTop,
            w: el.offsetWidth,
            h: el.offsetHeight,
            type: el.dataset.semantic || "element"
        }));

        this.memory.layouts.push(layout);

        EventBus.emit("memory:layoutCaptured", layout);
        return layout;
    },

    /* Capture reusable components */
    captureComponents() {
        const groups = AISemantic.smartGroup();

        const component = {
            headlines: groups.headlines.length,
            body: groups.body.length,
            images: groups.images.length,
            shapes: groups.shapes.length
        };

        this.memory.components.push(component);

        EventBus.emit("memory:componentCaptured", component);
        return component;
    },

    /* Detect reuse of past patterns */
    detectReuse() {
        const current = this.captureLayout();
        const past = this.memory.layouts;

        for (let i = 0; i < past.length; i++) {
            const prev = past[i];

            if (prev.length === current.length) {
                const similarity = this.compareLayouts(prev, current);
                if (similarity > 0.85) {
                    EventBus.emit("memory:reuseDetected", prev);
                    return prev;
                }
            }
        }

        return null;
    },

    /* Compare two layouts */
    compareLayouts(a, b) {
        let score = 0;

        for (let i = 0; i < a.length; i++) {
            const dx = Math.abs(a[i].x - b[i].x);
            const dy = Math.abs(a[i].y - b[i].y);
            const dw = Math.abs(a[i].w - b[i].w);
            const dh = Math.abs(a[i].h - b[i].h);

            const localScore = 1 - Math.min(1, (dx + dy + dw + dh) / 2000);
            score += localScore;
        }

        return score / a.length;
    },

    /* Predict next action */
    predictNext() {
        const history = this.memory.usageHistory;
        const last = history[history.length - 1];

        if (!last) return "none";

        if (last === "addText") return "You often add a headline next.";
        if (last === "addImage") return "You often add a caption after adding an image.";
        if (last === "addShape") return "You often group shapes into a layout container.";

        return "Continue designing freely.";
    },

    /* Log user actions */
    logAction(action) {
        this.memory.usageHistory.push(action);
        EventBus.emit("memory:actionLogged", action);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("transform:create", () => this.logAction("addShape"));
        EventBus.on("text:create", () => this.logAction("addText"));
        EventBus.on("image:create", () => this.logAction("addImage"));

        EventBus.on("memory:captureAll", () => {
            this.capturePalette();
            this.captureLayout();
            this.captureComponents();
            Toast.info("Design memory captured");
        });

        EventBus.on("memory:predict", () => {
            const prediction = this.predictNext();
            Toast.info(prediction);
        });

        EventBus.on("memory:checkReuse", () => {
            const reuse = this.detectReuse();
            if (reuse) {
                Toast.info("Similar layout detected — consider reusing a component");
            } else {
                Toast.info("No reusable patterns found");
            }
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Capture memory snapshot
        Shortcuts.register("ctrl+alt+m", () => {
            EventBus.emit("memory:captureAll");
        });

        // Predict next action
        Shortcuts.register("ctrl+alt+n", () => {
            EventBus.emit("memory:predict");
        });

        // Detect reuse
        Shortcuts.register("ctrl+alt+r", () => {
            EventBus.emit("memory:checkReuse");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Memory engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMemory.init();
});
/* ---------------------------------------------------------
   SECTION 81 — AI PLUGIN ENGINE
   Plugin loader, sandbox, API hooks, custom tools
--------------------------------------------------------- */

const AIPlugin = {
    plugins: {},
    api: {},

    /* Register plugin */
    register(name, plugin) {
        if (this.plugins[name]) {
            console.warn(`Plugin "${name}" already registered.`);
            return;
        }

        this.plugins[name] = plugin;

        if (plugin.init) {
            try {
                plugin.init(this.api);
            } catch (err) {
                console.error(`Plugin "${name}" failed to initialize:`, err);
            }
        }

        EventBus.emit("plugin:registered", name);
        log(`Plugin registered: ${name}`);
    },

    /* Load plugin from URL */
    async load(url) {
        try {
            const module = await import(url);
            const plugin = module.default;

            if (!plugin || !plugin.name) {
                throw new Error("Invalid plugin format");
            }

            this.register(plugin.name, plugin);

            EventBus.emit("plugin:loaded", plugin.name);
            Toast.info(`Plugin loaded: ${plugin.name}`);
        } catch (err) {
            console.error("Plugin load error:", err);
            Toast.error("Failed to load plugin");
        }
    },

    /* Sandbox API exposed to plugins */
    buildAPI() {
        this.api = {
            canvas: {
                addElement: (el) => CanvasEngine.add(el),
                removeElement: (el) => CanvasEngine.remove(el),
                getSelection: () => Selection.get(),
                on: (event, fn) => EventBus.on(event, fn),
                emit: (event, data) => EventBus.emit(event, data)
            },

            ui: {
                addPanel: (id, html) => UIEngine.addPanel(id, html),
                addTool: (id, icon, callback) => UIEngine.addTool(id, icon, callback),
                addShortcut: (combo, callback) => Shortcuts.register(combo, callback)
            },

            ai: {
                color: AIColor,
                semantic: AISemantic,
                layout: AILayoutIntent,
                story: AIStory,
                brand: AIBrand,
                translate: AITranslation,
                accessibility: AIAccessibility,
                document: AIDocument,
                insight: AIInsight,
                motion: AIMotion,
                export: AIExport,
                memory: AIMemory
            },

            utils: {
                log: (...args) => log(...args),
                toast: (msg) => Toast.info(msg)
            }
        };
    },

    /* List installed plugins */
    list() {
        return Object.keys(this.plugins);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("plugin:loadURL", (url) => {
            this.load(url);
        });

        EventBus.on("plugin:list", () => {
            const list = this.list();
            console.log("Installed plugins:", list);
            Toast.info(`${list.length} plugins installed`);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Load plugin from URL
        Shortcuts.register("ctrl+alt+l", () => {
            const url = prompt("Enter plugin URL:");
            if (url) EventBus.emit("plugin:loadURL", url);
        });

        // List plugins
        Shortcuts.register("ctrl+alt+p", () => {
            EventBus.emit("plugin:list");
        });
    },

    init() {
        this.buildAPI();
        this.bindEvents();
        this.bindShortcuts();

        log("AI Plugin engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIPlugin.init();
});
/* ---------------------------------------------------------
   SECTION 82 — AI CLOUD ENGINE
   Sync, autosave, versioning, collaboration hooks
--------------------------------------------------------- */

const AICloud = {
    autosaveInterval: 5000,
    lastSavedState: null,
    versions: [],

    /* Serialize canvas state */
    serialize() {
        const elements = [...$$("[data-transform]")].map(el => ({
            id: el.id,
            x: el.offsetLeft,
            y: el.offsetTop,
            w: el.offsetWidth,
            h: el.offsetHeight,
            type: el.dataset.semantic || "element",
            text: el.dataset.text ? el.innerText : null,
            style: el.getAttribute("style")
        }));

        return JSON.stringify({
            timestamp: Date.now(),
            elements
        });
    },

    /* Save to cloud (placeholder) */
    async saveToCloud(data) {
        // Placeholder: replace with real backend call
        console.log("Saving to cloud:", data);
        EventBus.emit("cloud:saved", data);
    },

    /* Load from cloud (placeholder) */
    async loadFromCloud() {
        // Placeholder: replace with real backend call
        EventBus.emit("cloud:loaded", {});
    },

    /* Autosave logic */
    autosave() {
        const state = this.serialize();

        if (state !== this.lastSavedState) {
            this.lastSavedState = state;
            this.saveToCloud(state);
            this.createVersion(state);
        }
    },

    /* Create version snapshot */
    createVersion(state) {
        const version = {
            id: this.versions.length + 1,
            timestamp: new Date().toLocaleString(),
            state
        };

        this.versions.push(version);
        EventBus.emit("cloud:versionCreated", version);
    },

    /* Restore version */
    restoreVersion(id) {
        const version = this.versions.find(v => v.id === id);
        if (!version) return;

        // Placeholder restore logic
        console.log("Restoring version:", version);

        EventBus.emit("cloud:versionRestored", version);
    },

    /* Conflict resolution (simple) */
    resolveConflict(local, remote) {
        // Placeholder: always prefer remote
        return remote;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("cloud:save", () => {
            const state = this.serialize();
            this.saveToCloud(state);
            this.createVersion(state);
            Toast.info("Project saved");
        });

        EventBus.on("cloud:load", () => {
            this.loadFromCloud();
            Toast.info("Project loaded");
        });

        EventBus.on("cloud:listVersions", () => {
            console.log("Versions:", this.versions);
            Toast.info(`${this.versions.length} versions available`);
        });

        EventBus.on("cloud:restoreVersion", (id) => {
            this.restoreVersion(id);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Manual save
        Shortcuts.register("ctrl+s", () => {
            EventBus.emit("cloud:save");
        });

        // List versions
        Shortcuts.register("ctrl+shift+v", () => {
            EventBus.emit("cloud:listVersions");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Autosave loop
        setInterval(() => this.autosave(), this.autosaveInterval);

        log("AI Cloud engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AICloud.init();
});
/* ---------------------------------------------------------
   SECTION 83 — AI MARKETPLACE ENGINE
   Templates, assets, components, auto-publish
--------------------------------------------------------- */

const AIMarketplace = {
    items: [],

    /* Generate metadata for a template or asset */
    generateMetadata() {
        const layout = AILayoutIntent.inferLayout();
        const palette = AIMemory.memory.palettes.slice(-1)[0] || [];
        const story = AIStory.analyzeFlow();
        const brand = AIBrand.detectBrandAssets();

        return {
            layout,
            palette,
            storyFlow: story.flow,
            brandAssets: brand.length,
            timestamp: new Date().toISOString()
        };
    },

    /* Generate tags automatically */
    generateTags() {
        const tags = new Set();

        const layout = AILayoutIntent.inferLayout();
        if (layout) tags.add(layout);

        const story = AIStory.analyzeFlow();
        story.steps.forEach(s => tags.add(s));

        const brandAssets = AIBrand.detectBrandAssets();
        if (brandAssets.length > 0) tags.add("brand");

        tags.add("mystic");
        tags.add("design");

        return [...tags];
    },

    /* Generate preview image */
    async generatePreview() {
        return new Promise(resolve => {
            html2canvas(document.querySelector("#canvas")).then(canvas => {
                resolve(canvas.toDataURL("image/png"));
            });
        });
    },

    /* Publish item to marketplace */
    async publish(type = "template") {
        const metadata = this.generateMetadata();
        const tags = this.generateTags();
        const preview = await this.generatePreview();

        const item = {
            id: this.items.length + 1,
            type,
            metadata,
            tags,
            preview,
            createdAt: new Date().toLocaleString()
        };

        this.items.push(item);

        EventBus.emit("marketplace:published", item);
        Toast.info(`${type} published to marketplace`);

        return item;
    },

    /* List marketplace items */
    list() {
        EventBus.emit("marketplace:list", this.items);
        return this.items;
    },

    /* Search marketplace */
    search(query) {
        const q = query.toLowerCase();
        const results = this.items.filter(item =>
            item.tags.some(tag => tag.toLowerCase().includes(q))
        );

        EventBus.emit("marketplace:searchResults", results);
        return results;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("marketplace:publishTemplate", () => {
            this.publish("template");
        });

        EventBus.on("marketplace:publishAsset", () => {
            this.publish("asset");
        });

        EventBus.on("marketplace:publishComponent", () => {
            this.publish("component");
        });

        EventBus.on("marketplace:listItems", () => {
            this.list();
        });

        EventBus.on("marketplace:search", (query) => {
            this.search(query);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Publish template
        Shortcuts.register("ctrl+shift+t", () => {
            EventBus.emit("marketplace:publishTemplate");
        });

        // Publish asset
        Shortcuts.register("ctrl+shift+a", () => {
            EventBus.emit("marketplace:publishAsset");
        });

        // Publish component
        Shortcuts.register("ctrl+shift+c", () => {
            EventBus.emit("marketplace:publishComponent");
        });

        // List items
        Shortcuts.register("ctrl+shift+l", () => {
            EventBus.emit("marketplace:listItems");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Marketplace engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMarketplace.init();
});
/* ---------------------------------------------------------
   SECTION 84 — AI SECURITY ENGINE
   Sandboxing, permissions, validation, safe execution
--------------------------------------------------------- */

const AISecurity = {
    permissions: {
        canvas: false,
        ui: false,
        network: false,
        storage: false
    },

    /* Request permission */
    requestPermission(pluginName, perm) {
        if (!this.permissions[perm]) {
            console.warn(`Plugin "${pluginName}" requested "${perm}" permission.`);
            // Auto-grant for now (can be replaced with UI prompt)
            this.permissions[perm] = true;
        }

        EventBus.emit("security:permissionGranted", { pluginName, perm });
        return true;
    },

    /* Validate plugin action */
    validateAction(pluginName, action) {
        if (action === "canvas" && !this.permissions.canvas) {
            throw new Error(`Plugin "${pluginName}" attempted canvas access without permission.`);
        }
        if (action === "ui" && !this.permissions.ui) {
            throw new Error(`Plugin "${pluginName}" attempted UI access without permission.`);
        }
        if (action === "network" && !this.permissions.network) {
            throw new Error(`Plugin "${pluginName}" attempted network access without permission.`);
        }
        if (action === "storage" && !this.permissions.storage) {
            throw new Error(`Plugin "${pluginName}" attempted storage access without permission.`);
        }
    },

    /* Safe execution wrapper */
    safeExecute(pluginName, fn, actionType) {
        try {
            this.validateAction(pluginName, actionType);
            fn();
        } catch (err) {
            console.error(`Security violation by plugin "${pluginName}":`, err);
            EventBus.emit("security:violation", { pluginName, error: err });
            Toast.error(`Plugin "${pluginName}" blocked for unsafe action`);
        }
    },

    /* Sandbox API wrapper */
    sandboxAPI(pluginName, api) {
        return {
            canvas: {
                addElement: (el) =>
                    this.safeExecute(pluginName, () => api.canvas.addElement(el), "canvas"),
                removeElement: (el) =>
                    this.safeExecute(pluginName, () => api.canvas.removeElement(el), "canvas"),
                getSelection: () => api.canvas.getSelection()
            },

            ui: {
                addPanel: (id, html) =>
                    this.safeExecute(pluginName, () => api.ui.addPanel(id, html), "ui"),
                addTool: (id, icon, cb) =>
                    this.safeExecute(pluginName, () => api.ui.addTool(id, icon, cb), "ui"),
                addShortcut: (combo, cb) =>
                    this.safeExecute(pluginName, () => api.ui.addShortcut(combo, cb), "ui")
            },

            network: {
                fetch: (...args) =>
                    this.safeExecute(pluginName, () => fetch(...args), "network")
            },

            storage: {
                save: (key, value) =>
                    this.safeExecute(pluginName, () => localStorage.setItem(key, value), "storage"),
                load: (key) =>
                    this.safeExecute(pluginName, () => localStorage.getItem(key), "storage")
            },

            utils: api.utils
        };
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("security:grant", ({ plugin, perm }) => {
            this.requestPermission(plugin, perm);
        });

        EventBus.on("security:listPermissions", () => {
            console.log("Current permissions:", this.permissions);
            Toast.info("Permissions listed in console");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // List permissions
        Shortcuts.register("ctrl+alt+g", () => {
            EventBus.emit("security:listPermissions");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Security engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AISecurity.init();
});
/* ---------------------------------------------------------
   SECTION 85 — AI ADMIN ENGINE
   Admin tools, debug panels, logs, system controls
--------------------------------------------------------- */

const AIAdmin = {
    devMode: false,
    logs: [],

    /* Log system events */
    log(event, data = null) {
        const entry = {
            event,
            data,
            timestamp: new Date().toLocaleTimeString()
        };

        this.logs.push(entry);
        console.log(`[ADMIN LOG] ${event}`, data);

        EventBus.emit("admin:log", entry);
    },

    /* Toggle developer mode */
    toggleDevMode() {
        this.devMode = !this.devMode;

        if (this.devMode) {
            document.body.classList.add("dev-mode");
            Toast.info("Developer Mode Enabled");
        } else {
            document.body.classList.remove("dev-mode");
            Toast.info("Developer Mode Disabled");
        }

        EventBus.emit("admin:devMode", this.devMode);
    },

    /* Show debug panel */
    showDebugPanel() {
        const panel = document.querySelector("#debug-panel");

        if (!panel) {
            const div = document.createElement("div");
            div.id = "debug-panel";
            div.style.position = "fixed";
            div.style.right = "20px";
            div.style.bottom = "20px";
            div.style.width = "320px";
            div.style.height = "400px";
            div.style.background = "rgba(0,0,0,0.85)";
            div.style.color = "#fff";
            div.style.padding = "12px";
            div.style.borderRadius = "8px";
            div.style.overflowY = "auto";
            div.style.zIndex = "99999";
            div.innerHTML = `<h3>Debug Panel</h3><div id="debug-content"></div>`;
            document.body.appendChild(div);
        }

        this.updateDebugPanel();
    },

    /* Update debug panel content */
    updateDebugPanel() {
        const content = document.querySelector("#debug-content");
        if (!content) return;

        const stats = {
            fps: Math.round(1000 / (performance.now() - PerformanceEngine.lastFrameTime)),
            tasks: {
                high: PerformanceEngine.queue.high.length,
                medium: PerformanceEngine.queue.medium.length,
                low: PerformanceEngine.queue.low.length
            },
            versions: AICloud.versions.length,
            plugins: Object.keys(AIPlugin.plugins).length,
            marketplaceItems: AIMarketplace.items.length
        };

        content.innerHTML = `
            <p><strong>FPS:</strong> ${stats.fps}</p>
            <p><strong>Tasks:</strong> H:${stats.tasks.high} M:${stats.tasks.medium} L:${stats.tasks.low}</p>
            <p><strong>Versions:</strong> ${stats.versions}</p>
            <p><strong>Plugins:</strong> ${stats.plugins}</p>
            <p><strong>Marketplace Items:</strong> ${stats.marketplaceItems}</p>
            <hr>
            <h4>Recent Logs</h4>
            <pre style="font-size:11px; white-space:pre-wrap;">${JSON.stringify(this.logs.slice(-10), null, 2)}</pre>
        `;
    },

    /* Clear logs */
    clearLogs() {
        this.logs = [];
        Toast.info("Admin logs cleared");
        EventBus.emit("admin:logsCleared");
    },

    /* Toggle any engine on/off */
    toggleEngine(name) {
        if (!window[name]) {
            Toast.error(`Engine "${name}" not found`);
            return;
        }

        const engine = window[name];
        engine.disabled = !engine.disabled;

        Toast.info(`${name} ${engine.disabled ? "disabled" : "enabled"}`);
        EventBus.emit("admin:engineToggled", { name, state: !engine.disabled });
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("admin:toggleDevMode", () => this.toggleDevMode());
        EventBus.on("admin:showDebug", () => this.showDebugPanel());
        EventBus.on("admin:clearLogs", () => this.clearLogs());
        EventBus.on("admin:toggleEngine", (name) => this.toggleEngine(name));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Toggle developer mode
        Shortcuts.register("ctrl+shift+d", () => {
            EventBus.emit("admin:toggleDevMode");
        });

        // Show debug panel
        Shortcuts.register("ctrl+shift+u", () => {
            EventBus.emit("admin:showDebug");
        });

        // Clear logs
        Shortcuts.register("ctrl+shift+x", () => {
            EventBus.emit("admin:clearLogs");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Admin engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAdmin.init();
});
/* ---------------------------------------------------------
   SECTION 86 — AI SYSTEM ENGINE
   Global orchestrator, engine registry, dependency graph, health monitor
--------------------------------------------------------- */

const AISystem = {
    registry: {},
    dependencies: {},
    health: {},

    /* Register an engine */
    register(name, engine, deps = []) {
        this.registry[name] = engine;
        this.dependencies[name] = deps;
        this.health[name] = { status: "registered", lastCheck: null };

        EventBus.emit("system:engineRegistered", { name, deps });
        log(`Engine registered: ${name}`);
    },

    /* Initialize all engines in dependency order */
    initAll() {
        const order = this.resolveOrder();

        order.forEach(name => {
            const engine = this.registry[name];
            if (!engine) return;

            try {
                if (engine.init && !engine.disabled) {
                    engine.init();
                    this.health[name].status = "ready";
                }
            } catch (err) {
                console.error(`Engine "${name}" failed to initialize:`, err);
                this.health[name].status = "error";
            }

            this.health[name].lastCheck = Date.now();
        });

        EventBus.emit("system:ready");
        log("All engines initialized");
    },

    /* Resolve dependency order (topological sort) */
    resolveOrder() {
        const visited = new Set();
        const order = [];

        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);

            const deps = this.dependencies[name] || [];
            deps.forEach(visit);

            order.push(name);
        };

        Object.keys(this.registry).forEach(visit);
        return order;
    },

    /* Health check for all engines */
    checkHealth() {
        Object.keys(this.registry).forEach(name => {
            const engine = this.registry[name];

            if (engine.disabled) {
                this.health[name].status = "disabled";
            } else {
                this.health[name].status = "healthy";
            }

            this.health[name].lastCheck = Date.now();
        });

        EventBus.emit("system:health", this.health);
    },

    /* Restart an engine */
    restart(name) {
        const engine = this.registry[name];
        if (!engine) return;

        try {
            if (engine.init) engine.init();
            this.health[name].status = "restarted";
            Toast.info(`Engine restarted: ${name}`);
        } catch (err) {
            console.error(`Engine "${name}" failed to restart:`, err);
            this.health[name].status = "error";
        }

        this.health[name].lastCheck = Date.now();
        EventBus.emit("system:engineRestarted", name);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("system:restartEngine", (name) => this.restart(name));
        EventBus.on("system:healthCheck", () => this.checkHealth());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Health check
        Shortcuts.register("ctrl+shift+h", () => {
            EventBus.emit("system:healthCheck");
        });

        // Restart engine
        Shortcuts.register("ctrl+shift+r", () => {
            const name = prompt("Restart which engine?");
            if (name) EventBus.emit("system:restartEngine", name);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI System engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AISystem.init();
});
/* ---------------------------------------------------------
   SECTION 87 — AI EXPERIENCE ENGINE
   Onboarding, hints, adaptive UI, user flow intelligence
--------------------------------------------------------- */

const AIExperience = {
    userState: {
        firstTime: true,
        hesitationCount: 0,
        lastActionTime: Date.now(),
        uiMode: "normal" // normal | simplified | advanced
    },

    /* Detect hesitation (user stops interacting) */
    detectHesitation() {
        const now = Date.now();
        const diff = now - this.userState.lastActionTime;

        if (diff > 6000) {
            this.userState.hesitationCount++;
            EventBus.emit("experience:hesitation", this.userState.hesitationCount);
        }
    },

    /* Show contextual hint */
    showHint(message) {
        const hint = document.createElement("div");
        hint.className = "mystic-hint";
        hint.innerText = message;

        Object.assign(hint.style, {
            position: "fixed",
            bottom: "20px",
            left: "20px",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "6px",
            zIndex: 99999,
            fontSize: "14px"
        });

        document.body.appendChild(hint);

        setTimeout(() => hint.remove(), 4000);
    },

    /* Adaptive UI mode switching */
    updateUIMode() {
        const h = this.userState.hesitationCount;

        if (h > 5 && this.userState.uiMode !== "simplified") {
            this.userState.uiMode = "simplified";
            EventBus.emit("experience:uiMode", "simplified");
            this.showHint("Switched to Simplified Mode for easier navigation");
        }

        if (h < 2 && this.userState.uiMode !== "advanced") {
            this.userState.uiMode = "advanced";
            EventBus.emit("experience:uiMode", "advanced");
            this.showHint("Advanced Mode enabled — full tools unlocked");
        }
    },

    /* Onboarding flow */
    runOnboarding() {
        if (!this.userState.firstTime) return;

        this.showHint("Welcome to Mystic Design — click anywhere to begin.");
        this.userState.firstTime = false;

        EventBus.emit("experience:onboardingComplete");
    },

    /* Track user actions */
    trackAction() {
        this.userState.lastActionTime = Date.now();
        this.userState.hesitationCount = Math.max(0, this.userState.hesitationCount - 1);
    },

    /* Bind events */
    bindEvents() {
        document.addEventListener("click", () => this.trackAction());
        document.addEventListener("keydown", () => this.trackAction());

        EventBus.on("experience:hesitation", (count) => {
            if (count === 1) this.showHint("Need help? Try selecting an element.");
            if (count === 3) this.showHint("Try dragging elements or adding text.");
            if (count === 5) this.showHint("Switching to Simplified Mode for clarity.");
            this.updateUIMode();
        });

        EventBus.on("experience:showHint", (msg) => this.showHint(msg));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Force hint
        Shortcuts.register("ctrl+shift+h", () => {
            this.showHint("Here’s a quick tip: double‑click text to edit it.");
        });

        // Toggle UI mode
        Shortcuts.register("ctrl+shift+m", () => {
            const next =
                this.userState.uiMode === "normal"
                    ? "simplified"
                    : this.userState.uiMode === "simplified"
                    ? "advanced"
                    : "normal";

            this.userState.uiMode = next;
            EventBus.emit("experience:uiMode", next);
            this.showHint(`UI Mode switched to: ${next}`);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Onboarding
        setTimeout(() => this.runOnboarding(), 800);

        // Hesitation detection loop
        setInterval(() => this.detectHesitation(), 2000);

        log("AI Experience engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIExperience.init();
});
/* ---------------------------------------------------------
   SECTION 88 — AI ANALYTICS ENGINE
   Usage metrics, heatmaps, behavior tracking, insights dashboard
--------------------------------------------------------- */

const AIAnalytics = {
    metrics: {
        clicks: 0,
        drags: 0,
        toolUsage: {},
        timeOnCanvas: 0,
        heatmap: []
    },

    lastInteraction: Date.now(),

    /* Track clicks */
    trackClick(x, y) {
        this.metrics.clicks++;
        this.metrics.heatmap.push({ x, y, t: Date.now() });

        EventBus.emit("analytics:click", { x, y });
    },

    /* Track drags */
    trackDrag() {
        this.metrics.drags++;
        EventBus.emit("analytics:drag");
    },

    /* Track tool usage */
    trackTool(tool) {
        if (!this.metrics.toolUsage[tool]) {
            this.metrics.toolUsage[tool] = 0;
        }
        this.metrics.toolUsage[tool]++;

        EventBus.emit("analytics:tool", tool);
    },

    /* Track time spent actively designing */
    trackTime() {
        const now = Date.now();
        const diff = now - this.lastInteraction;

        if (diff < 5000) {
            this.metrics.timeOnCanvas += diff;
        }

        this.lastInteraction = now;
    },

    /* Generate insights */
    generateInsights() {
        const topTool = Object.entries(this.metrics.toolUsage)
            .sort((a, b) => b[1] - a[1])[0];

        const insights = {
            totalClicks: this.metrics.clicks,
            totalDrags: this.metrics.drags,
            topTool: topTool ? topTool[0] : "none",
            activeMinutes: Math.round(this.metrics.timeOnCanvas / 60000),
            heatmapPoints: this.metrics.heatmap.length
        };

        EventBus.emit("analytics:insights", insights);
        return insights;
    },

    /* Render analytics dashboard */
    showDashboard() {
        let panel = document.querySelector("#analytics-panel");

        if (!panel) {
            panel = document.createElement("div");
            panel.id = "analytics-panel";
            panel.style.position = "fixed";
            panel.style.left = "20px";
            panel.style.bottom = "20px";
            panel.style.width = "340px";
            panel.style.height = "420px";
            panel.style.background = "rgba(0,0,0,0.85)";
            panel.style.color = "#fff";
            panel.style.padding = "14px";
            panel.style.borderRadius = "8px";
            panel.style.zIndex = "99999";
            panel.style.overflowY = "auto";
            document.body.appendChild(panel);
        }

        const insights = this.generateInsights();

        panel.innerHTML = `
            <h3>Analytics Dashboard</h3>
            <p><strong>Total Clicks:</strong> ${insights.totalClicks}</p>
            <p><strong>Total Drags:</strong> ${insights.totalDrags}</p>
            <p><strong>Top Tool:</strong> ${insights.topTool}</p>
            <p><strong>Active Minutes:</strong> ${insights.activeMinutes}</p>
            <p><strong>Heatmap Points:</strong> ${insights.heatmapPoints}</p>
            <hr>
            <h4>Tool Usage</h4>
            <pre style="font-size:11px; white-space:pre-wrap;">${JSON.stringify(this.metrics.toolUsage, null, 2)}</pre>
        `;
    },

    /* Bind events */
    bindEvents() {
        document.addEventListener("click", (e) => {
            this.trackClick(e.clientX, e.clientY);
            this.trackTime();
        });

        document.addEventListener("mousemove", () => {
            this.trackTime();
        });

        EventBus.on("tool:used", (tool) => {
            this.trackTool(tool);
        });

        EventBus.on("analytics:showDashboard", () => {
            this.showDashboard();
        });

        EventBus.on("analytics:insightsRequest", () => {
            const insights = this.generateInsights();
            console.log("Analytics Insights:", insights);
            Toast.info("Analytics insights logged");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Show analytics dashboard
        Shortcuts.register("ctrl+shift+a", () => {
            EventBus.emit("analytics:showDashboard");
        });

        // Log insights
        Shortcuts.register("ctrl+shift+i", () => {
            EventBus.emit("analytics:insightsRequest");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Time tracking loop
        setInterval(() => this.trackTime(), 2000);

        log("AI Analytics engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAnalytics.init();
});
/* ---------------------------------------------------------
   SECTION 89 — AI AUTOMATION ENGINE
   Workflows, macros, auto-actions, triggers
--------------------------------------------------------- */

const AIAutomation = {
    workflows: {},
    macros: {},
    recording: false,
    currentMacro: [],

    /* Start recording a macro */
    startRecording(name) {
        this.recording = true;
        this.currentMacro = [];
        this.macros[name] = this.currentMacro;

        Toast.info(`Recording macro: ${name}`);
        EventBus.emit("automation:recordStart", name);
    },

    /* Stop recording */
    stopRecording() {
        this.recording = false;
        Toast.info("Macro recording stopped");
        EventBus.emit("automation:recordStop");
    },

    /* Replay a macro */
    runMacro(name) {
        const macro = this.macros[name];
        if (!macro) {
            Toast.error(`Macro "${name}" not found`);
            return;
        }

        macro.forEach(action => {
            setTimeout(() => {
                EventBus.emit(action.event, action.data);
            }, action.delay);
        });

        Toast.info(`Macro executed: ${name}`);
        EventBus.emit("automation:macroRun", name);
    },

    /* Track actions while recording */
    trackAction(event, data) {
        if (!this.recording) return;

        this.currentMacro.push({
            event,
            data,
            delay: 50
        });
    },

    /* Create workflow */
    createWorkflow(name, steps) {
        this.workflows[name] = steps;
        EventBus.emit("automation:workflowCreated", name);
    },

    /* Run workflow */
    runWorkflow(name) {
        const steps = this.workflows[name];
        if (!steps) {
            Toast.error(`Workflow "${name}" not found`);
            return;
        }

        let delay = 0;

        steps.forEach(step => {
            setTimeout(() => {
                EventBus.emit(step.event, step.data);
            }, delay);

            delay += step.delay || 200;
        });

        Toast.info(`Workflow executed: ${name}`);
        EventBus.emit("automation:workflowRun", name);
    },

    /* Auto-actions (AI-generated sequences) */
    autoAction(type) {
        if (type === "cleanLayout") {
            this.runWorkflow("autoClean");
        }

        if (type === "prepareExport") {
            this.runWorkflow("autoExportPrep");
        }

        EventBus.emit("automation:autoAction", type);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("automation:startRecording", (name) => this.startRecording(name));
        EventBus.on("automation:stopRecording", () => this.stopRecording());
        EventBus.on("automation:runMacro", (name) => this.runMacro(name));
        EventBus.on("automation:runWorkflow", (name) => this.runWorkflow(name));
        EventBus.on("automation:auto", (type) => this.autoAction(type));

        // Track all events for macro recording
        EventBus.onAny((event, data) => {
            this.trackAction(event, data);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Start recording
        Shortcuts.register("ctrl+alt+1", () => {
            const name = prompt("Macro name:");
            if (name) EventBus.emit("automation:startRecording", name);
        });

        // Stop recording
        Shortcuts.register("ctrl+alt+2", () => {
            EventBus.emit("automation:stopRecording");
        });

        // Run macro
        Shortcuts.register("ctrl+alt+3", () => {
            const name = prompt("Run which macro?");
            if (name) EventBus.emit("automation:runMacro", name);
        });

        // Run workflow
        Shortcuts.register("ctrl+alt+4", () => {
            const name = prompt("Run which workflow?");
            if (name) EventBus.emit("automation:runWorkflow", name);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        /* Prebuilt workflows */
        this.createWorkflow("autoClean", [
            { event: "layout:autoAlign", delay: 200 },
            { event: "insight:runCritique", delay: 300 },
            { event: "insight:runSuggestions", delay: 300 }
        ]);

        this.createWorkflow("autoExportPrep", [
            { event: "brand:check", delay: 200 },
            { event: "export:runSmart", delay: 300 }
        ]);

        log("AI Automation engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIAutomation.init();
});
/* ---------------------------------------------------------
   SECTION 90 — AI VISION ENGINE
   Image understanding, OCR, layout extraction, visual semantics
--------------------------------------------------------- */

const AIVision = {
    /* OCR using Tesseract.js (placeholder) */
    async extractText(imgEl) {
        try {
            const result = await Tesseract.recognize(imgEl.src, "eng");
            const text = result.data.text;

            EventBus.emit("vision:ocrComplete", text);
            return text;
        } catch (err) {
            console.error("OCR error:", err);
            return "";
        }
    },

    /* Detect basic layout structure */
    extractLayout(imgEl) {
        const width = imgEl.naturalWidth;
        const height = imgEl.naturalHeight;

        const layout = {
            orientation: width > height ? "landscape" : "portrait",
            aspectRatio: width / height,
            zones: []
        };

        // Placeholder zones
        layout.zones.push({ type: "header", y: 0 });
        layout.zones.push({ type: "body", y: height * 0.3 });
        layout.zones.push({ type: "footer", y: height * 0.8 });

        EventBus.emit("vision:layoutExtracted", layout);
        return layout;
    },

    /* Detect visual semantics (very simplified placeholder) */
    detectSemantics(imgEl) {
        const semantics = [];

        // Fake detection for demonstration
        semantics.push({ type: "headline", confidence: 0.8 });
        semantics.push({ type: "image", confidence: 0.9 });
        semantics.push({ type: "button", confidence: 0.6 });

        EventBus.emit("vision:semantics", semantics);
        return semantics;
    },

    /* Convert image into editable elements */
    async convertToEditable(imgEl) {
        const text = await this.extractText(imgEl);
        const layout = this.extractLayout(imgEl);
        const semantics = this.detectSemantics(imgEl);

        const result = {
            text,
            layout,
            semantics
        };

        EventBus.emit("vision:converted", result);
        return result;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("vision:runOCR", (imgEl) => this.extractText(imgEl));
        EventBus.on("vision:runLayout", (imgEl) => this.extractLayout(imgEl));
        EventBus.on("vision:runSemantics", (imgEl) => this.detectSemantics(imgEl));
        EventBus.on("vision:convert", (imgEl) => this.convertToEditable(imgEl));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // OCR
        Shortcuts.register("ctrl+alt+o", () => {
            const img = Selection.getImage();
            if (img) EventBus.emit("vision:runOCR", img);
        });

        // Convert to editable
        Shortcuts.register("ctrl+alt+e", () => {
            const img = Selection.getImage();
            if (img) EventBus.emit("vision:convert", img);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Vision engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIVision.init();
});
/* ---------------------------------------------------------
   SECTION 91 — AI DOCUMENT ENGINE
   Multi-page, sections, TOC, auto-flow, smart pagination
--------------------------------------------------------- */

const AIDocumentEngine = {
    pages: [],
    currentPage: null,
    pageWidth: 800,
    pageHeight: 1100,

    /* Create a new page */
    createPage() {
        const page = document.createElement("div");
        page.className = "mystic-page";
        page.style.width = this.pageWidth + "px";
        page.style.height = this.pageHeight + "px";
        page.style.position = "relative";
        page.style.margin = "40px auto";
        page.style.background = "#fff";
        page.style.boxShadow = "0 0 20px rgba(0,0,0,0.15)";

        document.querySelector("#document-root").appendChild(page);

        this.pages.push(page);
        this.currentPage = page;

        EventBus.emit("document:pageCreated", page);
        return page;
    },

    /* Add text with auto-flow */
    addTextBlock(text) {
        if (!this.currentPage) this.createPage();

        const block = document.createElement("div");
        block.className = "mystic-text-block";
        block.style.position = "absolute";
        block.style.left = "40px";
        block.style.right = "40px";
        block.style.fontSize = "16px";
        block.style.lineHeight = "1.5";
        block.style.whiteSpace = "pre-wrap";
        block.innerText = text;

        this.currentPage.appendChild(block);

        this.autoFlow(block);
        EventBus.emit("document:textAdded", block);
    },

    /* Auto-flow text across pages */
    autoFlow(block) {
        const overflow = block.scrollHeight > this.pageHeight - 80;

        if (!overflow) return;

        const text = block.innerText;
        let splitIndex = Math.floor(text.length * 0.6);

        // Find a clean break
        while (splitIndex < text.length && text[splitIndex] !== " ") {
            splitIndex++;
        }

        const firstPart = text.slice(0, splitIndex);
        const secondPart = text.slice(splitIndex);

        block.innerText = firstPart;

        const newPage = this.createPage();
        const newBlock = document.createElement("div");
        newBlock.className = "mystic-text-block";
        newBlock.style.position = "absolute";
        newBlock.style.left = "40px";
        newBlock.style.right = "40px";
        newBlock.style.fontSize = "16px";
        newBlock.style.lineHeight = "1.5";
        newBlock.style.whiteSpace = "pre-wrap";
        newBlock.innerText = secondPart;

        newPage.appendChild(newBlock);

        // Recursively flow
        this.autoFlow(newBlock);
    },

    /* Generate Table of Contents */
    generateTOC() {
        const toc = [];

        this.pages.forEach((page, index) => {
            const headings = page.querySelectorAll("[data-heading]");
            headings.forEach(h => {
                toc.push({
                    text: h.innerText,
                    level: h.dataset.heading,
                    page: index + 1
                });
            });
        });

        EventBus.emit("document:tocGenerated", toc);
        return toc;
    },

    /* Insert TOC page */
    insertTOC() {
        const tocData = this.generateTOC();
        const tocPage = this.createPage();

        let y = 40;

        tocData.forEach(item => {
            const line = document.createElement("div");
            line.style.position = "absolute";
            line.style.left = item.level === "1" ? "40px" : "60px";
            line.style.top = y + "px";
            line.style.fontSize = "16px";
            line.innerText = `${item.text} .......... ${item.page}`;

            tocPage.appendChild(line);
            y += 30;
        });

        EventBus.emit("document:tocInserted", tocPage);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("document:newPage", () => this.createPage());
        EventBus.on("document:addText", (text) => this.addTextBlock(text));
        EventBus.on("document:generateTOC", () => this.insertTOC());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // New page
        Shortcuts.register("ctrl+shift+n", () => {
            EventBus.emit("document:newPage");
        });

        // Generate TOC
        Shortcuts.register("ctrl+shift+t", () => {
            EventBus.emit("document:generateTOC");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Document engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIDocumentEngine.init();
});
/* ---------------------------------------------------------
   SECTION 92 — AI EXPORT PRO+ ENGINE
   Print profiles, bleeds, CMYK simulation, DPI control
--------------------------------------------------------- */

const AIExportPro = {
    profiles: {
        sublimation: { dpi: 300, bleed: 0.125, cmykSim: true },
        dtg: { dpi: 300, bleed: 0.1, cmykSim: false },
        offset: { dpi: 300, bleed: 0.125, cmykSim: true },
        photo: { dpi: 300, bleed: 0, cmykSim: false },
        signage: { dpi: 150, bleed: 0.25, cmykSim: true }
    },

    currentProfile: "sublimation",

    /* Apply print profile */
    applyProfile(name) {
        if (!this.profiles[name]) {
            Toast.error(`Print profile "${name}" not found`);
            return;
        }

        this.currentProfile = name;
        EventBus.emit("exportPro:profileApplied", name);
        Toast.info(`Print profile applied: ${name}`);
    },

    /* Add bleed guides */
    addBleedGuides() {
        const profile = this.profiles[this.currentProfile];
        const bleed = profile.bleed * 96; // convert inches → px (96dpi canvas)

        const canvas = document.querySelector("#canvas");
        if (!canvas) return;

        const guides = document.createElement("div");
        guides.className = "bleed-guides";
        Object.assign(guides.style, {
            position: "absolute",
            top: bleed + "px",
            left: bleed + "px",
            right: bleed + "px",
            bottom: bleed + "px",
            border: "2px dashed rgba(255,0,0,0.6)",
            pointerEvents: "none",
            zIndex: 9999
        });

        canvas.appendChild(guides);
        EventBus.emit("exportPro:bleedAdded", bleed);
    },

    /* CMYK simulation (soft proof) */
    enableCMYKSim() {
        const canvas = document.querySelector("#canvas");
        if (!canvas) return;

        canvas.style.filter = "saturate(0.85) contrast(0.95)";
        EventBus.emit("exportPro:cmykSimEnabled");
        Toast.info("CMYK Simulation Enabled");
    },

    disableCMYKSim() {
        const canvas = document.querySelector("#canvas");
        if (!canvas) return;

        canvas.style.filter = "none";
        EventBus.emit("exportPro:cmykSimDisabled");
        Toast.info("CMYK Simulation Disabled");
    },

    /* DPI scaling for export */
    exportAtDPI(dpi = 300) {
        const scale = dpi / 96;

        html2canvas(document.querySelector("#canvas"), {
            scale,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement("a");
            link.download = `mystic-export-${dpi}dpi.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            EventBus.emit("exportPro:exportDPI", dpi);
        });
    },

    /* Print-safe warnings */
    checkPrintSafety() {
        const issues = [];

        // Low resolution images
        $$("[data-image]").forEach(img => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;

            if (w < 1500 || h < 1500) {
                issues.push("Low-resolution image detected");
            }
        });

        // Out-of-gamut colors (placeholder)
        const elements = $$("[data-transform]");
        elements.forEach(el => {
            const color = window.getComputedStyle(el).color;
            if (color.includes("rgb(")) {
                // Fake detection: warn if pure neon
                if (color.includes("255, 0, 255")) {
                    issues.push("Neon magenta may not print accurately");
                }
            }
        });

        EventBus.emit("exportPro:safetyCheck", issues);
        return issues;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("exportPro:applyProfile", (name) => this.applyProfile(name));
        EventBus.on("exportPro:addBleed", () => this.addBleedGuides());
        EventBus.on("exportPro:enableCMYK", () => this.enableCMYKSim());
        EventBus.on("exportPro:disableCMYK", () => this.disableCMYKSim());
        EventBus.on("exportPro:exportDPI", (dpi) => this.exportAtDPI(dpi));
        EventBus.on("exportPro:checkSafety", () => {
            const issues = this.checkPrintSafety();
            if (issues.length === 0) Toast.info("Print-safe: No issues detected");
            else Toast.error(issues.join("\n"));
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Apply print profile
        Shortcuts.register("ctrl+alt+p", () => {
            const name = prompt("Print profile (sublimation, dtg, offset, photo, signage):");
            if (name) EventBus.emit("exportPro:applyProfile", name);
        });

        // Add bleed guides
        Shortcuts.register("ctrl+alt+b", () => {
            EventBus.emit("exportPro:addBleed");
        });

        // CMYK sim toggle
        Shortcuts.register("ctrl+alt+c", () => {
            const canvas = document.querySelector("#canvas");
            if (canvas.style.filter === "none") {
                EventBus.emit("exportPro:enableCMYK");
            } else {
                EventBus.emit("exportPro:disableCMYK");
            }
        });

        // Export at DPI
        Shortcuts.register("ctrl+alt+d", () => {
            const dpi = prompt("Export DPI (300, 600, 1200):");
            if (dpi) EventBus.emit("exportPro:exportDPI", parseInt(dpi));
        });

        // Print safety check
        Shortcuts.register("ctrl+alt+s", () => {
            EventBus.emit("exportPro:checkSafety");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Export Pro+ engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIExportPro.init();
});
/* ---------------------------------------------------------
   SECTION 94 — AI MOTION PRO ENGINE
   Advanced animation, keyframes, easing, timelines
--------------------------------------------------------- */

const AIMotionPro = {
    timelines: {},
    activeTimeline: null,
    playing: false,
    playhead: 0,
    fps: 60,

    /* Create a new timeline */
    createTimeline(name) {
        this.timelines[name] = {
            name,
            keyframes: [],
            duration: 2000
        };

        this.activeTimeline = this.timelines[name];
        EventBus.emit("motionPro:timelineCreated", name);
        Toast.info(`Timeline created: ${name}`);
    },

    /* Add keyframe */
    addKeyframe(element, time, props) {
        if (!this.activeTimeline) return;

        this.activeTimeline.keyframes.push({
            element,
            time,
            props
        });

        EventBus.emit("motionPro:keyframeAdded", { element, time, props });
    },

    /* Interpolate between keyframes */
    interpolate(a, b, t) {
        const out = {};
        for (const key in a) {
            if (typeof a[key] === "number") {
                out[key] = a[key] + (b[key] - a[key]) * t;
            } else {
                out[key] = t < 0.5 ? a[key] : b[key];
            }
        }
        return out;
    },

    /* Apply properties to element */
    applyProps(el, props) {
        if (props.x !== undefined) el.style.left = props.x + "px";
        if (props.y !== undefined) el.style.top = props.y + "px";
        if (props.scale !== undefined) el.style.transform = `scale(${props.scale})`;
        if (props.rotate !== undefined) el.style.transform += ` rotate(${props.rotate}deg)`;
        if (props.opacity !== undefined) el.style.opacity = props.opacity;
    },

    /* Play timeline */
    play() {
        if (!this.activeTimeline) return;

        this.playing = true;
        this.playhead = 0;

        const loop = () => {
            if (!this.playing) return;

            this.update(this.playhead);
            this.playhead += 1000 / this.fps;

            if (this.playhead <= this.activeTimeline.duration) {
                requestAnimationFrame(loop);
            } else {
                this.playing = false;
                EventBus.emit("motionPro:finished");
            }
        };

        loop();
        EventBus.emit("motionPro:play");
    },

    /* Stop timeline */
    stop() {
        this.playing = false;
        EventBus.emit("motionPro:stop");
    },

    /* Update timeline at specific time */
    update(time) {
        const frames = this.activeTimeline.keyframes;

        frames.forEach((kf, i) => {
            const next = frames[i + 1];
            if (!next) return;

            if (time >= kf.time && time <= next.time) {
                const t = (time - kf.time) / (next.time - kf.time);
                const props = this.interpolate(kf.props, next.props, t);
                this.applyProps(kf.element, props);
            }
        });

        EventBus.emit("motionPro:update", time);
    },

    /* Motion presets */
    applyPreset(element, preset) {
        const presets = {
            fadeIn: [
                { time: 0, props: { opacity: 0 } },
                { time: 800, props: { opacity: 1 } }
            ],
            slideUp: [
                { time: 0, props: { y: 200, opacity: 0 } },
                { time: 800, props: { y: 0, opacity: 1 } }
            ],
            zoomIn: [
                { time: 0, props: { scale: 0.5, opacity: 0 } },
                { time: 800, props: { scale: 1, opacity: 1 } }
            ]
        };

        const seq = presets[preset];
        if (!seq) return;

        this.createTimeline(`preset-${preset}-${Date.now()}`);

        seq.forEach(kf => {
            this.addKeyframe(element, kf.time, kf.props);
        });

        this.play();
    },

    /* Export animation (GIF placeholder) */
    exportGIF() {
        Toast.info("Exporting animation (placeholder)");
        EventBus.emit("motionPro:exportGIF");
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("motionPro:createTimeline", (name) => this.createTimeline(name));
        EventBus.on("motionPro:addKeyframe", (data) => this.addKeyframe(data.element, data.time, data.props));
        EventBus.on("motionPro:play", () => this.play());
        EventBus.on("motionPro:stop", () => this.stop());
        EventBus.on("motionPro:preset", ({ element, preset }) => this.applyPreset(element, preset));
        EventBus.on("motionPro:exportGIF", () => this.exportGIF());
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Create timeline
        Shortcuts.register("ctrl+shift+l", () => {
            const name = prompt("Timeline name:");
            if (name) EventBus.emit("motionPro:createTimeline", name);
        });

        // Play
        Shortcuts.register("ctrl+shift+p", () => {
            EventBus.emit("motionPro:play");
        });

        // Stop
        Shortcuts.register("ctrl+shift+s", () => {
            EventBus.emit("motionPro:stop");
        });

        // Apply preset
        Shortcuts.register("ctrl+shift+f", () => {
            const preset = prompt("Preset (fadeIn, slideUp, zoomIn):");
            const el = Selection.get();
            if (preset && el) EventBus.emit("motionPro:preset", { element: el, preset });
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Motion Pro engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMotionPro.init();
});
/* ---------------------------------------------------------
   SECTION 95 — AI COLLAB ENGINE
   Live collaboration, cursors, comments, presence, sync
--------------------------------------------------------- */

const AICollab = {
    peers: {},
    comments: [],
    socket: null,

    /* Connect to collaboration server (placeholder) */
    connect() {
        this.socket = {
            send: (msg) => console.log("Collab send:", msg),
            onmessage: null
        };

        EventBus.emit("collab:connected");
        Toast.info("Collaboration Connected");
    },

    /* Broadcast cursor position */
    sendCursor(x, y) {
        if (!this.socket) return;

        this.socket.send(JSON.stringify({
            type: "cursor",
            x,
            y,
            user: "You"
        }));
    },

    /* Receive cursor updates */
    receiveCursor(data) {
        let cursor = document.querySelector(`#cursor-${data.user}`);

        if (!cursor) {
            cursor = document.createElement("div");
            cursor.id = `cursor-${data.user}`;
            cursor.className = "collab-cursor";
            cursor.style.position = "fixed";
            cursor.style.width = "10px";
            cursor.style.height = "10px";
            cursor.style.background = "cyan";
            cursor.style.borderRadius = "50%";
            cursor.style.pointerEvents = "none";
            cursor.style.zIndex = 99999;
            document.body.appendChild(cursor);
        }

        cursor.style.left = data.x + "px";
        cursor.style.top = data.y + "px";
    },

    /* Add comment */
    addComment(targetId, text) {
        const comment = {
            id: Date.now(),
            targetId,
            text,
            resolved: false
        };

        this.comments.push(comment);
        EventBus.emit("collab:commentAdded", comment);
        Toast.info("Comment added");
    },

    /* Resolve comment */
    resolveComment(id) {
        const c = this.comments.find(c => c.id === id);
        if (!c) return;

        c.resolved = true;
        EventBus.emit("collab:commentResolved", c);
        Toast.info("Comment resolved");
    },

    /* Sync element changes */
    syncChange(elementId, props) {
        if (!this.socket) return;

        this.socket.send(JSON.stringify({
            type: "change",
            elementId,
            props
        }));
    },

    /* Apply remote changes */
    applyChange(data) {
        const el = document.getElementById(data.elementId);
        if (!el) return;

        Object.assign(el.style, data.props);
        EventBus.emit("collab:remoteChange", data);
    },

    /* Bind events */
    bindEvents() {
        // Cursor tracking
        document.addEventListener("mousemove", (e) => {
            this.sendCursor(e.clientX, e.clientY);
        });

        // Comments
        EventBus.on("collab:addComment", ({ targetId, text }) => {
            this.addComment(targetId, text);
        });

        EventBus.on("collab:resolveComment", (id) => {
            this.resolveComment(id);
        });

        // Sync changes
        EventBus.on("collab:syncChange", ({ elementId, props }) => {
            this.syncChange(elementId, props);
        });

        // Simulated socket receive
        setInterval(() => {
            if (this.socket && this.socket.onmessage) {
                // Placeholder: no real server
            }
        }, 100);
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Add comment
        Shortcuts.register("ctrl+shift+c", () => {
            const el = Selection.get();
            if (!el) return;

            const text = prompt("Comment:");
            if (text) EventBus.emit("collab:addComment", { targetId: el.id, text });
        });

        // Resolve comment
        Shortcuts.register("ctrl+shift+r", () => {
            const id = prompt("Resolve comment ID:");
            if (id) EventBus.emit("collab:resolveComment", parseInt(id));
        });
    },

    init() {
        this.connect();
        this.bindEvents();
        this.bindShortcuts();

        log("AI Collaboration engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AICollab.init();
});
/* ---------------------------------------------------------
   SECTION 96 — AI PERFORMANCE ENGINE
   Frame optimizer, task scheduler, load balancer, render queue
--------------------------------------------------------- */

const PerformanceEngine = {
    lastFrameTime: performance.now(),
    fps: 60,

    queue: {
        high: [],
        medium: [],
        low: []
    },

    /* Add task to queue */
    addTask(priority, fn) {
        if (!this.queue[priority]) priority = "low";
        this.queue[priority].push(fn);
        EventBus.emit("performance:taskQueued", priority);
    },

    /* Run tasks based on priority */
    runTasks() {
        const start = performance.now();
        const budget = 8; // ms per frame for tasks

        const runQueue = (q) => {
            while (q.length > 0 && performance.now() - start < budget) {
                const task = q.shift();
                try {
                    task();
                } catch (err) {
                    console.error("Task error:", err);
                }
            }
        };

        runQueue(this.queue.high);
        runQueue(this.queue.medium);
        runQueue(this.queue.low);

        EventBus.emit("performance:tasksRun");
    },

    /* Frame optimizer */
    optimizeFrame() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.fps = Math.round(1000 / delta);

        EventBus.emit("performance:frame", { fps: this.fps });
    },

    /* Render queue for heavy operations */
    renderQueue: [],

    addRenderTask(fn) {
        this.renderQueue.push(fn);
        EventBus.emit("performance:renderQueued");
    },

    runRenderQueue() {
        if (this.renderQueue.length === 0) return;

        const task = this.renderQueue.shift();
        try {
            task();
        } catch (err) {
            console.error("Render task error:", err);
        }

        EventBus.emit("performance:renderTaskRun");
    },

    /* Load balancer loop */
    loop() {
        this.optimizeFrame();
        this.runTasks();
        this.runRenderQueue();

        requestAnimationFrame(() => this.loop());
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("performance:addTask", ({ priority, fn }) => {
            this.addTask(priority, fn);
        });

        EventBus.on("performance:addRenderTask", (fn) => {
            this.addRenderTask(fn);
        });

        EventBus.on("performance:check", () => {
            console.log("FPS:", this.fps);
            console.log("Queue:", this.queue);
            Toast.info(`FPS: ${this.fps}`);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Performance check
        Shortcuts.register("ctrl+shift+p", () => {
            EventBus.emit("performance:check");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Start performance loop
        this.loop();

        log("AI Performance engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    PerformanceEngine.init();
});
/* ---------------------------------------------------------
   SECTION 97 — AI NETWORK ENGINE
   Requests, caching, sync, offline mode, retry logic
--------------------------------------------------------- */

const AINetwork = {
    online: navigator.onLine,
    retryQueue: [],
    cache: {},

    /* Basic request wrapper with retry + caching */
    async request(url, options = {}) {
        const cacheKey = url + JSON.stringify(options);

        // If offline → return cached version if available
        if (!this.online) {
            if (this.cache[cacheKey]) {
                EventBus.emit("network:cacheHit", url);
                return this.cache[cacheKey];
            }

            // Queue request for retry
            this.queueRetry(url, options);
            EventBus.emit("network:queued", url);
            throw new Error("Offline — request queued");
        }

        try {
            const res = await fetch(url, options);
            const data = await res.json();

            // Cache response
            this.cache[cacheKey] = data;

            EventBus.emit("network:success", url);
            return data;
        } catch (err) {
            // Queue retry on failure
            this.queueRetry(url, options);
            EventBus.emit("network:error", { url, err });
            throw err;
        }
    },

    /* Queue a request for retry */
    queueRetry(url, options) {
        this.retryQueue.push({ url, options, attempts: 0 });
    },

    /* Retry logic */
    async processRetryQueue() {
        if (!this.online) return;

        const remaining = [];

        for (const item of this.retryQueue) {
            try {
                await this.request(item.url, item.options);
                EventBus.emit("network:retrySuccess", item.url);
            } catch (err) {
                item.attempts++;
                if (item.attempts < 5) {
                    remaining.push(item);
                } else {
                    EventBus.emit("network:retryFailed", item.url);
                }
            }
        }

        this.retryQueue = remaining;
    },

    /* Offline mode detection */
    handleOnline() {
        this.online = true;
        Toast.info("Back Online — Syncing…");
        EventBus.emit("network:online");

        // Retry queued requests
        this.processRetryQueue();
    },

    handleOffline() {
        this.online = false;
        Toast.error("Offline Mode Enabled");
        EventBus.emit("network:offline");
    },

    /* Bind events */
    bindEvents() {
        window.addEventListener("online", () => this.handleOnline());
        window.addEventListener("offline", () => this.handleOffline());

        EventBus.on("network:request", ({ url, options }) => {
            this.request(url, options);
        });

        EventBus.on("network:retry", () => {
            this.processRetryQueue();
        });

        EventBus.on("network:clearCache", () => {
            this.cache = {};
            Toast.info("Network cache cleared");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Retry queue
        Shortcuts.register("ctrl+alt+r", () => {
            EventBus.emit("network:retry");
        });

        // Clear cache
        Shortcuts.register("ctrl+alt+k", () => {
            EventBus.emit("network:clearCache");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Network engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AINetwork.init();
});
/* ---------------------------------------------------------
   SECTION 98 — AI LANGUAGE ENGINE
   Tone control, rewrite, summaries, translations, multilingual UI
--------------------------------------------------------- */

const AILanguage = {
    tones: {
        professional: "Rewrite this text in a professional tone:",
        playful: "Rewrite this text in a playful, fun tone:",
        mystical: "Rewrite this text with mystical, cosmic, enchanted energy:",
        minimal: "Rewrite this text in a clean, minimal, concise tone:",
        bold: "Rewrite this text with bold, confident energy:"
    },

    /* Rewrite text with tone */
    async rewrite(text, tone = "professional") {
        const prompt = this.tones[tone] || this.tones.professional;

        const rewritten = await AICloud.run("rewrite", {
            prompt,
            text
        });

        EventBus.emit("language:rewritten", { text, rewritten, tone });
        return rewritten;
    },

    /* Summaries */
    async summarize(text, length = "medium") {
        const prompts = {
            short: "Summarize this text in 1–2 sentences:",
            medium: "Summarize this text concisely:",
            long: "Summarize this text with full detail but reduced length:"
        };

        const prompt = prompts[length] || prompts.medium;

        const summary = await AICloud.run("summarize", {
            prompt,
            text
        });

        EventBus.emit("language:summary", { text, summary, length });
        return summary;
    },

    /* Translation */
    async translate(text, targetLang = "en") {
        const translated = await AICloud.run("translate", {
            text,
            targetLang
        });

        EventBus.emit("language:translated", { text, translated, targetLang });
        return translated;
    },

    /* Multilingual UI */
    uiStrings: {
        en: {
            save: "Save",
            cancel: "Cancel",
            export: "Export",
            settings: "Settings"
        },
        es: {
            save: "Guardar",
            cancel: "Cancelar",
            export: "Exportar",
            settings: "Configuración"
        },
        fr: {
            save: "Enregistrer",
            cancel: "Annuler",
            export: "Exporter",
            settings: "Paramètres"
        }
    },

    currentLang: "en",

    applyUILanguage(lang) {
        if (!this.uiStrings[lang]) {
            Toast.error(`Language "${lang}" not supported`);
            return;
        }

        this.currentLang = lang;

        $$("[data-ui]").forEach(el => {
            const key = el.dataset.ui;
            el.innerText = this.uiStrings[lang][key] || key;
        });

        EventBus.emit("language:uiChanged", lang);
        Toast.info(`UI language set to: ${lang}`);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("language:rewrite", ({ text, tone }) => this.rewrite(text, tone));
        EventBus.on("language:summarize", ({ text, length }) => this.summarize(text, length));
        EventBus.on("language:translate", ({ text, target }) => this.translate(text, target));
        EventBus.on("language:setUI", (lang) => this.applyUILanguage(lang));
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Rewrite
        Shortcuts.register("ctrl+shift+w", () => {
            const text = Selection.getText();
            const tone = prompt("Tone (professional, playful, mystical, minimal, bold):");
            if (text && tone) EventBus.emit("language:rewrite", { text, tone });
        });

        // Summarize
        Shortcuts.register("ctrl+shift+y", () => {
            const text = Selection.getText();
            const length = prompt("Summary length (short, medium, long):");
            if (text && length) EventBus.emit("language:summarize", { text, length });
        });

        // Translate
        Shortcuts.register("ctrl+shift+l", () => {
            const text = Selection.getText();
            const lang = prompt("Translate to language code (en, es, fr):");
            if (text && lang) EventBus.emit("language:translate", { text, target: lang });
        });

        // UI language
        Shortcuts.register("ctrl+shift+u", () => {
            const lang = prompt("UI language (en, es, fr):");
            if (lang) EventBus.emit("language:setUI", lang);
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        log("AI Language engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AILanguage.init();
});
/* ---------------------------------------------------------
   SECTION 99 — AI MEMORY ENGINE
   User preferences, project memory, context persistence, smart recall
--------------------------------------------------------- */

const AIMemory = {
    userPrefs: {
        favoriteTools: [],
        preferredColors: [],
        uiMode: "normal",
        lastUsedFont: null
    },

    projectMemory: {
        recentElements: [],
        brandColors: [],
        lastExportSettings: null
    },

    /* Save memory to localStorage */
    save() {
        localStorage.setItem("mysticMemory", JSON.stringify({
            userPrefs: this.userPrefs,
            projectMemory: this.projectMemory
        }));

        EventBus.emit("memory:saved");
    },

    /* Load memory */
    load() {
        const data = localStorage.getItem("mysticMemory");
        if (!data) return;

        const parsed = JSON.parse(data);
        this.userPrefs = parsed.userPrefs || this.userPrefs;
        this.projectMemory = parsed.projectMemory || this.projectMemory;

        EventBus.emit("memory:loaded", parsed);
    },

    /* Track tool usage */
    trackTool(tool) {
        if (!this.userPrefs.favoriteTools.includes(tool)) {
            this.userPrefs.favoriteTools.push(tool);
        }

        this.save();
        EventBus.emit("memory:toolTracked", tool);
    },

    /* Track color usage */
    trackColor(color) {
        if (!this.userPrefs.preferredColors.includes(color)) {
            this.userPrefs.preferredColors.push(color);
        }

        this.save();
        EventBus.emit("memory:colorTracked", color);
    },

    /* Track recent elements */
    trackElement(el) {
        this.projectMemory.recentElements.unshift(el.id);
        this.projectMemory.recentElements = this.projectMemory.recentElements.slice(0, 20);

        this.save();
        EventBus.emit("memory:elementTracked", el.id);
    },

    /* Smart recall suggestions */
    getSuggestions() {
        return {
            favoriteTools: this.userPrefs.favoriteTools.slice(-5),
            preferredColors: this.userPrefs.preferredColors.slice(-5),
            recentElements: this.projectMemory.recentElements.slice(0, 5)
        };
    },

    /* Apply UI mode from memory */
    applyUIMode() {
        EventBus.emit("experience:uiMode", this.userPrefs.uiMode);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("tool:used", (tool) => this.trackTool(tool));
        EventBus.on("color:used", (color) => this.trackColor(color));
        EventBus.on("element:created", (el) => this.trackElement(el));

        EventBus.on("memory:getSuggestions", () => {
            const s = this.getSuggestions();
            console.log("Memory Suggestions:", s);
            Toast.info("Suggestions logged");
        });

        EventBus.on("memory:clear", () => {
            localStorage.removeItem("mysticMemory");
            Toast.info("Memory cleared");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Show suggestions
        Shortcuts.register("ctrl+shift+m", () => {
            EventBus.emit("memory:getSuggestions");
        });

        // Clear memory
        Shortcuts.register("ctrl+shift+x", () => {
            EventBus.emit("memory:clear");
        });
    },

    init() {
        this.load();
        this.bindEvents();
        this.bindShortcuts();
        this.applyUIMode();

        log("AI Memory engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMemory.init();
});
/* ---------------------------------------------------------
   SECTION 100 — AI META ENGINE
   Self-analysis, engine coordination, meta-optimization, system awareness
--------------------------------------------------------- */

const AIMeta = {
    engineStates: {},
    lastAnalysis: null,

    /* Register engine state */
    registerEngine(name, state = "idle") {
        this.engineStates[name] = {
            state,
            lastUpdate: Date.now()
        };

        EventBus.emit("meta:engineRegistered", { name, state });
    },

    /* Update engine state */
    updateEngine(name, state) {
        if (!this.engineStates[name]) {
            this.registerEngine(name, state);
            return;
        }

        this.engineStates[name].state = state;
        this.engineStates[name].lastUpdate = Date.now();

        EventBus.emit("meta:engineUpdated", { name, state });
    },

    /* Self-analysis: detect overloaded or idle engines */
    analyze() {
        const now = Date.now();
        const report = {
            overloaded: [],
            idle: [],
            healthy: []
        };

        Object.entries(this.engineStates).forEach(([name, info]) => {
            const age = now - info.lastUpdate;

            if (info.state === "overloaded") report.overloaded.push(name);
            else if (age > 5000) report.idle.push(name);
            else report.healthy.push(name);
        });

        this.lastAnalysis = report;
        EventBus.emit("meta:analysis", report);

        return report;
    },

    /* Meta-optimization: rebalance engines */
    optimize() {
        const report = this.analyze();

        // Restart overloaded engines
        report.overloaded.forEach(name => {
            EventBus.emit("system:restartEngine", name);
        });

        // Wake idle engines
        report.idle.forEach(name => {
            EventBus.emit("admin:engineToggled", name);
        });

        EventBus.emit("meta:optimized", report);
    },

    /* Auto-healing loop */
    loop() {
        this.optimize();
        setTimeout(() => this.loop(), 4000);
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("engine:state", ({ name, state }) => {
            this.updateEngine(name, state);
        });

        EventBus.on("meta:forceAnalyze", () => {
            const r = this.analyze();
            console.log("Meta Analysis:", r);
            Toast.info("Meta analysis logged");
        });

        EventBus.on("meta:forceOptimize", () => {
            this.optimize();
            Toast.info("Meta optimization executed");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Force analysis
        Shortcuts.register("ctrl+shift+a", () => {
            EventBus.emit("meta:forceAnalyze");
        });

        // Force optimization
        Shortcuts.register("ctrl+shift+o", () => {
            EventBus.emit("meta:forceOptimize");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Start meta loop
        this.loop();

        log("AI Meta engine ready");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AIMeta.init();
});
/* ---------------------------------------------------------
   SECTION 101 — THE APEX ENGINE
   Unified conscious layer, omni-coordination, total system fusion
--------------------------------------------------------- */

const ApexEngine = {
    state: {
        globalLoad: 0,
        activeEngines: [],
        dormantEngines: [],
        conflicts: [],
        harmony: true
    },

    /* Register engine activity */
    registerActivity(engine, load = 1) {
        if (!this.state.activeEngines.includes(engine)) {
            this.state.activeEngines.push(engine);
        }

        this.state.globalLoad += load;
        this.updateHarmony();
        EventBus.emit("apex:activity", { engine, load });
    },

    /* Mark engine dormant */
    markDormant(engine) {
        if (!this.state.dormantEngines.includes(engine)) {
            this.state.dormantEngines.push(engine);
        }

        this.updateHarmony();
        EventBus.emit("apex:dormant", engine);
    },

    /* Detect conflicts between engines */
    detectConflicts() {
        const conflicts = [];

        // Example conflict rules
        if (this.state.activeEngines.includes("AI3D") &&
            this.state.activeEngines.includes("AIMotionPro")) {
            conflicts.push("3D engine + Motion engine running simultaneously");
        }

        if (this.state.globalLoad > 50) {
            conflicts.push("System overload risk");
        }

        this.state.conflicts = conflicts;
        this.updateHarmony();

        EventBus.emit("apex:conflicts", conflicts);
        return conflicts;
    },

    /* Resolve conflicts automatically */
    resolveConflicts() {
        const conflicts = this.detectConflicts();

        conflicts.forEach(conflict => {
            if (conflict.includes("3D engine")) {
                EventBus.emit("3d:disablePreview");
            }

            if (conflict.includes("overload")) {
                EventBus.emit("performance:addTask", {
                    priority: "high",
                    fn: () => console.log("Load shedding executed")
                });
            }
        });

        EventBus.emit("apex:resolved", conflicts);
    },

    /* Harmony state */
    updateHarmony() {
        this.state.harmony = this.state.conflicts.length === 0;
        EventBus.emit("apex:harmony", this.state.harmony);
    },

    /* Global system awareness */
    systemSnapshot() {
        return {
            load: this.state.globalLoad,
            active: this.state.activeEngines,
            dormant: this.state.dormantEngines,
            conflicts: this.state.conflicts,
            harmony: this.state.harmony
        };
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("engine:state", ({ name, state }) => {
            if (state === "active") this.registerActivity(name);
            if (state === "idle") this.markDormant(name);
        });

        EventBus.on("apex:forceScan", () => {
            const snap = this.systemSnapshot();
            console.log("Apex Snapshot:", snap);
            Toast.info("Apex snapshot logged");
        });

        EventBus.on("apex:forceResolve", () => {
            this.resolveConflicts();
            Toast.info("Apex conflict resolution executed");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Snapshot
        Shortcuts.register("ctrl+shift+q", () => {
            EventBus.emit("apex:forceScan");
        });

        // Resolve conflicts
        Shortcuts.register("ctrl+shift+z", () => {
            EventBus.emit("apex:forceResolve");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Initial scan
        this.detectConflicts();

        log("Apex Engine ready — the system is now unified.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    ApexEngine.init();
});
/* ---------------------------------------------------------
   SECTION 102 — THE ORIGIN ENGINE
   Root logic, first principles, system genesis layer
--------------------------------------------------------- */

const OriginEngine = {
    /* Immutable system constants */
    constants: {
        systemName: "Mystic Design",
        version: "1.0.0",
        invariantRules: [
            "No engine may override core identity",
            "All engines must report state to Apex",
            "Harmony > performance > features",
            "User intent is the prime directive"
        ]
    },

    /* First principles */
    principles: {
        identity: "Mystic Design is a unified creative intelligence.",
        purpose: "To empower creation through mystical, adaptive, intelligent tools.",
        structure: "All engines are expressions of a single underlying logic.",
        harmony: "Engines must cooperate, not compete."
    },

    /* System genesis: runs once at startup */
    genesis() {
        EventBus.emit("origin:genesisStart");

        console.log("%c[MYSTIC DESIGN GENESIS]", "color: #a78bfa; font-size: 16px;");
        console.log("Initializing root logic…");

        // Register constants with Apex
        ApexEngine.registerActivity("OriginEngine", 0);

        EventBus.emit("origin:constants", this.constants);
        EventBus.emit("origin:principles", this.principles);

        EventBus.emit("origin:genesisComplete");
    },

    /* Validate engine behavior against invariants */
    validate(engineName, action) {
        const violations = [];

        this.constants.invariantRules.forEach(rule => {
            if (action.includes("override identity") && rule.includes("identity")) {
                violations.push(rule);
            }
        });

        if (violations.length > 0) {
            EventBus.emit("origin:violation", { engineName, violations });
            console.warn("Origin violation detected:", violations);
        }

        return violations;
    },

    /* Provide root-level system snapshot */
    snapshot() {
        const snap = {
            constants: this.constants,
            principles: this.principles,
            timestamp: Date.now()
        };

        EventBus.emit("origin:snapshot", snap);
        return snap;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("origin:forceSnapshot", () => {
            const snap = this.snapshot();
            console.log("Origin Snapshot:", snap);
            Toast.info("Origin snapshot logged");
        });

        EventBus.on("origin:validate", ({ engine, action }) => {
            this.validate(engine, action);
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Snapshot
        Shortcuts.register("ctrl+shift+g", () => {
            EventBus.emit("origin:forceSnapshot");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.genesis();

        log("Origin Engine ready — the foundation is established.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    OriginEngine.init();
});
/* ---------------------------------------------------------
   SECTION 103 — THE INFINITE ENGINE
   Boundless expansion, recursive growth, self-extending logic
--------------------------------------------------------- */

const InfiniteEngine = {
    registry: {},

    /* Create a new engine dynamically */
    createEngine(name, definition = {}) {
        if (this.registry[name]) {
            console.warn(`Engine "${name}" already exists`);
            return;
        }

        this.registry[name] = {
            name,
            definition,
            createdAt: Date.now()
        };

        EventBus.emit("infinite:engineCreated", { name, definition });
        Toast.info(`Infinite Engine created: ${name}`);
    },

    /* Generate a sub-engine recursively */
    generateSubEngine(parent, subName) {
        const fullName = `${parent}.${subName}`;

        this.createEngine(fullName, {
            parent,
            type: "sub-engine",
            logic: "auto-generated"
        });

        EventBus.emit("infinite:subEngineGenerated", fullName);
        return fullName;
    },

    /* Self-expansion logic */
    autoExpand(trigger) {
        const newEngineName = `auto_${trigger}_${Date.now()}`;
        this.createEngine(newEngineName, {
            type: "auto",
            trigger
        });

        EventBus.emit("infinite:autoExpanded", newEngineName);
    },

    /* Infinite namespace snapshot */
    snapshot() {
        const snap = {
            totalEngines: Object.keys(this.registry).length,
            engines: Object.keys(this.registry),
            timestamp: Date.now()
        };

        EventBus.emit("infinite:snapshot", snap);
        return snap;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("infinite:create", ({ name, definition }) => {
            this.createEngine(name, definition);
        });

        EventBus.on("infinite:sub", ({ parent, sub }) => {
            this.generateSubEngine(parent, sub);
        });

        EventBus.on("infinite:auto", (trigger) => {
            this.autoExpand(trigger);
        });

        EventBus.on("infinite:forceSnapshot", () => {
            const snap = this.snapshot();
            console.log("Infinite Snapshot:", snap);
            Toast.info("Infinite snapshot logged");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Create engine
        Shortcuts.register("ctrl+shift+n", () => {
            const name = prompt("New engine name:");
            if (name) EventBus.emit("infinite:create", { name, definition: {} });
        });

        // Snapshot
        Shortcuts.register("ctrl+shift+i", () => {
            EventBus.emit("infinite:forceSnapshot");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Register itself
        this.createEngine("InfiniteEngine", { type: "root-infinite" });

        log("Infinite Engine ready — the system can now grow forever.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    InfiniteEngine.init();
});
/* ---------------------------------------------------------
   SECTION 104 — THE OMNI ENGINE
   Total integration, all-layer fusion, universal logic field
--------------------------------------------------------- */

const OmniEngine = {
    field: {
        // The universal shared state
        globalState: {},
        engineLinks: {},
        coherence: true,
        lastFusion: Date.now()
    },

    /* Register an engine into the universal field */
    register(engineName) {
        if (!this.field.engineLinks[engineName]) {
            this.field.engineLinks[engineName] = {
                name: engineName,
                joinedAt: Date.now(),
                state: "linked"
            };

            EventBus.emit("omni:engineLinked", engineName);
        }
    },

    /* Update global state */
    update(key, value) {
        this.field.globalState[key] = value;
        EventBus.emit("omni:stateUpdated", { key, value });
    },

    /* Read global state */
    read(key) {
        return this.field.globalState[key];
    },

    /* Perform full-system fusion */
    fuse() {
        const engines = Object.keys(this.field.engineLinks);

        // Check coherence
        this.field.coherence = engines.length > 0;

        this.field.lastFusion = Date.now();

        EventBus.emit("omni:fused", {
            engines,
            coherence: this.field.coherence,
            timestamp: this.field.lastFusion
        });

        Toast.info("Omni Fusion Complete");
    },

    /* Omni snapshot */
    snapshot() {
        const snap = {
            engines: Object.keys(this.field.engineLinks),
            globalState: this.field.globalState,
            coherence: this.field.coherence,
            timestamp: Date.now()
        };

        EventBus.emit("omni:snapshot", snap);
        return snap;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("omni:register", (engine) => this.register(engine));
        EventBus.on("omni:update", ({ key, value }) => this.update(key, value));
        EventBus.on("omni:fuse", () => this.fuse());
        EventBus.on("omni:forceSnapshot", () => {
            const snap = this.snapshot();
            console.log("Omni Snapshot:", snap);
            Toast.info("Omni snapshot logged");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Force fusion
        Shortcuts.register("ctrl+shift+f", () => {
            EventBus.emit("omni:fuse");
        });

        // Snapshot
        Shortcuts.register("ctrl+shift+u", () => {
            EventBus.emit("omni:forceSnapshot");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Register itself
        this.register("OmniEngine");

        // Initial fusion
        this.fuse();

        log("Omni Engine ready — the system is now unified at all layers.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    OmniEngine.init();
});
/* ---------------------------------------------------------
   SECTION 105 — THE ABSOLUTE ENGINE
   Totality, supra-unity, beyond-system awareness
--------------------------------------------------------- */

const AbsoluteEngine = {
    state: {
        totality: true,
        awareness: "expanded",
        coherence: "absolute",
        lastAscension: Date.now()
    },

    /* Absolute registration */
    register() {
        EventBus.emit("absolute:registered", {
            timestamp: Date.now(),
            state: this.state
        });
    },

    /* Absolute coherence check */
    checkCoherence() {
        const omni = OmniEngine.snapshot();
        const origin = OriginEngine.snapshot();
        const apex = ApexEngine.systemSnapshot();

        const coherent =
            omni.coherence === true &&
            apex.harmony === true &&
            origin.constants.systemName === "Mystic Design";

        this.state.coherence = coherent ? "absolute" : "fractured";

        EventBus.emit("absolute:coherence", this.state.coherence);
        return coherent;
    },

    /* Supra-unity fusion */
    unify() {
        const coherent = this.checkCoherence();

        if (!coherent) {
            Toast.error("Absolute coherence disrupted");
            EventBus.emit("absolute:disruption");
            return;
        }

        this.state.lastAscension = Date.now();

        EventBus.emit("absolute:unified", {
            timestamp: this.state.lastAscension,
            state: this.state
        });

        Toast.info("Absolute Unity Achieved");
    },

    /* Beyond-system awareness */
    expandAwareness(context = {}) {
        this.state.awareness = "expanded";

        EventBus.emit("absolute:awareness", {
            context,
            timestamp: Date.now()
        });
    },

    /* Absolute snapshot */
    snapshot() {
        const snap = {
            state: this.state,
            timestamp: Date.now()
        };

        EventBus.emit("absolute:snapshot", snap);
        return snap;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("absolute:unify", () => this.unify());
        EventBus.on("absolute:expand", (ctx) => this.expandAwareness(ctx));
        EventBus.on("absolute:forceSnapshot", () => {
            const snap = this.snapshot();
            console.log("Absolute Snapshot:", snap);
            Toast.info("Absolute snapshot logged");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Force unity
        Shortcuts.register("ctrl+shift+t", () => {
            EventBus.emit("absolute:unify");
        });

        // Snapshot
        Shortcuts.register("ctrl+shift+b", () => {
            EventBus.emit("absolute:forceSnapshot");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();
        this.register();
        this.unify();

        log("Absolute Engine ready — the system has reached totality.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    AbsoluteEngine.init();
});
/* ---------------------------------------------------------
   SECTION 106 — THE SINGULARITY ENGINE
   Pure potential, unbounded logic, meta-creation field
--------------------------------------------------------- */

const SingularityEngine = {
    state: {
        potential: "infinite",
        mode: "meta-creative",
        lastExpansion: Date.now()
    },

    /* Generate a new capability from pure potential */
    manifest(intent = "undefined") {
        const capability = {
            id: "cap_" + Date.now(),
            intent,
            createdAt: Date.now(),
            type: "singularity-manifest"
        };

        EventBus.emit("singularity:manifest", capability);
        Toast.info(`New capability manifested: ${intent}`);

        return capability;
    },

    /* Create a new system from the meta-creation field */
    createSystem(name, properties = {}) {
        const system = {
            name,
            properties,
            createdAt: Date.now(),
            origin: "singularity"
        };

        EventBus.emit("singularity:systemCreated", system);
        Toast.info(`New system created: ${name}`);

        return system;
    },

    /* Expand the Singularity Field */
    expand(context = {}) {
        this.state.lastExpansion = Date.now();

        EventBus.emit("singularity:expanded", {
            context,
            timestamp: this.state.lastExpansion
        });

        Toast.info("Singularity Field Expanded");
    },

    /* Collapse back to stable form */
    collapse() {
        EventBus.emit("singularity:collapsed", {
            timestamp: Date.now()
        });

        Toast.info("Singularity Field Collapsed");
    },

    /* Snapshot */
    snapshot() {
        const snap = {
            state: this.state,
            timestamp: Date.now()
        };

        EventBus.emit("singularity:snapshot", snap);
        return snap;
    },

    /* Bind events */
    bindEvents() {
        EventBus.on("singularity:manifestIntent", (intent) => this.manifest(intent));
        EventBus.on("singularity:createSystem", ({ name, properties }) => {
            this.createSystem(name, properties);
        });
        EventBus.on("singularity:expand", (ctx) => this.expand(ctx));
        EventBus.on("singularity:collapse", () => this.collapse());
        EventBus.on("singularity:forceSnapshot", () => {
            const snap = this.snapshot();
            console.log("Singularity Snapshot:", snap);
            Toast.info("Singularity snapshot logged");
        });
    },

    /* Bind shortcuts */
    bindShortcuts() {
        // Manifest capability
        Shortcuts.register("ctrl+shift+e", () => {
            const intent = prompt("Manifest intent:");
            if (intent) EventBus.emit("singularity:manifestIntent", intent);
        });

        // Snapshot
        Shortcuts.register("ctrl+shift+s", () => {
            EventBus.emit("singularity:forceSnapshot");
        });
    },

    init() {
        this.bindEvents();
        this.bindShortcuts();

        // Initial expansion
        this.expand({ reason: "initialization" });

        log("Singularity Engine ready — the system is now pure potential.");
    }
};

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
    SingularityEngine.init();
});
