export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // JSON helper
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
      });

    // POST /api/orders  → create order
    if (request.method === "POST") {
      try {
        const body = await request.json();

        const orderId = crypto.randomUUID();

        // Insert into D1
        await env.DB.prepare(
          `INSERT INTO orders 
           (id, customer_name, customer_email, product_id, product_name, price, upload_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          orderId,
          body.customer_name,
          body.customer_email,
          body.product_id,
          body.product_name,
          body.price,
          body.upload_url
        )
        .run();

        return json({
          success: true,
          orderId,
          message: "Order saved to D1"
        });

      } catch (err) {
        return json({ error: "Failed to create order", details: err.message }, 500);
      }
    }

    // GET /api/orders  → fetch all orders (admin)
    if (request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          "SELECT * FROM orders ORDER BY created_at DESC"
        ).all();

        return json({
          success: true,
          orders: result.results
        });

      } catch (err) {
        return json({ error: "Failed to fetch orders", details: err.message }, 500);
      }
    }

    return json({ error: "Method not allowed" }, 405);
  }
};
