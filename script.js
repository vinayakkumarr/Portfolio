/**
 * PORTFOLIO — SCRIPT.JS
 * ─────────────────────────────────────────────────────────────
 * Features:
 *   1. Navbar   — scrolled state + active section link tracking
 *   2. Typed    — animated typing effect in hero subtitle
 *   3. Reveal   — scroll-triggered fade-in via IntersectionObserver
 *   4. Scroll   — smooth scrolling with fixed-nav offset
 *   5. Contact  — client-side validation + Web3Forms AJAX submit
 *   6. Footer   — current year auto-update
 *   7. Hero     — ensure animated elements stay visible post-animation
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────────────────────── */

/** Returns the first matching element, or null. */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Returns all matching elements as an Array. */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


/* ─────────────────────────────────────────────────────────────
   1. NAVBAR — SCROLLED STATE + ACTIVE LINK TRACKING
───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = $('#navbar');
  const navLinks = $$('#navbar .nav-link');
  const sections = $$('section[id]');

  if (!navbar) return;

  /* ── Scrolled shadow ──────────────────────────────────────── */
  const updateScrolled = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', updateScrolled, { passive: true });
  updateScrolled(); // run on page load

  /* ── Active link via IntersectionObserver ─────────────────── */
  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
      });

      // Highlight the top-most currently visible section
      const activeId = sections.find((s) => visible.has(s.id))?.id;
      navLinks.forEach((link) => {
        const matches = activeId && link.getAttribute('href') === `#${activeId}`;
        link.classList.toggle('active', !!matches);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((s) => observer.observe(s));

  /* ── Collapse mobile menu on link click ───────────────────── */
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const collapse = $('#navbarNav');
      if (collapse?.classList.contains('show')) {
        bootstrap.Collapse.getInstance(collapse)?.hide();
      }
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   2. SMOOTH SCROLLING (with fixed-nav offset)
───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const navH        = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
  const EXTRA       = 16; // breathing room below navbar

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const id     = anchor.getAttribute('href');
    if (!id || id === '#') return;

    const target = $(id);
    if (!target) return;

    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH - EXTRA,
      behavior: 'smooth',
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   3. TYPED TEXT ANIMATION (Hero Subtitle)
───────────────────────────────────────────────────────────── */
(function initTyped() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'Web Developer',
    'BCA Student',
    'Problem Solver',
    'Active Learner',
  ];

  let phraseIdx  = 0;
  let charIdx    = 0;
  let deleting   = false;

  const TYPE_MS    = 80;
  const DELETE_MS  = 45;
  const PAUSE_FULL = 1800; // pause after full phrase
  const PAUSE_NEXT = 400;  // pause before next phrase

  function tick() {
    const phrase = phrases[phraseIdx];

    el.textContent = deleting
      ? phrase.slice(0, --charIdx)
      : phrase.slice(0, ++charIdx);

    let delay = deleting ? DELETE_MS : TYPE_MS;

    if (!deleting && charIdx === phrase.length) {
      delay    = PAUSE_FULL;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay     = PAUSE_NEXT;
    }

    setTimeout(tick, delay);
  }

  // Delay start until hero animation finishes (~800 ms)
  setTimeout(tick, 800);
})();


/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────────────────────── */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   5. CONTACT FORM — Validation + Web3Forms AJAX Submit
───────────────────────────────────────────────────────────── */
(function initContactForm() {

  const form      = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const statusEl  = $('#form-status');

  if (!form || !submitBtn || !statusEl) return;

  /* ── Field validation rules ────────────────────────────────── */
  const FIELDS = [
    {
      el:    $('#name'),
      errEl: $('#name-error'),
      test:  (v) => v.trim().length >= 2,
      msg:   'Please enter your full name (at least 2 characters).',
    },
    {
      el:    $('#email'),
      errEl: $('#email-error'),
      test:  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg:   'Please enter a valid email address.',
    },
    {
      el:    $('#subject-field'),
      errEl: $('#subject-error'),
      test:  (v) => v.trim().length >= 3,
      msg:   'Please enter a subject (at least 3 characters).',
    },
    {
      el:    $('#message'),
      errEl: $('#message-error'),
      test:  (v) => v.trim().length >= 20,
      msg:   'Please write a message (at least 20 characters).',
    },
  ];

  /* ── Real-time per-field validation (on blur / input) ───────── */
  FIELDS.forEach(({ el, errEl, test, msg }) => {
    if (!el) return;

    // Show error when user leaves the field
    el.addEventListener('blur', () => validateField(el, errEl, test, msg));

    // Clear error as soon as user corrects the value
    el.addEventListener('input', () => {
      if (el.classList.contains('is-error') && test(el.value)) {
        clearError(el, errEl);
      }
    });
  });

  /* ── Form submit ─────────────────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    hideStatus();

    // Run all validators; collect overall validity
    const allValid = FIELDS.every(({ el, errEl, test, msg }) =>
      el ? validateField(el, errEl, test, msg) : true
    );

    if (!allValid) {
      // Focus first invalid field for accessibility
      const firstInvalid = FIELDS.find(({ el }) => el?.classList.contains('is-error'))?.el;
      firstInvalid?.focus();
      return;
    }

    await sendToWeb3Forms();
  });

  /* ── Web3Forms AJAX submission ──────────────────────────────── */
  async function sendToWeb3Forms() {
    setLoading(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showStatus('success', 'Message sent! I\'ll get back to you soon.');
        form.reset();
        // Clear any residual error states after reset
        FIELDS.forEach(({ el, errEl }) => el && clearError(el, errEl));
        setButtonSuccess();
      } else {
        // API returned an error payload (e.g. invalid access key)
        const msg = data.message || 'Something went wrong. Please try again.';
        showStatus('error', msg);
        resetButton();
      }

    } catch (networkErr) {
      console.error('[Portfolio] Web3Forms network error:', networkErr);
      showStatus('error', 'Network error — please check your connection and try again.');
      resetButton();
    }
  }

  /* ── UI State Helpers ───────────────────────────────────────── */

  /**
   * Puts the submit button into a loading / disabled state.
   * @param {boolean} loading
   */
  function setLoading(loading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.bi');

    submitBtn.disabled = loading;

    if (loading) {
      if (btnText) btnText.textContent = 'Sending…';
      if (btnIcon) { btnIcon.className = ''; btnIcon.classList.add('bi', 'bi-hourglass-split', 'ms-2'); }
    }
  }

  /** Puts the button into a temporary "sent" success state, then resets it. */
  function setButtonSuccess() {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.bi');

    if (btnText) btnText.textContent = 'Message Sent!';
    if (btnIcon) { btnIcon.className = ''; btnIcon.classList.add('bi', 'bi-check-lg', 'ms-2'); }
    submitBtn.style.background   = 'var(--clr-accent)';
    submitBtn.style.borderColor  = 'var(--clr-accent)';

    setTimeout(() => {
      resetButton();
    }, 4000);
  }

  /** Restores the button to its default idle state. */
  function resetButton() {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.bi');

    submitBtn.disabled           = false;
    submitBtn.style.background   = '';
    submitBtn.style.borderColor  = '';

    if (btnText) btnText.textContent = 'Send Message';
    if (btnIcon) { btnIcon.className = ''; btnIcon.classList.add('bi', 'bi-send', 'ms-2'); }
  }

  /**
   * Shows the shared status banner beneath the form.
   * @param {'success'|'error'} type
   * @param {string} message
   */
  function showStatus(type, message) {
    statusEl.className = 'form-status-msg'; // reset classes
    const icon = type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle';
    statusEl.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i>${message}`;
    statusEl.classList.add(type === 'success' ? 'is-success' : 'is-error');

    // Auto-hide after 7 seconds
    setTimeout(hideStatus, 7000);
  }

  function hideStatus() {
    statusEl.className = 'form-status-msg';
    statusEl.innerHTML = '';
  }

  /* ── Field validation helpers ────────────────────────────────── */

  /**
   * Validates a single field, updating its error state.
   * @returns {boolean} true if the field is valid
   */
  function validateField(el, errEl, test, msg) {
    const valid = test(el.value);
    valid ? clearError(el, errEl) : showError(el, errEl, msg);
    return valid;
  }

  function showError(el, errEl, msg) {
    el.classList.add('is-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(el, errEl) {
    el.classList.remove('is-error');
    if (errEl) errEl.textContent = '';
  }

})();


/* ─────────────────────────────────────────────────────────────
   6. FOOTER — CURRENT YEAR
───────────────────────────────────────────────────────────── */
(function setYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────
   7. HERO — Keep animated elements visible after animation ends
───────────────────────────────────────────────────────────── */
(function lockHeroVisibility() {
  $$('.hero-section .fade-in-up').forEach((el) => {
    el.addEventListener(
      'animationend',
      () => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      },
      { once: true }
    );
  });
})();
