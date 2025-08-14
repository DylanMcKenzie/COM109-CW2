// Component loaders

function loadInto(selector, url) {
  return fetch(url)
    .then(r => r.text())
    .then(html => {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = html;
    });
}

function appendToBody(url) {
  return fetch(url)
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    });
}

Promise.all([
  loadInto('#navbar',  'components/navbar/navbar.html'),
  loadInto('#footer',  'components/footer/footer.html'),
  loadInto('#home-page', 'pages/home.html').then(() => {
    initSlider();
    initStepsReveal();
    initLostPetsReveal();
  }),
  appendToBody('components/modals/donate.html').then(() => {
    initDonateModal();
  }),
]).catch(err => console.error('❌ Component load error:', err));


// Hero Slider

function initSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slider__image');
  const dotsContainer = slider.querySelector('.hero-slider__dots');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let intervalId;

  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'hero-slider__dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      goTo(i);
      restart();
    });
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.hero-slider__dot');

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function restart() {
    clearInterval(intervalId);
    intervalId = setInterval(next, 5000);
  }

  intervalId = setInterval(next, 5000);

  window.addEventListener('beforeunload', () => clearInterval(intervalId));
}


// Adoption Steps

function initStepsReveal() {
  const items = document.querySelectorAll('.step-box, .polaroid'); 
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries
      .filter(e => e.isIntersecting)
      .forEach(entry => {
        setTimeout(() => entry.target.classList.add('show'), delay);
        delay += 250;
        observer.unobserve(entry.target);
      });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  items.forEach(el => observer.observe(el));
}


// Donate modal

function initDonateModal() {
  const $form = $('#donor-details-form');
  if (!$form.length) return;

  // Sort code mask: 112233 -> 11-22-33
  const $sort = $form.find('#sortCode');
  const formatSort = (raw) => {
    const digits = String(raw || '').replace(/\D/g, '').slice(0, 6);
    return digits.replace(/(\d{2})(?=\d)/g, '$1-');
  };
  $sort.on('input blur', function () { this.value = formatSort(this.value); })
       .on('paste', function () { setTimeout(() => { this.value = formatSort(this.value); }, 0); });

  // Account number: digits only, max 8
  const $acc = $form.find('#accNumber');
  $acc.on('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 8);
  });

  // Names: letters/spaces/hyphen/apostrophe
  const nameFilter = function () { this.value = this.value.replace(/[^A-Za-z\s'-]/g, ''); };
  const $accName = $form.find('[name="accName"]').on('input', nameFilter);
  const $first   = $form.find('[name="firstName"]').on('input', nameFilter);
  const $last    = $form.find('[name="lastName"]').on('input', nameFilter);

  // Phone : digits only, max 11 while typing
  const $phone = $form.find('[name="phone"]');
  $phone.on('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 11);
  });

  // Donation Amount: digits + one dot, up to 2 decimals
  const $amount = $form.find('#donationAmount');
  $amount.on('input', function () {
    let v = String(this.value || '').replace(/[^\d.]/g, '');
    v = v.replace(/(\..*)\./g, '$1'); // keep only first dot
    if (v.includes('.')) {
      const [int, dec = ''] = v.split('.');
      v = int.replace(/^0+(?=\d)/, '') + '.' + dec.slice(0, 2);
    } else {
      v = v.replace(/^0+(?=\d)/, '');
    }
    this.value = v;
  });

  // Submit
  $form.on('submit', function (e) {
    e.preventDefault();

    const showMsg = ($el, msg) => {
      const el = $el[0];
      el.setCustomValidity(msg);
      el.reportValidity();
      el.setCustomValidity('');
    };

    // Names
    const nameRe = /^[A-Za-z\s'-]+$/;
    const firstVal = ($first.val() || '').trim();
    if (!nameRe.test(firstVal)) return showMsg($first, 'First name can only contain letters, spaces, hyphens, or apostrophes');
    const lastVal = ($last.val() || '').trim();
    if (!nameRe.test(lastVal))  return showMsg($last,  'Last name can only contain letters, spaces, hyphens, or apostrophes');

    // Email 
    const emailEl = $form.find('[name="email"]')[0];
    if (!emailEl.checkValidity()) {
      emailEl.setCustomValidity('Please enter a valid email address');
      emailEl.reportValidity();
      emailEl.setCustomValidity('');
      return;
    }

    // Phone
    const phoneVal = ($phone.val() || '').trim();
    if (phoneVal && !/^07\d{9}$/.test(phoneVal)) {
      return showMsg($phone, 'Phone must start with 07 and be 11 digits long (e.g., 07XXXXXXXXX)');
    }

    // Account holder
    const accNameVal = ($accName.val() || '').trim();
    if (!nameRe.test(accNameVal)) {
      return showMsg($accName, 'Account holder name can only contain letters, spaces, hyphens, or apostrophes');
    }

    // Account number
    const accVal = ($acc.val() || '').trim();
    if (!/^\d{8}$/.test(accVal)) {
      return showMsg($acc, 'Please enter exactly 8 digits for the account number');
    }

    // Sort code
    const sortVal = ($sort.val() || '').trim();
    if (!/^\d{2}-\d{2}-\d{2}$/.test(sortVal)) {
      return showMsg($sort, 'Please enter a sort code in the format 00-00-00');
    }

    // Donation Amount
    const rawAmt = String($amount.val() || '').trim();

    // 6 digits and decimals to 2
    let cleaned = rawAmt.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    if (cleaned.includes('.')) {
      const [intPart, decPart = ''] = cleaned.split('.');
      cleaned = intPart.slice(0, 6) + '.' + decPart.slice(0, 2);
    } else {
      cleaned = cleaned.slice(0, 6);
    }

    let amtNum = parseFloat(cleaned);

    // invalid/zero/negative validation
    if (!cleaned || isNaN(amtNum) || amtNum <= 0) {
      return showMsg($amount, 'Please enter a valid amount (e.g., 5 or 12.50)');
    }

    // max £999,999.99 and fix to 2dp
    if (amtNum > 999999) amtNum = 999999;
    const amountStr = amtNum.toFixed(2);

    const formEl = $form[0];
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    // Success
    const donateEl = document.getElementById('donateModal');
    const donateModal = bootstrap.Modal.getInstance(donateEl) || new bootstrap.Modal(donateEl);
    donateModal.hide();

    donateEl.addEventListener('hidden.bs.modal', function onHidden() {
      donateEl.removeEventListener('hidden.bs.modal', onHidden);

      const firstName = (firstVal || 'Friend').trim(); 

      const tyEl = document.getElementById('thankYouModal');
      const nameSpan   = tyEl.querySelector('#tyName');
      const amountSpan = tyEl.querySelector('#tyAmount');

      if (nameSpan) {
        nameSpan.textContent = firstName;
      }
      if (amountSpan) {
        amountSpan.textContent = amountStr;
      }

      const tyModal = new bootstrap.Modal(tyEl, { backdrop: 'static' });
      tyModal.show();

      tyEl.addEventListener('shown.bs.modal', function once() {
        tyEl.removeEventListener('shown.bs.modal', once);
        fireConfetti(1200);
      }, { once: true });
    }, { once: true });

    formEl.reset();
  });
}


// Confetti

function fireConfetti(duration = 1000) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2000';
  document.body.appendChild(canvas);

  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.width  = Math.floor(window.innerWidth  * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const particles = Array.from({ length: 160 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: -20,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2.5,
    r: Math.random() * 5 + 2,
    a: Math.random() * 2 * Math.PI,
    spin: (Math.random() - 0.5) * 0.2
  }));
  const colors = ['#ff70c0', '#cba6ea', '#ffe5fd', '#3f2171', '#ffcfef'];

  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = colors[(Math.abs((p.x + p.y) | 0)) % colors.length];
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });

    if (elapsed < duration) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
