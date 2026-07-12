<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { api } from '$lib/api';

	let property = $state(null);
	let loading = $state(true);
	let error = $state('');

	let activeImage = $state(0);
	let applying = $state(false);
	let alreadyApplied = $state(false);
	let checkingApplication = $state(false);
	let applyMessage = $state('');
	let applyError = $state('');

	const currentUser =
		typeof window !== 'undefined'
			? JSON.parse(localStorage.getItem('rentora_user') || 'null')
			: null;

	async function loadProperty() {
		loading = true;
		error = '';

		try {
			property = await api.get(`/api/properties/${page.params.id}`);
			activeImage = 0;

			if (currentUser?.role === 'tenant') {
				await checkExistingApplication();
			}
		} catch (err) {
			error = err.message || 'Failed to load property.';
		} finally {
			loading = false;
		}
	}

	async function checkExistingApplication() {
		checkingApplication = true;

		try {
			const result = await api.get(
				`/api/rental-requests?propertyId=${property.id}`
			);
			alreadyApplied = !!result.exists;
		} catch {
			// Non-fatal — if this check fails, the CTA just stays enabled
			// and the server-side duplicate check on submit still applies.
		} finally {
			checkingApplication = false;
		}
	}

	async function applyForProperty() {
		if (applying || alreadyApplied) return;

		applying = true;
		applyError = '';
		applyMessage = '';

		try {
			await api.post('/api/rental-requests', {
				propertyId: property.id
			});

			alreadyApplied = true;
			applyMessage = 'Request sent! The owner has been notified.';
		} catch (err) {
			applyError = err.message || 'Failed to submit request.';
		} finally {
			applying = false;
		}
	}

	function formatRent(rent) {
		return `₹${Number(rent || 0).toLocaleString('en-IN')}`;
	}

	onMount(loadProperty);

	const isOwnProperty = $derived(
		currentUser && property && currentUser.id === property.ownerId
	);

	const vacant = $derived(Number(property?.vacancyCount ?? 1) > 0);

	const ctaLabel = $derived(
		isOwnProperty
			? 'This is your listing'
			: !vacant
				? 'No Vacancies Available'
				: alreadyApplied
					? 'Request Already Sent'
					: applying
						? 'Sending Request...'
						: 'Request to Rent'
	);

	const ctaDisabled = $derived(
		isOwnProperty || !vacant || alreadyApplied || applying || checkingApplication
	);
</script>

{#if loading}
	<div class="max-w-7xl mx-auto px-6 py-12">
		<div class="bg-white rounded-3xl shadow-sm p-10 text-center text-gray-500">
			Loading property...
		</div>
	</div>
{:else if error}
	<div class="max-w-7xl mx-auto px-6 py-12">
		<div class="bg-red-100 text-red-700 rounded-2xl p-6">
			{error}
		</div>
	</div>
{:else}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Main content: gallery + details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Image gallery -->
				<div>
					<div class="relative w-full h-[340px] sm:h-[440px] rounded-3xl overflow-hidden shadow-sm bg-gray-100">
						<img
							src={property.images?.[activeImage]}
							alt={property.title}
							class="w-full h-full object-cover" />

						<span class="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/90 text-rentora-dark shadow-sm uppercase tracking-wider">
							{property.furnishing || 'Residential'}
						</span>

						<span class={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider ${
							vacant ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
						}`}>
							{vacant ? 'Available' : 'Rented'}
						</span>
					</div>

					{#if property.images?.length > 1}
						<div class="grid grid-cols-6 gap-3 mt-3">
							{#each property.images as image, i}
								<button
									onclick={() => (activeImage = i)}
									class={`h-20 rounded-xl overflow-hidden border-2 transition ${
										activeImage === i ? 'border-rentora-purple' : 'border-transparent opacity-80 hover:opacity-100'
									}`}>
									<img src={image} alt="" class="w-full h-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Header + quick facts -->
				<div class="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
					<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
						<div>
							<h1 class="text-3xl sm:text-4xl font-extrabold text-rentora-dark tracking-tight">
								{property.title}
							</h1>

							<p class="text-gray-500 mt-2 flex items-center gap-1.5">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
								{property.address}, {property.city}
							</p>
						</div>

						<div class="text-left sm:text-right shrink-0">
							<p class="text-3xl sm:text-4xl font-black text-rentora-purple">
								{formatRent(property.rent)}
							</p>
							<p class="text-gray-400 text-sm font-medium">per month</p>
						</div>
					</div>

					<div class="flex flex-wrap gap-2 mt-6">
						<span class="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
							🛏️ {property.bedrooms} Bedroom{Number(property.bedrooms) === 1 ? '' : 's'}
						</span>
						<span class="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
							🛁 {property.bathrooms} Bathroom{Number(property.bathrooms) === 1 ? '' : 's'}
						</span>
						<span class="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
							🛋️ {property.furnishing || 'Unfurnished'}
						</span>
						{#if property.totalUnits}
							<span class="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
								🏘️ {property.vacancyCount ?? 0} / {property.totalUnits} units vacant
							</span>
						{/if}
					</div>

					<!-- Description -->
					<div class="mt-8 pt-8 border-t border-gray-100">
						<h2 class="text-xl font-bold text-rentora-dark mb-3">Description</h2>
						<p class="text-gray-600 leading-7 whitespace-pre-wrap max-w-3xl">
							{property.description || 'No description provided.'}
						</p>
					</div>

					<!-- Amenities -->
					{#if property.amenities?.length}
						<div class="mt-8 pt-8 border-t border-gray-100">
							<h2 class="text-xl font-bold text-rentora-dark mb-4">Amenities</h2>

							<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{#each property.amenities as amenity}
									<div class="flex items-center gap-2 text-sm font-semibold bg-purple-50 text-rentora-purple px-3 py-2.5 rounded-xl">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
											<path d="M20 6 9 17l-5-5" />
										</svg>
										{amenity}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Sidebar: CTA + owner card -->
			<div>
				<div class="sticky top-24 space-y-6">
					<div class="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
						<h2 class="text-xl font-bold text-rentora-dark mb-5">Interested in this place?</h2>

						{#if currentUser?.role === 'tenant'}
							<button
								onclick={applyForProperty}
								disabled={ctaDisabled}
								class="w-full py-3.5 rounded-2xl bg-rentora-purple text-white font-bold hover:bg-rentora-purpleLight transition disabled:opacity-50 disabled:cursor-not-allowed">
								{ctaLabel}
							</button>

							{#if applyMessage}
								<p class="mt-3 text-sm text-green-700 bg-green-50 rounded-lg p-2.5 text-center">{applyMessage}</p>
							{/if}
							{#if applyError}
								<p class="mt-3 text-sm text-red-700 bg-red-50 rounded-lg p-2.5 text-center">{applyError}</p>
							{/if}
						{:else if !currentUser}
							<a
								href="/login"
								class="block w-full text-center py-3.5 rounded-2xl bg-rentora-purple text-white font-bold hover:bg-rentora-purpleLight transition">
								Sign in to Request
							</a>
						{:else}
							<p class="text-sm text-gray-400 text-center py-2">
								Only tenants can request to rent a property.
							</p>
						{/if}
					</div>

					<div class="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
						<h2 class="text-lg font-bold text-rentora-dark mb-5">Listed By</h2>

						<div class="flex items-center gap-4">
							<div class="w-14 h-14 rounded-full bg-rentora-purple text-white flex items-center justify-center text-xl font-bold shrink-0">
								{property.ownerName?.charAt(0)?.toUpperCase() || 'O'}
							</div>

							<div class="min-w-0">
								<h3 class="font-bold text-rentora-dark truncate">
									{property.ownerName || 'Property Owner'}
								</h3>
								<p class="text-gray-400 text-sm">Property Owner</p>
							</div>
						</div>

						{#if property.ownerEmail}
							<div class="mt-5 pt-5 border-t border-gray-100">
								<p class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Email</p>
								<p class="font-medium text-sm text-rentora-dark break-all mt-1">
									{property.ownerEmail}
								</p>
							</div>
						{/if}
					</div>

					<div class="bg-rentora-dark text-white rounded-3xl p-6 sm:p-8">
						<h2 class="text-lg font-bold mb-4">Why Rentora?</h2>

						<ul class="space-y-2.5 text-sm text-gray-200">
							<li class="flex items-center gap-2">✔ Admin-verified property listings</li>
							<li class="flex items-center gap-2">✔ Secure, trackable rental requests</li>
							<li class="flex items-center gap-2">✔ Transparent rent & lease tracking</li>
							<li class="flex items-center gap-2">✔ Digital maintenance requests</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
