import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
  Alert,
  FormFeedback,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import { toast } from "react-toastify";
import {
  getRealDiscounts,
  createRealDiscount,
  deleteRealDiscount,
} from "../../helpers/real_backend_helper";

const Discounts = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch discounts from real API
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const data = await getRealDiscounts();
        const arr = Array.isArray(data) ? data : [];
        setCampaigns(
          arr.map((d) => ({
            id: d.id,
            name: d.name || d.description || "Discount",
            targetType: d.targetType || "Product",
            targetValue: d.targetValue || "All",
            discountType: d.discountType === "PERCENTAGE" ? "Percentage" : d.discountType === "FIXED" ? "Fixed Amount" : d.discountType || "Percentage",
            value: parseFloat(d.discountValue || d.value || 0),
            startDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : "",
            endDate: d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : "",
            active: d.isActive !== false,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch discounts:", err);
        toast.error("Failed to load discounts", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  // Form State
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    targetType: "Category",
    targetValue: "Footwear",
    discountType: "Percentage",
    value: 0,
    startDate: "",
    endDate: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.name || formValues.name.trim() === "") {
      newErrors.name = "Campaign name is required.";
    }

    if (formValues.discountType !== "BOGO" && (!formValues.value || formValues.value <= 0)) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectCampaignForEdit = (campaign) => {
    setErrors({});
    setEditingCampaign(campaign);
    setFormValues({ ...campaign });
  };

  const startNewCampaign = () => {
    setErrors({});
    setEditingCampaign(null);
    setFormValues({
      name: "",
      targetType: "Category",
      targetValue: "Footwear",
      discountType: "Percentage",
      value: 15,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      active: true,
    });
  };

  const saveCampaign = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCampaign) {
      // Local update as there is no discount update endpoint in API
      setCampaigns((prev) =>
        prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...formValues, value: Number(formValues.value) } : c))
      );
      toast.success("Discount campaign updated locally!", { autoClose: 2000 });
    } else {
      try {
        const payload = {
          name: formValues.name,
          discountType: formValues.discountType === "Percentage" ? "PERCENT" : "FIXED",
          discountValue: Number(formValues.value),
          targetType: formValues.targetType === "Category" ? "CATEGORY" : formValues.targetType === "Product" ? "PRODUCT" : "ALL",
          startDate: new Date(formValues.startDate).toISOString(),
          endDate: new Date(formValues.endDate).toISOString(),
          isActive: formValues.active,
        };
        const created = await createRealDiscount(payload);
        setCampaigns((prev) => [
          ...prev,
          {
            id: created.id || Date.now(),
            name: formValues.name,
            targetType: formValues.targetType,
            targetValue: formValues.targetValue,
            discountType: formValues.discountType,
            value: Number(formValues.value),
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            active: formValues.active,
          },
        ]);
        toast.success("Discount campaign created successfully!", { autoClose: 2000 });
      } catch (err) {
        console.error("Failed to create discount:", err);
        toast.error(err.message || "Failed to create discount", { autoClose: 3000 });
        return;
      }
    }

    startNewCampaign();
  };

  const deleteCampaign = async (id) => {
    try {
      await deleteRealDiscount(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast.success("Campaign deleted successfully.", { autoClose: 2000 });
      if (editingCampaign && editingCampaign.id === id) {
        startNewCampaign();
      }
    } catch (err) {
      console.error("Failed to delete discount:", err);
      toast.error(err.message || "Failed to delete discount", { autoClose: 3000 });
    }
  };

  const toggleCampaignActive = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Promotions" breadcrumbItem="Automatic Discounts" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            {/* Left: Active campaigns list */}
            <Col lg="7">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Active Campaign Rules</CardTitle>
                  <div className="table-responsive">
                    <Table className="table align-middle table-nowrap table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Campaign Name</th>
                          <th>Target</th>
                          <th>Value</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns
                          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                          .map((campaign) => (
                          <tr key={campaign.id} className={editingCampaign?.id === campaign.id ? "table-light" : ""}>
                            <td>
                              <span className="fw-medium font-size-14 text-dark">{campaign.name}</span>
                              <div className="text-muted font-size-11">
                                {campaign.startDate} to {campaign.endDate}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">{campaign.targetType}</span>
                              <div className="text-muted font-size-11">{campaign.targetValue}</div>
                            </td>
                            <td>
                              {campaign.discountType === "Percentage" && `${campaign.value}%`}
                              {campaign.discountType === "Fixed Amount" && `$${campaign.value}`}
                              {campaign.discountType === "BOGO" && "BOGO"}
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <Input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`active-${campaign.id}`}
                                  checked={campaign.active}
                                  onChange={() => toggleCampaignActive(campaign.id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  color="info"
                                  outline
                                  onClick={() => selectCampaignForEdit(campaign)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  outline
                                  onClick={() => deleteCampaign(campaign.id)}
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
                    totalItems={campaigns.length}
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

            {/* Right: Discount rule builder */}
            <Col lg="5">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="mb-0">
                      {editingCampaign ? "Edit Discount Rule" : "Discount Rule Builder"}
                    </CardTitle>
                    {editingCampaign && (
                      <Button size="sm" color="light" onClick={startNewCampaign}>
                        Create New Rule
                      </Button>
                    )}
                  </div>

                  <Form onSubmit={saveCampaign}>
                    <FormGroup className="mb-3">
                      <Label for="campaignName">Campaign Name</Label>
                      <Input
                        type="text"
                        id="campaignName"
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        invalid={!!errors.name}
                        placeholder="e.g. Back to School 15% discount"
                      />
                      <FormFeedback>{errors.name}</FormFeedback>
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="targetType">Target Type</Label>
                          <Input
                            type="select"
                            id="targetType"
                            name="targetType"
                            value={formValues.targetType}
                            onChange={handleInputChange}
                          >
                            <option value="Category">Category</option>
                            <option value="Product">Specific Product</option>
                            <option value="Cart">Entire Order Value</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="targetValue">Target Selection</Label>
                          <Input
                            type="text"
                            id="targetValue"
                            name="targetValue"
                            value={formValues.targetValue}
                            onChange={handleInputChange}
                            placeholder="e.g. Footwear / Product ID"
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="discountType">Discount Type</Label>
                          <Input
                            type="select"
                            id="discountType"
                            name="discountType"
                            value={formValues.discountType}
                            onChange={handleInputChange}
                          >
                            <option value="Percentage">Percentage Off</option>
                            <option value="Fixed Amount">Fixed Amount Off</option>
                            <option value="BOGO">BOGO (Buy 2 Get 1)</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="value">Discount Value</Label>
                          <Input
                            type="number"
                            id="value"
                            name="value"
                            value={formValues.value}
                            onChange={handleInputChange}
                            invalid={!!errors.value}
                            disabled={formValues.discountType === "BOGO"}
                          />
                          <FormFeedback>{errors.value}</FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>

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

                    <div className="form-check form-switch mb-3">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id="ruleActive"
                        name="active"
                        checked={formValues.active}
                        onChange={handleInputChange}
                      />
                      <Label className="form-check-label" for="ruleActive">
                        Enable this discount rule immediately
                      </Label>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      {editingCampaign && (
                        <Button type="button" color="light" onClick={startNewCampaign}>
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" color="primary">
                        {editingCampaign ? "Update Discount Rule" : "Create Discount Rule"}
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Discounts;
