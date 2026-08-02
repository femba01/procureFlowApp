"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";

interface PaginationProps {
  totalPages: number;
  onPageChange: (selectedItem: { selected: number }) => void;
}

export default function Pagination({
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-4 max-w-full overflow-x-auto pb-1">
      <ReactPaginate
        pageCount={totalPages}
        className="flex min-w-max items-center justify-center gap-1 sm:gap-2"
        breakLabel="..."
        nextLabel={<span className="flex items-center gap-1"><span className="hidden sm:inline">Next</span><ChevronRight /></span>}
        previousLabel={<span className="flex items-center gap-1"><ChevronLeft /><span className="hidden sm:inline">Previous</span></span>}
        pageLinkClassName="py-1 px-2 my-auto rounded-md text-gray-500 cursor-pointer"
        activeLinkClassName="rounded-md text-primary font-bold"
        nextClassName="cursor-pointer my-auto text-gray-500 p-1 rounded-md"
        previousClassName="cursor-pointer my-auto text-gray-500 p-1 rounded-md"
        onPageChange={onPageChange}
      />
    </div>
  )
}
