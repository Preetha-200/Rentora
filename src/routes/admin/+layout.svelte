<script>
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { children } = $props();

  const adminLinks = [
    { name: 'Dashboard Overview', href: '/admin' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Property Approvals', href: '/admin/approvals' },
    { name: 'System Reports', href: '/admin/reports' }
  ];
</script>

<div class="flex">
  <Sidebar role="Admin" links={adminLinks} />
  <main class="flex-1 p-8 min-h-screen">
    {@render children()}
  </main>
</div>