import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Card, CardBody, CardTitle, Progress } from "reactstrap";
import { Link } from "react-router-dom";

const SocialSource = ({ paymentMethods, stats }) => {
  const totalOrders = stats?.totalOrders || 1;

  const methods = [
    {
      title: "Credit Card (Stripe)",
      count: paymentMethods?.STRIPE || 0,
      iconClass: "bx bx-credit-card",
      color: "primary",
    },
    {
      title: "PayPal",
      count: paymentMethods?.PAYPAL || 0,
      iconClass: "mdi mdi-paypal",
      color: "info",
    },
    {
      title: "Cash on Delivery",
      count: paymentMethods?.COD || 0,
      iconClass: "mdi mdi-cash-multiple",
      color: "success",
    },
    {
      title: "Bank Transfer",
      count: paymentMethods?.BANK_TRANSFER || 0,
      iconClass: "mdi mdi-bank",
      color: "warning",
    },
  ];

  const topMethod = [...methods].sort((a, b) => b.count - a.count)[0];
  const topPercentage = Math.round((topMethod.count / totalOrders) * 100) || 0;

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle className="mb-4">Payment Methods</CardTitle>
          <div className="text-center">
            <div className="avatar-sm mx-auto mb-3">
              <span className={`avatar-title rounded-circle bg-${topMethod.color}-subtle font-size-24`}>
                <i className={`${topMethod.iconClass} text-${topMethod.color}`}></i>
              </span>
            </div>
            <h5 className="mb-1">
              {topMethod.title}
            </h5>
            <p className="text-muted font-size-13 mb-3">
              Top Payment Method • <span className="fw-semibold text-dark">{topMethod.count} orders ({topPercentage}%)</span>
            </p>
          </div>

          <div className="mt-3">
            {methods.map((method, idx) => {
              const pct = Math.round((method.count / totalOrders) * 100) || 0;
              return (
                <div key={idx} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="font-size-13 text-muted">
                      <i className={`${method.iconClass} me-1 text-${method.color}`}></i>
                      {method.title}
                    </span>
                    <span className="font-size-13 fw-medium">
                      {method.count} ({pct}%)
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    color={method.color}
                    className="progress-sm"
                  />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

SocialSource.propTypes = {
  paymentMethods: PropTypes.object,
  stats: PropTypes.object,
};

export default SocialSource;

