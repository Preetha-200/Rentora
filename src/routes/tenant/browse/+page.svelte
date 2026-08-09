<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';

	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let selectedType = $state('All');
	let selectedBHK = $state('All');
	let maxPrice = $state('');
	let applying = $state('');
	let successMsg = $state('');

	let propertyTypes = $state(['All']);

	async function loadProperties() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/properties?status=Approved');
			properties = Array.isArray(data) ? data : [];
			const existingTypes = new Set(properties.map((p) => p.type).filter(Boolean));
			const baseTypes = ['Apartment', 'Villa', 'House', 'Studio', 'Commercial'];
			baseTypes.forEach(t => existingTypes.add(t));
			propertyTypes = ['All', ...Array.from(existingTypes)];
		} catch (err) {
			error = err.message;
			properties = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadProperties);

	const filteredProperties = $derived(
		properties.filter((p) => {
			const q = searchQuery.toLowerCase();
			const matchSearch =
				!searchQuery ||
				p.title?.toLowerCase().includes(q) ||
				p.address?.toLowerCase().includes(q) ||
				p.city?.toLowerCase().includes(q);
			const matchType = selectedType === 'All' || p.type === selectedType;
			const matchBHK = selectedBHK === 'All' || Number(p.bedrooms) === Number(selectedBHK);
			const matchPrice = !maxPrice || Number(p.rent) <= Number(maxPrice);
			return matchSearch && matchType && matchBHK && matchPrice;
		})
	);

	async function quickApply(property) {
		if (!$authUser) { goto('/login'); return; }
		applying = property.id;
		try {
			await api.post('/api/rental-requests', {
				propertyId: property.id,
				propertyTitle: property.title
			});
			successMsg = `Application submitted for "${property.title}"!`;
			setTimeout(() => (successMsg = ''), 3500);
		} catch (err) {
			alert(err.message);
		} finally {
			applying = '';
		}
	}
</script>

<svelte:head>
	<title>Browse Properties — Rentora</title>
</svelte:head>

<div class="max-w-7xl mx-auto animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">Browse Properties</h1>
		<p class="text-gray-500 mt-1">{filteredProperties.length} verified properties available</p>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	<!-- Filters -->
	<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-8">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="lg:col-span-2">
				<label for="browse-search" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Search</label>
				<div class="relative">
					<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-gray-400">search</span>
					<input id="browse-search" type="text" bind:value={searchQuery} placeholder="City, address or property name..." class="input-field pl-10" />
				</div>
			</div>
			<div>
				<label for="browse-type" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
				<select id="browse-type" bind:value={selectedType} class="input-field">
					{#each propertyTypes as t}
						<option value={t}>{t}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="browse-bhk" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">BHK</label>
				<select id="browse-bhk" bind:value={selectedBHK} class="input-field">
					<option value="All">Any</option>
					<option value="1">1 BHK</option>
					<option value="2">2 BHK</option>
					<option value="3">3 BHK</option>
					<option value="4">4+ BHK</option>
				</select>
			</div>
		</div>
		<div class="mt-4">
			<label for="browse-price" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Budget (₹/month)</label>
			<input id="browse-price" type="number" bind:value={maxPrice} placeholder="e.g., 30000" class="input-field w-64" />
		</div>
	</div>

	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each [1,2,3,4,5,6] as _}
				<div class="bg-white rounded-2xl shadow-card overflow-hidden">
					<div class="skeleton h-48 rounded-none"></div>
					<div class="p-5 space-y-3">
						<div class="skeleton h-5 w-3/4 rounded"></div>
						<div class="skeleton h-4 w-1/2 rounded"></div>
						<div class="skeleton h-10 rounded"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if filteredProperties.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">search_off</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">No Properties Found</h3>
			<p class="text-gray-400">Try changing your search filters.</p>
			<button onclick={() => { searchQuery = ''; selectedType = 'All'; selectedBHK = 'All'; maxPrice = ''; }} class="mt-4 text-rentora-purple font-semibold text-sm hover:underline">
				Clear all filters
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each filteredProperties as property (property.id)}
				<article class="bg-white rounded-2xl overflow-hidden shadow-card card-hover flex flex-col">
					<div class="relative overflow-hidden">
						{#if property.images?.[0]}
							<img src={property.images[0]} alt={property.title} class="w-full h-48 object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
						{:else}
							<div class="w-full h-48 bg-gradient-to-br from-rentora-blue/20 to-rentora-purple/20 flex items-center justify-center">
								<span class="material-symbols-outlined text-5xl text-gray-300">apartment</span>
							</div>
						{/if}
						<span class="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/95 text-rentora-dark shadow-sm uppercase tracking-wider">
							{property.type || 'Residential'}
						</span>
						{#if Number(property.vacancyCount) === 0}
							<span class="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-500 text-white">Full</span>
						{:else}
							<span class="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-500 text-white">{property.vacancyCount} Open</span>
						{/if}
					</div>
					<div class="p-5 flex-1 flex flex-col">
						<h3 class="text-lg font-bold text-rentora-dark line-clamp-1 mb-1">{property.title}</h3>
						<p class="text-gray-400 text-sm flex items-center gap-1 mb-3">
							<span class="material-symbols-outlined text-base">location_on</span>
							{property.address}, {property.city}
						</p>
						<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
							<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
								<span class="material-symbols-outlined text-sm">bed</span>
								{property.bedrooms} BHK
							</span>
							<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
								<span class="material-symbols-outlined text-sm">bathroom</span>
								{property.bathrooms} Bath
							</span>
							<span class="ml-auto text-lg font-black text-rentora-dark">
								₹{Number(property.rent).toLocaleString('en-IN')}
								<span class="text-xs text-gray-400 font-normal">/mo</span>
							</span>
						</div>
						<div class="flex gap-2 mt-auto">
							<a href="/properties/{property.id}" class="flex-1 text-center py-2.5 rounded-xl border border-rentora-dark/20 text-rentora-dark font-semibold text-sm hover:bg-gray-50 transition-all">
								View Details
							</a>
							{#if Number(property.vacancyCount) > 0}
								<button
									onclick={() => quickApply(property)}
									disabled={applying === property.id}
									class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rentora-purple text-white font-semibold text-sm hover:bg-rentora-purpleLight transition-all disabled:opacity-50">
									{#if applying === property.id}
										<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{:else}
										<span class="material-symbols-outlined text-sm">send</span>
										Apply
									{/if}
								</button>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>