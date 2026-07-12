<script>
	import { goto } from '$app/navigation';

	let { data } = $props();

	let properties = $state([]);
	let filteredProperties = $state([]);
	let error = $state('');

	$effect(() => {
		properties = data.properties;
		error = data.loadError || '';
	});

	let search = $state('');
	let city = $state('');
	let minRent = $state('');
	let maxRent = $state('');

	function filterProperties() {
		filteredProperties = properties.filter((property) => {
			const matchesSearch =
				!search ||
				property.title?.toLowerCase().includes(search.toLowerCase()) ||
				property.address?.toLowerCase().includes(search.toLowerCase());

			const matchesCity =
				!city ||
				property.city?.toLowerCase().includes(city.toLowerCase());

			const matchesMin =
				!minRent || Number(property.rent) >= Number(minRent);

			const matchesMax =
				!maxRent || Number(property.rent) <= Number(maxRent);

			return matchesSearch && matchesCity && matchesMin && matchesMax;
		});
	}

	// Re-run the filter any time a search input changes. This replaces the
	// old Svelte 4 `$: filterProperties();` reactive statement with the
	// Svelte 5 rune equivalent.
	$effect(() => {
		search;
		city;
		minRent;
		maxRent;
		filterProperties();
	});

	function openProperty(id) {
		goto(`/properties/${id}`);
	}
</script>

<div class="max-w-7xl mx-auto px-6 py-10">
	<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
		<div>
			<h1 class="text-4xl font-black text-rentora-dark">Browse Properties</h1>
			<p class="text-gray-500 mt-2">Find verified rental properties across your city.</p>
		</div>

		<div class="grid md:grid-cols-4 gap-3 w-full md:w-auto">
			<input bind:value={search} placeholder="Search..." class="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rentora-purple">
			<input bind:value={city} placeholder="City" class="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rentora-purple">
			<input bind:value={minRent} type="number" placeholder="Min Rent" class="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rentora-purple">
			<input bind:value={maxRent} type="number" placeholder="Max Rent" class="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rentora-purple">
		</div>
	</div>

	{#if error}
		<div class="bg-red-100 text-red-700 rounded-2xl p-6">
			{error}
		</div>

	{:else if filteredProperties.length === 0}
		<div class="bg-white rounded-3xl shadow-sm p-10 text-center text-gray-500">
			No properties found.
		</div>

	{:else}
		<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
			{#each filteredProperties as property}
				<div class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
					<img src={property.images?.[0]} alt={property.title} class="w-full h-64 object-cover">
					<div class="p-6">
						<div class="flex justify-between items-start">
							<h2 class="text-2xl font-bold text-rentora-dark line-clamp-1">
								{property.title}
							</h2>
							<span class="text-rentora-purple text-xl font-black">
								₹{property.rent}
							</span>
						</div>
						<p class="text-gray-500 mt-2 line-clamp-1">
							📍 {property.address}, {property.city}
						</p>
						<div class="flex justify-between text-sm text-gray-600 mt-5">
							<span>🛏 {property.bedrooms} Beds</span>
							<span>🛁 {property.bathrooms} Baths</span>
							<span class="capitalize">🛋 {property.furnishing}</span>
						</div>
						<p class="text-gray-600 mt-5 line-clamp-3">
							{property.description}
						</p>
						<div class="flex justify-between items-center mt-6">
							<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
								Verified
							</span>
							<button onclick={() => openProperty(property.id)} class="px-5 py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition">
								View Details
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
