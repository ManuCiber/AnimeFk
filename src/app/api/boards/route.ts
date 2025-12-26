import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const {userId} = await auth();
    if(!userId) {
        return NextResponse.json({
            error: 'No autorizado'
        },
    {status: 401})
    }

    const body = await req.json()
    const board = await prisma.board.create({
        data:{
            ...body,
            userId,
        }
    })
    return NextResponse.json(board);
}