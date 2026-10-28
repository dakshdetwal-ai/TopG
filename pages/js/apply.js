// ===================================================
// TopG Algo — Apply for Access Page Logic
// FRONTEND PROTOTYPE ONLY — no application is actually submitted or saved.
// Backend integration will be connected in a future update.
// ===================================================

// ---- DOM references ----
const applyForm = document.getElementById('applyForm');
const formCard = document.getElementById('formCard');
const confirmationCard = document.getElementById('confirmationCard');

const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const whatsappInput = document.getElementById('whatsapp');
const reasonInput = document.getElementById('reason');
const riskCheckbox = document.getElementById('riskCheckbox');

const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const whatsappError = document.getElementById('whatsappError');
const experienceError = document.getElementById('experienceError');
const platformError = document.getElementById('platformError');
const hasDeviceError = document.getElementById('hasDeviceError');
const riskError = document.getElementById('riskError');

const submitBtn = document.getElementById('submitBtn');
const authBanner = document.getElementById('authBanner');

// ---- Helper: show field error ----
function setFieldError(inputEl, errorEl, message) {
  if (message) {
    if (inputEl) inputEl.classList.add('input-error');
    errorEl.textContent = message;
  } else {
    if (inputEl) inputEl.classList.remove('input-error');
    errorEl.textContent = '';
  }
}

// ---- Helper: show banner ----
function showBanner(message, type = 'error') {
  authBanner.textContent = message;
  authBanner.className = `auth-banner show ${type}`;
}

function hideBanner() {
  authBanner.className = 'auth-banner';
  authBanner.textContent = '';
}

// ---- Validation functions ----
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

function validateWhatsapp(value) {
  if (!value) return ''; // optional field
  const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
  if (!phoneRegex.test(value)) return 'Enter a valid phone number.';
  return '';
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function validateRadioGroup(name) {
  return getRadioValue(name) ? '' : 'Please select an option.';
}

function validateRisk(checked) {
  if (!checked) return 'You must acknowledge the risk disclosure to continue.';
  return '';
}

// ---- Live validation ----
fullNameInput.addEventListener('blur', () => {
  setFieldError(fullNameInput, fullNameError, validateFullName(fullNameInput.value));
});
fullNameInput.addEventListener('input', () => setFieldError(fullNameInput, fullNameError, ''));

emailInput.addEventListener('blur', () => {
  setFieldError(emailInput, emailError, validateEmail(emailInput.value.trim()));
});
emailInput.addEventListener('input', () => setFieldError(emailInput, emailError, ''));

whatsappInput.addEventListener('blur', () => {
  setFieldError(whatsappInput, whatsappError, validateWhatsapp(whatsappInput.value.trim()));
});
whatsappInput.addEventListener('input', () => setFieldError(whatsappInput, whatsappError, ''));

document.querySelectorAll('input[name="experience"]').forEach(radio => {
  radio.addEventListener('change', () => setFieldError(null, experienceError, ''));
});
document.querySelectorAll('input[name="platform"]').forEach(radio => {
  radio.addEventListener('change', () => setFieldError(null, platformError, ''));
});
document.querySelectorAll('input[name="hasDevice"]').forEach(radio => {
  radio.addEventListener('change', () => setFieldError(null, hasDeviceError, ''));
});

riskCheckbox.addEventListener('change', () => setFieldError(null, riskError, ''));

// ---- Loading state ----
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('loading', isLoading);
}

// ---- Form submit handler ----
applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner();

  const fullName = fullNameInput.value;
  const email = emailInput.value.trim();
  const whatsapp = whatsappInput.value.trim();
  const experience = getRadioValue('experience');
  const platform = getRadioValue('platform');
  const hasDevice = getRadioValue('hasDevice');
  const reason = reasonInput.value.trim();
  const riskAccepted = riskCheckbox.checked;

  const fullNameErr = validateFullName(fullName);
  const emailErr = validateEmail(email);
  const whatsappErr = validateWhatsapp(whatsapp);
  const experienceErr = validateRadioGroup('experience');
  const platformErr = validateRadioGroup('platform');
  const hasDeviceErr = validateRadioGroup('hasDevice');
  const riskErr = validateRisk(riskAccepted);

  setFieldError(fullNameInput, fullNameError, fullNameErr);
  setFieldError(emailInput, emailError, emailErr);
  setFieldError(whatsappInput, whatsappError, whatsappErr);
  setFieldError(null, experienceError, experienceErr);
  setFieldError(null, platformError, platformErr);
  setFieldError(null, hasDeviceError, hasDeviceErr);
  setFieldError(null, riskError, riskErr);

  const hasErrors = fullNameErr || emailErr || whatsappErr || experienceErr || platformErr || hasDeviceErr || riskErr;

  if (hasErrors) {
    showBanner('Please fix the errors below before submitting.', 'error');
    return;
  }

  setLoading(true);

  // ===== FRONTEND-ONLY PROTOTYPE =====
  // No real application is submitted or saved. Backend will be connected later.
  await new Promise(resolve => setTimeout(resolve, 1200));

  console.log('Application data (prototype only):', {
    fullName,
    email,
    whatsapp: whatsapp || 'Not provided',
    experience,
    platform,
    hasDevice,
    reason: reason || 'Not provided'
  });

  setLoading(false);

  // Show confirmation screen, hide form
  formCard.style.display = 'none';
  confirmationCard.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
