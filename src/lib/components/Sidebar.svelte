<script>
	import { goto } from '$app/navigation';

	let { role = 'Tenant', links = [] } = $props();

	function logout() {
		localStorage.removeItem('rentora_token');
		localStorage.removeItem('rentora_user');
		goto('/login');
	}
</script>

<aside class="w-64 bg-rentora-dark text-white min-h-screen p-6 flex flex-col justify-between shadow-xl">
	<div>
		<div class="mb-8 flex flex-col items-center text-center border-b border-slate-700 pb-6">
			<img
				src="/logo.png"
				alt="Rentora Logo"
				class="w-20 h-20 object-contain bg-white p-1.5 rounded-xl mb-3 shadow-md"
			/>

			<div>
				<h1 class="text-xl font-bold tracking-wider text-white">
					RENTORA
				</h1>

				<span class="text-xs uppercase tracking-widest text-rentora-purple font-bold block mt-0.5">
					{role} Portal
				</span>
			</div>
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