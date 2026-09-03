import React from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Container, Row, Col, CardBody, Card, Button, Form, Label, Input, FormFeedback } from "reactstrap";
import profileImg from "../../assets/images/profile-img.png";
import avatar from "../../assets/images/users/avatar-1.jpg";
import { Link } from "react-router-dom";
import { useBranding } from "../../context/BrandingContext";
import BrandLogo from "../../components/Common/BrandLogo";

const LockScreen = () => {
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
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md="8" lg="6" xl="5">
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs="7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Lock screen</h5>
                        <p>Enter your password to unlock the screen!</p>
                      </div>
                    </Col>
                    <Col xs="5" className="align-self-end">
                      <img src={profileImg} alt="" className="img-fluid" />
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
                    <Form className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="user-thumb text-center mb-4">
                        <img
                          src={avatar}
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
                          placeholder="Enter password"
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
                        <Col xs="12" className="text-end">
                          <Button
                            color="primary"
                            className=" w-md "
                            type="submit"
                          >
                            Unlock
                          </Button>
                        </Col>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
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
                <p>
                  © {(new Date().getFullYear())} {storeName || "Store"}. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Muhasib Uddin
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default LockScreen;
