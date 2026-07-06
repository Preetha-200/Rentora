<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { api } from "$lib/api";
  import PropertyForm from "$lib/components/PropertyForm.svelte";

  let property = null;
  let loading = true;
  let submitting = false;
  let errorMessage = "";

  onMount(async () => {
    const id = $page.params.id;
    try {
      const data = await api.getById(id);
      if (data.id) {
        property = data;
      } else {
        errorMessage = "Property not found";
      }
    } catch (err) {
      errorMessage = "Failed to load property";
    } finally {
      loading = false;
    }
  });

  const handleSubmit = async (formData) => {
    submitting = true;
    errorMessage = "";
    try {
      const result = await api.update(property.id, formData);
      if (result.id) {
        window.location.href = "/owner/properties";
      } else {
        errorMessage = result.message || "Failed to update";
      }
    } catch (err) {
      errorMessage = "An error occurred";
    } finally {
      submitting = false;
    }
  };
</script>

<div class="container mx-auto p-4 max-w-2xl">
  <h1 class="text-2xl font-bold mb-4">Edit Property</h1>
  {#if loading}
    <p>Loading property...</p>
  {:else if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {errorMessage}
    </div>
  {:else if property}
    <PropertyForm {property} loading={submitting} onSubmit={handleSubmit} />
  {/if}
</div>