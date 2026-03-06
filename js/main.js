/* ============================================================
   АКАДЕМИКА — main.js
   ============================================================ */

/* ── 1. PRELOADER ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('gone');

    const heroImg = document.getElementById('hero-img');
    if (heroImg) heroImg.classList.add('zoomed');

    document.querySelectorAll('.reaction-card').forEach(card => {
      const delay = parseInt(card.dataset.delay || 0);
      setTimeout(() => card.classList.add('visible'), delay);
    });

    runCounters();
  }, 1600);
});

/* ── 2. СЧЁТЧИКИ ──────────────────────────────────────────── */
function runCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ── 3. HEADER ────────────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── 4. BURGER-МЕНЮ ───────────────────────────────────────── */
const burger = document.getElementById('burger');
const nav    = document.getElementById('nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.nav-link, .btn-orange, .btn-outline-nav').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── 5. ПЛАВНЫЙ СКРОЛЛ ────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });
});

/* ── 6. SCROLL REVEAL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.course-card, .why-item, .review-card, .contact-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 0.09 + 's';
  revealObserver.observe(el);
});

/* ── 7. FORM TABS ─────────────────────────────────────────── */
document.querySelectorAll('.form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-body').forEach(b => b.classList.add('hidden'));
    tab.classList.add('active');
    const formBody = document.getElementById('form-' + tab.dataset.tab);
    if (formBody) formBody.classList.remove('hidden');
  });
});

/* ── 8. SELECT floating label ─────────────────────────────── */
document.querySelectorAll('.form-select').forEach(sel => {
  sel.addEventListener('change', () => sel.classList.toggle('has-val', !!sel.value));
});

/* ── 9. МАСКА ТЕЛЕФОНА ────────────────────────────────────── */
document.querySelectorAll('.phone-input').forEach(input => {
  input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7') && v.length > 0) v = '7' + v;
    v = v.slice(0, 11);
    let r = '+7';
    if (v.length > 1) r += ' (' + v.slice(1, 4);
    if (v.length >= 4) r += ') ' + v.slice(4, 7);
    if (v.length >= 7) r += '-' + v.slice(7, 9);
    if (v.length >= 9) r += '-' + v.slice(9, 11);
    e.target.value = r;
  });
});

/* ── 10. ОТПРАВКА ФОРМЫ ───────────────────────────────────── */
function submitForm(type) {
  const isParent = type === 'parents';
  const name  = document.getElementById(isParent ? 'p-name'  : 't-name')?.value.trim();
  const phone = document.getElementById(isParent ? 'p-phone' : 't-phone')?.value.trim();
  const extra = document.getElementById(isParent ? 'p-course' : 't-dir')?.value;

  if (!name || !phone || !extra) {
    const wrap = document.getElementById(isParent ? 'form-parents' : 'form-teachers');
    if (wrap) {
      wrap.style.animation = 'shake .4s ease';
      wrap.addEventListener('animationend', () => { wrap.style.animation = ''; }, { once: true });
    }
    return;
  }

  // ── Formspree — заявки на email ──────────────────────────────
  const FORMSPREE_ID = 'xwvngwwa';
  const subject = isParent
    ? `Новая заявка от родителя — ${extra}`
    : `Новый педагог — ${extra}`;
  const body = isParent
    ? { _subject: subject, Тип: 'Родитель', Имя: name, Телефон: phone, Курс: extra }
    : { _subject: subject, Тип: 'Педагог',  Имя: name, Телефон: phone, Направление: extra };

  fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  }).catch(() => {});
  // ─────────────────────────────────────────────────────────────

  const modalText = document.getElementById('modal-text');
  if (modalText) {
    modalText.textContent = isParent
      ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время!'
      : 'Кристина рассмотрит вашу заявку и свяжется с вами в ближайшее время!';
  }
  document.getElementById('modal')?.classList.add('open');
  document.getElementById('modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById(isParent ? 'form-parents' : 'form-teachers')
    ?.querySelectorAll('input, select')
    .forEach(el => { el.value = ''; el.classList.remove('has-val'); });
}

/* ── 11. ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ────────────────────────── */
function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  document.getElementById('modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
