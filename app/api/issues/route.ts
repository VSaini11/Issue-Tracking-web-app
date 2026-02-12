import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { verifyToken } from '@/lib/auth'
import { sendIssueAssignedEmail, sendIssueAssignedToReporterEmail } from '@/lib/email'
import { findBestStaffForIssue } from '@/lib/assignment'

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
      // Team members can view only the issues assigned to them
      query.assignedTo = decoded.userId
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

    const { title, description, category, priority, dueDate, tags, assignedTo } = await request.json()

    let finalAssignedTo = assignedTo

    // Auto-assignment logic if no staff is manually selected
    if (!finalAssignedTo) {
      try {
        finalAssignedTo = await findBestStaffForIssue(category)
      } catch (err) {
        console.error('Auto-assignment failed:', err)
        // Fallback to null (unassigned) if auto-assignment crashes
      }
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      createdBy: decoded.userId,
      assignedTo: finalAssignedTo || null,
      dueDate: dueDate || null,
      tags: tags || [],
    })

    await issue.populate('createdBy', 'name email')
    await issue.populate('assignedTo', 'name email')


    // Send email notification to assigned staff
    if (issue.assignedTo && issue.assignedTo.email) {
      // We don't await this to prevent blocking the response
      sendIssueAssignedEmail(
        issue.assignedTo.email,
        issue.assignedTo.name,
        issue.title,
        issue._id.toString(),
        issue.description,
        issue.priority
      ).catch(err => console.error('Failed to send assignment email:', err))
    }

    // Send email notification to reporter (client/employee)
    if (issue.createdBy && issue.createdBy.email && issue.assignedTo) {
      sendIssueAssignedToReporterEmail(
        issue.createdBy.email,
        issue.createdBy.name,
        issue.title,
        issue.assignedTo.name
      ).catch(err => console.error('Failed to send reporter assignment email:', err))
    }

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
