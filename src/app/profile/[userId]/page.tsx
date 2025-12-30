import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ProfileView from '@/components/ProfileView'
import prisma from '@/lib/prisma'

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { name: true, bio: true }
  })

  if (!user) {
    return { title: 'Usuario no encontrado' }
  }

  return {
    title: `${user.name} | Pinterest Clone`,
    description: user.bio || `Perfil de ${user.name}`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      _count: {
        select: { pins: true }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const pins = await prisma.pin.findMany({
    where: { userId: params.userId },
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
      <ProfileView user={user} pins={pins} />
    </div>
  )
}