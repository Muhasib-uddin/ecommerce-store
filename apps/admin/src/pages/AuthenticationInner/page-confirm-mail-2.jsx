import React from "react";
import CarouselPage from "./CarouselPage";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const ConfirmMail2 = () => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Confirm Mail");

  return (
    <React.Fragment>
      <div>
        <Container fluid className="p-0">
          <Row className="row g-0">
            <CarouselPage />

            <Col xl={3}>
              <div className="auth-full-page-content p-md-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5">
                      <Link to="/" className="d-inline-block auth-logo">
                        <BrandLogo size="auth" />
                      </Link>
                    </div>
                    <div className="my-auto">
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

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()} {storeName || "Store"}. Crafted with{" "}
                        <i className="mdi mdi-heart text-danger"></i> by
                        Muhasib Uddin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ConfirmMail2;
