import CreatePinForm from "@/components/CreatePinForm"
import Header from "@/components/Header"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: 'Crear Pin | Pinterest Clone',
    description: 'Crea un nuevo pin',
}

export default async function CreatePage(){
    const user = await currentUser()
    if(!user) {
        redirect('/sign-in')
    }
    return(
        <div className="min-h-screen bg-muted/30">
            <Header/>
            <main className="py-8 px-4">
                <CreatePinForm />
            </main>
        </div>
    )
}