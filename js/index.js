export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // JSON helper
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
      });

    // Route: GET /api/products
    if (path.startsWith("/api/products")) {
      return env.PRODUCTS.fetch(request);
    }

    // Route: POST /api/orders
    if (path.startsWith("/api/orders")) {
      return env.ORDERS.fetch(request);
    }

    // Route: POST /api/upload
    if (path.startsWith("/api/upload")) {
      return env.UPLOAD.fetch(request);
    }

    // Default fallback
    return json({ error: "Route not found", path }, 404);
  }
};
