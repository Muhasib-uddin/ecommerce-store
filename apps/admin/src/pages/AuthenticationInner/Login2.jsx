import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Form, Row, Input, Label, FormFeedback } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import CarouselPage from "./CarouselPage";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const Login2 = () => {
  const [passwordShow, setPasswordShow] = useState(false);
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Login");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Please Enter Your Username"),
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
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p className="text-muted">
                          Sign in to continue to {storeName || "Admin"}.
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
                          <div className="mb-3">
                            <Label className="form-label">Username</Label>
                            <Input
                              name="username"
                              className="form-control"
                              placeholder="Enter username"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.username || ""}
                              invalid={
                                validation.touched.username && validation.errors.username ? true : false
                              }
                            />
                            {validation.touched.username && validation.errors.username ? (
                              <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <div className="float-end">
                              <Link to="/auth-recoverpw-2" className="text-muted">Forgot password?</Link>
                            </div>
                            <Label className="form-label">Password</Label>
                            <div className="input-group auth-pass-inputgroup">
                              <Input
                                name="password"
                                value={validation.values.password || ""}
                                type={passwordShow ? "text" : "password"}
                                placeholder="Enter password"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.password && validation.errors.password ? true : false
                                }
                              />
                              <button onClick={() => setPasswordShow(!passwordShow)} className="btn btn-light " type="button" id="password-addon">
                                <i className="mdi mdi-eye-outline"></i></button>
                            </div>
                            {validation.touched.password && validation.errors.password ? (
                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="form-check">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="auth-remember-check"
                            />
                            <label className="form-check-label" htmlFor="auth-remember-check">Remember me</label>
                          </div>

                          <div className="mt-3 d-grid">
                            <button
                              className="btn btn-primary btn-block "
                              type="submit"
                            >
                              Log In
                            </button>
                          </div>

                        </Form>

                        <div className="mt-4 text-center">
                          <h5 className="font-size-14 mb-3">Sign in with</h5>

                          <ul className="list-inline">
                            <li className="list-inline-item">
                              <Link
                                to="#"
                                className="social-list-item bg-primary text-white border-primary"
                              >
                                <i className="mdi mdi-facebook" />
                              </Link>
                            </li>{" "}
                            <li className="list-inline-item">
                              <Link
                                to="#"
                                className="social-list-item bg-info text-white border-info"
                              >
                                <i className="mdi mdi-twitter" />
                              </Link>
                            </li>{" "}
                            <li className="list-inline-item">
                              <Link
                                to="#"
                                className="social-list-item bg-danger text-white border-danger"
                              >
                                <i className="mdi mdi-google" />
                              </Link>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-5 text-center">
                          <p>
                            Don&apos;t have an account ?{" "}
                            <Link
                              to="/auth-register-2"
                              className="fw-medium text-primary"
                            >
                              {" "}
                              Signup now{" "}
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
export default Login2;
