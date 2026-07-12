<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let loading = $state(true);
	let properties = $state([]);
	let deleteRequests = $state([]);
	let error = $state('');
	let processingId = $state('');
	let successMsg = $state('');
	let activeTab = $state('pending');
	let rejectingId = $state('');
	let rejectionReason = $state('');

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [pendingData, deleteData] = await Promise.allSettled([
				api.get('/api/admin/property-approval?status=Pending'),
				api.get('/api/admin/property-approval?deleteRequests=true')
			]);
			properties = pendingData.status === 'fulfilled'
				? (Array.isArray(pendingData.value) ? pendingData.value : [])
				: [];
			deleteRequests = deleteData.status === 'fulfilled'
				? (Array.isArray(deleteData.value) ? deleteData.value : [])
				: [];
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadData);

	async function approveProperty(id) {
		processingId = id;
		try {
			await api.patch(`/api/admin/property-approval`, { propertyId: id, action: 'approve' });
			successMsg = 'Property approved successfully!';
			await loadData();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			processingId = '';
		}
	}

	async function rejectProperty(id) {
		if (!rejectionReason.trim()) {
			alert('Please provide a rejection reason.');
			return;
		}
		processingId = id;
		try {
			await api.patch(`/api/admin/property-approval`, {
				propertyId: id,
				action: 'reject',
				reason: rejectionReason
			});
			successMsg = 'Property rejected.';
			rejectingId = '';
			rejectionReason = '';
			await loadData();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			processingId = '';
		}
	}

	async function approveDelete(id) {
		processingId = id;
		try {
			await api.delete(`/api/admin/property-approval`, { propertyId: id });
			successMsg = 'Property deletion approved.';
			await loadData();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			processingId = '';
		}
	}
</script>

<svelte:head>
	<title>Property Approvals — Admin — Rentora</title>
</svelte:head>

<div class="max-w-6xl mx-auto animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">Property Approvals</h1>
		<p class="text-gray-500 mt-1">Review and approve or reject property listing submissions.</p>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="flex gap-3 mb-8">
		<button
			onclick={() => (activeTab = 'pending')}
			class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all
				{activeTab === 'pending' ? 'bg-rentora-dark text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-rentora-purple'}">
			<span class="material-symbols-outlined text-base">pending_actions</span>
			Pending
			{#if properties.length > 0}
				<span class="px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-bold">{properties.length}</span>
			{/if}
		</button>
		<button
			onclick={() => (activeTab = 'delete')}
			class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all
				{activeTab === 'delete' ? 'bg-rentora-dark text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-rentora-purple'}">
			<span class="material-symbols-outlined text-base">delete_forever</span>
			Delete Requests
			{#if deleteRequests.length > 0}
				<span class="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{deleteRequests.length}</span>
			{/if}
		</button>
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each [1,2,3] as _}
				<div class="bg-white rounded-2xl p-6 shadow-card animate-pulse">
					<div class="flex gap-4">
						<div class="skeleton h-28 w-36 rounded-xl shrink-0"></div>
						<div class="flex-1 space-y-3">
							<div class="skeleton h-6 w-2/3 rounded"></div>
							<div class="skeleton h-4 w-1/2 rounded"></div>
							<div class="skeleton h-4 w-1/3 rounded"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if activeTab === 'pending'}
		{#if properties.length === 0}
			<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
				<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">approval</span>
				<h3 class="text-xl font-bold text-gray-600">All Caught Up!</h3>
				<p class="text-gray-400 mt-2">No pending property approvals.</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each properties as prop (prop.id)}
					<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
						<div class="p-6">
							<div class="flex flex-col sm:flex-row gap-4">
								<!-- Thumbnail -->
								<div class="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
									{#if prop.images?.[0]}
										<img src={prop.images[0]} alt={prop.title} class="w-full h-full object-cover" />
									{:else}
										<div class="w-full h-full flex items-center justify-center">
											<span class="material-symbols-outlined text-3xl text-gray-300">apartment</span>
										</div>
									{/if}
								</div>

								<!-- Info -->
								<div class="flex-1 min-w-0">
									<h3 class="font-bold text-xl text-rentora-dark mb-1">{prop.title}</h3>
									<p class="text-gray-400 text-sm flex items-center gap-1 mb-2">
										<span class="material-symbols-outlined text-base">location_on</span>
										{prop.address}, {prop.city}
									</p>
									<div class="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
										<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
											<span class="material-symbols-outlined text-sm">bed</span>
											{prop.bedrooms} BHK
										</span>
										<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
											<span class="material-symbols-outlined text-sm">payments</span>
											₹{Number(prop.rent).toLocaleString('en-IN')}/mo
										</span>
										{#if prop.ownerName}
											<span class="flex items-center gap-1 text-gray-400">
												<span class="material-symbols-outlined text-sm">person</span>
												{prop.ownerName}
											</span>
										{/if}
									</div>

									{#if prop.description}
										<p class="text-sm text-gray-500 line-clamp-2 mb-3">{prop.description}</p>
									{/if}

									<!-- Actions -->
									{#if rejectingId === prop.id}
										<div class="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2">
											<label for="rejection-reason-{prop.id}" class="block text-sm font-semibold text-gray-700 mb-2">
												Rejection Reason
											</label>
											<textarea
												id="rejection-reason-{prop.id}"
												bind:value={rejectionReason}
												rows="2"
												placeholder="Explain why this listing is rejected..."
												class="input-field resize-none text-sm mb-3"></textarea>
											<div class="flex gap-2">
												<button
													onclick={() => rejectProperty(prop.id)}
													disabled={processingId === prop.id}
													class="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-50">
													{processingId === prop.id ? 'Rejecting...' : 'Confirm Reject'}
												</button>
												<button onclick={() => { rejectingId = ''; rejectionReason = ''; }} class="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
													Cancel
												</button>
											</div>
										</div>
									{:else}
										<div class="flex gap-2 mt-3">
											<button
												onclick={() => approveProperty(prop.id)}
												disabled={processingId === prop.id}
												class="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-50">
												{#if processingId === prop.id}
													<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
												{:else}
													<span class="material-symbols-outlined text-base">check</span>
												{/if}
												Approve
											</button>
											<button
												onclick={() => { rejectingId = prop.id; rejectionReason = ''; }}
												class="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all">
												<span class="material-symbols-outlined text-base">close</span>
												Reject
											</button>
											<a href="/properties/{prop.id}" target="_blank" class="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
												<span class="material-symbols-outlined text-base">open_in_new</span>
												Preview
											</a>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<!-- Delete Requests Tab -->
		{#if deleteRequests.length === 0}
			<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
				<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">delete_forever</span>
				<h3 class="text-xl font-bold text-gray-600">No Pending Deletions</h3>
				<p class="text-gray-400 mt-2">No property deletion requests at this time.</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each deleteRequests as req (req.id)}
					<div class="bg-white rounded-2xl shadow-card border border-red-100 p-6">
						<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<div>
								<div class="flex items-center gap-2 mb-1">
									<span class="material-symbols-outlined text-red-500 text-lg">delete_forever</span>
									<h3 class="font-bold text-lg text-rentora-dark">{req.title}</h3>
								</div>
								<p class="text-gray-400 text-sm">{req.address}, {req.city}</p>
								<p class="text-gray-400 text-xs mt-1">Owner: {req.ownerName || req.ownerId}</p>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => approveDelete(req.id)}
									disabled={processingId === req.id}
									class="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-50">
									{#if processingId === req.id}
										<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{:else}
										<span class="material-symbols-outlined text-base">delete</span>
									{/if}
									Approve Deletion
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>