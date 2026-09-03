import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";

//Import Card invoice
import CardInvoice from "./card-invoice";
import { getInvoices as onGetInvoices } from "/src/store/actions";

import Spinners from "../../components/Common/Spinner";
import PaginationControls from "../../components/Common/PaginationControls";

const InvoicesList = () => {
  //meta title
  document.title =
    "Invoice List | Admin Dashboard";

  const dispatch = useDispatch();

  const InvoicesProperties = createSelector(
    (state) => state.invoices,
    (Invoices) => ({
      invoices: Invoices.invoices,
      loading: Invoices.loading
    })
  );

  const {
    invoices, loading
  } = useSelector(InvoicesProperties);
  const [isLoading, setLoading] = useState(loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    dispatch(onGetInvoices());
  }, [dispatch]);

  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const paginatedInvoices = invoiceList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Invoices" breadcrumbItem="Invoice List" />

          {
            isLoading ?
              <Spinners setLoading={setLoading} />
              :
              <>
                <Row>
                  {paginatedInvoices.map((invoice, key) => (
                    <CardInvoice data={invoice} key={"_invoice_" + (invoice.id || key)} />
                  ))}
                </Row>
                <PaginationControls
                  currentPage={currentPage}
                  totalItems={invoiceList.length}
                  pageSize={pageSize}
                  pageSizeOptions={[4, 8, 12, 24]}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                />
              </>
          }
        </Container>
      </div>
    </React.Fragment>
  );
};

InvoicesList.propTypes = {
  invoices: PropTypes.array,
  onGetInvoices: PropTypes.func,
};

export default withRouter(InvoicesList);
