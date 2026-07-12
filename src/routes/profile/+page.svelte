<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let user = $state(null);
	let stats = $state({});
	let loading = $state(true);

	onMount(async () => {
		const storedUser = localStorage.getItem('rentora_user');

		if (!storedUser) {
			goto('/login');
			return;
		}

		user = JSON.parse(storedUser);

		try {
			stats = await api.get('/api/profile/stats');
		} catch {
			stats = {};
		} finally {
			loading = false;
		}
	});

	function dashboardLink() {
		switch (user.role) {
			case 'tenant':
				return '/tenant';
			case 'owner':
				return '/owner';
			case 'admin':
				return '/admin';
			default:
				return '/';
		}
	}

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('rentora_user');
		goto('/');
	}
</script>

{#if loading}
	<div class="max-w-5xl mx-auto px-6 py-12">
		<div class="bg-white rounded-3xl shadow-xl p-12 text-center text-gray-500">
			Loading profile...
		</div>
	</div>

{:else if user}

<div class="max-w-5xl mx-auto px-6 py-12">
	<div class="bg-white rounded-3xl shadow-xl overflow-hidden">

		<div class="bg-rentora-purple h-40 flex justify-center items-end">
			<div class="w-32 h-32 rounded-full bg-white border-4 border-white flex items-center justify-center text-5xl font-bold text-rentora-purple translate-y-16 shadow-lg">
				{user.name.charAt(0).toUpperCase()}
			</div>
		</div>

		<div class="pt-20 pb-10 px-10">

			<div class="text-center mb-10">
				<h1 class="text-3xl font-bold text-rentora-dark">{user.name}</h1>
				<p class="text-gray-500 mt-2">{user.email}</p>

				<span class="inline-block mt-4 px-4 py-2 rounded-full bg-rentora-purple text-white text-sm uppercase font-semibold">
					{user.role}
				</span>
			</div>

			<div class="grid md:grid-cols-2 gap-6 mb-10">
				<div class="bg-gray-50 rounded-2xl p-6">
					<h2 class="text-sm text-gray-500 mb-2">Full Name</h2>
					<p class="text-lg font-semibold">{user.name}</p>
				</div>

				<div class="bg-gray-50 rounded-2xl p-6">
					<h2 class="text-sm text-gray-500 mb-2">Email Address</h2>
					<p class="text-lg font-semibold break-all">{user.email}</p>
				</div>

				<div class="bg-gray-50 rounded-2xl p-6">
					<h2 class="text-sm text-gray-500 mb-2">Phone Number</h2>
					<p class="text-lg font-semibold">{user.phone || 'Not Available'}</p>
				</div>

				<div class="bg-gray-50 rounded-2xl p-6">
					<h2 class="text-sm text-gray-500 mb-2">Account Role</h2>
					<p class="text-lg font-semibold capitalize">{user.role}</p>
				</div>
			</div>

			<h2 class="text-2xl font-bold text-rentora-dark mb-5">Overview</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

				{#if user.role === 'tenant'}
					<div class="bg-indigo-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Applications</p>
						<h3 class="text-3xl font-bold mt-2">{stats.applications ?? 0}</h3>
					</div>

					<div class="bg-green-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Payments</p>
						<h3 class="text-3xl font-bold mt-2">{stats.payments ?? 0}</h3>
					</div>

					<div class="bg-orange-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Maintenance</p>
						<h3 class="text-3xl font-bold mt-2">{stats.maintenance ?? 0}</h3>
					</div>

				{:else if user.role === 'owner'}

					<div class="bg-blue-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Properties</p>
						<h3 class="text-3xl font-bold mt-2">{stats.properties ?? 0}</h3>
					</div>

					<div class="bg-purple-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Applications</p>
						<h3 class="text-3xl font-bold mt-2">{stats.requests ?? 0}</h3>
					</div>

					<div class="bg-emerald-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Revenue</p>
						<h3 class="text-3xl font-bold mt-2">₹{stats.revenue ?? 0}</h3>
					</div>

				{:else}

					<div class="bg-blue-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Users</p>
						<h3 class="text-3xl font-bold mt-2">{stats.users ?? 0}</h3>
					</div>

					<div class="bg-green-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Properties</p>
						<h3 class="text-3xl font-bold mt-2">{stats.properties ?? 0}</h3>
					</div>

					<div class="bg-purple-50 rounded-2xl p-6">
						<p class="text-sm text-gray-500">Reports</p>
						<h3 class="text-3xl font-bold mt-2">{stats.reports ?? 0}</h3>
					</div>
				{/if}

			</div>

			<div class="flex flex-wrap justify-center gap-4">
				<a href={dashboardLink()} class="px-6 py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition">
					Dashboard
				</a>

				<button class="px-6 py-3 rounded-xl bg-gray-100 font-semibold hover:bg-gray-200 transition">
					Edit Profile
				</button>

				<button class="px-6 py-3 rounded-xl bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200 transition">
					Change Password
				</button>

				<button on:click={logout} class="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition">
					Logout
				</button>
			</div>

		</div>
	</div>
</div>

{/if}