import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  FormFeedback,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import { toast } from "react-toastify";
import {
  getRealCoupons,
  createRealCoupon,
  deleteRealCoupon,
} from "../../helpers/real_backend_helper";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Validation / Form State
  const [formValues, setFormValues] = useState({
    code: "",
    type: "Percentage",
    value: 0,
    minOrder: 0,
    startDate: "",
    endDate: "",
    usageLimit: 100,
  });
  
  const [errors, setErrors] = useState({});

  const toggleModal = () => setModalOpen(!modalOpen);

  // Fetch coupons from real API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const data = await getRealCoupons();
        const couponsArr = Array.isArray(data) ? data : [];
        setCoupons(
          couponsArr.map((c) => ({
            id: c.id,
            code: c.code,
            type: c.discountType === "PERCENTAGE" ? "Percentage" : c.discountType === "FIXED" ? "Fixed Amount" : "Free Shipping",
            value: parseFloat(c.discountValue || c.value || 0),
            minOrder: parseFloat(c.minimumOrderAmount || c.minOrder || 0),
            startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
            endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "",
            usageLimit: c.usageLimit || 0,
            usageCount: c.usageCount || 0,
            status: c.endDate && new Date(c.endDate) < new Date() ? "Expired" : c.isActive !== false ? "Active" : "Inactive",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
        toast.error("Failed to load coupons from server", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear errors as user typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.code || formValues.code.trim() === "") {
      newErrors.code = "Coupon code is required.";
    } else if (formValues.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters.";
    }

    if (formValues.type !== "Free Shipping" && (!formValues.value || formValues.value <= 0)) {
      newErrors.value = "Discount value must be greater than 0.";
    }

    if (!formValues.startDate) {
      newErrors.startDate = "Start date is required.";
    }

    if (!formValues.endDate) {
      newErrors.endDate = "End date is required.";
    } else if (formValues.startDate && formValues.endDate < formValues.startDate) {
      newErrors.endDate = "End date cannot be earlier than start date.";
    }

    if (!formValues.usageLimit || formValues.usageLimit <= 0) {
      newErrors.usageLimit = "Usage limit must be at least 1.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCouponModal = (coupon = null) => {
    setErrors({});
    if (coupon) {
      setEditingCoupon(coupon);
      setFormValues({ ...coupon });
    } else {
      setEditingCoupon(null);
      setFormValues({
        code: "",
        type: "Percentage",
        value: 15,
        minOrder: 50,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        usageLimit: 500,
      });
    }
    toggleModal();
  };

  const saveCoupon = async () => {
    if (!validateForm()) return;

    // Determine status from date
    const today = new Date().toISOString().split("T")[0];
    const status = formValues.endDate < today ? "Expired" : "Active";

    if (editingCoupon) {
      // Local update only (no PUT endpoint for coupons in current API)
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, ...formValues, status }
            : c
        )
      );
      toast.success("Coupon updated successfully!", { autoClose: 2000 });
    } else {
      try {
        // Map form fields to API schema
        const apiPayload = {
          code: formValues.code.toUpperCase(),
          discountType: formValues.type === "Percentage" ? "PERCENTAGE" : formValues.type === "Fixed Amount" ? "FIXED" : "FREE_SHIPPING",
          discountValue: formValues.type === "Free Shipping" ? 0 : Number(formValues.value),
          minimumOrderAmount: Number(formValues.minOrder),
          startDate: new Date(formValues.startDate).toISOString(),
          endDate: new Date(formValues.endDate).toISOString(),
          usageLimit: Number(formValues.usageLimit),
        };
        const created = await createRealCoupon(apiPayload);
        setCoupons((prev) => [
          ...prev,
          {
            id: created.id || Date.now(),
            code: formValues.code.toUpperCase(),
            type: formValues.type,
            value: formValues.type === "Free Shipping" ? 0 : Number(formValues.value),
            minOrder: Number(formValues.minOrder),
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            usageLimit: Number(formValues.usageLimit),
            usageCount: 0,
            status,
          },
        ]);
        toast.success("Coupon created successfully!", { autoClose: 2000 });
      } catch (err) {
        console.error("Failed to create coupon:", err);
        toast.error(err.message || "Failed to create coupon", { autoClose: 3000 });
        return;
      }
    }

    toggleModal();
  };

  const deleteCoupon = async (id) => {
    try {
      await deleteRealCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted.", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      toast.error(err.message || "Failed to delete coupon", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Promotions" breadcrumbItem="Coupons" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="mb-0">All Promotional Coupons</CardTitle>
                    <Button color="primary" onClick={() => openCouponModal()}>
                      <i className="bx bx-plus me-1"></i> Add Coupon
                    </Button>
                  </div>

                  <div className="table-responsive">
                    <Table className="table align-middle table-nowrap table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Code</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Min Order</th>
                          <th>Start / End Date</th>
                          <th>Usage (Used/Limit)</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons
                          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                          .map((coupon) => (
                          <tr key={coupon.id}>
                            <td>
                              <span className="fw-bold text-primary font-size-14">{coupon.code}</span>
                            </td>
                            <td>{coupon.type}</td>
                            <td>
                              {coupon.type === "Percentage" && `${coupon.value}%`}
                              {coupon.type === "Fixed Amount" && `$${coupon.value}`}
                              {coupon.type === "Free Shipping" && "N/A"}
                            </td>
                            <td>${coupon.minOrder}</td>
                            <td>
                              <div className="font-size-12">Start: {coupon.startDate}</div>
                              <div className="font-size-12 text-muted">End: {coupon.endDate}</div>
                            </td>
                            <td>
                              <span className="fw-medium">{coupon.usageCount}</span>
                              <span className="text-muted"> / {coupon.usageLimit}</span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  coupon.status === "Active" ? "bg-success" : "bg-danger"
                                }`}
                              >
                                {coupon.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  color="info"
                                  outline
                                  onClick={() => openCouponModal(coupon)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  outline
                                  onClick={() => deleteCoupon(coupon.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalItems={coupons.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Add / Edit Coupon Modal */}
          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Add New Coupon"}
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup className="mb-3">
                  <Label for="couponCode">Coupon Code</Label>
                  <Input
                    type="text"
                    id="couponCode"
                    name="code"
                    value={formValues.code}
                    onChange={handleInputChange}
                    invalid={!!errors.code}
                    placeholder="e.g. SUMMER25"
                  />
                  <FormFeedback>{errors.code}</FormFeedback>
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label for="couponType">Discount Type</Label>
                  <Input
                    type="select"
                    id="couponType"
                    name="type"
                    value={formValues.type}
                    onChange={handleInputChange}
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </Input>
                </FormGroup>

                {formValues.type !== "Free Shipping" && (
                  <FormGroup className="mb-3">
                    <Label for="couponValue">Discount Value</Label>
                    <Input
                      type="number"
                      id="couponValue"
                      name="value"
                      value={formValues.value}
                      onChange={handleInputChange}
                      invalid={!!errors.value}
                      min="0"
                    />
                    <FormFeedback>{errors.value}</FormFeedback>
                  </FormGroup>
                )}

                <FormGroup className="mb-3">
                  <Label for="minOrder">Minimum Order Amount ($)</Label>
                  <Input
                    type="number"
                    id="minOrder"
                    name="minOrder"
                    value={formValues.minOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </FormGroup>

                <Row>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="startDate">Start Date</Label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formValues.startDate}
                        onChange={handleInputChange}
                        invalid={!!errors.startDate}
                      />
                      <FormFeedback>{errors.startDate}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="endDate">End Date</Label>
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formValues.endDate}
                        onChange={handleInputChange}
                        invalid={!!errors.endDate}
                      />
                      <FormFeedback>{errors.endDate}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup className="mb-3">
                  <Label for="usageLimit">Max Usage Limit</Label>
                  <Input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formValues.usageLimit}
                    onChange={handleInputChange}
                    invalid={!!errors.usageLimit}
                    min="1"
                  />
                  <FormFeedback>{errors.usageLimit}</FormFeedback>
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Close
              </Button>
              <Button color="primary" onClick={saveCoupon}>
                Save Coupon
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Coupons;
