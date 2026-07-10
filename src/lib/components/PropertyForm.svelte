<script>
  export let property = null;
  export let onSubmit = () => {};
  export let loading = false;

  let formData = {
    title: property?.title || "",
    description: property?.description || "",
    address: property?.address || "",
    city: property?.city || "",
    rent: property?.rent || "",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    furnishing: property?.furnishing || "unfurnished",
    amenities: property?.amenities ? property.amenities.join(", ") : "",
    status: property?.status || "available",
  };

  let files = [];
  let previewUrls = property?.images || [];

  const handleFileChange = (e) => {
    files = Array.from(e.target.files);
    previewUrls = files.map((f) => URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    files.forEach((file) => form.append("images", file));
    onSubmit(form);
  };
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label class="block text-sm font-medium">Title</label>
    <input
      type="text"
      bind:value={formData.title}
      required
      class="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label class="block text-sm font-medium">Description</label>
    <textarea
      bind:value={formData.description}
      rows="3"
      class="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label class="block text-sm font-medium">Address</label>
    <input
      type="text"
      bind:value={formData.address}
      required
      class="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label class="block text-sm font-medium">City</label>
    <input
      type="text"
      bind:value={formData.city}
      required
      class="w-full border rounded px-3 py-2"
    />
  </div>
  <div class="grid grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium">Rent (₹)</label>
      <input
        type="number"
        bind:value={formData.rent}
        required
        class="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label class="block text-sm font-medium">Bedrooms</label>
      <input
        type="number"
        bind:value={formData.bedrooms}
        required
        class="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label class="block text-sm font-medium">Bathrooms</label>
      <input
        type="number"
        bind:value={formData.bathrooms}
        required
        class="w-full border rounded px-3 py-2"
      />
    </div>
  </div>
  <div>
    <label class="block text-sm font-medium">Furnishing</label>
    <select bind:value={formData.furnishing} class="w-full border rounded px-3 py-2">
      <option value="unfurnished">Unfurnished</option>
      <option value="semi-furnished">Semi-furnished</option>
      <option value="fully-furnished">Fully-furnished</option>
    </select>
  </div>
  <div>
    <label class="block text-sm font-medium">Amenities (comma separated)</label>
    <input
      type="text"
      bind:value={formData.amenities}
      placeholder="WiFi, Parking, AC"
      class="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label class="block text-sm font-medium">Images</label>
    <input
      type="file"
      multiple
      accept="image/*"
      on:change={handleFileChange}
      class="w-full"
    />
    {#if previewUrls.length > 0}
      <div class="flex flex-wrap gap-2 mt-2">
        {#each previewUrls as url}
          <img src={url} alt="preview" class="w-20 h-20 object-cover rounded border" />
        {/each}
      </div>
    {/if}
  </div>
  <div>
    <label class="block text-sm font-medium">Status</label>
    <select bind:value={formData.status} class="w-full border rounded px-3 py-2">
      <option value="available">Available</option>
      <option value="rented">Rented</option>
    </select>
  </div>
  <button
    type="submit"
    disabled={loading}
    class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {loading ? "Saving..." : property ? "Update Property" : "Add Property"}
  </button>
</form>