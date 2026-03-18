/* ============================================================
   АКАДЕМИКА — main.js
   Исправления:
   1. Убрана искусственная задержка setTimeout 1600ms в preloader.
      Прелоадер скрывается сразу по событию window 'load' —
      то есть как только браузер реально закончил загрузку.
   2. Кнопки форм переведены на addEventListener вместо
      inline onclick="submitForm(...)" в HTML.
   3. Кнопки закрытия модального окна — тоже через addEventListener.
   4. Escape-клавиша и оверлей закрывают модальное окно.
   5. Маски телефона инициализируются после DOMContentLoaded,
      т.к. IMask загружается с defer.
   ============================================================ */

/* ══ 1. PRELOADER + HERO INIT ════════════════════════════════
   window 'load' срабатывает когда все ресурсы (включая картинки)
   загружены. Без setTimeout — никаких искусственных задержек.     */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) pre.classList.add('gone');

  /* Ken-Burns на фоне hero */
  const heroImg = document.getElementById('hero-img');
  if (heroImg) heroImg.classList.add('zoomed');

  /* Реакции детей — появляются каскадом по data-delay */
  document.querySelectorAll('.reaction-card').forEach(card => {
    setTimeout(
      () => card.classList.add('visible'),
      parseInt(card.dataset.delay || 0, 10)
    );
  });

  /* Запустить счётчики */
  runCounters();
});

/* ══ 2. СЧЁТЧИКИ ══════════════════════════════════════════════ */
function runCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start    = performance.now();

    const tick = (now) => {
      const p     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
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

  /* Закрыть по клику на ссылку/кнопку внутри nav */
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
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
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

    /* Закрыть все остальные */
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      }
    });

    /* Переключить текущий */
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
   IMask загружается с атрибутом defer, поэтому инициализируем
   маски только после DOMContentLoaded — когда скрипт точно
   уже выполнился и глобальный объект IMask доступен.
   Если IMask по каким-то причинам не загрузился — падаем на
   ручной fallback без ошибок в консоли.                        */
function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    if (typeof IMask !== 'undefined') {
      IMask(input, {
        mask: '+{7} (000) 000-00-00',
        lazy: true,
        placeholderChar: '_'
      });
    } else {
      /* Fallback: ручная маска без библиотеки */
      input.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.startsWith('8')) v = '7' + v.slice(1);
        if (v.length > 0 && !v.startsWith('7')) v = '7' + v;
        v = v.slice(0, 11);
        let r = '+7';
        if (v.length > 1)  r += ' (' + v.slice(1, 4);
        if (v.length >= 4) r += ') ' + v.slice(4, 7);
        if (v.length >= 7) r += '-'  + v.slice(7, 9);
        if (v.length >= 9) r += '-'  + v.slice(9, 11);
        e.target.value = r;
      });
    }
  });
}

/* DOMContentLoaded гарантирует что defer-скрипт IMask уже выполнен */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhoneMasks);
} else {
  initPhoneMasks();
}

/* ══ 11. ФОРМЫ — кнопки через addEventListener ═══════════════
   Было: onclick="submitForm('parents')" прямо в HTML.
   Стало: обработчики навешиваются здесь — разделение логики и разметки. */
document.getElementById('btn-parents')?.addEventListener('click', () => submitForm('parents'));
document.getElementById('btn-teachers')?.addEventListener('click', () => submitForm('teachers'));

/* ══ 12. FORMSPREE — ОТПРАВКА ════════════════════════════════ */
function submitForm(type) {
  const isParent = type === 'parents';

  const nameEl  = document.getElementById(isParent ? 'p-name'  : 't-name');
  const phoneEl = document.getElementById(isParent ? 'p-phone' : 't-phone');
  const extraEl = document.getElementById(isParent ? 'p-course': 't-dir');
  const childEl = isParent ? document.getElementById('p-child') : null;

  const name  = nameEl?.value.trim()  ?? '';
  const phone = phoneEl?.value.trim() ?? '';
  const extra = extraEl?.value        ?? '';

  /* ── Валидация ─────────────────────────────────────────────── */
  const formId = isParent ? 'form-parents' : 'form-teachers';
  if (!name || phone.replace(/\D/g, '').length < 11 || !extra) {
    const wrap = document.getElementById(formId);
    if (wrap) {
      wrap.style.animation = 'none';
      /* Reflow — нужен чтобы анимация перезапустилась */
      void wrap.offsetHeight;
      wrap.style.animation = 'shake .4s ease';
      wrap.addEventListener('animationend', () => {
        wrap.style.animation = '';
      }, { once: true });
    }
    return;
  }

  /* ── Отправка в Formspree ──────────────────────────────────── */
  const FORMSPREE_ID = 'xwvngwwa';

  const subject = isParent
    ? `Новая заявка от родителя — ${extra}`
    : `Новый педагог — ${extra}`;

  const payload = isParent
    ? { _subject: subject, Тип: 'Родитель', Имя: name, Телефон: phone, Ребёнок: childEl?.value.trim() ?? '', Курс: extra }
    : { _subject: subject, Тип: 'Педагог',  Имя: name, Телефон: phone, Направление: extra };

  fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload)
  }).catch(() => {});
  /* Ошибки сети не блокируют модальное окно — UX важнее */

  /* ── Открыть модалку ──────────────────────────────────────── */
  const modalText = document.getElementById('modal-text');
  if (modalText) {
    modalText.textContent = isParent
      ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время!'
      : 'Кристина рассмотрит вашу заявку и свяжется в ближайшее время!';
  }
  openModal();

  /* ── Очистить поля формы ──────────────────────────────────── */
  document.getElementById(formId)
    ?.querySelectorAll('input, select')
    .forEach(el => { el.value = ''; el.classList.remove('has-val'); });
}

/* ══ 13. МОДАЛЬНОЕ ОКНО ══════════════════════════════════════
   Было: closeModal() вызывался через inline onclick.
   Стало: обработчики навешены здесь.                          */
function openModal() {
  document.getElementById('modal')?.classList.add('open');
  document.getElementById('modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  document.getElementById('modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-ok')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
