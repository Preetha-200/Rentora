<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	let loading = true;
	let error = '';

	let stats = {
		pendingApprovals: 0,
		deleteRequests: 0,
		approvedProperties: 0,
		totalUsers: 0,
		totalOwners: 0,
		totalTenants: 0
	};

	let recentProperties = [];

	async function loadDashboard() {
		loading = true;
		error = '';

		try {
			const [
				pending,
				deleteReq,
				approved,
				users
			] = await Promise.all([
				api.get('/api/admin/property-approval?status=Pending'),
				api.get('/api/admin/property-approval?deleteRequests=true'),
				api.get('/api/properties?status=Approved'),
				api.get('/api/admin/users')
			]);

			stats.pendingApprovals = pending.length;
			stats.deleteRequests = deleteReq.length;
			stats.approvedProperties = approved.length;
			stats.totalUsers = users.length;
			stats.totalOwners = users.filter(u => u.role === 'owner').length;
			stats.totalTenants = users.filter(u => u.role === 'tenant').length;

			recentProperties = [...pending].slice(0, 5);
		} catch (err) {
			error = err.message || 'Failed to load dashboard';
		} finally {
			loading = false;
		}
	}

	onMount(loadDashboard);
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-8">
	Admin Dashboard
</h1>

{#if loading}

<div class="bg-white rounded-2xl shadow-sm p-10 text-center">
	Loading dashboard...
</div>

{:else}

{#if error}
<div class="mb-6 rounded-xl bg-red-100 text-red-700 p-4">
	{error}
</div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Pending Approvals</p>
		<p class="text-4xl font-bold text-amber-600 mt-3">{stats.pendingApprovals}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Delete Requests</p>
		<p class="text-4xl font-bold text-red-600 mt-3">{stats.deleteRequests}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Approved Properties</p>
		<p class="text-4xl font-bold text-green-600 mt-3">{stats.approvedProperties}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Registered Users</p>
		<p class="text-4xl font-bold text-rentora-purple mt-3">{stats.totalUsers}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Property Owners</p>
		<p class="text-4xl font-bold text-blue-600 mt-3">{stats.totalOwners}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Tenants</p>
		<p class="text-4xl font-bold text-indigo-600 mt-3">{stats.totalTenants}</p>
	</div>

</div>

<div class="grid lg:grid-cols-3 gap-8">

	<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border">

		<div class="flex items-center justify-between p-6 border-b">
			<h2 class="text-xl font-bold">Recent Pending Properties</h2>

			<button
				onclick={() => goto('/admin/approvals')}
				class="text-rentora-purple font-semibold hover:underline">

				View All

			</button>
		</div>

		{#if recentProperties.length === 0}

		<div class="p-10 text-center text-gray-500">
			No pending approvals.
		</div>

		{:else}

		<table class="w-full">

			<thead class="bg-gray-50">

				<tr>

					<th class="text-left p-4">Property</th>
					<th class="text-left p-4">Owner</th>
					<th class="text-left p-4">Rent</th>

				</tr>

			</thead>

			<tbody>

				{#each recentProperties as property}

				<tr class="border-t">

					<td class="p-4">
						<div class="font-semibold">{property.title}</div>
						<div class="text-sm text-gray-500">{property.city}</div>
					</td>

					<td class="p-4">
						{property.ownerName}
					</td>

					<td class="p-4">
						₹{property.rent}
					</td>

				</tr>

				{/each}

			</tbody>

		</table>

		{/if}

	</div>

	<div class="bg-white rounded-2xl shadow-sm border p-6">

		<h2 class="text-xl font-bold mb-6">
			Quick Actions
		</h2>

		<div class="space-y-4">

			<button onclick={() => goto('/admin/approvals')} class="w-full rounded-xl bg-rentora-purple text-white py-3 font-semibold hover:opacity-90">
				Manage Property Approvals
			</button>

			<button onclick={() => goto('/admin/users')} class="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:opacity-90">
				Manage Users
			</button>

			<button onclick={() => goto('/admin/reports')} class="w-full rounded-xl bg-green-600 text-white py-3 font-semibold hover:opacity-90">
				View Reports
			</button>

		</div>

		<div class="border-t mt-8 pt-6">

			<h3 class="font-semibold mb-4">
				System Health
			</h3>

			<div class="space-y-3 text-sm">

				<div class="flex justify-between">
					<span>Pending Reviews</span>
					<span class="font-semibold text-amber-600">{stats.pendingApprovals}</span>
				</div>

				<div class="flex justify-between">
					<span>Delete Requests</span>
					<span class="font-semibold text-red-600">{stats.deleteRequests}</span>
				</div>

				<div class="flex justify-between">
					<span>Approved Listings</span>
					<span class="font-semibold text-green-600">{stats.approvedProperties}</span>
				</div>

			</div>

		</div>

	</div>

</div>

{/if}