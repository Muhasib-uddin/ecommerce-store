import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

const PaginationControls = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = "mt-3",
  showPageSize = true,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startRow = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination items
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <Row className={`align-items-center ${className}`}>
      <Col sm={12} md={5} className="d-flex align-items-center gap-3 mb-2 mb-md-0">
        {showPageSize && onPageSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="dataTables_info text-muted font-size-13">
          Showing {startRow} to {endRow} of {totalItems} Results
        </div>
      </Col>
      <Col sm={12} md={7}>
        <div className="dataTables_paginate paging_simple_numbers pagination-rounded">
          <ul className="pagination pagination-rounded justify-content-md-end mb-0">
            <li className={`paginate_button page-item previous ${currentPage <= 1 ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
              >
                <i className="mdi mdi-chevron-left"></i>
              </Link>
            </li>
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <li key={`ellipsis-${idx}`} className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              return (
                <li
                  key={`page-${page}`}
                  className={`paginate_button page-item ${currentPage === page ? "active" : ""}`}
                >
                  <Link
                    to="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </Link>
                </li>
              );
            })}
            <li className={`paginate_button page-item next ${currentPage >= totalPages ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
              >
                <i className="mdi mdi-chevron-right"></i>
              </Link>
            </li>
          </ul>
        </div>
      </Col>
    </Row>
  );
};

PaginationControls.propTypes = {
  currentPage: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  className: PropTypes.string,
  showPageSize: PropTypes.bool,
};

export default PaginationControls;
