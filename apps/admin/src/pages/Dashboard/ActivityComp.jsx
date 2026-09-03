import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardTitle, Badge } from "reactstrap";
import { Link } from "react-router-dom";

const ActivityComp = ({ recentActivity }) => {
  const activities = (recentActivity && recentActivity.length > 0)
    ? recentActivity
    : [
        {
          id: "act-1",
          title: "Store operational",
          subtitle: "All services running normally",
          date: new Date().toISOString(),
        },
      ];

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "PROCESSING":
        return "primary";
      case "CANCELLED":
      case "REFUNDED":
        return "danger";
      default:
        return "warning";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Just now";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CardTitle className="mb-0">Recent Activity</CardTitle>
            <Badge color="light" className="text-muted font-size-11">
              Live Feed
            </Badge>
          </div>

          <ul className="verti-timeline list-unstyled mb-0">
            {activities.map((item, index) => (
              <li className={`event-list ${index === 0 ? "active" : ""}`} key={item.id || index}>
                <div className="event-timeline-dot">
                  <i
                    className={`bx bx-right-arrow-circle font-size-18 ${
                      index === 0 ? "bx-fade-right text-primary" : "text-muted"
                    }`}
                  />
                </div>
                <div className="d-flex">
                  <div className="flex-shrink-0 me-3">
                    <h5 className="font-size-13 text-muted mb-0">
                      {formatDate(item.date)}
                      <i className="bx bx-right-arrow-alt font-size-14 text-primary align-middle ms-1" />
                    </h5>
                  </div>
                  <div className="flex-grow-1">
                    <div className="font-size-13 font-weight-medium text-dark">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <p className="text-muted font-size-12 mb-0">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {item.status && (
                    <div className="flex-shrink-0 ms-2">
                      <Badge color={getStatusColor(item.status)} className="font-size-10">
                        {item.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="text-center mt-4">
            <Link
              to="/ecommerce-orders"
              className="btn btn-primary btn-sm waves-effect waves-light"
            >
              View Order History <i className="mdi mdi-arrow-right ms-1" />
            </Link>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

ActivityComp.propTypes = {
  recentActivity: PropTypes.array,
};

export default ActivityComp;