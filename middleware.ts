import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/register']
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for dashboard routes
  if (pathname.startsWith('/client-dashboard') || 
      pathname.startsWith('/team-dashboard') || 
      pathname.startsWith('/admin-dashboard')) {
    
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decoded = await verifyTokenEdge(token)
    if (!decoded) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('token')
      return response
    }

    // Check role-based access
    if (pathname.startsWith('/client-dashboard') && decoded.role !== 'client') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    if (pathname.startsWith('/team-dashboard') && !['team', 'admin'].includes(decoded.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    if (pathname.startsWith('/admin-dashboard') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Access granted
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
