/* ============================================================
   AMAKIDS МАРЬИНО — main.js
   ============================================================ */

/* ── 1. PRELOADER ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    // Скрыть preloader
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('gone');

    // Ken-Burns эффект на фоне hero
    const heroImg = document.getElementById('hero-img');
    if (heroImg) heroImg.classList.add('zoomed');

    // Реакции детей — появляются по очереди
    document.querySelectorAll('.reaction-card').forEach(card => {
      const delay = parseInt(card.dataset.delay || 0);
      setTimeout(() => card.classList.add('visible'), delay);
    });

    // Счётчики в статистике
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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ── 3. HEADER — scrolled-класс ──────────────────────────── */
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
  // Закрыть по клику на ссылку
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

// Добавляем класс reveal на карточки
document.querySelectorAll(
  '.course-card, .why-item, .review-card, .contact-card'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 0.09 + 's';
  revealObserver.observe(el);
});

/* ── 7. FORM TABS ─────────────────────────────────────────── */
document.querySelectorAll('.form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Снять active у всех табов
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    // Скрыть все тела формы
    document.querySelectorAll('.form-body').forEach(b => b.classList.add('hidden'));
    // Активировать нажатый
    tab.classList.add('active');
    const formId = 'form-' + tab.dataset.tab;
    const formBody = document.getElementById(formId);
    if (formBody) formBody.classList.remove('hidden');
  });
});

/* ── 8. SELECT — floating label ──────────────────────────── */
document.querySelectorAll('.form-select').forEach(sel => {
  sel.addEventListener('change', () => {
    sel.classList.toggle('has-val', !!sel.value);
  });
});

/* ── 9. МАСКА ТЕЛЕФОНА ────────────────────────────────────── */
document.querySelectorAll('.phone-input').forEach(input => {
  input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7') && v.length > 0) v = '7' + v;
    v = v.slice(0, 11);
    let result = '+7';
    if (v.length > 1) result += ' (' + v.slice(1, 4);
    if (v.length >= 4) result += ') ' + v.slice(4, 7);
    if (v.length >= 7) result += '-' + v.slice(7, 9);
    if (v.length >= 9) result += '-' + v.slice(9, 11);
    e.target.value = result;
  });
});

/* ── 10. ОТПРАВКА ФОРМЫ ───────────────────────────────────── */
function submitForm(type) {
  const isParent = type === 'parents';

  const name  = document.getElementById(isParent ? 'p-name'  : 't-name')?.value.trim();
  const phone = document.getElementById(isParent ? 'p-phone' : 't-phone')?.value.trim();
  const extra = document.getElementById(isParent ? 'p-course' : 't-dir')?.value;

  // Валидация
  if (!name || !phone || !extra) {
    const formWrap = document.getElementById(isParent ? 'form-parents' : 'form-teachers');
    if (formWrap) {
      formWrap.style.animation = 'shake .4s ease';
      formWrap.addEventListener('animationend', () => {
        formWrap.style.animation = '';
      }, { once: true });
    }
    return;
  }

  // ─── Здесь подключи Telegram-бот ───────────────────────────
  // const BOT_TOKEN = 'ВАШ_ТОКЕН';
  // const CHAT_ID   = 'ВАШ_CHAT_ID';
  // const message   = isParent
  //   ? `📩 Новая заявка от родителя!\nИмя: ${name}\nТел: ${phone}\nКурс: ${extra}`
  //   : `👩‍🏫 Новый педагог!\nИмя: ${name}\nТел: ${phone}\nНаправление: ${extra}`;
  // fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  // });
  // ───────────────────────────────────────────────────────────

  // Показать модальное окно
  const modalText = document.getElementById('modal-text');
  if (modalText) {
    modalText.textContent = isParent
      ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время!'
      : 'Кристина рассмотрит вашу заявку и свяжется с вами в ближайшее время!';
  }
  document.getElementById('modal')?.classList.add('open');
  document.getElementById('modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Очистить поля формы
  const formEl = document.getElementById(isParent ? 'form-parents' : 'form-teachers');
  if (formEl) {
    formEl.querySelectorAll('input, select').forEach(el => {
      el.value = '';
      el.classList.remove('has-val');
    });
  }
}

/* ── 11. ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ────────────────────────── */
function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  document.getElementById('modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Закрыть по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
