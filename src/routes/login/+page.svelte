<script>
	let email = '';
	let password = '';

	function handleLogin() {
		console.log({ email, password });
	}
</script>

<div class="container">
	<div class="left-section">
		<h1>🏠 Rentora</h1>
		<h2>Smart Rental Management System</h2>
		<p>
			Manage properties, tenants, rent payments, maintenance requests,
			and agreements all in one place.
		</p>

		<div class="features">
			<div>✓ Tenant Management</div>
			<div>✓ Rent Tracking</div>
			<div>✓ Property Monitoring</div>
			<div>✓ Digital Agreements</div>
		</div>
	</div>

	<div class="login-card">
		<h2>Welcome Back</h2>
		<p>Sign in to your Rentora account</p>

		<form on:submit|preventDefault={handleLogin}>
			<div class="input-group">
				<label>Email</label>
				<input
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					required
				/>
			</div>

			<div class="input-group">
				<label>Password</label>
				<input
					type="password"
					bind:value={password}
					placeholder="Enter your password"
					required
				/>
			</div>

			<button type="submit">Login</button>
		</form>

		<div class="footer-links">
			<a href="/">Forgot Password?</a>
			<span>|</span>
			<a href="/">Create Account</a>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', sans-serif;
		background: #f5f7fb;
	}

	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		gap: 4rem;
		background: linear-gradient(135deg, #1e3a8a, #2563eb);
	}

	.left-section {
		color: white;
		max-width: 500px;
	}

	.left-section h1 {
		font-size: 4rem;
		margin-bottom: 0.5rem;
	}

	.left-section h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.left-section p {
		font-size: 1.1rem;
		line-height: 1.7;
		opacity: 0.9;
	}

	.features {
		margin-top: 2rem;
		display: grid;
		gap: 1rem;
		font-size: 1rem;
	}

	.login-card {
		background: white;
		padding: 2rem;
		border-radius: 20px;
		width: 380px;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
	}

	.login-card h2 {
		margin-bottom: 0.5rem;
		color: #1e3a8a;
	}

	.login-card p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	label {
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	input {
		padding: 0.9rem;
		border: 1px solid #ddd;
		border-radius: 10px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #2563eb;
	}

	button {
		width: 100%;
		padding: 1rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 1rem;
	}

	button:hover {
		background: #1d4ed8;
	}

	.footer-links {
		margin-top: 1rem;
		text-align: center;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.footer-links a {
		text-decoration: none;
		color: #2563eb;
	}

	@media (max-width: 900px) {
		.container {
			flex-direction: column;
			text-align: center;
		}

		.left-section h1 {
			font-size: 3rem;
		}
	}
</style>