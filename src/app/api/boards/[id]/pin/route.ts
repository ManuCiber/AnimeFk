// Agregar pin al board del usuario

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST (
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const {userId} = await auth()

        if(!userId) {
            return NextResponse.json({error: 'Unathorized'}, {status: 401})
        }
        const body = await request.json()
        const {pinId} = body

        if(!pinId) {
            return NextResponse.json(
                {error: 'Pin ID is required'},
                {status: 400}
            )
        }

        //Validación del board: Pertenece al usuario
        const board = await prisma.board.findUnique({
            where: {id: pinId},
            select: {id: true}
        })
        if(!board || board.id !== userId){
            return NextResponse.json(
                {
                    errror: 'Board not found or unathorized'
                }, {status: 403}
            )
        }


        //Verificacion: si el pin existe

        const pin = await prisma.pin.findUnique({
            where: {id: pinId},
            select: {id: true}
        })

        if(!pin){
            return NextResponse.json(
                {error: 'Pin not found'},
                {status: 404}
            )
        } 


        // Acutalizar el pin para agregarlo al board

        const updatedPin = await prisma.pin.update({
            where: {id: pinId},
            data: {boardId: params.id}, include:{
                user: {select: {id: true, name:true, image: true}},
                board: {select:{id: true, name: true}}
            }
        })
        return NextResponse.json({
            sucess: true, 
            pin: updatedPin
        })

    } catch (error) {
        console.error('Error adding pin to the board', error)
        return NextResponse.json({error: 'Error adding pin to the obard'}, {status: 500})
    }
}


// Delete -> Quitar el pin del board


export async function DELETE (request: NextRequest, {params}: {params: {id: string}} ){
    try {
        const {userId} = await auth()
        if(!userId) {
            return NextResponse.json({
                'error': 'Unathorized'
            }, {status: 401})
        }
        const searchParams = request.nextUrl.searchParams
        const pinId = searchParams.get('pinId')


        if(!pinId){
            return NextResponse.json(
                {error: 'Pin ID is required'}, 
            )
        }

        //Se verificarán los permisos: 
        const board = await prisma.board.findUnique({
            where: {id: params.id},
            select: {userId: true}
        })

        if(!board || board.userId !== userId) {
            return NextResponse.json ({error:'Unathorized'},{status: 403})
        }

        //Quitar el pin del board (Establer boardID a null)
        await prisma.pin.update({
            where:{id: pinId},
            data:{boardId: null}
        })

        return NextResponse.json({
            sucess: true,
            message: 'Pin removed from board'
        })

    } catch (error) {
        console.error('Error removign pin from board', error)
        return NextResponse.json({error: 'error removing pin from board'},{status: 500})
    }
}