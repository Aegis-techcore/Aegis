// Shared display format for the customer portal, agreements and admin dashboard.
export function formatDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
