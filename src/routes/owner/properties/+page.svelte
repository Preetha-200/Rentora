<script>
  import { onMount } from "svelte";
  import { propertyAPI } from "$lib/api";
  import PropertyCard from "$lib/components/PropertyCard.svelte";

  let properties = [];
  let loading = true;

  onMount(async () => {
    const data = await propertyAPI.getMyProperties();
    properties = data;
    loading = false;
  });

  const handleEdit = (id) => {
    // Navigate to edit page – we can reuse add page with property id
    window.location.href = `/owner/properties/edit/${id}`;
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    const result = await propertyAPI.remove(id);
    if (result.message) {
      properties = properties.filter((p) => p.id !== id);
    } else {
      alert("Failed to delete property");
    }
  };
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">My Properties</h1>
    <a
      href="/owner/properties/add"
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      + Add Property
    </a>
  </div>

  {#if loading}
    <p>Loading...</p>
  {:else if properties.length === 0}
    <p class="text-gray-500">You haven't added any properties yet.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each properties as property}
        <PropertyCard
          {property}
          showActions={true}
          onEdit={() => handleEdit(property.id)}
          onDelete={() => handleDelete(property.id)}
        />
      {/each}
    </div>
  {/if}
</div>