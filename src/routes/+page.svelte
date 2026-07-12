<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');

	let searchQuery = $state('');
	let selectedType = $state('All');
	let selectedBHK = $state('All');
	let maxPrice = $state('');

	const user = typeof window !== 'undefined'
		? JSON.parse(localStorage.getItem('rentora_user') || 'null')
		: null;

	let propertyTypes = $state(['All']);

	async function loadProperties() {
		loading = true;
		error = '';

		try {
			properties = await api.get('/api/properties?status=Approved');
			propertyTypes = ['All', ...new Set(properties.map((p) => p.type).filter(Boolean))];
		} catch (err) {
			error = err.message || 'Failed to load properties.';
		} finally {
			loading = false;
		}
	}

	onMount(loadProperties);

	let filteredProperties = $derived(
		properties.filter((property) => {
			const matchesSearch =
				!searchQuery ||
				property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				property.city?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesType =
				selectedType === 'All' || property.type === selectedType;

			const matchesBHK =
				selectedBHK === 'All' || Number(property.bedrooms) === Number(selectedBHK);

			const matchesPrice =
				!maxPrice || Number(property.rent) <= Number(maxPrice);

			return matchesSearch && matchesType && matchesBHK && matchesPrice;
		})
	);

	function viewProperty(id) {
		goto(`/properties/${id}`);
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="text-center max-w-3xl mx-auto mb-12">
		<h1 class="text-4xl sm:text-5xl font-extrabold text-rentora-dark tracking-tight">
			Explore Smart Rentals
		</h1>

		<p class="mt-4 text-lg text-gray-500">
			Filter through verified residential listings with comprehensive asset
			and budgeting metrics.
		</p>
	</div>

	<div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">

		<div>
			<label
				for="search-input"
				class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
				Location / Name
			</label>

			<input
				id="search-input"
				type="text"
				bind:value={searchQuery}
				placeholder="Search residential spaces..."
				class="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple focus:bg-white transition text-sm" />
		</div>

		<div>
			<label
				for="type-select"
				class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
				Property Type
			</label>

			<select
				id="type-select"
				bind:value={selectedType}
				class="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple focus:bg-white transition text-sm">

				{#each propertyTypes as propertyType}
					<option value={propertyType}>{propertyType}</option>
				{/each}

			</select>
		</div>

		<div>
			<label
				for="bhk-select"
				class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
				Capacity (BHK)
			</label>

			<select
				id="bhk-select"
				bind:value={selectedBHK}
				class="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple focus:bg-white transition text-sm">

				<option value="All">All Capacities</option>
				<option value="1">1 BHK</option>
				<option value="2">2 BHK</option>
				<option value="3">3 BHK</option>

			</select>
		</div>

		<div>
			<label
				for="budget-input"
				class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
				Max Budget (₹/mo)
			</label>

			<input
				id="budget-input"
				type="number"
				bind:value={maxPrice}
				placeholder="Enter price ceiling"
				class="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple focus:bg-white transition text-sm" />
		</div>

	</div>

	<div>
		<div class="flex justify-between items-center mb-8">
			<h2 class="text-2xl font-bold text-rentora-dark">
				Matches Found
			</h2>

			<span class="text-sm bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-600">
				{filteredProperties.length} spaces available
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

			{#if loading}

				<div class="col-span-full bg-white rounded-2xl shadow-sm p-10 text-center">
					Loading properties...
				</div>

			{:else if error}

				<div class="col-span-full bg-red-100 text-red-700 rounded-2xl p-6">
					{error}
				</div>

			{:else}

				{#each filteredProperties as property (property.id)}

					<div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between">

						<div class="relative">
							<img src={property.images?.[0]} alt={property.title} class="w-full h-56 object-cover">

							<span class="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/90 text-rentora-dark shadow-sm uppercase tracking-wider">
								{property.type}
							</span>
						</div>

						<div class="p-6 flex-1 flex flex-col justify-between">

							<div>

								<h3 class="text-xl font-bold text-rentora-dark line-clamp-1">
									{property.title}
								</h3>

								<p class="text-gray-400 text-sm mt-1">
									{property.address}, {property.city}
								</p>

								<div class="flex items-center gap-2 mt-3 text-xs font-semibold text-slate-500">
									<span class="bg-slate-100 px-2 py-0.5 rounded">
										{property.bedrooms} BHK
									</span>

									<span class="bg-slate-100 px-2 py-0.5 rounded">
										{property.bathrooms} Bath
									</span>
								</div>

								{#if property.amenities?.length}

									<div class="flex flex-wrap gap-1 mt-4">
										{#each property.amenities as amenity}
											<span class="text-[10px] bg-purple-50 text-rentora-purple font-bold px-2 py-0.5 rounded-md">
												{amenity}
											</span>
										{/each}
									</div>

								{/if}

							</div>

							<div class="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">

								<div>
									<span class="text-2xl font-extrabold text-rentora-dark">
										₹{Number(property.rent).toLocaleString('en-IN')}
									</span>

									<span class="text-gray-400 text-xs font-medium">
										/ mo
									</span>
								</div>

								<button onclick={() => viewProperty(property.id)} class="bg-rentora-dark text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-rentora-purple transition">
									View Details
								</button>

							</div>

						</div>

					</div>

				{:else}

					<div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
						<p class="text-gray-400 text-base">
							No rental properties match your search.
						</p>
					</div>

				{/each}

			{/if}

		</div>
	</div>
</div>