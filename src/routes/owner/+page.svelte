<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';

	let requests = $state([]);
	let issues = $state([]);
	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');

	let requestStats = $derived({
		pending: requests.filter((r) => r.status === 'Pending').length,
		approved: requests.filter((r) => r.status === 'Approved').length,
		rejected: requests.filter((r) => r.status === 'Rejected').length
	});

	let maintenanceStats = $derived({
		pending: issues.filter((i) => i.status === 'Pending').length,
		inProgress: issues.filter((i) => i.status === 'In Progress').length,
		fixed: issues.filter((i) => ['Fixed', 'Resolved'].includes(i.status)).length
	});

	async function loadDashboard() {
		loading = true;
		error = '';
		try {
			const [reqData, mainData, propData] = await Promise.allSettled([
				api.get('/api/rental-requests?owner=true'),
				api.get('/api/maintenance'),
				api.get('/api/properties?mine=true')
			]);

			requests = reqData.status === 'fulfilled' ? (Array.isArray(reqData.value) ? reqData.value : []) : [];
			issues = mainData.status === 'fulfilled' ? (mainData.value.complaints || mainData.value || []) : [];
			properties = propData.status === 'fulfilled' ? (Array.isArray(propData.value) ? propData.value : []) : [];
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadDashboard);
</script>

<svelte:head>
	<title>Owner Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-7xl mx-auto animate-fade-in">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">
			Good day, {$authUser?.name?.split(' ')[0] || 'Owner'} 👋
		</h1>
		<p class="text-gray-500 mt-1">Here's an overview of your rental portfolio.</p>
	</div>

	{#if loading}
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{#each [1,2,3,4] as _}
				<div class="skeleton h-32 rounded-2xl"></div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500 text-xl">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{#each [
				{ label: 'Total Properties', value: properties.length, icon: 'apartment', color: 'from-rentora-dark to-rentora-blue', href: '/owner/properties' },
				{ label: 'Pending Requests', value: requestStats.pending, icon: 'inbox', color: 'from-amber-500 to-orange-500', href: '/owner/requests' },
				{ label: 'Active Rentals', value: requestStats.approved, icon: 'home', color: 'from-emerald-500 to-green-600', href: '/owner/requests' },
				{ label: 'Maintenance Pending', value: maintenanceStats.pending, icon: 'build', color: 'from-rentora-purple to-rentora-purpleLight', href: '/owner/maintenance' }
			] as stat}
				<a
					href={stat.href}
					class="stat-card group overflow-hidden relative cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
					<div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br {stat.color} opacity-10 translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity"></div>
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br {stat.color} flex items-center justify-center mb-4 shadow-lg">
						<span class="material-symbols-outlined text-white text-xl filled">{stat.icon}</span>
					</div>
					<div class="text-3xl font-black text-rentora-dark">{stat.value}</div>
					<div class="text-sm font-medium text-gray-500 mt-1">{stat.label}</div>
				</a>
			{/each}
		</div>

		<!-- Two-column layout -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Recent Requests -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">Recent Requests</h2>
						<p class="text-xs text-gray-400 mt-0.5">Incoming rental applications</p>
					</div>
					<a href="/owner/requests" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						View all
						<span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if requests.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">inbox</span>
							No requests yet
						</div>
					{:else}
						{#each requests.slice(0, 5) as req}
							<div class="px-6 py-4 flex justify-between items-center">
								<div>
									<p class="font-semibold text-sm text-rentora-dark line-clamp-1">{req.propertyTitle}</p>
									<p class="text-xs text-gray-400 mt-0.5">{req.tenantName || req.tenantId}</p>
								</div>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full
									{req.status === 'Approved' ? 'bg-green-100 text-green-700' :
									 req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
									 'bg-amber-100 text-amber-700'}">
									{req.status}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Maintenance Issues -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">Maintenance Issues</h2>
						<p class="text-xs text-gray-400 mt-0.5">Tenant-reported problems</p>
					</div>
					<a href="/owner/maintenance" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						View all
						<span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if issues.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">build</span>
							No maintenance issues
						</div>
					{:else}
						{#each issues.slice(0, 5) as issue}
							<div class="px-6 py-4 flex justify-between items-center">
								<div>
									<p class="font-semibold text-sm text-rentora-dark line-clamp-1">{issue.title || issue.issue || 'Issue'}</p>
									<p class="text-xs text-gray-400 mt-0.5">{issue.propertyTitle || ''}</p>
								</div>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full
									{issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
									 issue.status === 'Fixed' ? 'bg-blue-100 text-blue-700' :
									 issue.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
									 'bg-amber-100 text-amber-700'}">
									{issue.status}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<!-- Properties summary -->
		{#if properties.length > 0}
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mt-8">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">My Properties</h2>
						<p class="text-xs text-gray-400 mt-0.5">{properties.length} total listing{properties.length !== 1 ? 's' : ''}</p>
					</div>
					<a href="/owner/properties" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						Manage
						<span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
					{#each properties.slice(0, 3) as prop}
						<div class="flex items-center gap-4 p-4 rounded-xl bg-rentora-grayLight border border-gray-100">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rentora-dark to-rentora-blue flex items-center justify-center shrink-0">
								<span class="material-symbols-outlined text-white filled">apartment</span>
							</div>
							<div class="min-w-0">
								<p class="font-semibold text-sm text-rentora-dark truncate">{prop.title}</p>
								<p class="text-xs text-gray-400 truncate">{prop.city}</p>
								<span class="text-xs font-bold {prop.approvalStatus === 'Approved' ? 'text-green-600' : prop.approvalStatus === 'Rejected' ? 'text-red-500' : 'text-amber-500'}">
									{prop.approvalStatus || prop.status || 'Pending'}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>