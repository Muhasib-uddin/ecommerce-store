import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import profileImg from "../../assets/images/profile-img.png";

const WelcomeComp = ({ stats }) => {
  let userName = "Admin User";
  let userRole = "SUPER ADMIN";

  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const parsed = JSON.parse(authUser);
      if (parsed.firstName || parsed.lastName) {
        userName = `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim();
      } else if (parsed.email) {
        userName = parsed.email.split("@")[0];
      }
      if (parsed.role) {
        userRole = parsed.role.replace(/_/g, " ");
      }
    }
  } catch (e) {
    // Ignore JSON error
  }

  const totalProducts = stats?.totalProducts ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;

  return (
    <React.Fragment>
      <Card className="overflow-hidden">
        <div className="bg-primary-subtle">
          <Row>
            <Col xs="7">
              <div className="text-primary p-3">
                <h5 className="text-primary">Welcome Back!</h5>
                <p className="text-muted mb-0">Store Management Console</p>
              </div>
            </Col>
            <Col xs="5" className="align-self-end">
              <img src={profileImg} alt="" className="img-fluid" />
            </Col>
          </Row>
        </div>
        <CardBody className="pt-0">
          <Row>
            <Col sm="5">
              <div className="avatar-md profile-user-wid mb-4">
                <img
                  src={avatar1}
                  alt="Admin Avatar"
                  className="img-thumbnail rounded-circle"
                />
              </div>
              <h5 className="font-size-15 text-truncate mb-1">{userName}</h5>
              <span className="badge bg-primary-subtle text-primary font-size-11">
                {userRole}
              </span>
            </Col>

            <Col sm="7">
              <div className="pt-4">
                <Row>
                  <Col xs="6">
                    <h5 className="font-size-15 mb-0">{totalProducts}</h5>
                    <p className="text-muted mb-0 font-size-12">Products</p>
                  </Col>
                  <Col xs="6">
                    <h5 className="font-size-15 mb-0">{totalCustomers}</h5>
                    <p className="text-muted mb-0 font-size-12">Customers</p>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Link
                    to="/settings/system"
                    className="btn btn-primary btn-sm waves-effect waves-light"
                  >
                    Store Settings <i className="mdi mdi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

WelcomeComp.propTypes = {
  stats: PropTypes.object,
};

export default WelcomeComp;

