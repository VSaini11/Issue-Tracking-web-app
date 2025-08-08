import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Issue from '@/models/Issue'
import { verifyTokenEdge } from '@/lib/auth-edge'

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

    // Check if user exists
    const user = await User.findById(id)
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
    
    // If deactivating user, unassign them from any issues
    if (!newActiveStatus) {
      await Issue.updateMany(
        { assignedTo: id },
        { $unset: { assignedTo: 1 } }
      )
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

// Update user (for future use)
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

    const user = await User.findByIdAndUpdate(
      id,
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
