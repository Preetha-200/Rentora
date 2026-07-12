<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { formatCurrency } from '$lib/utils/format.js';
	import { handleApiError } from '$lib/utils/errors.js';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DashboardCard from '$lib/components/DashboardCard.svelte';

	let loading = $state(true);
	let error = $state('');

	let report = $state({
		totalUsers: 0,
		totalOwners: 0,
		totalTenants: 0,
		totalProperties: 0,
		approvedProperties: 0,
		pendingProperties: 0,
		rejectedProperties: 0,
		totalRequests: 0,
		approvedRequests: 0,
		rejectedRequests: 0,
		pendingRequests: 0,
		totalMaintenance: 0,
		completedMaintenance: 0,
		openMaintenance: 0,
		totalPayments: 0,
		paidPayments: 0,
		pendingPayments: 0,
		totalRevenue: 0
	});

	async function loadReports() {
		loading = true;
		error = '';

		try {
			report = await api.get('/api/admin/reports');
		} catch (err) {
			error = handleApiError(err, 'Failed to load reports.');
		} finally {
			loading = false;
		}
	}

	onMount(loadReports);
</script>

<SectionHeading title="System Reports" subtitle="Platform-wide statistics across users, properties, requests, maintenance, and payments." />

{#if loading}
	<LoadingSpinner message="Loading reports..." />
{:else}
	{#if error}
		<div class="mb-6 rounded-xl bg-red-100 text-red-700 p-4">
			{error}
		</div>
	{/if}

	<div class="space-y-10">
		<div>
			<h2 class="text-lg font-bold text-rentora-dark mb-4">Users</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<DashboardCard label="Total Users" value={report.totalUsers} />
				<DashboardCard label="Total Owners" value={report.totalOwners} color="text-blue-600" />
				<DashboardCard label="Total Tenants" value={report.totalTenants} color="text-indigo-600" />
			</div>
		</div>

		<div>
			<h2 class="text-lg font-bold text-rentora-dark mb-4">Properties</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				<DashboardCard label="Total Properties" value={report.totalProperties} />
				<DashboardCard label="Approved Properties" value={report.approvedProperties} color="text-green-600" />
				<DashboardCard label="Pending Properties" value={report.pendingProperties} color="text-amber-600" />
				<DashboardCard label="Rejected Properties" value={report.rejectedProperties} color="text-red-600" />
			</div>
		</div>

		<div>
			<h2 class="text-lg font-bold text-rentora-dark mb-4">Rental Requests</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				<DashboardCard label="Total Requests" value={report.totalRequests} />
				<DashboardCard label="Approved Requests" value={report.approvedRequests} color="text-green-600" />
				<DashboardCard label="Rejected Requests" value={report.rejectedRequests} color="text-red-600" />
				<DashboardCard label="Pending Requests" value={report.pendingRequests} color="text-amber-600" />
			</div>
		</div>

		<div>
			<h2 class="text-lg font-bold text-rentora-dark mb-4">Maintenance</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<DashboardCard label="Total Maintenance Requests" value={report.totalMaintenance} />
				<DashboardCard label="Completed" value={report.completedMaintenance} color="text-green-600" />
				<DashboardCard label="Open" value={report.openMaintenance} color="text-amber-600" />
			</div>
		</div>

		<div>
			<h2 class="text-lg font-bold text-rentora-dark mb-4">Payments</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				<DashboardCard label="Total Payments" value={report.totalPayments} />
				<DashboardCard label="Paid Payments" value={report.paidPayments} color="text-green-600" />
				<DashboardCard label="Pending Payments" value={report.pendingPayments} color="text-amber-600" />
				<DashboardCard label="Revenue Collected" value={formatCurrency(report.totalRevenue)} color="text-rentora-purple" />
			</div>
		</div>
	</div>

	<div class="bg-white rounded-2xl border shadow-sm mt-10 p-6">
		<h2 class="text-xl font-bold mb-4">System Summary</h2>

		<p class="text-gray-600 leading-7">
			Rentora currently manages
			<strong>{report.totalProperties}</strong> properties across
			<strong>{report.totalOwners}</strong> owners and
			<strong>{report.totalTenants}</strong> tenants. There are
			<strong>{report.pendingProperties}</strong> properties awaiting approval and
			<strong>{report.pendingRequests}</strong> rental requests awaiting a decision,
			with a total rent collection of
			<strong>{formatCurrency(report.totalRevenue)}</strong>.
		</p>
	</div>
{/if}
