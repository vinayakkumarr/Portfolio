/**
 * PORTFOLIO — SCRIPT.JS
 * ─────────────────────────────────────────────────────────────
 * Features:
 *   1. Navbar    — scrolled state + active section link tracking
 *   2. Typed     — animated typing effect in hero subtitle
 *   3. Reveal    — scroll-triggered fade-in via IntersectionObserver
 *   4. Scroll    — smooth scrolling with fixed-nav offset
 *   5. Contact   — client-side validation + Web3Forms AJAX submit
 *   6. Footer    — current year auto-update
 *   7. Blueprint — Hero theodolite & harmonic telemetry interaction
 *   8. Cursor    — Smooth circular cursor follower with trailing delay
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
   7. HERO BLUEPRINT — THEODOLITE & HARMONIC TELEMETRY
───────────────────────────────────────────────────────────── */
(function initHeroBlueprint() {
  const heroSection   = $('.hero-section');
  const blueprintSvg  = $('#heroBlueprintSvg');
  const transitGroup  = $('#targetTransit');
  const compassGroup  = $('#targetCompass');
  const telemetryTime = $('#telemetryTime');
  const telemetryRows = $$('.blueprint-telemetry .telemetry-row');

  if (!heroSection || !blueprintSvg) return;

  /* ── 1. Live Indian Standard Time (IST) Clock ─────────────── */
  function updateIST() {
    if (!telemetryTime) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      telemetryTime.textContent = timeStr;
    } catch {
      const d = new Date();
      telemetryTime.textContent = d.toTimeString().split(' ')[0];
    }
  }
  updateIST();
  setInterval(updateIST, 1000);

  /* ── 2. Interactive Telemetry Row Hover Highlight ─────────── */
  const targetMap = {
    origin:    '#targetOrigin',
    coord:     '#targetCoord',
    interests: '#targetHarmonic',
    languages: '#targetTransit',
    time:      '#targetCompass'
  };

  telemetryRows.forEach((row) => {
    const key       = row.getAttribute('data-target');
    const targetSel = targetMap[key];
    if (!targetSel) return;
    const targetEl = blueprintSvg.querySelector(targetSel);
    if (!targetEl) return;

    row.addEventListener('mouseenter', () => {
      targetEl.classList.add('highlight-active');
    });
    row.addEventListener('mouseleave', () => {
      targetEl.classList.remove('highlight-active');
    });
  });

  /* ── 3. Smooth Outer Circle Directional Shift ─────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const SVG_CENTER_X = 360;
  const SVG_CENTER_Y = 300;

  let targetShiftX = 0;
  let targetShiftY = 0;
  let currentShiftX= 0;
  let currentShiftY= 0;

  // Release intro animation so user interaction has full transform control
  function releaseCompassAnimation() {
    if (compassGroup && !compassGroup.classList.contains('is-assembled')) {
      compassGroup.classList.add('is-assembled');
      compassGroup.style.animation = 'none';
      compassGroup.style.opacity = '1';
    }
  }

  if (compassGroup) {
    compassGroup.addEventListener('animationend', releaseCompassAnimation, { once: true });
    setTimeout(releaseCompassAnimation, 2100);
  }

  function onMouseMove(e) {
    // Unlock animation as soon as user interacts
    releaseCompassAnimation();

    const rect = blueprintSvg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // True screen pixel center of the circle (cx=360, cy=300 in 600x600 viewBox)
    const circleCenterX = rect.left + rect.width  * (SVG_CENTER_X / 600);
    const circleCenterY = rect.top  + rect.height * (SVG_CENTER_Y / 600);

    // Exact vector from circle center to mouse position on screen
    const dx = e.clientX - circleCenterX;
    const dy = e.clientY - circleCenterY;
    const dist = Math.hypot(dx, dy);

    // Natural circular influence zone around the circle
    const maxActiveRadius = Math.max(rect.width * 0.95, 460);

    if (dist < maxActiveRadius) {
      // Smooth falloff curve: 1.0 at center, smoothly easing to 0.0 at the outer boundary
      const falloff = Math.cos((dist / maxActiveRadius) * (Math.PI * 0.5));
      const shiftMagnitude = 28 * Math.min(dist / 220, 1) * falloff;

      // Pure directional shift along the exact cursor angle in all 360°
      targetShiftX = dist > 0 ? (dx / dist) * shiftMagnitude : 0;
      targetShiftY = dist > 0 ? (dy / dist) * shiftMagnitude : 0;
    } else {
      // Outside active radius: smoothly returns to resting center
      targetShiftX = 0;
      targetShiftY = 0;
    }
  }

  function onMouseLeave() {
    targetShiftX = 0;
    targetShiftY = 0;
  }

  heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
  heroSection.addEventListener('mouseleave', onMouseLeave, { passive: true });

  function renderLoop() {
    // Silky smooth spring interpolation (fluid 60fps glide)
    const lerpFactor = 0.085;
    currentShiftX += (targetShiftX - currentShiftX) * lerpFactor;
    currentShiftY += (targetShiftY - currentShiftY) * lerpFactor;

    // Outer circle smoothly shifts in the exact direction of the cursor (all 360°)
    if (compassGroup) {
      const tx = currentShiftX.toFixed(2);
      const ty = currentShiftY.toFixed(2);
      compassGroup.style.transform = `translate(${tx}px, ${ty}px)`;
      compassGroup.setAttribute('transform', `translate(${tx}, ${ty})`);
    }

    // Keep center surveyor transit anchored at home datum
    if (transitGroup) {
      transitGroup.setAttribute('transform', `translate(${SVG_CENTER_X}, ${SVG_CENTER_Y})`);
    }

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
})();

/* ─────────────────────────────────────────────────────────────
   8. CURSOR FOLLOWER — BESPOKE ARCHITECTURAL LENS & PRECISION RETICLE
───────────────────────────────────────────────────────────── */
(function initCursorFollower() {
  if (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.innerWidth < 768
  ) {
    return;
  }

  const dot = $('#cursorDot');
  const follower = $('#cursorFollower');
  if (!follower) return;

  let mouseX = -100;
  let mouseY = -100;

  // Micro datum point (tight tracking)
  let dotX = -100;
  let dotY = -100;

  // Floating lens reticle (physical inertia with luxurious delay)
  let currentX = -100;
  let currentY = -100;

  // High-Density Downscale Architecture (Base container is 28px):
  // Normal: 0.50 (14px) | Hover Zoom: 0.72 (20px) | Click: 0.38 (10.5px)
  // Because scale is always <= 0.72 of native vector texture, it NEVER pixelates when zooming!
  const SCALE_BASE  = 0.50;
  const SCALE_HOVER = 0.72;
  const SCALE_CLICK = 0.38;

  let targetScale = SCALE_BASE;
  let currentScale = SCALE_BASE;

  let isVisible = false;
  let isHovering = false;
  let isClicking = false;
  let lastTime = 0;

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      if (dot) dot.classList.add('is-visible');
      follower.classList.add('is-visible');
      dotX = mouseX;
      dotY = mouseY;
      currentX = mouseX;
      currentY = mouseY;
    }
  }

  function onMouseDown() {
    isClicking = true;
    targetScale = isHovering ? (SCALE_HOVER * 0.82) : SCALE_CLICK;
    follower.classList.add('is-clicking');
  }

  function onMouseUp() {
    isClicking = false;
    targetScale = isHovering ? SCALE_HOVER : SCALE_BASE;
    follower.classList.remove('is-clicking');
  }

  function onMouseLeave() {
    isVisible = false;
    if (dot) dot.classList.remove('is-visible');
    follower.classList.remove('is-visible');
  }

  function onMouseEnter() {
    isVisible = true;
    if (dot) dot.classList.add('is-visible');
    follower.classList.add('is-visible');
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mousedown', onMouseDown, { passive: true });
  window.addEventListener('mouseup', onMouseUp, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);

  // Delegate hover detection for clickable / interactive elements
  const interactiveSelector = 'a, button, input, textarea, select, .btn, .nav-link, .tag, [role="button"], .telemetry-row';

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      isHovering = true;
      targetScale = isClicking ? (SCALE_HOVER * 0.82) : SCALE_HOVER;
      if (dot) dot.classList.add('is-hovering');
      follower.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(interactiveSelector)) {
        isHovering = false;
        targetScale = isClicking ? SCALE_CLICK : SCALE_BASE;
        if (dot) dot.classList.remove('is-hovering');
        follower.classList.remove('is-hovering');
      }
    }
  }, { passive: true });

  // Framerate-independent physics render loop
  function renderCursor(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.05) || (1 / 60);
    lastTime = now;

    // Precision dot tracks tightly
    const dotFactor = 1 - Math.exp(-32.0 * dt);
    dotX += (mouseX - dotX) * dotFactor;
    dotY += (mouseY - dotY) * dotFactor;

    if (dot) {
      dot.style.transform = `translate3d(${dotX.toFixed(1)}px, ${dotY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }

    // Follower lens trails with physical inertia and smooth delay
    const posFactor = 1 - Math.exp(-4.6 * dt);
    const scaleFactor = 1 - Math.exp(-12.0 * dt);
    const vx = mouseX - currentX;
    const vy = mouseY - currentY;

    if (isVisible || Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05 || Math.abs(currentScale - targetScale) > 0.005) {
      currentX += vx * posFactor;
      currentY += vy * posFactor;
      currentScale += (targetScale - currentScale) * scaleFactor;

      follower.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${currentScale.toFixed(3)})`;
    }

    requestAnimationFrame(renderCursor);
  }

  requestAnimationFrame(renderCursor);
})();
