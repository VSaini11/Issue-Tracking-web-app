import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// Get staff members by category
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

    await dbConnect()

    // Get category from query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Find active team members in the SAME tenant who handle this category
    const staffMembers = await User.find({
      role: 'team',
      tenantId: decoded.tenantId, // Security: Must be in the same organization
      isActive: true,
      $or: [
        { department: category.trim() },
        { categories: { $in: [category.trim()] } }
      ]
    })
      .select('name email')
      .sort({ name: 1 })

    return NextResponse.json({ staffMembers })
  } catch (error) {
    console.error('Get staff members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
