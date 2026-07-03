<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let user = null;
  let requests = [];
  let issues = [];
  let loadingData = true;

  onMount(async () => {
    const savedUser = localStorage.getItem('rentora_user');
    if (!savedUser) {
      goto('/login');
      return;
    }
    user = JSON.parse(savedUser);

    try {
      // Fetch Lease Requests and Maintenance Issues
      requests = await api.get('/requests/owner-requests');
      issues = await api.get('/maintenance/landlord-view');
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      loadingData = false;
    }
  });

  // Accept/Reject Rent Applications
  async function updateRequest(id, status) {
    try {
      const response = await api.put(`/requests/status/${id}`, { status });
      alert(response.message);
      
      // Update local array state
      requests = requests.map(r => r.id === id ? { ...r, status } : r);
    } catch (err) {
      alert("Error processing action: " + err.message);
    }
  }

  // Update Maintenance Status
  async function resolveTicket(id, status) {
    try {
      const response = await api.put(`/operations/maintenance/${id}/status`, { status });
      alert(response.message);
      
      // Update local ticket queue state
      issues = issues.map(issue => issue.id === id ? { ...issue, status } : issue);
    } catch (err) {
      alert("Status change failed: " + err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('rentora_token');
    localStorage.removeItem('rentora_user');
    goto('/login');
  }
</script>

{#if user}
<main class="min-h-screen bg-slate-50 p-6 md:p-12">
  <div class="max-w-6xl mx-auto space-y-8">
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Landlord Control Room</h1>
        <p class="text-gray-500 mt-1">Properties manager account: {user.name}</p>
      </div>
      <button on:click={handleLogout} class="mt-4 md:mt-0 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-semibold transition">
        Sign Out
      </button>
    </div>

    {#if loadingData}
      <p class="text-gray-500 text-center font-medium py-12">Syncing property registers...</p>
    {:else}
      
      <!-- Part 1: Lease Application Requests -->
      <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-4">📝 Pending Tenant Lease Applications</h2>
        
        {#if requests.length === 0}
          <p class="text-gray-500 text-sm">No tenant applications have been logged for your properties.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 text-sm font-semibold text-gray-400">
                  <th class="py-3">Tenant Candidate</th>
                  <th class="py-3">Property Reference ID</th>
                  <th class="py-3">Status</th>
                  <th class="py-3 text-right">Decisions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 text-sm text-gray-700">
                {#each requests as req}
                  <tr>
                    <td class="py-4 font-bold text-gray-900">{req.tenantName}</td>
                    <td class="py-4 text-gray-500 font-mono">Unit #{req.propertyId}</td>
                    <td class="py-4">
                      <span class="px-2.5 py-1 text-xs font-bold rounded-full {req.status === 'Accepted' ? 'bg-green-50 text-green-600' : req.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}">
                        {req.status}
                      </span>
                    </td>
                    <td class="py-4 text-right space-x-2">
                      {#if req.status === 'Pending'}
                        <button on:click={() => updateRequest(req.id, 'Accepted')} class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition">
                          Accept
                        </button>
                        <button on:click={() => updateRequest(req.id, 'Rejected')} class="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition">
                          Reject
                        </button>
                      {:else}
                        <span class="text-gray-400 text-xs font-medium">Processed</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>

      <!-- Part 2: Facility Maintenance Queue -->
      <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-4">🔧 Tenant Maintenance Requests</h2>
        
        {#if issues.length === 0}
          <p class="text-gray-500 text-sm">All tenant units are running smoothly. No issues logged!</p>
        {:else}
          <div class="space-y-4">
            {#each issues as issue}
              <div class="p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">Priority: {issue.priority}</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">Status: {issue.status}</span>
                  </div>
                  <p class="text-sm text-gray-900 font-medium">"{issue.issueDescription}"</p>
                  <p class="text-xs text-gray-500">Filed by Tenant #{issue.tenantId} for Property Unit #{issue.propertyId}</p>
                </div>
                
                <div class="flex gap-2">
                  {#if issue.status !== 'Resolved'}
                    <button on:click={() => resolveTicket(issue.id, 'In Progress')} class="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-lg text-xs transition">
                      Mark In Progress
                    </button>
                    <button on:click={() => resolveTicket(issue.id, 'Resolved')} class="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold px-4 py-2 rounded-lg text-xs transition">
                      Mark Resolved
                    </button>
                  {:else}
                    <span class="text-emerald-600 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center">✓ Fully Resolved</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>

    {/if}
  </div>
</main>
{/if}

