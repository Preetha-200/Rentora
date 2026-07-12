<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');
	let submitting = $state(false);
	let successMsg = $state('');
	let showAddForm = $state(false);
	let editingProperty = $state(null);
	let deletingId = $state('');

	// Add form fields
	let title = $state('');
	let description = $state('');
	let address = $state('');
	let city = $state('');
	let rent = $state('');
	let bedrooms = $state(1);
	let bathrooms = $state(1);
	let furnishing = $state('Unfurnished');
	let amenities = $state('');
	let totalUnits = $state(1);
	let propertyType = $state('Apartment');
	let selectedImages = $state([]);

	async function loadProperties() {
		loading = true;
		error = '';
		try {
			properties = await api.property.getMyProperties();
		} catch (err) {
			error = err.message;
			properties = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadProperties);

	function handleImageChange(event) {
		selectedImages = Array.from(event.target.files);
	}

	function resetForm() {
		title = '';
		description = '';
		address = '';
		city = '';
		rent = '';
		bedrooms = 1;
		bathrooms = 1;
		furnishing = 'Unfurnished';
		amenities = '';
		totalUnits = 1;
		propertyType = 'Apartment';
		selectedImages = [];
	}

	async function addProperty(event) {
		event.preventDefault();
		error = '';
		submitting = true;
		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('description', description);
			formData.append('address', address);
			formData.append('city', city);
			formData.append('rent', rent);
			formData.append('bedrooms', String(bedrooms));
			formData.append('bathrooms', String(bathrooms));
			formData.append('furnishing', furnishing);
			formData.append('amenities', amenities);
			formData.append('totalUnits', String(totalUnits));
			formData.append('type', propertyType);
			for (const image of selectedImages) {
				formData.append('images', image);
			}
			await api.property.create(formData);
			successMsg = 'Property submitted for admin approval!';
			resetForm();
			showAddForm = false;
			await loadProperties();
			setTimeout(() => (successMsg = ''), 4000);
		} catch (err) {
			error = err.message;
		} finally {
			submitting = false;
		}
	}

	function openEditor(property) {
		editingProperty = {
			...structuredClone(property),
			amenitiesStr: Array.isArray(property.amenities)
				? property.amenities.join(', ')
				: property.amenities || '',
			newImages: []
		};
	}

	function closeEditor() {
		editingProperty = null;
	}

	async function saveEdit(event) {
		event.preventDefault();
		try {
			const formData = new FormData();
			formData.append('title', editingProperty.title);
			formData.append('description', editingProperty.description);
			formData.append('address', editingProperty.address);
			formData.append('city', editingProperty.city);
			formData.append('rent', String(editingProperty.rent));
			formData.append('bedrooms', String(editingProperty.bedrooms));
			formData.append('bathrooms', String(editingProperty.bathrooms));
			formData.append('furnishing', editingProperty.furnishing);
			formData.append('amenities', editingProperty.amenitiesStr);
			formData.append('totalUnits', String(editingProperty.totalUnits));
			if (editingProperty.type) formData.append('type', editingProperty.type);
			if (editingProperty.newImages?.length) {
				for (const image of editingProperty.newImages) {
					formData.append('images', image);
				}
			}
			await api.property.update(editingProperty.id, formData);
			editingProperty = null;
			successMsg = 'Property updated successfully!';
			await loadProperties();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		}
	}

	async function requestDelete(id) {
		if (!confirm('Send a deletion request to the admin? This property will be reviewed before removal.')) return;
		deletingId = id;
		try {
			// Fixed: was /properties/${id} (missing /api prefix)
			await api.delete(`/api/properties/${id}`);
			successMsg = 'Deletion request sent to admin.';
			await loadProperties();
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err) {
			alert(err.message);
		} finally {
			deletingId = '';
		}
	}

	function getStatusInfo(prop) {
		const status = prop.approvalStatus || prop.status;
		const map = {
			Approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
			Rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
			'Delete Requested': { label: 'Delete Pending', cls: 'bg-orange-100 text-orange-700' }
		};
		return map[status] || { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700' };
	}
</script>

<svelte:head>
	<title>My Properties — Owner Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-7xl mx-auto animate-fade-in">
	<div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-black text-rentora-dark">My Properties</h1>
			<p class="text-gray-500 mt-1">Manage your rental listings and submit new properties.</p>
		</div>
		<button
			onclick={() => { showAddForm = !showAddForm; editingProperty = null; }}
			class="flex items-center gap-2 px-5 py-3 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all active:scale-95">
			<span class="material-symbols-outlined">{showAddForm ? 'close' : 'add'}</span>
			{showAddForm ? 'Cancel' : 'Add Property'}
		</button>
	</div>

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	<!-- Add Property Form -->
	{#if showAddForm}
		<div class="bg-white rounded-2xl shadow-card border border-rentora-purple/20 p-8 mb-8 animate-fade-in">
			<h2 class="text-xl font-bold text-rentora-dark mb-6 flex items-center gap-2">
				<span class="material-symbols-outlined text-rentora-purple filled">apartment</span>
				Add New Property
			</h2>
			<form onsubmit={addProperty}>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
					<div class="sm:col-span-2">
						<label for="prop-title" class="block text-sm font-semibold text-gray-700 mb-2">Property Title</label>
						<input id="prop-title" type="text" bind:value={title} required placeholder="e.g., Spacious 2BHK in Koramangala" class="input-field" />
					</div>
					<div>
						<label for="prop-type" class="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
						<select id="prop-type" bind:value={propertyType} class="input-field">
							{#each ['Apartment', 'House', 'Villa', 'Studio', 'PG', 'Office'] as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="prop-rent" class="block text-sm font-semibold text-gray-700 mb-2">Monthly Rent (₹)</label>
						<input id="prop-rent" type="number" bind:value={rent} required min="0" placeholder="25000" class="input-field" />
					</div>
					<div>
						<label for="prop-city" class="block text-sm font-semibold text-gray-700 mb-2">City</label>
						<input id="prop-city" type="text" bind:value={city} required placeholder="Bangalore" class="input-field" />
					</div>
					<div>
						<label for="prop-address" class="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
						<input id="prop-address" type="text" bind:value={address} required placeholder="123 MG Road, Indiranagar" class="input-field" />
					</div>
					<div>
						<label for="prop-beds" class="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
						<input id="prop-beds" type="number" bind:value={bedrooms} min="0" max="20" class="input-field" />
					</div>
					<div>
						<label for="prop-baths" class="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
						<input id="prop-baths" type="number" bind:value={bathrooms} min="1" max="20" class="input-field" />
					</div>
					<div>
						<label for="prop-furnishing" class="block text-sm font-semibold text-gray-700 mb-2">Furnishing</label>
						<select id="prop-furnishing" bind:value={furnishing} class="input-field">
							{#each ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] as f}
								<option value={f}>{f}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="prop-units" class="block text-sm font-semibold text-gray-700 mb-2">Total Units</label>
						<input id="prop-units" type="number" bind:value={totalUnits} min="1" class="input-field" />
					</div>
					<div class="sm:col-span-2">
						<label for="prop-amenities" class="block text-sm font-semibold text-gray-700 mb-2">Amenities (comma-separated)</label>
						<input id="prop-amenities" type="text" bind:value={amenities} placeholder="Parking, WiFi, Gym, Swimming Pool..." class="input-field" />
					</div>
					<div class="sm:col-span-2">
						<label for="prop-desc" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
						<textarea id="prop-desc" bind:value={description} rows="3" placeholder="Describe the property, location highlights, nearby landmarks..." class="input-field resize-none"></textarea>
					</div>
					<div class="sm:col-span-2">
						<label for="prop-images" class="block text-sm font-semibold text-gray-700 mb-2">
							Property Images
							<span class="text-gray-400 font-normal ml-1">({selectedImages.length} selected)</span>
						</label>
						<label for="prop-images" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-rentora-purple hover:bg-rentora-purplePale/30 transition-all">
							<span class="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
							<p class="text-sm text-gray-500">Click to upload images</p>
						</label>
						<input id="prop-images" type="file" multiple accept="image/*" class="hidden" onchange={handleImageChange} />
					</div>
				</div>

				{#if error}
					<div class="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
						<span class="material-symbols-outlined text-base">error</span>
						{error}
					</div>
				{/if}

				<div class="flex justify-end gap-3">
					<button type="button" onclick={() => { showAddForm = false; resetForm(); }} class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
						Cancel
					</button>
					<button type="submit" disabled={submitting} class="flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all disabled:opacity-50">
						{#if submitting}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Submitting...
						{:else}
							<span class="material-symbols-outlined text-base">send</span>
							Submit for Approval
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Edit Modal -->
	{#if editingProperty}
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
			<div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div class="sticky top-0 bg-white px-8 pt-8 pb-4 border-b border-gray-100 flex justify-between items-center">
					<h2 class="text-xl font-bold text-rentora-dark">Edit Property</h2>
					<button onclick={closeEditor} class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
						<span class="material-symbols-outlined text-xl">close</span>
					</button>
				</div>
				<form onsubmit={saveEdit} class="px-8 py-6">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div class="sm:col-span-2">
							<label for="edit-title" class="block text-sm font-semibold text-gray-700 mb-2">Title</label>
							<input id="edit-title" type="text" bind:value={editingProperty.title} required class="input-field" />
						</div>
						<div>
							<label for="edit-rent" class="block text-sm font-semibold text-gray-700 mb-2">Rent (₹)</label>
							<input id="edit-rent" type="number" bind:value={editingProperty.rent} required class="input-field" />
						</div>
						<div>
							<label for="edit-city" class="block text-sm font-semibold text-gray-700 mb-2">City</label>
							<input id="edit-city" type="text" bind:value={editingProperty.city} required class="input-field" />
						</div>
						<div>
							<label for="edit-address" class="block text-sm font-semibold text-gray-700 mb-2">Address</label>
							<input id="edit-address" type="text" bind:value={editingProperty.address} required class="input-field" />
						</div>
						<div>
							<label for="edit-bedrooms" class="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
							<input id="edit-bedrooms" type="number" bind:value={editingProperty.bedrooms} min="0" class="input-field" />
						</div>
						<div>
							<label for="edit-bathrooms" class="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
							<input id="edit-bathrooms" type="number" bind:value={editingProperty.bathrooms} min="1" class="input-field" />
						</div>
						<div>
							<label for="edit-furnishing" class="block text-sm font-semibold text-gray-700 mb-2">Furnishing</label>
							<select id="edit-furnishing" bind:value={editingProperty.furnishing} class="input-field">
								{#each ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] as f}
									<option value={f}>{f}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="edit-units" class="block text-sm font-semibold text-gray-700 mb-2">Total Units</label>
							<input id="edit-units" type="number" bind:value={editingProperty.totalUnits} min="1" class="input-field" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-amenities" class="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
							<input id="edit-amenities" type="text" bind:value={editingProperty.amenitiesStr} placeholder="Parking, WiFi..." class="input-field" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-description" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
							<textarea id="edit-description" bind:value={editingProperty.description} rows="3" class="input-field resize-none"></textarea>
						</div>
					</div>
					<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
						<button type="button" onclick={closeEditor} class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
							Cancel
						</button>
						<button type="submit" class="flex items-center gap-2 px-5 py-2.5 bg-rentora-dark text-white rounded-xl font-semibold hover:bg-rentora-blue transition-all">
							<span class="material-symbols-outlined text-base">save</span>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Properties List -->
	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each [1,2,3] as _}
				<div class="bg-white rounded-2xl shadow-card overflow-hidden">
					<div class="skeleton h-44 rounded-none"></div>
					<div class="p-5 space-y-3">
						<div class="skeleton h-5 w-3/4 rounded"></div>
						<div class="skeleton h-4 w-1/2 rounded"></div>
						<div class="skeleton h-10 rounded"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if properties.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">apartment</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">No Properties Yet</h3>
			<p class="text-gray-400 mb-6">Add your first property to get started.</p>
			<button onclick={() => (showAddForm = true)} class="inline-flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold text-sm hover:bg-rentora-purpleLight transition-all">
				<span class="material-symbols-outlined text-base">add</span>
				Add Property
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each properties as property (property.id)}
				{@const statusInfo = getStatusInfo(property)}
				<div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col">
					<!-- Image -->
					<div class="relative">
						{#if property.images?.[0]}
							<img src={property.images[0]} alt={property.title} class="w-full h-44 object-cover" />
						{:else}
							<div class="w-full h-44 bg-gradient-to-br from-rentora-blue/20 to-rentora-purple/20 flex items-center justify-center">
								<span class="material-symbols-outlined text-5xl text-gray-300">apartment</span>
							</div>
						{/if}
						<span class="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg {statusInfo.cls}">
							{statusInfo.label}
						</span>
					</div>

					<!-- Content -->
					<div class="p-5 flex-1 flex flex-col">
						<h3 class="font-bold text-rentora-dark text-lg line-clamp-1 mb-1">{property.title}</h3>
						<p class="text-gray-400 text-sm flex items-center gap-1 mb-2">
							<span class="material-symbols-outlined text-base">location_on</span>
							{property.address}, {property.city}
						</p>
						<div class="flex items-center gap-3 text-xs text-slate-500 mb-4">
							<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
								<span class="material-symbols-outlined text-sm">bed</span>
								{property.bedrooms} BHK
							</span>
							<span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
								<span class="material-symbols-outlined text-sm">bathroom</span>
								{property.bathrooms}
							</span>
							<span class="text-base font-bold text-rentora-dark ml-auto">
								₹{Number(property.rent).toLocaleString('en-IN')}
								<span class="text-xs text-gray-400 font-normal">/mo</span>
							</span>
						</div>

						<div class="flex gap-2 mt-auto">
							<button
								onclick={() => openEditor(property)}
								class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rentora-purple/30 text-rentora-purple font-semibold text-sm hover:bg-rentora-purplePale transition-all">
								<span class="material-symbols-outlined text-base">edit</span>
								Edit
							</button>
							<button
								onclick={() => requestDelete(property.id)}
								disabled={deletingId === property.id}
								class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-50">
								{#if deletingId === property.id}
									<div class="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
								{:else}
									<span class="material-symbols-outlined text-base">delete</span>
								{/if}
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>