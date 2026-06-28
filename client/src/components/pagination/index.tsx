'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense, useTransition } from 'react'; 

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

function PaginationContent({ totalPages, currentPage }: PaginationProps) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`flex items-center justify-center gap-2 py-4 ${isPending ? 'opacity-60' : ''}`}>
      <button
        type="button"
        disabled={currentPage <= 1 || isPending}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
        <span className="px-3 py-1.5 bg-neutral-100 rounded-md border border-neutral-200">
          {currentPage}
        </span>
        <span className="text-gray-400 px-1">de</span>
        <span className="px-3 py-1.5 text-gray-500">
          {totalPages}
        </span>
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages || isPending}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div className="h-10 mt-8 bg-gray-100 rounded-lg animate-pulse w-48 mx-auto" />}>
      <PaginationContent {...props} />
    </Suspense>
  );
}
