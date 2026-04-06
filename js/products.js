// Fetch products from your SquareSync backend
async function loadProducts() {
    const grid = document.querySelector(".grid");
    if (!grid) return;

    try {
        const res = await fetch("/functions/squareSync");
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            grid.innerHTML = `<p style="text-align:center; opacity:0.7;">No products found.</p>`;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button onclick="window.location.href='/product.html?id=${product.id}'">
                    View
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error loading products:", err);
        grid.innerHTML = `<p style="text-align:center; color:red;">Error loading products.</p>`;
    }
}
