<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	// Properties state
	let properties = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let selectedType = $state('All');
	let selectedBHK = $state('All');
	let maxPrice = $state('');

	// FAQ
	let openFaq = $state(null);

	// Stats counter
	let statsVisible = $state(false);
	let statsRef;

	const faqs = [
		{
			q: 'How does Rentora verify properties?',
			a: 'Every property listed on Rentora goes through a multi-step admin approval process. Owners submit details and images; our team reviews and approves only genuine, well-documented listings.'
		},
		{
			q: 'Can I request a rental directly from the platform?',
			a: 'Yes! As a tenant, simply browse approved properties, click "Request to Rent," and the owner will be notified instantly. You can track all your requests from your dashboard.'
		},
		{
			q: 'What happens after my rental request is approved?',
			a: 'Once the owner approves your request, a lease is created automatically, your tenant count is recorded, and you get full access to the maintenance and payment tracking features.'
		},
		{
			q: 'How does property maintenance work?',
			a: 'Tenants can raise maintenance issues from their dashboard. The owner is notified and can mark the issue as "In Progress" or "Fixed." Only after the tenant confirms resolution is the ticket permanently closed.'
		},
		{
			q: 'Is my data secure?',
			a: 'Absolutely. Rentora uses Firebase Authentication and Firestore with strict role-based security rules. Your sessions are managed server-side with HttpOnly cookies — no sensitive data lives in the browser.'
		}
	];

	const testimonials = [
		{
			name: 'Priya Sharma',
			role: 'Tenant, Bangalore',
			initials: 'PS',
			text: 'Found my dream apartment in 2 days. The approval process was transparent and the owner was responsive. Rentora made the whole experience stress-free.',
			rating: 5
		},
		{
			name: 'Rahul Mehta',
			role: 'Property Owner, Mumbai',
			initials: 'RM',
			text: "Managing 4 properties used to be chaos. Now I review requests, track maintenance, and monitor payments all from one clean dashboard. Game changer.",
			rating: 5
		},
		{
			name: 'Anitha Krishnan',
			role: 'Tenant, Chennai',
			initials: 'AK',
			text: 'The maintenance ticketing system is brilliant. I raised an issue, the owner fixed it within 2 days, and I confirmed resolution. So seamless!',
			rating: 5
		}
	];

	const features = [
		{
			icon: 'verified',
			title: 'Verified Listings',
			desc: 'Every property undergoes admin review and approval. No fake listings, ever.'
		},
		{
			icon: 'build',
			title: 'Smart Maintenance',
			desc: 'Raise, track, and confirm maintenance issues through a transparent ticketing workflow.'
		},
		{
			icon: 'payments',
			title: 'Payment Tracking',
			desc: 'Monitor rent payments, dues, and receipts — all in one place for owners and tenants.'
		},
		{
			icon: 'notifications_active',
			title: 'Real-time Alerts',
			desc: 'Instant notifications for approvals, requests, and maintenance updates. Never miss a thing.'
		},
		{
			icon: 'description',
			title: 'Digital Agreements',
			desc: 'Lease agreements created automatically when a rental is approved. Paperless and secure.'
		},
		{
			icon: 'shield',
			title: 'Secure & Private',
			desc: 'Server-side sessions, role-based access control, and encrypted data throughout.'
		}
	];

	let propertyTypes = $state(['All']);

	async function loadProperties() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/properties?status=Approved');
			properties = Array.isArray(data) ? data : [];
			propertyTypes = ['All', ...new Set(properties.map((p) => p.type).filter(Boolean))];
		} catch (err) {
			error = err.message || 'Failed to load properties.';
			properties = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProperties();

		// Intersection observer for stats animation
		if (statsRef) {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						statsVisible = true;
						observer.disconnect();
					}
				},
				{ threshold: 0.3 }
			);
			observer.observe(statsRef);
		}
	});

	let filteredProperties = $derived(
		properties.filter((property) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				!searchQuery ||
				property.title?.toLowerCase().includes(q) ||
				property.address?.toLowerCase().includes(q) ||
				property.city?.toLowerCase().includes(q);
			const matchesType = selectedType === 'All' || property.type === selectedType;
			const matchesBHK =
				selectedBHK === 'All' || Number(property.bedrooms) === Number(selectedBHK);
			const matchesPrice = !maxPrice || Number(property.rent) <= Number(maxPrice);
			return matchesSearch && matchesType && matchesBHK && matchesPrice;
		})
	);

	const featuredProperties = $derived(filteredProperties.slice(0, 6));
</script>

<svelte:head>
	<title>Rentora</title>
	<meta name="description" content="Find verified rental properties, manage maintenance, track payments, and connect with owners — all on Rentora, India's smartest rental platform." />
</svelte:head>

<!-- ===== HERO SECTION ===== -->
<section class="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
	<!-- Animated background orbs -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-rentora-purple/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl animate-float" style="animation-delay: 1.5s"></div>
		<div class="absolute top-3/4 left-1/2 w-48 h-48 bg-rentora-purple/10 rounded-full blur-2xl animate-float" style="animation-delay: 3s"></div>
	</div>

	<!-- Grid overlay -->
	<div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px;"></div>

	<div class="section-container relative z-10 py-24">
		<div class="max-w-4xl">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm">
				<span class="material-symbols-outlined text-base text-rentora-purple filled">verified</span>
				India's Trusted Rental Platform
			</div>

			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6">
				Find Your
				<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
					Perfect Home
				</span>
			</h1>

			<p class="text-xl text-white/70 leading-relaxed max-w-2xl mb-10">
				Browse verified rental properties across India. Connect with owners, track maintenance,
				and manage agreements — all from one intelligent platform.
			</p>

			<div class="flex flex-wrap gap-4">
				<a href="/register" class="inline-flex items-center gap-2 px-8 py-4 bg-rentora-purple text-white font-bold rounded-2xl hover:bg-rentora-purpleLight transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
					<span class="material-symbols-outlined">search</span>
					Start Browsing
				</a>
				<a href="/register?role=owner" class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm">
					<span class="material-symbols-outlined">apartment</span>
					List Property
				</a>
			</div>

			<!-- Quick stats row -->
			<div class="flex flex-wrap gap-8 mt-16">
				{#each [
					{ value: '1,200+', label: 'Properties Listed' },
					{ value: '850+', label: 'Happy Tenants' },
					{ value: '98%', label: 'Approval Rate' }
				] as stat}
					<div>
						<div class="text-3xl font-black text-white">{stat.value}</div>
						<div class="text-sm text-white/60 mt-0.5">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- ===== SEARCH & FILTER SECTION ===== -->
<section class="bg-white border-b border-gray-100 sticky top-20 z-30 shadow-sm">
	<div class="section-container py-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
			<div class="lg:col-span-2">
				<label for="hero-search" class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Location / Property</label>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-gray-400">search</span>
					<input
						id="hero-search"
						type="text"
						bind:value={searchQuery}
						placeholder="City, address or property name..."
						class="input-field pl-10" />
				</div>
			</div>

			<div>
				<label for="type-filter" class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Type</label>
				<select id="type-filter" bind:value={selectedType} class="input-field">
					{#each propertyTypes as t}
						<option value={t}>{t}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="bhk-filter" class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Bedrooms</label>
				<select id="bhk-filter" bind:value={selectedBHK} class="input-field">
					<option value="All">Any</option>
					<option value="1">1 BHK</option>
					<option value="2">2 BHK</option>
					<option value="3">3 BHK</option>
					<option value="4">4+ BHK</option>
				</select>
			</div>

			<div>
				<label for="budget-filter" class="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Max Budget</label>
				<input
					id="budget-filter"
					type="number"
					bind:value={maxPrice}
					placeholder="₹ per month"
					class="input-field" />
			</div>
		</div>
	</div>
</section>

<!-- ===== FEATURED PROPERTIES ===== -->
<section class="py-20 bg-rentora-grayLight">
	<div class="section-container">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
			<div>
				<div class="inline-flex items-center gap-2 text-rentora-purple text-sm font-bold uppercase tracking-widest mb-3">
					<span class="material-symbols-outlined text-base filled">star</span>
					Verified Listings
				</div>
				<h2 class="text-4xl font-black text-rentora-dark">
					Featured Properties
				</h2>
				<p class="text-gray-500 mt-2">
					{filteredProperties.length} properties available · Updated today
				</p>
			</div>
			{#if filteredProperties.length > 6}
				<a href="/properties" class="mt-4 sm:mt-0 inline-flex items-center gap-2 text-rentora-purple font-semibold hover:gap-3 transition-all">
					View All
					<span class="material-symbols-outlined text-lg">arrow_forward</span>
				</a>
			{/if}
		</div>

		{#if loading}
			<!-- Skeleton loaders -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each [1,2,3,4,5,6] as _}
					<div class="bg-white rounded-2xl overflow-hidden shadow-card">
						<div class="skeleton h-56 w-full rounded-none"></div>
						<div class="p-6 space-y-3">
							<div class="skeleton h-6 rounded w-3/4"></div>
							<div class="skeleton h-4 rounded w-1/2"></div>
							<div class="skeleton h-4 rounded w-full"></div>
							<div class="skeleton h-10 rounded w-full mt-4"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
				<span class="material-symbols-outlined text-4xl block mb-2">error</span>
				{error}
			</div>
		{:else if featuredProperties.length === 0}
			<div class="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
				<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">apartment</span>
				<h3 class="text-xl font-bold text-gray-600 mb-2">No properties found</h3>
				<p class="text-gray-400">Try adjusting your search filters.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each featuredProperties as property (property.id)}
					<article class="bg-white rounded-2xl overflow-hidden shadow-card card-hover flex flex-col">
						<!-- Image -->
						<div class="relative overflow-hidden">
							{#if property.images?.[0]}
								<img
									src={property.images[0]}
									alt={property.title}
									class="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
									loading="lazy" />
							{:else}
								<div class="w-full h-56 bg-gradient-to-br from-rentora-blue/20 to-rentora-purple/20 flex items-center justify-center">
									<span class="material-symbols-outlined text-6xl text-gray-300">apartment</span>
								</div>
							{/if}
							<!-- Type badge -->
							<span class="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/95 text-rentora-dark shadow-sm uppercase tracking-wider">
								{property.type || 'Residential'}
							</span>
							<!-- Vacancy badge -->
							{#if Number(property.vacancyCount) === 0}
								<span class="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-500 text-white shadow-sm uppercase tracking-wider">
									Full
								</span>
							{:else}
								<span class="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-500 text-white shadow-sm uppercase tracking-wider">
									Available
								</span>
							{/if}
						</div>

						<!-- Content -->
						<div class="p-6 flex-1 flex flex-col">
							<div class="flex-1">
								<h3 class="text-lg font-bold text-rentora-dark line-clamp-1 mb-1">{property.title}</h3>
								<p class="text-gray-400 text-sm flex items-center gap-1">
									<span class="material-symbols-outlined text-base">location_on</span>
									{property.address}, {property.city}
								</p>

								<!-- Specs row -->
								<div class="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-500">
									<span class="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg">
										<span class="material-symbols-outlined text-sm">bed</span>
										{property.bedrooms} BHK
									</span>
									<span class="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg">
										<span class="material-symbols-outlined text-sm">bathroom</span>
										{property.bathrooms} Bath
									</span>
									{#if property.furnishing}
										<span class="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg capitalize">
											{property.furnishing.replace('Furnished', 'Furn.')}
										</span>
									{/if}
								</div>

								<!-- Amenities -->
								{#if property.amenities?.length}
									<div class="flex flex-wrap gap-1.5 mt-3">
										{#each property.amenities.slice(0, 3) as amenity}
											<span class="text-[10px] bg-rentora-purplePale text-rentora-purple font-bold px-2 py-0.5 rounded-md">
												{amenity}
											</span>
										{/each}
										{#if property.amenities.length > 3}
											<span class="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
												+{property.amenities.length - 3} more
											</span>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Price & CTA -->
							<div class="mt-5 pt-5 border-t border-gray-50 flex justify-between items-center">
								<div>
									<span class="text-2xl font-black text-rentora-dark">
										₹{Number(property.rent).toLocaleString('en-IN')}
									</span>
									<span class="text-gray-400 text-xs font-medium">/month</span>
								</div>
								<button
									onclick={() => goto(`/properties/${property.id}`)}
									class="bg-rentora-dark text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-rentora-purple transition-all duration-200 flex items-center gap-1.5 group">
									View Details
									<span class="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- ===== WHY CHOOSE RENTORA ===== -->
<section class="py-24 bg-white">
	<div class="section-container">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<div class="inline-flex items-center gap-2 text-rentora-purple text-sm font-bold uppercase tracking-widest mb-4">
				<span class="material-symbols-outlined text-base">favorite</span>
				Why Rentora
			</div>
			<h2 class="text-4xl font-black text-rentora-dark mb-4">
				Built for Modern Renters
			</h2>
			<p class="text-gray-500 text-lg leading-relaxed">
				A complete ecosystem for property owners and tenants — transparent, efficient, and fully digital.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature, i}
				<div class="group p-8 rounded-2xl border border-gray-100 hover:border-rentora-purple/30 hover:shadow-lg transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-rentora-purplePale/30">
					<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rentora-dark to-rentora-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
						<span class="material-symbols-outlined text-white text-2xl filled">{feature.icon}</span>
					</div>
					<h3 class="text-xl font-bold text-rentora-dark mb-3">{feature.title}</h3>
					<p class="text-gray-500 leading-relaxed">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ===== PLATFORM STATISTICS ===== -->
<section class="py-24 hero-gradient relative overflow-hidden" bind:this={statsRef}>
	<div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px); background-size: 60px 60px;"></div>

	<div class="section-container relative z-10">
		<div class="text-center mb-16">
			<h2 class="text-4xl font-black text-white mb-4">Platform at a Glance</h2>
			<p class="text-white/60 text-lg">Trusted by thousands across India</p>
		</div>

		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#each [
				{ value: '1,200+', label: 'Properties Listed', icon: 'apartment' },
				{ value: '850+', label: 'Active Tenants', icon: 'group' },
				{ value: '320+', label: 'Property Owners', icon: 'person' },
				{ value: '98%', label: 'Satisfaction Rate', icon: 'thumb_up' }
			] as stat, i}
				<div class="text-center {statsVisible ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: {i * 0.15}s">
					<div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
						<span class="material-symbols-outlined text-2xl text-white/80 filled">{stat.icon}</span>
					</div>
					<div class="text-5xl font-black text-white mb-2">{stat.value}</div>
					<div class="text-white/60 font-medium">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ===== TESTIMONIALS ===== -->
<section class="py-24 bg-rentora-grayLight">
	<div class="section-container">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<div class="inline-flex items-center gap-2 text-rentora-purple text-sm font-bold uppercase tracking-widest mb-4">
				<span class="material-symbols-outlined text-base filled">star</span>
				Testimonials
			</div>
			<h2 class="text-4xl font-black text-rentora-dark">
				Loved by Users
			</h2>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each testimonials as t}
				<div class="bg-white rounded-2xl p-8 shadow-card border border-gray-100 flex flex-col">
					<!-- Stars -->
					<div class="flex gap-1 mb-6">
						{#each Array(t.rating) as _}
							<span class="material-symbols-outlined text-lg text-amber-400 filled">star</span>
						{/each}
					</div>

					<p class="text-gray-600 leading-relaxed flex-1 italic">"{t.text}"</p>

					<div class="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
						<div class="w-12 h-12 rounded-full bg-gradient-to-br from-rentora-purple to-rentora-dark text-white flex items-center justify-center font-bold text-lg">
							{t.initials}
						</div>
						<div>
							<div class="font-bold text-rentora-dark">{t.name}</div>
							<div class="text-sm text-gray-400">{t.role}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ===== FAQ SECTION ===== -->
<section class="py-24 bg-white">
	<div class="section-container">
		<div class="max-w-3xl mx-auto">
			<div class="text-center mb-16">
				<div class="inline-flex items-center gap-2 text-rentora-purple text-sm font-bold uppercase tracking-widest mb-4">
					<span class="material-symbols-outlined text-base">help</span>
					FAQ
				</div>
				<h2 class="text-4xl font-black text-rentora-dark">Frequently Asked</h2>
			</div>

			<div class="space-y-4">
				{#each faqs as faq, i}
					<div class="border border-gray-200 rounded-2xl overflow-hidden hover:border-rentora-purple/30 transition-colors">
						<button
							onclick={() => openFaq = openFaq === i ? null : i}
							class="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-rentora-dark hover:bg-gray-50 transition-colors">
							<span>{faq.q}</span>
							<span class="material-symbols-outlined text-rentora-purple transition-transform duration-300 {openFaq === i ? 'rotate-180' : ''}">
								expand_more
							</span>
						</button>
						{#if openFaq === i}
							<div class="px-6 pb-6 text-gray-500 leading-relaxed animate-fade-in">
								{faq.a}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- ===== CTA BANNER ===== -->
<section class="py-20 bg-gradient-to-r from-rentora-dark to-rentora-blue relative overflow-hidden">
	<div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 100% 50%, #9C27B0 0%, transparent 50%);"></div>
	<div class="section-container relative z-10 text-center">
		<h2 class="text-4xl font-black text-white mb-4">Ready to Find Your Next Home?</h2>
		<p class="text-white/70 text-lg mb-8 max-w-xl mx-auto">
			Join thousands of tenants and owners already using Rentora to simplify property rentals.
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a href="/register" class="px-8 py-4 bg-rentora-purple text-white font-bold rounded-2xl hover:bg-rentora-purpleLight transition-all hover:scale-105">
				Create Free Account
			</a>
			<a href="/login" class="px-8 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
				Sign In
			</a>
		</div>
	</div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="bg-rentora-dark text-white">
	<div class="section-container py-16">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
			<!-- Brand -->
			<div class="md:col-span-2">
				<div class="flex items-center gap-3 mb-5">
					<div class="w-10 h-10 rounded-xl bg-rentora-purple flex items-center justify-center">
						<span class="material-symbols-outlined text-white text-lg filled">apartment</span>
					</div>
					<span class="text-2xl font-black tracking-widest">RENTORA</span>
				</div>
				<p class="text-slate-400 leading-relaxed max-w-xs">
					India's smartest rental platform connecting property owners and tenants through a transparent, digital-first experience.
				</p>
				<div class="flex gap-3 mt-6">
					{#each ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'] as social}
						<div class="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-rentora-purple transition-colors cursor-pointer">
							<span class="material-symbols-outlined text-sm">link</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Links -->
			<div>
				<h4 class="font-bold text-white mb-4 uppercase tracking-wider text-sm">Platform</h4>
				<ul class="space-y-3">
					{#each ['Browse Properties', 'List Property', 'How It Works', 'Pricing'] as item}
						<li><a href="/" class="text-slate-400 hover:text-white transition-colors text-sm">{item}</a></li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="font-bold text-white mb-4 uppercase tracking-wider text-sm">Company</h4>
				<ul class="space-y-3">
					{#each ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] as item}
						<li><a href="/" class="text-slate-400 hover:text-white transition-colors text-sm">{item}</a></li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
			<p>© 2026 Rentora. All rights reserved.</p>
			<p>Made with <span class="material-symbols-outlined text-base text-red-400 filled">favorite</span> in India</p>
		</div>
	</div>
</footer>