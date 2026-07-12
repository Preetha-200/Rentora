<script>
	let { label, value, color = 'text-rentora-purple' } = $props();
</script>

<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
	<p class="text-sm text-gray-500 uppercase tracking-wide">{label}</p>
	<p class={`text-4xl font-extrabold mt-2 ${color}`}>{value}</p>
</div>
