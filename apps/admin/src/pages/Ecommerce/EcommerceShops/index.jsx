import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Col, Container, Row } from "reactstrap"
import { map } from "lodash"

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb"

//Import Card
import CardShop from "./CardShop"
import { getShops as onGetShops } from "/src/store/e-commerce/actions"

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import Spinners from "../../../components/Common/Spinner"
import PaginationControls from "../../../components/Common/PaginationControls"

const EcommerceShops = () => {
  //meta title
  document.title = "Shops | Admin Dashboard";

  const dispatch = useDispatch();

  const EcommerceShopsProperties = createSelector(
    (state) => state.ecommerce,
    (Ecommerce) => ({
      shops: Ecommerce.shops,
      loading: Ecommerce.loading
    })
  );

  const {
    shops, loading
  } = useSelector(EcommerceShopsProperties);

  const [isLoading, setLoading] = useState(loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    dispatch(onGetShops());
  }, [dispatch]);

  const shopList = Array.isArray(shops) ? shops : [];
  const paginatedShops = shopList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Shops" />
          {
            isLoading ? <Spinners setLoading={setLoading} />
              :
              <>
                <Row>
                  {paginatedShops.map((shop, key) => (
                    <CardShop shop={shop} key={"_shop_" + (shop.id || key)} />
                  ))}
                </Row>
                <PaginationControls
                  currentPage={currentPage}
                  totalItems={shopList.length}
                  pageSize={pageSize}
                  pageSizeOptions={[4, 8, 12, 24]}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                />
              </>
          }
        </Container>
      </div>
    </React.Fragment>
  );
};

EcommerceShops.propTypes = {
  shops: PropTypes.array,
  onGetShops: PropTypes.func,
}

export default EcommerceShops;
