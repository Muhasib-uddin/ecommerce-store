import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import withRouter from "../../components/Common/withRouter";
import { Badge, Button, Card, CardBody } from "reactstrap";
import EcommerceOrdersModal from "../Ecommerce/EcommerceOrders/EcommerceOrdersModal";
import TableContainer from "../../components/Common/TableContainer";
import { Link } from "react-router-dom";
import { useCurrency } from "../../helpers/currency_helper";

const LatestTransaction = ({ recentOrders = [] }) => {
  const { formatCurrency } = useCurrency();
  const [modal1, setModal1] = useState(false);
  const toggleViewModal = () => setModal1(!modal1);
  const [transaction, setTransaction] = useState({});

  const columns = useMemo(
    () => [
      {
        header: "Order ID",
        accessorKey: "orderNumber",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <Link to="/ecommerce-orders" className="text-body fw-bold">
              {cellProps.row.original.orderNumber || cellProps.row.original.orderId || "N/A"}
            </Link>
          );
        },
      },
      {
        header: "Customer",
        accessorKey: "customer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const cust = cellProps.row.original.customer;
          const name = typeof cust === "object"
            ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.email
            : cust || "Guest";
          return name;
        },
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const dateVal = cellProps.row.original.createdAt || cellProps.row.original.date;
          if (!dateVal) return "N/A";
          try {
            return new Date(dateVal).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          } catch {
            return String(dateVal);
          }
        },
      },
      {
        header: "Total",
        accessorKey: "total",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const total = cellProps.row.original.total;
          return (
            <span className="fw-semibold">
              {formatCurrency(total)}
            </span>
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
          let color = "warning";
          if (status === "DELIVERED") color = "success";
          else if (status === "SHIPPED") color = "info";
          else if (status === "PROCESSING") color = "primary";
          else if (status === "CANCELLED" || status === "REFUNDED") color = "danger";

          return (
            <Badge color={color} className="font-size-11">
              {status}
            </Badge>
          );
        },
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const pStatus = cellProps.row.original.paymentStatus || "PENDING";
          const isPaid = pStatus === "PAID" || pStatus === "Paid";
          return (
            <Badge color={isPaid ? "success" : "warning"} className="font-size-11">
              {pStatus}
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
          let icon = "bx bx-credit-card";
          if (method === "PAYPAL") icon = "mdi mdi-paypal";
          else if (method === "COD") icon = "mdi mdi-cash-multiple";
          else if (method === "BANK_TRANSFER") icon = "mdi mdi-bank";

          return (
            <span>
              <i className={`${icon} me-1 text-primary`}></i>
              {method}
            </span>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "view",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          return (
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded waves-effect waves-light"
              onClick={() => {
                setTransaction(cellProps.row.original);
                toggleViewModal();
              }}
            >
              View Details
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <EcommerceOrdersModal
        isOpen={modal1}
        toggle={toggleViewModal}
        transaction={transaction}
      />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="card-title mb-0">Latest Orders</h4>
            <Link to="/ecommerce-orders" className="btn btn-outline-primary btn-sm waves-effect">
              View All Orders
            </Link>
          </div>
          <TableContainer
            columns={columns}
            data={recentOrders || []}
            isGlobalFilter={false}
            tableClass="align-middle table-nowrap mb-0"
            theadClass="table-light"
          />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

LatestTransaction.propTypes = {
  recentOrders: PropTypes.array,
};

export default withRouter(LatestTransaction);

