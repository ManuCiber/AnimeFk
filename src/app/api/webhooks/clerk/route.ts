import { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import {Webhook} from 'svix'
import prisma from "@/lib/prisma"

export async function POST (req:Request){
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error ('CLERK_WEBHOOK_SECRET not found')
    }

    const headerPayload = headers()
    const svix_id = (await headerPayload).get("svix-id")
    const svix_timestamp = (await headerPayload).get('svix-timestamp');
    const svix_signature = (await headerPayload).get('svix-signature')

    if(!svix_id || !svix_signature || !svix_timestamp){
        return new NextResponse('Error Missing svix headers', {status: 400})
    }    

    const payload = await req.json()
    const body = JSON.stringify(payload)


    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature":svix_signature
        }) as WebhookEvent

    } catch (error) {
        console.error('Error verifying webhook', error);
        return new NextResponse('Error: Verification Failed', {status: 400})
    }

    const eventType = evt.type

    if(eventType === 'user.created'){
        const {id, email_addresses, image_url, first_name, last_name, username} = evt.data

        try{
            await prisma.user.create({
                data: {
                    id,
                    email: email_addresses[0].email_address,
                    name: username|| `${first_name ||''} ${last_name || ''}`.trim() || null,
                    image: image_url
                },
            })
            console.log('✅ Usuario creado:', id)
        } catch (error) {
            console.error('❌ Error creando usuario:', error)
            return new NextResponse('Error creating user', {status:500})
        }
    }

    if(eventType==='user.updated'){
        const {id, email_addresses, image_url, first_name, last_name, username} = evt.data

        await prisma.user.update({
            where: {id},
            data: {
                email:email_addresses[0].email_address,
                name: username || `${first_name || ''} ${last_name || ''}`.trim() || null,
                image: image_url
            },
        })
    }
    if(eventType === 'user.deleted'){
        const {id} =  evt.data
        await prisma.user.delete({
            where: {id}
        })
    }
    return new NextResponse('Webhook processed', {status: 200})
}