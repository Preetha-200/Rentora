<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let loading = true;
	let error = '';

	let report = {
		totalUsers: 0,
		totalOwners: 0,
		totalTenants: 0,
		totalProperties: 0,
		approvedProperties: 0,
		pendingProperties: 0,
		deleteRequests: 0,
		totalRevenue: 0
	};

	async function loadReports() {
		loading = true;
		error = '';

		try {
			const [
				users,
				properties,
				pending,
				deleteRequests,
				payments
			] = await Promise.all([
				api.get('/api/admin/users'),
				api.get('/api/properties'),
				api.get('/api/admin/property-approval?status=Pending'),
				api.get('/api/admin/property-approval?deleteRequests=true'),
				api.get('/api/payments')
			]);

			report.totalUsers = users.length;
			report.totalOwners = users.filter(u => u.role === 'owner').length;
			report.totalTenants = users.filter(u => u.role === 'tenant').length;

			report.totalProperties = properties.length;
			report.approvedProperties = properties.filter(p => p.status === 'Approved').length;
			report.pendingProperties = pending.length;
			report.deleteRequests = deleteRequests.length;

			report.totalRevenue = payments
				.filter(p => p.status === 'Paid')
				.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
		} catch (err) {
			error = err.message || 'Failed to load reports.';
		} finally {
			loading = false;
		}
	}

	onMount(loadReports);
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-8">
	System Reports
</h1>

{#if loading}

<div class="bg-white rounded-2xl shadow-sm p-10 text-center">
	Loading reports...
</div>

{:else}

{#if error}
<div class="mb-6 rounded-xl bg-red-100 text-red-700 p-4">
	{error}
</div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Registered Users</p>
		<p class="text-4xl font-bold text-rentora-purple mt-3">{report.totalUsers}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Property Owners</p>
		<p class="text-4xl font-bold text-blue-600 mt-3">{report.totalOwners}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Tenants</p>
		<p class="text-4xl font-bold text-indigo-600 mt-3">{report.totalTenants}</p>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">
		<p class="text-sm text-gray-500 uppercase">Revenue Collected</p>
		<p class="text-4xl font-bold text-green-600 mt-3">₹{report.totalRevenue.toLocaleString()}</p>
	</div>

</div>

<div class="grid lg:grid-cols-2 gap-8">

	<div class="bg-white rounded-2xl border shadow-sm p-6">

		<h2 class="text-xl font-bold mb-6">
			Property Statistics
		</h2>

		<div class="space-y-5">

			<div class="flex justify-between items-center">
				<span>Total Properties</span>
				<span class="font-bold">{report.totalProperties}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Approved Properties</span>
				<span class="font-bold text-green-600">{report.approvedProperties}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Pending Approvals</span>
				<span class="font-bold text-amber-600">{report.pendingProperties}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Delete Requests</span>
				<span class="font-bold text-red-600">{report.deleteRequests}</span>
			</div>

		</div>

	</div>

	<div class="bg-white rounded-2xl border shadow-sm p-6">

		<h2 class="text-xl font-bold mb-6">
			User Statistics
		</h2>

		<div class="space-y-5">

			<div class="flex justify-between items-center">
				<span>Total Accounts</span>
				<span class="font-bold">{report.totalUsers}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Owners</span>
				<span class="font-bold text-blue-600">{report.totalOwners}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Tenants</span>
				<span class="font-bold text-indigo-600">{report.totalTenants}</span>
			</div>

			<div class="flex justify-between items-center">
				<span>Collected Revenue</span>
				<span class="font-bold text-green-600">₹{report.totalRevenue.toLocaleString()}</span>
			</div>

		</div>

	</div>

</div>

<div class="bg-white rounded-2xl border shadow-sm mt-8 p-6">

	<h2 class="text-xl font-bold mb-4">
		System Summary
	</h2>

	<p class="text-gray-600 leading-7">
		Rentora currently manages
		<strong>{report.totalProperties}</strong> properties across
		<strong>{report.totalOwners}</strong> owners and
		<strong>{report.totalTenants}</strong> tenants. There are
		<strong>{report.pendingProperties}</strong> pending approval requests,
		<strong>{report.deleteRequests}</strong> deletion requests awaiting review,
		and a total rent collection of
		<strong>₹{report.totalRevenue.toLocaleString()}</strong>.
	</p>

</div>
{/if}