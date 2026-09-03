import React from "react";
import { Navigate } from "react-router-dom";

const Authmiddleware = (props) => {
  const authUser = localStorage.getItem("authUser");

  if (!authUser) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }

  // Basic validation - check if stored data is valid JSON with required fields
  try {
    const user = JSON.parse(authUser);
    if (!user || !user.email) {
      localStorage.removeItem("authUser");
      return (
        <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
      );
    }
  } catch (e) {
    localStorage.removeItem("authUser");
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }

  return <React.Fragment>{props.children}</React.Fragment>;
};

export default Authmiddleware;
