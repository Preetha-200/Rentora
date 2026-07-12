<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let notifications = [];
	let unread = 0;
	let loading = true;
	let error = '';

	async function loadNotifications() {
		loading = true;
		error = '';

		try {
			const data = await api.get('/api/notifications');
			notifications = data.notifications;
			unread = data.unread;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function markAsRead(id) {
		try {
			await api.put('/api/notifications', {
				notificationId: id
			});

			await loadNotifications();
		} catch (err) {
			alert(err.message);
		}
	}

	onMount(loadNotifications);
</script>

<section class="max-w-5xl mx-auto">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-3xl font-bold text-rentora-dark">
				Notifications
			</h1>
			<p class="text-gray-500 mt-1">
				Unread Notifications:
				<span class="font-semibold text-rentora-purple">
					{unread}
				</span>
			</p>
		</div>
	</div>

	{#if loading}

		<div class="bg-white rounded-xl shadow p-8 text-center">
			Loading notifications...
		</div>

	{:else if error}

		<p class="text-red-600">{error}</p>

	{:else if notifications.length === 0}

		<div class="bg-white rounded-xl shadow p-10 text-center text-gray-500">
			No notifications available.
		</div>

	{:else}

		<div class="space-y-4">
			{#each notifications as notification}
				<div class="bg-white rounded-xl shadow-sm border p-5 flex justify-between items-start">
					<div>
						<h3 class="font-semibold text-lg">
							{notification.title}
						</h3>

						<p class="text-gray-600 mt-1">
							{notification.message}
						</p>

						<p class="text-xs text-gray-400 mt-2">
							{new Date(notification.createdAt).toLocaleString()}
						</p>
					</div>

					<div class="text-right">
						{#if notification.read || notification.isRead}
							<span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
								Read
							</span>
						{:else}
							<button
								on:click={() => markAsRead(notification.id)}
								class="px-3 py-2 bg-rentora-purple text-white rounded-lg text-sm hover:bg-rentora-purpleLight">
								Mark as Read
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

	{/if}
</section>