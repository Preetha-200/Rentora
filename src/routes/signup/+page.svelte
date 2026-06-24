<script>
	let fullName = '';
	let email = '';
	let phone = '';
	let role = 'tenant';
	let password = '';
	let confirmPassword = '';

	function handleSignup() {
		if (password !== confirmPassword) {
			alert('Passwords do not match');
			return;
		}

		console.log({
			fullName,
			email,
			phone,
			role,
			password
		});
	}
</script>

<div class="container">
	<div class="left-section">
		<h1>🏠 Rentora</h1>
		<h2>Join Smart Rental Management</h2>
		<p>
			Create your account to manage properties, track rent payments,
			handle maintenance requests, and stay connected with tenants.
		</p>

		<div class="features">
			<div>✓ Property Management</div>
			<div>✓ Tenant Communication</div>
			<div>✓ Rent Collection</div>
			<div>✓ Maintenance Tracking</div>
		</div>
	</div>

	<div class="signup-card">
		<h2>Create Account</h2>
		<p>Start managing rentals with Rentora</p>

		<form on:submit|preventDefault={handleSignup}>
			<div class="input-group">
				<label>Full Name</label>
				<input
					type="text"
					bind:value={fullName}
					placeholder="Enter your full name"
					required
				/>
			</div>

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
				<label>Phone Number</label>
				<input
					type="tel"
					bind:value={phone}
					placeholder="Enter your phone number"
					required
				/>
			</div>

			<div class="input-group">
				<label>Account Type</label>
				<select bind:value={role}>
					<option value="tenant">Tenant</option>
					<option value="owner">Property Owner</option>
				</select>
			</div>

			<div class="input-group">
				<label>Password</label>
				<input
					type="password"
					bind:value={password}
					placeholder="Create a password"
					required
				/>
			</div>

			<div class="input-group">
				<label>Confirm Password</label>
				<input
					type="password"
					bind:value={confirmPassword}
					placeholder="Confirm your password"
					required
				/>
			</div>

			<button type="submit">Create Account</button>
		</form>

		<div class="footer-links">
			<span>Already have an account?</span>
			<a href="/login">Login</a>
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

	.signup-card {
		background: white;
		padding: 2rem;
		border-radius: 20px;
		width: 420px;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
	}

	.signup-card h2 {
		margin-bottom: 0.5rem;
		color: #1e3a8a;
	}

	.signup-card p {
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

	input,
	select {
		padding: 0.9rem;
		border: 1px solid #ddd;
		border-radius: 10px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	input:focus,
	select:focus {
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
		margin-top: 1.5rem;
		text-align: center;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.footer-links a {
		color: #2563eb;
		text-decoration: none;
		font-weight: 600;
	}

	@media (max-width: 900px) {
		.container {
			flex-direction: column;
			text-align: center;
		}

		.left-section h1 {
			font-size: 3rem;
		}

		.signup-card {
			width: 100%;
			max-width: 420px;
		}
	}
</style>