<script>
  import { mockProperties } from '$lib/mockData.js';
  
  let pendingProperties = $state([...mockProperties.filter(p => p.status === 'Pending')]);

  function approveProperty(id) {
    pendingProperties = pendingProperties.filter(p => p.id !== id);
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Property Approvals</h1>

<div class="space-y-4">
  {#each pendingProperties as property}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg text-rentora-dark">{property.title}</h3>
        <p class="text-gray-500 text-sm">{property.location}</p>
      </div>
      <button 
        onclick={() => approveProperty(property.id)}
        class="bg-rentora-purple text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rentora-purpleLight transition duration-200"
      >
        Approve Property
      </button>
    </div>
  {:else}
    <p class="text-gray-500">No pending properties for approval.</p>
  {/each}
</div>