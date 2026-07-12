<script>
import { onMount } from 'svelte';
import { api } from '$lib/api';

let requests = [];
let loading = true;
let error = '';

async function loadRequests() {
	loading = true;
	error = '';
	try {
		requests = await api.get('/api/requests');
	} catch (err) {
		error = err.message || 'Failed to load applications.';
	} finally {
		loading = false;
	}
}

onMount(loadRequests);

function statusClass(status) {
	switch (status) {
		case 'Approved':
			return 'bg-green-50 text-green-700';
		case 'Rejected':
			return 'bg-red-50 text-red-700';
		default:
			return 'bg-amber-50 text-amber-700';
	}
}
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">My Rental Applications</h1>

{#if loading}
	<p class="text-gray-500">Loading...</p>
{:else if error}
	<p class="text-red-600">{error}</p>
{:else if requests.length === 0}
	<p class="text-gray-500">No submitted applications found.</p>
{:else}
	<div class="space-y-4">
		{#each requests as request}
			<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
				<div>
					<h3 class="font-bold text-lg text-rentora-dark">{request.propertyTitle}</h3>
					<p class="text-sm text-gray-500">Owner: {request.ownerName}</p>
					<p class="text-sm text-gray-500">Applied: {new Date(request.createdAt).toLocaleDateString()}</p>
				</div>
				<span class={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass(request.status)}`}>
					{request.status}
				</span>
			</div>
		{/each}
	</div>
{/if}