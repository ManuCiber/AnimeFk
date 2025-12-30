import PinCardSkeleton from "./PinCardSkeleton";

export default function PinGridSkeleton() {
    return(
        <div className="px-4 columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                    <PinCardSkeleton />
                </div>
            ))}
        </div>
    )
}