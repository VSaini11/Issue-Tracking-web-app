import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params
    const { count } = await request.json()

    // Update the user's fiveStarRatingsCount with the provided count
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { fiveStarRatingsCount: count } },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      count: updatedUser.fiveStarRatingsCount 
    })
  } catch (error) {
    console.error('Failed to sync ratings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
