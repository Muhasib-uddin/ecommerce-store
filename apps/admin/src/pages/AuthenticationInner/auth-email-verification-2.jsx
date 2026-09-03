import React from "react";
import CarouselPage from "./CarouselPage";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const EmailVerification2 = () => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Email Verification");

  return (
    <React.Fragment>
      <div>
        <Container fluid className="p-0">
          <Row className="g-0">
            <CarouselPage />

            <Col cl={3}>
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
                            <i className="bx bxs-envelope h1 mb-0 text-primary"></i>
                          </div>
                        </div>
                        <div className="p-2 mt-4">
                          <h4>Verify your email</h4>
                          <p>
                            We have sent you verification email{" "}
                            <span className="fw-semibold">
                              example@abc.com
                            </span>
                            , Please check it
                          </p>
                          <div className="mt-4">
                            <a
                              href="/"
                              className="btn btn-success w-md"
                            >
                              Verify email
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()} {storeName || "Store"}. Crafted with{" "}
                        <i className="mdi mdi-heart text-danger"></i> by Muhasib Uddin
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

export default EmailVerification2;
