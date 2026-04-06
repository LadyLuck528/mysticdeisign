export default {
  async fetch(request, env) {
    // Only allow POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405 }
      );
    }

    try {
      const contentType = request.headers.get("Content-Type") || "";

      // Ensure it's a form upload
      if (!contentType.includes("multipart/form-data")) {
        return new Response(
          JSON.stringify({ error: "Expected multipart/form-data" }),
          { status: 400 }
        );
      }

      // Parse form data
      const form = await request.formData();
      const file = form.get("file");

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file uploaded" }),
          { status: 400 }
        );
      }

      // Generate a unique filename
      const extension = file.name.split(".").pop();
      const key = `uploads/${crypto.randomUUID()}.${extension}`;

      // Upload to R2
      await env.UPLOADS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      // Public URL (Cloudflare R2 public bucket)
      const publicUrl = `${env.PUBLIC_URL}/${key}`;

      return new Response(
        JSON.stringify({
          success: true,
          key,
          url: publicUrl
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Upload failed", details: err.message }),
        { status: 500 }
      );
    }
  }
};
