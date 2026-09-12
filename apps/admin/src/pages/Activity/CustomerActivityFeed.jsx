import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import {
  getRealActivities,
  getRealActivityStats,
  getRealCustomerJourney,
} from "../../helpers/real_backend_helper";

const ACTIVITY_TYPE_BADGES = {
  PAGE_VIEW: "secondary",
  PRODUCT_VIEW: "info",
  SEARCH: "warning",
  ADD_TO_CART: "primary",
  REMOVE_FROM_CART: "dark",
  UPDATE_CART: "dark",
  INITIATE_CHECKOUT: "info",
  PURCHASE: "success",
  REGISTRATION: "success",
  LOGIN: "primary",
  LOGOUT: "secondary",
  REVIEW_SUBMITTED: "info",
  COUPON_APPLIED: "warning",
  COUPON_REMOVED: "secondary",
  WISHLIST_ADD: "danger",
  WISHLIST_REMOVE: "secondary",
};

const CustomerActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Modals
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [journeyUser, setJourneyUser] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loadingJourney, setLoadingJourney] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (selectedType) params.type = selectedType;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await getRealActivities(params);
      if (res?.activities) {
        setActivities(res.activities);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.warn("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedType, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getRealActivityStats("30d");
      if (data) setStats(data);
    } catch (err) {
      console.warn("Failed to load activity stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [fetchActivities, fetchStats]);

  // Auto-refresh interval (every 10s)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchActivities();
    }, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchActivities]);

  const handleViewJourney = async (userId) => {
    if (!userId) return;
    setLoadingJourney(true);
    try {
      const res = await getRealCustomerJourney(userId, 50);
      setJourneyData(res);
      setJourneyUser(res?.user || { id: userId });
    } catch (err) {
      console.error("Failed to load customer journey:", err);
    } finally {
      setLoadingJourney(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Activity" breadcrumbItem="Customer Activity Feed" />

          {/* Metric Summary Cards */}
          <Row>
            <Col xl={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Total Activities (30d)</p>
                      <h4 className="mb-0">{stats?.totalActivities?.toLocaleString() || "0"}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                      <span className="avatar-title bg-primary">
                        <i className="bx bx-pulse font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Active Users</p>
                      <h4 className="mb-0">{stats?.uniqueUsersCount?.toLocaleString() || "0"}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-success align-self-center">
                      <span className="avatar-title bg-success">
                        <i className="bx bx-user-check font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Guest Sessions</p>
                      <h4 className="mb-0">{stats?.uniqueSessionsCount?.toLocaleString() || "0"}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-info align-self-center">
                      <span className="avatar-title bg-info">
                        <i className="bx bx-globe font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Purchases Tracked</p>
                      <h4 className="mb-0">
                        {stats?.countsByType?.PURCHASE?.toLocaleString() || "0"}
                      </h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-warning align-self-center">
                      <span className="avatar-title bg-warning">
                        <i className="bx bx-shopping-bag font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Activity Feed Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                    <CardTitle className="h4 mb-0">Live Activity Feed</CardTitle>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        size="sm"
                        color={autoRefresh ? "success" : "light"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                      >
                        <i
                          className={`bx bx-refresh me-1 ${autoRefresh ? "bx-spin" : ""}`}
                        ></i>
                        {autoRefresh ? "Live (10s)" : "Paused"}
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => {
                          setLoading(true);
                          fetchActivities();
                        }}
                      >
                        Refresh Now
                      </Button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <Row className="mb-3">
                    <Col md={4} sm={12} className="mb-2 mb-md-0">
                      <Input
                        type="text"
                        placeholder="Search by email, query, or product..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </Col>
                    <Col md={3} sm={6} className="mb-2 mb-md-0">
                      <Input
                        type="select"
                        value={selectedType}
                        onChange={(e) => {
                          setSelectedType(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Activity Types</option>
                        <option value="PAGE_VIEW">Page Views</option>
                        <option value="PRODUCT_VIEW">Product Views</option>
                        <option value="SEARCH">Searches</option>
                        <option value="ADD_TO_CART">Add to Cart</option>
                        <option value="REMOVE_FROM_CART">Remove from Cart</option>
                        <option value="UPDATE_CART">Update Cart</option>
                        <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
                        <option value="PURCHASE">Purchases</option>
                        <option value="LOGIN">Logins</option>
                        <option value="LOGOUT">Logouts</option>
                        <option value="REGISTRATION">Registrations</option>
                        <option value="REVIEW_SUBMITTED">Reviews</option>
                      </Input>
                    </Col>
                    <Col md={5} sm={6} className="text-md-end">
                      <span className="text-muted font-size-13 me-2">
                        Showing {activities.length} of {totalCount} events
                      </span>
                    </Col>
                  </Row>

                  {/* Table */}
                  <div className="table-responsive">
                    <Table className="table-centered table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Timestamp</th>
                          <th>Event Type</th>
                          <th>Customer / Session</th>
                          <th>Target / Action</th>
                          <th>IP & User Agent</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && activities.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-5">
                              <Spinner color="primary" />
                              <p className="mt-2 text-muted">Loading activities...</p>
                            </td>
                          </tr>
                        ) : activities.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-5 text-muted">
                              <i className="bx bx-pulse font-size-24 d-block mb-2"></i>
                              No customer activities found for the selected criteria.
                            </td>
                          </tr>
                        ) : (
                          activities.map((act) => (
                            <tr key={act.id}>
                              <td style={{ whiteSpace: "nowrap" }} className="font-size-13 text-muted">
                                {formatDate(act.createdAt)}
                              </td>
                              <td>
                                <Badge
                                  color={ACTIVITY_TYPE_BADGES[act.type] || "secondary"}
                                  className="font-size-11 px-2 py-1"
                                >
                                  {act.type.replace(/_/g, " ")}
                                </Badge>
                              </td>
                              <td>
                                {act.user ? (
                                  <div>
                                    <span className="fw-semibold d-block text-dark font-size-13">
                                      {act.user.firstName || act.user.lastName
                                        ? `${act.user.firstName || ""} ${act.user.lastName || ""}`
                                        : act.user.email}
                                    </span>
                                    <small className="text-muted">{act.user.email}</small>
                                  </div>
                                ) : act.sessionId ? (
                                  <div>
                                    <span className="badge bg-light text-secondary font-size-11">
                                      Guest
                                    </span>
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: 140 }}>
                                      {act.sessionId}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="text-muted font-size-12">Anonymous</span>
                                )}
                              </td>
                              <td>
                                {act.product && (
                                  <div>
                                    <i className="bx bx-package me-1 text-primary"></i>
                                    <span className="fw-medium font-size-13">{act.product.name}</span>
                                  </div>
                                )}
                                {act.searchQuery && (
                                  <div>
                                    <i className="bx bx-search me-1 text-warning"></i>
                                    <span className="fst-italic font-size-13">"{act.searchQuery}"</span>
                                  </div>
                                )}
                                {act.type === "PAGE_VIEW" && act.metadata?.page && (
                                  <span className="text-muted font-size-13">
                                    Page: {act.metadata.page}
                                  </span>
                                )}
                                {act.type === "PURCHASE" && act.metadata?.orderNumber && (
                                  <span className="fw-bold text-success font-size-13">
                                    Order #{act.metadata.orderNumber} ($
                                    {Number(act.metadata.total || 0).toFixed(2)})
                                  </span>
                                )}
                                {!act.product && !act.searchQuery && !act.metadata?.page && !act.metadata?.orderNumber && (
                                  <span className="text-muted font-size-12">-</span>
                                )}
                              </td>
                              <td>
                                <small className="text-muted d-block">{act.ipAddress || "-"}</small>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => setSelectedActivity(act)}
                                    title="View Raw Event Data"
                                  >
                                    <i className="bx bx-info-circle"></i>
                                  </Button>
                                  {act.userId && (
                                    <Button
                                      color="primary"
                                      size="sm"
                                      onClick={() => handleViewJourney(act.userId)}
                                      title="View Customer Journey"
                                    >
                                      <i className="bx bx-history"></i> Journey
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-3">
                    <PaginationControls
                      currentPage={currentPage}
                      pageSize={pageSize}
                      totalItems={totalCount}
                      onPageChange={(p) => setCurrentPage(p)}
                      onPageSizeChange={(s) => {
                        setPageSize(s);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Activity Details Modal */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        toggle={() => setSelectedActivity(null)}
        size="lg"
      >
        <ModalHeader toggle={() => setSelectedActivity(null)}>
          Event Details: {selectedActivity?.type}
        </ModalHeader>
        <ModalBody>
          {selectedActivity && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1 text-muted">Activity ID</p>
                  <code>{selectedActivity.id}</code>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">Created At</p>
                  <strong>{formatDate(selectedActivity.createdAt)}</strong>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1 text-muted">User</p>
                  <strong>
                    {selectedActivity.user?.email || selectedActivity.userId || "Guest"}
                  </strong>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">Session ID</p>
                  <code>{selectedActivity.sessionId || "None"}</code>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1 text-muted">IP Address</p>
                  <span>{selectedActivity.ipAddress || "Unknown"}</span>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">User Agent</p>
                  <small className="text-muted d-block text-break">
                    {selectedActivity.userAgent || "Unknown"}
                  </small>
                </Col>
              </Row>
              <div className="mt-3">
                <p className="mb-1 text-muted fw-semibold">Metadata JSON</p>
                <pre className="bg-light p-3 rounded font-size-12" style={{ maxHeight: 200, overflowY: "auto" }}>
                  {JSON.stringify(selectedActivity.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSelectedActivity(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Customer Journey Modal */}
      <Modal
        isOpen={Boolean(journeyUser)}
        toggle={() => setJourneyUser(null)}
        size="lg"
      >
        <ModalHeader toggle={() => setJourneyUser(null)}>
          Customer Journey: {journeyUser?.email || journeyUser?.id}
        </ModalHeader>
        <ModalBody>
          {loadingJourney ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading customer timeline...</p>
            </div>
          ) : (
            <div>
              <p className="text-muted mb-3 font-size-13">
                Showing recent {journeyData?.timeline?.length || 0} customer actions in reverse chronological order.
              </p>
              <div className="timeline-journey" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <ul className="verti-timeline list-unstyled ps-3">
                  {(journeyData?.timeline || []).map((step, idx) => (
                    <li key={step.id || idx} className="event-list pb-3 position-relative">
                      <div className="d-flex align-items-start">
                        <Badge
                          color={ACTIVITY_TYPE_BADGES[step.type] || "secondary"}
                          className="me-3 font-size-11"
                        >
                          {step.type.replace(/_/g, " ")}
                        </Badge>
                        <div className="flex-grow-1">
                          <small className="text-muted float-end">
                            {formatDate(step.createdAt)}
                          </small>
                          <div className="fw-medium font-size-13">
                            {step.product?.name && `Viewed Product: ${step.product.name}`}
                            {step.searchQuery && `Searched: "${step.searchQuery}"`}
                            {step.type === "ADD_TO_CART" && "Added item to shopping cart"}
                            {step.type === "INITIATE_CHECKOUT" && "Initiated checkout funnel"}
                            {step.type === "PURCHASE" && `Completed purchase order #${step.order?.orderNumber || ""}`}
                            {step.type === "LOGIN" && "Customer logged in"}
                            {step.type === "REGISTRATION" && "Customer created account"}
                            {step.type === "REVIEW_SUBMITTED" && "Submitted product review"}
                          </div>
                          {step.metadata && (
                            <small className="text-muted d-block mt-1">
                              {Object.entries(step.metadata)
                                .slice(0, 3)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </small>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setJourneyUser(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default CustomerActivityFeed;
