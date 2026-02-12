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

    // DEBUG: Find ALL active team members first to see what's in the DB
    const allTeamMembers = await User.find({ role: 'team', isActive: true })
    console.log(`[Re-Debug] Total Active Team Members in DB: ${allTeamMembers.length}`)
    allTeamMembers.forEach(m => {
      console.log(`[Re-Debug] User: ${m.name}, Role: ${m.role}, Categories: ${JSON.stringify(m.categories)}`)
    })

    // Find active team members who handle this category
    const staffMembers = await User.find({
      role: 'team',
      categories: { $in: [category.trim()] },
      isActive: true,
    })
      .select('name email')
      .sort({ name: 1 })

    console.log(`[Re-Debug] Searching staff for category: "${category}"`)
    console.log(`[Re-Debug] Found ${staffMembers.length} staff members:`, staffMembers.map(s => s.name))

    return NextResponse.json({ staffMembers })
  } catch (error) {
    console.error('Get staff members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
