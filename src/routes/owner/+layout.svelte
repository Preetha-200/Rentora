<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const ownerLinks = [
		{ name: 'Dashboard Summary', href: '/owner' },
		{ name: 'My Properties', href: '/owner/properties' },
		{ name: 'Rental Requests', href: '/owner/requests' },
		{ name: 'Agreements', href: '/owner/agreements' },
		{ name: 'Payments Tracking', href: '/owner/payments' },
		{ name: 'Maintenance Issues', href: '/owner/maintenance' }
	];

	onMount(() => {
		const token = localStorage.getItem('rentora_token');
		const user = JSON.parse(localStorage.getItem('rentora_user') || '{}');

		if (!token) {
			goto('/login');
			return;
		}

		if (user.role !== 'owner') {
			goto('/login');
		}
	});
</script>

<div class="flex">
	<Sidebar role="Owner" links={ownerLinks} />

	<main class="flex-1 p-8 min-h-screen">
		{@render children()}
	</main>
</div>