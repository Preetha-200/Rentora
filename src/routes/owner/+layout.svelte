<script>
	import { goto } from '$app/navigation';
	import { authUser, authLoading } from '$lib/stores/auth.js';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const ownerLinks = [
		{ name: 'Dashboard', href: '/owner', icon: 'dashboard' },
		{ name: 'My Properties', href: '/owner/properties', icon: 'apartment' },
		{ name: 'Rental Requests', href: '/owner/requests', icon: 'assignment' },
		{ name: 'Agreements', href: '/owner/agreements', icon: 'description' },
		{ name: 'Payments', href: '/owner/payments', icon: 'payments' },
		{ name: 'Maintenance', href: '/owner/maintenance', icon: 'build' }
	];

	$effect(() => {
		if (!$authLoading) {
			if (!$authUser) goto('/login');
			else if ($authUser.role !== 'owner') goto('/' + $authUser.role);
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
{:else if $authUser && $authUser.role === 'owner'}
	<div class="flex min-h-screen">
		<Sidebar role="owner" links={ownerLinks} />
		<main class="flex-1 p-8 min-h-screen bg-rentora-grayLight overflow-y-auto">
			{@render children()}
		</main>
	</div>
{/if}