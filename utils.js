/* ============================
   utils.js
   Global Utility Functions
   ============================ */

/* ----- DOM Helpers ----- */

function $(selector, parent = document) {
    return parent.querySelector(selector);
}

function $all(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

/* ----- Event Helpers ----- */

function on(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
}

function off(element, event, handler) {
    if (!element) return;
    element.removeEventListener(event, handler);
}

/* ----- Throttle ----- */

function throttle(fn, limit) {
    let waiting = false;
    return function (...args) {
        if (!waiting) {
            fn.apply(this, args);
            waiting = true;
            setTimeout(() => waiting = false, limit);
        }
    };
}

/* ----- Debounce ----- */

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ----- Random ID ----- */

function randomID(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).substr(2, 9);
}

/* ----- Clamp ----- */

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/* ----- Load Image (Promise) ----- */

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject("Failed to load image: " + src);
        img.src = src;
    });
}