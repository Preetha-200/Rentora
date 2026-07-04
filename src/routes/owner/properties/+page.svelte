<script>
	import { mockProperties } from '$lib/mockData.js';

	let properties = $state([...mockProperties]);
	let title = $state('');
	let location = $state('');
	let price = $state('');

	function addProperty(e) {
		e.preventDefault();
		const newProperty = {
			id: `prop-${Date.now()}`,
			title,
			location,
			price: Number(price),
			status: 'Pending',
			image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
		};
		properties = [...properties, newProperty];
		title = '';
		location = '';
		price = '';
	}

	function handleEdit(id) {
		window.location.href = `/owner/properties/edit/${id}`;
	}

	function handleDelete(id) {
		if (!confirm('Are you sure you want to delete this property?')) return;
		properties = properties.filter((p) => p.id !== id);
	}
</script>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Property Management
	</h1>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

		<!-- Left Panel -->
		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
			<h2 class="text-xl font-bold mb-4">
				Add New Property
			</h2>

			<!-- Quick add form (optional – you can keep the button only) -->
			<form on:submit|preventDefault={addProperty} class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Apartment Name"
					/>
				</div>
				<div>
					<label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
					<input
						id="location"
						type="text"
						bind:value={location}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="City, Area"
					/>
				</div>
				<div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
					<input
						id="price"
						type="number"
						bind:value={price}
						required
						class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Amount"
					/>
				</div>
				<button
					type="submit"
					class="w-full py-2.5 bg-rentora-purple text-white font-semibold rounded-xl hover:bg-rentora-purpleLight transition duration-200"
				>
					Submit Listing
				</button>
			</form>

			<!-- Alternatively, keep just the button if you prefer -->
			<!--
			<p class="text-gray-500 text-sm mb-6">
				Create a new property listing for rent.
			</p>
			<a
				href="/owner/properties/add"
				class="block w-full text-center py-3 bg-rentora-purple text-white font-semibold rounded-xl hover:bg-rentora-purpleLight transition"
			>
				+ Add Property
			</a>
			-->
		</div>

		<!-- Property List -->
		<div class="lg:col-span-2">
			{#if properties.length === 0}
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
						<div
							class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
						>
							<img
								src={property.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
								alt={property.title}
								class="w-full h-48 object-cover"
							/>

							<div class="p-5 flex flex-col flex-1">
								<div class="flex justify-between items-start">
									<h3 class="font-bold text-lg text-rentora-dark">
										{property.title}
									</h3>
									<span
										class="text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide
										{property.status === 'Approved'
											? 'bg-green-50 text-green-700'
											: property.status === 'Rejected'
											? 'bg-red-50 text-red-700'
											: 'bg-amber-50 text-amber-700'}"
									>
										{property.status || 'Pending'}
									</span>
								</div>

								<p class="text-gray-500 text-sm mt-2">
									{property.location}
								</p>

								<div class="mt-4 font-bold text-rentora-dark text-lg">
									₹{property.price}/month
								</div>

								<div class="mt-4 pt-4 border-t border-gray-50">
									<div class="flex gap-3">
										<button
											on:click={() => handleEdit(property.id)}
											class="flex-1 py-2.5 rounded-xl border border-rentora-purple text-rentora-purple bg-fuchsia-50 font-semibold hover:bg-rentora-purple hover:text-white transition"
										>
											Edit
										</button>
										<button
											on:click={() => handleDelete(property.id)}
											class="flex-1 py-2.5 rounded-xl border border-rentora-dark text-rentora-dark bg-indigo-50 font-semibold hover:bg-rentora-dark hover:text-white transition"
										>
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