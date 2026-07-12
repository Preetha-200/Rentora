<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { initAuth } from '$lib/stores/auth.js';

	let { children } = $props();

	onMount(() => {
		initAuth();
	});
</script>

<div class="min-h-screen bg-rentora-grayLight text-rentora-dark font-sans">
	<Navbar />
	<main>
		{@render children()}
	</main>
</div>