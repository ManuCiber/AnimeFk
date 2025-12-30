import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Header from '@/components/Header'
import prisma from '@/lib/prisma'
import PinDetail from '@/components/PinDetail'

interface PinPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PinPageProps) {
  const pin = await prisma.pin.findUnique({
    where: { id: params.id },
    select: { title: true, description: true }
  })

  if (!pin) {
    return { title: 'Pin no encontrado' }
  }

  return {
    title: `${pin.title} | Pinterest Clone`,
    description: pin.description || pin.title,
  }
}

export default async function PinPage({ params }: PinPageProps) {
  const user = await currentUser()

  const pin = await prisma.pin.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, image: true, bio: true }
      },
      board: {
        select: { id: true, name: true }
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { likes: true, comments: true }
      },
      ...(user && {
        likes: {
          where: { userId: user.id },
          select: { id: true }
        }
      })
    }
  })

  if (!pin) {
    notFound()
  }

  const pinWithIsLiked = {
    ...pin,
    isLiked: user ? (pin.likes?.length || 0) > 0 : false,
    likes: undefined,
  }

  // Pins relacionados
  const relatedPins = await prisma.pin.findMany({
    where: {
      AND: [
        { id: { not: params.id } },
        {
          OR: [
            { userId: pin.userId },
            { tags: { hasSome: pin.tags } }
          ]
        }
      ]
    },
    take: 20,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PinDetail pin={pinWithIsLiked} relatedPins={relatedPins} />
    </div>
  )
}