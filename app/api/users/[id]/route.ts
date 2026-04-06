import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Issue from '@/models/Issue'
import { verifyTokenEdge } from '@/lib/auth-edge'
import { sendUserDeactivationEmail } from '@/lib/email'

// Toggle user active status (deactivate/activate)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyTokenEdge(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admin can manage user status
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params

    // Check if user exists and belongs to the same tenant
    const user = await User.findOne({ _id: id, tenantId: decoded.tenantId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === decoded.userId) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Toggle the active status
    const newActiveStatus = !user.isActive
    
    await User.findByIdAndUpdate(id, { isActive: newActiveStatus })
    
    // If deactivating user, unassign them from any issues within the same tenant
    if (!newActiveStatus) {
      await Issue.updateMany(
        { assignedTo: id, tenantId: decoded.tenantId },
        { $unset: { assignedTo: 1 } }
      )
      
      // Send warning email to deactivated user
      try {
        await sendUserDeactivationEmail(user.email, user.name)
      } catch (err) {
        console.error('Failed to send deactivation email:', err)
      }
    }

    return NextResponse.json({ 
      message: newActiveStatus ? 'User activated successfully' : 'User deactivated successfully',
      type: newActiveStatus ? 'activated' : 'deactivated',
      isActive: newActiveStatus
    })

  } catch (error) {
    console.error('Toggle user status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyTokenEdge(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admin can update users
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params
    const updates = await request.json()

    // Remove sensitive fields from updates
    delete updates.password
    delete updates._id
    delete updates.tenantId // Prevent changing tenantId

    const user = await User.findOneAndUpdate(
      { _id: id, tenantId: decoded.tenantId },
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
