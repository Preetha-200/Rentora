<script>
  import { mockRequests } from '$lib/mockData.js';
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">My Rental Applications</h1>

<div class="space-y-4">
  {#each mockRequests as request}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg text-rentora-dark">{request.propertyName}</h3>
        <p class="text-sm text-gray-500">Submitted on: {request.date}</p>
      </div>
      <span class="text-xs font-semibold px-3 py-1 rounded-full {request.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}">
        {request.status}
      </span>
    </div>
  {:else}
    <p class="text-gray-500">No submitted applications found.</p>
  {/each}
</div>