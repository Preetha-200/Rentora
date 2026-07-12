<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let issues = [];
	let loading = true;
	let error = '';

	async function loadIssues() {
		loading = true;
		error = '';

		try {
			const response = await api.get('/api/maintenance');
			issues = response.complaints || [];
		} catch (err) {
			error = err.message || 'Failed to load maintenance requests';
		} finally {
			loading = false;
		}
	}

	onMount(loadIssues);

	async function updateStatus(id, status) {
		try {
			await api.post('/api/maintenance/update-status', {
				complaintId: id,
				status
			});

			await loadIssues();
		} catch (err) {
			alert(err.message);
		}
	}
</script>
<div>
  <h1 class="text-3xl font-bold text-rentora-dark mb-6">
    Maintenance Requests
  </h1>

  {#if loading}

    <div class="bg-white rounded-2xl p-8 text-center shadow-sm">
      Loading maintenance requests...
    </div>

  {:else}

    {#if error}
      <p class="text-red-600 mb-5">{error}</p>
    {/if}

    <div class="space-y-4">

      {#each issues as issue}

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">

          <div>

            <span class="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 uppercase tracking-wider">
              {issue.priority || 'Normal'} Priority
            </span>

            <h3 class="font-bold text-lg text-rentora-dark mt-2">
              {issue.complaint}
            </h3>

            <p class="text-sm text-gray-500">
              {issue.propertyTitle}
            </p>

            <p class="text-sm text-gray-500">
              Tenant: {issue.tenantId}
            </p>

            <p class="text-sm text-gray-500">
              Submitted: {new Date(issue.createdAt).toLocaleDateString()}
            </p>

            <p class="text-sm mt-2">
              Status:
              <span class="font-semibold text-rentora-purple">
                {issue.status}
              </span>
            </p>

          </div>

          <div class="flex gap-2">

            {#if issue.status === 'Pending'}

              <button
                on:click={() => updateStatus(issue.id, 'Checking')}
                class="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700">

                In Progress

              </button>

            {/if}

          </div>

        </div>

      {:else}

        <div class="bg-white rounded-2xl p-8 text-center shadow-sm">
          No maintenance requests found.
        </div>

      {/each}

    </div>

  {/if}
</div>