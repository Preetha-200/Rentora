<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let payments = [];
	let loading = true;
	let error = '';

	async function loadPayments() {
		loading = true;
		error = '';

		try {
			const response = await api.get('/api/payments');
			payments = response.payments || [];
		} catch (err) {
			error = err.message || 'Failed to load payments';
		} finally {
			loading = false;
		}
	}

	onMount(loadPayments);

	async function processPayment(id) {
		try {
			await api.post('/api/payments', {
				paymentId: id
			});

			await loadPayments();
		} catch (err) {
			alert(err.message);
		}
	}
</script>

<div>
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Rent Payments
	</h1>

	{#if loading}
		<div class="bg-white rounded-2xl p-8 text-center shadow-sm">
			Loading payments...
		</div>

	{:else if error}

		<p class="text-red-600 mb-5">{error}</p>

	{:else if payments.length === 0}

		<div class="bg-white rounded-2xl p-8 text-center shadow-sm">
			No rent payments found.
		</div>

	{:else}

		<div class="space-y-4">
			{#each payments as payment}
				<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
					<div>
						<h3 class="font-bold text-lg">
							{payment.propertyTitle}
						</h3>

						<p class="text-sm text-gray-500">
							Due Date:
							{new Date(payment.dueDate).toLocaleDateString()}
						</p>

						<p class="text-sm text-gray-500">
							Amount:
							<span class="font-semibold">
								₹{payment.amount}
							</span>
						</p>

						{#if payment.paidAt}
							<p class="text-sm text-green-600">
								Paid on
								{new Date(payment.paidAt).toLocaleDateString()}
							</p>
						{/if}
					</div>

					<div class="flex items-center gap-4">
						<span class="px-3 py-1 rounded-full text-xs font-semibold {payment.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
							{payment.status}
						</span>

						{#if payment.status !== 'Paid'}
							<button
								on:click={() => processPayment(payment.id)}
								class="bg-rentora-purple text-white px-4 py-2 rounded-xl font-semibold hover:bg-rentora-purpleLight">
								Pay Rent
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

	{/if}
</div>