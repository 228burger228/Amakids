/* ============================================================
   AMAKIDS — main.js
   ============================================================ */

/* ── 1. PRELOADER ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pre').classList.add('gone');

    // Ken-Burns на фоне
    document.getElementById('hbg-img')?.classList.add('z');

    // Реакции детей — появляются по очереди
    document.querySelectorAll('.rc').forEach(card => {
      const delay = parseInt(card.dataset.d || 0);
      setTimeout(() => card.classList.add('on'), delay);
    });

    // Счётчики цифр
    document.querySelectorAll('[data-cnt]').forEach(el => {
      const target   = parseInt(el.dataset.cnt);
      const duration = 1800;
      const start    = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);          // ease-out cubic
        el.textContent = Math.round(e * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  }, 1600);
});

/* ── 2. CUSTOM CURSOR ─────────────────────────────────────── */
const curDot  = document.getElementById('cur');
const curRing = document.getElementById('cur2');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (curDot) { curDot.style.left = mx + 'px'; curDot.style.top = my + 'px'; }
});

(function animRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  if (curRing) { curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px'; }
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (curDot)  curDot.style.transform  = 'translate(-50%,-50%) scale(2.5)';
    if (curRing) curRing.style.opacity   = '.12';
  });
  el.addEventListener('mouseleave', () => {
    if (curDot)  curDot.style.transform  = 'translate(-50%,-50%) scale(1)';
    if (curRing) curRing.style.opacity   = '.4';
  });
});

/* ── 3. HEADER ────────────────────────────────────────────── */
const hdr = document.getElementById('hdr');
const bur = document.getElementById('bur');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  hdr.classList.toggle('on', window.scrollY > 40);
}, { passive: true });

bur?.addEventListener('click', () => {
  bur.classList.toggle('on');
  nav.classList.toggle('on');
  document.body.style.overflow = nav.classList.contains('on') ? 'hidden' : '';
});

// Закрыть меню при клике на ссылку
document.querySelectorAll('.na, .nb').forEach(a => {
  a.addEventListener('click', () => {
    bur?.classList.remove('on');
    nav?.classList.remove('on');
    document.body.style.overflow = '';
  });
});

/* ── 4. SMOOTH SCROLL ─────────────────────────────────────── */
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

/* ── 5. SCROLL REVEAL ─────────────────────────────────────── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      revObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cc, .wi, .rv, .cb').forEach((el, i) => {
  el.classList.add('sr');
  el.style.transitionDelay = (i % 4) * 0.09 + 's';
  revObs.observe(el);
});

/* ── 6. FORM TABS ─────────────────────────────────────────── */
document.querySelectorAll('.ftab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.fb').forEach(b => b.classList.add('hid'));
    tab.classList.add('on');
    document.getElementById('tab-' + tab.dataset.tab)?.classList.remove('hid');
  });
});

/* ── 7. SELECT — floating label fix ──────────────────────── */
document.querySelectorAll('.fsel').forEach(sel => {
  sel.addEventListener('change', () => sel.classList.toggle('hv', !!sel.value));
});

/* ── 8. PHONE MASK ────────────────────────────────────────── */
document.querySelectorAll('.ftel').forEach(input => {
  input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) return;
    v = v.slice(0, 11);
    e.target.value = [
      '+7',
      v.length > 1 ? ` (${v.slice(1, 4)}`  : '',
      v.length > 4 ? `) ${v.slice(4, 7)}`  : '',
      v.length > 7 ? `-${v.slice(7, 9)}`   : '',
      v.length > 9 ? `-${v.slice(9, 11)}`  : '',
    ].join('');
  });
});

/* ── 9. FORM SUBMIT ───────────────────────────────────────── */
function formSub(type) {
  const isP  = type === 'p';
  const name  = document.getElementById(isP ? 'p-n'  : 't-n')?.value.trim();
  const phone = document.getElementById(isP ? 'p-p'  : 't-p')?.value.trim();
  const extra = document.getElementById(isP ? 'p-co' : 't-d')?.value;

  if (!name || !phone || !extra) {
    const wrap = document.getElementById(isP ? 'tab-par' : 'tab-tea');
    wrap.style.animation = 'shake .4s ease';
    wrap.addEventListener('animationend', () => { wrap.style.animation = ''; }, { once: true });
    return;
  }

  // ► Сюда можно подключить отправку в Telegram-бот:
  // const BOT  = 'ВАШ_ТОКЕН';
  // const CHAT = 'ВАШ_CHAT_ID';
  // const text = `Новая заявка!\nИмя: ${name}\nТел: ${phone}\nКурс: ${extra}`;
  // fetch(`https://api.telegram.org/bot${BOT}/sendMessage`,{
  //   method:'POST', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ chat_id: CHAT, text })
  // });

  const msg = isP
    ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время!'
    : 'Кристина рассмотрит вашу заявку и свяжется с вами в ближайшее время!';

  document.getElementById('mtx').textContent = msg;
  document.getElementById('modal').classList.add('on');
  document.getElementById('mover').classList.add('on');
  document.body.style.overflow = 'hidden';

  // Очистка полей
  document.getElementById(isP ? 'tab-par' : 'tab-tea')
    ?.querySelectorAll('input, select')
    .forEach(el => { el.value = ''; el.classList.remove('hv'); });
}

/* ── 10. MODAL CLOSE ──────────────────────────────────────── */
function closeModal() {
  document.getElementById('modal')?.classList.remove('on');
  document.getElementById('mover')?.classList.remove('on');
  document.body.style.overflow = '';
}

// Закрыть по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
