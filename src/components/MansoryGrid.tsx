'use client';

import { PinWithRelations } from "@/lib/types";
import PinCard from "./pinCard";

interface MansoryGridProps {
  pins: PinWithRelations[];
}

export default function MansoryGrid({pins}: MansoryGridProps){

    if(pins.length === 0){
        return(
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">

    <p className="text-xl mb-2">No hay pins para mostrar</p>
    <p className="text-sm">Intenta Buscar algo Diferente</p>
        )
   </div>
    )}
    return (
        <div className="px-4 columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
            {pins.map((pin) => (
                <div key={pin.id} className="break-inside-avoid mb-4">
                    <PinCard pin={pin} />
                </div>
            ))}
        </div>
    )
}