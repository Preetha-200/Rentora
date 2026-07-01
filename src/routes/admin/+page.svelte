<script>
  import { mockProperties } from '$lib/mockData.js';
  
  let pendingCount = $derived(mockProperties.filter(p => p.status === 'Pending').length);
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Admin Dashboard Overview</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Pending Approvals</h3>
    <p class="text-4xl font-extrabold text-rentora-purple mt-2">{pendingCount}</p>
  </div>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Total System Properties</h3>
    <p class="text-4xl font-extrabold text-rentora-dark mt-2">{mockProperties.length}</p>
  </div>
</div>