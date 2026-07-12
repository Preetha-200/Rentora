<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let payments = [];
	let loading = true;
	let error = '';
	let propertyId = '';
	let amount = '';
	let dueDate = '';

	async function loadPayments() {
		loading = true;
		error = '';

		try {
			payments = await api.get('/api/payments/owner');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function generateInvoice() {
		try {
			await api.post('/api/payments/generate', {
				propertyId,
				amount: Number(amount),
				dueDate
			});

			propertyId = '';
			amount = '';
			dueDate = '';

			await loadPayments();
			alert('Invoice generated successfully.');
		} catch (err) {
			alert(err.message);
		}
	}

	onMount(loadPayments);
</script>

<section>
	<h1 class="text-3xl font-bold text-rentora-dark mb-6">
		Rent Payment Tracking
	</h1>

	<div class="bg-white p-6 rounded-2xl shadow-sm border mb-6">
		<h2 class="text-xl font-semibold mb-4">
			Generate Rent Invoice
		</h2>

		<div class="grid md:grid-cols-3 gap-4">
			<input
				bind:value={propertyId}
				placeholder="Property ID"
				class="border rounded-lg p-3" />

			<input
				type="number"
				bind:value={amount}
				placeholder="Amount"
				class="border rounded-lg p-3" />

			<input
				type="date"
				bind:value={dueDate}
				class="border rounded-lg p-3" />
		</div>

		<button
			onclick={generateInvoice}
			class="mt-4 bg-rentora-purple text-white px-5 py-2 rounded-lg">
			Generate Invoice
		</button>
	</div>

	{#if loading}
		<p>Loading payments...</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if payments.length === 0}
		<div class="bg-white p-8 rounded-xl shadow text-center text-gray-500">
			No rent payments found.
		</div>
	{:else}
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<table class="w-full text-left">
				<thead>
					<tr class="bg-gray-50 border-b text-sm font-semibold text-gray-500">
						<th class="p-4">Property</th>
						<th class="p-4">Tenant</th>
						<th class="p-4">Amount</th>
						<th class="p-4">Due Date</th>
						<th class="p-4">Status</th>
					</tr>
				</thead>

				<tbody>
                					{#each payments as payment}
						<tr class="border-b">
							<td class="p-4 font-medium">
								{payment.propertyTitle}
							</td>

							<td class="p-4">
								{payment.tenantName}
							</td>

							<td class="p-4">
								₹{payment.amount}
							</td>

							<td class="p-4">
								{payment.dueDate}
							</td>

							<td class="p-4">
								<span
									class="px-3 py-1 rounded-full text-xs font-semibold
									{payment.status === 'Paid'
										? 'bg-green-100 text-green-700'
										: 'bg-yellow-100 text-yellow-700'}">
									{payment.status}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>