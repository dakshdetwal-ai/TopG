// ===================================================
// TopG Algo — Account Settings Page Logic
// FRONTEND DEMO ONLY — no real profile updates, password changes,
// security operations or account deletions occur.
// ===================================================

// ---- Sidebar toggle (mobile) ----
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

// ---- Save toast helper ----
const saveToast = document.getElementById('saveToast');

function showSaveToast(message) {
  saveToast.textContent = message || '✓ Changes saved successfully (locally only)';
  saveToast.classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => saveToast.classList.remove('show'), 3000);
}

// ===================================================
// Profile Information
// ===================================================
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileDisplayEmail = document.getElementById('profileDisplayEmail');

const STORAGE_PROFILE_KEY = 'topg_profile_settings';
const STORAGE_PREFS_KEY = 'topg_preferences';

function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
  } else {
    inputEl.classList.remove('input-error');
    errorEl.textContent = '';
  }
}

function validateFullName(value) {
  if (!value.trim()) return 'Full name is required.';
  if (value.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
}

function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) return 'Email address is required.';
  if (!emailRegex.test(value)) return 'Enter a valid email address.';
  return '';
}

function validatePhone(value) {
  if (!value) return ''; // optional
  const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
  if (!phoneRegex.test(value)) return 'Enter a valid phone number.';
  return '';
}

fullNameInput.addEventListener('input', () => setFieldError(fullNameInput, fullNameError, ''));
emailInput.addEventListener('input', () => setFieldError(emailInput, emailError, ''));
phoneInput.addEventListener('input', () => setFieldError(phoneInput, phoneError, ''));

editProfileBtn.addEventListener('click', () => {
  const nameErr = validateFullName(fullNameInput.value);
  const emailErr = validateEmail(emailInput.value.trim());
  const phoneErr = validatePhone(phoneInput.value.trim());

  setFieldError(fullNameInput, fullNameError, nameErr);
  setFieldError(emailInput, emailError, emailErr);
  setFieldError(phoneInput, phoneError, phoneErr);

  if (nameErr || emailErr || phoneErr) return;

  // Update display header
  profileDisplayName.textContent = fullNameInput.value;
  profileDisplayEmail.textContent = emailInput.value;

  // Save locally
  const profileData = {
    fullName: fullNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value
  };
  localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileData));

  showSaveToast('✓ Profile updated successfully (locally only)');
});

// Load saved profile on page load
function loadProfile() {
  const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    fullNameInput.value = data.fullName || fullNameInput.value;
    emailInput.value = data.email || emailInput.value;
    phoneInput.value = data.phone || '';
    profileDisplayName.textContent = data.fullName || profileDisplayName.textContent;
    profileDisplayEmail.textContent = data.email || profileDisplayEmail.textContent;
  }
}

// ===================================================
// Avatar Preview
// ===================================================
const avatarUpload = document.getElementById('avatarUpload');
const avatarPreview = document.getElementById('avatarPreview');

avatarUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    avatarPreview.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// ===================================================
// Change Password (frontend preview only)
// ===================================================
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const passwordChangeError = document.getElementById('passwordChangeError');
const changePasswordBtn = document.getElementById('changePasswordBtn');

changePasswordBtn.addEventListener('click', () => {
  const current = currentPasswordInput.value;
  const newPass = newPasswordInput.value;
  const confirmPass = confirmNewPasswordInput.value;

  if (!current || !newPass || !confirmPass) {
    passwordChangeError.textContent = 'Please fill in all password fields.';
    return;
  }

  if (newPass.length < 8) {
    passwordChangeError.textContent = 'New password must be at least 8 characters.';
    return;
  }

  if (newPass !== confirmPass) {
    passwordChangeError.textContent = 'New passwords do not match.';
    return;
  }

  passwordChangeError.textContent = '';

  // Clear fields
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmNewPasswordInput.value = '';

  showSaveToast('✓ Password updated (demo only — no real change made)');
});

// ===================================================
// Active Sessions — Revoke (demo only)
// ===================================================
const revokeButtons = document.querySelectorAll('.btn-revoke');

revokeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const sessionItem = btn.closest('.session-item');
    const confirmed = confirm('Revoke this session? (This is a demo — no real session will be affected.)');
    if (confirmed) {
      sessionItem.style.opacity = '0.4';
      btn.textContent = 'Revoked';
      btn.disabled = true;
    }
  });
});

// ===================================================
// Preferences (Theme, Notifications, Trade Alerts)
// ===================================================
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const emailNotifications = document.getElementById('emailNotifications');
const tradeAlerts = document.getElementById('tradeAlerts');
const weeklySummary = document.getElementById('weeklySummary');
const savePreferencesBtn = document.getElementById('savePreferencesBtn');

const defaultPrefs = {
  darkTheme: true,
  emailNotifications: true,
  tradeAlerts: true,
  weeklySummary: false
};

function loadPreferences() {
  const saved = localStorage.getItem(STORAGE_PREFS_KEY);
  const prefs = saved ? JSON.parse(saved) : defaultPrefs;

  themeToggle.checked = !prefs.darkTheme; // checked = light mode
  themeLabel.textContent = prefs.darkTheme ? 'Dark' : 'Light';
  emailNotifications.checked = prefs.emailNotifications;
  tradeAlerts.checked = prefs.tradeAlerts;
  weeklySummary.checked = prefs.weeklySummary;

  applyThemePreview(prefs.darkTheme);
}

themeToggle.addEventListener('change', () => {
  const isDark = !themeToggle.checked;
  themeLabel.textContent = isDark ? 'Dark' : 'Light';
  applyThemePreview(isDark);
});

function applyThemePreview(isDark) {
  // Simple visual preview — since the whole platform is designed dark-first,
  // light mode here is a subtle demo filter rather than a full theme rebuild.
  if (isDark) {
    document.body.style.filter = 'none';
  } else {
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
  }
}

savePreferencesBtn.addEventListener('click', () => {
  const prefs = {
    darkTheme: !themeToggle.checked,
    emailNotifications: emailNotifications.checked,
    tradeAlerts: tradeAlerts.checked,
    weeklySummary: weeklySummary.checked
  };

  localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  showSaveToast('✓ Preferences saved successfully (locally only)');
});

// ===================================================
// Danger Zone — Delete Account Modal
// ===================================================
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

deleteAccountBtn.addEventListener('click', () => {
  deleteModalOverlay.classList.add('show');
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteModalOverlay.classList.remove('show');
});

deleteModalOverlay.addEventListener('click', (e) => {
  if (e.target === deleteModalOverlay) {
    deleteModalOverlay.classList.remove('show');
  }
});

confirmDeleteBtn.addEventListener('click', () => {
  deleteModalOverlay.classList.remove('show');
  alert('This is a demo only — your account has NOT been deleted. Real account deletion will be available once the backend is connected.');
});

// ===================================================
// Initial Load
// ===================================================
loadProfile();
loadPreferences();
