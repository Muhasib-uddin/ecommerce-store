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
  ButtonGroup,
  Progress,
  Badge,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getRealConversionFunnel,
  getRealActivityStats,
} from "../../helpers/real_backend_helper";

const STAGE_COLORS = {
  Views: "info",
  Cart: "primary",
  Checkout: "warning",
  Purchase: "success",
};

const STAGE_ICONS = {
  Views: "bx-show",
  Cart: "bx-cart",
  Checkout: "bx-credit-card",
  Purchase: "bx-check-circle",
};

const ConversionFunnel = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [funnelData, setFunnelData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [funnel, stats] = await Promise.all([
        getRealConversionFunnel(timeRange),
        getRealActivityStats(timeRange),
      ]);
      setFunnelData(funnel);
      setStatsData(stats);
    } catch (err) {
      console.warn("Failed to load funnel data:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stages = funnelData?.stages || [];
  const overallRate = stages.length > 0 ? stages[stages.length - 1].overallConversion : 0;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Activity" breadcrumbItem="Conversion Funnel" />

          {/* Controls */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
            <div>
              <h4 className="mb-1">eCommerce Conversion Funnel</h4>
              <p className="text-muted mb-0">
                Track how visitors progress through product discovery, cart, checkout, and purchase.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <ButtonGroup size="sm">
                <Button
                  color={timeRange === "24h" ? "primary" : "light"}
                  onClick={() => setTimeRange("24h")}
                >
                  Last 24h
                </Button>
                <Button
                  color={timeRange === "7d" ? "primary" : "light"}
                  onClick={() => setTimeRange("7d")}
                >
                  Last 7d
                </Button>
                <Button
                  color={timeRange === "30d" ? "primary" : "light"}
                  onClick={() => setTimeRange("30d")}
                >
                  Last 30d
                </Button>
                <Button
                  color={timeRange === "all" ? "primary" : "light"}
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </Button>
              </ButtonGroup>
              <Button color="light" size="sm" onClick={fetchData} title="Refresh">
                <i className="bx bx-refresh"></i>
              </Button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <Row>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <p className="text-muted mb-1">Discovery Views</p>
                  <h3 className="mb-0 text-info">
                    {stages[0]?.count?.toLocaleString() || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <p className="text-muted mb-1">Cart Additions</p>
                  <h3 className="mb-0 text-primary">
                    {stages[1]?.count?.toLocaleString() || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <p className="text-muted mb-1">Checkouts Started</p>
                  <h3 className="mb-0 text-warning">
                    {stages[2]?.count?.toLocaleString() || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <p className="text-muted mb-1">End-to-End Conversion</p>
                  <h3 className="mb-0 text-success">{overallRate}%</h3>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Funnel Visualization */}
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-4">Funnel Progression Stages</CardTitle>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="mt-2 text-muted">Calculating funnel drop-offs...</p>
                    </div>
                  ) : stages.length === 0 ? (
                    <p className="text-center text-muted py-5">No funnel data available yet.</p>
                  ) : (
                    <div className="funnel-container py-2">
                      {stages.map((stg, idx) => {
                        const widthPct = Math.max(
                          Math.min(Number(stg.overallConversion || 0), 100),
                          stg.count > 0 ? 12 : 5
                        );
                        return (
                          <div key={stg.stage} className="funnel-step mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="d-flex align-items-center">
                                <span
                                  className={`avatar-xs rounded-circle bg-${STAGE_COLORS[stg.stage] || "primary"} text-white d-inline-flex align-items-center justify-content-center me-2`}
                                >
                                  <i className={`bx ${STAGE_ICONS[stg.stage]} font-size-16`}></i>
                                </span>
                                <span className="fw-semibold font-size-14">{stg.name}</span>
                              </div>
                              <div className="text-end">
                                <strong className="font-size-15 text-dark me-2">
                                  {stg.count.toLocaleString()}
                                </strong>
                                <Badge color="light" className="text-muted font-size-12">
                                  {idx === 0 ? "Top of Funnel" : `${stg.conversionFromPrevious}% from prev`}
                                </Badge>
                              </div>
                            </div>
                            <Progress
                              color={STAGE_COLORS[stg.stage] || "primary"}
                              value={idx === 0 ? 100 : widthPct}
                              style={{ height: "24px", borderRadius: "6px" }}
                            >
                              <span className="font-size-11 fw-semibold text-white px-2">
                                {idx === 0 ? "100%" : `${stg.overallConversion}% of total visitors`}
                              </span>
                            </Progress>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Funnel Insights */}
            <Col lg={4}>
              <Card>
                <CardBody>
                  <CardTitle className="h5 mb-3">Funnel Drop-Off Insights</CardTitle>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>View → Add to Cart</span>
                      <strong className="text-primary font-size-14">
                        {stages[1]?.conversionFromPrevious || 0}%
                      </strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Cart → Checkout</span>
                      <strong className="text-warning font-size-14">
                        {stages[2]?.conversionFromPrevious || 0}%
                      </strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Checkout → Purchase</span>
                      <strong className="text-success font-size-14">
                        {stages[3]?.conversionFromPrevious || 0}%
                      </strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>Cart Abandonment Rate</span>
                      <strong className="text-danger font-size-14">
                        {stages[1]?.count > 0
                          ? Math.max(
                              0,
                              (
                                ((stages[1].count - (stages[3]?.count || 0)) /
                                  stages[1].count) *
                                100
                              ).toFixed(1)
                            )
                          : 0}
                        %
                      </strong>
                    </li>
                  </ul>
                  <div className="alert alert-info mt-3 font-size-12 mb-0">
                    <i className="bx bx-bulb me-1"></i>
                    Tip: If Cart → Checkout is low, consider adding floating cart indicators or free shipping promos.
                  </div>
                </CardBody>
              </Card>

              {/* Top Products */}
              <Card>
                <CardBody>
                  <CardTitle className="h5 mb-3">Top Viewed Products</CardTitle>
                  <Table className="table-sm table-borderless mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-end">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(statsData?.topProducts || []).map((p) => (
                        <tr key={p.id}>
                          <td className="font-size-13 text-truncate" style={{ maxWidth: 160 }}>
                            {p.name}
                          </td>
                          <td className="text-end font-size-13 fw-semibold">
                            {p.viewCount?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                      {(!statsData?.topProducts || statsData.topProducts.length === 0) && (
                        <tr>
                          <td colSpan={2} className="text-center text-muted font-size-12 py-3">
                            No product view data yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ConversionFunnel;
