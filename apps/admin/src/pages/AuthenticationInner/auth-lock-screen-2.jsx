import React from "react";
import PropTypes from 'prop-types';
import { Col, Container, Row, Alert, Form, Label, Input, FormFeedback } from "reactstrap";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import user from "../../assets/images/users/avatar-1.jpg";
import CarouselPage from "./CarouselPage";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const LockScreen2 = (props) => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Lock Screen");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: '',
    },
    validationSchema: Yup.object({
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
    }
  });

  return (
    <React.Fragment>
      <div>
        <Container fluid className="p-0">
          <Row className="g-0">
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
                      <div>
                        <h5 className="text-primary">Lock screen</h5>
                        <p className="text-muted">
                          Enter your password to unlock the screen!
                        </p>
                      </div>

                      <div className="mt-4">
                        <Form className="form-horizontal"
                          onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                          }}
                        >
                          {props.error && props.error ? (
                            <Alert color="danger">{props.error}</Alert>
                          ) : null}

                          <div className="user-thumb text-center mb-4">
                            <img
                              src={user}
                              className="rounded-circle img-thumbnail avatar-md"
                              alt="thumbnail"
                            />
                            <h5 className="font-size-15 mt-3">Admin User</h5>
                          </div>

                          <div className="mb-3">
                            <Label className="form-label">Password</Label>
                            <Input
                              name="password"
                              className="form-control"
                              placeholder="Enter Password"
                              type="password"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.password || ""}
                              invalid={
                                validation.touched.password && validation.errors.password ? true : false
                              }
                            />
                            {validation.touched.password && validation.errors.password ? (
                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="text-end">
                            <button className="btn btn-primary w-md" type="submit" > Unlock </button>
                          </div>
                        </Form>
                        <div className="mt-5 text-center">
                          <p>
                            Not you ? return{" "}
                            <Link
                              to="/login"
                              className="fw-medium text-primary"
                            >
                              {" "}
                              Sign In{" "}
                            </Link>{" "}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        ©{" "}
                        {new Date().getFullYear()}{" "}
                        {storeName || "Store"}. Crafted with{" "}
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

LockScreen2.propTypes = {
  error: PropTypes.any,
};

export default LockScreen2;
