<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let requests = $state([]);
	let loading = $state(true);
	let error = $state('');
	let processingId = $state('');
	let successMsg = $state('');
	let filterStatus = $state('All');

	async function loadRequests() {
		loading = true;
		error = '';
		try {
			requests = await api.get('/api/rental-requests?owner=true');
		} catch (err) {
			error = err.message;
			requests = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadRequests);

	async function handleRequest(requestId, action) {
		processingId = requestId;
		successMsg = '';
		try {
			await api.put('/api/rental-requests', { requestId, action });
			successMsg = `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`;
			await loadRequests();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			processingId = '';
		}
	}

	const filteredRequests = $derived(
		filterStatus === 'All' ? requests : requests.filter((r) => r.status === filterStatus)
	);

	const stats = $derived({
		pending: requests.filter((r) => r.status === 'Pending').length,
		approved: requests.filter((r) => r.status === 'Approved').length,
		rejected: requests.filter((r) => r.status === 'Rejected').length
	});
</script>

<svelte:head>
	<title>Rental Requests — Owner Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-5xl mx-auto animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">Rental Requests</h1>
		<p class="text-gray-500 mt-1">Review and respond to incoming rental applications.</p>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	{#if !loading && requests.length > 0}
		<!-- Stats row -->
		<div class="grid grid-cols-3 gap-4 mb-6">
			{#each [
				{ label: 'Pending', value: stats.pending, color: 'bg-amber-50 border-amber-200 text-amber-700' },
				{ label: 'Approved', value: stats.approved, color: 'bg-green-50 border-green-200 text-green-700' },
				{ label: 'Rejected', value: stats.rejected, color: 'bg-red-50 border-red-200 text-red-700' }
			] as s}
				<div class="rounded-2xl border-2 {s.color} p-4 text-center">
					<div class="text-2xl font-black">{s.value}</div>
					<div class="text-xs font-bold uppercase tracking-wide mt-0.5">{s.label}</div>
				</div>
			{/each}
		</div>

		<!-- Filter tabs -->
		<div class="flex gap-2 mb-6 flex-wrap">
			{#each ['All', 'Pending', 'Approved', 'Rejected'] as status}
				<button
					onclick={() => (filterStatus = status)}
					class="px-4 py-2 rounded-xl text-sm font-semibold transition-all
						{filterStatus === status
							? 'bg-rentora-dark text-white shadow-md'
							: 'bg-white text-gray-600 border border-gray-200 hover:border-rentora-purple hover:text-rentora-purple'}">
					{status}
					{#if status !== 'All'}
						<span class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-current/10">
							{status === 'Pending' ? stats.pending : status === 'Approved' ? stats.approved : stats.rejected}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if loading}
		<div class="space-y-4">
			{#each [1,2,3] as _}
				<div class="bg-white rounded-2xl p-6 shadow-card animate-pulse">
					<div class="skeleton h-5 w-1/3 rounded mb-3"></div>
					<div class="skeleton h-4 w-1/2 rounded mb-2"></div>
					<div class="skeleton h-4 w-1/4 rounded"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if filteredRequests.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">inbox</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">
				{filterStatus === 'All' ? 'No Requests Yet' : `No ${filterStatus} Requests`}
			</h3>
			<p class="text-gray-400">
				{filterStatus === 'All'
					? 'Rental requests from tenants will appear here.'
					: 'Try selecting a different filter.'}
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each filteredRequests as req (req.id)}
				<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
					<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div class="flex-1 min-w-0">
							<div class="flex items-start gap-3 mb-2">
								<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rentora-dark to-rentora-blue flex items-center justify-center shrink-0">
									<span class="material-symbols-outlined text-white text-lg filled">person</span>
								</div>
								<div class="min-w-0">
									<h3 class="font-bold text-lg text-rentora-dark truncate">{req.propertyTitle}</h3>
									<p class="text-sm text-gray-500">Tenant: {req.tenantName || req.tenantId}</p>
								</div>
							</div>

							<div class="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
								<span class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm">schedule</span>
									{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
								</span>
								{#if req.message}
									<span class="flex items-center gap-1">
										<span class="material-symbols-outlined text-sm">message</span>
										Has message
									</span>
								{/if}
							</div>

							{#if req.message}
								<p class="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">
									"{req.message}"
								</p>
							{/if}
						</div>

						<div class="flex flex-col items-end gap-3 shrink-0">
							<span class="text-xs font-bold px-3 py-1.5 rounded-full
								{req.status === 'Approved' ? 'bg-green-100 text-green-700' :
								 req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
								 'bg-amber-100 text-amber-700'}">
								{req.status}
							</span>

							{#if req.status === 'Pending'}
								<div class="flex gap-2">
									<button
										onclick={() => handleRequest(req.id, 'approve')}
										disabled={processingId === req.id}
										class="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-50">
										{#if processingId === req.id}
											<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										{:else}
											<span class="material-symbols-outlined text-base">check</span>
										{/if}
										Approve
									</button>
									<button
										onclick={() => handleRequest(req.id, 'reject')}
										disabled={processingId === req.id}
										class="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-50">
										{#if processingId === req.id}
											<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										{:else}
											<span class="material-symbols-outlined text-base">close</span>
										{/if}
										Reject
									</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>