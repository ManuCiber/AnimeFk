import Header from '@/components/Header'
import EmptyState from '@/components/EmptyState'
import MansoryGrid from '@/components/MansoryGrid'
import { Search } from 'lucide-react'
import { PinWithRelations } from '@/lib/types'
import prisma from '@/lib/prisma'

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  return {
    title: searchParams.q 
      ? `${searchParams.q} - Búsqueda | Pinterest Clone`
      : 'Búsqueda | Pinterest Clone',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  let pins: PinWithRelations[] = []

  if (query.trim()) {
    const searchQuery = query.trim().toLowerCase()

    pins = await prisma.pin.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: [searchQuery]
            }
          }
        ]
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    }) as PinWithRelations[]
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {query ? `Resultados para "${query}"` : 'Búsqueda'}
          </h1>
          {pins.length > 0 && (
            <p className="text-muted-foreground">
              {pins.length} {pins.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>

        {pins.length > 0 ? (
          <MansoryGrid pins={pins} />
        ) : query.trim() ? (
          <EmptyState
            icon={Search}
            title="No se encontraron resultados"
            description="Intenta con otras palabras clave"
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Busca inspiración"
            description="Usa la barra de búsqueda para encontrar pins"
          />
        )}
      </main>
    </div>
  )
}