// /functions/admin-login.js

export const onRequestPost = async ({ request, env }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Compare with your secrets
    if (email !== env.CREATOR_EMAIL || password !== env.CREATOR_LOGIN_KEY) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 72 hours in seconds
    const expiresInSeconds = 72 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    const payload = {
      email,
      role: "admin",
      exp,
    };

    const token = await signJwt(payload, env.JWT_SECRET);

    return new Response(JSON.stringify({ token, exp }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// --- Minimal JWT HS256 signer using Web Crypto ---

async function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };

  const enc = (obj) =>
    btoa(
      JSON.stringify(obj)
    )
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const headerPart = enc(header);
  const payloadPart = enc(payload);
  const data = `${headerPart}.${payloadPart}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  const signatureBytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < signatureBytes.length; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }

  const signaturePart = btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signaturePart}`;
}
