<script>
  import { mockProperties } from '$lib/mockData.js';

  let properties = $state([...mockProperties]);
  let title = $state('');
  let location = $state('');
  let price = $state('');

  function addProperty(e) {
    e.preventDefault();
    const newProperty = {
      id: `prop-${Date.now()}`,
      title,
      location,
      price: Number(price),
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
    };
    properties = [...properties, newProperty];
    title = '';
    location = '';
    price = '';
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Property Management</h1>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
    <h2 class="text-xl font-bold mb-4">Add New Property</h2>
    <form onsubmit={addProperty} class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
        <input id="title" type="text" bind:value={title} required class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="Apartment Name" />
      </div>
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input id="location" type="text" bind:value={location} required class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="City, Area" />
      </div>
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
        <input id="price" type="number" bind:value={price} required class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="Amount" />
      </div>
      <button type="submit" class="w-full py-2.5 bg-rentora-purple text-white font-semibold rounded-xl hover:bg-rentora-purpleLight transition duration-200">
        Submit Listing
      </button>
    </form>
  </div>

  <div class="lg:grid-cols-2 lg:col-span-2 grid grid-cols-1 gap-6">
    {#each properties as property}
      <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
        <img src={property.image} alt={property.title} class="w-full h-40 object-cover" />
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-lg text-rentora-dark">{property.title}</h3>
              <span class="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider {property.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">
                {property.status}
              </span>
            </div>
            <p class="text-gray-500 text-sm mt-1">{property.location}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
            <span class="font-bold text-rentora-dark">₹{property.price}/mo</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>