import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import TableContainer from "../../../components/Common/TableContainer";
import Spinners from "../../../components/Common/Spinner";

// import components
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import DeleteModal from "../../../components/Common/DeleteModal";

import {
  getOrders as onGetOrders,
  updateOrder as onUpdateOrder,
  deleteOrder as onDeleteOrder,
} from "/src/store/actions";

// redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import EcommerceOrdersModal from "./EcommerceOrdersModal";

import {
  Button,
  Col,
  Row,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Card,
  CardBody,
  Badge,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import { ToastContainer } from "react-toastify";
import moment from "moment";
import { useCurrency } from "../../../helpers/currency_helper";

const statusColorMap = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "secondary",
  Pending: "warning",
  Processing: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
  Refund: "warning",
  Paid: "success",
  PAID: "success",
  FAILED: "danger",
};

const EcommerceOrder = () => {
  document.title = "Orders | Admin Dashboard";

  const { formatCurrency } = useCurrency();
  const dispatch = useDispatch();

  const [modalDetails, setModalDetails] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editNote, setEditNote] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const EcommerceOrderProperties = createSelector(
    (state) => state.ecommerce,
    (Ecommerce) => ({
      orders: Ecommerce.orders || [],
      loading: Ecommerce.loading,
    })
  );

  const { orders, loading } = useSelector(EcommerceOrderProperties);

  useEffect(() => {
    dispatch(onGetOrders());
  }, [dispatch]);

  const toggleDetailsModal = (order = null) => {
    if (order) setSelectedOrder(order);
    setModalDetails(!modalDetails);
  };

  const toggleEditModal = (order = null) => {
    if (order) {
      setSelectedOrder(order);
      setEditStatus(order.status || "PENDING");
      setEditTrackingNumber(order.trackingNumber || "");
      setEditNote("");
    }
    setModalEdit(!modalEdit);
  };

  const handleStatusSave = () => {
    if (!selectedOrder) return;
    dispatch(
      onUpdateOrder({
        id: selectedOrder.id,
        status: editStatus,
        trackingNumber: editTrackingNumber || undefined,
        note: editNote || `Status updated to ${editStatus} by admin`,
      })
    );
    setModalEdit(false);
  };

  const onClickDelete = (order) => {
    setSelectedOrder(order);
    setDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    if (selectedOrder && selectedOrder.id) {
      dispatch(onDeleteOrder(selectedOrder.id));
      setDeleteModal(false);
      setSelectedOrder(null);
    }
  };

  // Status breakdown metrics
  const metrics = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return {
      all: list.length,
      pending: list.filter((o) => (o.status || "").toUpperCase() === "PENDING").length,
      processing: list.filter((o) => (o.status || "").toUpperCase() === "PROCESSING").length,
      shipped: list.filter((o) => (o.status || "").toUpperCase() === "SHIPPED").length,
      delivered: list.filter((o) => (o.status || "").toUpperCase() === "DELIVERED").length,
      cancelled: list.filter((o) => (o.status || "").toUpperCase() === "CANCELLED").length,
    };
  }, [orders]);

  // Filter orders by active status tab
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (activeTab === "all") return list;
    return list.filter((o) => (o.status || "").toUpperCase() === activeTab.toUpperCase());
  }, [orders, activeTab]);

  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "id",
        cell: () => <input type="checkbox" className="form-check-input" />,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "Order ID",
        accessorKey: "orderId",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const row = cellProps.row.original;
          return (
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                toggleDetailsModal(row);
              }}
              className="text-primary fw-bold font-size-13"
            >
              #{row.orderId || row.orderNumber || row.id}
            </Link>
          );
        },
      },
      {
        header: "Customer & Phone",
        accessorKey: "customerName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const row = cellProps.row.original;
          const name = row.customerName || row.shippingName || row.billingName || "Guest Customer";
          const phone = row.customerPhone || row.shippingPhone || row.user?.phone || "No phone";
          const email = row.customerEmail || row.user?.email || "";

          return (
            <div>
              <h6 className="font-size-13 mb-1 text-dark fw-semibold">{name}</h6>
              <div className="d-flex align-items-center gap-1 font-size-12 text-muted mb-1">
                <i className="bx bx-phone font-size-13 text-success"></i>
                <span className="fw-medium text-dark">{phone}</span>
              </div>
              {email && (
                <div className="font-size-11 text-muted text-truncate" style={{ maxWidth: "180px" }}>
                  {email}
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "orderDate",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const date = cellProps.row.original.createdAt || cellProps.row.original.orderDate;
          return (
            <div>
              <span className="font-size-13 text-dark d-block">
                {date ? moment(date).format("DD MMM YYYY") : "N/A"}
              </span>
              <span className="font-size-11 text-muted">
                {date ? moment(date).format("hh:mm A") : ""}
              </span>
            </div>
          );
        },
      },
      {
        header: "Total Amount",
        accessorKey: "total",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const row = cellProps.row.original;
          const itemsCount = Array.isArray(row.items) ? row.items.length : 0;
          return (
            <div>
              <span className="fw-bold font-size-14 text-dark d-block">
                {formatCurrency(Number(row.total || 0))}
              </span>
              <span className="badge bg-light text-muted font-size-11">
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </span>
            </div>
          );
        },
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const payStatus = cellProps.row.original.paymentStatus || "PENDING";
          const isPaid = payStatus === "PAID" || payStatus === "Paid";
          const isFailed = payStatus === "FAILED" || payStatus === "Failed";
          return (
            <Badge
              color={isPaid ? "success" : isFailed ? "danger" : "warning"}
              className="font-size-11 px-2 py-1"
            >
              {payStatus}
            </Badge>
          );
        },
      },
      {
        header: "Order Status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const status = cellProps.row.original.status || "PENDING";
          return (
            <Badge
              color={statusColorMap[status] || "secondary"}
              className="font-size-11 px-2 py-1 text-uppercase"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const method = cellProps.row.original.paymentMethod || "STRIPE";
          const methodIcon =
            method === "PAYPAL" || method === "Paypal"
              ? "fab fa-cc-paypal text-primary"
              : method === "COD"
              ? "fas fa-money-bill-wave text-success"
              : method === "BANK_TRANSFER"
              ? "fas fa-university text-info"
              : "fab fa-cc-stripe text-purple";

          return (
            <span className="font-size-12">
              <i className={`${methodIcon} me-1 font-size-14`}></i> {method}
            </span>
          );
        },
      },
      {
        header: "View Details",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          const row = cellProps.row.original;
          return (
            <Button
              type="button"
              color="primary"
              size="sm"
              className="btn-rounded"
              onClick={() => toggleDetailsModal(row)}
            >
              <i className="bx bx-show me-1"></i> Details
            </Button>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "action",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          const row = cellProps.row.original;
          return (
            <div className="d-flex gap-2">
              <Button
                color="light"
                size="sm"
                className="text-success p-1"
                title="Update Status"
                onClick={() => toggleEditModal(row)}
              >
                <i className="mdi mdi-pencil font-size-16" />
              </Button>
              <Button
                color="light"
                size="sm"
                className="text-danger p-1"
                title="Cancel Order"
                onClick={() => onClickDelete(row)}
              >
                <i className="mdi mdi-delete font-size-16" />
              </Button>
            </div>
          );
        },
      },
    ],
    [formatCurrency]
  );

  return (
    <React.Fragment>
      <EcommerceOrdersModal
        isOpen={modalDetails}
        toggle={() => setModalDetails(false)}
        transaction={selectedOrder || {}}
      />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteOrder}
        onCloseClick={() => setDeleteModal(false)}
      />

      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Orders Management" />

          {/* Quick Metrics Cards */}
          <Row className="mb-3 g-3">
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Total Orders</p>
                  <h4 className="mb-0 fw-bold text-dark">{metrics.all}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm border-start border-warning border-3">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Pending</p>
                  <h4 className="mb-0 fw-bold text-warning">{metrics.pending}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm border-start border-info border-3">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Processing</p>
                  <h4 className="mb-0 fw-bold text-info">{metrics.processing}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm border-start border-primary border-3">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Shipped</p>
                  <h4 className="mb-0 fw-bold text-primary">{metrics.shipped}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm border-start border-success border-3">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Delivered</p>
                  <h4 className="mb-0 fw-bold text-success">{metrics.delivered}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xl={2} md={4} sm={6}>
              <Card className="mini-stats-wid mb-0 shadow-sm border-start border-danger border-3">
                <CardBody className="p-3">
                  <p className="text-muted font-size-12 mb-1">Cancelled</p>
                  <h4 className="mb-0 fw-bold text-danger">{metrics.cancelled}</h4>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Status Filter Tabs & Table Card */}
          <Row>
            <Col xs="12">
              <Card className="shadow-sm">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                    <Nav pills className="bg-light p-1 rounded">
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "all" })}
                          onClick={() => setActiveTab("all")}
                          style={{ cursor: "pointer" }}
                        >
                          All ({metrics.all})
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "pending" })}
                          onClick={() => setActiveTab("pending")}
                          style={{ cursor: "pointer" }}
                        >
                          Pending ({metrics.pending})
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "processing" })}
                          onClick={() => setActiveTab("processing")}
                          style={{ cursor: "pointer" }}
                        >
                          Processing ({metrics.processing})
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "shipped" })}
                          onClick={() => setActiveTab("shipped")}
                          style={{ cursor: "pointer" }}
                        >
                          Shipped ({metrics.shipped})
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "delivered" })}
                          onClick={() => setActiveTab("delivered")}
                          style={{ cursor: "pointer" }}
                        >
                          Delivered ({metrics.delivered})
                        </NavLink>
                      </NavItem>
                    </Nav>

                    <Button
                      color="light"
                      size="sm"
                      onClick={() => dispatch(onGetOrders())}
                      title="Refresh Orders"
                    >
                      <i className="mdi mdi-refresh me-1"></i> Refresh
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinners />
                      <p className="text-muted mt-2">Loading orders...</p>
                    </div>
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={filteredOrders}
                      isGlobalFilter={true}
                      isAddButton={false}
                      isCustomPageSize={true}
                      isPagination={true}
                      SearchPlaceholder="Search orders, customers, phone..."
                      tableClass="align-middle table-nowrap dt-responsive nowrap w-100 table-check dataTable no-footer dtr-inline"
                      theadClass="table-light"
                      pagination="pagination"
                      paginationWrapper="dataTables_paginate paging_simple_numbers pagination-rounded"
                    />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Edit Order Status Modal */}
          <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered>
            <ModalHeader toggle={() => setModalEdit(false)}>Update Order Status</ModalHeader>
            <ModalBody>
              <p className="text-muted font-size-13 mb-3">
                Updating status for order:{" "}
                <strong className="text-dark">
                  #{selectedOrder?.orderNumber || selectedOrder?.orderId || selectedOrder?.id}
                </strong>
              </p>
              <div className="mb-3">
                <Label className="font-size-13 fw-medium">Order Status</Label>
                <Input
                  type="select"
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </Input>
              </div>

              <div className="mb-3">
                <Label className="font-size-13 fw-medium">Tracking Number (Optional)</Label>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="e.g. TRK-109283"
                  value={editTrackingNumber}
                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <Label className="font-size-13 fw-medium">Status Note (Optional)</Label>
                <Input
                  type="textarea"
                  rows="3"
                  className="form-control"
                  placeholder="Add note for customer and order history..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setModalEdit(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={handleStatusSave}>
                Save Changes
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

EcommerceOrder.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default EcommerceOrder;
