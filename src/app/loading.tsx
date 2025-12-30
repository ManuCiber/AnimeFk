import Header from "@/components/Header";
import PinGridSkeleton from "@/components/PinGridSkeleton";

export default function Loading () {
    return(
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-8">
                <PinGridSkeleton />
            </main>
        </div>
    )
}