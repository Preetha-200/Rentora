<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';

    let requests = $state([]);
    let loading = $state(true);
    let error = $state('');

    async function loadRequests() {
        loading = true;
        error = '';
        try {
            const response = await api.get('/rental-requests/incoming');
            requests = response || [];
        } catch (err) {
            error = err.message;
            requests = [];
        } finally {
            loading = false;
        }
    }

    onMount(loadRequests);

    async function handleRequest(requestId, action) {
        try {
            await api.put('/rental-requests', { requestId, action });
            await loadRequests();
        } catch (err) {
            alert(err.message);
        }
    }
</script>

<div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-rentora-dark mb-6">Rental Requests</h1>
    {#if loading}
        <div class="bg-white rounded-2xl p-8 text-center shadow">Loading requests...</div>
    {:else if error}
        <div class="bg-red-100 text-red-700 rounded-xl p-4">{error}</div>
    {:else if requests.length === 0}
        <div class="bg-white rounded-2xl p-8 text-center text-gray-500">No rental requests received.</div>
    {:else}
        <div class="space-y-4">
            {#each requests as request}
                <div class="bg-white rounded-2xl shadow border p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-lg">{request.propertyTitle}</h3>
                            <p class="text-sm text-gray-500">Tenant: {request.tenantId}</p>
                            <p class="text-sm text-gray-500">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 {request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                {request.status}
                            </span>
                        </div>
                        {#if request.status === 'Pending'}
                            <div class="flex gap-2">
                                <button on:click={() => handleRequest(request.id, 'approve')} class="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700">Approve</button>
                                <button on:click={() => handleRequest(request.id, 'reject')} class="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700">Reject</button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>