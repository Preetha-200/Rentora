<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let users = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let filterRole = $state('All');
	let processingId = $state('');
	let successMsg = $state('');

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/admin/users');
			users = Array.isArray(data) ? data : data?.users || [];
		} catch (err) {
			error = err.message;
			users = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	async function toggleUser(user) {
		processingId = user.id;
		try {
			await api.patch(`/api/admin/users/${user.id}`, {
				disabled: !user.disabled
			});
			successMsg = `User ${!user.disabled ? 'disabled' : 'enabled'} successfully.`;
			await loadUsers();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			processingId = '';
		}
	}

	const stats = $derived({
		total: users.length,
		owners: users.filter((u) => u.role === 'owner').length,
		tenants: users.filter((u) => u.role === 'tenant').length,
		admins: users.filter((u) => u.role === 'admin').length
	});

	const filteredUsers = $derived(
		users.filter((u) => {
			const q = searchQuery.toLowerCase();
			const matchSearch =
				!searchQuery ||
				u.name?.toLowerCase().includes(q) ||
				u.email?.toLowerCase().includes(q);
			const matchRole = filterRole === 'All' || u.role === filterRole;
			return matchSearch && matchRole;
		})
	);

	function roleBadge(role) {
		const map = {
			admin: 'bg-rentora-purplePale text-rentora-purple border-rentora-purple/20',
			owner: 'bg-blue-50 text-blue-600 border-blue-200',
			tenant: 'bg-green-50 text-green-600 border-green-200'
		};
		return map[role] || 'bg-gray-100 text-gray-600 border-gray-200';
	}

	function avatarColor(role) {
		const map = {
			admin: 'from-rentora-purple to-rentora-dark',
			owner: 'from-blue-500 to-blue-700',
			tenant: 'from-emerald-500 to-green-700'
		};
		return map[role] || 'from-gray-500 to-gray-700';
	}
</script>

<svelte:head>
	<title>User Management — Admin — Rentora</title>
</svelte:head>

<div class="max-w-6xl mx-auto animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">User Management</h1>
		<p class="text-gray-500 mt-1">View and manage all registered users on the platform.</p>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	{#if !loading}
		<!-- Stats -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
			{#each [
				{ label: 'Total Users', value: stats.total, icon: 'group', color: 'from-rentora-dark to-rentora-blue' },
				{ label: 'Owners', value: stats.owners, icon: 'apartment', color: 'from-blue-500 to-blue-700' },
				{ label: 'Tenants', value: stats.tenants, icon: 'person', color: 'from-emerald-500 to-green-600' },
				{ label: 'Admins', value: stats.admins, icon: 'admin_panel_settings', color: 'from-rentora-purple to-rentora-purpleLight' }
			] as s}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br {s.color} flex items-center justify-center shrink-0 shadow-lg">
						<span class="material-symbols-outlined text-white text-xl filled">{s.icon}</span>
					</div>
					<div>
						<div class="text-2xl font-black text-rentora-dark">{s.value}</div>
						<div class="text-xs text-gray-400 font-medium">{s.label}</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row gap-4">
			<div class="flex-1 relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-gray-400">search</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name or email..."
					class="input-field pl-10" />
			</div>
			<div class="flex gap-2 flex-wrap">
				{#each ['All', 'tenant', 'owner', 'admin'] as role}
					<button
						onclick={() => (filterRole = role)}
						class="px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all
							{filterRole === role
								? 'bg-rentora-dark text-white shadow-md'
								: 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-rentora-purple hover:text-rentora-purple'}">
						{role}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="bg-white rounded-2xl shadow-card overflow-hidden">
			{#each [1,2,3,4,5] as _}
				<div class="flex items-center gap-4 px-6 py-4 border-b border-gray-50 animate-pulse">
					<div class="skeleton w-11 h-11 rounded-full shrink-0"></div>
					<div class="flex-1 space-y-2">
						<div class="skeleton h-4 w-1/3 rounded"></div>
						<div class="skeleton h-3 w-1/2 rounded"></div>
					</div>
					<div class="skeleton h-6 w-16 rounded-full"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if filteredUsers.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">
				{searchQuery ? 'search_off' : 'group'}
			</span>
			<h3 class="text-xl font-bold text-gray-600">
				{searchQuery ? 'No users match your search' : 'No users found'}
			</h3>
		</div>
	{:else}
		<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
			<!-- Table header -->
			<div class="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
				<span>User</span>
				<span>Role</span>
				<span>Joined</span>
				<span>Actions</span>
			</div>

			<div class="divide-y divide-gray-50">
				{#each filteredUsers as user (user.id)}
					<div class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center">
						<!-- Avatar + info -->
						<div class="flex items-center gap-3 min-w-0">
							<div class="w-11 h-11 rounded-full bg-gradient-to-br {avatarColor(user.role)} text-white flex items-center justify-center text-base font-bold shrink-0">
								{user.name?.charAt(0)?.toUpperCase() || '?'}
							</div>
							<div class="min-w-0">
								<p class="font-semibold text-rentora-dark truncate">{user.name}</p>
								<p class="text-sm text-gray-400 truncate">{user.email}</p>
								{#if user.phone}
									<p class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
										<span class="material-symbols-outlined text-xs">phone</span>
										{user.phone}
									</p>
								{/if}
							</div>
						</div>

						<!-- Role badge -->
						<div>
							<span class="inline-flex text-xs font-bold px-2.5 py-1.5 rounded-full border capitalize {roleBadge(user.role)}">
								{user.role}
							</span>
						</div>

						<!-- Joined date -->
						<div class="text-sm text-gray-400">
							{user.createdAt
								? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
								: '—'}
						</div>

						<!-- Actions -->
						<div class="flex gap-2">
							{#if user.role !== 'admin'}
								<button
									onclick={() => toggleUser(user)}
									disabled={processingId === user.id}
									class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all
										{user.disabled
											? 'border-green-200 text-green-600 hover:bg-green-50'
											: 'border-red-200 text-red-600 hover:bg-red-50'}
										disabled:opacity-50">
									{#if processingId === user.id}
										<div class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
									{:else}
										<span class="material-symbols-outlined text-sm">{user.disabled ? 'lock_open' : 'block'}</span>
									{/if}
									{user.disabled ? 'Enable' : 'Disable'}
								</button>
							{:else}
								<span class="flex items-center gap-1 text-xs text-gray-400 px-3 py-2">
									<span class="material-symbols-outlined text-sm">shield</span>
									Protected
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<p class="text-center text-sm text-gray-400 mt-4">
			Showing {filteredUsers.length} of {users.length} users
		</p>
	{/if}
</div>
