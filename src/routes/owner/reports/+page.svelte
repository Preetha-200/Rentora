<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let report = null;
	let loading = true;
	let error = '';

	async function loadReport() {
		loading = true;
		error = '';

		try {
			report = await api.get('/api/reports');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadReport);
</script>

<section>
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Owner Reports
	</h1>

	{#if loading}

		<div class="bg-white rounded-xl p-8 shadow text-center">
			Loading reports...
		</div>

	{:else if error}

		<p class="text-red-600">{error}</p>

	{:else}

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

			<div class="bg-white rounded-xl shadow p-5 border">
				<p class="text-sm text-gray-500">
					Properties
				</p>
				<p class="text-3xl font-bold">
					{report.totalProperties}
				</p>
			</div>

			<div class="bg-white rounded-xl shadow p-5 border">
				<p class="text-sm text-gray-500">
					Approved
				</p>
				<p class="text-3xl font-bold text-green-600">
					{report.approvedProperties}
				</p>
			</div>

			<div class="bg-white rounded-xl shadow p-5 border">
				<p class="text-sm text-gray-500">
					Pending Requests
				</p>
				<p class="text-3xl font-bold text-yellow-600">
					{report.pendingRequests}
				</p>
			</div>

			<div class="bg-white rounded-xl shadow p-5 border">
				<p class="text-sm text-gray-500">
					Revenue
				</p>
				<p class="text-3xl font-bold text-rentora-purple">
					₹{report.totalRevenue}
				</p>
			</div>

		</div>

		<div class="bg-white rounded-2xl shadow border overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="p-4 text-left">Metric</th>
						<th class="p-4 text-left">Value</th>
					</tr>
				</thead>

				<tbody>
                		<tr class="border-t">
						<td class="p-4">Pending Properties</td>
						<td class="p-4">{report.pendingProperties}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Total Rental Requests</td>
						<td class="p-4">{report.totalRequests}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Accepted Requests</td>
						<td class="p-4">{report.acceptedRequests}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Rejected Requests</td>
						<td class="p-4">{report.rejectedRequests}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Paid Payments</td>
						<td class="p-4">{report.paidPayments}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Pending Payments</td>
						<td class="p-4">{report.pendingPayments}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Open Maintenance Requests</td>
						<td class="p-4">{report.openMaintenance}</td>
					</tr>

					<tr class="border-t">
						<td class="p-4">Completed Maintenance</td>
						<td class="p-4">{report.completedMaintenance}</td>
					</tr>
				</tbody>
			</table>
		</div>

	{/if}
</section>