<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let requests = $state([]);
	let loading = $state(true);
	let error = $state('');
	let filterStatus = $state('All');

	async function loadRequests() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/rental-requests?mine=true');
			requests = Array.isArray(data) ? data : [];
		} catch (err) {
			error = err.message;
			requests = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadRequests);

	const stats = $derived({
		total: requests.length,
		pending: requests.filter((r) => r.status === 'Pending').length,
		approved: requests.filter((r) => r.status === 'Approved').length,
		rejected: requests.filter((r) => r.status === 'Rejected').length
	});

	const filtered = $derived(
		filterStatus === 'All' ? requests : requests.filter((r) => r.status === filterStatus)
	);

	function statusColor(status) {
		const map = {
			Approved: 'bg-green-100 text-green-700 border-green-200',
			Rejected: 'bg-red-100 text-red-700 border-red-200',
			Pending: 'bg-amber-100 text-amber-700 border-amber-200'
		};
		return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
	}

	function statusIcon(status) {
		const icons = { Approved: 'check_circle', Rejected: 'cancel', Pending: 'pending' };
		return icons[status] || 'circle';
	}
</script>

<svelte:head>
	<title>My Applications — Tenant Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-4xl mx-auto animate-fade-in">
	<div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-black text-rentora-dark">My Applications</h1>
			<p class="text-gray-500 mt-1">Track the status of your rental applications.</p>
		</div>
		<a href="/tenant/browse" class="flex items-center gap-2 px-5 py-3 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all active:scale-95 text-sm">
			<span class="material-symbols-outlined">search</span>
			Browse More
		</a>
	</div>

	{#if !loading && requests.length > 0}
		<!-- Stats row -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
			{#each [
				{ label: 'Total', value: stats.total, cls: 'text-rentora-dark', bg: 'bg-gray-50' },
				{ label: 'Pending', value: stats.pending, cls: 'text-amber-600', bg: 'bg-amber-50' },
				{ label: 'Approved', value: stats.approved, cls: 'text-green-600', bg: 'bg-green-50' },
				{ label: 'Rejected', value: stats.rejected, cls: 'text-red-600', bg: 'bg-red-50' }
			] as s}
				<div class="{s.bg} rounded-2xl border border-gray-100 p-4 text-center">
					<div class="text-2xl font-black {s.cls}">{s.value}</div>
					<div class="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</div>
				</div>
			{/each}
		</div>

		<!-- Tabs -->
		<div class="flex gap-2 mb-6 flex-wrap">
			{#each ['All', 'Pending', 'Approved', 'Rejected'] as status}
				<button
					onclick={() => (filterStatus = status)}
					class="px-4 py-2 rounded-xl text-sm font-semibold transition-all
						{filterStatus === status
							? 'bg-rentora-dark text-white shadow-md'
							: 'bg-white text-gray-600 border border-gray-200 hover:border-rentora-purple hover:text-rentora-purple'}">
					{status}
				</button>
			{/each}
		</div>
	{/if}

	{#if loading}
		<div class="space-y-4">
			{#each [1,2,3] as _}
				<div class="bg-white rounded-2xl p-6 shadow-card animate-pulse">
					<div class="flex gap-4">
						<div class="skeleton h-24 w-32 rounded-xl shrink-0"></div>
						<div class="flex-1 space-y-3">
							<div class="skeleton h-5 w-2/3 rounded"></div>
							<div class="skeleton h-4 w-1/2 rounded"></div>
							<div class="skeleton h-6 w-20 rounded-full"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if filtered.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">assignment</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">
				{requests.length === 0 ? 'No Applications Yet' : `No ${filterStatus} Applications`}
			</h3>
			<p class="text-gray-400 mb-6">
				{requests.length === 0
					? 'Browse properties and apply for rentals to get started.'
					: 'Try a different status filter.'}
			</p>
			{#if requests.length === 0}
				<a href="/tenant/browse" class="inline-flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold text-sm hover:bg-rentora-purpleLight transition-all">
					<span class="material-symbols-outlined text-base">search</span>
					Browse Properties
				</a>
			{/if}
		</div>
	{:else}
		<div class="space-y-4">
			{#each filtered as req (req.id)}
				<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
					<div class="p-6">
						<div class="flex flex-col sm:flex-row gap-4">
							<!-- Indicator bar on left -->
							<div class="w-1.5 rounded-full shrink-0 hidden sm:block
								{req.status === 'Approved' ? 'bg-green-400' :
								 req.status === 'Rejected' ? 'bg-red-400' :
								 'bg-amber-400'}">
							</div>

							<!-- Content -->
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-start justify-between gap-2 mb-3">
									<div>
										<h3 class="text-lg font-bold text-rentora-dark line-clamp-1">{req.propertyTitle}</h3>
										<p class="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
											<span class="material-symbols-outlined text-sm">schedule</span>
											Applied {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
										</p>
									</div>
									<span class="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border {statusColor(req.status)}">
										<span class="material-symbols-outlined text-sm filled">{statusIcon(req.status)}</span>
										{req.status}
									</span>
								</div>

								{#if req.message}
									<div class="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm text-gray-600 mb-3 italic">
										"{req.message}"
									</div>
								{/if}

								{#if req.rejectionReason}
									<div class="bg-red-50 rounded-xl px-4 py-3 border border-red-100 text-sm text-red-600 flex items-start gap-2 mb-3">
										<span class="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
										<span><strong>Rejection reason:</strong> {req.rejectionReason}</span>
									</div>
								{/if}

								{#if req.status === 'Approved'}
									<div class="flex items-center gap-2 text-sm text-green-600 font-semibold mt-2">
										<span class="material-symbols-outlined text-base filled">check_circle</span>
										Congratulations! Your application was approved.
									</div>
								{/if}
							</div>

							<!-- Action -->
							<div class="shrink-0">
								<a href="/properties/{req.propertyId}" class="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
									<span class="material-symbols-outlined text-base">open_in_new</span>
									View Property
								</a>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>