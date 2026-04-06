// Main site initializer
document.addEventListener("DOMContentLoaded", () => {
    console.log("Mystic site initialized.");

    // Load products into the homepage grid
    if (typeof loadProducts === "function") {
        loadProducts();
    }
});
