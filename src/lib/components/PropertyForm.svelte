<script>
	export let property = null;
	export let onSubmit = () => {};
	export let loading = false;

	let formData = {
		title: property?.title || '',
		description: property?.description || '',
		address: property?.address || '',
		city: property?.city || '',
		rent: property?.rent || '',
		bedrooms: property?.bedrooms || '',
		bathrooms: property?.bathrooms || '',
		furnishing: property?.furnishing || 'unfurnished',
		amenities: property?.amenities ? property.amenities.join(', ') : '',
		status: property?.status || 'Available'
	};

	let existingImages = property?.images ? [...property.images] : [];
	let files = [];
	let newPreviewUrls = [];

	function handleFileChange(event) {
		const selected = Array.from(event.target.files);

		if (existingImages.length + files.length + selected.length > 6) {
			alert('Maximum 6 images allowed.');
			return;
		}

		files = [...files, ...selected];
		newPreviewUrls = files.map((file) => URL.createObjectURL(file));
	}

	function removeExistingImage(index) {
		existingImages.splice(index, 1);
		existingImages = [...existingImages];
	}

	function removeNewImage(index) {
		files.splice(index, 1);
		files = [...files];
		newPreviewUrls = files.map((file) => URL.createObjectURL(file));
	}

	function handleSubmit(event) {
		event.preventDefault();

		if (existingImages.length + files.length === 0) {
			alert('At least one image is required.');
			return;
		}

		const form = new FormData();

		for (const key in formData) {
			form.append(key, formData[key]);
		}

		existingImages.forEach((image) => {
			form.append('existingImages', image);
		});

		files.forEach((file) => {
			form.append('images', file);
		});

		onSubmit(form);
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label class="block text-sm font-medium">Title</label>
		<input type="text" bind:value={formData.title} required class="w-full border rounded px-3 py-2" />
	</div>

	<div>
		<label class="block text-sm font-medium">Description</label>
		<textarea bind:value={formData.description} rows="3" class="w-full border rounded px-3 py-2" />
	</div>

	<div>
		<label class="block text-sm font-medium">Address</label>
		<input type="text" bind:value={formData.address} required class="w-full border rounded px-3 py-2" />
	</div>

	<div>
		<label class="block text-sm font-medium">City</label>
		<input type="text" bind:value={formData.city} required class="w-full border rounded px-3 py-2" />
	</div>

	<div class="grid grid-cols-3 gap-4">
		<div>
			<label class="block text-sm font-medium">Rent (₹)</label>
			<input type="number" bind:value={formData.rent} required class="w-full border rounded px-3 py-2" />
		</div>

		<div>
			<label class="block text-sm font-medium">Bedrooms</label>
			<input type="number" bind:value={formData.bedrooms} required class="w-full border rounded px-3 py-2" />
		</div>

		<div>
			<label class="block text-sm font-medium">Bathrooms</label>
			<input type="number" bind:value={formData.bathrooms} required class="w-full border rounded px-3 py-2" />
		</div>
	</div>

	<div>
		<label class="block text-sm font-medium">Furnishing</label>
		<select bind:value={formData.furnishing} class="w-full border rounded px-3 py-2">
			<option value="unfurnished">Unfurnished</option>
			<option value="semi-furnished">Semi-furnished</option>
			<option value="fully-furnished">Fully-furnished</option>
		</select>
	</div>

	<div>
		<label class="block text-sm font-medium">Amenities (comma separated)</label>
		<input type="text" bind:value={formData.amenities} placeholder="WiFi, Parking, AC" class="w-full border rounded px-3 py-2" />
	</div>

	<div>
		<label class="block text-sm font-medium mb-2">Existing Images ({existingImages.length}/6)</label>

		{#if existingImages.length}
			<div class="flex flex-wrap gap-3 mb-4">
				{#each existingImages as image, index}
					<div class="relative">
						<img src={image} alt="" class="w-24 h-24 object-cover rounded border" />
						<button
							type="button"
							on:click={() => removeExistingImage(index)}
							class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs">
							✕
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<input type="file" multiple accept="image/*" on:change={handleFileChange} class="w-full" />

		{#if newPreviewUrls.length}
			<div class="flex flex-wrap gap-3 mt-4">
				{#each newPreviewUrls as image, index}
					<div class="relative">
						<img src={image} alt="" class="w-24 h-24 object-cover rounded border" />
						<button
							type="button"
							on:click={() => removeNewImage(index)}
							class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs">
							✕
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div>
		<label class="block text-sm font-medium">Status</label>
		<select bind:value={formData.status} class="w-full border rounded px-3 py-2">
			<option value="Available">Available</option>
			<option value="Rented">Rented</option>
		</select>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
		{loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
	</button>
</form>