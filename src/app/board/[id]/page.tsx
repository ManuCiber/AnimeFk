import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Header from '@/components/Header'
import BoardView from '@/components/BoardView'
import { Lock } from 'lucide-react'
import prisma from '@/lib/prisma'

interface BoardPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: BoardPageProps) {
  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: { name: true, description: true, isPrivate: true }
  })

  if (!board) {
    return { title: 'Tablero no encontrado' }
  }

  return {
    title: `${board.name} | Pinterest Clone`,
    description: board.description || `Tablero ${board.name}`,
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const user = await currentUser()

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      pins: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { pins: true }
      }
    }
  })

  if (!board) {
    notFound()
  }

  // Verificar privacidad
  if (board.isPrivate && board.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Header />
        <div className="text-center">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tablero privado</h1>
          <p className="text-muted-foreground">Este tablero es privado</p>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === board.userId

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BoardView board={board} isOnwer={isOwner} />
    </div>
  )
}