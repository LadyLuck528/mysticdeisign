export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // GET /api/products
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          products: [
            {
              id: 1,
              name: "Mystic Mug",
              price: 19.99,
              description: "A magical mug infused with cosmic vibes.",
              image: "/images/mug.jpg"
            },
            {
              id: 2,
              name: "Enchanted T‑Shirt",
              price: 24.99,
              description: "Soft, mystical, and screen‑printed with intention.",
              image: "/images/shirt.jpg"
            }
          ]
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }
};
