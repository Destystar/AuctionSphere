export function formatPrice(amount, currencyCode = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}
