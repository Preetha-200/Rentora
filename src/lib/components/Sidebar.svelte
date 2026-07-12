<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { logout } from '$lib/stores/auth.js';

	let { role = 'Tenant', links = [] } = $props();

	let user = $state(null);
	let collapsed = $state(false);

	if (typeof window !== 'undefined') {
		const storedUser = localStorage.getItem('rentora_user');
		if (storedUser) user = JSON.parse(storedUser);
		window.addEventListener('storage', () => {
			const updated = localStorage.getItem('rentora_user');
			user = updated ? JSON.parse(updated) : null;
		});
	}

	async function handleLogout() {
		await logout();
	}

	const initials = $derived(user?.name?.charAt(0)?.toUpperCase() || '?');

	const roleColors = {
		admin: 'from-rentora-dark to-rentora-blue',
		owner: 'from-rentora-blue to-rentora-purple',
		tenant: 'from-rentora-purple to-rentora-dark'
	};

	const roleGradient = $derived(roleColors[role] || roleColors.tenant);
</script>

<aside class="w-64 bg-rentora-dark text-white min-h-screen flex flex-col shadow-2xl border-r border-slate-700/50 transition-all duration-300">
	<!-- User profile section -->
	<div class="relative p-6 border-b border-slate-700/50 overflow-hidden">
		<!-- Background decoration -->
		<div class="absolute inset-0 bg-gradient-to-br {roleGradient} opacity-20"></div>
		<div class="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

		<div class="relative flex flex-col items-center text-center">
			<div class="w-16 h-16 rounded-full bg-gradient-to-br {roleGradient} flex items-center justify-center text-2xl font-bold shadow-lg mb-3 border-2 border-white/20">
				{initials}
			</div>
			<h2 class="text-base font-bold truncate w-full text-center">{user?.name || 'User'}</h2>
			<p class="text-xs text-slate-400 truncate w-full text-center mt-0.5">{user?.email || ''}</p>
			<span class="mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/20 text-slate-300">
				{role} Portal
			</span>
		</div>
	</div>

	<!-- Navigation links -->
	<nav class="flex-1 p-4 space-y-1 overflow-y-auto">
		{#each links as link}
			{@const isActive = $page.url.pathname === link.href}
			<a
				href={link.href}
				class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
					{isActive
						? 'bg-rentora-purple text-white shadow-lg shadow-rentora-purple/30'
						: 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
					}">
				<span class="material-symbols-outlined text-lg transition-transform duration-200 group-hover:scale-110 {isActive ? 'filled' : ''}">
					{link.icon || 'circle'}
				</span>
				<span>{link.name}</span>
				{#if isActive}
					<span class="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom section -->
	<div class="p-4 border-t border-slate-700/50 space-y-2">
		<!-- Quick stats or help -->
		<a href="/notifications" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-200 text-sm group">
			<span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">notifications</span>
			<span>Notifications</span>
		</a>

		<button
			onclick={handleLogout}
			class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-white hover:bg-red-600/20 transition-all duration-200 text-sm group font-medium">
			<span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">logout</span>
			<span>Sign Out</span>
		</button>
	</div>
</aside>