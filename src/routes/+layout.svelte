<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-rentora-grayLight text-rentora-dark font-sans">
	<Navbar />

	<main>
		{@render children()}
	</main>
</div>