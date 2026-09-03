import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardTitle, Badge, Table } from "reactstrap";
import { Link } from "react-router-dom";
import { useCurrency } from "../../helpers/currency_helper";

const TopCities = ({ topProducts }) => {
  const { formatCurrency } = useCurrency();
  const products = (topProducts && topProducts.length > 0)
    ? topProducts
    : [];

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CardTitle className="mb-0">Top Products</CardTitle>
            <Link to="/ecommerce-products" className="font-size-12 text-primary">
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <Table className="table align-middle table-nowrap mb-0">
              <tbody>
                {products.length > 0 ? (
                  products.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ width: "45px" }}>
                        <div className="avatar-xs">
                          <span className="avatar-title rounded bg-light text-primary font-size-14">
                            <i className="bx bx-package"></i>
                          </span>
                        </div>
                      </td>
                      <td>
                        <h5 className="font-size-13 mb-0 text-truncate" style={{ maxWidth: "160px" }}>
                          {item.name}
                        </h5>
                        <p className="text-muted mb-0 font-size-11">
                          {item.category}
                        </p>
                      </td>
                      <td className="text-end">
                        <h5 className="font-size-13 mb-0">
                          {formatCurrency(item.price)}
                        </h5>
                        <span className="font-size-11 text-muted">
                          Stock:{" "}
                          <span className={item.stock <= 5 ? "text-danger fw-bold" : "text-success"}>
                            {item.stock}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-3">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="text-center mt-3 pt-2">
            <Link
              to="/ecommerce-add-product"
              className="btn btn-outline-primary btn-sm waves-effect"
            >
              <i className="mdi mdi-plus me-1" /> Add New Product
            </Link>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

TopCities.propTypes = {
  topProducts: PropTypes.array,
};

export default TopCities;

