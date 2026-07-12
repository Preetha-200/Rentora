<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { authUser } from '$lib/stores/auth.js';
	import { logout } from '$lib/stores/auth.js';
	import { auth } from '$lib/firebase';
	import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

	let loading = $state(false);
	let saveSuccess = $state('');
	let saveError = $state('');

	// Profile fields
	let name = $state($authUser?.name || '');
	let phone = $state($authUser?.phone || '');
	let bio = $state($authUser?.bio || '');

	// Password change
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let changingPassword = $state(false);
	let pwError = $state('');
	let pwSuccess = $state('');
	let showPwForm = $state(false);

	// Load latest profile
	onMount(async () => {
		try {
			const data = await api.get('/api/auth/profile');
			if (data.user) {
				name = data.user.name || '';
				phone = data.user.phone || '';
				bio = data.user.bio || '';
			}
		} catch {}
	});

	$effect(() => {
		if ($authUser) {
			if (!name) name = $authUser.name || '';
			if (!phone) phone = $authUser.phone || '';
		}
	});

	async function saveProfile(event) {
		event.preventDefault();
		loading = true;
		saveError = '';
		saveSuccess = '';
		try {
			await api.put('/api/auth/profile', { name, phone, bio });
			saveSuccess = 'Profile updated successfully!';
			setTimeout(() => (saveSuccess = ''), 3000);
		} catch (err) {
			saveError = err.message;
		} finally {
			loading = false;
		}
	}

	async function changePassword(event) {
		event.preventDefault();
		pwError = '';
		pwSuccess = '';
		if (newPassword !== confirmNewPassword) {
			pwError = 'Passwords do not match.';
			return;
		}
		if (newPassword.length < 6) {
			pwError = 'Password must be at least 6 characters.';
			return;
		}
		changingPassword = true;
		try {
			const user = auth.currentUser;
			const credential = EmailAuthProvider.credential(user.email, currentPassword);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, newPassword);
			pwSuccess = 'Password changed successfully!';
			currentPassword = '';
			newPassword = '';
			confirmNewPassword = '';
			showPwForm = false;
			setTimeout(() => (pwSuccess = ''), 4000);
		} catch (err) {
			const msgMap = {
				'auth/wrong-password': 'Current password is incorrect.',
				'auth/too-many-requests': 'Too many attempts. Try again later.',
				'auth/requires-recent-login': 'Please re-login and try again.'
			};
			pwError = msgMap[err.code] || err.message;
		} finally {
			changingPassword = false;
		}
	}

	function roleLabel(role) {
		const map = { admin: 'Platform Admin', owner: 'Property Owner', tenant: 'Tenant' };
		return map[role] || role;
	}

	function roleColor(role) {
		const map = {
			admin: 'from-rentora-purple to-rentora-dark',
			owner: 'from-blue-500 to-blue-700',
			tenant: 'from-emerald-500 to-green-700'
		};
		return map[role] || 'from-gray-500 to-gray-700';
	}
</script>

<svelte:head>
	<title>My Profile — Rentora</title>
</svelte:head>

<div class="max-w-3xl mx-auto animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-black text-rentora-dark">My Profile</h1>
		<p class="text-gray-500 mt-1">Manage your personal information and account settings.</p>
	</div>

	{#if $authUser}
		<!-- Avatar & role card -->
		<div class="bg-gradient-to-r from-rentora-dark to-rentora-blue rounded-3xl p-8 mb-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
			<div class="w-20 h-20 rounded-2xl bg-gradient-to-br {roleColor($authUser.role)} flex items-center justify-center text-3xl font-black shadow-xl border-4 border-white/20 shrink-0">
				{$authUser.name?.charAt(0)?.toUpperCase() || '?'}
			</div>
			<div class="text-center sm:text-left">
				<h2 class="text-2xl font-black">{$authUser.name || 'Unknown'}</h2>
				<p class="text-white/60 mt-1">{$authUser.email}</p>
				<span class="inline-block mt-3 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-sm font-bold backdrop-blur-sm capitalize">
					{roleLabel($authUser.role)}
				</span>
			</div>
		</div>
	{/if}

	<!-- Edit Profile -->
	<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
		<h2 class="text-xl font-bold text-rentora-dark mb-6 flex items-center gap-2">
			<span class="material-symbols-outlined text-rentora-purple filled">edit</span>
			Edit Information
		</h2>

		<form onsubmit={saveProfile} class="space-y-5">
			<div>
				<label for="profile-name" class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
				<div class="relative">
					<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">person</span>
					<input id="profile-name" type="text" bind:value={name} required class="input-field pl-11" placeholder="Your full name" />
				</div>
			</div>
			<div>
				<label for="profile-phone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
				<div class="relative">
					<span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-gray-400">phone</span>
					<input id="profile-phone" type="tel" bind:value={phone} class="input-field pl-11" placeholder="+91 XXXXX XXXXX" />
				</div>
			</div>
			<div>
				<label for="profile-bio" class="block text-sm font-semibold text-gray-700 mb-2">Bio <span class="text-gray-400 font-normal">(optional)</span></label>
				<textarea
					id="profile-bio"
					bind:value={bio}
					rows="3"
					placeholder="A short description about yourself..."
					class="input-field resize-none"></textarea>
			</div>

			{#if saveError}
				<div class="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
					<span class="material-symbols-outlined text-base">error</span>
					{saveError}
				</div>
			{/if}
			{#if saveSuccess}
				<div class="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
					<span class="material-symbols-outlined text-base filled">check_circle</span>
					{saveSuccess}
				</div>
			{/if}

			<div class="flex justify-end">
				<button type="submit" disabled={loading} class="flex items-center gap-2 px-6 py-3 bg-rentora-dark text-white rounded-xl font-semibold hover:bg-rentora-blue transition-all disabled:opacity-50">
					{#if loading}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						Saving...
					{:else}
						<span class="material-symbols-outlined text-base">save</span>
						Save Changes
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Password Change -->
	<div class="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold text-rentora-dark flex items-center gap-2">
				<span class="material-symbols-outlined text-rentora-purple filled">lock</span>
				Password & Security
			</h2>
			<button
				onclick={() => (showPwForm = !showPwForm)}
				class="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
				<span class="material-symbols-outlined text-base">{showPwForm ? 'close' : 'key'}</span>
				{showPwForm ? 'Cancel' : 'Change Password'}
			</button>
		</div>

		{#if pwSuccess}
			<div class="mt-4 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
				<span class="material-symbols-outlined text-base filled">check_circle</span>
				{pwSuccess}
			</div>
		{/if}

		{#if showPwForm}
			<form onsubmit={changePassword} class="mt-6 space-y-4">
				<div>
					<label for="current-pw" class="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
					<input id="current-pw" type="password" bind:value={currentPassword} required class="input-field" placeholder="Your current password" />
				</div>
				<div>
					<label for="new-pw" class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
					<input id="new-pw" type="password" bind:value={newPassword} required minlength="6" class="input-field" placeholder="Min. 6 characters" />
				</div>
				<div>
					<label for="confirm-new-pw" class="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
					<input id="confirm-new-pw" type="password" bind:value={confirmNewPassword} required class="input-field" placeholder="Repeat new password" />
				</div>

				{#if pwError}
					<div class="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
						<span class="material-symbols-outlined text-base">error</span>
						{pwError}
					</div>
				{/if}

				<div class="flex justify-end">
					<button type="submit" disabled={changingPassword} class="flex items-center gap-2 px-6 py-3 bg-rentora-purple text-white rounded-xl font-semibold hover:bg-rentora-purpleLight transition-all disabled:opacity-50">
						{#if changingPassword}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Updating...
						{:else}
							<span class="material-symbols-outlined text-base">lock_reset</span>
							Update Password
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>

	<!-- Danger zone -->
	<div class="bg-white rounded-2xl shadow-card border border-red-100 p-8">
		<h2 class="text-xl font-bold text-rentora-dark mb-4 flex items-center gap-2">
			<span class="material-symbols-outlined text-red-500">warning</span>
			Account Actions
		</h2>
		<p class="text-gray-500 text-sm mb-5">
			Signing out will end your current session on this device.
		</p>
		<button
			onclick={logout}
			class="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all active:scale-95 text-sm">
			<span class="material-symbols-outlined text-base">logout</span>
			Sign Out
		</button>
	</div>
</div>