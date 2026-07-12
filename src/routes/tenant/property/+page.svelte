<script>
import { onMount } from 'svelte';
import { api } from '$lib/api.js';

let properties = [];
let loading = true;
let errorMessage = '';
let applicationMessage = {};

async function loadProperties() {
	loading = true;
	errorMessage = '';
	try {
		properties = await api.get('/api/properties');
	} catch (err) {
		errorMessage = err.message || 'Failed to load properties.';
	} finally {
		loading = false;
	}
}

onMount(loadProperties);

async function applyForProperty(propertyId) {
	try {
		const response = await api.post('/api/requests', {
			propertyId
		});
		applicationMessage[propertyId] = {
			success: true,
			text: response.message
		};
	} catch (err) {
		applicationMessage[propertyId] = {
			success: false,
			text: err.message
		};
	}
}
</script>

<main class="max-w-7xl mx-auto px-6 py-10">
	<h1 class="text-3xl font-bold text-rentora-dark mb-8">Available Properties</h1>
	{#if loading}
		<p class="text-center text-gray-500">Loading properties...</p>
	{:else if errorMessage}
		<div class="bg-red-100 text-red-700 p-4 rounded-xl">{errorMessage}</div>
	{:else if properties.length === 0}
		<div class="bg-white rounded-xl border p-10 text-center text-gray-500">No approved properties available.</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each properties as property}
				<div class="bg-white rounded-2xl overflow-hidden shadow-sm border">
					<img src={property.images?.[0] || 'https://via.placeholder.com/800x500?text=No+Image'} alt={property.title} class="w-full h-56 object-cover" />
					<div class="p-5">
						<h2 class="text-xl font-bold">{property.title}</h2>
						<p class="text-gray-500 mt-2">📍 {property.address}, {property.city}</p>
						<div class="flex gap-3 mt-4 text-sm">
							<span>{property.bedrooms} Bed</span>
							<span>{property.bathrooms} Bath</span>
							<span>{property.furnishing}</span>
						</div>
						<p class="text-2xl font-bold text-rentora-purple mt-5">₹{property.rent}/month</p>
						<button on:click={() => applyForProperty(property.id)}
							class="w-full mt-5 py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:opacity-90">
							Apply for Rental
						</button>
						{#if applicationMessage[property.id]}
							<p class={`mt-3 text-sm font-medium ${applicationMessage[property.id].success ? 'text-green-600' : 'text-red-600'}`}>
								{applicationMessage[property.id].text}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>