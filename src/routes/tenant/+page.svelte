<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let loading = $state(true);
	let error = $state('');

	let activeRequests = $state(0);
	let unpaidPayments = $state(0);
	let activeIssues = $state(0);

	onMount(async () => {
		try {
			const requests = await api.get('/api/rental-requests?mine=true');
			activeRequests = requests.filter(
				(r) => r.status === 'Pending'
			).length;

			const paymentsResponse = await api.get('/api/payments');
			unpaidPayments = (paymentsResponse.payments || []).filter(
				(p) => p.status !== 'Paid'
			).length;

			const maintenance = await api.get('/api/maintenance');
			activeIssues = (maintenance.complaints || []).filter(
				(issue) => issue.status !== 'Resolved'
			).length;
		} catch (err) {
			error = err.message || 'Failed to load dashboard';
		} finally {
			loading = false;
		}
	});
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">
	Tenant Dashboard
</h1>

{#if loading}
	<p class="text-gray-500">Loading dashboard...</p>
{:else}
	{#if error}
		<p class="mb-6 text-red-600">{error}</p>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">
				Active Applications
			</h3>
			<p class="text-4xl font-extrabold text-rentora-dark mt-2">
				{activeRequests}
			</p>
		</div>

		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">
				Pending Payments
			</h3>
			<p class="text-4xl font-extrabold text-rentora-purple mt-2">
				{unpaidPayments}
			</p>
		</div>

		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">
				Open Maintenance Issues
			</h3>
			<p class="text-4xl font-extrabold text-amber-600 mt-2">
				{activeIssues}
			</p>
		</div>
	</div>
{/if}
