import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import cloudinary from '@/lib/cloudinary'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result !== 'ok') {
      throw new Error('Failed to delete from Cloudinary')
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 })
  }
}