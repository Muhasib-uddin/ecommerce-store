import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import withRouter from "../Common/withRouter";

import { withTranslation } from "react-i18next";
import SidebarContent from "./SidebarContent";
import { Link } from "react-router-dom";
import BrandLogo from "../Common/BrandLogo";

const Sidebar = (props) => {
  return (
    <React.Fragment>
      <div className="vertical-menu">
        <div className="navbar-brand-box">
          <Link to="/" className="logo logo-dark">
            <span className="logo-sm">
              <BrandLogo variant="dark" size="sm" />
            </span>
            <span className="logo-lg">
              <BrandLogo variant="dark" size="lg" />
            </span>
          </Link>

          <Link to="/" className="logo logo-light">
            <span className="logo-sm">
              <BrandLogo variant="light" size="sm" />
            </span>
            <span className="logo-lg">
              <BrandLogo variant="light" size="lg" />
            </span>
          </Link>
        </div>
        <div data-simplebar className="h-100">
          {props.type !== "condensed" ? <SidebarContent /> : <SidebarContent />}
        </div>

        <div className="sidebar-background"></div>
      </div>
    </React.Fragment>
  );
};

Sidebar.propTypes = {
  type: PropTypes.string,
};

const mapStatetoProps = (state) => {
  return {
    layout: state.Layout,
  };
};
export default connect(
  mapStatetoProps,
  {}
)(withRouter(withTranslation()(Sidebar)));
