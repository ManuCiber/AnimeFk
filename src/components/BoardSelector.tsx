'use client'

import { Check, FolderPlus, Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import CreateBoardModal from "./CreateBoardModal"

interface Board {
  id: string
  name: string
  isPrivate: boolean
  _count: {
    pins: number
  }
  pins: {
    imageUrl: string
  }[]
}

interface BoardSelectorProps{
    pinId: string
    currentBoardId?:string|null
    onSave?: () => void
}

export default function BoardSelector({pinId, currentBoardId, onSave}:BoardSelectorProps){
    const [Boards, setBoards] = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string|null>(null)
    const [selectBoardId, setSelectBoardId] = useState(currentBoardId)
    const [showCreatedModal, setShowCreateModal] = useState(false)
    
    useEffect(()=>{
        loadBoards()
    },[]) 

    const loadBoards = async () => {
        try {
            const response = await fetch('/api/boards');
            const data = await response.json()
            setBoards(data.boards || [])
        } catch (error) {
           console.error('Error Loading Boards')
           toast.error('No se pueden cargar los tableros') 
        } finally {
            setLoading(false)
        }
    }

    const handleSaveToBoard = async (boardId: string) => {
        setSaving(boardId)
        try {
            const response = await fetch(`/api/boards/${boardId}/pins`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pinId})
            })
            if(!response.ok){
                throw new Error('Failed to save pin')
            }
            setSelectBoardId(boardId)
            toast.success('El pin se guardó en el tableto')
            onSave?.()
        } catch (error) {
            console.error('Error saving to board', error)
            toast.error('No se pudo guardar el pin en el tablero')
        } finally{
            setSaving(null)
        }
    }
    if(loading){
        return(
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        )
    }
    return(
        <>
            <div className="space-y-2">
                <ScrollArea className="h-75 pr-4">
                    {Boards.length === 0
                    ?(<div className="text-center py-8 text-muted-foreground">
                        <FolderPlus className="w-12 h-12 ,x-auto mb-2 opacity-50"/>
                        <p className="text-sm">No tienes tableros todavia</p>
                    </div>)
                    :(Boards.map((board)=> (
                        <button key={board.id}
                        onClick={()=> handleSaveToBoard(board.id)}
                        disabled={saving === board.id}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/*Preview de imagenes del board*/}
                                <div className="w-12 h-12 bg-muted rounded-lg shrink-0 overflow-hidden">
                                    {board.pins.length > 0
                                        ? (<img src={board.pins[0].imageUrl} alt={board.name} className="w-full h-full object-cover"/>)
                                        : (<div className="w-full h-full flex items-center justify-center">
                                            <FolderPlus className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-semibold truncate">{board.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {board._count.pins} {board._count.pins === 1 ? 'Pin' : 'Pins' }
                                            {board.isPrivate && '*Privado'}
                                        </p>
                                    </div>
                                </div>
                                {saving === board.id ?
                                (<Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/>)
                            :selectBoardId === board.id ? (<Check className="w-5 h-5 text-green-500"/>) :null}
                            </div>
                        </button>
                    ))
                )}
                </ScrollArea>
            <Button onClick={()=>setShowCreateModal(true)}
            variant={"outline"} className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="font-semibold">Crear Nuevo Tablero</span>
            </Button>
        </div>
        <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          loadBoards() // Recargar boards después de crear uno nuevo
        }}
      />
        </>
    )
}