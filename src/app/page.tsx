import Header from "@/components/Header"
import MansoryGrid from "@/components/MansoryGrid"
import PinGridSkeleton from "@/components/PinGridSkeleton"
import prisma from "@/lib/prisma"
import { PinWithRelations } from "@/lib/types"
import { Suspense } from "react"

export const revalidate = 60

async function PinsContent() {
  const pins = await prisma.pin.findMany(
    {
      take: 50,
      orderBy: {createdAt: 'desc'},
      include:{
        user: {
          select:
            {id: true, name: true, image: true}
          },
          _count: {
            select: {likes: true, comments: true}
          }
        }
      }) as PinWithRelations[]
      return <MansoryGrid pins={pins} />
}

export default function HomePage () {
  <div className="min-h-screen bg-background">
    <Header />
    <main className="py-8">
      <Suspense fallback={<PinGridSkeleton/>}>
        <PinsContent />
      </Suspense>
    </main>
  </div>
}