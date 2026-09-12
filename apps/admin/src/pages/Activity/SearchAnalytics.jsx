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
  Badge,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getRealTopSearches } from "../../helpers/real_backend_helper";

const SearchAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRealTopSearches(timeRange, 50);
      setSearches(data || []);
    } catch (err) {
      console.warn("Failed to load search analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const totalSearches = searches.reduce((sum, s) => sum + (s.count || 0), 0);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Activity" breadcrumbItem="Search Analytics" />

          {/* Controls */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
            <div>
              <h4 className="mb-1">Customer Search Analytics</h4>
              <p className="text-muted mb-0">
                Understand what products and keywords customers are searching for across the store.
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
              </ButtonGroup>
              <Button color="light" size="sm" onClick={fetchSearches} title="Refresh">
                <i className="bx bx-refresh"></i>
              </Button>
            </div>
          </div>

          {/* Metric Summary */}
          <Row>
            <Col md={4}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Total Search Queries</p>
                      <h4 className="mb-0">{totalSearches.toLocaleString()}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-warning align-self-center">
                      <span className="avatar-title bg-warning">
                        <i className="bx bx-search font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Unique Keywords</p>
                      <h4 className="mb-0">{searches.length}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                      <span className="avatar-title bg-primary">
                        <i className="bx bx-tag font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-1">Top Keyword</p>
                      <h4 className="mb-0 text-truncate" style={{ maxWidth: 200 }}>
                        {searches[0]?.query ? `"${searches[0].query}"` : "None"}
                      </h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-success align-self-center">
                      <span className="avatar-title bg-success">
                        <i className="bx bx-trophy font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Search Terms Table */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-3">Top Search Queries</CardTitle>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="mt-2 text-muted">Aggregating search terms...</p>
                    </div>
                  ) : searches.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bx bx-search-alt font-size-36 d-block mb-2 text-muted"></i>
                      No customer search queries recorded in this time range.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-centered table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 80 }}>Rank</th>
                            <th>Search Query Term</th>
                            <th className="text-center">Query Count</th>
                            <th className="text-center">Share of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searches.map((item, idx) => {
                            const share =
                              totalSearches > 0
                                ? ((item.count / totalSearches) * 100).toFixed(1)
                                : "0.0";
                            return (
                              <tr key={item.query || idx}>
                                <td>
                                  <Badge
                                    color={idx < 3 ? "warning" : "light"}
                                    className={`font-size-12 px-2 ${idx >= 3 ? "text-muted" : ""}`}
                                  >
                                    #{idx + 1}
                                  </Badge>
                                </td>
                                <td>
                                  <span className="fw-semibold font-size-14 text-dark">
                                    "{item.query}"
                                  </span>
                                </td>
                                <td className="text-center font-size-14 fw-bold">
                                  {item.count.toLocaleString()}
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-light text-primary font-size-12">
                                    {share}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SearchAnalytics;
