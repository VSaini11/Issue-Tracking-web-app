import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyTokenEdge(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    await dbConnect()
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
      },
    })
  } catch (error) {
    console.error('Me endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
