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
  Alert,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { getRealPopupConfig, updateRealPopupConfig } from "../../helpers/real_backend_helper";

const PopupManager = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Popup configuration state
  const [popup, setPopup] = useState({
    title: "GET 15% OFF YOUR FIRST ORDER!",
    subtitle: "Subscribe to our newsletters and unlock premium styles and discounts.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    couponCode: "WELCOME15",
    active: true,
    theme: "light",
    triggerExitIntent: true,
    triggerTimeDelay: true,
    timeDelaySeconds: 5,
    triggerScrollDepth: false,
    scrollDepthPercent: 50,
    targetPage: "all",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await getRealPopupConfig();
        if (data && data.popup) {
          setPopup((prev) => ({
            ...prev,
            ...data.popup,
          }));
        }
      } catch (err) {
        console.error("Failed to load popup configuration:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPopup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateRealPopupConfig(popup);
      toast.success("Marketing popup configuration saved successfully!", { autoClose: 2000 });
      setSuccessMsg("Marketing overlays configuration updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save popup config:", err);
      toast.error(err.message || "Failed to save popup configuration", { autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Content" breadcrumbItem="Marketing Popups" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            {/* Overlay Configuration Form */}
            <Col lg="7">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Newsletter & Marketing Overlays</CardTitle>
                  <Form onSubmit={handleSave}>
                    <div className="form-check form-switch mb-3">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id="popupActive"
                        name="active"
                        checked={popup.active}
                        onChange={handleInputChange}
                      />
                      <Label className="form-check-label fw-bold text-dark" for="popupActive">
                        Enable Marketing Popup
                      </Label>
                    </div>

                    <FormGroup className="mb-3">
                      <Label for="popupTitle">Popup Main Title</Label>
                      <Input
                        type="text"
                        id="popupTitle"
                        name="title"
                        value={popup.title}
                        onChange={handleInputChange}
                        required
                        disabled={!popup.active}
                      />
                    </FormGroup>

                    <FormGroup className="mb-3">
                      <Label for="popupSubtitle">Popup Subtitle Description</Label>
                      <Input
                        type="textarea"
                        id="popupSubtitle"
                        name="subtitle"
                        value={popup.subtitle}
                        onChange={handleInputChange}
                        rows="3"
                        required
                        disabled={!popup.active}
                      />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="popupCoupon">Incentive Coupon Code</Label>
                          <Input
                            type="text"
                            id="popupCoupon"
                            name="couponCode"
                            value={popup.couponCode}
                            onChange={handleInputChange}
                            placeholder="e.g. WELCOME15"
                            disabled={!popup.active}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="popupTheme">Display Theme Style</Label>
                          <Input
                            type="select"
                            id="popupTheme"
                            name="theme"
                            value={popup.theme}
                            onChange={handleInputChange}
                            disabled={!popup.active}
                          >
                            <option value="light">Light Modal</option>
                            <option value="dark">Dark Minimal</option>
                            <option value="primary">Brand Accent Color</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup className="mb-3">
                      <Label for="popupImage">Promo Image URL</Label>
                      <Input
                        type="text"
                        id="popupImage"
                        name="image"
                        value={popup.image}
                        onChange={handleInputChange}
                        disabled={!popup.active}
                      />
                    </FormGroup>

                    <hr className="my-4" />

                    <CardTitle className="h5 mb-3">Behavior & Triggers</CardTitle>

                    <FormGroup className="mb-3">
                      <Label for="targetPage">Target Pages</Label>
                      <Input
                        type="select"
                        id="targetPage"
                        name="targetPage"
                        value={popup.targetPage}
                        onChange={handleInputChange}
                        disabled={!popup.active}
                      >
                        <option value="all">All Storefront Pages</option>
                        <option value="homepage">Homepage Only</option>
                        <option value="cart">Cart & Checkout Pages</option>
                        <option value="products">Product Details Pages Only</option>
                      </Input>
                    </FormGroup>

                    <div className="border p-3 rounded mb-3 bg-light">
                      <div className="form-check form-switch mb-3">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="triggerExitIntent"
                          name="triggerExitIntent"
                          checked={popup.triggerExitIntent}
                          onChange={handleInputChange}
                          disabled={!popup.active}
                        />
                        <Label className="form-check-label" for="triggerExitIntent">
                          Trigger on Exit Intent (detect mouse leaving page)
                        </Label>
                      </div>

                      <Row className="align-items-center mb-3">
                        <Col xs="auto">
                          <div className="form-check form-switch">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="triggerTimeDelay"
                              name="triggerTimeDelay"
                              checked={popup.triggerTimeDelay}
                              onChange={handleInputChange}
                              disabled={!popup.active}
                            />
                            <Label className="form-check-label" for="triggerTimeDelay">
                              Trigger after Time Delay
                            </Label>
                          </div>
                        </Col>
                        <Col xs="4">
                          <div className="input-group input-group-sm">
                            <Input
                              type="number"
                              name="timeDelaySeconds"
                              value={popup.timeDelaySeconds}
                              onChange={handleInputChange}
                              min="0"
                              disabled={!popup.active || !popup.triggerTimeDelay}
                            />
                            <span className="input-group-text">seconds</span>
                          </div>
                        </Col>
                      </Row>

                      <Row className="align-items-center mb-0">
                        <Col xs="auto">
                          <div className="form-check form-switch">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="triggerScrollDepth"
                              name="triggerScrollDepth"
                              checked={popup.triggerScrollDepth}
                              onChange={handleInputChange}
                              disabled={!popup.active}
                            />
                            <Label className="form-check-label" for="triggerScrollDepth">
                              Trigger on Scroll Depth
                            </Label>
                          </div>
                        </Col>
                        <Col xs="4">
                          <div className="input-group input-group-sm">
                            <Input
                              type="number"
                              name="scrollDepthPercent"
                              value={popup.scrollDepthPercent}
                              onChange={handleInputChange}
                              min="1"
                              max="100"
                              disabled={!popup.active || !popup.triggerScrollDepth}
                            />
                            <span className="input-group-text">%</span>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Button type="submit" color="primary" disabled={!popup.active}>
                      Save Configuration
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            {/* Live mockup render preview */}
            <Col lg="5">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Storefront Popup Preview</CardTitle>
                  <p className="text-muted">This is how your marketing overlay will display to users.</p>

                  <div className="border rounded p-4 bg-secondary-subtle d-flex justify-content-center align-items-center" style={{ minHeight: "450px" }}>
                    {popup.active ? (
                      <div
                        className={`card shadow-lg border-0 overflow-hidden ${
                          popup.theme === "dark" ? "bg-dark text-white" : popup.theme === "primary" ? "bg-primary text-white" : "bg-white text-dark"
                        }`}
                        style={{ maxWidth: "340px", borderRadius: "12px" }}
                      >
                        {popup.image && (
                          <img
                            src={popup.image}
                            alt="Mock Popup Preview"
                            style={{ height: "180px", objectFit: "cover", width: "100%" }}
                          />
                        )}
                        <div className="card-body text-center p-4">
                          <h5 className={`fw-bold mb-3 ${popup.theme === "dark" || popup.theme === "primary" ? "text-white" : "text-dark"}`}>
                            {popup.title || "TITLE GOES HERE"}
                          </h5>
                          <p className="font-size-13 opacity-75 mb-4">
                            {popup.subtitle || "Your body message goes here."}
                          </p>

                          {popup.couponCode && (
                            <div className="bg-light-subtle text-dark border border-dashed p-2 rounded mb-3">
                              <span className="fw-bold font-size-12 opacity-50">PROMO CODE</span>
                              <div className="fw-bold font-size-18 text-primary">{popup.couponCode}</div>
                            </div>
                          )}

                          <input
                            type="email"
                            className="form-control form-control-sm text-center mb-3"
                            placeholder="Enter email to subscribe"
                            disabled
                          />
                          <button
                            type="button"
                            className={`btn btn-sm w-100 fw-medium ${
                              popup.theme === "primary" ? "btn-light text-primary" : "btn-primary"
                            }`}
                          >
                            Claim Offer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bx bx-show-off mb-2" style={{ fontSize: "3rem" }}></i>
                        <div>Marketing Overlay is currently Inactive</div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PopupManager;
