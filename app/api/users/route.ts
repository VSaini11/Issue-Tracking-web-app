import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only team and admin can view users
    if (decoded.role === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await dbConnect()

    // Show only users within the same tenant
    const users = await User.find({ tenantId: decoded.tenantId })
      .select('name email role department categories isActive createdAt')
      .sort({ name: 1 })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Only admin can create users' }, { status: 403 })
    }

    await dbConnect()

    const { email, password, name, role, department, categories } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const { hashPassword } = await import('@/lib/auth')
    const hashedPassword = await hashPassword(password)

    // Create user and automatically assign the same tenantId AND company info as the admin
    // We fetch the current admin's company info to ensure it's propagated
    const adminUser = await User.findById(decoded.userId)
    
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role, // 'team' or 'client'
      department: department || '',
      categories: categories || [],
      tenantId: decoded.tenantId, // Mandatory isolation
      companyName: adminUser?.companyName || '',
      companyWebsite: adminUser?.companyWebsite || '',
      companyLogo: adminUser?.companyLogo || '',
      isActive: true
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenantId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
