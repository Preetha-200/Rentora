<script>
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { children } = $props();

  const tenantLinks = [
    { name: 'Overview', href: '/tenant' },
    { name: 'Browse Properties', href: '/tenant/browse' },
    { name: 'My Applications', href: '/tenant/requests' },
    { name: 'My Rental', href: '/tenant/property' },
    { name: 'Make Payments', href: '/tenant/payments' },
    { name: 'Maintenance Log', href: '/tenant/maintenance' }
  ];
</script>

<div class="flex">
  <Sidebar role="Tenant" links={tenantLinks} />
  <main class="flex-1 p-8 min-h-screen">
    {@render children()}
  </main>
</div>