<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = $state(null);
	let drawerOpen = $state(false);

	function loadUser() {
		if (typeof window === 'undefined') return;

		const storedUser = localStorage.getItem('rentora_user');
		user = storedUser ? JSON.parse(storedUser) : null;
	}

	onMount(() => {
		loadUser();

		window.addEventListener('storage', loadUser);

		return () => {
			window.removeEventListener('storage', loadUser);
		};
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

		goto('/');
	}

	function openProfile() {
		drawerOpen = false;
		goto('/profile');
	}

	function openDashboard() {
		drawerOpen = false;

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
</script>

<nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex justify-between items-center">

		<a href="/" class="flex items-center space-x-4">
			<img
				src="/logo.png"
				alt="Rentora Logo"
				class="w-20 h-16 object-contain bg-white p-1 rounded-xl border border-gray-100 shadow-sm" />

			<span class="text-2xl font-black tracking-wider text-rentora-dark">
				RENTORA
			</span>
		</a>

		{#if user}
			<button
				on:click={toggleDrawer}
				title={user.name}
				class="w-11 h-11 rounded-full bg-rentora-purple text-white flex items-center justify-center text-lg font-bold hover:scale-105 transition">

				{user.name.charAt(0).toUpperCase()}

			</button>
		{:else}
			<div class="flex gap-4">
				<a
					href="/login"
					class="text-sm font-semibold text-rentora-dark hover:text-rentora-purple transition px-4 py-2.5 rounded-xl">

					Sign In

				</a>

				<a
					href="/register"
					class="text-sm font-semibold text-white bg-rentora-purple hover:bg-rentora-purpleLight transition px-5 py-2.5 rounded-xl">

					Get Started

				</a>
			</div>
		{/if}
	</div>
</nav>

{#if drawerOpen}
	<button
		class="fixed inset-0 bg-black/40 z-40"
		on:click={closeDrawer}
		aria-label="Close Menu">
	</button>

	<div
		class="fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-50 flex flex-col">

		<div class="bg-rentora-purple text-white p-8 flex flex-col items-center">

			<div class="w-20 h-20 rounded-full bg-white text-rentora-purple flex items-center justify-center text-3xl font-bold">

				{user.name.charAt(0).toUpperCase()}

			</div>

			<h2 class="mt-4 text-xl font-bold">
				{user.name}
			</h2>

			<p class="text-sm opacity-90">
				{user.email}
			</p>

			<span class="mt-2 text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">

				{user.role}

			</span>

		</div>

		<div class="flex-1 p-6 space-y-3">

			<button on:click={openProfile}
				class="w-full text-left px-5 py-4 rounded-xl hover:bg-gray-100 transition font-medium">
				My Profile
			</button>

			<button on:click={openDashboard}
				class="w-full text-left px-5 py-4 rounded-xl hover:bg-gray-100 transition font-medium">
				Dashboard
			</button>

		</div>

		<div class="p-6 border-t">
			<button on:click={logout}
				class="w-full py-3 rounded-xl bg-rentora-dark text-white font-semibold hover:bg-rentora-dark transition">
				Logout
			</button>
		</div>

	</div>
{/if}