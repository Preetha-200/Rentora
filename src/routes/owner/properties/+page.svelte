<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');
	let submitting = $state(false);
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
	let selectedImages = $state([]);
	let editingProperty = $state(null);
	async function loadProperties() {
		loading = true;
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
	async function addProperty(event) {
		event.preventDefault();
		error = '';
		submitting = true;
		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('address', address);
		formData.append('city', city);
		formData.append('rent', rent);
		formData.append('bedrooms', bedrooms);
		formData.append('bathrooms', bathrooms);
		formData.append('furnishing', furnishing);
		formData.append('amenities', amenities);
		formData.append('totalUnits', totalUnits);
		for (const image of selectedImages) {
			formData.append('images', image);
		}
		try {
			await api.property.create(formData);
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
			selectedImages = [];
			await loadProperties();
		} catch (err) {
			error = err.message;
		} finally {
			submitting = false;
		}
	}
	async function requestDelete(id) {
		if (
			!confirm(
				'This will send a deletion request to the administrator.'
			)
		)
			return;
		try {
			await api.delete(`/properties/${id}`);
			await loadProperties();
		} catch (err) {
			alert(err.message);
		}
	}
	function openEditor(property) {
		editingProperty = structuredClone(property);
	}
	function closeEditor() {
		editingProperty = null;
	}
		async function saveEdit() {
		try {
			const formData = new FormData();
			formData.append('title', editingProperty.title);
			formData.append('description', editingProperty.description);
			formData.append('address', editingProperty.address);
			formData.append('city', editingProperty.city);
			formData.append('rent', editingProperty.rent);
			formData.append('bedrooms', editingProperty.bedrooms);
			formData.append('bathrooms', editingProperty.bathrooms);
			formData.append('furnishing', editingProperty.furnishing);
			formData.append(
				'amenities',
				Array.isArray(editingProperty.amenities)
					? editingProperty.amenities.join(', ')
					: editingProperty.amenities
			);
			formData.append('totalUnits', editingProperty.totalUnits);
			if (editingProperty.newImages) {
				for (const image of editingProperty.newImages) {
					formData.append('images', image);
				}
			}
			await api.property.update(editingProperty.id, formData);
			editingProperty = null;
			await loadProperties();
		} catch (err) {
			alert(err.message);
		}
	}
	function getStatusInfo(status) {
		switch (status) {
			case 'Approved':
				return {
					label: 'Approved',
					cls: 'bg-green-100 text-green-700'
				};
			case 'Rejected':
				return {
					label: 'Rejected',
					cls: 'bg-red-100 text-red-700'
				};
			default:
				return {
					label: 'Pending Approval',
					cls: 'bg-yellow-100 text-yellow-700'
				};
		}
	}
</script>
<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		My Properties
	</h1>
	<div class="grid lg:grid-cols-3 gap-8">
		<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
			<h2 class="text-xl font-bold mb-5">
				Add New Property
			</h2>
			<form
				on:submit|preventDefault={addProperty}
				class="space-y-4">
				<input
					bind:value={title}
					required
					placeholder="Property Title"
					class="w-full border rounded-xl p-3" />
				<textarea
					bind:value={description}
					rows="3"
					placeholder="Description"
					class="w-full border rounded-xl p-3">
				</textarea>
				<input
					bind:value={address}
					required
					placeholder="Address"
					class="w-full border rounded-xl p-3" />
				<input
					bind:value={city}
					required
					placeholder="City"
					class="w-full border rounded-xl p-3" />
				<input
					type="number"
					bind:value={rent}
					required
					placeholder="Monthly Rent"
					class="w-full border rounded-xl p-3" />
				<div class="grid grid-cols-2 gap-3">
					<input
						type="number"
						min="1"
						bind:value={bedrooms}
						placeholder="Bedrooms"
						class="border rounded-xl p-3" />
					<input
						type="number"
						min="1"
						bind:value={bathrooms}
						placeholder="Bathrooms"
						class="border rounded-xl p-3" />
				</div>
				<select
					bind:value={furnishing}
					class="w-full border rounded-xl p-3">
					<option>Unfurnished</option>
					<option>Semi Furnished</option>
					<option>Fully Furnished</option>
				</select>
				<input
					bind:value={amenities}
					placeholder="Amenities (comma separated)"
					class="w-full border rounded-xl p-3" />
				<input
					type="number"
					min="1"
					bind:value={totalUnits}
					placeholder="Total Units"
					class="w-full border rounded-xl p-3" />
				<div>
					<label class="font-semibold">
						Upload Images (Max 6)
					</label>
					<input
						type="file"
						accept="image/*"
						multiple
						on:change={(e) => {
							const files = [...e.target.files];
							if (files.length > 6) {
								alert('Maximum 6 images allowed.');
								return;
							}
							selectedImages = files;
						}}
						class="mt-2" />
				</div>
								{#if error}
					<p class="text-sm text-red-600">
						{error}
					</p>
				{/if}
				<button
					type="submit"
					disabled={submitting}
					class="w-full bg-rentora-purple text-white py-3 rounded-xl font-semibold hover:bg-rentora-purpleLight disabled:opacity-50">
					{submitting ? 'Submitting for Approval...' : 'Submit Property'}
				</button>
			</form>
		</div>
		<div class="lg:col-span-2">
			{#if loading}
				<div class="bg-white rounded-2xl p-8 text-center shadow">
					Loading properties...
				</div>
			{:else if properties.length === 0}
				<div class="bg-white rounded-2xl p-8 text-center shadow">
					No properties added yet.
				</div>
			{:else}
				<div class="grid md:grid-cols-2 gap-6">
					{#each properties as property (property.id)}
						{@const status = getStatusInfo(property.approvalStatus || property.status)}
						<div class="bg-white rounded-2xl shadow border overflow-hidden">
							<img
								src={
									property.images?.[0] ||
									'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200'
								}
								alt={property.title}
								class="w-full h-52 object-cover" />
							<div class="p-5 space-y-4">
								<div class="flex justify-between items-start">
									<div>
										<h3 class="font-bold text-xl">
											{property.title}
										</h3>
										<p class="text-sm text-gray-500">
											{property.address}, {property.city}
										</p>
									</div>
									<span
										class={`px-3 py-1 rounded-full text-xs font-bold ${status.cls}`}>
										{status.label}
									</span>
								</div>
								<p class="text-gray-700 text-sm line-clamp-3">
									{property.description}
								</p>
								<div class="grid grid-cols-2 gap-3 text-sm">
									<div>
										<strong>Rent</strong><br />
										₹{property.rent}/month
									</div>
									<div>
										<strong>Bedrooms</strong><br />
										{property.bedrooms}
									</div>
									<div>
										<strong>Bathrooms</strong><br />
										{property.bathrooms}
									</div>
									<div>
										<strong>Furnishing</strong><br />
										{property.furnishing}
									</div>
								</div>
								<div class="grid grid-cols-3 gap-3">
									<div class="rounded-xl bg-blue-50 p-3 text-center">
										<div class="text-xs text-gray-500">
											Units
										</div>
										<div class="font-bold text-lg">
											{property.totalUnits}
										</div>
									</div>
									<div class="rounded-xl bg-green-50 p-3 text-center">
										<div class="text-xs text-gray-500">
											Tenants
										</div>
										<div class="font-bold text-lg">
											{property.tenantCount}
										</div>
									</div>
									<div class="rounded-xl bg-orange-50 p-3 text-center">
										<div class="text-xs text-gray-500">
											Vacant
										</div>
										<div class="font-bold text-lg">
											{property.vacancyCount}
										</div>
									</div>
								</div>
								<div class="flex flex-wrap gap-2">
									{#each property.amenities || [] as amenity}
										<span
											class="px-2 py-1 rounded bg-purple-100 text-xs">
											{amenity}
										</span>
									{/each}
								</div>
								<div class="flex gap-3 pt-3">
									<button
										class="flex-1 bg-rentora-purple text-white py-2 rounded-xl"
										on:click={() => openEditor(property)}>
										Edit
									</button>
									<button
										class="flex-1 bg-red-600 text-white py-2 rounded-xl"
										on:click={() => requestDelete(property.id)}
										disabled={property.deleteRequested}>
										{property.deleteRequested
											? 'Delete Requested'
											: 'Request Delete'}
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
		{#if editingProperty}
		<div
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div
				class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div class="p-6">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-2xl font-bold">
							Edit Property
						</h2>
						<button
							on:click={closeEditor}
							class="text-gray-500 hover:text-black text-2xl">
							×
						</button>
					</div>
					<div class="space-y-4">
						<input
							bind:value={editingProperty.title}
							class="w-full border rounded-xl p-3"
							placeholder="Title" />
						<textarea
							rows="4"
							bind:value={editingProperty.description}
							class="w-full border rounded-xl p-3"
							placeholder="Description">
						</textarea>
						<input
							bind:value={editingProperty.address}
							class="w-full border rounded-xl p-3"
							placeholder="Address" />
						<input
							bind:value={editingProperty.city}
							class="w-full border rounded-xl p-3"
							placeholder="City" />
						<input
							type="number"
							bind:value={editingProperty.rent}
							class="w-full border rounded-xl p-3"
							placeholder="Monthly Rent" />
						<div class="grid grid-cols-2 gap-3">
							<input
								type="number"
								bind:value={editingProperty.bedrooms}
								class="border rounded-xl p-3"
								placeholder="Bedrooms" />
							<input
								type="number"
								bind:value={editingProperty.bathrooms}
								class="border rounded-xl p-3"
								placeholder="Bathrooms" />
						</div>
						<select
							bind:value={editingProperty.furnishing}
							class="w-full border rounded-xl p-3">
							<option>Unfurnished</option>
							<option>Semi Furnished</option>
							<option>Fully Furnished</option>
						</select>
						<input
							bind:value={editingProperty.amenities}
							class="w-full border rounded-xl p-3"
							placeholder="Amenities (comma separated)" />
						<input
							type="number"
							bind:value={editingProperty.totalUnits}
							class="w-full border rounded-xl p-3"
							placeholder="Total Units" />
						<div>
							<label class="font-semibold block mb-2">
								Add New Images (Maximum 6)
							</label>
							<input
								type="file"
								multiple
								accept="image/*"
								on:change={(e) => {
									const files = [...e.target.files];
									if (files.length > 6) {
										alert('Maximum 6 images allowed.');
										return;
									}
									editingProperty.newImages = files;
								}} />
						</div>
						{#if editingProperty.images?.length}
							<div>
								<p class="font-semibold mb-3">
									Current Images
								</p>
								<div class="grid grid-cols-3 gap-3">
									{#each editingProperty.images as image}
										<img
											src={image}
											alt=""
											class="h-24 w-full rounded-lg object-cover border" />
									{/each}
								</div>
							</div>
						{/if}
						<div class="flex gap-4 pt-6">
							<button
								on:click={saveEdit}
								class="flex-1 bg-rentora-purple text-white py-3 rounded-xl font-semibold">
								Save Changes
							</button>
							<button
								on:click={closeEditor}
								class="flex-1 border py-3 rounded-xl font-semibold">
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>