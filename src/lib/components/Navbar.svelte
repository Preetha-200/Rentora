<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { authUser, logout } from '$lib/stores/auth.js';
	import { api } from '$lib/api';

	let drawerOpen = $state(false);
	let scrolled = $state(false);
	let unreadNotifications = $state(0);
	let notifLoading = $state(false);

	async function loadNotifications() {
		if (!$authUser) return;
		try {
			const data = await api.get('/api/notifications');
			unreadNotifications = data.unread || 0;
		} catch {
			unreadNotifications = 0;
		}
	}

	onMount(() => {
		const handleScroll = () => { scrolled = window.scrollY > 10; };
		window.addEventListener('scroll', handleScroll, { passive: true });

		loadNotifications();

		return () => window.removeEventListener('scroll', handleScroll);
	});

	$effect(() => {
		if ($authUser) loadNotifications();
		else unreadNotifications = 0;
	});

	function toggleDrawer() { drawerOpen = !drawerOpen; }
	function closeDrawer() { drawerOpen = false; }

	async function handleLogout() {
		closeDrawer();
		await logout();
	}

	function openDashboard() {
		closeDrawer();
		if (!$authUser) return;
		const routes = { admin: '/admin', owner: '/owner', tenant: '/tenant' };
		goto(routes[$authUser.role] || '/');
	}

	function openProfile() {
		closeDrawer();
		goto('/profile');
	}

	function openNotifications() {
		closeDrawer();
		goto('/notifications');
	}

	const initials = $derived($authUser ? $authUser.name?.charAt(0)?.toUpperCase() || '?' : '?');
</script>

<nav class="sticky top-0 z-50 transition-all duration-300 {scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-white shadow-sm border-b border-gray-100'}">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-20">

			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 group" aria-label="Rentora Home">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rentora-dark to-rentora-blue flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
					<span class="material-symbols-outlined text-white text-lg filled">apartment</span>
				</div>
				<div class="flex flex-col leading-tight">
					<span class="text-xl font-black tracking-widest text-rentora-dark">RENTORA</span>
					<span class="text-[10px] font-semibold text-rentora-purple tracking-widest uppercase">Smart Rentals</span>
				</div>
			</a>

			<!-- Right section -->
			{#if $authUser}
				<div class="flex items-center gap-3">
					<!-- Notifications bell -->
					<button
						onclick={openNotifications}
						title="Notifications"
						class="relative w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-center hover:border-rentora-purple group"
						aria-label="Notifications">
						<span class="material-symbols-outlined text-xl text-gray-600 group-hover:text-rentora-purple transition-colors">notifications</span>
						{#if unreadNotifications > 0}
							<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rentora-purple text-white text-[10px] font-bold flex items-center justify-center animate-pulse-ring">
								{unreadNotifications > 99 ? '99+' : unreadNotifications}
							</span>
						{/if}
					</button>

					<!-- Avatar button -->
					<button
						onclick={toggleDrawer}
						title={$authUser.name}
						class="w-10 h-10 rounded-full bg-gradient-to-br from-rentora-purple to-rentora-dark text-white flex items-center justify-center text-sm font-bold hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
						aria-label="User menu">
						{initials}
					</button>
				</div>
			{:else}
				<div class="flex items-center gap-2">
					<a href="/login" class="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-rentora-dark hover:bg-gray-50 transition-all duration-200">
						Sign In
					</a>
					<a href="/register" class="px-5 py-2.5 rounded-xl bg-rentora-purple text-white text-sm font-semibold hover:bg-rentora-purpleLight transition-all duration-200 shadow-sm hover:shadow-md">
						Get Started
					</a>
				</div>
			{/if}
		</div>
	</div>
</nav>

<!-- Drawer overlay -->
{#if drawerOpen}
	<button
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-default"
		onclick={closeDrawer}
		aria-label="Close menu">
	</button>

	<aside class="fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-50 flex flex-col animate-slide-right">
		<!-- User header -->
		<div class="bg-gradient-to-br from-rentora-dark via-rentora-blue to-rentora-purple text-white p-8 flex flex-col items-center relative overflow-hidden">
			<!-- Background decoration -->
			<div class="absolute inset-0 opacity-10">
				<div class="absolute top-4 right-4 w-20 h-20 rounded-full bg-white"></div>
				<div class="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white -translate-x-1/2 translate-y-1/2"></div>
			</div>

			<div class="relative w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-bold shadow-lg">
				{initials}
			</div>
			<h2 class="mt-4 text-xl font-bold relative">{$authUser?.name}</h2>
			<p class="text-sm opacity-80 break-all relative">{$authUser?.email}</p>
			<span class="mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 border border-white/30 relative">
				{$authUser?.role}
			</span>
		</div>

		<!-- Menu items -->
		<div class="flex-1 p-4 space-y-1 overflow-y-auto">
			<button onclick={openDashboard} class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:text-rentora-dark group">
				<span class="material-symbols-outlined text-xl text-rentora-purple group-hover:scale-110 transition-transform">dashboard</span>
				Dashboard
			</button>

			<button onclick={openProfile} class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:text-rentora-dark group">
				<span class="material-symbols-outlined text-xl text-rentora-purple group-hover:scale-110 transition-transform">person</span>
				My Profile
			</button>

			<button onclick={openNotifications} class="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:text-rentora-dark group">
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-xl text-rentora-purple group-hover:scale-110 transition-transform">notifications</span>
					Notifications
				</div>
				{#if unreadNotifications > 0}
					<span class="px-2 py-0.5 rounded-full bg-rentora-purple text-white text-xs font-bold">{unreadNotifications}</span>
				{/if}
			</button>
		</div>

		<!-- Logout -->
		<div class="border-t border-gray-100 p-4">
			<button
				onclick={handleLogout}
				class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-red-600 font-semibold hover:bg-red-50 transition-all duration-200 border border-gray-200 hover:border-red-200 group">
				<span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">logout</span>
				Sign Out
			</button>
		</div>
	</aside>
{/if}