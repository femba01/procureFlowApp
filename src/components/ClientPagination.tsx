import ReactPaginate from "react-paginate";

type Props = {
  pageCount: number;
  handlePageChange: (selectedItem: { selected: number }) => void;
}

const ClientPagination = ({ pageCount, handlePageChange }: Props) => {
  return (
    <ReactPaginate
      pageCount={pageCount}
      onPageChange={handlePageChange}
      previousLabel="Previous"
      nextLabel="Next"
      breakLabel="..."
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      containerClassName="pagination"
      pageClassName="pagination-item"
      pageLinkClassName="pagination-link"
      previousClassName="pagination-item"
      previousLinkClassName="pagination-link"
      nextClassName="pagination-item"
      nextLinkClassName="pagination-link"
      activeClassName="pagination-active"
      disabledClassName="pagination-disabled"
    />
  )
}

export default ClientPagination;