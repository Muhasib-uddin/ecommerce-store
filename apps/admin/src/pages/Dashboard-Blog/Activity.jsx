import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  Badge,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { activityBlogData } from "../../common/data";
import { getRealLiveActivities } from "../../helpers/real_backend_helper";

const TYPE_COLORS = {
  PAGE_VIEW: "secondary",
  PRODUCT_VIEW: "info",
  SEARCH: "warning",
  ADD_TO_CART: "primary",
  PURCHASE: "success",
  LOGIN: "primary",
  REGISTRATION: "success",
};

const Activity = () => {
  const [liveActivities, setLiveActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRealLiveActivities(6)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveActivities(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load real activities for widget, using fallback:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatTimeAgo = (isoString) => {
    if (!isoString) return "";
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <React.Fragment>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-start">
              <div className="me-2">
                <h5 className="card-title mb-4">Customer Activity</h5>
              </div>
              <UncontrolledDropdown className="ms-auto">
                <DropdownToggle className="text-muted font-size-16" tag="a" color="white" type="button">
                  <i className="mdi mdi-dots-horizontal"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end" direction="right">
                  <Link className="dropdown-item" to="/activity/feed">All Activities</Link>
                  <Link className="dropdown-item" to="/activity/funnel">Conversion Funnel</Link>
                  <Link className="dropdown-item" to="/activity/searches">Search Analytics</Link>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            <SimpleBar className="mt-2" style={{ maxHeight: "310px" }}>
              {liveActivities.length > 0 ? (
                <ul className="verti-timeline list-unstyled">
                  {liveActivities.map((event, index) => (
                    <li className={`event-list ${index === 0 ? "active" : ""}`} key={event.id || index}>
                      <div className="event-timeline-dot">
                        <i
                          className={`bx ${
                            index === 0 ? "bxs" : "bx"
                          }-right-arrow-circle font-size-18 ${index === 0 && "bx-fade-right"} text-primary`}
                        ></i>
                      </div>
                      <div className="d-flex">
                        <div className="flex-shrink-0 me-2" style={{ minWidth: 60 }}>
                          <span className="font-size-12 text-muted">
                            {formatTimeAgo(event.createdAt)}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <div>
                            <Badge
                              color={TYPE_COLORS[event.type] || "secondary"}
                              className="font-size-10 me-1"
                            >
                              {event.type.replace(/_/g, " ")}
                            </Badge>
                            <span className="font-size-12 text-dark">
                              {event.user
                                ? event.user.firstName || event.user.email
                                : event.sessionId
                                ? "Guest"
                                : "Visitor"}
                            </span>
                            {event.product && (
                              <small className="text-muted d-block text-truncate" style={{ maxWidth: 180 }}>
                                {event.product.name}
                              </small>
                            )}
                            {event.searchQuery && (
                              <small className="text-muted d-block fst-italic">
                                "{event.searchQuery}"
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="verti-timeline list-unstyled">
                  {(activityBlogData || []).map((event, index) => (
                    <li className={`event-list ${event.active ? "active" : ""}`} key={index}>
                      <div className="event-timeline-dot">
                        <i
                          className={`bx ${
                            event.active ? "bxs" : "bx"
                          }-right-arrow-circle font-size-18 ${event.active && "bx-fade-right"}`}
                        ></i>
                      </div>
                      <div className="d-flex">
                        <div className="flex-shrink-0 me-3">
                          <h5 className="font-size-14">
                            {event.date}{" "}
                            <i className="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"></i>
                          </h5>
                        </div>
                        <div className="flex-grow-1">
                          <div>
                            {event.title} <span className="fw-semibold"> {event.boldText}</span>{" "}
                            {event.text} {event.link && <Link to={event.link}>{event.linkText}</Link>}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SimpleBar>

            <div className="text-center mt-4">
              <Link to="/activity/feed" className="btn btn-primary btn-sm">
                View Full Activity Feed <i className="mdi mdi-arrow-right ms-1"></i>
              </Link>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default Activity;
