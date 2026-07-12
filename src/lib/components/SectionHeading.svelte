<script>
	let { title, subtitle = '' } = $props();
</script>

<div class="mb-6">
	<h1 class="text-3xl font-bold text-rentora-dark">{title}</h1>
	{#if subtitle}
		<p class="text-gray-500 mt-1">{subtitle}</p>
	{/if}
</div>
