<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let issues = $state([]);
	let loading = $state(true);
	let error = $state('');
	let updatingId = $state('');
	let successMsg = $state('');
	let showNewForm = $state(false);

	// New issue form state
	let newTitle = $state('');
	let newDescription = $state('');
	let submitting = $state(false);
	let formError = $state('');

	async function loadIssues() {
		loading = true;
		error = '';
		try {
			const data = await api.get('/api/maintenance?tenant=true');
			issues = Array.isArray(data) ? data : data.complaints || [];
		} catch (err) {
			error = err.message;
			issues = [];
		} finally {
			loading = false;
		}
	}

	onMount(loadIssues);

	async function submitIssue(event) {
		event.preventDefault();
		formError = '';
		submitting = true;
		try {
			await api.post('/api/maintenance', {
				title: newTitle,
				description: newDescription
			});
			newTitle = '';
			newDescription = '';
			showNewForm = false;
			await loadIssues();
		} catch (err) {
			formError = err.message;
		} finally {
			submitting = false;
		}
	}

	async function confirmResolved(issueId) {
		if (!confirm('Are you sure the issue is fully resolved? This will permanently close the ticket.')) return;
		updatingId = issueId;
		successMsg = '';
		try {
			await api.patch(`/api/maintenance/${issueId}`, { status: 'Resolved' });
			successMsg = 'Issue confirmed as resolved and closed. Thank you!';
			await loadIssues();
			setTimeout(() => (successMsg = ''), 4000);
		} catch (err) {
			alert(err.message);
		} finally {
			updatingId = '';
		}
	}

	function statusBadge(status) {
		const map = {
			Pending: 'bg-amber-100 text-amber-700',
			'In Progress': 'bg-blue-100 text-blue-700',
			Fixed: 'bg-purple-100 text-purple-700',
			Resolved: 'bg-green-100 text-green-700'
		};
		return map[status] || 'bg-gray-100 text-gray-600';
	}

	const statusOrder = { Pending: 0, 'In Progress': 1, Fixed: 2, Resolved: 3 };
	const sortedIssues = $derived(
		[...issues].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))
	);

	const awaitingConfirmation = $derived(issues.filter((i) => i.status === 'Fixed').length);
</script>

<svelte:head>
	<title>Maintenance — Tenant Dashboard — Rentora</title>
</svelte:head>

<div class="max-w-4xl mx-auto animate-fade-in">
	<div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-black text-rentora-dark">Maintenance</h1>
			<p class="text-gray-500 mt-1">Report and track maintenance issues for your rental.</p>
		</div>
		<button
			onclick={() => (showNewForm = !showNewForm)}
			class="flex items-center gap-2 px-5 py-3 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all active:scale-95">
			<span class="material-symbols-outlined text-lg">{showNewForm ? 'close' : 'add'}</span>
			{showNewForm ? 'Cancel' : 'Report Issue'}
		</button>
	</div>

	<!-- Confirmation alert -->
	{#if awaitingConfirmation > 0}
		<div class="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-center gap-4">
			<div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
				<span class="material-symbols-outlined text-purple-600 text-xl filled">notification_important</span>
			</div>
			<div class="flex-1">
				<h3 class="font-bold text-purple-800">{awaitingConfirmation} issue{awaitingConfirmation > 1 ? 's' : ''} awaiting your confirmation</h3>
				<p class="text-purple-600 text-sm mt-0.5">Your owner has marked these as fixed. Please scroll down and confirm if resolved.</p>
			</div>
		</div>
	{/if}

	{#if successMsg}
		<div class="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
			<span class="material-symbols-outlined text-green-500 filled">check_circle</span>
			<p class="text-green-700 font-medium text-sm">{successMsg}</p>
		</div>
	{/if}

	<!-- New Issue Form -->
	{#if showNewForm}
		<div class="bg-white rounded-2xl shadow-card border border-rentora-purple/20 p-6 mb-8 animate-fade-in">
			<h2 class="text-xl font-bold text-rentora-dark mb-5 flex items-center gap-2">
				<span class="material-symbols-outlined text-rentora-purple filled">report_problem</span>
				Report New Issue
			</h2>
			<form onsubmit={submitIssue} class="space-y-4">
				<div>
					<label for="issue-title" class="block text-sm font-semibold text-gray-700 mb-2">Issue Title</label>
					<input
						id="issue-title"
						type="text"
						bind:value={newTitle}
						required
						placeholder="e.g., Leaking kitchen tap, Broken window latch..."
						class="input-field" />
				</div>
				<div>
					<label for="issue-desc" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
					<textarea
						id="issue-desc"
						bind:value={newDescription}
						required
						rows="4"
						placeholder="Please describe the issue in detail — location, severity, when it started..."
						class="input-field resize-none"></textarea>
				</div>
				{#if formError}
					<div class="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
						<span class="material-symbols-outlined text-base">error</span>
						{formError}
					</div>
				{/if}
				<div class="flex justify-end gap-3">
					<button type="button" onclick={() => (showNewForm = false)} class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
						Cancel
					</button>
					<button type="submit" disabled={submitting} class="flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all disabled:opacity-50">
						{#if submitting}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Submitting...
						{:else}
							<span class="material-symbols-outlined text-base">send</span>
							Submit Report
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="space-y-4">
			{#each [1,2,3] as _}
				<div class="bg-white rounded-2xl p-6 shadow-card animate-pulse">
					<div class="flex gap-4">
						<div class="skeleton h-12 w-12 rounded-xl shrink-0"></div>
						<div class="flex-1 space-y-2">
							<div class="skeleton h-5 w-1/2 rounded"></div>
							<div class="skeleton h-4 w-3/4 rounded"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-500">error</span>
			<p class="text-red-700">{error}</p>
		</div>
	{:else if sortedIssues.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-card border border-dashed border-gray-200">
			<span class="material-symbols-outlined text-6xl text-gray-300 block mb-4">build</span>
			<h3 class="text-xl font-bold text-gray-600 mb-2">No Issues Reported</h3>
			<p class="text-gray-400 mb-6">Everything looks good! Report an issue if something needs fixing.</p>
			<button onclick={() => (showNewForm = true)} class="inline-flex items-center gap-2 px-5 py-2.5 bg-rentora-purple text-white rounded-xl font-semibold text-sm hover:bg-rentora-purpleLight transition-all">
				<span class="material-symbols-outlined text-base">add</span>
				Report First Issue
			</button>
		</div>
	{:else}
		<div class="space-y-4">
			{#each sortedIssues as issue (issue.id)}
				<div class="bg-white rounded-2xl shadow-card border {issue.status === 'Fixed' ? 'border-purple-200' : 'border-gray-100'} p-6">
					<div class="flex flex-col sm:flex-row gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br
							{issue.status === 'Resolved' ? 'from-emerald-500 to-green-600' :
							 issue.status === 'Fixed' ? 'from-purple-500 to-purple-700' :
							 issue.status === 'In Progress' ? 'from-blue-500 to-blue-700' :
							 'from-amber-500 to-orange-500'} flex items-center justify-center shrink-0 shadow-lg">
							<span class="material-symbols-outlined text-white filled">
								{issue.status === 'Resolved' ? 'check_circle' : issue.status === 'Fixed' ? 'handyman' : 'build'}
							</span>
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-start justify-between gap-2 mb-2">
								<h3 class="text-lg font-bold text-rentora-dark">{issue.title || issue.issue || 'Maintenance Issue'}</h3>
								<span class="px-3 py-1 rounded-full text-xs font-bold {statusBadge(issue.status)}">
									{issue.status}
								</span>
							</div>

							<p class="text-gray-500 text-sm mb-2 line-clamp-2">{issue.description || issue.details || 'No description.'}</p>

							<div class="flex flex-wrap gap-4 text-xs text-gray-400">
								<span class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm">schedule</span>
									{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
								</span>
								{#if issue.updatedAt && issue.updatedAt !== issue.createdAt}
									<span class="flex items-center gap-1">
										<span class="material-symbols-outlined text-sm">update</span>
										Updated {new Date(issue.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
									</span>
								{/if}
							</div>

							<!-- Tenant confirmation CTA — only when owner marks Fixed -->
							{#if issue.status === 'Fixed'}
								<div class="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
									<p class="text-sm text-purple-800 font-medium mb-3">
										<span class="material-symbols-outlined text-base filled align-middle mr-1">handyman</span>
										Your owner has marked this as <strong>Fixed</strong>. Is the issue fully resolved?
									</p>
									<button
										onclick={() => confirmResolved(issue.id)}
										disabled={updatingId === issue.id}
										class="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-50">
										{#if updatingId === issue.id}
											<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Confirming...
										{:else}
											<span class="material-symbols-outlined text-base filled">check_circle</span>
											Yes, Confirm Resolution
										{/if}
									</button>
								</div>
							{:else if issue.status === 'Resolved'}
								<div class="mt-3 flex items-center gap-2 text-sm text-green-600 font-semibold">
									<span class="material-symbols-outlined text-base filled">check_circle</span>
									You confirmed this resolved and closed.
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>