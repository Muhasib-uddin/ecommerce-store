import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  Badge,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  FormGroup,
} from "reactstrap";
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateOrder as onUpdateOrder } from "/src/store/actions";
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

const EcommerceOrdersModal = ({ isOpen, toggle, transaction = {} }) => {
  const dispatch = useDispatch();
  const { formatCurrency } = useCurrency();

  const [newStatus, setNewStatus] = useState(transaction.status || "PENDING");
  const [trackingNumber, setTrackingNumber] = useState(transaction.trackingNumber || "");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when modal transaction changes
  React.useEffect(() => {
    if (transaction) {
      setNewStatus(transaction.status || "PENDING");
      setTrackingNumber(transaction.trackingNumber || "");
      setStatusNote("");
    }
  }, [transaction]);

  const items = Array.isArray(transaction.items) ? transaction.items : [];
  const orderId = transaction.orderNumber || transaction.orderId || "N/A";
  const customerName =
    transaction.customerName ||
    transaction.shippingName ||
    transaction.billingName ||
    (transaction.user ? `${transaction.user.firstName || ""} ${transaction.user.lastName || ""}`.trim() : "Customer");
  const customerPhone = transaction.customerPhone || transaction.shippingPhone || transaction.user?.phone || "N/A";
  const customerEmail = transaction.customerEmail || transaction.user?.email || "N/A";
  const total = Number(transaction.total != null ? transaction.total : 0);
  const subtotal = Number(transaction.subtotal != null ? transaction.subtotal : total);
  const shippingCost = Number(transaction.shippingCost != null ? transaction.shippingCost : 0);
  const tax = Number(transaction.tax != null ? transaction.tax : 0);
  const discount = Number(transaction.discount != null ? transaction.discount : 0);
  const statusHistory = Array.isArray(transaction.statusHistory) ? transaction.statusHistory : [];

  const handleStatusUpdate = () => {
    if (!transaction.id) return;
    setIsUpdating(true);
    dispatch(
      onUpdateOrder({
        id: transaction.id,
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        note: statusNote || `Status changed to ${newStatus}`,
      })
    );
    setTimeout(() => {
      setIsUpdating(false);
      toggle();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered={true}
      size="lg"
      className="exampleModal"
      tabIndex="-1"
      toggle={toggle}
    >
      <div className="modal-content">
        <ModalHeader toggle={toggle} className="border-bottom">
          <div className="d-flex align-items-center gap-2">
            <i className="bx bx-receipt text-primary font-size-20"></i>
            <span className="fw-bold">Order Details: {orderId}</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          {/* Order Summary Top Bar */}
          <Row className="mb-4 g-3">
            <Col md={6}>
              <Card className="border shadow-none mb-0 h-100 bg-light">
                <CardBody className="p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bx bx-user-pin text-primary font-size-18"></i>
                    <h6 className="mb-0 fw-bold">Customer Information</h6>
                  </div>
                  <p className="mb-1 fw-semibold text-dark font-size-14">{customerName}</p>
                  <p className="mb-1 text-muted font-size-13">
                    <i className="bx bx-phone text-success me-1 font-size-14"></i>
                    <a href={`tel:${customerPhone}`} className="text-dark fw-medium">
                      {customerPhone}
                    </a>
                  </p>
                  <p className="mb-0 text-muted font-size-13">
                    <i className="bx bx-envelope text-info me-1 font-size-14"></i>
                    {customerEmail}
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border shadow-none mb-0 h-100 bg-light">
                <CardBody className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bx bx-info-circle text-primary font-size-18"></i>
                      <h6 className="mb-0 fw-bold">Order Status & Payment</h6>
                    </div>
                    <Badge color={statusColorMap[transaction.status] || "secondary"} className="font-size-12 px-2 py-1">
                      {transaction.status || "PENDING"}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between font-size-13 mb-1">
                    <span className="text-muted">Payment Method:</span>
                    <span className="fw-semibold text-dark">{transaction.paymentMethod || "STRIPE"}</span>
                  </div>
                  <div className="d-flex justify-content-between font-size-13 mb-1">
                    <span className="text-muted">Payment Status:</span>
                    <Badge
                      color={
                        transaction.paymentStatus === "PAID" || transaction.paymentStatus === "Paid"
                          ? "success"
                          : "warning"
                      }
                      className="font-size-11"
                    >
                      {transaction.paymentStatus || "PENDING"}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between font-size-13">
                    <span className="text-muted">Placed Date:</span>
                    <span className="text-dark">
                      {transaction.createdAt || transaction.orderDate
                        ? moment(transaction.createdAt || transaction.orderDate).format("DD MMM YYYY, hh:mm A")
                        : "N/A"}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Shipping & Billing Address */}
          <Row className="mb-4 g-3">
            <Col sm={6}>
              <div className="border rounded p-3 h-100">
                <h6 className="fw-bold font-size-13 text-muted mb-2">
                  <i className="bx bx-map-pin me-1 text-primary"></i> Shipping Address
                </h6>
                <p className="mb-1 fw-medium text-dark">{transaction.shippingName || customerName}</p>
                <p className="mb-1 text-muted font-size-13">
                  {transaction.shippingAddress1 || "N/A"}
                  {transaction.shippingAddress2 ? `, ${transaction.shippingAddress2}` : ""}
                </p>
                <p className="mb-1 text-muted font-size-13">
                  {[transaction.shippingCity, transaction.shippingState, transaction.shippingPostalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="mb-0 text-muted font-size-13">{transaction.shippingCountry || "United States"}</p>
                <p className="mt-1 mb-0 font-size-13 text-primary">
                  <i className="bx bx-phone me-1"></i> Phone: {transaction.shippingPhone || customerPhone}
                </p>
              </div>
            </Col>
            <Col sm={6}>
              <div className="border rounded p-3 h-100">
                <h6 className="fw-bold font-size-13 text-muted mb-2">
                  <i className="bx bx-credit-card me-1 text-primary"></i> Billing Address
                </h6>
                <p className="mb-1 fw-medium text-dark">{transaction.billingName || customerName}</p>
                <p className="mb-1 text-muted font-size-13">
                  {transaction.billingAddress1 || transaction.shippingAddress1 || "Same as shipping"}
                  {transaction.billingAddress2 ? `, ${transaction.billingAddress2}` : ""}
                </p>
                <p className="mb-1 text-muted font-size-13">
                  {[transaction.billingCity || transaction.shippingCity, transaction.billingState || transaction.shippingState, transaction.billingPostalCode || transaction.shippingPostalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="mb-0 text-muted font-size-13">
                  {transaction.billingCountry || transaction.shippingCountry || "United States"}
                </p>
              </div>
            </Col>
          </Row>

          {/* Ordered Items Table */}
          <h6 className="fw-bold mb-2">Ordered Items ({items.length})</h6>
          <div className="table-responsive border rounded mb-4">
            <Table className="table align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "60px" }}>Item</th>
                  <th scope="col">Product</th>
                  <th scope="col" className="text-center">SKU</th>
                  <th scope="col" className="text-center">Qty</th>
                  <th scope="col" className="text-end">Price</th>
                  <th scope="col" className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const imgUrl =
                      item.product?.images?.[0]?.url ||
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";

                    return (
                      <tr key={item.id || idx}>
                        <td>
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="avatar-sm rounded object-fit-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";
                            }}
                          />
                        </td>
                        <td>
                          <h6 className="font-size-13 mb-0 text-truncate" style={{ maxWidth: "220px" }}>
                            {item.name || item.productName || "Product Item"}
                          </h6>
                        </td>
                        <td className="text-center font-size-12 text-muted">{item.sku || "N/A"}</td>
                        <td className="text-center fw-semibold">{qty}</td>
                        <td className="text-end">{formatCurrency(price)}</td>
                        <td className="text-end fw-semibold">{formatCurrency(price * qty)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No order items recorded.
                    </td>
                  </tr>
                )}
                <tr className="border-top">
                  <td colSpan="5" className="text-end fw-bold">Subtotal:</td>
                  <td className="text-end fw-bold">{formatCurrency(subtotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td colSpan="5" className="text-end text-success">Coupon Discount:</td>
                    <td className="text-end text-success">-{formatCurrency(discount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="5" className="text-end text-muted">Estimated Tax:</td>
                  <td className="text-end">{formatCurrency(tax)}</td>
                </tr>
                <tr>
                  <td colSpan="5" className="text-end text-muted">Shipping Cost:</td>
                  <td className="text-end">
                    {shippingCost === 0 ? <span className="text-success fw-medium">Free</span> : formatCurrency(shippingCost)}
                  </td>
                </tr>
                <tr className="table-light">
                  <td colSpan="5" className="text-end fw-bold font-size-15">Grand Total:</td>
                  <td className="text-end fw-bold text-primary font-size-15">{formatCurrency(total)}</td>
                </tr>
              </tbody>
            </Table>
          </div>

          {/* Quick Status Update Section */}
          <div className="border rounded p-3 bg-light mb-3">
            <h6 className="fw-bold mb-3 font-size-14">
              <i className="bx bx-edit text-primary me-1"></i> Update Order Status & Tracking
            </h6>
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <FormGroup className="mb-0">
                  <Label className="font-size-12 mb-1">Order Status</Label>
                  <Input
                    type="select"
                    className="form-select form-select-sm"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup className="mb-0">
                  <Label className="font-size-12 mb-1">Tracking Number</Label>
                  <Input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. TRK-983742"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <Button
                  color="primary"
                  size="sm"
                  className="w-100"
                  disabled={isUpdating}
                  onClick={handleStatusUpdate}
                >
                  {isUpdating ? "Saving..." : "Update Status"}
                </Button>
              </Col>
            </Row>
          </div>

          {/* Status Timeline History */}
          {statusHistory.length > 0 && (
            <div>
              <h6 className="fw-bold mb-2 font-size-13 text-muted">Status History Timeline</h6>
              <ul className="list-unstyled font-size-12 mb-0 border-start ps-3 ms-2">
                {statusHistory.map((hist, index) => (
                  <li key={hist.id || index} className="mb-2 position-relative">
                    <span className="badge bg-light text-dark me-2">{hist.status}</span>
                    <span className="text-muted">{moment(hist.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
                    {hist.note && <div className="text-dark mt-1">{hist.note}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-top">
          <Button type="button" color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

EcommerceOrdersModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  transaction: PropTypes.object,
};

export default EcommerceOrdersModal;
