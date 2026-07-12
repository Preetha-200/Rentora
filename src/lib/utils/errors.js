/**
 * Normalizes a caught error (from the `api` client, a raw fetch, or
 * anything else) into a user-facing message string. Centralizes the
 * `err.message || 'fallback'` pattern that was repeated in the catch block
 * of nearly every page's data-loading function.
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function handleApiError(err, fallback = 'Something went wrong. Please try again.') {
	if (err instanceof Error && err.message) {
		return err.message;
	}

	if (typeof err === 'string' && err.trim()) {
		return err;
	}

	return fallback;
}
