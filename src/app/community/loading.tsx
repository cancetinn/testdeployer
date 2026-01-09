import { Skeleton } from "@/components/ui/skeleton"

export default function CommunityLoading() {
    return (
        <div className="space-y-8">
            {/* Hero Skeleton */}
            <div className="w-full h-[300px] rounded-3xl bg-white/5 animate-pulse" />

            {/* Search Bar Skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-[180px]" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
