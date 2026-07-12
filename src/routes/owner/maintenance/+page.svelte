<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let issues = $state([]);
	let loading = $state(true);
	let error = $state('');
	let updatingId = $state('');
	let successMsg = $state('');

	async function loadIssues() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/maintenance');
			issues = Array.isArray(data) ? data : data.complaints || [];
		} catch (err) {
			error = err.message;
			issues = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadIssues);

	async function updateStatus(issueId, newStatus) {
		updatingId = issueId;
		successMsg = '';
		try {
			await api.patch(`/api/maintenance/${issueId}`, { status: newStatus });
			successMsg = `Status updated to "${newStatus}" successfully.`;
			await loadIssues();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			updatingId = '';
		}
	}

	const statusOrder = { Pending: 0, 'In Progress': 1, Fixed: 2, Resolved: 3 };
	const sortedIssues = $derived(
		[...issues].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))
	);

	function statusBadge(status) {
		const map = {
			Pending: 'bg-amber-100 text-amber-700',
			'In Progress': 'bg-blue-100 text-blue-700',
			Fixed: 'bg-purple-100 text-purple-700',
			Resolved: 'bg-green-100 text-green-700'
		};
		return map[status] || 'bg-gray-100 text-gray-600';
	}
</script>

<svelte:head>
	<title>Maintenance — Owner Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-5xl mx-auto animate-fade-in">
	<div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-black text-rentora-dark">Maintenance Issues</h1>
			<p class="text-gray-500 mt-1">Review and update maintenance requests from your tenants.</p>
		</div>
		<div class="flex gap-2 text-sm">
			{#each [
				{ label: 'Pending', color: 'bg-amber-100 text-amber-700', count: issues.filter(i => i.status === 'Pending').length },
				{ label: 'In Progress', color: 'bg-blue-100 text-blue-700', count: issues.filter(i => i.status === 'In Progress').length },
				{ label: 'Fixed', color: 'bg-purple-100 text-purple-700', count: issues.filter(i => i.status === 'Fixed').length }
			] as badge}
				{#if badge.count > 0}
					<span class="px-3 py-1.5 rounded-full font-bold {badge.color}">
						{badge.count} {badge.label}
					</span>
				{/if}
			{/each}
		</div>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	{#if loading}
		<div class="space-y-4">
			{#each [1,2,3,4] as _}
				<div class="bg-white rounded-2xl p-6 shadow-card animate-pulse">
					<div class="flex gap-4">
						<div class="skeleton h-12 w-12 rounded-xl shrink-0"></div>
						<div class="flex-1 space-y-2">
							<div class="skeleton h-5 w-1/2 rounded"></div>
							<div class="skeleton h-4 w-3/4 rounded"></div>
							<div class="skeleton h-4 w-1/3 rounded"></div>
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
	{:else if sortedIssues.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">build</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">No Maintenance Issues</h3>
			<p class="text-gray-400">Your tenants haven't reported any issues yet.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each sortedIssues as issue (issue.id)}
				<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
					<div class="flex flex-col sm:flex-row gap-4">
						<!-- Icon -->
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rentora-dark to-rentora-blue flex items-center justify-center shrink-0 shadow-lg">
							<span class="material-symbols-outlined text-white filled">build</span>
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-start justify-between gap-2 mb-2">
								<h3 class="text-lg font-bold text-rentora-dark">{issue.title || issue.issue || 'Maintenance Issue'}</h3>
								<span class="px-3 py-1 rounded-full text-xs font-bold {statusBadge(issue.status)}">
									{issue.status}
								</span>
							</div>

							<p class="text-gray-500 text-sm mb-2 line-clamp-2">{issue.description || issue.details || 'No description provided.'}</p>

							<div class="flex flex-wrap gap-4 text-xs text-gray-400">
								<span class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm">apartment</span>
									{issue.propertyTitle || 'Property'}
								</span>
								<span class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm">person</span>
									{issue.tenantName || issue.tenantId || 'Tenant'}
								</span>
								<span class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm">schedule</span>
									{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
								</span>
							</div>

							<!-- Action buttons — only for active (non-Resolved) issues -->
							{#if issue.status !== 'Resolved'}
								<div class="mt-4 flex flex-wrap gap-3">
									{#if issue.status === 'Pending'}
										<button
											onclick={() => updateStatus(issue.id, 'In Progress')}
											disabled={updatingId === issue.id}
											class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50">
											{#if updatingId === issue.id}
												<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											{:else}
												<span class="material-symbols-outlined text-base">engineering</span>
											{/if}
											Mark In Progress
										</button>
									{:else if issue.status === 'In Progress'}
										<button
											onclick={() => updateStatus(issue.id, 'Fixed')}
											disabled={updatingId === issue.id}
											class="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all disabled:opacity-50">
											{#if updatingId === issue.id}
												<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											{:else}
												<span class="material-symbols-outlined text-base">check</span>
											{/if}
											Mark as Fixed
										</button>
									{:else if issue.status === 'Fixed'}
										<div class="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-sm">
											<span class="material-symbols-outlined text-base">hourglass_top</span>
											Waiting for tenant confirmation
										</div>
									{/if}
								</div>
							{:else}
								<div class="mt-4 flex items-center gap-2 text-sm text-green-600 font-semibold">
									<span class="material-symbols-outlined text-base filled">check_circle</span>
									Resolved and closed
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>