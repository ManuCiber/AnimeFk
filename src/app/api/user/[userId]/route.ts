import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    const pins = await prisma.pin.findMany({
      where: { userId: params.userId },
      take: limit,
      skip: skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    })

    const total = await prisma.pin.count({
      where: { userId: params.userId }
    })

    return NextResponse.json({
      pins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + pins.length < total,
      }
    })
  } catch (error) {
    console.error('Error fetching user pins:', error)
    return NextResponse.json({ error: 'Error fetching user pins' }, { status: 500 })
  }
}