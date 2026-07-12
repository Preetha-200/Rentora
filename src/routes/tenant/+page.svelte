<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';

	let requests = $state([]);
	let issues = $state([]);
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
		fixed: issues.filter((i) => i.status === 'Fixed').length,
		resolved: issues.filter((i) => i.status === 'Resolved').length
	});

	async function loadDashboard() {
		loading = true;
		error = '';
		try {
			const [reqData, mainData] = await Promise.allSettled([
				api.get('/api/rental-requests?mine=true'),
				api.get('/api/maintenance?tenant=true')
			]);

			requests = reqData.status === 'fulfilled'
				? (Array.isArray(reqData.value) ? reqData.value : [])
				: [];
			issues = mainData.status === 'fulfilled'
				? (Array.isArray(mainData.value) ? mainData.value : mainData.value?.complaints || [])
				: [];
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadDashboard);

	const activeRental = $derived(requests.find((r) => r.status === 'Approved'));
</script>

<svelte:head>
	<title>Tenant Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-7xl mx-auto animate-fade-in">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">
			Welcome, {$authUser?.name?.split(' ')[0] || 'Tenant'} 👋
		</h1>
		<p class="text-gray-500 mt-1">Manage your rental and maintenance from here.</p>
	</div>

	{#if loading}
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{#each [1,2,3,4] as _}
				<div class="skeleton h-32 rounded-2xl"></div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else}
		<!-- Stats -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{#each [
				{ label: 'My Applications', value: requests.length, icon: 'assignment', color: 'from-rentora-dark to-rentora-blue', href: '/tenant/requests' },
				{ label: 'Approved', value: requestStats.approved, icon: 'check_circle', color: 'from-emerald-500 to-green-600', href: '/tenant/requests' },
				{ label: 'Maintenance Open', value: maintenanceStats.pending + maintenanceStats.inProgress, icon: 'build', color: 'from-amber-500 to-orange-500', href: '/tenant/maintenance' },
				{ label: 'Awaiting Confirmation', value: maintenanceStats.fixed, icon: 'task_alt', color: 'from-rentora-purple to-rentora-purpleLight', href: '/tenant/maintenance' }
			] as stat}
				<a href={stat.href} class="stat-card group relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
					<div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br {stat.color} opacity-10 translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity"></div>
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br {stat.color} flex items-center justify-center mb-4 shadow-lg">
						<span class="material-symbols-outlined text-white text-xl filled">{stat.icon}</span>
					</div>
					<div class="text-3xl font-black text-rentora-dark">{stat.value}</div>
					<div class="text-sm font-medium text-gray-500 mt-1">{stat.label}</div>
				</a>
			{/each}
		</div>

		<!-- Active rental banner -->
		{#if activeRental}
			<div class="bg-gradient-to-r from-rentora-dark to-rentora-blue rounded-2xl p-6 mb-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
						<span class="material-symbols-outlined text-white text-2xl filled">home</span>
					</div>
					<div>
						<p class="text-white/70 text-sm font-medium">Your Current Rental</p>
						<h3 class="text-xl font-black">{activeRental.propertyTitle}</h3>
						<p class="text-white/60 text-sm mt-0.5">Approved · Active lease</p>
					</div>
				</div>
				<a href="/tenant/property" class="shrink-0 px-5 py-2.5 bg-white/15 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/25 transition-all text-sm">
					View Details
				</a>
			</div>
		{:else}
			<div class="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 mb-8 text-center">
				<span class="material-symbols-outlined text-5xl text-gray-300 block mb-3">home_work</span>
				<h3 class="font-bold text-lg text-gray-600">No Active Rental</h3>
				<p class="text-gray-400 text-sm mt-1 mb-4">Browse available properties and submit a rental request.</p>
				<a href="/tenant/browse" class="inline-flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold text-sm hover:bg-rentora-purpleLight transition-all">
					<span class="material-symbols-outlined text-base">search</span>
					Browse Properties
				</a>
			</div>
		{/if}

		<!-- Two columns -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- My Applications -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">My Applications</h2>
						<p class="text-xs text-gray-400 mt-0.5">Your rental requests</p>
					</div>
					<a href="/tenant/requests" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						View all <span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if requests.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">assignment</span>
							No applications yet
						</div>
					{:else}
						{#each requests.slice(0, 5) as req}
							<div class="px-6 py-4 flex justify-between items-center">
								<div>
									<p class="font-semibold text-sm text-rentora-dark line-clamp-1">{req.propertyTitle}</p>
									<p class="text-xs text-gray-400 mt-0.5">
										{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
									</p>
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

			<!-- Maintenance -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">Maintenance</h2>
						<p class="text-xs text-gray-400 mt-0.5">Your reported issues</p>
					</div>
					<a href="/tenant/maintenance" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						View all <span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if issues.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">build</span>
							No issues reported
						</div>
					{:else}
						{#each issues.slice(0, 5) as issue}
							<div class="px-6 py-4 flex justify-between items-center">
								<div>
									<p class="font-semibold text-sm text-rentora-dark line-clamp-1">{issue.title || issue.issue || 'Issue'}</p>
									<p class="text-xs text-gray-400 mt-0.5">{issue.propertyTitle || ''}</p>
									{#if issue.status === 'Fixed'}
										<p class="text-xs text-amber-600 font-semibold mt-0.5">⚡ Awaiting your confirmation</p>
									{/if}
								</div>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0
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
	{/if}
</div>
