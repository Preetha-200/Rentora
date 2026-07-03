<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let phone = $state('');
	let selectedRole = $state('tenant');

	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleRegister(event) {
		event.preventDefault();

		error = '';
		success = '';
		loading = true;

		try {
			const response = await api.post('/auth/register', {
				name,
				email,
				password,
				phone,
				role: selectedRole
			});

			localStorage.setItem('rentora_token', response.token);
			localStorage.setItem('rentora_user', JSON.stringify(response.user));

			success = response.message;

			setTimeout(() => {
				switch (response.user.role) {
					case 'tenant':
						goto('/tenant');
						break;

					case 'owner':
						goto('/owner');
						break;

					default:
						goto('/');
				}
			}, 1000);
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
						class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rentora-purple"/>
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
						class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rentora-purple"/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						I am a
					</label>

					<select
						bind:value={selectedRole}
						class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rentora-purple">

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
						class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rentora-purple"/>
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
						class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rentora-purple"/>
				</div>

			</div>

			{#if error}
				<p class="text-red-600 text-sm">{error}</p>
			{/if}

			{#if success}
				<p class="text-green-600 text-sm">{success}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight">

				{loading ? 'Creating Account...' : 'Sign Up'}

			</button>
		</form>
	</div>
</div>