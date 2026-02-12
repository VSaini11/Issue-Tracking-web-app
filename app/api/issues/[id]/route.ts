import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { verifyToken } from '@/lib/auth'
import { sendStatusUpdateEmail } from '@/lib/email'

// Update issue
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const updates = await request.json()

    // Check if user has permission to update
    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Clients can only update their own issues (limited fields)
    if (decoded.role === 'client' && issue.createdBy.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Limit what clients can update
    if (decoded.role === 'client') {
      const allowedUpdates = ['title', 'description', 'priority']
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: Record<string, unknown>, key) => {
          obj[key] = updates[key]
          return obj
        }, {})

      const updatedIssue = await Issue.findByIdAndUpdate(
        id,
        filteredUpdates,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email').populate('assignedTo', 'name email')

      return NextResponse.json({ issue: updatedIssue })
    }

    // Team and admin can update all fields
    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('assignedTo', 'name email')

    // Send email if status changed
    if (updates.status && updatedIssue.createdBy && updatedIssue.createdBy.email) {
      sendStatusUpdateEmail(
        updatedIssue.createdBy.email,
        updatedIssue.createdBy.name,
        updatedIssue.title,
        updates.status
      ).catch(err => console.error('Failed to send status update email:', err))
    }

    return NextResponse.json({ issue: updatedIssue })
  } catch (error) {
    console.error('Update issue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete issue
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admin can delete issues
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await dbConnect()

    const { id } = params
    const deletedIssue = await Issue.findByIdAndDelete(id)

    if (!deletedIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Issue deleted successfully' })
  } catch (error) {
    console.error('Delete issue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
