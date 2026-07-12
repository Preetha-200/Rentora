<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const tenantLinks = [
		{ name: 'Overview', href: '/tenant' },
		{ name: 'Browse Properties', href: '/tenant/browse' },
		{ name: 'My Applications', href: '/tenant/requests' },
		{ name: 'My Rental', href: '/tenant/property' },
		{ name: 'Make Payments', href: '/tenant/payments' },
		{ name: 'Maintenance Log', href: '/tenant/maintenance' }
	];

	onMount(() => {
		const token = localStorage.getItem('token');
		const user = JSON.parse(localStorage.getItem('rentora_user') || '{}');

		if (!token) {
			goto('/login');
			return;
		}

		if (user.role !== 'tenant') {
			goto('/login');
		}
	});
</script>

<div class="flex">
	<Sidebar role="tenant" links={tenantLinks} />

	<main class="flex-1 p-8 min-h-screen">
		{@render children()}
	</main>
</div>