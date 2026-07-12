<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const adminLinks = [
		{ name: 'Dashboard Overview', href: '/admin' },
		{ name: 'User Management', href: '/admin/users' },
		{ name: 'Property Approvals', href: '/admin/approvals' },
		{ name: 'System Reports', href: '/admin/reports' }
	];

	onMount(() => {
		const token = localStorage.getItem('token');
		const user = JSON.parse(localStorage.getItem('rentora_user') || '{}');

		if (!token) {
			goto('/login');
			return;
		}

		if (user.role !== 'admin') {
			goto('/login');
		}
	});
</script>

<div class="flex">
	<Sidebar role="admin" links={adminLinks} />

	<main class="flex-1 p-8 min-h-screen">
		{@render children()}
	</main>
</div>