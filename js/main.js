/* ============================================================
   АКАДЕМИКА — main.js
   Senior Frontend: IMask, FAQ-accordion, Formspree, reveal
   ============================================================ */

/* ══ 1. PRELOADER + HERO INIT ════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    // Скрыть preloader
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('gone');

    // Ken-Burns на фоне hero
    const heroImg = document.getElementById('hero-img');
    if (heroImg) heroImg.classList.add('zoomed');

    // Реакции детей — появляются каскадом
    document.querySelectorAll('.reaction-card').forEach(card => {
      setTimeout(() => card.classList.add('visible'),
        parseInt(card.dataset.delay || 0));
    });

    // Запустить счётчики
    runCounters();
  }, 1600);
});

/* ══ 2. СЧЁТЧИКИ ══════════════════════════════════════════════ */
function runCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target   = parseInt(el.dataset.count);
    const duration = 1800;
    const start    = performance.now();

    const tick = (now) => {
      const p     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ══ 3. HEADER — scrolled ════════════════════════════════════ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ══ 4. BURGER-МЕНЮ ══════════════════════════════════════════ */
const burger = document.getElementById('burger');
const nav    = document.getElementById('nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Закрыть по клику на ссылку/кнопку внутри nav
  nav.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ══ 5. ПЛАВНЫЙ СКРОЛЛ ═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });
});

/* ══ 6. SCROLL REVEAL ════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Добавляем класс reveal + stagger всем карточкам
document.querySelectorAll(
  '.course-card, .why-item, .review-card, .contact-card, .faq-item'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 0.09 + 's';
  revealObserver.observe(el);
});

/* ══ 7. FAQ АККОРДЕОН ════════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Закрыть все остальные
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      }
    });

    // Переключить текущий
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

/* ══ 8. FORM TABS ════════════════════════════════════════════ */
document.querySelectorAll('.form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-body').forEach(b => b.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('form-' + tab.dataset.tab)?.classList.remove('hidden');
  });
});

/* ══ 9. SELECT — floating label ══════════════════════════════ */
document.querySelectorAll('.form-select').forEach(sel => {
  sel.addEventListener('change', () => sel.classList.toggle('has-val', !!sel.value));
});

/* ══ 10. IMASK — МАСКА ТЕЛЕФОНА ══════════════════════════════
   Формат: +7 (926) 786-39-39
   Вешается на все поля type="tel" после загрузки DOM           */
function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    // Если IMask загружен — используем его
    if (typeof IMask !== 'undefined') {
      IMask(input, {
        mask: '+{7} (000) 000-00-00',
        lazy: true,          // placeholder виден только при фокусе
        placeholderChar: '_'
      });
    } else {
      // Fallback: ручная маска на чистом JS
      input.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.startsWith('8')) v = '7' + v.slice(1);
        if (v.length > 0 && !v.startsWith('7')) v = '7' + v;
        v = v.slice(0, 11);
        let r = '+7';
        if (v.length > 1) r += ' (' + v.slice(1, 4);
        if (v.length >= 4) r += ') ' + v.slice(4, 7);
        if (v.length >= 7) r += '-' + v.slice(7, 9);
        if (v.length >= 9) r += '-' + v.slice(9, 11);
        e.target.value = r;
      });
    }
  });
}

// Запустить маски: если IMask ещё не успел загрузиться — подождём
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhoneMasks);
} else {
  initPhoneMasks();
}

/* ══ 11. FORMSPREE — ОТПРАВКА ════════════════════════════════ */
function submitForm(type) {
  const isParent = type === 'parents';

  const nameEl  = document.getElementById(isParent ? 'p-name'  : 't-name');
  const phoneEl = document.getElementById(isParent ? 'p-phone' : 't-phone');
  const extraEl = document.getElementById(isParent ? 'p-course': 't-dir');

  const name  = nameEl?.value.trim()  ?? '';
  const phone = phoneEl?.value.trim() ?? '';
  const extra = extraEl?.value        ?? '';

  // ── Валидация ───────────────────────────────────────────────
  const formId = isParent ? 'form-parents' : 'form-teachers';
  if (!name || phone.replace(/\D/g, '').length < 11 || !extra) {
    const wrap = document.getElementById(formId);
    if (wrap) {
      wrap.style.animation = 'none';
      wrap.offsetHeight;                         // reflow
      wrap.style.animation = 'shake .4s ease';
      wrap.addEventListener('animationend',
        () => { wrap.style.animation = ''; }, { once: true });
    }
    return;
  }

  // ── Отправка в Formspree ────────────────────────────────────
  const FORMSPREE_ID = 'xwvngwwa';   // ← ваш ID

  const subject = isParent
    ? `Новая заявка от родителя — ${extra}`
    : `Новый педагог — ${extra}`;

  const payload = isParent
    ? { _subject: subject, Тип: 'Родитель', Имя: name, Телефон: phone, Курс: extra }
    : { _subject: subject, Тип: 'Педагог',  Имя: name, Телефон: phone, Направление: extra };

  fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload)
  }).catch(() => {});   // ошибки сети молча игнорируем — модалка открывается всегда

  // ── Успех: открыть модалку ───────────────────────────────────
  const modalText = document.getElementById('modal-text');
  if (modalText) {
    modalText.textContent = isParent
      ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время!'
      : 'Кристина рассмотрит вашу заявку и свяжется в ближайшее время!';
  }
  document.getElementById('modal')?.classList.add('open');
  document.getElementById('modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';

  // ── Очистить поля ────────────────────────────────────────────
  document.getElementById(formId)
    ?.querySelectorAll('input, select')
    .forEach(el => { el.value = ''; el.classList.remove('has-val'); });
}

/* ══ 12. ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ═══════════════════════════ */
function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  document.getElementById('modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
