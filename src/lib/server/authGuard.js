import { error } from '@sveltejs/kit';

/**
 * Guards a server load function / action / endpoint by role. Throws a
 * SvelteKit error (401 if not logged in, 403 if wrong role) so callers can
 * simply call `requireRole(locals, 'admin')` at the top of a load function
 * instead of repeating the same `if (!locals.user) {...}` / role-check block
 * that was duplicated across nearly every protected +server.js file.
 *
 * @param {App.Locals} locals
 * @param {string|string[]} allowedRoles - a single role or list of roles
 * @returns {App.Locals['user']} the authenticated user, for convenience
 */
export function requireRole(locals, allowedRoles) {
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

	if (!roles.includes(locals.user.role)) {
		throw error(403, 'Not authorized for this action');
	}

	return locals.user;
}
