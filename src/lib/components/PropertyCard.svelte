<script>
  export let property;
  export let showActions = false;
  export let onEdit = () => {};
  export let onDelete = () => {};

  const defaultImage = "/images/placeholder.jpg";
</script>

<div class="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
  <img
    src={property.images && property.images.length > 0 ? property.images[0] : defaultImage}
    alt={property.title}
    class="w-full h-48 object-cover"
  />
  <div class="p-4">
    <h3 class="text-xl font-semibold">{property.title}</h3>
    <p class="text-gray-600">{property.address}, {property.city}</p>
    <p class="text-lg font-bold text-blue-600">₹{property.rent}/month</p>
    <div class="flex gap-2 mt-2 text-sm text-gray-500">
      <span>{property.bedrooms} bed</span>
      <span>{property.bathrooms} bath</span>
      <span class="capitalize">{property.furnishing}</span>
    </div>
    <div class="mt-2">
      <span class="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
        {property.status}
      </span>
    </div>
    {#if showActions}
      <div class="mt-4 flex gap-2">
        <button
          on:click={onEdit}
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          on:click={onDelete}
          class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    {/if}
  </div>
</div>