// POST -> Para dar like

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const {userId} = await auth()

        if(!userId) {
            return NextResponse.json(
                {error: 'Unauthorized'}, {status: 401}
            )
        }
        const pinExists = await prisma.pin.findUnique({
            where: {
                id: params.id
            },
            select: {id: true}
        })
        if(!pinExists){
            return NextResponse.json(
                {error: 'Pin not found'}, {status: 404}
            )
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_pinId: {
                    userId, 
                    pinId: params.id
                }
            }
        })

        if(existingLike) {
            return NextResponse.json(
                {error: 'Already Liked'},
                {status: 400}
            )
        }
        await prisma.like.create({
            data: {
                userId,
                pinId: params.id
            }
        })

        const likesCount = await prisma.like.count({
            where: {pinId: params.id}
        })

        return NextResponse.json(
            {
                success: true,
                liked: true,
                likesCount
            }
        )
    } catch (error) {
        console.error('Error to like pin',error)
        return NextResponse.json({error: 'Error to like pin'}, {status: 500})
    }
}