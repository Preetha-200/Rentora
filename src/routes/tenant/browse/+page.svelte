<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import PropertyCard from '$lib/components/PropertyCard.svelte';

    let properties = $state([]);
    let loading = $state(true);
    let error = $state('');
    let searchQuery = $state('');
    let selectedCity = $state('');
    let minPrice = $state('');
    let maxPrice = $state('');
    let cities = $state([]);

    async function loadProperties() {
        loading = true;
        error = '';
        try {
            const allProperties = await api.get('/properties');
            properties = allProperties.filter(p => p.approvalStatus === 'Approved' && p.status === 'Available');
            const uniqueCities = [...new Set(properties.map(p => p.city).filter(Boolean))];
            cities = uniqueCities;
        } catch (err) {
            error = err.message;
            properties = [];
        } finally {
            loading = false;
        }
    }

    onMount(loadProperties);

    function getFilteredProperties() {
        return properties.filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 property.address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCity = !selectedCity || property.city === selectedCity;
            const matchesMinPrice = !minPrice || property.rent >= Number(minPrice);
            const matchesMaxPrice = !maxPrice || property.rent <= Number(maxPrice);
            return matchesSearch && matchesCity && matchesMinPrice && matchesMaxPrice;
        });
    }

    async function requestRental(propertyId) {
        if (!confirm('Send rental request for this property?')) return;
        try {
            await api.post('/rental-requests', { propertyId });
            alert('Rental request sent successfully!');
        } catch (err) {
            alert(err.message);
        }
    }
</script>

<div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-rentora-dark mb-6">Browse Properties</h1>
    <div class="mb-6 bg-white p-4 rounded-2xl shadow-sm border">
        <div class="grid md:grid-cols-4 gap-4">
            <input type="text" bind:value={searchQuery} placeholder="Search properties..." class="border rounded-xl p-3">
            <select bind:value={selectedCity} class="border rounded-xl p-3">
                <option value="">All Cities</option>
                {#each cities as city}
                    <option value={city}>{city}</option>
                {/each}
            </select>
            <input type="number" bind:value={minPrice} placeholder="Min Rent" class="border rounded-xl p-3">
            <input type="number" bind:value={maxPrice} placeholder="Max Rent" class="border rounded-xl p-3">
        </div>
    </div>
    {#if loading}
        <div class="bg-white rounded-2xl p-8 text-center shadow">Loading properties...</div>
    {:else if error}
        <div class="bg-red-100 text-red-700 rounded-xl p-4">{error}</div>
    {:else}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each getFilteredProperties() as property}
                <div class="bg-white rounded-2xl shadow border overflow-hidden">
                    <img src={property.images?.[0] || 'https://via.placeholder.com/900x600'} alt={property.title} class="w-full h-52 object-cover">
                    <div class="p-5 space-y-3">
                        <h3 class="font-bold text-xl">{property.title}</h3>
                        <p class="text-sm text-gray-500">{property.address}, {property.city}</p>
                        <p class="text-lg font-bold text-rentora-purple">₹{property.rent}/month</p>
                        <div class="flex gap-3 text-sm">
                            <span>{property.bedrooms} beds</span>
                            <span>{property.bathrooms} baths</span>
                            <span class="capitalize">{property.furnishing}</span>
                        </div>
                        {#if property.amenities?.length}
                            <div class="flex flex-wrap gap-2">
                                {#each property.amenities.slice(0,3) as amenity}
                                    <span class="px-2 py-1 rounded bg-purple-100 text-xs">{amenity}</span>
                                {/each}
                            </div>
                        {/if}
                        <button on:click={() => requestRental(property.id)} class="w-full bg-rentora-purple text-white py-2 rounded-xl font-semibold hover:bg-rentora-purpleLight">
                            Request Rental
                        </button>
                    </div>
                </div>
            {:else}
                <div class="col-span-full bg-white rounded-2xl p-8 text-center text-gray-500">No properties found.</div>
            {/each}
        </div>
    {/if}
</div>