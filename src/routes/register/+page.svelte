<script>
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let selectedRole = $state('tenant');

  function handleRegister() {
    console.log(`Registering ${name} as ${selectedRole}`);
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-rentora-dark px-4">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
    <div>
      <h2 class="mt-2 text-center text-3xl font-extrabold text-rentora-dark">Create Account</h2>
      <p class="mt-2 text-center text-sm text-gray-500">Join the Rentora Platform</p>
    </div>
    
    <form class="mt-8 space-y-6" onsubmit={handleRegister}>
      <div class="rounded-md space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input id="name" type="text" bind:value={name} required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="John Doe"/>
        </div>

        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">I am a</label>
          <select id="role" bind:value={selectedRole} class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">
            <option value="tenant">Tenant</option>
            <option value="owner">Property Owner</option>
          </select>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input id="email" type="email" bind:value={email} required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="name@domain.com"/>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input id="password" type="password" bind:value={password} required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" placeholder="••••••••"/>
        </div>
      </div>

      <div>
        <button type="submit" class="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-rentora-purple hover:bg-rentora-purpleLight transition duration-200 shadow-lg shadow-rentora-purple/20">
          Sign Up
        </button>
      </div>
    </form>
  </div>
</div>