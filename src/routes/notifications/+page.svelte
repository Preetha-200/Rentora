<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { formatDateTime } from '$lib/utils/format.js';
	import { handleApiError } from '$lib/utils/errors.js';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let notifications = $state([]);
	let unread = $state(0);
	let loading = $state(true);
	let error = $state('');

	async function loadNotifications() {
		loading = true;
		error = '';

		try {
			const data = await api.get('/api/notifications');
			notifications = data.notifications;
			unread = data.unread;
		} catch (err) {
			error = handleApiError(err);
		} finally {
			loading = false;
		}
	}

	// PATCH is the correct verb here: it only ever flips read/isRead on a
	// single notification, never replaces the whole document.
	async function markAsRead(id) {
		try {
			await api.patch('/api/notifications', {
				notificationId: id
			});

			await loadNotifications();
		} catch (err) {
			alert(handleApiError(err));
		}
	}

	async function dismissNotification(id) {
		try {
			await api.delete('/api/notifications/delete', {
				notificationId: id
			});

			await loadNotifications();
		} catch (err) {
			alert(handleApiError(err));
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
		<LoadingSpinner message="Loading notifications..." />
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if notifications.length === 0}
		<EmptyState message="No notifications available." />
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
							{formatDateTime(notification.createdAt)}
						</p>
					</div>

					<div class="text-right flex flex-col items-end gap-2">
						{#if notification.read || notification.isRead}
							<span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
								Read
							</span>
						{:else}
							<button
								onclick={() => markAsRead(notification.id)}
								class="px-3 py-2 bg-rentora-purple text-white rounded-lg text-sm hover:bg-rentora-purpleLight">
								Mark as Read
							</button>
						{/if}

						<button
							onclick={() => dismissNotification(notification.id)}
							class="text-xs text-gray-400 hover:text-red-600">
							Dismiss
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
