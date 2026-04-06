import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Meeting from '@/models/Meeting'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await dbConnect()
    
    // Notification for a meeting should only work for the admin who owns it in that tenant
    const meeting = await Meeting.findOneAndDelete({ _id: params.id, tenantId: decoded.tenantId })
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
