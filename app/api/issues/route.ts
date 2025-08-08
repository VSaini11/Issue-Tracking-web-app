import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { verifyToken } from '@/lib/auth'

// Get all issues
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const assignedTo = searchParams.get('assignedTo')

    // Build query based on user role
    const query: Record<string, any> = {}
    
    // If client, only show their issues
    if (decoded.role === 'client') {
      query.createdBy = decoded.userId
    }
    // For team members, show issues that are relevant to them
    else if (decoded.role === 'team') {
      // Team members see: all issues (they manage all issues)
      // Or you could filter to only assigned issues: query.assignedTo = decoded.userId
    }
    // Admin sees all issues (no additional filtering)

    // Apply filters
    if (status && status !== 'all') {
      query.status = status
    }
    if (category && category !== 'all') {
      query.category = category
    }
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo
    }

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email')
      .sort({ createdAt: -1 })

    return NextResponse.json({ issues })
  } catch (error) {
    console.error('Get issues error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new issue
export async function POST(request: NextRequest) {
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

    const { title, description, category, priority, dueDate, tags } = await request.json()

    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      createdBy: decoded.userId,
      dueDate: dueDate || null,
      tags: tags || [],
    })

    await issue.populate('createdBy', 'name email')

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
