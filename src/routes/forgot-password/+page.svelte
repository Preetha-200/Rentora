<script>
	import { sendPasswordResetEmail } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let submitted = $state(false);

	async function handleReset(event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			await sendPasswordResetEmail(auth, email.trim());
		} catch (err) {
			// Only surface errors that don't reveal whether an account exists,
			// e.g. a malformed email. Firebase's "user-not-found" is intentionally
			// swallowed so we never confirm/deny an email is registered.
			if (err?.code === 'auth/invalid-email') {
				error = 'Please enter a valid email address.';
				loading = false;
				return;
			}
			if (err?.code === 'auth/network-request-failed') {
				error = 'Network error. Please check your connection and try again.';
				loading = false;
				return;
			}
			// Any other error (including user-not-found) still shows the neutral
			// success state below, so account existence is never leaked.
		}

		loading = false;
		submitted = true;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-rentora-dark px-4">
	<div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-rentora-dark">Reset your password</h2>
			<p class="mt-2 text-center text-sm text-gray-500">
				Enter your account email and we'll send you a reset link.
			</p>
		</div>

		{#if submitted}
			<div class="p-4 text-sm text-green-700 bg-green-100 rounded-lg text-center">
				If an account exists for <span class="font-semibold">{email}</span>, a password reset link has been sent.
				Check your inbox (and spam folder).
			</div>

			<a href="/login" class="block text-center text-rentora-purple font-semibold hover:underline">
				Back to Sign In
			</a>
		{:else}
			<form onsubmit={handleReset} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
					<input
						type="email"
						bind:value={email}
						required
						placeholder="name@domain.com"
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple" />
				</div>

				{#if error}
					<p class="text-red-600 text-sm text-center">{error}</p>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition disabled:opacity-50">
					{loading ? 'Sending...' : 'Send Reset Link'}
				</button>

				<a href="/login" class="block text-center text-sm text-gray-500 hover:text-rentora-purple">
					Back to Sign In
				</a>
			</form>
		{/if}
	</div>
</div>
