<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	let email = $state('');
	let password = $state('');
	let selectedRole = $state('tenant');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(event) {
		event.preventDefault();

		error = '';
		loading = true;

		try {
			const response = await api.post('/auth/login', {
				email,
				password
			});

			localStorage.setItem('rentora_token', response.token);
			localStorage.setItem('rentora_user', JSON.stringify(response.user));

			if (response.user.role !== selectedRole) {
				error = 'Selected role does not match your account.';
				localStorage.removeItem('rentora_token');
				localStorage.removeItem('rentora_user');
				loading = false;
				return;
			}

			switch (response.user.role) {
				case 'tenant':
					goto('/tenant');
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
		}

		loading = false;
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

					<input
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />
				</div>
			</div>

			{#if error}
				<p class="text-red-600 text-sm text-center">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition">

				{loading ? 'Signing In...' : 'Sign In'}

			</button>
		</form>
	</div>
</div>