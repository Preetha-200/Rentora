<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';

    let loading = $state(true);
    let properties = $state([]);
    let deleteRequests = $state([]);
    let error = $state('');
    let processingId = $state('');
    let rejectionReason = $state('');
    let selectedProperty = $state(null);
    let activeTab = $state('pending');

    async function loadPendingProperties() {
        loading = true;
        error = '';
        try {
            if (activeTab === 'pending') {
                properties = await api.get('/admin/property-approval?status=Pending');
            } else {
                deleteRequests = await api.get('/admin/property-approval?deleteRequests=true');
            }
        } catch (err) {
            error = err.message;
            properties = [];
            deleteRequests = [];
        } finally {
            loading = false;
        }
    }

    onMount(loadPendingProperties);

    async function approve(propertyId) {
        processingId = propertyId;
        try {
            await api.put('/admin/property-approval', { propertyId, action: 'approve' });
            await loadPendingProperties();
        } catch (err) {
            alert(err.message);
        } finally {
            processingId = '';
        }
    }

    function openReject(property) {
        selectedProperty = property;
        rejectionReason = '';
    }

    function closeReject() {
        selectedProperty = null;
        rejectionReason = '';
    }

    async function reject() {
        if (!rejectionReason.trim()) {
            alert('Please enter a rejection reason.');
            return;
        }
        processingId = selectedProperty.id;
        try {
            await api.put('/admin/property-approval', {
                propertyId: selectedProperty.id,
                action: 'reject',
                reason: rejectionReason
            });
            closeReject();
            await loadPendingProperties();
        } catch (err) {
            alert(err.message);
        } finally {
            processingId = '';
        }
    }

    async function approveDelete(propertyId) {
        if (!confirm('Approve deletion of this property?')) return;
        processingId = propertyId;
        try {
            await api.put('/admin/property-approval', { propertyId, action: 'approveDelete' });
            await loadPendingProperties();
        } catch (err) {
            alert(err.message);
        } finally {
            processingId = '';
        }
    }

    async function rejectDelete(propertyId) {
        if (!confirm('Reject deletion request?')) return;
        processingId = propertyId;
        try {
            await api.put('/admin/property-approval', { propertyId, action: 'rejectDelete' });
            await loadPendingProperties();
        } catch (err) {
            alert(err.message);
        } finally {
            processingId = '';
        }
    }

    function switchTab(tab) {
        activeTab = tab;
        loadPendingProperties();
    }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Property Approvals</h1>

<div class="flex gap-4 mb-6">
    <button on:click={() => switchTab('pending')} class={`px-6 py-2 rounded-xl font-semibold ${activeTab === 'pending' ? 'bg-rentora-purple text-white' : 'bg-gray-200'}`}>
        Pending Approvals ({properties.length})
    </button>
    <button on:click={() => switchTab('delete')} class={`px-6 py-2 rounded-xl font-semibold ${activeTab === 'delete' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
        Delete Requests ({deleteRequests.length})
    </button>
</div>

{#if loading}
    <div class="bg-white rounded-2xl shadow p-8 text-center">Loading...</div>
{:else if error}
    <div class="bg-red-100 text-red-700 rounded-xl p-4">{error}</div>
{:else if activeTab === 'pending'}
    {#if properties.length === 0}
        <div class="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No pending property approvals.</div>
    {:else}
        <div class="grid lg:grid-cols-2 gap-6">
            {#each properties as property}
                <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <img src={property.images?.[0] || 'https://via.placeholder.com/900x500'} alt={property.title} class="w-full h-56 object-cover" />
                    <div class="p-5 space-y-4">
                        <div>
                            <h2 class="text-xl font-bold">{property.title}</h2>
                            <p class="text-gray-500 text-sm">{property.address}, {property.city}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div><strong>Owner</strong><br>{property.ownerName}</div>
                            <div><strong>Rent</strong><br>₹{property.rent}/month</div>
                            <div><strong>Bedrooms</strong><br>{property.bedrooms}</div>
                            <div><strong>Bathrooms</strong><br>{property.bathrooms}</div>
                        </div>
                        <p class="text-gray-600 text-sm">{property.description}</p>
                        {#if property.amenities?.length}
                            <div class="flex flex-wrap gap-2">
                                {#each property.amenities as amenity}
                                    <span class="px-2 py-1 rounded bg-purple-100 text-xs">{amenity}</span>
                                {/each}
                            </div>
                        {/if}
                        <div class="flex gap-3 pt-2">
                            <button class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50" disabled={processingId === property.id} on:click={() => approve(property.id)}>Approve</button>
                            <button class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50" disabled={processingId === property.id} on:click={() => openReject(property)}>Reject</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{:else if activeTab === 'delete'}
    {#if deleteRequests.length === 0}
        <div class="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No pending delete requests.</div>
    {:else}
        <div class="grid lg:grid-cols-2 gap-6">
            {#each deleteRequests as property}
                <div class="bg-white rounded-2xl border shadow-sm overflow-hidden border-red-300">
                    <img src={property.images?.[0] || 'https://via.placeholder.com/900x500'} alt={property.title} class="w-full h-56 object-cover" />
                    <div class="p-5 space-y-4">
                        <div>
                            <h2 class="text-xl font-bold">{property.title}</h2>
                            <p class="text-gray-500 text-sm">{property.address}, {property.city}</p>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50" disabled={processingId === property.id} on:click={() => approveDelete(property.id)}>Approve Delete</button>
                            <button class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50" disabled={processingId === property.id} on:click={() => rejectDelete(property.id)}>Reject Delete</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}

{#if selectedProperty}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 class="text-xl font-bold mb-4">Reject Property</h2>
            <textarea bind:value={rejectionReason} rows="5" placeholder="Enter rejection reason..." class="w-full border rounded-xl p-3"></textarea>
            <div class="flex gap-3 mt-6">
                <button class="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold" on:click={reject}>Confirm Reject</button>
                <button class="flex-1 border py-3 rounded-xl font-semibold" on:click={closeReject}>Cancel</button>
            </div>
        </div>
    </div>
{/if}