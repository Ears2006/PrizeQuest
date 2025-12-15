import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

// DOM
const form = document.querySelector('.form');
const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');
const modeToggle = document.getElementById('modeToggle'); // checkbox
const authBtn = document.getElementById('authBtn'); // the green button

// Button label toggle (Login ↔ Register)
function updateButtonLabel() {
  if (!authBtn) return;
  authBtn.textContent = modeToggle && modeToggle.checked ? 'Register' : 'Login';
}
if (modeToggle) modeToggle.addEventListener('change', updateButtonLabel);
updateButtonLabel();

// Submit handler
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const isRegister = Boolean(modeToggle && modeToggle.checked);
    try {
      if (authBtn) authBtn.disabled = true;

      if (isRegister) {
        // Create account → send verification → go to check-email page
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const returnUrl = `${location.origin}/profile/build.html`; // where we go after verifying
        await sendEmailVerification(cred.user, { url: returnUrl });
        window.location.href = '/auth/check-email.html';
        return;
      }

      // Login → if not verified, push to check-email; if verified, continue to app
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await reload(cred.user);
      if (!cred.user.emailVerified) {
        window.location.href = '/auth/check-email.html';
        return;
      }
      window.location.href = '/dashboard.html'; // redirect to dashboard after login
    } catch (err) {
      console.error('Auth error:', err);
      alert(err?.message || 'Authentication error');
    } finally {
      if (authBtn) authBtn.disabled = false;
    }
  });
}

// Auto-redirect if already signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/dashboard.html';
  }
});
