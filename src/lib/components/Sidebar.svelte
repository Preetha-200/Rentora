<script>
	import { goto } from '$app/navigation';

	let { role = 'Tenant', links = [] } = $props();

	let user = $state(null);

	if (typeof window !== 'undefined') {
		const storedUser = localStorage.getItem('rentora_user');
		if (storedUser) {
			user = JSON.parse(storedUser);
		}
	}

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('rentora_user');

		window.dispatchEvent(new Event('storage'));

		goto('/');
	}
</script>

<aside class="w-64 bg-rentora-dark text-white min-h-screen p-6 flex flex-col justify-between shadow-xl">
	<div>
		<div class="mb-8 flex flex-col items-center text-center border-b border-slate-700 pb-6">

			<div
				class="w-20 h-20 rounded-full bg-rentora-purple flex items-center justify-center text-3xl font-bold text-white mb-4">

				{user?.name?.charAt(0).toUpperCase() || 'U'}

			</div>

			<h2 class="text-lg font-bold">
				{user?.name || 'User'}
			</h2>

			<p class="text-sm text-slate-400 mt-1">
				{user?.email || ''}
			</p>

			<span class="text-xs uppercase tracking-widest text-rentora-purple font-bold mt-3">
				{role} Portal
			</span>

		</div>

		<nav class="space-y-1">
			{#each links as link}
				<a
					href={link.href}
					class="block py-2.5 px-4 rounded-xl transition duration-200 font-medium text-slate-300 hover:bg-white/10 hover:text-white">

					{link.name}

				</a>
			{/each}
		</nav>
	</div>

	<button
		on:click={logout}
		class="w-full bg-rentora-purple hover:bg-rentora-purpleLight py-3 px-4 rounded-xl text-sm font-semibold transition duration-200 tracking-wide shadow-md shadow-rentora-purple/20">

		Logout

	</button>
</aside>