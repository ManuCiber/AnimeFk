import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}:{params: {id: string}}) {
    try {
        const {userId} = await auth()
        const board = await prisma.board.findUnique({
          where: { id: params.id },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            pins: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
                _count: {
                  select: { likes: true, comments: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: { pins: true },
            },
          },
        });

        if(!board) {
            return NextResponse.json({error: 'Board not found'}, {status: 400})
        }

        //Si es privado, solo el usuario que lo tiene puede verlo:

        if(board.isPrivate && board.userId !== userId){
            return NextResponse.json(
                {error: 'This board is private'},
                {status: 403}
            )
        }
        return NextResponse.json(board)

    } catch (error) {
        console.error('Error fetching board',error)
        return NextResponse.json({error: 'Error Fetching Board'}, {status: 500})        
    }
}


// PATCH -> Modificacion del board


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const board = await prisma.board.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    if (board.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isPrivate } = body

    const updatedBoard = await prisma.board.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        _count: {
          select: { pins: true }
        }
      }
    })

    return NextResponse.json(updatedBoard)
  } catch (error) {
    console.error('Error updating board:', error)
    return NextResponse.json(
      { error: 'Error updating board' },
      { status: 500 }
    )
  }
}

// DELETE /api/boards/[id] - Eliminar board
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const board = await prisma.board.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    if (board.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Los pins se mantienen pero se desasocian del board (por onDelete: SetNull en schema)
    await prisma.board.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Board deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { error: 'Error deleting board' },
      { status: 500 }
    )
  }
}