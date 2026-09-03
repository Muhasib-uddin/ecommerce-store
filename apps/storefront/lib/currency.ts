export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  label: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
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

export const getCurrencyDetails = (currencyCode?: string | null): CurrencyConfig => {
  const code = currencyCode || (typeof window !== "undefined" ? localStorage.getItem("store_currency") : null) || DEFAULT_CURRENCY;
  return CURRENCIES[code] || CURRENCIES.PKR;
};

export const formatPrice = (amount: number | string | null | undefined, currencyCode?: string | null): string => {
  const num = Number(amount || 0);
  const currency = getCurrencyDetails(currencyCode);
  const formattedNumber = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol}${formattedNumber}`;
};
