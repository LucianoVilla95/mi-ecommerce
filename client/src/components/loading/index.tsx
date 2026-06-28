'use client';
import { JSX } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const Loading = (): JSX.Element => {
  return (
    <div className="flex flex-col space-y-3 p-6 flex-1" >
        <Skeleton className="h-31.25 w-62.5 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-62.5" />
          <Skeleton className="h-4 w-50" />
        </div>
    </div>
  )
}

export default Loading;