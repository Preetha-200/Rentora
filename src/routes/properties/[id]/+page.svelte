<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let property = $state(data?.property || null);
	let loading = $state(false);
	$effect(() => { if (!property && !loading) loading = false; });
	let activeImage = $state(0);
	let applying = $state(false);
	let alreadyApplied = $state(false);
	let applyMessage = $state('');
	let applyError = $state('');
	let applyNote = $state('');
	let applySuccess = $state(false);

	const images = $derived(property?.images || []);
	const amenitiesList = $derived(
		Array.isArray(property?.amenities)
			? property.amenities
			: typeof property?.amenities === 'string' && property.amenities
				? property.amenities.split(',').map((a) => a.trim()).filter(Boolean)
				: []
	);

	async function checkExistingApplication() {
		if (!$authUser || $authUser.role !== 'tenant' || !property) return;
		try {
			const result = await api.get(`/api/rental-requests?propertyId=${property.id}&tenant=true`);
			const existingRequests = Array.isArray(result) ? result : [];
			alreadyApplied = existingRequests.some((r) => r.propertyId === property.id);
		} catch {
			alreadyApplied = false;
		}
	}

	onMount(async () => {
		if (!property && data?.id) {
			loading = true;
			try {
				property = await api.property.getById(data.id);
			} catch {
				property = null;
			} finally {
				loading = false;
			}
		}
		await checkExistingApplication();
	});

	async function applyNow() {
		if (!$authUser) {
			goto('/login');
			return;
		}
		if ($authUser.role !== 'tenant') {
			applyError = 'Only tenants can apply for rentals.';
			return;
		}
		applyError = '';
		applying = true;
		try {
			await api.post('/api/rental-requests', {
				propertyId: property.id,
				propertyTitle: property.title,
				message: applyNote
			});
			applySuccess = true;
			alreadyApplied = true;
			applyMessage = 'Application submitted! The owner will review and respond shortly.';
		} catch (err) {
			applyError = err.message;
		} finally {
			applying = false;
		}
	}

	function prevImage() {
		activeImage = (activeImage - 1 + images.length) % images.length;
	}

	function nextImage() {
		activeImage = (activeImage + 1) % images.length;
	}
</script>

<svelte:head>
	<title>{property?.title || 'Property Detail'} — Rentora</title>
	<meta name="description" content={property?.description?.substring(0, 160) || 'View this verified rental property on Rentora.'} />
</svelte:head>

{#if loading}
	<div class="max-w-5xl mx-auto px-4 py-12">
		<div class="skeleton h-96 rounded-3xl mb-8"></div>
		<div class="grid grid-cols-3 gap-6">
			<div class="col-span-2 space-y-4">
				<div class="skeleton h-8 w-2/3 rounded"></div>
				<div class="skeleton h-4 w-1/2 rounded"></div>
				<div class="skeleton h-20 rounded"></div>
			</div>
			<div class="skeleton h-48 rounded-2xl"></div>
		</div>
	</div>
{:else if !property}
	<div class="max-w-4xl mx-auto px-4 py-24 text-center">
		<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">apartment</span>
		<h1 class="text-2xl font-bold text-gray-600 mb-2">Property Not Found</h1>
		<p class="text-gray-400 mb-6">This property may have been removed or is no longer available.</p>
		<a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all">
			<span class="material-symbols-outlined">arrow_back</span>
			Back to Listings
		</a>
	</div>
{:else}
	<div class="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
			<a href="/" class="hover:text-rentora-purple transition-colors">Home</a>
			<span class="material-symbols-outlined text-base">chevron_right</span>
			<a href="/" class="hover:text-rentora-purple transition-colors">{property.city}</a>
			<span class="material-symbols-outlined text-base">chevron_right</span>
			<span class="text-rentora-dark font-medium truncate max-w-xs">{property.title}</span>
		</nav>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
			<!-- Left: Images + Details -->
			<div class="lg:col-span-2">
				<!-- Image carousel -->
				<div class="relative rounded-3xl overflow-hidden bg-gray-100 mb-6 aspect-video shadow-premium">
					{#if images.length > 0}
						<img
							src={images[activeImage]}
							alt="{property.title} - photo {activeImage + 1}"
							class="w-full h-full object-cover transition-opacity duration-300" />

						{#if images.length > 1}
							<button onclick={prevImage} class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all backdrop-blur-sm">
								<span class="material-symbols-outlined">chevron_left</span>
							</button>
							<button aria-label="Next image" onclick={nextImage} class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all backdrop-blur-sm">
								<span class="material-symbols-outlined">chevron_right</span>
							</button>

							<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
								{#each images as _, i}
									<button
										onclick={() => (activeImage = i)}
										aria-label="Go to image {i + 1}"
										class="w-2 h-2 rounded-full transition-all {i === activeImage ? 'bg-white w-6' : 'bg-white/50'}">
									</button>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="w-full h-full flex items-center justify-center">
							<span class="material-symbols-outlined text-7xl text-gray-300">apartment</span>
						</div>
					{/if}

					<!-- Status badge -->
					<span class="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-xl
						{Number(property.vacancyCount) > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
						{Number(property.vacancyCount) > 0 ? `${property.vacancyCount} Unit${property.vacancyCount > 1 ? 's' : ''} Available` : 'Fully Occupied'}
					</span>
				</div>

				<!-- Thumbnail strip -->
				{#if images.length > 1}
					<div class="flex gap-3 mb-8 overflow-x-auto pb-2">
						{#each images as img, i}
							<button
								onclick={() => (activeImage = i)}
								class="w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all {i === activeImage ? 'border-rentora-purple shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}">
								<img src={img} alt="Thumbnail {i+1}" class="w-full h-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}

				<!-- Title + basics -->
				<div class="mb-6">
					<div class="flex flex-wrap items-start gap-3 mb-3">
						{#if property.type}
							<span class="text-xs font-bold px-3 py-1 rounded-full bg-rentora-purplePale text-rentora-purple uppercase tracking-wider">
								{property.type}
							</span>
						{/if}
					</div>
					<h1 class="text-3xl font-black text-rentora-dark mb-2">{property.title}</h1>
					<p class="text-gray-400 flex items-center gap-1 text-lg">
						<span class="material-symbols-outlined">location_on</span>
						{property.address}, {property.city}
					</p>
				</div>

				<!-- Specs grid -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
					{#each [
						{ icon: 'bed', label: 'Bedrooms', value: `${property.bedrooms} BHK` },
						{ icon: 'bathroom', label: 'Bathrooms', value: `${property.bathrooms}` },
						{ icon: 'chair', label: 'Furnishing', value: property.furnishing || 'N/A' },
						{ icon: 'domain', label: 'Total Units', value: property.totalUnits || '1' }
					] as spec}
						<div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
							<span class="material-symbols-outlined text-2xl text-rentora-purple filled block mb-2">{spec.icon}</span>
							<div class="text-sm font-bold text-rentora-dark">{spec.value}</div>
							<div class="text-xs text-gray-400 mt-0.5">{spec.label}</div>
						</div>
					{/each}
				</div>

				<!-- Description -->
				{#if property.description}
					<div class="mb-8">
						<h2 class="text-xl font-bold text-rentora-dark mb-3">About This Property</h2>
						<p class="text-gray-600 leading-relaxed">{property.description}</p>
					</div>
				{/if}

				<!-- Amenities -->
				{#if amenitiesList.length > 0}
					<div class="mb-8">
						<h2 class="text-xl font-bold text-rentora-dark mb-4">Amenities</h2>
						<div class="flex flex-wrap gap-3">
							{#each amenitiesList as amenity}
								<span class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-semibold text-rentora-dark">
									<span class="material-symbols-outlined text-base text-rentora-purple filled">check_circle</span>
									{amenity}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right: Pricing card + Apply -->
			<div class="lg:col-span-1">
				<div class="sticky top-24">
					<div class="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
						<!-- Price header -->
						<div class="bg-gradient-to-br from-rentora-dark to-rentora-blue p-6 text-white">
							<p class="text-white/60 text-sm font-medium">Monthly Rent</p>
							<div class="text-4xl font-black mt-1">
								₹{Number(property.rent).toLocaleString('en-IN')}
							</div>
							<p class="text-white/50 text-sm mt-1">+ utilities as applicable</p>
						</div>

						<div class="p-6">
							<!-- Quick specs -->
							<div class="space-y-3 mb-6">
								{#each [
									{ icon: 'location_city', label: 'City', value: property.city },
									{ icon: 'chair', label: 'Furnishing', value: property.furnishing || 'N/A' },
									{ icon: 'inventory_2', label: 'Vacancies', value: `${property.vacancyCount || 0} available` }
								] as item}
									<div class="flex justify-between items-center text-sm">
										<span class="flex items-center gap-2 text-gray-500">
											<span class="material-symbols-outlined text-base">{item.icon}</span>
											{item.label}
										</span>
										<span class="font-semibold text-rentora-dark">{item.value}</span>
									</div>
								{/each}
							</div>

							<!-- Apply section -->
							{#if applySuccess}
								<div class="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
									<span class="material-symbols-outlined text-3xl text-green-500 filled block mb-2">check_circle</span>
									<p class="text-green-700 font-semibold text-sm">{applyMessage}</p>
								</div>
							{:else if alreadyApplied}
								<div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
									<span class="material-symbols-outlined text-2xl text-amber-500 block mb-1">pending</span>
									<p class="text-amber-700 font-semibold text-sm">Application already submitted</p>
								</div>
							{:else if !$authUser}
								<a href="/login" class="block w-full py-4 rounded-xl bg-rentora-purple text-white font-bold text-center hover:bg-rentora-purpleLight transition-all">
									Sign In to Apply
								</a>
							{:else if $authUser.role === 'tenant' && Number(property.vacancyCount) > 0}
								<div>
									<label for="apply-note" class="block text-sm font-semibold text-gray-700 mb-2">
										Add a note <span class="text-gray-400 font-normal">(optional)</span>
									</label>
									<textarea
										id="apply-note"
										bind:value={applyNote}
										rows="3"
										placeholder="Introduce yourself or ask a question..."
										class="input-field resize-none text-sm mb-4"></textarea>

									{#if applyError}
										<p class="text-red-600 text-sm mb-3 flex items-center gap-1">
											<span class="material-symbols-outlined text-base">error</span>
											{applyError}
										</p>
									{/if}

									<button
										onclick={applyNow}
										disabled={applying}
										class="w-full py-4 rounded-xl bg-rentora-purple text-white font-bold hover:bg-rentora-purpleLight transition-all disabled:opacity-50 flex items-center justify-center gap-2">
										{#if applying}
											<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Submitting...
										{:else}
											<span class="material-symbols-outlined">send</span>
											Apply for This Property
										{/if}
									</button>
								</div>
							{:else if Number(property.vacancyCount) === 0}
								<div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
									<span class="material-symbols-outlined text-2xl text-red-400 block mb-1">do_not_disturb</span>
									<p class="text-red-600 font-semibold text-sm">No vacancies available</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
