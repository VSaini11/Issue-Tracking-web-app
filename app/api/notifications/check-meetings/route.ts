import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import { sendMeetingReminderEmail } from '@/lib/email'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()
    if (!meetingId) return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })

    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await dbConnect()
    
    // Find meeting and ensure it belongs to the same tenant and hasn't been notified yet
    const meeting = await Meeting.findOne({ _id: meetingId, tenantId: decoded.tenantId })
    if (!meeting || meeting.notified) {
      return NextResponse.json({ message: 'Already notified or not found' })
    }

    // Get admin user (must also be in the same tenant)
    const admin = await User.findOne({ _id: meeting.adminId, tenantId: decoded.tenantId })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    // Send email
    await sendMeetingReminderEmail(
      admin.email,
      admin.name,
      meeting.title,
      meeting.time,
      meeting.link,
      meeting.platform
    )

    // Mark as notified
    meeting.notified = true
    await meeting.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
