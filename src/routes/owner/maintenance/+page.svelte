<script>
  import { mockMaintenance } from '$lib/mockData.js';

  let issues = $state([...mockMaintenance]);

  function resolveIssue(id) {
    issues = issues.map(issue => issue.id === id ? { ...issue, status: 'Resolved' } : issue);
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Maintenance Requests</h1>

<div class="space-y-4">
  {#each issues as issue}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <span class="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 uppercase tracking-wider">{issue.priority} Priority</span>
        <h3 class="font-bold text-lg text-rentora-dark mt-2">{issue.issue}</h3>
        <p class="text-sm text-gray-500">{issue.propertyName} • Status: <span class="font-semibold text-rentora-purple">{issue.status}</span></p>
      </div>
      {#if issue.status !== 'Resolved'}
        <button onclick={() => resolveIssue(issue.id)} class="bg-rentora-purple text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-rentora-purpleLight transition duration-200">
          Mark Resolved
        </button>
      {/if}
    </div>
  {/each}
</div>