/**
 * Formats a date in a standard format
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = "en-US") => {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    console.error("Invalid date:", date);
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Formats a date with time
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, locale = "en-US") => {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    console.error("Invalid date:", date);
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "";
  }
};

/**
 * Get relative time (e.g., "2 days ago", "just now")
 * @param {Date|string|number} date - The date to get relative time for
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, locale = "en-US") => {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    console.error("Invalid date:", date);
    return "";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // For anything older, use the date formatter
  return formatDate(dateObj, locale);
};

export default formatDate;
