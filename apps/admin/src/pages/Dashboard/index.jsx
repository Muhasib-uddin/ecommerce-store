import PropTypes from "prop-types";
import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";

// Components
import StackedColumnChart from "./StackedColumnChart";
import WelcomeComp from "./WelcomeComp";
import MonthlyEarning from "./MonthlyEarning";
import SocialSource from "./SocialSource";
import ActivityComp from "./ActivityComp";
import TopCities from "./TopCities";
import LatestTranactions from "./LatestTranaction";
import Breadcrumbs from "../../components/Common/Breadcrumb";

// API
import { getDashboardStats } from "../../helpers/real_backend_helper";
import { useCurrency } from "../../helpers/currency_helper";

// i18n
import { withTranslation } from "react-i18next";

const Dashboard = (props) => {
  const { formatCurrency, symbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      thisMonthRevenue: 0,
      thisMonthOrders: 0,
    },
    ordersByStatus: {},
    paymentMethods: {},
    monthlySales: [],
    topProducts: [],
    recentActivity: [],
    recentOrders: [],
  });

  const [periodType, setPeriodType] = useState("Year");

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        if (isMounted && res) {
          setDashboardData({
            stats: res.stats || {},
            ordersByStatus: res.ordersByStatus || {},
            paymentMethods: res.paymentMethods || {},
            monthlySales: res.monthlySales || [],
            topProducts: res.topProducts || [],
            recentActivity: res.recentActivity || [],
            recentOrders: res.recentOrders || [],
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = dashboardData.stats;

  const reports = [
    {
      title: "Total Revenue",
      iconClass: "bx-dollar-circle",
      colorClass: "primary",
      description: stats.totalRevenue
        ? formatCurrency(stats.totalRevenue)
        : formatCurrency(0),
      badge: stats.thisMonthOrders > 0 ? `${stats.thisMonthOrders} this mo.` : null,
    },
    {
      title: "Total Orders",
      iconClass: "bx-shopping-bag",
      colorClass: "success",
      description: stats.totalOrders ? stats.totalOrders.toLocaleString() : "0",
      badge: `${dashboardData.ordersByStatus?.PENDING || 0} pending`,
    },
    {
      title: "Avg. Order Value",
      iconClass: "bx-purchase-tag-alt",
      colorClass: "info",
      description: stats.averageOrderValue
        ? formatCurrency(stats.averageOrderValue)
        : formatCurrency(0),
      badge: null,
    },
    {
      title: "Active Customers",
      iconClass: "bx-user-check",
      colorClass: "warning",
      description: stats.totalCustomers
        ? stats.totalCustomers.toLocaleString()
        : "0",
      badge: stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : null,
    },
  ];

  // Prepare chart series from monthly sales
  const chartSeries = useMemo(() => {
    const months = dashboardData.monthlySales || [];
    if (months.length === 0) {
      return [
        { name: "Revenue ($)", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: "Orders", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      ];
    }

    if (periodType === "Month") {
      const currentMonthIndex = new Date().getMonth();
      const curr = months[currentMonthIndex] || { revenue: 0, orders: 0 };
      return [
        { name: "Revenue ($)", data: [curr.revenue] },
        { name: "Orders", data: [curr.orders] },
      ];
    }

    return [
      {
        name: "Revenue ($)",
        data: months.map((m) => Math.round(m.revenue)),
      },
      {
        name: "Orders",
        data: months.map((m) => m.orders),
      },
    ];
  }, [dashboardData.monthlySales, periodType]);

  // Set document title
  document.title = "Dashboard | Store Admin Dashboard";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Breadcrumb */}
          <Breadcrumbs
            title={props.t("Dashboards")}
            breadcrumbItem={props.t("Dashboard")}
          />

          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading live dashboard metrics...</p>
            </div>
          ) : (
            <>
              <Row>
                <Col xl="4">
                  <WelcomeComp stats={dashboardData.stats} />
                  <MonthlyEarning
                    stats={dashboardData.stats}
                    ordersByStatus={dashboardData.ordersByStatus}
                  />
                </Col>

                <Col xl="8">
                  {/* KPI Mini Stats Cards */}
                  <Row>
                    {reports.map((report, key) => (
                      <Col md="6" lg="3" key={"_kpi_" + key}>
                        <Card className="mini-stats-wid">
                          <CardBody>
                            <div className="d-flex">
                              <div className="flex-grow-1">
                                <p className="text-muted fw-medium font-size-13 mb-1">
                                  {report.title}
                                </p>
                                <h4 className="mb-1 font-size-18">{report.description}</h4>
                                {report.badge && (
                                  <span className="badge bg-light text-muted font-size-11">
                                    {report.badge}
                                  </span>
                                )}
                              </div>
                              <div className={`avatar-sm rounded-circle bg-${report.colorClass}-subtle align-self-center mini-stat-icon`}>
                                <span className={`avatar-title rounded-circle bg-${report.colorClass}-subtle text-${report.colorClass}`}>
                                  <i className={"bx " + report.iconClass + " font-size-22"}></i>
                                </span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Sales & Revenue Analytics Chart */}
                  <Card>
                    <CardBody>
                      <div className="d-sm-flex flex-wrap align-items-center mb-4">
                        <h4 className="card-title mb-0">Sales & Revenue Overview</h4>
                        <div className="ms-auto">
                          <ul className="nav nav-pills">
                            <li className="nav-item">
                              <Link
                                to="#"
                                className={classNames(
                                  { active: periodType === "Year" },
                                  "nav-link py-1 px-3 font-size-13"
                                )}
                                onClick={() => setPeriodType("Year")}
                              >
                                Year
                              </Link>
                            </li>
                            <li className="nav-item">
                              <Link
                                to="#"
                                className={classNames(
                                  { active: periodType === "Month" },
                                  "nav-link py-1 px-3 font-size-13"
                                )}
                                onClick={() => setPeriodType("Month")}
                              >
                                This Month
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <StackedColumnChart
                        periodData={chartSeries}
                        dataColors='["--bs-primary", "--bs-success"]'
                      />
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Middle Row: Payment Methods, Store Activity, Top Products */}
              <Row>
                <Col xl="4">
                  <SocialSource
                    paymentMethods={dashboardData.paymentMethods}
                    stats={dashboardData.stats}
                  />
                </Col>
                <Col xl="4">
                  <ActivityComp recentActivity={dashboardData.recentActivity} />
                </Col>
                <Col xl="4">
                  <TopCities topProducts={dashboardData.topProducts} />
                </Col>
              </Row>

              {/* Bottom Row: Recent Orders Table */}
              <Row>
                <Col lg="12">
                  <LatestTranactions recentOrders={dashboardData.recentOrders} />
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(Dashboard);

