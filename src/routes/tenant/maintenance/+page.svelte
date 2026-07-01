<script>
  import { mockMaintenance } from '$lib/mockData.js';

  let issues = $state([...mockMaintenance]);
  let issueDescription = $state('');
  let selectedPriority = $state('Low');

  function fileRequest(e) {
    e.preventDefault();
    const newIssue = {
      id: `maint-${Date.now()}`,
      propertyName: 'Occupied Rental Unit',
      issue: issueDescription,
      status: 'Submitted',
      priority: selectedPriority
    };
    issues = [newIssue, ...issues];
    issueDescription = '';
    selectedPriority = 'Low';
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Maintenance Portal</h1>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
    <h2 class="text-xl font-bold mb-4">File a Work Order</h2>
    <form onsubmit={fileRequest} class="space-y-4">
      <div>
        <label for="issue" class="block text-sm font-medium text-gray-700 mb-1">Describe the Issue</label>
        <textarea id="issue" bind:value={issueDescription} required class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple resize-none h-24" placeholder="Plumbing leak, broken lock, etc."></textarea>
      </div>
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Priority Urgency</label>
        <select id="priority" bind:value={selectedPriority} class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <button type="submit" class="w-full py-2.5 bg-rentora-purple text-white font-semibold rounded-xl hover:bg-rentora-purpleLight transition duration-200">
        Submit Ticket
      </button>
    </form>
  </div>

  <div class="lg:col-span-2 space-y-4">
    <h2 class="text-xl font-bold text-rentora-dark">Ticket History</h2>
    {#each issues as issue}
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider {issue.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}">
            {issue.priority} Priority
          </span>
          <h3 class="font-bold text-base text-rentora-dark mt-2">{issue.issue}</h3>
          <p class="text-xs text-gray-400 mt-0.5">{issue.propertyName}</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-rentora-purple">
          {issue.status}
        </span>
      </div>
    {/each}
  </div>
</div>