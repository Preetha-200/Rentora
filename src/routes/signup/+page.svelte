<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';
	import { auth } from '$lib/firebase';
	import {
		createUserWithEmailAndPassword,
		RecaptchaVerifier,
		linkWithPhoneNumber
	} from 'firebase/auth';

	// Step 1 = account details, Step 2 = phone OTP verification
	let step = $state(1);

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let phone = $state('');
	let role = $state('tenant');

	let otp = $state('');
	let confirmationResult = $state(null);
	let firebaseUser = $state(null);

	let errorMessage = $state('');
	let successMessage = $state('');
	let submitting = $state(false);
	let sendingOtp = $state(false);
	let verifyingOtp = $state(false);

	let resendCooldown = $state(0);
	let cooldownTimer = null;

	function startCooldown() {
		resendCooldown = 30;
		clearInterval(cooldownTimer);
		cooldownTimer = setInterval(() => {
			resendCooldown -= 1;
			if (resendCooldown <= 0) clearInterval(cooldownTimer);
		}, 1000);
	}

	function toE164(rawPhone) {
		const digits = rawPhone.replace(/\D/g, '');
		if (rawPhone.trim().startsWith('+')) return `+${digits}`;
		// Default to India country code, matching the rest of the app (₹ pricing).
		return `+91${digits}`;
	}

	function getRecaptcha() {
		if (!window.__rentoraRecaptcha) {
			window.__rentoraRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
				size: 'invisible'
			});
		}
		return window.__rentoraRecaptcha;
	}

	async function createAccountAndSendOtp(event) {
		event.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!phone.trim()) {
			errorMessage = 'Phone number is required for OTP verification.';
			return;
		}

		submitting = true;

		try {
			const credential = await createUserWithEmailAndPassword(auth, email, password);
			firebaseUser = credential.user;

			await sendOtp();
		} catch (err) {
			errorMessage = friendlyAuthError(err);
		} finally {
			submitting = false;
		}
	}

	async function sendOtp() {
		if (!firebaseUser) return;
		sendingOtp = true;
		errorMessage = '';

		try {
			const verifier = getRecaptcha();
			confirmationResult = await linkWithPhoneNumber(firebaseUser, toE164(phone), verifier);
			step = 2;
			startCooldown();
		} catch (err) {
			errorMessage = friendlyAuthError(err);
		} finally {
			sendingOtp = false;
		}
	}

	async function verifyOtpAndFinish() {
		if (!confirmationResult || otp.trim().length !== 6) {
			errorMessage = 'Enter the 6-digit code sent to your phone.';
			return;
		}

		verifyingOtp = true;
		errorMessage = '';

		try {
			await confirmationResult.confirm(otp.trim());

			const token = await firebaseUser.getIdToken(true);

			await api.post('/api/auth/register', {
				name,
				email,
				phone: toE164(phone),
				phoneVerified: true,
				role,
				token
			});

			successMessage = 'Account created and phone verified! Redirecting to login...';
			setTimeout(() => goto('/login'), 1500);
		} catch (err) {
			errorMessage = friendlyAuthError(err);
		} finally {
			verifyingOtp = false;
		}
	}

	function friendlyAuthError(err) {
		const code = err?.code || '';
		if (code.includes('email-already-in-use')) return 'An account with this email already exists.';
		if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
		if (code.includes('invalid-email')) return 'Please enter a valid email address.';
		if (code.includes('invalid-phone-number')) return 'Please enter a valid phone number.';
		if (code.includes('invalid-verification-code')) return 'That code is incorrect. Please try again.';
		if (code.includes('code-expired')) return 'That code has expired. Please request a new one.';
		if (code.includes('too-many-requests')) return 'Too many attempts. Please wait and try again.';
		return err?.message || 'Something went wrong. Please try again.';
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-rentora-dark px-4 py-12">
	<div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-rentora-dark">Create Your Account</h2>
			<p class="mt-2 text-center text-sm text-gray-500">
				{step === 1 ? 'Join Rentora as a tenant or property owner' : 'Verify your phone number'}
			</p>
		</div>

		<div class="flex items-center justify-center gap-2 text-xs font-semibold">
			<span class={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-rentora-purple text-white' : 'bg-gray-100 text-gray-400'}`}>1. Details</span>
			<span class="w-6 h-px bg-gray-200"></span>
			<span class={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-rentora-purple text-white' : 'bg-gray-100 text-gray-400'}`}>2. Verify Phone</span>
		</div>

		{#if errorMessage}
			<div class="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{errorMessage}</div>
		{/if}
		{#if successMessage}
			<div class="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{successMessage}</div>
		{/if}

		{#if step === 1}
			<form onsubmit={createAccountAndSendOtp} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
					<input type="text" bind:value={name} required
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Enter your name" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
					<input type="email" bind:value={email} required
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="name@domain.com" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
					<input type="password" bind:value={password} required minlength="6"
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="Min 6 characters" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
					<input type="tel" bind:value={phone} required
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
						placeholder="e.g. 98765 43210" />
					<p class="mt-1 text-xs text-gray-400">We'll text you a 6-digit code to verify this number.</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Who Are You?</label>
					<select bind:value={role}
						class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple bg-white">
						<option value="tenant">I want to Rent (Tenant)</option>
						<option value="owner">I want to Lease (Property Owner)</option>
					</select>
				</div>

				<button type="submit" disabled={submitting}
					class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition disabled:opacity-50">
					{submitting ? 'Creating Account...' : 'Continue to Phone Verification'}
				</button>
			</form>
		{:else}
			<div class="space-y-4">
				<p class="text-sm text-gray-600 text-center">
					Enter the 6-digit code sent to <span class="font-semibold text-rentora-dark">{toE164(phone)}</span>
				</p>

				<input type="text" inputmode="numeric" maxlength="6" bind:value={otp}
					class="w-full text-center tracking-[0.5em] text-lg px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rentora-purple"
					placeholder="000000" />

				<button onclick={verifyOtpAndFinish} disabled={verifyingOtp}
					class="w-full py-3 rounded-xl bg-rentora-purple text-white font-semibold hover:bg-rentora-purpleLight transition disabled:opacity-50">
					{verifyingOtp ? 'Verifying...' : 'Verify & Create Account'}
				</button>

				<button onclick={sendOtp} disabled={resendCooldown > 0 || sendingOtp}
					class="w-full py-2 rounded-xl border border-gray-200 text-sm font-medium text-rentora-dark hover:bg-gray-50 transition disabled:opacity-50">
					{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : sendingOtp ? 'Sending...' : 'Resend Code'}
				</button>
			</div>
		{/if}

		<p class="text-center text-sm text-gray-500">
			Already have an account?
			<a href="/login" class="text-rentora-purple font-semibold hover:underline">Sign in</a>
		</p>
	</div>
</div>

<!-- Required, invisible container for Firebase Phone Auth's reCAPTCHA -->
<div id="recaptcha-container"></div>
