'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  MoreHorizontal,
  Send,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import MansoryGrid from './MansoryGrid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { PinDetail as PinDetailType, PinWithRelations } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PinDetailProps {
  pin: PinDetailType
  relatedPins: PinWithRelations[]
}

export default function PinDetail({ pin, relatedPins }: PinDetailProps) {
  const router = useRouter()
  const { user } = useUser()
  const [liked, setLiked] = useState(pin.isLiked)
  const [likesCount, setLikesCount] = useState(pin._count.likes)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isOwner = user?.id === pin.userId

  const handleLike = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para dar like")
      return
    }

    const newLikedState = !liked
    setLiked(newLikedState)
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1)

    try {
      const response = await fetch(`/api/pins/${pin.id}/like`, {
        method: newLikedState ? 'POST' : 'DELETE',
      })

      if (!response.ok) throw new Error()

      const data = await response.json()
      setLikesCount(data.likesCount)
      
      if (newLikedState) {
        toast.success("¡Te gusta este pin!")
      }
    } catch (error) {
      setLiked(!newLikedState)
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1)
      toast.error("No se pudo actualizar el like")
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !commentText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/pins/${pin.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() })
      })

      if (response.ok) {
        setCommentText('')
        router.refresh()
        toast.success("Comentario publicado correctamente")
      }
    } catch (error) {
      toast.error("No se pudo publicar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este pin?')) return

    const deletePromise = fetch(`/api/pins/${pin.id}`, {
      method: 'DELETE'
    }).then(response => {
      if (!response.ok) throw new Error()
      router.push('/')
      router.refresh()
    })

    toast.promise(deletePromise, {
      loading: 'Eliminando pin...',
      success: 'Pin eliminado correctamente',
      error: 'No se pudo eliminar el pin',
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pin.title,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Enlace copiado al portapapeles")
    }
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Pin principal */}
        <div className="bg-card rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Imagen */}
            <div className="relative bg-muted flex items-center justify-center">
              <Image
                src={pin.imageUrl}
                alt={pin.title}
                width={800}
                height={1000}
                className="w-full h-auto object-contain max-h-[80vh]"
                priority
              />
            </div>

            {/* Información */}
            <div className="p-8 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {pin.link && (
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={pin.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/pin/${pin.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button>Guardar</Button>
                </div>
              </div>

              {/* Título y descripción */}
              <h1 className="text-4xl font-bold mb-4">{pin.title}</h1>
              {pin.description && (
                <p className="text-muted-foreground mb-6">{pin.description}</p>
              )}

              {/* Tags */}
              {pin.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {pin.tags.map(tag => (
                    <Badge key={tag} variant="secondary" asChild>
                      <Link href={`/search?q=${tag}`}>
                        #{tag}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Usuario */}
              <Link
                href={`/profile/${pin.user.id}`}
                className="flex items-center gap-3 mb-6 hover:opacity-80 transition"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={pin.user.image || ''} />
                  <AvatarFallback>
                    {pin.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{pin.user.name}</p>
                  {pin.user.bio && (
                    <p className="text-sm text-muted-foreground">{pin.user.bio}</p>
                  )}
                </div>
              </Link>

              {/* Estadísticas */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="gap-2"
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="font-semibold">{likesCount}</span>
                </Button>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">{pin._count.comments}</span>
                </div>
              </div>

              {/* Comentarios */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-bold text-lg mb-4">
                  Comentarios ({pin.comments.length})
                </h3>

                {/* Formulario */}
                {user && (
                  <form onSubmit={handleComment} className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Añade un comentario..."
                        maxLength={500}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!commentText.trim() || submitting}
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de comentarios */}
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    {pin.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={comment.user.image || ''} />
                          <AvatarFallback>
                            {comment.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-muted rounded-2xl px-4 py-2">
                            <p className="font-semibold text-sm">
                              {comment.user.name}
                            </p>
                            <p className="wrap-break-word">{comment.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-4">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Pins relacionados */}
        {relatedPins.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 px-4">Más como este</h2>
          </div>
        )}
      </div>
    </main>
  )
}