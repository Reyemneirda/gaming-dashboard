import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, arr) => arr.indexOf(page) === index);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl">
      <div className="flex items-center text-sm text-slate-400">
        <span>
          Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} games
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => {
            if (page === -1) {
              return (
                <div key={`dots-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </div>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};