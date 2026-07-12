<script>
	import { goto } from '$app/navigation';
	import { authUser, authLoading } from '$lib/stores/auth.js';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const adminLinks = [
		{ name: 'Dashboard', href: '/admin', icon: 'dashboard' },
		{ name: 'User Management', href: '/admin/users', icon: 'group' },
		{ name: 'Property Approvals', href: '/admin/approvals', icon: 'approval' },
		{ name: 'System Reports', href: '/admin/reports', icon: 'bar_chart' }
	];

	$effect(() => {
		if (!$authLoading) {
			if (!$authUser) goto('/login');
			else if ($authUser.role !== 'admin') goto('/' + $authUser.role);
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
{:else if $authUser && $authUser.role === 'admin'}
	<div class="flex min-h-screen">
		<Sidebar role="admin" links={adminLinks} />
		<main class="flex-1 p-8 min-h-screen bg-rentora-grayLight overflow-y-auto">
			{@render children()}
		</main>
	</div>
{/if}