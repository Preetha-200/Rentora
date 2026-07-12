<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let email = '';
	let password = '';
	let selectedRole = 'tenant';

	let loading = false;
	let error = '';

	let showPassword = false;

	let googleLoading = false;

	function routeForRole(role) {
		if (role === 'admin') return '/admin';
		if (role === 'owner') return '/owner';
		return '/tenant';
	}

	async function handleGoogleSignIn() {
		error = '';
		googleLoading = true;

		try {
			const provider = new GoogleAuthProvider();
			const credential = await signInWithPopup(auth, provider);
			const firebaseUser = credential.user;
			const token = await firebaseUser.getIdToken();

			localStorage.setItem('token', token);
			document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;

			let response;

			try {
				response = await api.auth.getProfile();
			} catch (profileErr) {
				if (profileErr.message !== 'User not found') {
					throw profileErr;
				}
				response = await api.post('/api/auth/register', {
					name: firebaseUser.displayName || 'Rentora User',
					email: firebaseUser.email,
					phone: '',
					role: 'tenant',
					token
				});
			}

			localStorage.setItem('rentora_user', JSON.stringify(response.user));
			window.dispatchEvent(new StorageEvent('storage'));

			goto(routeForRole(response.user.role));
		} catch (err) {
			if (err.code !== 'auth/popup-closed-by-user') {
				error = err.message || 'Google sign-in failed. Please try again.';
			}
		} finally {
			googleLoading = false;
		}
	}

	async function handleLogin(event) {
		event.preventDefault();

		error = '';
		loading = true;

		try {
			const credential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);

			const firebaseUser = credential.user;
			const token = await firebaseUser.getIdToken();

			localStorage.setItem('token', token);
			document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;

			const response = await api.auth.getProfile();

			localStorage.setItem(
				'rentora_user',
				JSON.stringify(response.user)
			);

			window.dispatchEvent(new StorageEvent('storage'));

			if (response.user.role !== selectedRole) {
				error = 'Selected role does not match your account.';
				localStorage.removeItem('token');
				localStorage.removeItem('rentora_user');
				loading = false;
				return;
			}

			goto(routeForRole(response.user.role));
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-rentora-dark px-4">
	<div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
		<div>
			<h2 class="mt-2 text-center text-3xl font-extrabold text-rentora-dark">
				Sign in to Rentora
			</h2>

			<p class="mt-2 text-center text-sm text-gray-500">
				Smart Property Rental Management
			</p>
		</div>

		<form class="mt-8 space-y-6" onsubmit={handleLogin}>
			<div class="rounded-md space-y-4">
				<div>
					<label for="login-role" class="block text-sm font-medium text-gray-700 mb-1">
						Select Role
					</label>

					<select
						id="login-role"
						bind:value={selectedRole}
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">
						<option value="tenant">Tenant</option>
						<option value="owner">Property Owner</option>
						<option value="admin">Platform Admin</option>
					</select>
				</div>

				<div>
					<label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>

					<input
						id="login-email"
						type="email"
						bind:value={email}
						required
						placeholder="name@domain.com"
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />
				</div>

				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="login-password" class="block text-sm font-medium text-gray-700">
							Password
						</label>

						<a href="/forgot-password" class="text-xs font-semibold text-rentora-purple hover:underline">
							Forgot password?
						</a>
					</div>

					<div class="relative">
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							placeholder="••••••••"
							class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />

						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
							onclick={() => (showPassword = !showPassword)}>
							{#if showPassword}
								<input type="checkbox" checked class="w-4 h-4 accent-indigo-900 rounded">
							{:else}
								<input type="checkbox" class="w-4 h-4 rounded">
							{/if}
						</button>
					</div>
				</div>
			</div>

			{#if error}
				<p class="text-red-600 text-sm text-center">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition disabled:opacity-50">
				{loading ? 'Signing In...' : 'Sign In'}
			</button>
		</form>

		<div class="flex items-center gap-3">
			<div class="flex-1 h-px bg-gray-200"></div>
			<span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Or</span>
			<div class="flex-1 h-px bg-gray-200"></div>
		</div>

		<button
			type="button"
			onclick={handleGoogleSignIn}
			disabled={googleLoading}
			class="w-full py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold flex items-center justify-center gap-3 hover:shadow-md transition disabled:opacity-50">
			<svg class="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
				<path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
				<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
				<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
			</svg>
			{googleLoading ? 'Signing In...' : 'Continue with Google'}
		</button>
	</div>
</div>