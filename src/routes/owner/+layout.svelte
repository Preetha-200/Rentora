<script>
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { children } = $props();

  const ownerLinks = [
    { name: 'Dashboard Summary', href: '/owner' },
    { name: 'My Properties', href: '/owner/properties' },
    { name: 'Rental Requests', href: '/owner/requests' },
    { name: 'Agreements', href: '/owner/agreements' },
    { name: 'Payments Tracking', href: '/owner/payments' },
    { name: 'Maintenance Issues', href: '/owner/maintenance' }
  ];
</script>

<div class="flex">
  <Sidebar role="Owner" links={ownerLinks} />
  <main class="flex-1 p-8 min-h-screen">
    {@render children()}
  </main>
</div>