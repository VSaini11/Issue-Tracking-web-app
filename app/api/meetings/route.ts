import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Meeting from '@/models/Meeting'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await dbConnect()
    const today = new Date().toISOString().split('T')[0]
    const meetings = await Meeting.find({ 
      adminId: decoded.userId,
      tenantId: decoded.tenantId,
      date: { $gte: today } 
    }).sort({ date: 1, time: 1 })
    
    return NextResponse.json({ meetings })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, date, time, link } = await request.json()
    
    // Detect platform
    let platform = 'other'
    if (link.toLowerCase().includes('zoom.us')) platform = 'zoom'
    else if (link.toLowerCase().includes('meet.google.com')) platform = 'meet'

    await dbConnect()
    const meeting = await Meeting.create({
      title,
      date,
      time,
      link,
      platform,
      adminId: decoded.userId,
      tenantId: decoded.tenantId,
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
