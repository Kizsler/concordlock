/* ============================================================
   CONCORD LOCKSMITH — main.js
   ============================================================ */

/* ── NAV SCROLL ──────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── MOBILE MENU ─────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const overlay   = document.getElementById('mobileOverlay');
const closeBtn  = document.getElementById('mobileClose');
let menuOpen = false;

function toggleMenu(state) {
  menuOpen = state;
  overlay.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu(!menuOpen));
closeBtn.addEventListener('click', () => toggleMenu(false));
overlay.querySelectorAll('.m-link').forEach(a => {
  a.addEventListener('click', () => toggleMenu(false));
});

/* ── SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 20;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ── SCROLL REVEAL ───────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.revealDelay || 0);
    setTimeout(() => entry.target.classList.add('in'), delay);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function addReveal(selector, cls, stagger = 0) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add(cls);
    if (stagger) el.dataset.revealDelay = i * stagger;
    revealObs.observe(el);
  });
}

addReveal('.section-header', 'reveal');
addReveal('.svc-card', 'reveal', 100);
addReveal('.why-card', 'reveal', 80);
addReveal('.why-cta', 'reveal');
addReveal('.emg-inner', 'reveal');
addReveal('.story-text > *', 'reveal', 50);
addReveal('.cd-row', 'reveal', 80);
addReveal('.map-frame', 'reveal');
addReveal('.map-actions', 'reveal');
addReveal('.footer-inner > *', 'reveal', 60);
addReveal('.pb-cell', 'reveal', 100);

// Left/right reveals
const storyPhotos = document.querySelector('.story-photos');
const contactInfo = document.querySelector('.contact-info');
const contactMap  = document.querySelector('.contact-map');
if (storyPhotos) { storyPhotos.classList.add('reveal-l'); revealObs.observe(storyPhotos); }
if (contactInfo) { contactInfo.classList.add('reveal-l'); revealObs.observe(contactInfo); }
if (contactMap)  { contactMap.classList.add('reveal-r');  revealObs.observe(contactMap); }

/* ── COUNTER ANIMATION ───────────────────────────────────── */
function runCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const dur = 1600;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      runCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ── ACTIVE NAV LINK ON SCROLL ───────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');

const secObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAs.forEach(a => a.classList.remove('active'));
      const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => secObs.observe(s));

/* ── HERO VIDEO PLAYLIST ─────────────────────────────────── */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  const videoSources = [
    'https://static.videezy.com/system/resources/previews/000/042/860/original/welder_100fps.mp4',
    'https://videos.pexels.com/video-files/2070044/2070044-hd_1920_1080_25fps.mp4'
  ];
  let currentIndex = 0;

  heroVideo.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % videoSources.length;
    heroVideo.style.opacity = '0';
    setTimeout(() => {
      heroVideo.src = videoSources[currentIndex];
      heroVideo.load();
      heroVideo.play();
      heroVideo.style.opacity = '1';
    }, 400);
  });
}

/* ── PAGE ENTRY FADE ─────────────────────────────────────── */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.4s ease';
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});
