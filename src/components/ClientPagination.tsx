import { Fragment } from "react";

type Props = {
  pageCount: number;
  currentPage: number;
  handlePageChange: (selectedItem: { selected: number }) => void;
};

const visiblePages = (pageCount: number, currentPage: number) => {
  const pages = new Set([
    0,
    pageCount - 1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);
};

export default function ClientPagination({
  pageCount,
  currentPage,
  handlePageChange,
}: Props) {
  const pages = visiblePages(pageCount, currentPage);

  const selectPage = (selected: number) => {
    if (selected !== currentPage && selected >= 0 && selected < pageCount) {
      handlePageChange({ selected });
    }
  };

  return (
    <nav aria-label="Requests pagination">
      <ul className="pagination !pb-3 !px-3 flex justify-end">
        <li
          className={`pagination-item ${currentPage === 0 ? "pagination-disabled" : ""}`}
        >
          <button
            type="button"
            className="pagination-link !text-sm"
            disabled={currentPage === 0}
            onClick={() => selectPage(currentPage - 1)}
          >
            Previous
          </button>
        </li>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const hasGap = index > 0 && page - previousPage > 1;

          return (
            <Fragment key={page}>
              {hasGap && (
                <li className="pagination-item" aria-hidden="true">
                  <span className="pagination-link !text-sm">…</span>
                </li>
              )}
              <li
                className={
                  page === currentPage
                    ? "pagination-active"
                    : "pagination-item"
                }
              >
                <button
                  type="button"
                  className="pagination-link !text-sm"
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => selectPage(page)}
                >
                  {page + 1}
                </button>
              </li>
            </Fragment>
          );
        })}

        <li
          className={`pagination-item ${currentPage === pageCount - 1 ? "pagination-disabled" : ""}`}
        >
          <button
            type="button"
            className="pagination-link !text-sm"
            disabled={currentPage === pageCount - 1}
            onClick={() => selectPage(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
