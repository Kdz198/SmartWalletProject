/**
 * Formats a number as a currency string
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: 'USD')
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount,
  currencyCode = "USD",
  locale = "en-US"
) => {
  // Handle undefined or null values
  if (amount === undefined || amount === null) {
    return "-";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return amount.toFixed(2);
  }
};

/**
 * Formats a number as a percentage string
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1, locale = "en-US") => {
  if (value === undefined || value === null) {
    return "-";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return `${value.toFixed(decimals)}%`;
  }
};

/**
 * Adds a plus sign to positive numbers and formats as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: 'USD')
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted currency string with sign
 */
export const formatCurrencyWithSign = (
  amount,
  currencyCode = "USD",
  locale = "en-US"
) => {
  if (amount === undefined || amount === null) {
    return "-";
  }

  const formatted = formatCurrency(Math.abs(amount), currencyCode, locale);
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
};

export default formatCurrency;
