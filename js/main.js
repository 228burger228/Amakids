/* ============================================================
   AMAKIDS — MAIN JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── BURGER MENU ──
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close nav on link click
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  // ── HEADER SCROLL SHADOW ──
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


  // ── SELECT FLOATING LABEL FIX ──
  document.querySelectorAll('.form__select').forEach(sel => {
    sel.addEventListener('change', () => {
      if (sel.value) {
        sel.classList.add('has-value');
      } else {
        sel.classList.remove('has-value');
      }
    });
  });


  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll(
    '.course-card, .why__item, .review-card, .contact-item, .stat, .jobs__benefit'
  );

  reveals.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));


  // ── STAGGER reveal for grids ──
  document.querySelectorAll('.courses__grid, .why__grid, .reviews__grid, .contacts__grid').forEach(grid => {
    const items = grid.querySelectorAll('.reveal');
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.08}s`;
    });
  });


  // ── SMOOTH ANCHOR SCROLL ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── PHONE INPUT MASK ──
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (val.startsWith('7')) {
        val = val.slice(0, 11);
        const parts = [
          '+7',
          val.length > 1 ? ` (${val.slice(1, 4)}` : '',
          val.length > 4 ? `) ${val.slice(4, 7)}` : '',
          val.length > 7 ? `-${val.slice(7, 9)}` : '',
          val.length > 9 ? `-${val.slice(9, 11)}` : '',
        ];
        e.target.value = parts.join('');
      }
    });
  });

});


// ── FORM SUBMIT ──
function submitForm(type) {
  const isParent = type === 'parent';

  const nameId   = isParent ? 'p-name' : 't-name';
  const phoneId  = isParent ? 'p-phone' : 't-phone';
  const extraId  = isParent ? 'p-course' : 't-direction';
  const childId  = isParent ? 'p-child' : null;

  const name  = document.getElementById(nameId).value.trim();
  const phone = document.getElementById(phoneId).value.trim();
  const extra = document.getElementById(extraId).value;

  if (!name || !phone || !extra) {
    shakeForm(isParent ? 'form-parent' : 'form-teacher');
    return;
  }

  // Here you would send to your backend / Telegram bot / email
  console.log('Form submitted:', { type, name, phone, extra });

  // Show success modal
  const msg = isParent
    ? 'Мы свяжемся с вами в течение 15 минут и подберём удобное время для пробного урока!'
    : 'Кристина рассмотрит вашу заявку и свяжется с вами в ближайшее время!';

  document.getElementById('modal-text').textContent = msg;
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Clear form
  const formWrap = document.getElementById(isParent ? 'form-parent' : 'form-teacher');
  formWrap.querySelectorAll('input, select').forEach(el => {
    el.value = '';
    el.classList.remove('has-value');
  });
}

function shakeForm(id) {
  const form = document.getElementById(id);
  form.style.animation = 'shake 0.4s ease';
  form.addEventListener('animationend', () => { form.style.animation = ''; }, { once: true });
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%  { transform: translateX(-6px); }
    40%  { transform: translateX(6px); }
    60%  { transform: translateX(-4px); }
    80%  { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);
