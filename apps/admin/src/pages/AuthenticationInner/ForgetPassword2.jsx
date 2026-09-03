import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row, Button, Form, Label, Input, FormFeedback } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import CarouselPage from "./CarouselPage";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const ForgetPassword2 = () => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Forget Password");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
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
                        <h5 className="text-primary">Reset Password</h5>
                        <p className="text-muted">Reset password for {storeName || "Admin"}.
                        </p>
                      </div>

                      <div className="mt-4">

                        <div className="alert alert-success text-center mb-4" role="alert">
                          Enter your Email and instructions will be sent to you!
                        </div>

                        <Form className="form-horizontal"
                          onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                          }}
                        >
                          <div className="mb-3">
                            <Label className="form-label">Email</Label>
                            <Input
                              name="email"
                              className="form-control"
                              placeholder="Enter email"
                              type="email"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.email || ""}
                              invalid={
                                validation.touched.email && validation.errors.email ? true : false
                              }
                            />
                            {validation.touched.email && validation.errors.email ? (
                              <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                            ) : null}
                          </div>
                          <div className="mt-3 text-end">
                            <Button
                              className="btn btn-primary w-md waves-effect waves-light"
                              type="submit"
                            >
                              Reset
                            </Button>
                          </div>

                        </Form>
                        <div className="mt-5 text-center">
                          <p>
                            Remember It ?{" "}
                            <Link
                              to="/login"
                              className="fw-medium text-primary"
                            >
                              {" "}
                              Sign In here{" "}
                            </Link>{" "}
                          </p>
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

export default ForgetPassword2;
