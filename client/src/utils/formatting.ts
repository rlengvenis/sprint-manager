/**
 * Formats a date to a localized string
 */
export const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Returns the appropriate Tailwind color class based on delta value
 * @param delta - The delta value (actual - forecast)
 * @returns Tailwind text color class
 */
export const getDeltaColor = (delta: number): string => {
  if (delta > 0) {
    return 'text-green-600'; // Over-delivered
  } else if (delta < 0) {
    return 'text-red-600'; // Under-delivered
  } else {
    return 'text-gray-600'; // Exactly on target
  }
};

/**
 * Formats a delta value with sign prefix
 * @param delta - The delta value to format
 * @returns Formatted string with sign and 2 decimal places
 */
export const formatDelta = (delta: number): string => {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}`;
};

