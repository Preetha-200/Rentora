<script>
  import { mockRequests, mockPayments, mockMaintenance } from '$lib/mockData.js';

  let activeRequests = $derived(mockRequests.filter(r => r.status === 'Pending').length);
  let unpaidPayments = $derived(mockPayments.filter(p => p.status !== 'Paid').length);
  let activeIssues = $derived(mockMaintenance.filter(m => m.status !== 'Resolved').length);
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Tenant Dashboard</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Active Applications</h3>
    <p class="text-4xl font-extrabold text-rentora-dark mt-2">{activeRequests}</p>
  </div>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Pending Invoices</h3>
    <p class="text-4xl font-extrabold text-rentora-purple mt-2">{unpaidPayments}</p>
  </div>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Open Maintenance Issues</h3>
    <p class="text-4xl font-extrabold text-amber-600 mt-2">{activeIssues}</p>
  </div>
</div>