/* --------------------------------------------------
   cart.js — Mystic POD Cart Engine
   - Add / remove items
   - Update quantity
   - Cart badge
   - LocalStorage sync
   - Checkout handoff
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on } = PODApp.dom;
    const Events = PODApp.events;

    /* -------------------------
       CART STATE
    -------------------------- */

    const Cart = {
        items: [],
        badgeEl: null
    };

    PODApp.cart = Cart;

    /* -------------------------
       INIT CART
    -------------------------- */

    function initCart() {
        Cart.items = PODApp.storage.get("cart", []);
        Cart.badgeEl = $("[data-cart-badge]");

        updateBadge();
        renderCartPage();

        // Listen for updates from product.js
        Events.on("cart:updated", items => {
            Cart.items = items;
            PODApp.storage.set("cart", Cart.items);
            updateBadge();
            renderCartPage();
        });

        if (PODApp.config.debug) {
            console.log("%cCart Ready", "color:#ffcc00;font-weight:bold;");
        }
    }

    document.addEventListener("DOMContentLoaded", initCart);

    /* -------------------------
       BADGE UPDATE
    -------------------------- */

    function updateBadge() {
        if (!Cart.badgeEl) return;
        const count = Cart.items.reduce((sum, item) => sum + item.qty, 0);
        Cart.badgeEl.textContent = count;
        Cart.badgeEl.classList.toggle("show", count > 0);
    }

    /* -------------------------
       RENDER CART PAGE
    -------------------------- */

    function renderCartPage() {
        const container = $("#cartItems");
        if (!container) return;

        if (Cart.items.length === 0) {
            container.innerHTML = `<div class="empty-cart">Your cart is empty</div>`;
            updateTotals();
            return;
        }

        container.innerHTML = Cart.items
            .map(item => {
                return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.mockup}" class="cart-thumb" />

                    <div class="cart-info">
                        <div class="cart-title">${item.title}</div>
                        <div class="cart-variant">${item.variantName}</div>
                        <div class="cart-price">$${item.price.toFixed(2)}</div>

                        <div class="cart-qty">
                            <button class="qty-btn" data-action="minus">-</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" data-action="plus">+</button>
                        </div>
                    </div>

                    <button class="cart-remove" data-remove>&times;</button>
                </div>
            `;
            })
            .join("");

        initCartActions();
        updateTotals();
    }

    /* -------------------------
       CART ITEM ACTIONS
    -------------------------- */

    function initCartActions() {
        const container = $("#cartItems");
        if (!container) return;

        // Quantity buttons
        container.addEventListener("click", e => {
            const btn = e.target.closest(".qty-btn");
            if (!btn) return;

            const itemEl = btn.closest(".cart-item");
            const id = itemEl.dataset.id;
            const action = btn.dataset.action;

            const item = Cart.items.find(i => i.id === id);
            if (!item) return;

            if (action === "plus") item.qty++;
            if (action === "minus" && item.qty > 1) item.qty--;

            PODApp.storage.set("cart", Cart.items);
            renderCartPage();
            updateBadge();
        });

        // Remove item
        container.addEventListener("click", e => {
            const btn = e.target.closest("[data-remove]");
            if (!btn) return;

            const itemEl = btn.closest(".cart-item");
            const id = itemEl.dataset.id;

            Cart.items = Cart.items.filter(i => i.id !== id);
            PODApp.storage.set("cart", Cart.items);

            PODApp.ui.showToast("Item removed", "info");

            renderCartPage();
            updateBadge();
        });
    }

    /* -------------------------
       TOTALS
    -------------------------- */

    function updateTotals() {
        const subtotalEl = $("#cartSubtotal");
        const totalEl = $("#cartTotal");

        if (!subtotalEl || !totalEl) return;

        const subtotal = Cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const total = subtotal; // taxes/shipping added at checkout

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    /* -------------------------
       CHECKOUT HANDOFF
    -------------------------- */

    const checkoutBtn = $("#checkoutBtn");
    if (checkoutBtn) {
        on(checkoutBtn, "click", () => {
            if (Cart.items.length === 0) {
                PODApp.ui.showToast("Your cart is empty", "warning");
                return;
            }

            // Save cart for checkout page
            PODApp.storage.set("checkoutCart", Cart.items);

            window.location.href = "/checkout.html";
        });
    }

})();
