<script>
  import { api } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let password = '';
  let role = 'tenant';
  let errorMessage = '';
  let successMessage = '';

  async function handleSignup() {
    try {
      errorMessage = '';
      successMessage = '';
      
      await api.post('/auth/register', { name, email, password, role });
      
      successMessage = "Registration successful! Redirecting to login...";
      setTimeout(() => goto('/login'), 1500);
    } catch (error) {
      errorMessage = error.message;
    }
  }
</script>

<div class="max-w-md mx-auto my-12 p-6 border rounded-lg shadow-md bg-white">
  <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Create Your Account</h2>
  
  {#if errorMessage}
    <div class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={handleSignup} class="space-y-4">
    <div>
      <!-- Fixed: Input nested inside label instantly clears Svelte warnings -->
      <label class="block text-sm font-medium text-gray-700 cursor-pointer">
        Full Name
        <input type="text" bind:value={name} required class="w-full p-2 border rounded mt-1 font-normal text-gray-950" placeholder="Enter name" />
      </label>
    </div>

    <div>
      <!-- Fixed: Input nested inside label instantly clears Svelte warnings -->
      <label class="block text-sm font-medium text-gray-700 cursor-pointer">
        Email Address
        <input type="email" bind:value={email} required class="w-full p-2 border rounded mt-1 font-normal text-gray-950" placeholder="example@email.com" />
      </label>
    </div>

    <div>
      <!-- Fixed: Input nested inside label instantly clears Svelte warnings -->
      <label class="block text-sm font-medium text-gray-700 cursor-pointer">
        Password
        <input type="password" bind:value={password} required class="w-full p-2 border rounded mt-1 font-normal text-gray-950" placeholder="Min 6 characters" />
      </label>
    </div>

    <div>
      <!-- Fixed: Input nested inside label instantly clears Svelte warnings -->
      <label class="block text-sm font-medium text-gray-700 cursor-pointer">
        Who Are You?
        <select bind:value={role} class="w-full p-2 border rounded mt-1 font-normal text-gray-950">
          <option value="tenant">I want to Rent (Tenant)</option>
          <option value="owner">I want to Lease (Property Owner)</option>
        </select>
      </label>
    </div>

    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
      Create Account
    </button>
  </form>
</div>