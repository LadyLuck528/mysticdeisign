/* --------------------------------------------------
   checkout.js — Mystic POD Checkout Engine
   - Load cart
   - Render summary
   - Shipping
   - Tax
   - Customer info
   - Payment handoff
-------------------------------------------------- */

(function () {
    "use strict";

    const PODApp = window.PODApp;
    const { $, $$, on } = PODApp.dom;

    /* -------------------------
       CHECKOUT STATE
    -------------------------- */

    const Checkout = {
        cart: [],
        shipping: 0,
        tax: 0,
        subtotal: 0,
        total: 0,
        customer: {}
    };

    PODApp.checkout = Checkout;

    /* -------------------------
       INIT CHECKOUT
    -------------------------- */

    function initCheckout() {
        const container = $("#checkoutPage");
        if (!container) return;

        Checkout.cart = PODApp.storage.get("checkoutCart", []);
        if (!Checkout.cart.length) {
            $("#checkoutItems").innerHTML = `<div class="empty-cart">Your cart is empty</div>`;
            return;
        }

        renderItems();
        calculateTotals();
        initShippingOptions();
        initCustomerForm();
        initPaymentButton();

        if (PODApp.config.debug) {
            console.log("%cCheckout Ready", "color:#4cd964;font-weight:bold;");
        }
    }

    document.addEventListener("DOMContentLoaded", initCheckout);

    /* -------------------------
       RENDER ITEMS
    -------------------------- */

    function renderItems() {
        const container = $("#checkoutItems");

        container.innerHTML = Checkout.cart
            .map(item => {
                return `
                <div class="checkout-item">
                    <img src="${item.mockup}" class="checkout-thumb" />

                    <div class="checkout-info">
                        <div class="checkout-title">${item.title}</div>
                        <div class="checkout-variant">${item.variantName}</div>
                        <div class="checkout-price">$${item.price.toFixed(2)}</div>
                        <div class="checkout-qty">Qty: ${item.qty}</div>
                    </div>
                </div>
            `;
            })
            .join("");
    }

    /* -------------------------
       TOTALS
    -------------------------- */

    function calculateTotals() {
        Checkout.subtotal = Checkout.cart.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

        // Placeholder tax logic (8.25% Texas)
        Checkout.tax = Checkout.subtotal * 0.0825;

        Checkout.total = Checkout.subtotal + Checkout.tax + Checkout.shipping;

        $("#summarySubtotal").textContent = `$${Checkout.subtotal.toFixed(2)}`;
        $("#summaryTax").textContent = `$${Checkout.tax.toFixed(2)}`;
        $("#summaryShipping").textContent = `$${Checkout.shipping.toFixed(2)}`;
        $("#summaryTotal").textContent = `$${Checkout.total.toFixed(2)}`;
    }

    /* -------------------------
       SHIPPING OPTIONS
    -------------------------- */

    function initShippingOptions() {
        delegateShipping("standard", 4.99);
        delegateShipping("express", 12.99);
        delegateShipping("overnight", 24.99);
    }

    function delegateShipping(id, price) {
        const el = $(`#ship-${id}`);
        if (!el) return;

        on(el, "change", () => {
            Checkout.shipping = price;
            calculateTotals();
        });
    }

    /* -------------------------
       CUSTOMER FORM
    -------------------------- */

    function initCustomerForm() {
        const form = $("#customerForm");
        if (!form) return;

        on(form, "input", () => {
            Checkout.customer = {
                name: $("#custName").value.trim(),
                email: $("#custEmail").value.trim(),
                address: $("#custAddress").value.trim(),
                city: $("#custCity").value.trim(),
                state: $("#custState").value.trim(),
                zip: $("#custZip").value.trim()
            };
        });
    }

    function validateCustomer() {
        const c = Checkout.customer;

        if (!c.name || !c.email || !c.address || !c.city || !c.state || !c.zip) {
            PODApp.ui.showToast("Please complete all customer fields", "warning");
            return false;
        }

        return true;
    }

    /* -------------------------
       PAYMENT BUTTON
    -------------------------- */

    function initPaymentButton() {
        const btn = $("#payNowBtn");
        if (!btn) return;

        on(btn, "click", async () => {
            if (!validateCustomer()) return;

            PODApp.ui.showLoader("checkout");

            try {
                const orderPayload = buildOrderPayload();

                // Placeholder: send to backend
                console.log("Order payload:", orderPayload);

                // Simulate delay
                await new Promise(res => setTimeout(res, 1500));

                PODApp.ui.hideLoader("checkout");
                PODApp.ui.showToast("Order placed successfully!", "success");

                // Clear cart
                PODApp.storage.remove("cart");
                PODApp.storage.remove("checkoutCart");

                window.location.href = "/thankyou.html";
            } catch (err) {
                PODApp.ui.hideLoader("checkout");
                PODApp.handleError(err, "Checkout error");
            }
        });
    }

    /* -------------------------
       BUILD ORDER PAYLOAD
    -------------------------- */

    function buildOrderPayload() {
        return {
            customer: Checkout.customer,
            items: Checkout.cart,
            totals: {
                subtotal: Checkout.subtotal,
                tax: Checkout.tax,
                shipping: Checkout.shipping,
                total: Checkout.total
            },
            timestamp: Date.now()
        };
    }

})();
