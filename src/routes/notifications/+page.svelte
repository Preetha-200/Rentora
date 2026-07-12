<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let notifications = $state([]);
	let loading = $state(true);
	let error = $state('');
	let markingAll = $state(false);

	async function loadNotifications() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/notifications');
			notifications = Array.isArray(data) ? data : data?.notifications || [];
		} catch (err) {
			error = err.message;
			notifications = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadNotifications);

	async function markRead(id) {
		try {
			await api.post('/api/notifications/read', { notificationId: id });
			notifications = notifications.map((n) => n.id === id ? { ...n, read: true, isRead: true } : n);
		} catch {}
	}

	async function markAllRead() {
		markingAll = true;
		try {
			const unread = notifications.filter((n) => !n.read && !n.isRead);
			await Promise.allSettled(unread.map((n) => api.post('/api/notifications/read', { notificationId: n.id })));
			notifications = notifications.map((n) => ({ ...n, read: true, isRead: true }));
		} catch (err) {
			alert(err.message);
		} finally {
			markingAll = false;
		}
	}

	const unreadCount = $derived(notifications.filter((n) => !n.read && !n.isRead).length);

	function notifIcon(type) {
		const map = {
			RENTAL_REQUEST: 'assignment',
			REQUEST_APPROVED: 'check_circle',
			REQUEST_REJECTED: 'cancel',
			PROPERTY_APPROVED: 'apartment',
			PROPERTY_REJECTED: 'domain_disabled',
			MAINTENANCE_FIXED: 'handyman',
			MAINTENANCE_RESOLVED: 'task_alt',
			PAYMENT: 'payments',
			SYSTEM: 'notifications'
		};
		return map[type] || 'notifications';
	}

	function notifColor(type) {
		const approvalTypes = ['REQUEST_APPROVED', 'PROPERTY_APPROVED', 'MAINTENANCE_RESOLVED', 'PAYMENT'];
		const rejectionTypes = ['REQUEST_REJECTED', 'PROPERTY_REJECTED'];
		const infoTypes = ['MAINTENANCE_FIXED', 'RENTAL_REQUEST'];
		if (approvalTypes.includes(type)) return 'from-emerald-500 to-green-600';
		if (rejectionTypes.includes(type)) return 'from-red-500 to-red-600';
		if (infoTypes.includes(type)) return 'from-blue-500 to-blue-700';
		return 'from-rentora-purple to-rentora-dark';
	}

	function timeAgo(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>Notifications — Rentora</title>
</svelte:head>

<div class="max-w-3xl mx-auto animate-fade-in">
	<div class="flex items-end justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-black text-rentora-dark">Notifications</h1>
			<p class="text-gray-500 mt-1">
				{#if unreadCount > 0}
					<span class="text-rentora-purple font-semibold">{unreadCount} unread</span> notification{unreadCount !== 1 ? 's' : ''}
				{:else}
					All caught up!
				{/if}
			</p>
		</div>
		{#if unreadCount > 0}
			<button
				onclick={markAllRead}
				disabled={markingAll}
				class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50">
				{#if markingAll}
					<div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<span class="material-symbols-outlined text-base">done_all</span>
				{/if}
				Mark all read
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each [1,2,3,4,5] as _}
				<div class="bg-white rounded-2xl p-5 shadow-card flex gap-4 animate-pulse">
					<div class="skeleton w-12 h-12 rounded-xl shrink-0"></div>
					<div class="flex-1 space-y-2 py-1">
						<div class="skeleton h-4 w-2/3 rounded"></div>
						<div class="skeleton h-3 w-full rounded"></div>
						<div class="skeleton h-3 w-1/3 rounded"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if notifications.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">notifications_off</span>
			<h3 class="text-xl font-bold text-gray-600">No Notifications</h3>
			<p class="text-gray-400 mt-2">You'll see updates about your rentals and properties here.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each notifications as notif (notif.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div
					onclick={() => !notif.read && markRead(notif.id)}
					class="bg-white rounded-2xl border shadow-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg
						{notif.read ? 'border-gray-100' : 'border-rentora-purple/20 bg-rentora-purplePale/5'}">
					<div class="p-5 flex gap-4">
						<!-- Icon -->
						<div class="relative shrink-0">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br {notifColor(notif.type)} flex items-center justify-center shadow-md">
								<span class="material-symbols-outlined text-white text-lg filled">{notifIcon(notif.type)}</span>
							</div>
							{#if !notif.read}
								<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rentora-purple rounded-full border-2 border-white"></span>
							{/if}
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-1">
								<h3 class="font-bold text-rentora-dark text-sm {!notif.read ? 'text-rentora-dark' : 'text-gray-700'}">
									{notif.title}
								</h3>
								<span class="text-xs text-gray-400 shrink-0 whitespace-nowrap mt-0.5">{timeAgo(notif.createdAt)}</span>
							</div>
							<p class="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-center text-sm text-gray-400 mt-6">{notifications.length} total notifications</p>
	{/if}
</div>
