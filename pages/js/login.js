// ===================================================
// TopG Algo — Login Page Logic
// NOTE: Supabase backend not connected yet.
// Replace SUPABASE_URL and SUPABASE_ANON_KEY once backend is ready.
// ===================================================

// ---- Supabase client setup (placeholder, activate later) ----
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;

// Only initialize if the SDK loaded and keys are set
if (window.supabase && SUPABASE_URL.startsWith("http")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ---- DOM references ----
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const togglePassword = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const rememberMe = document.getElementById('rememberMe');
const submitBtn = document.getElementById('submitBtn');
const authBanner = document.getElementById('authBanner');

// ---- Load remembered email on page load ----
window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('topg_remember_email');
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }
});

// ---- Show/hide password toggle ----
togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePassword.classList.toggle('active', isPassword);

  // Swap icon (slash eye vs open eye)
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.56M1 1l22 22"></path>
       <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
       <circle cx="12" cy="12" r="3"></circle>`;
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

// ---- Validation ----
function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) return 'Email address is required.';
  if (!emailRegex.test(value)) return 'Enter a valid email address.';
  return '';
}

function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

// Live validation on blur
emailInput.addEventListener('blur', () => {
  setFieldError(emailInput, emailError, validateEmail(emailInput.value.trim()));
});

passwordInput.addEventListener('blur', () => {
  setFieldError(passwordInput, passwordError, validatePassword(passwordInput.value));
});

// Clear errors while typing
emailInput.addEventListener('input', () => setFieldError(emailInput, emailError, ''));
passwordInput.addEventListener('input', () => setFieldError(passwordInput, passwordError, ''));

// ---- Loading state helpers ----
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('loading', isLoading);
}

// ---- Form submit handler ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const emailErr = validateEmail(email);
  const passwordErr = validatePassword(password);

  setFieldError(emailInput, emailError, emailErr);
  setFieldError(passwordInput, passwordError, passwordErr);

  if (emailErr || passwordErr) {
    return;
  }

  setLoading(true);

  try {
    // Remember me handling
    if (rememberMe.checked) {
      localStorage.setItem('topg_remember_email', email);
    } else {
      localStorage.removeItem('topg_remember_email');
    }

    if (supabaseClient) {
      // ===== REAL SUPABASE AUTH (active once backend is connected) =====
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      showBanner('Login successful. Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } else {
      // ===== FRONTEND-ONLY PLACEHOLDER (backend not connected yet) =====
      console.warn('Supabase not configured yet. Simulating login flow.');

      await new Promise(resolve => setTimeout(resolve, 1200));

      showBanner('Backend not connected yet — this is a UI preview only.', 'error');
    }

  } catch (err) {
    console.error(err);

    let message = 'Invalid email or password. Please try again.';

    if (err.message) {
      if (err.message.toLowerCase().includes('invalid login credentials')) {
        message = 'Incorrect email or password.';
      } else if (err.message.toLowerCase().includes('email not confirmed')) {
        message = 'Please verify your email before logging in.';
      } else {
        message = err.message;
      }
    }

    showBanner(message, 'error');

  } finally {
    setLoading(false);
  }
});
