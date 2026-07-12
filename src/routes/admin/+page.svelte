<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';

	let loading = $state(true);
	let error = $state('');
	let stats = $state({
		pendingApprovals: 0,
		approvedProperties: 0,
		totalUsers: 0,
		totalOwners: 0,
		totalTenants: 0,
		totalProperties: 0
	});
	let recentProperties = $state([]);
	let recentUsers = $state([]);

	async function loadDashboard() {
		loading = true;
		error = '';
		try {
			const [propertiesData, usersData] = await Promise.allSettled([
				api.get('/api/properties'),
				api.get('/api/admin/users')
			]);

			const props = propertiesData.status === 'fulfilled'
				? (Array.isArray(propertiesData.value) ? propertiesData.value : [])
				: [];

			const users = usersData.status === 'fulfilled'
				? (Array.isArray(usersData.value) ? usersData.value : usersData.value?.users || [])
				: [];

			recentProperties = props.slice(0, 6);
			recentUsers = users.slice(0, 5);

			stats = {
				pendingApprovals: props.filter((p) => p.approvalStatus === 'Pending' || (!p.approvalStatus && p.status === 'Pending')).length,
				approvedProperties: props.filter((p) => p.approvalStatus === 'Approved' || p.status === 'Approved').length,
				totalProperties: props.length,
				totalUsers: users.length,
				totalOwners: users.filter((u) => u.role === 'owner').length,
				totalTenants: users.filter((u) => u.role === 'tenant').length
			};
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadDashboard);
</script>

<svelte:head>
	<title>Admin Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-7xl mx-auto animate-fade-in">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">
			Admin Dashboard
		</h1>
		<p class="text-gray-500 mt-1">Platform overview and management controls.</p>
	</div>

	{#if loading}
		<div class="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			{#each [1,2,3,4,5,6] as _}
				<div class="skeleton h-32 rounded-2xl"></div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else}
		<!-- Stats grid -->
		<div class="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			{#each [
				{ label: 'Pending Approvals', value: stats.pendingApprovals, icon: 'pending_actions', color: 'from-amber-500 to-orange-500', href: '/admin/approvals', urgent: stats.pendingApprovals > 0 },
				{ label: 'Approved Properties', value: stats.approvedProperties, icon: 'apartment', color: 'from-emerald-500 to-green-600', href: '/admin/approvals' },
				{ label: 'Total Properties', value: stats.totalProperties, icon: 'domain', color: 'from-rentora-dark to-rentora-blue', href: '/admin/approvals' },
				{ label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'from-rentora-purple to-rentora-purpleLight', href: '/admin/users' },
				{ label: 'Property Owners', value: stats.totalOwners, icon: 'business_center', color: 'from-blue-500 to-blue-600', href: '/admin/users' },
				{ label: 'Tenants', value: stats.totalTenants, icon: 'person', color: 'from-violet-500 to-purple-600', href: '/admin/users' }
			] as stat}
				<a href={stat.href} class="stat-card group relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
					{#if stat.urgent}
						<span class="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
					{/if}
					<div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br {stat.color} opacity-10 translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity"></div>
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br {stat.color} flex items-center justify-center mb-4 shadow-lg">
						<span class="material-symbols-outlined text-white text-xl filled">{stat.icon}</span>
					</div>
					<div class="text-3xl font-black text-rentora-dark">{stat.value}</div>
					<div class="text-sm font-medium text-gray-500 mt-1">{stat.label}</div>
				</a>
			{/each}
		</div>

		<!-- Quick actions -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			{#each [
				{ label: 'Review Property Approvals', icon: 'approval', href: '/admin/approvals', desc: 'Approve or reject pending listings', color: 'text-amber-600 bg-amber-50 border-amber-200' },
				{ label: 'Manage Users', icon: 'group', href: '/admin/users', desc: 'View and manage all user accounts', color: 'text-rentora-purple bg-rentora-purplePale border-rentora-purple/20' },
				{ label: 'System Reports', icon: 'bar_chart', href: '/admin/reports', desc: 'View platform-wide analytics', color: 'text-rentora-blue bg-blue-50 border-blue-200' }
			] as action}
				<a href={action.href} class="flex items-center gap-4 p-5 rounded-2xl border-2 {action.color} hover:scale-[1.02] transition-all duration-200 bg-white">
					<div class="w-12 h-12 rounded-xl {action.color} flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-xl filled">{action.icon}</span>
					</div>
					<div>
						<div class="font-bold text-sm text-rentora-dark">{action.label}</div>
						<div class="text-xs text-gray-400 mt-0.5">{action.desc}</div>
					</div>
					<span class="material-symbols-outlined text-gray-300 ml-auto">arrow_forward</span>
				</a>
			{/each}
		</div>

		<!-- Two columns: recent properties + users -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Recent Properties -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">Recent Listings</h2>
						<p class="text-xs text-gray-400 mt-0.5">Latest property submissions</p>
					</div>
					<a href="/admin/approvals" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						Review <span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if recentProperties.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">apartment</span>
							No properties yet
						</div>
					{:else}
						{#each recentProperties as prop}
							<div class="px-6 py-4 flex justify-between items-center">
								<div>
									<p class="font-semibold text-sm text-rentora-dark line-clamp-1">{prop.title}</p>
									<p class="text-xs text-gray-400 mt-0.5">{prop.city} · ₹{Number(prop.rent || 0).toLocaleString('en-IN')}/mo</p>
								</div>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0
									{(prop.approvalStatus || prop.status) === 'Approved' ? 'bg-green-100 text-green-700' :
									 (prop.approvalStatus || prop.status) === 'Rejected' ? 'bg-red-100 text-red-700' :
									 'bg-amber-100 text-amber-700'}">
									{prop.approvalStatus || prop.status || 'Pending'}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Recent Users -->
			<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
					<div>
						<h2 class="text-lg font-bold text-rentora-dark">Recent Users</h2>
						<p class="text-xs text-gray-400 mt-0.5">Latest registrations</p>
					</div>
					<a href="/admin/users" class="text-sm font-semibold text-rentora-purple hover:underline flex items-center gap-1">
						Manage <span class="material-symbols-outlined text-base">arrow_forward</span>
					</a>
				</div>
				<div class="divide-y divide-gray-50">
					{#if recentUsers.length === 0}
						<div class="py-10 text-center text-gray-400">
							<span class="material-symbols-outlined text-4xl block mb-2">group</span>
							No users yet
						</div>
					{:else}
						{#each recentUsers as u}
							<div class="px-6 py-4 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-full bg-gradient-to-br from-rentora-purple to-rentora-dark text-white flex items-center justify-center text-sm font-bold shrink-0">
										{u.name?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<div>
										<p class="font-semibold text-sm text-rentora-dark">{u.name}</p>
										<p class="text-xs text-gray-400 truncate max-w-[160px]">{u.email}</p>
									</div>
								</div>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full capitalize
									{u.role === 'admin' ? 'bg-rentora-purplePale text-rentora-purple' :
									 u.role === 'owner' ? 'bg-blue-50 text-blue-600' :
									 'bg-gray-100 text-gray-600'}">
									{u.role}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>