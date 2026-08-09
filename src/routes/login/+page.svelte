<script>
	import { goto } from '$app/navigation';
	import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { api } from '$lib/api';
	import { syncSession } from '$lib/stores/auth.js';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let googleLoading = $state(false);
	let error = $state('');
	let showPassword = $state(false);

	function routeForRole(role) {
		const routes = { admin: '/admin', owner: '/owner', tenant: '/tenant' };
		return routes[role] || '/';
	}

	// This now reuses the exact same sync logic that the global auth store
	// (src/lib/stores/auth.js) uses, instead of duplicating it. Previously
	// this page ran its own separate session/profile fetch AND the store's
	// onAuthStateChanged listener ran its own — the two raced each other,
	// and the dashboard layouts (which gate on the store's $authUser) would
	// sometimes see a stale/null user and bounce straight back to /login,
	// which looked like "sign-in doesn't redirect."
	async function syncAndRedirect(firebaseUser) {
		const user = await syncSession(firebaseUser);
		if (!user) throw new Error('Could not load user profile.');
		goto(routeForRole(user.role));
	}

	async function handleLogin(event) {
		event.preventDefault();
		error = '';
		loading = true;
		try {
			const credential = await signInWithEmailAndPassword(auth, email, password);
			await syncAndRedirect(credential.user);
		} catch (err) {
			error = err.message?.replace('Firebase: ', '') || 'Login failed. Please check your credentials.';
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		error = '';
		googleLoading = true;
		try {
			const provider = new GoogleAuthProvider();
			const credential = await signInWithPopup(auth, provider);
			const firebaseUser = credential.user;
			const token = await firebaseUser.getIdToken();

			// Try to get existing profile
			const profileRes = await fetch('/api/auth/profile', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (profileRes.ok) {
				// Existing user — sync and redirect
				await syncAndRedirect(firebaseUser);
			} else {
				// New Google user — register them as tenant
				const registerRes = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
					body: JSON.stringify({
						name: firebaseUser.displayName || 'Rentora User',
						email: firebaseUser.email,
						phone: '',
						role: 'tenant',
						token
					})
				});
				if (!registerRes.ok) throw new Error('Failed to create account.');
				await syncAndRedirect(firebaseUser);
			}
		} catch (err) {
			if (err.code !== 'auth/popup-closed-by-user') {
				console.error('Google Sign-In Error:', err);
				error = err.message || 'Google sign-in failed.';
			}
		} finally {
			googleLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In — Rentora</title>
	<meta name="description" content="Sign in to your Rentora account to access your dashboard." />
</svelte:head>

<div class="min-h-screen flex">
	<!-- Left: Branding panel -->
	<div class="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden flex-col justify-between p-12">
		<!-- Decorative orbs -->
		<div class="absolute top-1/4 left-1/4 w-72 h-72 bg-rentora-purple/25 rounded-full blur-3xl animate-float"></div>
		<div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl animate-float" style="animation-delay: 2s"></div>

		<!-- Logo -->
		<div class="relative flex items-center gap-3">
			<div class="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
				<span class="material-symbols-outlined text-white text-2xl filled">apartment</span>
			</div>
			<span class="text-2xl font-black tracking-widest text-white">RENTORA</span>
		</div>

		<!-- Central content -->
		<div class="relative">
			<h2 class="text-5xl font-black text-white leading-tight mb-6">
				Welcome<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
					Back
				</span>
			</h2>
			<p class="text-white/60 text-lg leading-relaxed max-w-sm">
				Access your dashboard to manage properties, rental requests, and maintenance — all in one place.
			</p>

			<!-- Feature pills -->
			<div class="flex flex-wrap gap-3 mt-8">
				{#each ['Verified Listings', 'Smart Maintenance', 'Real-time Alerts', 'Secure Payments'] as feat}
					<span class="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm">
						{feat}
					</span>
				{/each}
			</div>
		</div>

		<!-- Bottom quote -->
		<div class="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
			<p class="text-white/70 italic text-sm leading-relaxed">
				"Rentora made finding and managing my rental property completely effortless. Everything I need in one clean dashboard."
			</p>
			<div class="flex items-center gap-3 mt-4">
				<div class="w-8 h-8 rounded-full bg-rentora-purple flex items-center justify-center text-white text-xs font-bold">P</div>
				<div>
					<div class="text-white text-sm font-semibold">Priya Sharma</div>
					<div class="text-white/50 text-xs">Tenant, Bangalore</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Form panel -->
	<div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
		<div class="w-full max-w-md">
			<!-- Mobile logo -->
			<div class="flex lg:hidden items-center gap-3 mb-10">
				<div class="w-10 h-10 rounded-xl bg-rentora-dark flex items-center justify-center">
					<span class="material-symbols-outlined text-white text-lg filled">apartment</span>
				</div>
				<span class="text-xl font-black tracking-widest text-rentora-dark">RENTORA</span>
			</div>

			<div class="mb-8">
				<h1 class="text-3xl font-black text-rentora-dark">Sign In</h1>
				<p class="text-gray-500 mt-2">New to Rentora? <a href="/register" class="text-rentora-purple font-semibold hover:underline">Create an account</a></p>
			</div>

			<!-- Google Sign-In -->
			<button
				type="button"
				onclick={handleGoogleSignIn}
				disabled={googleLoading}
				class="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-rentora-purple hover:bg-rentora-purplePale transition-all duration-200 disabled:opacity-50 mb-6">
				<svg class="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
					<path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
					<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
					<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
				</svg>
				{googleLoading ? 'Signing in...' : 'Continue with Google'}
			</button>

			<!-- Divider -->
			<div class="flex items-center gap-4 mb-6">
				<div class="flex-1 h-px bg-gray-100"></div>
				<span class="text-xs text-gray-400 font-medium uppercase tracking-wider">or sign in with email</span>
				<div class="flex-1 h-px bg-gray-100"></div>
			</div>

			<!-- Email form -->
			<form onsubmit={handleLogin} class="space-y-5">
				<div>
					<label for="login-email" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">mail</span>
						<input
							id="login-email"
							type="email"
							bind:value={email}
							required
							placeholder="name@domain.com"
							class="input-field pl-11" />
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between mb-2">
						<label for="login-password" class="block text-sm font-semibold text-gray-700">Password</label>
						<a href="/forgot-password" class="text-xs font-semibold text-rentora-purple hover:underline">Forgot password?</a>
					</div>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">lock</span>
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							placeholder="••••••••"
							class="input-field pl-11 pr-12" />
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rentora-purple transition-colors"
							aria-label={showPassword ? 'Hide password' : 'Show password'}>
							<span class="material-symbols-outlined text-xl">
								{showPassword ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				{#if error}
					<div class="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4">
						<span class="material-symbols-outlined text-red-500 text-xl shrink-0 mt-0.5">error</span>
						<p class="text-red-700 text-sm leading-relaxed">{error}</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full py-4 rounded-xl bg-rentora-dark text-white font-bold text-base hover:bg-rentora-blue transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
					{#if loading}
						<div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
						Signing In...
					{:else}
						<span class="material-symbols-outlined text-xl">login</span>
						Sign In
					{/if}
				</button>
			</form>

			<p class="text-center text-sm text-gray-400 mt-8">
				By signing in, you agree to our
				<a href="/" class="text-rentora-purple hover:underline">Terms of Service</a>
				and
				<a href="/" class="text-rentora-purple hover:underline">Privacy Policy</a>.
			</p>
		</div>
	</div>
</div>