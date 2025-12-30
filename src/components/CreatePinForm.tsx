'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from './ImageUpload'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CreatePinForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [cloudinaryId, setCloudinaryId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl || !title.trim()) {
      setError('La imagen y el título son obligatorios')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          imageUrl,
          cloudinaryId,
          link: link.trim() || null,
          tags,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pin')
      }

      toast.success('¡Pin creado correctamente!', {
        description: 'Tu pin ya está visible para todos',
        duration: 3000,
      })

      router.push(`/pin/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating pin:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el pin'
      setError(errorMessage)
      toast.error('No se pudo crear el pin', {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Crear Pin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Imagen */}
            <div>
              <ImageUpload
                onUploadComplete={(url, publicId) => {
                  setImageUrl(url)
                  setCloudinaryId(publicId)
                  setError('')
                }}
                onError={setError}
              />
            </div>

            {/* Formulario */}
            <div className="flex flex-col gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Añade un título"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Añade una descripción detallada"
                  rows={4}
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Enlace de destino</Label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Añadir etiqueta"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!imageUrl || !title.trim() || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar Pin'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}