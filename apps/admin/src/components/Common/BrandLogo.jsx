import React, { useState } from "react";
import PropTypes from "prop-types";
import { useBranding } from "../../context/BrandingContext";

export const BrandLogo = ({
  variant = "dark",
  size = "lg",
  className = "",
  showTextWithLogo = false,
}) => {
  const { storeName, lightLogo, darkLogo } = useBranding();
  const [imageError, setImageError] = useState(false);

  // Pick logo based on variant
  // In dark backgrounds (e.g. dark sidebar), we prefer light logo
  // In light backgrounds, we prefer dark logo
  const logoUrl =
    variant === "light"
      ? lightLogo || darkLogo
      : darkLogo || lightLogo;

  const initials = (storeName || "Store")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleImgError = () => {
    setImageError(true);
  };

  if (size === "sm") {
    if (logoUrl && !imageError) {
      return (
        <span className={`d-inline-flex align-items-center justify-content-center ${className}`}>
          <img
            src={logoUrl}
            alt={storeName}
            height="22"
            style={{ maxHeight: "24px", maxWidth: "34px", objectFit: "contain" }}
            onError={handleImgError}
          />
        </span>
      );
    }

    return (
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-circle fw-bold ${className}`}
        style={{
          width: "30px",
          height: "30px",
          fontSize: "13px",
          background: variant === "light" ? "rgba(255,255,255,0.15)" : "#556ee6",
          color: "#ffffff",
          letterSpacing: "0.5px",
        }}
      >
        {initials}
      </span>
    );
  }

  if (size === "auth") {
    if (logoUrl && !imageError) {
      return (
        <div className={`d-inline-flex flex-column align-items-center justify-content-center ${className}`}>
          <img
            src={logoUrl}
            alt={storeName}
            style={{ maxHeight: "44px", maxWidth: "160px", objectFit: "contain" }}
            onError={handleImgError}
          />
        </div>
      );
    }

    return (
      <div className={`d-inline-flex align-items-center gap-2 ${className}`}>
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white shadow-sm"
          style={{
            width: "38px",
            height: "38px",
            fontSize: "15px",
            background: "linear-gradient(135deg, #556ee6 0%, #3b50c4 100%)",
          }}
        >
          {initials}
        </span>
        <span
          className="fw-bold fs-5 text-uppercase"
          style={{
            letterSpacing: "1.5px",
            color: variant === "light" ? "#ffffff" : "#2a3042",
          }}
        >
          {storeName || "STORE"}
        </span>
      </div>
    );
  }

  // Default size: "lg" (used in Sidebars, Headers)
  if (logoUrl && !imageError) {
    return (
      <span className={`d-inline-flex align-items-center gap-2 ${className}`}>
        <img
          src={logoUrl}
          alt={storeName}
          height="24"
          style={{ maxHeight: "28px", maxWidth: "140px", objectFit: "contain" }}
          onError={handleImgError}
        />
        {showTextWithLogo && (
          <span
            className="fw-bold text-uppercase"
            style={{
              fontSize: "14px",
              letterSpacing: "1px",
              color: variant === "light" ? "#ffffff" : "#2a3042",
            }}
          >
            {storeName}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`d-inline-flex align-items-center gap-2 ${className}`}>
      <span
        className="d-inline-flex align-items-center justify-content-center rounded fw-bold text-white"
        style={{
          width: "26px",
          height: "26px",
          fontSize: "12px",
          background: "linear-gradient(135deg, #556ee6 0%, #3b50c4 100%)",
        }}
      >
        {initials}
      </span>
      <span
        className="fw-bold text-uppercase"
        style={{
          fontSize: "15px",
          letterSpacing: "1.2px",
          color: variant === "light" ? "#ffffff" : "#2a3042",
        }}
      >
        {storeName || "STORE"}
      </span>
    </span>
  );
};

BrandLogo.propTypes = {
  variant: PropTypes.oneOf(["light", "dark", "auto"]),
  size: PropTypes.oneOf(["sm", "lg", "auth"]),
  className: PropTypes.string,
  showTextWithLogo: PropTypes.bool,
};

export default BrandLogo;
