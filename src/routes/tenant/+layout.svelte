<script>
	import { goto } from '$app/navigation';
	import { authUser, authLoading } from '$lib/stores/auth.js';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const tenantLinks = [
		{ name: 'Overview', href: '/tenant', icon: 'dashboard' },
		{ name: 'Browse Properties', href: '/tenant/browse', icon: 'search' },
		{ name: 'My Applications', href: '/tenant/requests', icon: 'assignment' },
		{ name: 'My Rental', href: '/tenant/property', icon: 'home' },
		{ name: 'Payments', href: '/tenant/payments', icon: 'payments' },
		{ name: 'Maintenance', href: '/tenant/maintenance', icon: 'build' }
	];

	$effect(() => {
		if (!$authLoading) {
			if (!$authUser) goto('/login');
			else if ($authUser.role !== 'tenant') goto('/' + $authUser.role);
		}
	});
</script>

{#if $authLoading}
	<div class="flex items-center justify-center min-h-screen bg-rentora-grayLight">
		<div class="flex flex-col items-center gap-3">
			<div class="w-10 h-10 rounded-full border-4 border-rentora-purple border-t-transparent animate-spin"></div>
			<p class="text-gray-500 text-sm font-medium">Loading...</p>
		</div>
	</div>
{:else if $authUser && $authUser.role === 'tenant'}
	<div class="flex min-h-screen">
		<Sidebar role="tenant" links={tenantLinks} />
		<main class="flex-1 p-8 min-h-screen bg-rentora-grayLight overflow-y-auto">
			{@render children()}
		</main>
	</div>
{/if}