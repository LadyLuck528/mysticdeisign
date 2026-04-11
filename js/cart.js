/* --------------------------------------------------
   cart.js — Mystic Design Cart Engine
   - LocalStorage cart
   - Quantity updates
   - Remove items
   - Totals
   - Square checkout handoff
-------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const CART_KEY = "mystic_cart";
    const checkoutButton = document.getElementById("checkoutButton");

    let cart = loadCart();
    renderCart();
    updateTotals();

    /* -------------------------
       LOAD / SAVE CART
    -------------------------- */

    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    /* -------------------------
       RENDER CART ITEMS
    -------------------------- */

    function renderCart() {
        const container = document.getElementById("cartItems");
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `<div class="empty-cart">Your cart is empty</div>`;
            return;
        }

        container.innerHTML = cart
            .map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="" />

                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>

                        <div class="cart-item-qty">
                            <button class="qty-btn" data-action="minus">-</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" data-action="plus">+</button>
                        </div>
                    </div>

                    <button class="cart-remove" data-remove>&times;</button>
                </div>
            `)
            .join("");

        attachCartEvents();
    }

    /* -------------------------
       CART ITEM ACTIONS
    -------------------------- */

    function attachCartEvents() {
        const container = document.getElementById("cartItems");

        container.addEventListener("click", e => {
            const btn = e.target.closest(".qty-btn");
            const removeBtn = e.target.closest("[data-remove]");

            // Quantity buttons
            if (btn) {
                const itemEl = btn.closest(".cart-item");
                const id = itemEl.dataset.id;
                const action = btn.dataset.action;

                const item = cart.find(i => i.id === id);
                if (!item) return;

                if (action === "plus") item.qty++;
                if (action === "minus" && item.qty > 1) item.qty--;

                saveCart();
                renderCart();
                updateTotals();
                return;
            }

            // Remove item
            if (removeBtn) {
                const itemEl = removeBtn.closest(".cart-item");
                const id = itemEl.dataset.id;

                cart = cart.filter(i => i.id !== id);
                saveCart();
                renderCart();
                updateTotals();
            }
        });
    }

    /* -------------------------
       TOTALS
    -------------------------- */

    function updateTotals() {
        const subtotalEl = document.getElementById("cartSubtotal");
        const totalEl = document.getElementById("cartTotal");

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const total = subtotal; // shipping/tax added by Square

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }

    /* -------------------------
       CHECKOUT HANDOFF
    -------------------------- */

    if (checkoutButton) {
        checkoutButton.addEventListener("click", async () => {
            if (cart.length === 0) {
                alert("Your cart is empty");
                return;
            }

            // Send cart to Worker
            try {
                const response = await fetch("/api/square/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cart })
                });

                const data = await response.json();

                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    alert("Checkout failed. Please try again.");
                }
            } catch (err) {
                console.error(err);
                alert("Error connecting to checkout.");
            }
        });
    }
});
