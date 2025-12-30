import { User } from "@/generated/prisma/client";
import { PinWithRelations } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LinkIcon, Mail } from "lucide-react";
import { Badge } from "./ui/badge";
import MansoryGrid from "./MansoryGrid";
import EmptyState from "./EmptyState";

interface ProfileViewProps {
    user: User & {
        _count: {
            pins: number
        }
    }
    pins: PinWithRelations[]
}

export default function ProfileView({user, pins}: ProfileViewProps){
    return(
        <main className="py-8">
            <div className="max-w-4xl mx-auto px-4 mb-12">
                {/*Header del perfil*/}
                <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={user.image ||''} />
                        <AvatarFallback className="text-4xl">
                            {user.name?.charAt(0)||'U'}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                        <Mail className="w-4 h-4"/>
                        <span>{user.email}</span>
                    </div>


                    {user.bio && (
                        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                            {user.bio}
                        </p>
                    )}
                    {user.website && (
                       <a href={user.website}
                       target="blank"
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
                        <LinkIcon className="w-4 h-4"/>
                        {user.website}
                       </a>                   
                    )}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Badge variant={"secondary"} className="text-base px-4 py-2">
                            {user._count.pins} {user._count.pins === 1 ?'pin': 'pins'}
                        </Badge>
                    </div>
                    
                    {/*Acá se añadirá el boton de editar el perfil si es el usuario actual*/}

                </div>
            </div>

            {/*Pins del usuario*/}
            <div className="max-w-500 mx-auto">
                {pins.length > 0 ? (
                    <MansoryGrid pins={pins} />
                ):(<EmptyState
                icon={LinkIcon}
                title="No hay pins todavia"
                description="Este usuario aún no ha publicado ningun pin"/>
            )}
            </div>
        </main>
    )
}