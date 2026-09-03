import React from "react";
import { Container, Row, Col } from "reactstrap";
import { useBranding } from "../../context/BrandingContext";

const Footer = () => {
  const { storeName } = useBranding();

  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid={true}>
          <Row>
            <Col md={6}>{new Date().getFullYear()} © {storeName || "Store"}.</Col>
            <Col md={6}>
              <div className="text-sm-end d-none d-sm-block">
                Design & Develop by Muhasib Uddin
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
