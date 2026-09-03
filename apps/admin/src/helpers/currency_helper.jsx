import React, { useState, useEffect } from "react";
import { getRealSettings } from "./real_backend_helper";

export const CURRENCIES = {
  PKR: { code: "PKR", symbol: "Rs. ", name: "Pakistani Rupee", label: "PKR (Rs.) Pakistani Rupee" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", label: "USD ($) US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", label: "EUR (€) Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", label: "GBP (£) British Pound" },
  CAD: { code: "CAD", symbol: "CA$ ", name: "Canadian Dollar", label: "CAD (CA$) Canadian Dollar" },
  AUD: { code: "AUD", symbol: "AU$ ", name: "Australian Dollar", label: "AUD (AU$) Australian Dollar" },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham", label: "AED (د.إ) UAE Dirham" },
  SAR: { code: "SAR", symbol: "SAR ", name: "Saudi Riyal", label: "SAR (﷼) Saudi Riyal" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", label: "INR (₹) Indian Rupee" },
};

export const DEFAULT_CURRENCY = "PKR";

/**
 * Get active currency code from localStorage or default
 */
export const getActiveCurrencyCode = () => {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return localStorage.getItem("store_currency") || DEFAULT_CURRENCY;
};

/**
 * Set active currency code in localStorage and dispatch event for reactive UI updates
 */
export const setActiveCurrencyCode = (currencyCode) => {
  const code = CURRENCIES[currencyCode] ? currencyCode : DEFAULT_CURRENCY;
  localStorage.setItem("store_currency", code);
  window.dispatchEvent(new CustomEvent("store_currency_change", { detail: code }));
  return code;
};

/**
 * Get currency metadata object for a currency code
 */
export const getCurrencyDetails = (currencyCode) => {
  const code = currencyCode || getActiveCurrencyCode();
  return CURRENCIES[code] || CURRENCIES.PKR;
};

/**
 * Format an amount with currency symbol and proper number formatting
 * e.g. formatCurrency(5000, "PKR") -> "Rs. 5,000.00"
 *      formatCurrency(129.99, "USD") -> "$129.99"
 */
export const formatCurrency = (amount, customCurrencyCode = null) => {
  const num = Number(amount || 0);
  const currency = getCurrencyDetails(customCurrencyCode);
  const formattedNumber = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol}${formattedNumber}`;
};

/**
 * React Hook for reactive currency across all components
 */
export const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState(() => getActiveCurrencyCode());

  useEffect(() => {
    // Initial fetch from backend settings if not already synchronized
    const syncFromSettings = async () => {
      try {
        const data = await getRealSettings();
        if (data?.storeSettings?.currency) {
          const remoteCurrency = data.storeSettings.currency;
          if (CURRENCIES[remoteCurrency] && remoteCurrency !== getActiveCurrencyCode()) {
            setActiveCurrencyCode(remoteCurrency);
            setCurrencyCode(remoteCurrency);
          }
        }
      } catch (err) {
        // Fallback to local storage
      }
    };
    syncFromSettings();

    const handleCurrencyChange = (e) => {
      setCurrencyCode(e.detail || getActiveCurrencyCode());
    };

    window.addEventListener("store_currency_change", handleCurrencyChange);
    return () => {
      window.removeEventListener("store_currency_change", handleCurrencyChange);
    };
  }, []);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.PKR;

  const format = (amount) => formatCurrency(amount, currencyCode);

  return {
    currencyCode,
    currency,
    symbol: currency.symbol,
    formatCurrency: format,
    setCurrency: setActiveCurrencyCode,
  };
};
