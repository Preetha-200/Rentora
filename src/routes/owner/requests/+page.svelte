<script>
  import { mockRequests } from '$lib/mockData.js';

  let requests = $state([...mockRequests]);

  function updateStatus(id, newStatus) {
    requests = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Rental Requests</h1>

<div class="space-y-4">
  {#each requests as request}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg text-rentora-dark">{request.propertyName}</h3>
        <p class="text-sm text-gray-500">Applicant: <span class="font-medium text-gray-700">{request.tenantName}</span> • Submitted: {request.date}</p>
        <span class="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 {request.status === 'Pending' ? 'bg-amber-50 text-amber-700' : request.status === 'Accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">{request.status}</span>
      </div>
      {#if request.status === 'Pending'}
        <div class="flex space-x-2">
          <button onclick={() => updateStatus(request.id, 'Accepted')} class="bg-green-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition duration-200">
            Accept
          </button>
          <button onclick={() => updateStatus(request.id, 'Rejected')} class="bg-red-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition duration-200">
            Reject
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <p class="text-gray-500">No rental applications discovered.</p>
  {/each}
</div>