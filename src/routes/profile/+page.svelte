<script>
	import { goto } from '$app/navigation';

	let user = $state(null);

	if (typeof window !== 'undefined') {
		const storedUser = localStorage.getItem('rentora_user');

		if (!storedUser) {
			goto('/login');
		} else {
			user = JSON.parse(storedUser);
		}
	}

	function dashboardLink() {
		switch (user.role) {
			case 'tenant':
				return '/tenant';

			case 'owner':
				return '/owner';

			case 'admin':
				return '/admin';

			default:
				return '/';
		}
	}
</script>

{#if user}
<div class="max-w-5xl mx-auto px-6 py-12">

	<div class="bg-white rounded-3xl shadow-xl overflow-hidden">

		<div class="bg-rentora-purple h-40 flex justify-center items-end">

			<div
				class="w-32 h-32 rounded-full bg-white border-4 border-white flex items-center justify-center text-5xl font-bold text-rentora-purple translate-y-16">

				{user.name.charAt(0).toUpperCase()}

			</div>

		</div>

		<div class="pt-20 pb-10 px-10">

			<div class="text-center mb-10">

				<h1 class="text-3xl font-bold text-rentora-dark">
					{user.name}
				</h1>

				<p class="text-gray-500 mt-2">
					{user.email}
				</p>

				<span
					class="inline-block mt-4 bg-rentora-purple text-white px-4 py-2 rounded-full text-sm uppercase font-semibold">

					{user.role}

				</span>

			</div>

			<div class="grid md:grid-cols-2 gap-6">

				<div class="bg-gray-50 rounded-2xl p-6">

					<h2 class="text-sm text-gray-500 mb-2">
						Full Name
					</h2>

					<p class="text-lg font-semibold">
						{user.name}
					</p>

				</div>

				<div class="bg-gray-50 rounded-2xl p-6">

					<h2 class="text-sm text-gray-500 mb-2">
						Email Address
					</h2>

					<p class="text-lg font-semibold">
						{user.email}
					</p>

				</div>

				<div class="bg-gray-50 rounded-2xl p-6">

					<h2 class="text-sm text-gray-500 mb-2">
						Phone Number
					</h2>

					<p class="text-lg font-semibold">
						{user.phone || 'Not Available'}
					</p>

				</div>

				<div class="bg-gray-50 rounded-2xl p-6">

					<h2 class="text-sm text-gray-500 mb-2">
						Account Role
					</h2>

					<p class="text-lg font-semibold capitalize">
						{user.role}
					</p>

				</div>

			</div>

			<div class="mt-10 flex justify-center">

				<a
					href={dashboardLink()}
					class="px-8 py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition">

					Back to Dashboard

				</a>

			</div>

		</div>

	</div>

</div>
{/if}