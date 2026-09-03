import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Card, CardBody, CardTitle, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import ApexRadial from "./ApexRadial";
import { useCurrency } from "../../helpers/currency_helper";

const MonthlyEarning = ({ stats, ordersByStatus }) => {
  const { formatCurrency } = useCurrency();
  const thisMonthRevenue = stats?.thisMonthRevenue ?? 0;
  const thisMonthOrders = stats?.thisMonthOrders ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const deliveredOrders = ordersByStatus?.DELIVERED ?? 0;
  const processingOrders = ordersByStatus?.PROCESSING ?? 0;
  const pendingOrders = ordersByStatus?.PENDING ?? 0;

  // Fulfillment rate (% of completed/delivered orders out of total)
  const fulfillmentRate = totalOrders > 0
    ? Math.round((deliveredOrders / totalOrders) * 100)
    : 100;

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle className="mb-4">Monthly Overview</CardTitle>
          <Row>
            <Col sm="6">
              <p className="text-muted mb-1">This Month Revenue</p>
              <h4 className="mb-2">
                {formatCurrency(thisMonthRevenue)}
              </h4>
              <p className="text-muted font-size-13 mb-3">
                <span className="text-success me-1 font-weight-medium">
                  {thisMonthOrders}
                </span>{" "}
                orders placed this month
              </p>
              <div>
                <Link
                  to="/ecommerce-orders"
                  className="btn btn-primary waves-effect waves-light btn-sm"
                >
                  View All Orders <i className="mdi mdi-arrow-right ms-1"></i>
                </Link>
              </div>
            </Col>
            <Col sm="6">
              <div className="mt-4 mt-sm-0">
                <ApexRadial
                  dataColors='["--bs-success"]'
                  value={fulfillmentRate}
                  label="Delivered"
                />
              </div>
            </Col>
          </Row>

          <hr className="my-3" />

          <div className="d-flex justify-content-between text-center pt-1">
            <div>
              <p className="text-muted mb-1 font-size-12">Delivered</p>
              <Badge color="success" className="font-size-12 px-2">
                {deliveredOrders}
              </Badge>
            </div>
            <div>
              <p className="text-muted mb-1 font-size-12">Processing</p>
              <Badge color="warning" className="font-size-12 px-2">
                {processingOrders}
              </Badge>
            </div>
            <div>
              <p className="text-muted mb-1 font-size-12">Pending</p>
              <Badge color="info" className="font-size-12 px-2">
                {pendingOrders}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

MonthlyEarning.propTypes = {
  stats: PropTypes.object,
  ordersByStatus: PropTypes.object,
};

export default MonthlyEarning;

