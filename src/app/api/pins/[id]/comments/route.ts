// Get -> Listar Comentarios

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { request } from "http";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request:NextRequest,
    {params}: {params: {id: string}}
){
    try {
        const comments = await prisma.comment.findMany({
            where: {
                pinId: params.id
            },
            orderBy: {createdAt: 'desc'},
            include: {
                user:{
                    select: {id: true, name: true, image: true}
                }
            }
        })
        return NextResponse.json({comments})
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json(
            {error: 'Error fetching comments'}, {status:500}
        )
    }
}

// POST -> Crear Comentario:
export async function POST(
    req: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const {userId} = await auth()
        if(!userId) {
            return NextResponse.json({
                error: 'Unathorized'
            }, {status: 401})
        }

        const body = await req.json()
        const {text} = body

        if(!text || text.trim().length === 0){
            return NextResponse.json({
                error: 'Comment text is required'
            }, {status: 400})
        }
        if(text.length > 500) {
            return NextResponse.json(
            {error: 'Comment must be less than 500 characters'},
            {status: 400}
            )
        }
        const comment = await prisma.comment.create({
            data: {
                text: text.trim(),
                userId,
                pinId: params.id
            },
            include: {
                user: {
                    select: {id: true, name: true, image: true}
                }
            }
        })
        return NextResponse.json(comment, {status: 201})
    } catch (error) {
        return NextResponse.json({error: 'Error creating comment'}, {status:500})
    }
}