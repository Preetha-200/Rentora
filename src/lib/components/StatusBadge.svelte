<script>
	import { getStatusColor } from '$lib/utils/format.js';

	let { status, class: extraClass = '' } = $props();
</script>

<span class={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)} ${extraClass}`}>
	{status}
</span>
