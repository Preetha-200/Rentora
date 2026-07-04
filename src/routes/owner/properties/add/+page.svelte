<script>
  import { onMount } from "svelte";
  import { propertyAPI } from "$lib/api";
  import PropertyForm from "$lib/components/PropertyForm.svelte";

  let loading = false;
  let successMessage = "";
  let errorMessage = "";

  const handleSubmit = async (formData) => {
    loading = true;
    successMessage = "";
    errorMessage = "";
    try {
      const result = await propertyAPI.create(formData);
      if (result.id) {
        successMessage = "Property added successfully!";
        // Optionally redirect after a delay
        setTimeout(() => {
          window.location.href = "/owner/properties";
        }, 1500);
      } else {
        errorMessage = result.message || "Failed to add property";
      }
    } catch (err) {
      errorMessage = "An error occurred";
    } finally {
      loading = false;
    }
  };
</script>

<div class="container mx-auto p-4 max-w-2xl">
  <h1 class="text-2xl font-bold mb-4">Add New Property</h1>
  {#if successMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {successMessage}
    </div>
  {/if}
  {#if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {/if}
  <PropertyForm {loading} onSubmit={handleSubmit} />
</div>