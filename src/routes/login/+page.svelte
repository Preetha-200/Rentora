<script>
  import { api } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMessage = '';
  let successMessage = '';

  async function handleLogin() {
    try {
      errorMessage = '';
      successMessage = '';

      const response = await api.post('/auth/login', { email, password });

      localStorage.setItem('rentora_token', response.token);
      localStorage.setItem('rentora_user', JSON.stringify(response.user));

      successMessage = 'Authentication successful! Redirecting...';

      setTimeout(() => {
        if (response.user.role === 'admin') {
          goto('/admin');
        } else if (response.user.role === 'owner') {
          goto('/owner');
        } else {
          goto('/tenant');
        }
      }, 1200);
    } catch (error) {
      errorMessage = error.message;
    }
  }
</script>

<div class="max-w-md mx-auto my-12 p-6 border rounded-lg shadow-md bg-white">
  <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Login to Rentora</h2>

  {#if errorMessage}
    <div class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={handleLogin} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Email Address
        <input
          type="email"
          bind:value={email}
          required
          class="w-full p-2 border rounded mt-1"
          placeholder="tenant@rentora.com"
        />
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">
        Password
        <input
          type="password"
          bind:value={password}
          required
          class="w-full p-2 border rounded mt-1"
          placeholder="••••••••"
        />
      </label>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign In
    </button>
  </form>
</div>