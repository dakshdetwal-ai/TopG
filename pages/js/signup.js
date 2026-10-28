// ===================================================
// TopG Algo — Signup Page Logic
// FRONTEND PROTOTYPE ONLY — no real accounts are created.
// Backend (Supabase) will be connected in a later step.
// ===================================================

// ---- DOM references ----
const signupForm = document.getElementById('signupForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('termsCheckbox');

const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const termsError = document.getElementById('termsError');

const submitBtn = document.getElementById('submitBtn');
const authBanner = document.getElementById('authBanner');

const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

// ---- Show/hide password toggles ----
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = btn.querySelector('.eye-icon');
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';
    btn.classList.toggle('active', isPassword);

    icon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.56M1 1l22 22"></path>
         <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
         <circle cx="12" cy="12" r="3"></circle>`;
  });
});

// ---- Helper: show field error ----
function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
  } else {
    inputEl.classList.remove('input-error');
    errorEl.textContent = '';
  }
}

// ---- Helper: show banner message ----
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

function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}

function validateTerms(checked) {
  if (!checked) return 'You must agree to the terms to continue.';
  return '';
}

// ---- Password strength checker ----
function checkPasswordStrength(value) {
  if (!value) {
    passwordStrength.classList.remove('show');
    return;
  }

  passwordStrength.classList.add('show');

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  let percent = 0;
  let label = '';
  let color = '';

  if (score <= 1) {
    percent = 25; label = 'Weak'; color = '#f04c4c';
  } else if (score <= 2) {
    percent = 50; label = 'Fair'; color = '#e0b23c';
  } else if (score <= 3) {
    percent = 75; label = 'Good'; color = '#10d97a';
  } else {
    percent = 100; label = 'Strong'; color = '#0fe085';
  }

  strengthFill.style.width = percent + '%';
  strengthFill.style.background = color;
  strengthLabel.textContent = label;
  strengthLabel.style.color = color;
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

passwordInput.addEventListener('input', () => {
  checkPasswordStrength(passwordInput.value);
  setFieldError(passwordInput, passwordError, '');

  // Re-check confirm password match live if already filled
  if (confirmPasswordInput.value) {
    setFieldError(
      confirmPasswordInput,
      confirmPasswordError,
      validateConfirmPassword(passwordInput.value, confirmPasswordInput.value)
    );
  }
});

passwordInput.addEventListener('blur', () => {
  setFieldError(passwordInput, passwordError, validatePassword(passwordInput.value));
});

confirmPasswordInput.addEventListener('blur', () => {
  setFieldError(
    confirmPasswordInput,
    confirmPasswordError,
    validateConfirmPassword(passwordInput.value, confirmPasswordInput.value)
  );
});
confirmPasswordInput.addEventListener('input', () => setFieldError(confirmPasswordInput, confirmPasswordError, ''));

termsCheckbox.addEventListener('change', () => {
  setFieldError(termsCheckbox, termsError, '');
});

// ---- Loading state helper ----
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('loading', isLoading);
}

// ---- Form submit handler ----
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner();

  const fullName = fullNameInput.value;
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const termsAccepted = termsCheckbox.checked;

  const fullNameErr = validateFullName(fullName);
  const emailErr = validateEmail(email);
  const passwordErr = validatePassword(password);
  const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);
  const termsErr = validateTerms(termsAccepted);

  setFieldError(fullNameInput, fullNameError, fullNameErr);
  setFieldError(emailInput, emailError, emailErr);
  setFieldError(passwordInput, passwordError, passwordErr);
  setFieldError(confirmPasswordInput, confirmPasswordError, confirmPasswordErr);

  if (termsErr) {
    termsError.textContent = termsErr;
  } else {
    termsError.textContent = '';
  }

  if (fullNameErr || emailErr || passwordErr || confirmPasswordErr || termsErr) {
    return;
  }

  setLoading(true);

  // ===== FRONTEND-ONLY PROTOTYPE =====
  // No real account is created yet. Backend (Supabase) will be wired in later.
  await new Promise(resolve => setTimeout(resolve, 1200));

  console.log('Signup form data (prototype only):', {
    fullName,
    email,
    password: '••••••••'
  });

  showBanner('This is a frontend preview — account creation will be enabled once the backend is connected.', 'success');

  setLoading(false);
});
