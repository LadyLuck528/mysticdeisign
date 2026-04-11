export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const path = normalizePath(url.pathname)

  if (method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }))
  }

  try {
    if (path === '/admin/login') {
      if (method !== 'POST') {
        return json({ success: false, message: 'Method not allowed' }, 405)
      }

      const body = await safeJson(request)
      if (!body) {
        return json({ success: false, message: 'Invalid JSON body' }, 400)
      }

      const email = typeof body.email === 'string' ? body.email.trim() : ''
      const password = typeof body.password === 'string' ? body.password : ''

      if (!email || !password) {
        return json({ success: false, message: 'Missing email or password' }, 400)
      }

      const adminEmail = readEnv(env, ['ADMIN_EMAIL', 'CREATOR_EMAIL'])
      const adminKey = readEnv(env, ['ADMIN_LOGIN_KEY', 'CREATOR_LOGIN_KEY', 'ADMIN_PASSWORD'])
      const jwtSecret = readEnv(env, ['ADMIN_SESSION_SECRET', 'JWT_SECRET'])

      if (!adminEmail || !adminKey || !jwtSecret) {
        return json(
          {
            success: false,
            message: 'Worker secrets are not configured',
            missing: [
              !adminEmail ? 'ADMIN_EMAIL or CREATOR_EMAIL' : null,
              !adminKey ? 'ADMIN_LOGIN_KEY or CREATOR_LOGIN_KEY or ADMIN_PASSWORD' : null,
              !jwtSecret ? 'ADMIN_SESSION_SECRET or JWT_SECRET' : null
            ].filter(Boolean)
          },
          500
        )
      }

      if (email !== adminEmail || password !== adminKey) {
        return json({ success: false, message: 'Invalid email or password' }, 401)
      }

      const now = Math.floor(Date.now() / 1000)
      const exp = now + 24 * 60 * 60
      const token = await signJwt({ email, role: 'admin', exp }, jwtSecret)

      return json({ success: true, token, exp })
    }

    if (path === '/admin/orders') {
      if (method !== 'GET') {
        return json({ error: 'Method not allowed' }, 405)
      }

      const jwtSecret = readEnv(env, ['ADMIN_SESSION_SECRET', 'JWT_SECRET'])
      if (!jwtSecret) {
        return json({ error: 'Worker secret missing: ADMIN_SESSION_SECRET or JWT_SECRET' }, 500)
      }

      const auth = request.headers.get('Authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (!token) {
        return json({ error: 'Unauthorized' }, 401)
      }

      const valid = await verifyJwt(token, jwtSecret)
      if (!valid) {
        return json({ error: 'Unauthorized' }, 401)
      }

      const db = env.DB || env.D1_DB
      if (!db) {
        return json({ error: 'D1 binding missing: DB or D1_DB' }, 500)
      }

      const result = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
      return json(result.results || [])
    }

    if (path === '/upload') {
      if (method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405)
      }

      const bucket = env.UPLOADS || env.R2_BUCKET
      if (!bucket) {
        return json({ error: 'R2 binding missing: UPLOADS or R2_BUCKET' }, 500)
      }

      const form = await request.formData()
      const file = form.get('file')
      const orderId = String(form.get('orderId') || '').trim()

      if (!file || !orderId || typeof file.name !== 'string') {
        return json({ error: 'Missing file or orderId' }, 400)
      }

      const key = `uploads/${orderId}/${file.name}`
      await bucket.put(key, await file.arrayBuffer())

      return json({ success: true, key })
    }

    if (path === '/square/webhook') {
      if (method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405)
      }

      const db = env.DB || env.D1_DB
      if (!db) {
        return json({ ok: false, error: 'D1 binding missing: DB or D1_DB' }, 500)
      }

      const body = await safeJson(request)
      if (!body) {
        return json({ ok: false, error: 'Invalid JSON body' }, 400)
      }

      const orderId = body?.data?.object?.payment?.order_id
      const amount = body?.data?.object?.payment?.amount_money?.amount
      const email = body?.data?.object?.payment?.buyer_email_address || ''

      if (!orderId) {
        return json({ ok: true })
      }

      await db
        .prepare(
          `INSERT INTO orders (order_id, email, amount, created_at)
           VALUES (?, ?, ?, datetime('now'))`
        )
        .bind(orderId, email, amount)
        .run()

      return json({ ok: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return json(
      {
        error: 'Worker error',
        details: err && err.message ? err.message : String(err)
      },
      500
    )
  }
}

function normalizePath(path) {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function readEnv(env, keys) {
  for (const key of keys) {
    const value = env[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return ''
}

function withCors(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  return response
}

function json(data, status = 200) {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  )
}

async function safeJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function base64UrlEncodeString(value) {
  return btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlEncodeBytes(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecodeToString(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerPart = base64UrlEncodeString(JSON.stringify(header))
  const payloadPart = base64UrlEncodeString(JSON.stringify(payload))
  const data = `${headerPart}.${payloadPart}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const signaturePart = base64UrlEncodeBytes(new Uint8Array(signature))

  return `${data}.${signaturePart}`
}

async function verifyJwt(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }

    const [headerPart, payloadPart, signaturePart] = parts
    const data = `${headerPart}.${payloadPart}`

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBinary = base64UrlDecodeToString(signaturePart)
    const signatureBytes = new Uint8Array(signatureBinary.length)
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBytes[i] = signatureBinary.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(data)
    )

    if (!isValid) {
      return false
    }

    const payloadJson = base64UrlDecodeToString(payloadPart)
    const payload = JSON.parse(payloadJson)
    const now = Math.floor(Date.now() / 1000)

    return typeof payload.exp === 'number' ? payload.exp > now : true
  } catch {
    return false
  }
}
