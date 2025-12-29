import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const searchParams = req.nextUrl.searchParams
        const query=searchParams.get('q') || ''
        const page = parseInt(searchParams.get('page') ||'1')
        const limit = 20
        const skip = (page - 1) * limit

        if(!query || query.trim().length === 0) {
            return NextResponse.json(
                {
                    pins:[],
                    pagination: {
                        page: 1,
                        limit,
                        total: 0,
                        totalPages: 0,
                        hasMore: false
                    }
                }
            )
        }

        const searchQuery = query.trim().toLowerCase()

        const pins = await prisma.pin.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                tags: {
                  hasSome: [searchQuery],
                },
              },
            ],
          },
          take: limit,
          skip: skip,
          orderBy: {createdAt: 'desc'},
          include: {
            user: {
                select: {id: true, name: true, image: true}
            },
            _count: {
                select: {likes: true, comments: true}
            }
          }
        });

            const total = await prisma.pin.count({
              where: {
                OR: [
                  {
                    title: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    tags: {
                      hasSome: [searchQuery],
                    },
                  },
                ],
              },
            });
      return NextResponse.json({
        pins,
        query: searchQuery,
        pagination: {page, limit, total, totalPages: Math.ceil(total/limit), hasMore: skip + pins.length < total}
      })  

    } catch (error) {
        console.error('Error searching pins:',error)
        return NextResponse.json({error: 'Error searching pins'}, {status: 500})   
    }
}