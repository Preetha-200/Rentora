<script>
	let {
		open = false,
		title = 'Are you sure?',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		confirmClass = 'bg-red-600 hover:bg-red-700',
		onConfirm = () => {},
		onCancel = () => {},
		children
	} = $props();
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
			<h2 class="text-xl font-bold mb-4">{title}</h2>

			{#if children}
				{@render children()}
			{/if}

			<div class="flex gap-3 mt-6">
				<button
					class={`flex-1 text-white py-3 rounded-xl font-semibold ${confirmClass}`}
					onclick={onConfirm}>
					{confirmLabel}
				</button>
				<button
					class="flex-1 border py-3 rounded-xl font-semibold"
					onclick={onCancel}>
					{cancelLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
