import { Skeleton } from "./ui/skeleton";

export default function PinCardSkeleton(){
    return(
        <div className="break-inside-avoid mb-4">
            <Skeleton className="w-full aspect-3/4 rounded-2xl" />
        </div>
    )
}