<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let user = $state(null);
	let drawerOpen = $state(false);
	let unreadNotifications = $state(0);

	function loadUser() {
		if (typeof window === 'undefined') return;
		const storedUser = localStorage.getItem('rentora_user');
		user = storedUser ? JSON.parse(storedUser) : null;
	}

	async function loadNotifications() {
		if (!user) return;
		try {
			const data = await api.get('/api/notifications');
			unreadNotifications = data.unread || 0;
		} catch {
			unreadNotifications = 0;
		}
	}

	onMount(async () => {
		loadUser();
		await loadNotifications();
		window.addEventListener('storage', loadUser);
		return () => window.removeEventListener('storage', loadUser);
	});

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
	}

	function closeDrawer() {
		drawerOpen = false;
	}

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('rentora_user');
		drawerOpen = false;
		user = null;
		unreadNotifications = 0;
		goto('/');
	}

	function openProfile() {
		closeDrawer();
		goto('/profile');
	}

	function openDashboard() {
		closeDrawer();
		switch (user.role) {
			case 'owner':
				goto('/owner');
				break;
			case 'tenant':
				goto('/tenant');
				break;
			case 'admin':
				goto('/admin');
				break;
			default:
				goto('/');
		}
	}

	function openNotifications() {
		closeDrawer();
		goto('/notifications');
	}
</script>

<nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
	<div class="max-w-7xl mx-auto h-24 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<a href="/" class="flex items-center gap-4">
			<img src="/logo.png" alt="Rentora Logo" class="w-20 h-16 object-contain bg-white p-1 rounded-xl border border-gray-100 shadow-sm" />
			<span class="text-2xl font-black tracking-wider text-rentora-dark">RENTORA</span>
		</a>

		{#if user}
			<div class="flex items-center gap-4">
				<button on:click={openNotifications} title="Notifications" class="relative w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-xl">
					🔔
					{#if unreadNotifications > 0}
						<span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
							{unreadNotifications}
						</span>
					{/if}
				</button>

				<button on:click={toggleDrawer} title={user.name} class="w-11 h-11 rounded-full bg-rentora-purple text-white flex items-center justify-center text-lg font-bold hover:scale-105 transition">
					{user.name.charAt(0).toUpperCase()}
				</button>
			</div>
		{:else}
			<div class="flex gap-4">
				<a href="/login" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-rentora-dark hover:text-rentora-purple transition">Sign In</a>
				<a href="/register" class="px-5 py-2.5 rounded-xl bg-rentora-purple text-white text-sm font-semibold hover:bg-rentora-purpleLight transition">Get Started</a>
			</div>
		{/if}
	</div>
</nav>

{#if drawerOpen}
	<button class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" on:click={closeDrawer} aria-label="Close Menu" />

	<aside class="fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-50 flex flex-col">
		<div class="bg-rentora-purple text-white p-8 flex flex-col items-center">
			<div class="w-20 h-20 rounded-full bg-white text-rentora-purple flex items-center justify-center text-3xl font-bold shadow">
				{user.name.charAt(0).toUpperCase()}
			</div>

			<h2 class="mt-4 text-xl font-bold">{user.name}</h2>
			<p class="text-sm opacity-90 break-all">{user.email}</p>
			<span class="mt-3 px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-white/20">{user.role}</span>
		</div>

		<div class="flex-1 p-6 space-y-2">
			<button on:click={openDashboard} class="w-full flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-gray-100 transition font-medium">
				🏠 Dashboard
			</button>

			<button on:click={openProfile} class="w-full flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-gray-100 transition font-medium">
				👤 My Profile
			</button>

			<button on:click={openNotifications} class="w-full flex items-center justify-between px-5 py-4 rounded-xl hover:bg-gray-100 transition font-medium">
				<div class="flex items-center gap-3">🔔 Notifications</div>
				{#if unreadNotifications > 0}
					<span class="px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">{unreadNotifications}</span>
				{/if}
			</button>
		</div>

		<div class="border-t p-6">
			<button on:click={logout} class="w-full py-3 rounded-xl bg-rentora-dark text-white font-semibold hover:opacity-90 transition">
				Logout
			</button>
		</div>
	</aside>
{/if}