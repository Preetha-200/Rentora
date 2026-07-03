<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';

  let properties = [];
  let loading = true;
  let errorMessage = '';
  let applicationMessage = {};

  onMount(async () => {
    try {
      properties = await api.get('/properties');
    } catch (err) {
      errorMessage = "Could not load properties: " + err.message;
    } finally {
      loading = false;
    }
  });

  async function applyForProperty(propertyId) {
    try {
      const response = await api.post('/requests/apply', { propertyId });
      applicationMessage[propertyId] = { success: true, text: response.message };
    } catch (err) {
      applicationMessage[propertyId] = { success: false, text: err.message };
    }
  }
</script>

<main class="max-w-6xl mx-auto my-8 p-4">
  <h1 class="text-3xl font-extrabold text-gray-900 mb-6">Active Residential Listings in Salem</h1>

  {#if loading}
    <p class="text-center text-gray-600">Retrieving listings from backend...</p>
  {:else if errorMessage}
    <p class="p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</p>
  {:else if properties.length === 0}
    <p class="text-gray-500 text-center">No properties are currently listed.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each properties as property}
        <div class="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition">
          <h3 class="text-xl font-bold text-gray-800">{property.title}</h3>
          <p class="text-gray-500 mt-1">📍 Location: {property.location}</p>
          <p class="text-gray-600 mt-2">🏠 config: {property.bhk} BHK {property.propertyType}</p>
          <p class="text-emerald-600 font-extrabold text-lg mt-3">₹{property.price}/month</p>
          
          <button 
            on:click={() => applyForProperty(property.id)} 
            class="w-full mt-4 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Apply to Rent
          </button>

          {#if applicationMessage[property.id]}
            <p class="mt-2 text-sm font-semibold {applicationMessage[property.id].success ? 'text-green-600' : 'text-red-600'}">
              {applicationMessage[property.id].text}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main>

