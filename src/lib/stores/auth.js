import { writable } from 'svelte/store';
import { auth } from '$lib/firebase';
import { signOut } from 'firebase/auth';
import { goto } from '$app/navigation';

export const authUser = writable(null);
export const authLoading = writable(true);

// Exported so pages (e.g. login) can reuse this exact logic instead of
// duplicating it — avoids two competing syncs racing against each other.
export async function syncSession(firebaseUser) {
	if (!firebaseUser) {
		authUser.set(null);
		authLoading.set(false);
		try { await fetch('/api/auth/session', { method: 'DELETE' }); } catch {}
		if (typeof window !== 'undefined') localStorage.removeItem('rentora_user');
		return null;
	}
	try {
		const token = await firebaseUser.getIdToken();
		// Set server-side session cookie
		const sessionRes = await fetch('/api/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token })
		});
		if (!sessionRes.ok) {
			throw new Error('Could not establish server session.');
		}
		// Fetch user profile
		const res = await fetch('/api/auth/profile', {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (res.ok) {
			const data = await res.json();
			const user = { id: firebaseUser.uid, ...data.user };
			authUser.set(user);
			if (typeof window !== 'undefined') {
				localStorage.setItem('rentora_user', JSON.stringify(user));
			}
			return user;
		} else {
			authUser.set(null);
			if (typeof window !== 'undefined') localStorage.removeItem('rentora_user');
			return null;
		}
	} catch (err) {
		console.error('Session sync error:', err);
		authUser.set(null);
		return null;
	} finally {
		authLoading.set(false);
	}
}

export function initAuth() {
	if (typeof window === 'undefined') return;
	auth.onAuthStateChanged((firebaseUser) => {
		authLoading.set(true);
		syncSession(firebaseUser);
	});
	// Refresh session token every 55 minutes to prevent expiry
	setInterval(async () => {
		if (auth.currentUser) {
			try {
				const token = await auth.currentUser.getIdToken(true);
				await fetch('/api/auth/session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token })
				});
			} catch {}
		}
	}, 55 * 60 * 1000);
}

export async function logout() {
	try {
		await signOut(auth);
		await fetch('/api/auth/session', { method: 'DELETE' });
	} catch {}
	authUser.set(null);
	authLoading.set(false);
	if (typeof window !== 'undefined') localStorage.removeItem('rentora_user');
	goto('/');
}
