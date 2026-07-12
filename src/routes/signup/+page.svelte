<script>
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Sign Up — Rentora</title>
</svelte:head>

<script module>
	// Redirect /signup → /register for consistency
</script>

{goto('/register')}
