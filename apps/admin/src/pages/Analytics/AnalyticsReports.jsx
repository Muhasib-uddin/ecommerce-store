import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const AnalyticsReports = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [dateRange, setDateRange] = useState("30");

  const handleExport = (format) => {
    setSuccessMsg(`Preparing report download. Exporting analytics as ${format.toUpperCase()}...`);
    setTimeout(() => {
      setSuccessMsg(`Success! ${format.toUpperCase()} report has been downloaded.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1500);
  };

  // Metrics Data
  const metrics = [
    { title: "Total Revenue", value: "$145,280.50", change: "+12.5%", isPositive: true, icon: "bx-dollar-circle" },
    { title: "Total Orders", value: "3,842", change: "+8.3%", isPositive: true, icon: "bx-shopping-bag" },
    { title: "Avg. Order Value", value: "$78.20", change: "-2.1%", isPositive: false, icon: "bx-calculator" },
    { title: "Conversion Rate", value: "3.42%", change: "+0.8%", isPositive: true, icon: "bx-analyse" },
  ];

  // 1. Revenue Trend Area Chart
  const revenueChartSeries = [
    {
      name: "Gross Sales ($)",
      data: [31000, 40000, 28000, 51000, 42000, 109000, 100000, 120000, 110000, 138000, 130000, 145280],
    },
    {
      name: "Discounts Given ($)",
      data: [1100, 3200, 4500, 3200, 3400, 5200, 4100, 6500, 7800, 8100, 6800, 9200],
    },
  ];

  const revenueChartOptions = {
    chart: {
      height: 350,
      type: "area",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#556ee6", "#f46a6a"],
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
    },
    grid: { borderColor: "#f1f1f1" },
    tooltip: { x: { format: "dd/MM/yy HH:mm" } },
  };

  // 2. Top Categories Donut Chart
  const categoryChartSeries = [44, 55, 13, 33];
  const categoryChartOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Footwear", "Apparel", "Electronics", "Accessories"],
    colors: ["#556ee6", "#34c38f", "#f1b44c", "#50a5f1"],
    legend: { position: "bottom" },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  // 3. Funnel Chart (Horizontal Bar representation of conversion steps)
  const funnelChartSeries = [
    {
      name: "Users",
      data: [100000, 45000, 15000, 3842],
    },
  ];
  const funnelChartOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: "55%",
        distributed: true,
      },
    },
    colors: ["#50a5f1", "#f1b44c", "#34c38f", "#556ee6"],
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        const labels = ["Views", "Added to Cart", "Initiated Checkout", "Purchased & Paid"];
        return labels[opt.dataPointIndex] + ": " + val.toLocaleString();
      },
      style: {
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: ["Views", "Cart", "Checkout", "Paid"],
    },
    legend: { show: false },
  };

  // Top Products Data
  const topProducts = [
    { id: 1, name: "UltraBoost Run Shoes v2", category: "Footwear", sales: 1240, revenue: "$44,640", stock: 85 },
    { id: 2, name: "Noise-Cancelling Wireless Pro", category: "Electronics", sales: 980, revenue: "$57,820", stock: 12 },
    { id: 3, name: "Luxury Leather Handbag", category: "Accessories", sales: 420, revenue: "$36,960", stock: 45 },
    { id: 4, name: "Suede Winter Coat Premium", category: "Apparel", sales: 310, revenue: "$55,800", stock: 2 },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Reports" breadcrumbItem="Analytics Dashboard" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          {/* Controls bar */}
          <Row className="mb-4 align-items-center">
            <Col md="6">
              <p className="text-muted mb-0">Overview of your online store metrics, sales conversions, and customer funnel analysis.</p>
            </Col>
            <Col md="6" className="text-md-end mt-2 mt-md-0">
              <div className="d-inline-flex gap-2">
                <Input
                  type="select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ width: "180px" }}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">This Year</option>
                </Input>
                <Button color="light" onClick={() => handleExport("csv")}>
                  <i className="bx bx-download me-1"></i> CSV
                </Button>
                <Button color="primary" onClick={() => handleExport("pdf")}>
                  <i className="bx bxs-file-pdf me-1"></i> PDF Report
                </Button>
              </div>
            </Col>
          </Row>

          {/* Metric Cards Row */}
          <Row>
            {metrics.map((metric, idx) => (
              <Col md="3" key={idx} className="mb-4">
                <Card className="mini-stats-wid h-100">
                  <CardBody>
                    <div className="d-flex">
                      <div className="flex-grow-1">
                        <p className="text-muted fw-medium">{metric.title}</p>
                        <h4 className="mb-0">{metric.value}</h4>
                      </div>
                      <div className="avatar-sm align-self-center mini-stat-icon rounded-circle bg-primary bg-soft">
                        <span className="avatar-title rounded-circle bg-primary-subtle">
                          <i className={`bx ${metric.icon} font-size-24 text-primary`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`badge ${metric.isPositive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} me-1`}>
                        {metric.change}
                      </span>
                      <span className="text-muted font-size-12">vs last period</span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Main Charts */}
          <Row>
            {/* Area Chart - Revenue Trend */}
            <Col lg="8" className="mb-4">
              <Card className="h-100">
                <CardBody>
                  <CardTitle className="mb-4">Revenue & Discounts Trend</CardTitle>
                  <ReactApexChart
                    options={revenueChartOptions}
                    series={revenueChartSeries}
                    type="area"
                    height={350}
                    className="apex-charts"
                  />
                </CardBody>
              </Card>
            </Col>

            {/* Donut Chart - Category Sales */}
            <Col lg="4" className="mb-4">
              <Card className="h-100">
                <CardBody>
                  <CardTitle className="mb-4">Sales by Category</CardTitle>
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "350px" }}>
                    <ReactApexChart
                      options={categoryChartOptions}
                      series={categoryChartSeries}
                      type="donut"
                      height={280}
                      className="apex-charts"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Conversion Funnel & Top Selling Products */}
          <Row>
            {/* Conversion Funnel */}
            <Col lg="5" className="mb-4">
              <Card className="h-100">
                <CardBody>
                  <CardTitle className="mb-4">Customer Acquisition & Checkout Funnel</CardTitle>
                  <ReactApexChart
                    options={funnelChartOptions}
                    series={funnelChartSeries}
                    type="bar"
                    height={280}
                    className="apex-charts"
                  />
                  <div className="mt-3 text-center text-muted font-size-12">
                    Conversion Rate from landing views to completed paid order is <strong className="text-primary">3.8%</strong>.
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Top Products Table */}
            <Col lg="7" className="mb-4">
              <Card className="h-100">
                <CardBody>
                  <CardTitle className="mb-4">Top Performing Products</CardTitle>
                  <div className="table-responsive">
                    <Table className="table align-middle table-nowrap mb-0 table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Product Title</th>
                          <th>Category</th>
                          <th>Units Sold</th>
                          <th>Revenue Generated</th>
                          <th>Stock Left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <span className="fw-medium text-dark">{p.name}</span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">{p.category}</span>
                            </td>
                            <td>{p.sales.toLocaleString()}</td>
                            <td className="fw-semibold text-primary">{p.revenue}</td>
                            <td>
                              {p.stock <= 5 ? (
                                <span className="text-danger fw-bold">{p.stock} (Low Stock)</span>
                              ) : (
                                <span>{p.stock} units</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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

export default AnalyticsReports;
