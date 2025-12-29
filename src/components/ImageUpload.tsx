'use client'

import { useRef, useState } from "react"
import { Alert, AlertDescription } from "./ui/alert"
import Image from "next/image"
import { Button } from "./ui/button"
import { Loader2, Upload, X } from "lucide-react"
import { Label } from "./ui/label"

interface ImageUploadProps {
    onUploadComplete: (url: string, publicId: string) => void
    onError?:(error:string) => void
}

export default function ImageUpload ({
    onUploadComplete, onError
}:ImageUploadProps) {
    const [preview, setPreview] = useState<string| null>(null)
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const handleFile = async(file: File) => {
        setError('')

        //Validacion del tipo
        const validTypes = ['image/jpeg','image/png','image/webp','image/gif']
        if(!validTypes.includes(file.type)){
            const errorMsg = 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        //Validar tamaño
        const maxSize = 10*1024*1024
        if(file.size > maxSize){
            const errorMsg = 'La imagen es muy grande. Máximo 10MB.'
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        //Preview de la imagen

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        //Upload image;
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if(!response.ok) {
                throw new Error(data.error|| 'Error al subir imagen')
            }
            onUploadComplete(data.url, data.publicId)
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message: 'Error al subir imagen'
            setError(errorMsg)
            onError?.(errorMsg)
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(file) handleFile(file)
    }
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if(e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if(file) handleFile(file)
    }

  const clearImage = () => {
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  return (
    <div className="w-full">
        {error && (
            <Alert variant={"destructive"} className="mb-4">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {preview ? (
            <div className="relative">
                <div className="relative w-full aspect-4/5 rounded-lg overflow-hidden border">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
        {
            !uploading && (
                <Button onClick={clearImage}
                variant={"secondary"} size={"icon"} className="absolute top-3 right-3 shadow-lg">
                    <X className="w-5 h-5"/>
                </Button>
            )}
            {uploading && 
                (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm font-medium">Subiendo Imagen</p>
                        </div>
                    </div>
                )}
            </div> 
        ): (
            <Label 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full aspect-4/5 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${dragActive ?'border-primary bg-primary/5':'border-border hover:border-primary/50 hover: bg-muted/50'}`}>
                <div className="text-center p-8">
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ?'text-primary':'text-muted-foreground'}`}/>
                    <p className="text-lg font-medium mb-1">Haz Click o Arrastra una Imagen</p>
                    <p className="text-sm text-muted-foreground">
                        JPG, PNG, WEBP o GIF (max. 10MB)
                    </p>
                </div>
                <input ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}/>
            </Label>
        )}
    </div>
  )
}