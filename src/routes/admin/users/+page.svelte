<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { handleApiError } from '$lib/utils/errors.js';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let users = $state([]);
	let loading = $state(true);
	let error = $state('');

	async function loadUsers() {
		loading = true;
		error = '';

		try {
			users = await api.get('/api/admin/users');
		} catch (err) {
			error = handleApiError(err, 'Failed to load users.');
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	async function toggleUser(user) {
		try {
			await api.patch('/api/admin/users', {
				userId: user.id,
				action: user.disabled ? 'enable' : 'disable'
			});

			await loadUsers();
		} catch (err) {
			alert(handleApiError(err));
		}
	}
</script>

<section>
	<SectionHeading title="User Management" />

	{#if loading}
		<LoadingSpinner message="Loading users..." />
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if users.length === 0}
		<EmptyState message="No registered users yet." />
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
								<StatusBadge status={user.disabled ? 'Disabled' : 'Active'} />
							</td>

							<td class="p-4 text-center">
								<button
									onclick={() => toggleUser(user)}
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
