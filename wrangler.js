export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/ai-generate") {
      const { prompt } = await request.json();

      if (!prompt || typeof prompt !== "string") {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const openRouterRes = await fetch("https://openrouter.ai/api/v1/images", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "stabilityai/stable-diffusion-xl", // good default
          prompt
        })
      });

      if (!openRouterRes.ok) {
        const text = await openRouterRes.text();
        console.error("OpenRouter error:", text);
        return new Response(JSON.stringify({ error: "OpenRouter failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      const data = await openRouterRes.json();
      // Adjust this based on actual response shape
      const imageBase64 = data?.data?.[0]?.b64_json || null;

      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "No image returned" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ image: imageBase64 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
