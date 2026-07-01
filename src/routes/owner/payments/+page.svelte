<script>
  import { mockPayments } from '$lib/mockData.js';
</script>

<h1 class="text-3xl font-bold text-rentora-dark mb-6">Rent Payment Tracking</h1>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500">
        <th class="p-4">Property</th>
        <th class="p-4">Amount</th>
        <th class="p-4">Date</th>
        <th class="p-4">Status</th>
      </tr>
    </thead>
    <tbody class="text-sm">
      {#each mockPayments as payment}
        <tr class="border-b border-gray-50">
          <td class="p-4 font-medium text-rentora-dark">{payment.propertyName}</td>
          <td class="p-4 text-gray-600">₹{payment.amount}</td>
          <td class="p-4 text-gray-500">{payment.date}</td>
          <td class="p-4">
            <span class="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full">
              {payment.status}
            </span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>