<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');
	let title = $state('');
	let location = $state('');
	let price = $state('');
	let submitting = $state(false);

	async function loadProperties() {
		loading = true;
		error = '';

		try {
			properties = await api.property.getMyProperties();
		} catch (err) {
			error = err.message || 'Failed to load properties';
			properties = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadProperties);

	async function addProperty(e) {
		e.preventDefault();

		submitting = true;
		error = '';

		const formData = new FormData();

		formData.append('title', title);
		formData.append('description', '');
		formData.append('address', location);
		formData.append('city', '');
		formData.append('rent', Number(price));
		formData.append('bedrooms', 1);
		formData.append('bathrooms', 1);
		formData.append('furnishing', 'unfurnished');
		formData.append('amenities', '');

		try {
			const imgRes = await fetch(
				'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
			);

			const blob = await imgRes.blob();

			formData.append('images', blob, 'placeholder.jpg');
		} catch {
			const canvas = document.createElement('canvas');
			canvas.width = 800;
			canvas.height = 400;

			const ctx = canvas.getContext('2d');

			ctx.fillStyle = '#f0f0f0';
			ctx.fillRect(0, 0, 800, 400);

			ctx.fillStyle = '#444';
			ctx.font = '40px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('Property Image', 400, 220);

			const blob = await new Promise((resolve) =>
				canvas.toBlob(resolve, 'image/jpeg')
			);

			formData.append('images', blob, 'placeholder.jpg');
		}

		try {
			await api.property.create(formData);

			title = '';
			location = '';
			price = '';

			await loadProperties();
		} catch (err) {
			error = err.message || 'Failed to add property';
		} finally {
			submitting = false;
		}
	}

	async function handleDelete(id) {
		if (!confirm('Are you sure you want to delete this property?')) return;

		try {
			await api.property.remove(id);
			await loadProperties();
		} catch (err) {
			alert(err.message);
		}
	}

	function handleEdit(id) {
		goto(`/owner/properties/edit/${id}`);
	}

	function getStatusInfo(status) {
		switch (status) {
			case 'Approved':
				return {
					label: 'Approved',
					cls: 'bg-green-50 text-green-700'
				};

			case 'Rejected':
				return {
					label: 'Rejected',
					cls: 'bg-red-50 text-red-700'
				};

			default:
				return {
					label: 'Pending',
					cls: 'bg-amber-50 text-amber-700'
				};
		}
	}
</script>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Property Management
	</h1>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">

			<h2 class="text-xl font-bold mb-4">
				Add New Property
			</h2>

			<form on:submit|preventDefault={addProperty} class="space-y-4">

				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
						Property Title
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Apartment Name" />
				</div>

				<div>
					<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
						Location
					</label>
					<input
						id="location"
						type="text"
						bind:value={location}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="City, Area" />
				</div>

				<div>
					<label
						for="price"
						class="block text-sm font-medium text-gray-700 mb-1">

						Monthly Rent (₹)

					</label>

					<input
						id="price"
						type="number"
						bind:value={price}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Amount" />
				</div>

				{#if error}
					<p class="text-sm text-red-500">
						{error}
					</p>
				{/if}

				<button
					type="submit"
					disabled={submitting}
					class="w-full py-2.5 bg-rentora-purple text-white font-semibold rounded-xl hover:bg-rentora-purpleLight transition disabled:opacity-50">

					{submitting ? 'Adding...' : 'Submit Listing'}

				</button>

			</form>

		</div>

		<div class="lg:col-span-2">

			{#if loading}

				<div class="bg-white rounded-2xl p-8 text-center shadow-sm">
					<p class="text-gray-500">
						Loading your properties...
					</p>
				</div>

			{:else if properties.length === 0}

				<div class="bg-white rounded-2xl p-8 text-center shadow-sm">

					<h3 class="text-xl font-semibold text-rentora-dark mb-2">
						No Properties Yet
					</h3>

					<p class="text-gray-500">
						Start by adding your first rental property.
					</p>

				</div>

			{:else}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

					{#each properties as property (property.id)}

						{@const info = getStatusInfo(property.status)}

						<div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">

							<img
								src={
									property.images?.[0]?.url ||
									property.images?.[0] ||
									'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
								}
								alt={property.title}
								class="w-full h-48 object-cover" />

							<div class="p-5 flex flex-col flex-1">

								<div class="flex justify-between items-start">

									<h3 class="font-bold text-lg text-rentora-dark">
										{property.title}
									</h3>

									<span
										class={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${info.cls}`}>

										{info.label}

									</span>

								</div>

								<p class="text-gray-500 text-sm mt-2">
									{property.address || property.city || 'No location'}
								</p>

								<div class="mt-4 font-bold text-rentora-dark text-lg">
									₹{property.rent}/month
								</div>

								<div class="mt-4 pt-4 border-t border-gray-50">

									<div class="flex gap-3">

										<button
											on:click={() => handleEdit(property.id)}
											class="flex-1 py-2.5 rounded-xl border border-rentora-purple text-rentora-purple bg-fuchsia-50 font-semibold hover:bg-rentora-purple hover:text-white transition">

											Edit

										</button>

										<button
											on:click={() => handleDelete(property.id)}
											class="flex-1 py-2.5 rounded-xl border border-rentora-dark text-rentora-dark bg-indigo-50 font-semibold hover:bg-rentora-dark hover:text-white transition">

											Delete

										</button>

									</div>

								</div>

							</div>

						</div>

					{/each}

				</div>

			{/if}

		</div>

	</div>
</div>