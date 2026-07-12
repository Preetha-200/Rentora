/**
 * Formats a number as Indian Rupees, matching the ₹X,XXX pattern already
 * used across the homepage and property pages (Indian digit grouping).
 * @param {number|string} amount
 * @param {{ withSuffix?: boolean }} [options] - append "/month" style suffix
 */
export function formatCurrency(amount, options = {}) {
	const value = Number(amount || 0);
	const formatted = `₹${value.toLocaleString('en-IN')}`;
	return options.withSuffix ? `${formatted}${options.withSuffix}` : formatted;
}

/**
 * Formats an ISO date string / Date into a short, readable date
 * (e.g. "12 Jul 2026"), matching the locale style already used in the app.
 * @param {string|Date} date
 */
export function formatDate(date) {
	if (!date) return '—';

	const parsed = date instanceof Date ? date : new Date(date);

	if (Number.isNaN(parsed.getTime())) return '—';

	return parsed.toLocaleDateString('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/**
 * Formats an ISO date string / Date into a date + time string.
 * @param {string|Date} date
 */
export function formatDateTime(date) {
	if (!date) return '—';

	const parsed = date instanceof Date ? date : new Date(date);

	if (Number.isNaN(parsed.getTime())) return '—';

	return parsed.toLocaleString('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

/**
 * Returns an ISO timestamp string, matching the format already written by
 * every server endpoint (new Date().toISOString()).
 */
export function generateTimestamp() {
	return new Date().toISOString();
}

/**
 * Maps a status string (property approval, rental request, maintenance,
 * payment, etc.) to a Tailwind background+text color pair. Centralizes the
 * status→color logic that was previously duplicated across owner/properties,
 * admin/approvals, tenant/requests, and tenant/payments.
 * @param {string} status
 * @returns {string} Tailwind utility classes
 */
export function getStatusColor(status) {
	switch (status) {
		case 'Approved':
		case 'Active':
		case 'Paid':
		case 'Resolved':
		case 'Available':
			return 'bg-green-100 text-green-700';

		case 'Rejected':
		case 'Disabled':
			return 'bg-red-100 text-red-700';

		case 'Pending':
		case 'Checking':
			return 'bg-amber-100 text-amber-700';

		case 'Rented':
			return 'bg-slate-200 text-slate-700';

		default:
			return 'bg-gray-100 text-gray-600';
	}
}
