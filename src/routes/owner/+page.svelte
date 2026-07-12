<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	let user = null;
	let requests = [];
	let issues = [];
	let loadingData = true;
	let error = '';
	let requestStats = {
		pending: 0,
		approved: 0,
		rejected: 0
	};
	let maintenanceStats = {
		pending: 0,
		inProgress: 0,
		completed: 0
	};
	async function loadDashboard() {
		loadingData = true;
		error = '';
		try {
			requests = await api.get('/api/rental-requests?owner=true');
			const maintenance = await api.get('/api/maintenance');
			issues = maintenance.complaints || [];
			requestStats = {
				pending: requests.filter(
					(r) => r.status === 'Pending'
				).length,
				approved: requests.filter(
					(r) =>
						r.status === 'Approved' ||
						r.status === 'Accepted'
				).length,
				rejected: requests.filter(
					(r) =>
						r.status === 'Rejected'
				).length
			};
			maintenanceStats = {
				pending: issues.filter(
					(i) => i.status === 'Pending'
				).length,
				inProgress: issues.filter(
					(i) => i.status === 'In Progress'
				).length,
				completed: issues.filter(
					(i) =>
						i.status === 'Completed' ||
						i.status === 'Resolved'
				).length
			};
		} catch (err) {
			error =
				err.message ||
				'Failed to load dashboard';
		} finally {
			loadingData = false;
		}
	}
	onMount(async () => {
		const savedUser =
			localStorage.getItem('rentora_user');
		if (!savedUser) {
			goto('/login');
			return;
		}
		user = JSON.parse(savedUser);
		await loadDashboard();
	});
	async function updateRequest(id, status) {
		try {
			await api.put('/api/requests/status', {
				requestId: id,
				status
			});
			await loadDashboard();
		} catch (err) {
			alert(err.message);
		}
	}
	async function resolveTicket(id, status) {
		try {
			await api.post(
				'/api/maintenance/update-status',
				{
					complaintId: id,
					status
				}
			);
			await loadDashboard();
		} catch (err) {
			alert(err.message);
		}
	}
	function handleLogout() {
		localStorage.removeItem(
			'rentora_token'
		);
		localStorage.removeItem(
			'rentora_user'
		);
		goto('/login');
	}
</script>
{#if user}
<main class="min-h-screen bg-slate-50 p-6 md:p-12">
	<div class="max-w-7xl mx-auto space-y-8">
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<div>
				<h1 class="text-3xl font-extrabold text-gray-900">
					Landlord Control Room
				</h1>
				<p class="text-gray-500 mt-1">
					Welcome back, {user.name}
				</p>
			</div>
			<button
				onclick={handleLogout}
				class="mt-4 md:mt-0 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-semibold transition">
				Sign Out
			</button>
		</div>
		{#if loadingData}
			<div class="bg-white rounded-2xl shadow-sm border p-12 text-center">
				<p class="text-gray-500">
					Loading dashboard...
				</p>
			</div>
		{:else}
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
					{error}
				</div>
			{/if}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
				<div class="bg-white rounded-2xl shadow-sm border p-5">
					<p class="text-sm text-gray-500">
						Pending Applications
					</p>
					<p class="text-3xl font-bold text-amber-600 mt-2">
						{requestStats.pending}
					</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm border p-5">
					<p class="text-sm text-gray-500">
						Approved Applications
					</p>
					<p class="text-3xl font-bold text-green-600 mt-2">
						{requestStats.approved}
					</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm border p-5">
					<p class="text-sm text-gray-500">
						Pending Maintenance
					</p>
					<p class="text-3xl font-bold text-red-600 mt-2">
						{maintenanceStats.pending}
					</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm border p-5">
					<p class="text-sm text-gray-500">
						In Progress
					</p>
					<p class="text-3xl font-bold text-blue-600 mt-2">
						{maintenanceStats.inProgress}
					</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm border p-5">
					<p class="text-sm text-gray-500">
						Completed
					</p>
					<p class="text-3xl font-bold text-emerald-600 mt-2">
						{maintenanceStats.completed}
					</p>
				</div>
			</div>
			<section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
				<h2 class="text-xl font-bold text-gray-800 mb-4">
					Tenant Lease Applications
				</h2>
				{#if requests.length === 0}
					<p class="text-gray-500">
						No tenant applications have been received yet.
					</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left">
							<thead>
								<tr class="border-b border-gray-100 text-sm font-semibold text-gray-400">
									<th class="py-3">
										Tenant
									</th>
									<th class="py-3">
										Property
									</th>
									<th class="py-3">
										Status
									</th>
									<th class="py-3 text-right">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-50 text-sm">
                            								{#each requests as req}
									<tr>
										<td class="py-4 font-semibold">
											{req.tenantName}
										</td>
										<td class="py-4">
											{req.propertyTitle || req.propertyId}
										</td>
										<td class="py-4">
											<span
												class={`px-3 py-1 rounded-full text-xs font-semibold ${
													req.status === 'Approved' || req.status === 'Accepted'
														? 'bg-green-100 text-green-700'
														: req.status === 'Rejected'
															? 'bg-red-100 text-red-700'
															: 'bg-amber-100 text-amber-700'
												}`}>
												{req.status}
											</span>
										</td>
										<td class="py-4 text-right">
											{#if req.status === 'Pending'}
												<div class="flex justify-end gap-2">
													<button
														onclick={() =>
															updateRequest(
																req.id,
																'Approved'
															)}
														class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
														Approve
													</button>
													<button
														onclick={() =>
															updateRequest(
																req.id,
																'Rejected'
															)}
														class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
														Reject
													</button>
												</div>
											{:else}
												<span class="text-gray-400">
													Completed
												</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>
			<section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
				<h2 class="text-xl font-bold text-gray-800 mb-4">
					Maintenance Requests
				</h2>
				{#if issues.length === 0}
					<p class="text-gray-500">
						No maintenance complaints found.
					</p>
				{:else}
					<div class="space-y-4">
						{#each issues as issue}
							<div class="border rounded-xl p-5 flex flex-col lg:flex-row justify-between gap-5">
								<div>
									<h3 class="font-semibold text-lg">
										{issue.propertyTitle}
									</h3>
									<p class="text-gray-600 mt-2">
										{issue.complaint}
									</p>
									<p class="text-sm text-gray-400 mt-2">
										Status:
										<strong>{issue.status}</strong>
									</p>
								</div>
								<div class="flex flex-wrap gap-2 h-fit">
									{#if issue.status !== 'Pending'}
										<button
											onclick={() =>
												resolveTicket(
													issue.id,
													'Pending'
												)}
											class="px-4 py-2 rounded-lg bg-amber-600 text-white">
											Mark Pending
										</button>
									{/if}
									{#if issue.status !== 'In Progress'}
										<button
											onclick={() =>
												resolveTicket(
													issue.id,
													'In Progress'
												)}
											class="px-4 py-2 rounded-lg bg-blue-600 text-white">
											In Progress
										</button>
									{/if}
									{#if issue.status !== 'Completed'}
										<button
											onclick={() =>
												resolveTicket(
													issue.id,
													'Completed'
												)}
											class="px-4 py-2 rounded-lg bg-green-600 text-white">
											Complete
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</main>
{/if}