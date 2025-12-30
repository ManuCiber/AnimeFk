'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, ExternalLink, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PinWithRelations } from '@/lib/types'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface PinCardProps {
  pin: PinWithRelations
}

export default function PinCard({ pin }: PinCardProps) {
  const { user } = useUser()
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(pin.isLiked || false)
  const [likesCount, setLikesCount] = useState(pin._count.likes)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
        toast.success("Pin guardado en favoritos")
      }
    } catch (error) {
      setLiked(!newLikedState)
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1)
      toast.error("No se pudo actualizar el like")
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toast.info("La funcionalidad de guardar en boards estará disponible pronto")
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: pin.title,
          url: `${window.location.origin}/pin/${pin.id}`
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/pin/${pin.id}`)
      toast.success("Enlace copiado al portapapeles")
    }
  }

  return (
    <Link href={`/pin/${pin.id}`}>
      <div
        className="relative group cursor-zoom-in break-inside-avoid"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <Image
            src={pin.imageUrl}
            alt={pin.title}
            width={500}
            height={600}
            className={`
              w-full h-auto transition-all duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Overlay */}
          <div
            className={`
              absolute inset-0 bg-gradient-b from-black/20 via-transparent to-black/60
              transition-opacity duration-300
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {/* Botones superiores */}
            <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
              <Button
                onClick={handleSave}
                size="sm"
                className="shadow-lg"
              >
                Guardar
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="shadow-lg"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Link externo */}
            {pin.link && (
              <a
                href={pin.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="absolute top-3 left-3"
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </a>
            )}

            {/* Información inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-lg mb-3 line-clamp-2">
                {pin.title}
              </h3>

              <div className="flex items-center justify-between">
                {/* Usuario */}
                <Link
                  href={`/profile/${pin.user.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={pin.user.image || ''} />
                    <AvatarFallback>
                      {pin.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">
                    {pin.user.name}
                  </span>
                </Link>

                {/* Acciones */}
                <div className="flex items-center gap-3">
                  {user && (
                    <Button
                      onClick={handleLike}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Heart
                        className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </Button>
                  )}
                  <span className="text-white text-sm font-medium">
                    {likesCount}
                  </span>
                  <div className="flex items-center gap-1 text-white">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{pin._count.comments}</span>
                  </div>
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}