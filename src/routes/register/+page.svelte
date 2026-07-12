<script>
	import { goto } from '$app/navigation';
	import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let selectedRole = $state('tenant');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state('');
	let showPassword = $state(false);

	function routeForRole(role) {
		const routes = { admin: '/admin', owner: '/owner', tenant: '/tenant' };
		return routes[role] || '/';
	}

	async function handleRegister(event) {
		event.preventDefault();
		error = '';
		success = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters.';
			return;
		}

		loading = true;

		try {
			// 1. Create Firebase account
			const credential = await createUserWithEmailAndPassword(auth, email, password);
			await updateProfile(credential.user, { displayName: name });

			// 2. Get ID token
			const token = await credential.user.getIdToken();

			// 3. Store user profile in Firestore via register API
			const regRes = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, phone, role: selectedRole, token })
			});

			const regData = await regRes.json();
			if (!regRes.ok) throw new Error(regData.message || 'Registration failed.');

			// 4. Set server-side session cookie
			await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			// 5. Keep localStorage in sync
			const user = { id: credential.user.uid, ...regData.user };
			localStorage.setItem('rentora_user', JSON.stringify(user));
			window.dispatchEvent(new StorageEvent('storage'));

			success = 'Account created successfully! Redirecting...';

			setTimeout(() => goto(routeForRole(regData.user.role)), 800);
		} catch (err) {
			error = err.message?.replace('Firebase: ', '') || 'Registration failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Account — Rentora</title>
	<meta name="description" content="Create your free Rentora account as a tenant or property owner." />
</svelte:head>

<div class="min-h-screen flex">
	<!-- Left: Branding panel -->
	<div class="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden flex-col justify-between p-12">
		<div class="absolute top-1/3 right-1/4 w-64 h-64 bg-rentora-purple/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl animate-float" style="animation-delay: 1.5s"></div>

		<!-- Logo -->
		<div class="relative flex items-center gap-3">
			<div class="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
				<span class="material-symbols-outlined text-white text-2xl filled">apartment</span>
			</div>
			<span class="text-2xl font-black tracking-widest text-white">RENTORA</span>
		</div>

		<!-- Content -->
		<div class="relative">
			<h2 class="text-5xl font-black text-white leading-tight mb-6">
				Join<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
					Rentora Today
				</span>
			</h2>
			<p class="text-white/60 text-lg leading-relaxed max-w-sm">
				Whether you're looking for your perfect home or want to list your property — Rentora makes it simple.
			</p>

			<div class="mt-10 space-y-4">
				{#each [
					{ icon: 'search', title: 'For Tenants', desc: 'Browse verified listings and request rentals instantly.' },
					{ icon: 'apartment', title: 'For Owners', desc: 'List properties, manage requests, and track payments.' }
				] as item}
					<div class="flex items-start gap-4 bg-white/8 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
						<div class="w-10 h-10 rounded-xl bg-rentora-purple/30 flex items-center justify-center shrink-0">
							<span class="material-symbols-outlined text-white text-lg filled">{item.icon}</span>
						</div>
						<div>
							<div class="text-white font-bold text-sm">{item.title}</div>
							<div class="text-white/60 text-sm mt-0.5">{item.desc}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="relative text-white/40 text-sm">
			© 2026 Rentora. All rights reserved.
		</div>
	</div>

	<!-- Right: Form panel -->
	<div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
		<div class="w-full max-w-md py-8">
			<!-- Mobile logo -->
			<div class="flex lg:hidden items-center gap-3 mb-10">
				<div class="w-10 h-10 rounded-xl bg-rentora-dark flex items-center justify-center">
					<span class="material-symbols-outlined text-white text-lg filled">apartment</span>
				</div>
				<span class="text-xl font-black tracking-widest text-rentora-dark">RENTORA</span>
			</div>

			<div class="mb-8">
				<h1 class="text-3xl font-black text-rentora-dark">Create Account</h1>
				<p class="text-gray-500 mt-2">Already have an account? <a href="/login" class="text-rentora-purple font-semibold hover:underline">Sign in</a></p>
			</div>

			<form onsubmit={handleRegister} class="space-y-5">
				<!-- Role selector -->
				<div>
					<label class="block text-sm font-semibold text-gray-700 mb-3">I am a</label>
					<div class="grid grid-cols-2 gap-3">
						{#each [{ value: 'tenant', label: 'Tenant', icon: 'person' }, { value: 'owner', label: 'Property Owner', icon: 'apartment' }] as opt}
							<button
								type="button"
								onclick={() => selectedRole = opt.value}
								class="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
									{selectedRole === opt.value
										? 'border-rentora-purple bg-rentora-purplePale text-rentora-purple'
										: 'border-gray-200 text-gray-600 hover:border-gray-300'
									}">
								<span class="material-symbols-outlined text-lg {selectedRole === opt.value ? 'filled' : ''}">{opt.icon}</span>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Name -->
				<div>
					<label for="reg-name" class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">person</span>
						<input
							id="reg-name"
							type="text"
							bind:value={name}
							required
							placeholder="John Doe"
							class="input-field pl-11" />
					</div>
				</div>

				<!-- Email -->
				<div>
					<label for="reg-email" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">mail</span>
						<input
							id="reg-email"
							type="email"
							bind:value={email}
							required
							placeholder="name@domain.com"
							class="input-field pl-11" />
					</div>
				</div>

				<!-- Phone -->
				<div>
					<label for="reg-phone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">phone</span>
						<input
							id="reg-phone"
							type="tel"
							bind:value={phone}
							required
							placeholder="+91 XXXXX XXXXX"
							class="input-field pl-11" />
					</div>
				</div>

				<!-- Password -->
				<div>
					<label for="reg-password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">lock</span>
						<input
							id="reg-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							minlength="6"
							placeholder="Min. 6 characters"
							class="input-field pl-11 pr-12" />
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rentora-purple transition-colors"
							aria-label="Toggle password visibility">
							<span class="material-symbols-outlined text-xl">
								{showPassword ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				<!-- Confirm password -->
				<div>
					<label for="reg-confirm" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
					<div class="relative">
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">lock_reset</span>
						<input
							id="reg-confirm"
							type={showPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							required
							minlength="6"
							placeholder="Repeat your password"
							class="input-field pl-11" />
					</div>
				</div>

				<!-- Error / Success -->
				{#if error}
					<div class="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4">
						<span class="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
						<p class="text-red-700 text-sm">{error}</p>
					</div>
				{/if}

				{#if success}
					<div class="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4">
						<span class="material-symbols-outlined text-green-500 text-xl filled">check_circle</span>
						<p class="text-green-700 text-sm font-medium">{success}</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full py-4 rounded-xl bg-rentora-purple text-white font-bold text-base hover:bg-rentora-purpleLight transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
					{#if loading}
						<div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
						Creating Account...
					{:else}
						<span class="material-symbols-outlined text-xl">person_add</span>
						Create Account
					{/if}
				</button>
			</form>

			<p class="text-center text-sm text-gray-400 mt-8">
				By creating an account, you agree to our
				<a href="/" class="text-rentora-purple hover:underline">Terms</a>
				and
				<a href="/" class="text-rentora-purple hover:underline">Privacy Policy</a>.
			</p>
		</div>
	</div>
</div>
