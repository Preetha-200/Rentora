<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let email = $state('');
	let password = $state('');
	let selectedRole = $state('tenant');

	let loading = $state(false);
	let error = $state('');

	let showPassword = $state(false);

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
			console.log('Stored token:', localStorage.getItem('token'));
			console.log('Firebase token:', token);

			const response = await api.get('/api/auth/profile');

			localStorage.setItem('rentora_user', JSON.stringify(response.user));

			window.dispatchEvent(new StorageEvent('storage'));

			if (response.user.role !== selectedRole) {
				error = 'Selected role does not match your account.';
				localStorage.removeItem('token');
				localStorage.removeItem('rentora_user');
				loading = false;
				return;
			}

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

		<form class="mt-8 space-y-6" on:submit={handleLogin}>
			<div class="rounded-md space-y-4">

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Select Role
					</label>

					<select
						bind:value={selectedRole}
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">

						<option value="tenant">Tenant</option>
						<option value="owner">Property Owner</option>
						<option value="admin">Platform Admin</option>

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
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />
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
							class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />

						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rentora-purple"
							on:click={() => (showPassword = !showPassword)}>

							{#if showPassword}
								<input type="checkbox" clicked class="w-4 h-4 accent-indigo-900 rounded">
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
	</div>
</div>