import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";
import { realResetPassword } from "../../helpers/real_backend_helper";
import profile from "../../assets/images/profile-img.png";

const ResetPassword = () => {
  const { storeName, formatTitle } = useBranding();
  document.title = formatTitle("Reset Password");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validation = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Must contain a lowercase letter")
        .matches(/[A-Z]/, "Must contain an uppercase letter")
        .matches(/[0-9]/, "Must contain a number")
        .required("Please enter a new password"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Please confirm your new password"),
    }),
    onSubmit: async (values) => {
      setErrorMessage("");
      setSuccessMessage("");
      if (!token) {
        setErrorMessage("Missing reset token. Please request a new link.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await realResetPassword({
          token,
          newPassword: values.newPassword,
        });
        setSuccessMessage(
          response.message || "Your password has been successfully reset. Redirecting to login..."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to reset password. The link may have expired.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="bx bx-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs={7}>
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Create New Password</h5>
                        <p>Set a secure password for {storeName || "Admin"}.</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div className="auth-logo d-flex justify-content-center pt-3 pb-2">
                    <Link to="/">
                      <BrandLogo size="auth" />
                    </Link>
                  </div>
                  <div className="p-2">
                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                    {successMessage && <Alert color="success">{successMessage}</Alert>}

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">New Password</Label>
                        <Input
                          name="newPassword"
                          type="password"
                          className="form-control"
                          placeholder="Enter new password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.newPassword || ""}
                          invalid={
                            validation.touched.newPassword && validation.errors.newPassword
                              ? true
                              : false
                          }
                        />
                        {validation.touched.newPassword && validation.errors.newPassword ? (
                          <FormFeedback type="invalid">
                            {validation.errors.newPassword}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Confirm New Password</Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          className="form-control"
                          placeholder="Confirm new password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword || ""}
                          invalid={
                            validation.touched.confirmPassword &&
                            validation.errors.confirmPassword
                              ? true
                              : false
                          }
                        />
                        {validation.touched.confirmPassword &&
                        validation.errors.confirmPassword ? (
                          <FormFeedback type="invalid">
                            {validation.errors.confirmPassword}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Remember your password?{" "}
                  <Link to="/login" className="fw-medium text-primary">
                    Login
                  </Link>
                </p>
                <p>
                  © {new Date().getFullYear()} {storeName || "Store"}.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ResetPassword;
