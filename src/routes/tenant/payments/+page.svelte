<script>
  import { mockPayments } from '$lib/mockData.js';

  let payments = $state([...mockPayments]);

  function processPayment(id) {
    payments = payments.map(p => p.id === id ? { ...p, status: 'Paid' } : p);
  }
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Rent Invoices</h1>

<div class="space-y-4">
  {#each payments as payment}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg text-rentora-dark">{payment.propertyName}</h3>
        <p class="text-sm text-gray-500">Due Date: {payment.date} • <span class="font-semibold text-gray-700">₹{payment.amount}</span></p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full {payment.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
          {payment.status}
        </span>
        {#if payment.status !== 'Paid'}
          <button onclick={() => processPayment(payment.id)} class="bg-rentora-purple text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-rentora-purpleLight transition duration-200">
            Pay Rent
          </button>
        {/if}
      </div>
    </div>
  {/each}
</div>