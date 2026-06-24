<script>
	function login() {
		console.log('Navigate to Login');
	}

	function signup() {
		console.log('Navigate to Sign Up');
	}
</script>

<div class="page">
	<!-- Navbar -->
	<nav class="navbar">
		<div class="logo">
			<span class="logo-icon">🏠</span>
			<h2>Rentora</h2>
		</div>

		<div class="nav-links">
			<a href="#features">Features</a>
			<a href="#about">About</a>
			<a href="#contact">Contact</a>

			<a href="/login">
                <button class="login-btn">
                    Login
                </button>
            </a>

			<a href="/signup">
                <button class="signup-btn">
                    Sign Up
                </button>
            </a>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>
				Manage Rentals <br />
				The Smart Way
			</h1>

			<p>
				Rentora helps property owners and tenants manage rent,
				properties, maintenance requests, and agreements in one
				powerful platform.
			</p>

			<div class="hero-buttons">
				<button class="primary-btn">Get Started</button>
				<button class="secondary-btn">Explore Features</button>
			</div>
		</div>

		<div class="hero-image">
			<div class="card">
				<h3>🏘️ 150+</h3>
				<p>Properties Managed</p>
			</div>

			<div class="card">
				<h3>👨‍👩‍👧‍👦 500+</h3>
				<p>Happy Tenants</p>
			</div>

			<div class="card">
				<h3>💰 98%</h3>
				<p>Rent Collection Rate</p>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="features">
		<h2>Why Choose Rentora?</h2>

		<div class="feature-grid">
			<div class="feature-card">
				<h3>🏠 Property Management</h3>
				<p>Manage multiple properties from one dashboard.</p>
			</div>

			<div class="feature-card">
				<h3>👤 Tenant Management</h3>
				<p>Store tenant information securely.</p>
			</div>

			<div class="feature-card">
				<h3>💳 Rent Tracking</h3>
				<p>Track payments and due dates easily.</p>
			</div>

			<div class="feature-card">
				<h3>🔧 Maintenance Requests</h3>
				<p>Handle tenant complaints and repairs quickly.</p>
			</div>
		</div>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', sans-serif;
		background: #f8fafc;
	}

	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 8%;
		background: white;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
		position: sticky;
		top: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #2563eb;
	}

	.logo-icon {
		font-size: 2rem;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.nav-links a {
		text-decoration: none;
		color: #333;
		font-weight: 500;
	}

	.login-btn,
	.signup-btn {
		padding: 0.7rem 1.3rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
	}

	.login-btn {
		background: transparent;
		border: 2px solid #2563eb;
		color: #2563eb;
	}

	.signup-btn {
		background: #2563eb;
		color: white;
		border: none;
	}

	.hero {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 8%;
		min-height: 80vh;
		background: linear-gradient(to right, #eff6ff, #dbeafe);
	}

	.hero-content {
		max-width: 600px;
	}

	.hero-content h1 {
		font-size: 4rem;
		margin-bottom: 1rem;
		color: #1e3a8a;
	}

	.hero-content p {
		font-size: 1.2rem;
		color: #555;
		line-height: 1.7;
	}

	.hero-buttons {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
	}

	.primary-btn,
	.secondary-btn {
		padding: 1rem 1.8rem;
		border-radius: 10px;
		font-size: 1rem;
		cursor: pointer;
	}

	.primary-btn {
		background: #2563eb;
		color: white;
		border: none;
	}

	.secondary-btn {
		background: white;
		border: 2px solid #2563eb;
		color: #2563eb;
	}

	.hero-image {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 15px;
		box-shadow: 0 10px 25px rgba(0,0,0,0.08);
		text-align: center;
	}

	.features {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 70vh;
		padding: 5rem 8%;
		text-align: center;
	}

	.features h2 {
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: #1e3a8a;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 15px;
		box-shadow: 0 5px 20px rgba(0,0,0,0.08);
	}

	@media (max-width: 768px) {
		.hero {
			flex-direction: column;
			text-align: center;
		}

		.hero-content h1 {
			font-size: 2.8rem;
		}

		.hero-image {
			margin-top: 2rem;
		}

		.nav-links a {
			display: none;
		}
	}
</style>