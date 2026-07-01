<script>
  import '../app.css';

  let { children } = $props();
</script>

<div class="min-h-screen bg-rentora-grayLight text-rentora-dark font-sans">
  {@render children()}
</div>