import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Pinterest Clone
          </CardTitle>
          <CardDescription className="text-base">
            Con Next.js, Prisma, Clerk y shadcn/ui
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button className="w-full text-base">
            Comenzar
          </Button>

          <Button variant="outline" className="w-full text-base">
            Más información
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
