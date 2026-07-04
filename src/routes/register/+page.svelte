<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let phone = $state('');
	let selectedRole = $state('tenant');

	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	let showPassword = $state(false);

	async function handleRegister(event) {
		event.preventDefault();

		error = '';
		success = '';
		loading = true;

		try {
			// Create Firebase Authentication account
			const credential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

			await updateProfile(credential.user, {
				displayName: name
			});

			const token = await credential.user.getIdToken();

			localStorage.setItem('token', token);
			console.log('Stored token:', localStorage.getItem('token'));
			console.log('Firebase token:', token);

			// Save additional user details in backend
			const response = await api.post('/api/auth/register', {
				name,
				email,
				password,
				phone,
				role: selectedRole
			});

			localStorage.setItem(
				'rentora_user',
				JSON.stringify(response.user)
			);

			window.dispatchEvent(new StorageEvent('storage'));

			success = 'Registration successful!';

			setTimeout(() => {
				switch (response.user.role) {
					case 'tenant':
						goto('/');
						break;

					case 'owner':
						goto('/owner');
						break;

					case 'admin':
						goto('/admin');
						break;

					default:
						goto('/');
				}
			}, 800);
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
				Create Account
			</h2>

			<p class="mt-2 text-center text-sm text-gray-500">
				Join the Rentora Platform
			</p>
		</div>

		<form class="mt-8 space-y-6" on:submit={handleRegister}>
			<div class="space-y-4">

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Full Name
					</label>

					<input
						type="text"
						bind:value={name}
						required
						placeholder="John Doe"
						class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Phone Number
					</label>

					<input
						type="tel"
						bind:value={phone}
						required
						placeholder="+91XXXXXXXXXX"
						class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						I am a
					</label>

					<select
						bind:value={selectedRole}
						class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">

						<option value="tenant">Tenant</option>
						<option value="owner">Property Owner</option>

					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>

					<input
						type="email"
						bind:value={email}
						required
						placeholder="name@domain.com"
						class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>

					<div class="relative">

						<input
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							placeholder="••••••••"
							class="w-full px-3 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						/>

						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rentora-purple"
							on:click={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								👁️
							{:else}
								🙈
							{/if}
						</button>

					</div>
				</div>

			</div>

			{#if error}
				<p class="text-sm text-red-600 text-center">
					{error}
				</p>
			{/if}

			{#if success}
				<p class="text-sm text-green-600 text-center">
					{success}
				</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition disabled:opacity-50">

				{loading ? 'Creating Account...' : 'Sign Up'}

			</button>

		</form>

	</div>
</div>