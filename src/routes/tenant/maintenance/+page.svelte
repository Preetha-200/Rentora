<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let issues = $state([]);
	let properties = $state([]);

	let loading = $state(true);
	let submitting = $state(false);

	let error = $state('');
	let success = $state('');

	let selectedProperty = $state('');
	let issueDescription = $state('');
	let selectedPriority = $state('Low');

	async function loadProperties() {
		try {
			properties = await api.property.getAll();
		} catch (err) {
			error = err.message;
		}
	}

	async function loadIssues() {
		try {
			const response = await api.get('/api/maintenance');
			issues = response.complaints || [];
		} catch (err) {
			error = err.message;
		}
	}

	async function initializePage() {
		loading = true;
		error = '';

		try {
			await Promise.all([
				loadProperties(),
				loadIssues()
			]);
		} finally {
			loading = false;
		}
	}

	onMount(initializePage);

	async function fileRequest(event) {
		event.preventDefault();
		error = '';
		success = '';

		if (!selectedProperty) {
			error = 'Please select a property.';
			return;
		}

		if (!issueDescription.trim()) {
			error = 'Please describe the issue.';
			return;
		}

		submitting = true;

		try {
			await api.post('/api/maintenance', {
				propertyId: selectedProperty,
				complaint: issueDescription.trim(),
				priority: selectedPriority
			});

			success = 'Maintenance request submitted successfully.';

			selectedProperty = '';
			issueDescription = '';
			selectedPriority = 'Low';

			await loadIssues();
		} catch (err) {
			error = err.message;
		} finally {
			submitting = false;
		}
	}

	async function resolveIssue(id) {
		try {
			await api.patch(`/api/maintenance/${id}`, { status: 'Resolved' });
			await loadIssues();
		} catch (err) {
			error = err.message;
		}
	}

	function activeIssues() {
		return issues.filter(
			(issue) => issue.status !== 'Resolved'
		);
	}
</script>

<section>
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Maintenance Portal
	</h1>

	{#if loading}

		<div class="bg-white rounded-2xl shadow-sm p-8 text-center">
			Loading...
		</div>

	{:else}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

			<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">

				<h2 class="text-xl font-bold mb-4">
					File a Work Order
				</h2>

				{#if error}
					<div class="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
						{error}
					</div>
				{/if}

				{#if success}
					<div class="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">
						{success}
					</div>
				{/if}

				<form onsubmit={fileRequest} class="space-y-4">

					<div>
						<label for="maint-property" class="block text-sm font-medium mb-1">
						Property
					</label>

					<select
						id="maint-property"
						\2
							required
							class="w-full px-3 py-2 border rounded-xl">

							<option value="">
								Select Property
							</option>

							{#each properties as property}
								<option value={property.id}>
									{property.title}
								</option>
							{/each}

						</select>
					</div>

					<div>
						<label for="maint-issue" class="block text-sm font-medium mb-1">
						Describe the Issue
					</label>

					<textarea
						id="maint-issue"
						\2
							required
							class="w-full px-3 py-2 border rounded-xl h-24 resize-none"
							placeholder="Plumbing leak, broken lock etc.">
						</textarea>
					</div>

					<div>
						<label for="maint-priority" class="block text-sm font-medium mb-1">
						Priority
					</label>

					<select
						id="maint-priority"
						\2
							class="w-full px-3 py-2 border rounded-xl">

							<option value="Low">
								Low
							</option>

							<option value="Medium">
								Medium
							</option>

							<option value="High">
								High
							</option>

						</select>
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="w-full py-2.5 bg-rentora-purple text-white rounded-xl disabled:opacity-50">

						{submitting ? 'Submitting...' : 'Submit Ticket'}

					</button>

				</form>

			</div>

			<div class="lg:col-span-2 space-y-4">

				<h2 class="text-xl font-bold">
					Active Maintenance Requests
				</h2>

				{#each activeIssues() as issue}

					<div class="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">

						<div>

							<span class="text-xs font-bold px-2 py-1 rounded bg-gray-100">
								{issue.priority || 'Low'}
							</span>

							<h3 class="font-bold mt-2">
								{issue.complaint}
							</h3>

							<p class="text-xs text-gray-500">
								{issue.propertyTitle}
							</p>

							<p class="text-xs text-gray-500 mt-1">
								Status :
								<span class="font-semibold text-rentora-purple">
									{issue.status}
								</span>
							</p>

						</div>

						<div>

							{#if issue.status === 'Pending'}

								<span class="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
									Waiting for Owner
								</span>

							{:else if issue.status === 'Checking'}

								<button
									onclick={() => resolveIssue(issue.id)}
									class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
									Resolve
								</button>
							{/if}
						</div>
					</div>
				{:else}
					<div class="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">
						No maintenance requests found.
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>