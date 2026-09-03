import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const ConfirmMail = () => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Confirm Mail");

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mb-5 text-muted">
                <Link to="/" className="d-inline-block auth-logo">
                  <BrandLogo size="auth" />
                </Link>
                <p className="mt-3">Store Administration & Dashboard</p>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card>
                <CardBody>
                  <div className="p-2">
                    <div className="text-center">
                      <div className="avatar-md mx-auto">
                        <div className="avatar-title rounded-circle bg-light">
                          <i className="bx bx-mail-send h1 mb-0 text-primary"></i>
                        </div>
                      </div>
                      <div className="p-2 mt-4">
                        <h4>Success !</h4>
                        <p className="text-muted">
                          Your email verification has been initiated. Please check
                          your inbox for further instructions.
                        </p>
                        <div className="mt-4">
                          <Link to="/dashboard" className="btn btn-success">
                            Back to Home
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  © {new Date().getFullYear()} {storeName || "Store"}. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger"></i> by Muhasib Uddin
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ConfirmMail;
