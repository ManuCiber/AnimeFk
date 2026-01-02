'use client';

import { Board, User } from "@/generated/prisma/client"
import { PinWithRelations } from "@/lib/types"
import { Globe, ImageIcon, Loader2, Lock, MoreHorizontal, Trash, Trash2 } from "lucide-react";
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import MansoryGrid from "./MansoryGrid";
import EmptyState from "./EmptyState";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface BoardProps {
    board: Board & {
        user: Pick<User, 'id' | 'name' | 'image' >
        pins: PinWithRelations[]
        _count: {
            pins: number
        }
    }
    isOnwer: boolean
}
export default function BoardView({board, isOnwer}: BoardProps){
    const router = useRouter()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    
    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/api/boards/${board.id}`)
            method: 'DELETE'

            if(response.ok){
                toast.success("El tablero se eliminó correctamente !");
                router.push(`/profile/${board.userId}`)
                router.reload()
            } else {
                throw new Error('Failed to delete Board')
            }
        } catch (error) {
            toast.error('No se puede eliminar el tablero')
        } finally{
            setDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    return (
      <>
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/*Header del board*/}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                    {board.isPrivate ? (<Lock className="w-5 h-5 text-muted-foreground" />):(<Globe className="w-5 h-5 text-muted-foreground"/>)}
                    <Badge variant={"secondary"}>
                        {board.isPrivate ? 'Privado':'Público'}
                    </Badge>
                </div>
                <h1 className="text-5xl font-bold mb-4">{board.name}</h1>
                {board.description && (<p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">{board.description}</p>)}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={board.user.image ||''}>
                            <AvatarFallback>
                                {board.user.name?.charAt(0)||'U'}
                            </AvatarFallback>
                        </AvatarImage>
                    </Avatar>
                    <span className="font-semibold">{board.user.name}</span>
                </div>
                <p className="text-muted-foreground mb-6">
                    {board._count.pins} {board._count.pins === 1 ? 'pin' :'pins'}
                </p>
                {isOnwer && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"ghost"} size={"icon"}>
                                <MoreHorizontal className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                            <DropdownMenuItem onClick={()=> setShowDeleteDialog(true)}>
                                <Trash2 className="w-4 h-4 mr-2"/>
                                Eliminar Tablero
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {/*Pins del Board*/}
            {board.pins.length > 0 ?(
                <MansoryGrid pins={board.pins} />
            ) : (
                <EmptyState icon={ImageIcon} title="Este tablero está vacio" description={
                    isOnwer
                    ? 'Guarda Pins en este tablero para verlos aqui'
                    : 'No hay pins en este tablero todavia'
                }/>
            )}
          </div>
        </main>
        {/*Dialog para confirmación*/}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar Tablero?</AlertDialogTitle>
                <AlertDialogDescription>Esta Acción no se puede deshacer. Los pins se mantendrán, pero se eliminará este tablero</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                        {deleting?(
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Eliminando
                            </>
                        ): ('Eliminar')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );

}