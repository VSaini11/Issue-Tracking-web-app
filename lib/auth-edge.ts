// JWT utilities that work in Edge Runtime
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function verifyTokenEdge(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    // Split the JWT token
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [header, payload, signature] = parts
    
    // Decode the payload
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(`${header}.${payload}`)
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const expectedSignature = signature.replace(/-/g, '+').replace(/_/g, '/')
    const signatureBuffer = Uint8Array.from(atob(expectedSignature), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, data)
    
    if (!isValid) {
      return null
    }

    // Return the payload if valid
    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      role: decodedPayload.role
    }
  } catch (error) {
    return null
  }
}
