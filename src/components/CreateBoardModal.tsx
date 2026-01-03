'use client'

import { useRouter } from "next/router"
import React, { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, Globe, Loader2, Lock } from "lucide-react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

interface CreateBoardModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CreateBoardModal({isOpen, onClose}:CreateBoardModalProps){
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault()

        if(!name.trim()){
            setError('El nombre es obligatorio')
            return
        }
        setLoading(true)
        setError('')
        try {
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    isPrivate
                })
            })
            const data = await response.json()
            if(!response.ok) {
                throw new Error(data.error || 'Error al crear tableto')
            }
            toast.success('Tu tablero se creó exitosamente')
            router.push(`/board/${data.id}`)
            router.reload()
            onClose()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al crear el tablero')
            toast.error('No se pudo crear el tablero')
        } finally {
            setLoading(false)
        }
    }
    return(
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Tablero</DialogTitle>
                    <DialogDescription>
                        Organiza tus pins en tableros
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant={"destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Ej: Inspiracion de diseño" maxLength={100} autoFocus/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripcion</Label>
                        <Textarea id="description" value={description} onChange={(e)=>setDescription(e.target.value)}
                        placeholder="¿De que trata este tablero?"
                        rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Privacidad</Label>
                        <div className="space-y-2">
                            <Button type="button" className= "w-full justify-start h-auto py-3" variant={!isPrivate ? "default":"outline"} onClick={()=> setIsPrivate(false)}>
                                <Globe className="w-5 h-5 mr-3 shrink-0" />
                                <div className="text-left flex-1">
                                    <p className="font-semibold">Publico</p>
                                    <p className="text-xs opacity-80">
                                        Cualquiera puede ver
                                    </p>
                                </div>
                            </Button>
                            <Button 
                            type="button" variant={isPrivate?'default':'outline'} className="w-full justify-start h-auto py-3" onClick={()=> setIsPrivate(true)}>
                                <Lock className="w-5 h-5 mr-3 shrink-0" />
                                <div className="text-left flex-1">
                                    <p className="font-semibold">Privado</p>
                                    <p className="text-xs opacity-80">Solo tu puedes ver</p>
                                </div>
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant={"outline"} onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!name.trim() || loading} className="flex-1">
                            {loading ? 
                            (<>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                Creando...
                            </>) : ('Crear')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}