<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let users = [];
	let loading = true;
	let error = '';

	async function loadUsers() {
		loading = true;
		error = '';

		try {
			users = await api.get('/api/admin/users');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	async function toggleUser(user) {
		try {
			await api.put('/api/admin/users', {
				userId: user.id,
				action: user.disabled ? 'enable' : 'disable'
			});

			await loadUsers();
		} catch (err) {
			alert(err.message);
		}
	}
</script>

<section>
    <h1 class="text-3xl font-bold text-rentora-dark mb-6">
        User Management
    </h1>

    {#if loading}
        <p>Loading users...</p>

    {:else if error}
        <p class="text-red-600">{error}</p>
    {:else}

    <div class="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table class="w-full text-left">
            <thead class="bg-gray-50">
                <tr>
                    <th class="p-4">Name</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Role</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-center">Action</th>
                </tr>
            </thead>

            <tbody>
                {#each users as user}
                    <tr class="border-t">
                        <td class="p-4 font-medium">
                            {user.name}
                        </td>

                        <td class="p-4">
                            {user.email}
                        </td>

                        <td class="p-4 capitalize">
                            {user.role}
                        </td>

                        <td class="p-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold {user.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                                {user.disabled ? 'Disabled' : 'Active'}
                            </span>
                        </td>

                        <td class="p-4 text-center">
                            <button
                                on:click={() => toggleUser(user)}
                                class="px-4 py-2 rounded-lg text-white {user.disabled ? 'bg-green-600' : 'bg-red-600'}">
                                {user.disabled ? 'Enable' : 'Disable'}
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {/if}
</section>


