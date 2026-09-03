import React, { useState } from "react";
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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Table,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { getRealSettings, updateRealSettings } from "../../helpers/real_backend_helper";
import { CURRENCIES, getActiveCurrencyCode, setActiveCurrencyCode } from "../../helpers/currency_helper";
import { useBranding } from "../../context/BrandingContext";

const SystemSettings = () => {
  const { refreshBranding } = useBranding();
  const [activeTab, setActiveTab] = useState("1");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Fetch real settings from API on load
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getRealSettings();
        if (data && data.storeSettings) {
          const s = data.storeSettings;
          if (s.currency) {
            setActiveCurrencyCode(s.currency);
          }
          setGeneral((prev) => ({
            ...prev,
            businessName: s.businessName || s.storeName || prev.businessName,
            supportEmail: s.supportEmail || s.contactEmail || s.storeEmail || prev.supportEmail,
            address: s.address || s.storeAddress || prev.address,
            currency: s.currency || s.storeCurrency || prev.currency,
            timezone: s.timezone || prev.timezone,
            taxDisplay: s.taxDisplay || prev.taxDisplay,
          }));

          setPayments((prev) => ({
            ...prev,
            stripeEnabled: s.stripeEnabled === "true" || s.stripe_enabled === "true" || s.stripeEnabled === true,
            paypalEnabled: s.paypalEnabled === "true" || s.paypal_enabled === "true" || s.paypalEnabled === true,
            codEnabled: s.codEnabled === "true" || s.cod_enabled === "true" || s.codEnabled === true,
            bankEnabled: s.bankEnabled === "true" || s.bank_transfer_enabled === "true" || s.bankEnabled === true,
          }));
        }
      } catch (err) {
        console.error("Failed to load store settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // --- GENERAL SETTINGS ---
  const [general, setGeneral] = useState({
    businessName: "Veloce Inc.",
    supportEmail: "contact@veloce.com",
    address: "100 Fashion Avenue, New York, NY 10001",
    currency: getActiveCurrencyCode() || "PKR",
    timezone: "EST",
    taxDisplay: "exclude",
  });

  // --- PAYMENTS SETTINGS ---
  const [payments, setPayments] = useState({
    stripeEnabled: true,
    stripePubKey: "pk_live_51P...",
    stripeSecretKey: "sk_live_51P...",
    stripeWebhookSecret: "whsec_...",
    paypalEnabled: false,
    paypalClientId: "",
    paypalSecret: "",
    codEnabled: true,
    bankEnabled: false,
    bankInstructions: "Please transfer funds to Account: 1234-5678-9012, Bank: Chase, Code: CHASEUS33.",
  });

  // --- SHIPPING SETTINGS ---
  const [shippingZones, setShippingZones] = useState([
    { id: 1, name: "Domestic USA", type: "Flat Rate", rate: 5.99, minOrderForFree: 75 },
    { id: 2, name: "Canada & Mexico", type: "Flat Rate", rate: 14.99, minOrderForFree: 150 },
    { id: 3, name: "Rest of the World", type: "Weight Based", rate: 29.99, minOrderForFree: 250 },
  ]);
  const [newZone, setNewZone] = useState({ name: "", type: "Flat Rate", rate: 0, minOrderForFree: 0 });

  // --- TAXES SETTINGS ---
  const [taxes, setTaxes] = useState([
    { id: 1, country: "United States", state: "NY", ratePercent: 8.875 },
    { id: 2, country: "United States", state: "CA", ratePercent: 7.25 },
    { id: 3, country: "Canada", state: "ON", ratePercent: 13.0 },
  ]);
  const [newTax, setNewTax] = useState({ country: "United States", state: "", ratePercent: 5.0 });

  // --- SMTP SETTINGS ---
  const [smtp, setSmtp] = useState({
    host: "smtp.mailgun.org",
    port: "587",
    user: "postmaster@mg.veloce.com",
    pass: "••••••••••••••••••••",
    secure: true,
    template: "order_confirmation",
  });

  // --- TRACKING & META ---
  const [tracking, setTracking] = useState({
    ga4Id: "G-XXXXXXXXXX",
    gtmId: "GTM-XXXXXXX",
    pixelId: "123456789012345",
    conversionsToken: "EAA...",
  });

  // --- WEBHOOKS ---
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: "https://api.thirdparty.com/webhook", secret: "sec_abc123", events: "order.created, order.paid" },
  ]);
  const [newWebhook, setNewWebhook] = useState({ url: "", secret: "", events: "order.created" });

  // --- API KEYS ---
  const [apiKeys, setApiKeys] = useState([
    { id: 1, label: "Mobile Apps API Token", token: "veloce_live_tkn_88df294fa0e219cb8bc", scopes: "Read:Products, Read:Categories", expires: "Never" },
  ]);
  const [newKeyForm, setNewKeyForm] = useState({
    label: "",
    scopes: {
      readProducts: true,
      writeProducts: false,
      readOrders: true,
      writeOrders: false,
      readCustomers: false,
    },
    expiry: "never",
  });

  // Handlers
  const handleInputChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        storeSettings: {
          storeName: general.businessName,
          businessName: general.businessName,
          supportEmail: general.supportEmail,
          contactEmail: general.supportEmail,
          address: general.address,
          currency: general.currency,
          timezone: general.timezone,
          taxDisplay: general.taxDisplay,
          stripeEnabled: String(payments.stripeEnabled),
          paypalEnabled: String(payments.paypalEnabled),
          codEnabled: String(payments.codEnabled),
          bankEnabled: String(payments.bankEnabled),
        },
      };
      await updateRealSettings(payload);
      await refreshBranding();
      setActiveCurrencyCode(general.currency);
      toast.success("Settings updated successfully!", { autoClose: 2000 });
      setSuccessMsg("Settings updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error(err.message || "Failed to save settings", { autoClose: 3000 });
    }
  };

  // Shipping Add
  const addShippingZone = () => {
    if (!newZone.name) return;
    setShippingZones((prev) => [
      ...prev,
      { ...newZone, id: Date.now(), rate: Number(newZone.rate), minOrderForFree: Number(newZone.minOrderForFree) },
    ]);
    setNewZone({ name: "", type: "Flat Rate", rate: 0, minOrderForFree: 0 });
    setSuccessMsg("Shipping zone added successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const deleteShippingZone = (id) => {
    setShippingZones((prev) => prev.filter((z) => z.id !== id));
  };

  // Tax Add
  const addTaxRule = () => {
    if (!newTax.state) return;
    setTaxes((prev) => [
      ...prev,
      { ...newTax, id: Date.now(), ratePercent: Number(newTax.ratePercent) },
    ]);
    setNewTax({ country: "United States", state: "", ratePercent: 5.0 });
    setSuccessMsg("Tax rule added successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const deleteTaxRule = (id) => {
    setTaxes((prev) => prev.filter((t) => t.id !== id));
  };

  // Webhook Add
  const addWebhook = () => {
    if (!newWebhook.url) return;
    setWebhooks((prev) => [
      ...prev,
      { ...newWebhook, id: Date.now() },
    ]);
    setNewWebhook({ url: "", secret: "", events: "order.created" });
    setSuccessMsg("Webhook endpoint registered successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const deleteWebhook = (id) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  // API Token Gen
  const generateApiKey = () => {
    if (!newKeyForm.label) return;

    const scopesList = [];
    if (newKeyForm.scopes.readProducts) scopesList.push("Read:Products");
    if (newKeyForm.scopes.writeProducts) scopesList.push("Write:Products");
    if (newKeyForm.scopes.readOrders) scopesList.push("Read:Orders");
    if (newKeyForm.scopes.writeOrders) scopesList.push("Write:Orders");
    if (newKeyForm.scopes.readCustomers) scopesList.push("Read:Customers");

    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let tokenValue = "veloce_live_tkn_";
    for (let i = 0; i < 20; i++) {
      tokenValue += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const expiryLabel = newKeyForm.expiry === "never" ? "Never" : "365 Days";

    const newKey = {
      id: Date.now(),
      label: newKeyForm.label,
      token: tokenValue,
      scopes: scopesList.join(", ") || "None",
      expires: expiryLabel,
    };

    setApiKeys((prev) => [...prev, newKey]);
    setNewKeyForm({
      label: "",
      scopes: {
        readProducts: true,
        writeProducts: false,
        readOrders: true,
        writeOrders: false,
        readCustomers: false,
      },
      expiry: "never",
    });
    setSuccessMsg("API Access Key generated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const deleteApiKey = (id) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Settings" breadcrumbItem="System Panel" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            {/* Left Hand Navigation for Settings Panels */}
            <Col lg="3" className="mb-4">
              <Card>
                <CardBody className="p-2">
                  <Nav pills className="flex-column nav-pills-custom">
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => toggleTab("1")}
                      >
                        <i className="bx bx-cog me-2"></i> General Details
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => toggleTab("2")}
                      >
                        <i className="bx bx-credit-card me-2"></i> Payment Systems
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => toggleTab("3")}
                      >
                        <i className="bx bx-truck me-2"></i> Shipping Formulas
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => toggleTab("4")}
                      >
                        <i className="bx bx-calculator me-2"></i> Tax Mappings
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "5" })}
                        onClick={() => toggleTab("5")}
                      >
                        <i className="bx bx-envelope me-2"></i> SMTP & Templates
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "6" })}
                        onClick={() => toggleTab("6")}
                      >
                        <i className="bx bx-bar-chart-alt-2 me-2"></i> Pixels & Google GA4
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "7" })}
                        onClick={() => toggleTab("7")}
                      >
                        <i className="bx bx-world me-2"></i> Outbound Webhooks
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "8" })}
                        onClick={() => toggleTab("8")}
                      >
                        <i className="bx bx-key me-2"></i> API Token Manager
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardBody>
              </Card>
            </Col>

            {/* Right Hand Settings Card Panels */}
            <Col lg="9">
              <Card>
                <CardBody className="p-4">
                  <Form onSubmit={handleSave}>
                    <TabContent activeTab={activeTab}>
                      {/* 1. General Panel */}
                      <TabPane tabId="1">
                        <CardTitle className="mb-4">General Business Info</CardTitle>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Legal Registered Name</Label>
                              <Input
                                type="text"
                                name="businessName"
                                value={general.businessName}
                                onChange={handleInputChange(setGeneral)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Support Inbox Email</Label>
                              <Input
                                type="email"
                                name="supportEmail"
                                value={general.supportEmail}
                                onChange={handleInputChange(setGeneral)}
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <FormGroup className="mb-3">
                          <Label>Operating Headquarters Address</Label>
                          <Input
                            type="text"
                            name="address"
                            value={general.address}
                            onChange={handleInputChange(setGeneral)}
                            required
                          />
                        </FormGroup>
                        <Row>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label>Default Base Currency</Label>
                              <Input
                                type="select"
                                name="currency"
                                value={general.currency}
                                onChange={handleInputChange(setGeneral)}
                              >
                                {Object.values(CURRENCIES).map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.label}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label>System Timezone</Label>
                              <Input
                                type="select"
                                name="timezone"
                                value={general.timezone}
                                onChange={handleInputChange(setGeneral)}
                              >
                                <option value="EST">EST (UTC-5)</option>
                                <option value="PST">PST (UTC-8)</option>
                                <option value="GMT">GMT (UTC+0)</option>
                                <option value="CET">CET (UTC+1)</option>
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label>Tax Calculation Layout</Label>
                              <Input
                                type="select"
                                name="taxDisplay"
                                value={general.taxDisplay}
                                onChange={handleInputChange(setGeneral)}
                              >
                                <option value="exclude">Display Price Excl. Tax</option>
                                <option value="include">Display Price Incl. Tax</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                      </TabPane>

                      {/* 2. Payments Panel */}
                      <TabPane tabId="2">
                        <CardTitle className="mb-4">Configure Gateway Integrations</CardTitle>

                        {/* Stripe Config */}
                        <div className="border p-3 rounded mb-4 bg-light">
                          <div className="form-check form-switch mb-3">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="stripeEnabled"
                              name="stripeEnabled"
                              checked={payments.stripeEnabled}
                              onChange={handleInputChange(setPayments)}
                            />
                            <Label className="form-check-label fw-bold text-dark" for="stripeEnabled">
                              Accept Credit/Debit Cards via Stripe
                            </Label>
                          </div>

                          <Row>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label>Publishable API Key</Label>
                                <Input
                                  type="text"
                                  name="stripePubKey"
                                  value={payments.stripePubKey}
                                  onChange={handleInputChange(setPayments)}
                                  placeholder="pk_live_..."
                                  disabled={!payments.stripeEnabled}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label>Secret API Key</Label>
                                <Input
                                  type="password"
                                  name="stripeSecretKey"
                                  value={payments.stripeSecretKey}
                                  onChange={handleInputChange(setPayments)}
                                  placeholder="sk_live_..."
                                  disabled={!payments.stripeEnabled}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="12">
                              <FormGroup className="mb-0">
                                <Label>Webhook Endpoint Secret Token</Label>
                                <Input
                                  type="text"
                                  name="stripeWebhookSecret"
                                  value={payments.stripeWebhookSecret}
                                  onChange={handleInputChange(setPayments)}
                                  placeholder="whsec_..."
                                  disabled={!payments.stripeEnabled}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </div>

                        {/* PayPal Config */}
                        <div className="border p-3 rounded mb-4 bg-light">
                          <div className="form-check form-switch mb-3">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="paypalEnabled"
                              name="paypalEnabled"
                              checked={payments.paypalEnabled}
                              onChange={handleInputChange(setPayments)}
                            />
                            <Label className="form-check-label fw-bold text-dark" for="paypalEnabled">
                              PayPal Checkout Integrations
                            </Label>
                          </div>

                          <Row>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label>PayPal Client ID</Label>
                                <Input
                                  type="text"
                                  name="paypalClientId"
                                  value={payments.paypalClientId}
                                  onChange={handleInputChange(setPayments)}
                                  disabled={!payments.paypalEnabled}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label>PayPal Secret Token</Label>
                                <Input
                                  type="password"
                                  name="paypalSecret"
                                  value={payments.paypalSecret}
                                  onChange={handleInputChange(setPayments)}
                                  disabled={!payments.paypalEnabled}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </div>

                        {/* Cash on Delivery */}
                        <div className="form-check form-switch mb-3">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            id="codEnabled"
                            name="codEnabled"
                            checked={payments.codEnabled}
                            onChange={handleInputChange(setPayments)}
                          />
                          <Label className="form-check-label" for="codEnabled">
                            Enable Cash on Delivery (COD) Option
                          </Label>
                        </div>

                        {/* Bank Transfer */}
                        <div className="border p-3 rounded bg-light">
                          <div className="form-check form-switch mb-3">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="bankEnabled"
                              name="bankEnabled"
                              checked={payments.bankEnabled}
                              onChange={handleInputChange(setPayments)}
                            />
                            <Label className="form-check-label fw-bold text-dark" for="bankEnabled">
                              Enable Direct Bank Transfer (BACS)
                            </Label>
                          </div>
                          <FormGroup className="mb-0">
                            <Label>Transfer Instructions Details</Label>
                            <Input
                              type="textarea"
                              name="bankInstructions"
                              value={payments.bankInstructions}
                              onChange={handleInputChange(setPayments)}
                              rows="2"
                              disabled={!payments.bankEnabled}
                            />
                          </FormGroup>
                        </div>
                      </TabPane>

                      {/* 3. Shipping Panel */}
                      <TabPane tabId="3">
                        <CardTitle className="mb-4">Shipping Rates & Threshold Formulas</CardTitle>

                        <Table className="align-middle mb-4">
                          <thead className="table-light">
                            <tr>
                              <th>Shipping Zone / Country</th>
                              <th>Formula / Type</th>
                              <th>Rate Cost</th>
                              <th>Free Shipping Limit</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shippingZones.map((z) => (
                              <tr key={z.id}>
                                <td>{z.name}</td>
                                <td>{z.type}</td>
                                <td>${z.rate}</td>
                                <td>Orders over ${z.minOrderForFree}</td>
                                <td>
                                  <Button size="sm" color="danger" outline onClick={() => deleteShippingZone(z.id)}>
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="border p-3 rounded bg-light">
                          <CardTitle className="h6 mb-3">Create Shipping Zone Formula</CardTitle>
                          <Row>
                            <Col md="3">
                              <FormGroup className="mb-3">
                                <Label>Zone Title</Label>
                                <Input
                                  type="text"
                                  value={newZone.name}
                                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                  placeholder="e.g. EU & Western Europe"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="3">
                              <FormGroup className="mb-3">
                                <Label>Type</Label>
                                <Input
                                  type="select"
                                  value={newZone.type}
                                  onChange={(e) => setNewZone({ ...newZone, type: e.target.value })}
                                >
                                  <option value="Flat Rate">Flat Rate Shipping</option>
                                  <option value="Weight Based">Weight Based Shipping</option>
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col md="2">
                              <FormGroup className="mb-3">
                                <Label>Base Rate ($)</Label>
                                <Input
                                  type="number"
                                  value={newZone.rate}
                                  onChange={(e) => setNewZone({ ...newZone, rate: e.target.value })}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="2">
                              <FormGroup className="mb-3">
                                <Label>Free Shipping Limit</Label>
                                <Input
                                  type="number"
                                  value={newZone.minOrderForFree}
                                  onChange={(e) => setNewZone({ ...newZone, minOrderForFree: e.target.value })}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="2" className="d-flex align-items-end mb-3">
                              <Button type="button" color="success" onClick={addShippingZone} className="w-100">
                                Add Zone
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </TabPane>

                      {/* 4. Taxes Panel */}
                      <TabPane tabId="4">
                        <CardTitle className="mb-4">Country & State Sales Tax Rates</CardTitle>

                        <Table className="align-middle mb-4">
                          <thead className="table-light">
                            <tr>
                              <th>Region/Country</th>
                              <th>State/Province</th>
                              <th>Tax Percentage</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {taxes.map((t) => (
                              <tr key={t.id}>
                                <td>{t.country}</td>
                                <td>{t.state}</td>
                                <td>{t.ratePercent}%</td>
                                <td>
                                  <Button size="sm" color="danger" outline onClick={() => deleteTaxRule(t.id)}>
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="border p-3 rounded bg-light">
                          <CardTitle className="h6 mb-3">Register Tax Rule</CardTitle>
                          <Row>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label>Country</Label>
                                <Input
                                  type="select"
                                  value={newTax.country}
                                  onChange={(e) => setNewTax({ ...newTax, country: e.target.value })}
                                >
                                  <option value="United States">United States</option>
                                  <option value="Canada">Canada</option>
                                  <option value="United Kingdom">United Kingdom</option>
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col md="3">
                              <FormGroup className="mb-3">
                                <Label>State/Province Code</Label>
                                <Input
                                  type="text"
                                  value={newTax.state}
                                  onChange={(e) => setNewTax({ ...newTax, state: e.target.value })}
                                  placeholder="e.g. TX, FL, BC"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="3">
                              <FormGroup className="mb-3">
                                <Label>Sales Tax Rate (%)</Label>
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={newTax.ratePercent}
                                  onChange={(e) => setNewTax({ ...newTax, ratePercent: e.target.value })}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="2" className="d-flex align-items-end mb-3">
                              <Button type="button" color="success" onClick={addTaxRule} className="w-100">
                                Add Rule
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </TabPane>

                      {/* 5. SMTP Panel */}
                      <TabPane tabId="5">
                        <CardTitle className="mb-4">SMTP Credentials & Notification Templates</CardTitle>
                        <Row>
                          <Col md="8">
                            <FormGroup className="mb-3">
                              <Label>SMTP Host Address</Label>
                              <Input
                                type="text"
                                name="host"
                                value={smtp.host}
                                onChange={handleInputChange(setSmtp)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label>Port</Label>
                              <Input
                                type="text"
                                name="port"
                                value={smtp.port}
                                onChange={handleInputChange(setSmtp)}
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>SMTP Username/Login</Label>
                              <Input
                                type="text"
                                name="user"
                                value={smtp.user}
                                onChange={handleInputChange(setSmtp)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>SMTP Password</Label>
                              <Input
                                type="password"
                                name="pass"
                                value={smtp.pass}
                                onChange={handleInputChange(setSmtp)}
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div className="form-check form-switch mb-4">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            id="smtpSecure"
                            name="secure"
                            checked={smtp.secure}
                            onChange={handleInputChange(setSmtp)}
                          />
                          <Label className="form-check-label" for="smtpSecure">
                            Use SSL/TLS secure connection
                          </Label>
                        </div>

                        <hr className="my-4" />

                        <CardTitle className="h5 mb-3">Email Notification Previewer</CardTitle>
                        <FormGroup className="mb-3">
                          <Label>Select Trigger Event Template</Label>
                          <Input
                            type="select"
                            name="template"
                            value={smtp.template}
                            onChange={handleInputChange(setSmtp)}
                          >
                            <option value="welcome_email">New Customer Signup Welcome Email</option>
                            <option value="order_confirmation">Customer Order Receipt Confirmation</option>
                            <option value="shipped">Package Shipped Out Notification</option>
                          </Input>
                        </FormGroup>
                        <div className="bg-light p-3 border rounded">
                          <h6 className="fw-semibold">Subject: Order #{3982} Payment Received & Confirmed!</h6>
                          <hr />
                          <p className="font-size-13 text-muted">
                            Hi {"{{customer_name}}"},
                            <br />
                            Thank you for shopping at Veloce! Your payment for order {"{{order_id}}"} was successfully captured.
                            We are preparing your package to ship as soon as possible. Feel free to check updates in your dashboard.
                          </p>
                        </div>
                      </TabPane>

                      {/* 6. Tracking & Meta Panel */}
                      <TabPane tabId="6">
                        <CardTitle className="mb-4">Third-Party Tracking Tags & Pixels</CardTitle>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Google Analytics 4 Measurement ID</Label>
                              <Input
                                type="text"
                                name="ga4Id"
                                value={tracking.ga4Id}
                                onChange={handleInputChange(setTracking)}
                                placeholder="G-XXXXXXXXXX"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Google Tag Manager Container ID</Label>
                              <Input
                                type="text"
                                name="gtmId"
                                value={tracking.gtmId}
                                onChange={handleInputChange(setTracking)}
                                placeholder="GTM-XXXXXXX"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Meta Pixel ID</Label>
                              <Input
                                type="text"
                                name="pixelId"
                                value={tracking.pixelId}
                                onChange={handleInputChange(setTracking)}
                                placeholder="e.g. 123456789012345"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3">
                              <Label>Meta Conversions API Token</Label>
                              <Input
                                type="textarea"
                                name="conversionsToken"
                                value={tracking.conversionsToken}
                                onChange={handleInputChange(setTracking)}
                                rows="2"
                                placeholder="EAA..."
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </TabPane>

                      {/* 7. Outbound Webhooks Panel */}
                      <TabPane tabId="7">
                        <CardTitle className="mb-4">Outbound Developer Webhooks</CardTitle>

                        <Table className="align-middle mb-4">
                          <thead className="table-light">
                            <tr>
                              <th>Destination URL</th>
                              <th>Subscription Events</th>
                              <th>Signing Secret</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {webhooks.map((w) => (
                              <tr key={w.id}>
                                <td>
                                  <code className="text-primary">{w.url}</code>
                                </td>
                                <td>{w.events}</td>
                                <td>{w.secret}</td>
                                <td>
                                  <Button size="sm" color="danger" outline onClick={() => deleteWebhook(w.id)}>
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="border p-3 rounded bg-light">
                          <CardTitle className="h6 mb-3">Register Outbound Webhook</CardTitle>
                          <Row>
                            <Col md="5">
                              <FormGroup className="mb-3">
                                <Label>Endpoint Destination URL</Label>
                                <Input
                                  type="url"
                                  value={newWebhook.url}
                                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                  placeholder="https://api.yourdomain.com/v1/webhook"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label>Subscription Trigger Event</Label>
                                <Input
                                  type="select"
                                  value={newWebhook.events}
                                  onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value })}
                                >
                                  <option value="order.created">order.created</option>
                                  <option value="order.paid">order.paid</option>
                                  <option value="product.stock_low">product.stock_low</option>
                                  <option value="customer.registered">customer.registered</option>
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col md="3" className="d-flex align-items-end mb-3">
                              <Button type="button" color="success" onClick={addWebhook} className="w-100">
                                Register Endpoint
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </TabPane>

                      {/* 8. API Keys Panel */}
                      <TabPane tabId="8">
                        <CardTitle className="mb-4">Scoped API Keys & Developer Access</CardTitle>

                        <Table className="align-middle mb-4">
                          <thead className="table-light">
                            <tr>
                              <th>Label</th>
                              <th>Token Preview</th>
                              <th>Authorization Scopes</th>
                              <th>Expires</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiKeys.map((k) => (
                              <tr key={k.id}>
                                <td>{k.label}</td>
                                <td>
                                  <code>{k.token}</code>
                                </td>
                                <td>{k.scopes}</td>
                                <td>{k.expires}</td>
                                <td>
                                  <Button size="sm" color="danger" outline onClick={() => deleteApiKey(k.id)}>
                                    Revoke
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="border p-3 rounded bg-light">
                          <CardTitle className="h6 mb-3">Generate Scoped Integration API Token</CardTitle>
                          <Row>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label>Friendly Label Name</Label>
                                <Input
                                  type="text"
                                  value={newKeyForm.label}
                                  onChange={(e) => setNewKeyForm({ ...newKeyForm, label: e.target.value })}
                                  placeholder="e.g. ERP Inventory Sync Tool"
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label>Validity Duration</Label>
                                <Input
                                  type="select"
                                  value={newKeyForm.expiry}
                                  onChange={(e) => setNewKeyForm({ ...newKeyForm, expiry: e.target.value })}
                                >
                                  <option value="never">Never Expires (Lifetime Token)</option>
                                  <option value="year">1 Year Expiry</option>
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col md="5">
                              <Label className="fw-bold">Scopes Checklist</Label>
                              <Row>
                                <Col md="6">
                                  <div className="form-check mb-2">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="scopeRP"
                                      checked={newKeyForm.scopes.readProducts}
                                      onChange={(e) =>
                                        setNewKeyForm({
                                          ...newKeyForm,
                                          scopes: { ...newKeyForm.scopes, readProducts: e.target.checked },
                                        })
                                      }
                                    />
                                    <Label className="form-check-label" for="scopeRP">
                                      Read:Products
                                    </Label>
                                  </div>
                                  <div className="form-check mb-2">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="scopeWP"
                                      checked={newKeyForm.scopes.writeProducts}
                                      onChange={(e) =>
                                        setNewKeyForm({
                                          ...newKeyForm,
                                          scopes: { ...newKeyForm.scopes, writeProducts: e.target.checked },
                                        })
                                      }
                                    />
                                    <Label className="form-check-label" for="scopeWP">
                                      Write:Products
                                    </Label>
                                  </div>
                                </Col>
                                <Col md="6">
                                  <div className="form-check mb-2">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="scopeRO"
                                      checked={newKeyForm.scopes.readOrders}
                                      onChange={(e) =>
                                        setNewKeyForm({
                                          ...newKeyForm,
                                          scopes: { ...newKeyForm.scopes, readOrders: e.target.checked },
                                        })
                                      }
                                    />
                                    <Label className="form-check-label" for="scopeRO">
                                      Read:Orders
                                    </Label>
                                  </div>
                                  <div className="form-check mb-2">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="scopeWO"
                                      checked={newKeyForm.scopes.writeOrders}
                                      onChange={(e) =>
                                        setNewKeyForm({
                                          ...newKeyForm,
                                          scopes: { ...newKeyForm.scopes, writeOrders: e.target.checked },
                                        })
                                      }
                                    />
                                    <Label className="form-check-label" for="scopeWO">
                                      Write:Orders
                                    </Label>
                                  </div>
                                </Col>
                              </Row>
                            </Col>
                            <Col md="3" className="d-flex align-items-end mb-3">
                              <Button type="button" color="success" onClick={generateApiKey} className="w-100">
                                Generate Token
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </TabPane>
                    </TabContent>

                    {/* Common Save Buttons for the settings */}
                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                      <Button type="button" color="secondary" outline>
                        Reset Local Tab Changes
                      </Button>
                      <Button type="submit" color="primary">
                        Save System Settings
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

export default SystemSettings;
