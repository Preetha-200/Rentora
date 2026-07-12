<script>
	import { formatCurrency } from '$lib/utils/format.js';

	let { property, ctaLabel = 'View Details', onCta = () => {} } = $props();
</script>

<div class="bg-white rounded-2xl shadow border overflow-hidden">
	<img
		src={property.images?.[0] || 'https://via.placeholder.com/900x600'}
		alt={property.title}
		class="w-full h-52 object-cover" />

	<div class="p-5 space-y-3">
		<h3 class="font-bold text-xl">{property.title}</h3>
		<p class="text-sm text-gray-500">{property.address}, {property.city}</p>
		<p class="text-lg font-bold text-rentora-purple">
			{formatCurrency(property.rent)}/month
		</p>

		<div class="flex gap-3 text-sm">
			<span>{property.bedrooms} beds</span>
			<span>{property.bathrooms} baths</span>
			<span class="capitalize">{property.furnishing}</span>
		</div>

		{#if property.amenities?.length}
			<div class="flex flex-wrap gap-2">
				{#each property.amenities.slice(0, 3) as amenity}
					<span class="px-2 py-1 rounded bg-purple-100 text-xs">{amenity}</span>
				{/each}
			</div>
		{/if}

		<button
			onclick={() => onCta(property)}
			class="w-full bg-rentora-purple text-white py-2 rounded-xl font-semibold hover:bg-rentora-purpleLight">
			{ctaLabel}
		</button>
	</div>
</div>
