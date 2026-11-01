/* kocert mockup — progressive enhancement. No dependencies. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- header: compact on scroll ---------- */
  const header = $('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile drawer ---------- */
  const menuBtn = $('.header__menu'), nav = $('.nav');
  if (menuBtn && nav) {
    const drawer = document.createElement('div');
    drawer.className = 'drawer'; drawer.hidden = true;
    const flat = $$(':scope > a, :scope > .nav__item', nav).map(el => el.matches('a') ? el.outerHTML : `${$(':scope > a', el).outerHTML}<div class="drawer__sub">${$('.nav__sub', el).innerHTML}</div>`).join('');
    drawer.innerHTML = `<nav class="drawer__nav" aria-label="모바일 메뉴">${flat}</nav>
      <div class="drawer__foot"><a class="btn btn--ink" href="contact.html">견적문의</a><a class="drawer__tel" href="tel:0260120821">02-6012-0821</a></div>`;
    header.after(drawer);
    const set = open => { drawer.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); menuBtn.classList.toggle('is-open', open); document.body.classList.toggle('is-locked', open); };
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', () => set(drawer.hidden));
    drawer.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) set(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  /* ---------- filters (cases / guides): pills filter cards by tag text ---------- */
  $$('.pills[role="tablist"]').forEach(pills => {
    if (pills.closest('.form-tabs')) return;
    const scope = pills.closest('section') || document;
    const cards = $$('.case, .guide', scope);
    if (!cards.length) return;
    const count = $('.list-count', scope);
    pills.addEventListener('click', e => {
      const pill = e.target.closest('.pill'); if (!pill) return;
      $$('.pill', pills).forEach(p => p.setAttribute('aria-selected', 'false')); pill.setAttribute('aria-selected', 'true');
      const key = pill.textContent.trim(); let shown = 0;
      cards.forEach(card => {
        const cat = ($('.tag--brand', card) || $('.tag', card)); const tag = cat ? cat.textContent.trim() : '';
        const hit = key === '전체' || tag === key;
        card.classList.toggle('is-hidden', !hit); if (hit) shown++;
      });
      if (count) count.textContent = key === '전체' ? count.dataset.all || count.textContent : `${shown}건 · ${key}`;
      if (count && !count.dataset.all) count.dataset.all = count.textContent;
    });
    if (count) count.dataset.all = count.textContent;
  });

  /* ---------- contact form tabs: 견적문의 / 불만접수 (폼 2종 전환) ---------- */
  const formTabs = $('.form-tabs .pills');
  if (formTabs) {
    const forms = { '견적문의': $('#form-quote'), '불만접수': $('#form-complaint') };
    const apply = key => { $$('.pill[role="tab"]', formTabs).forEach(p => p.setAttribute('aria-selected', String(p.textContent.trim() === key))); Object.entries(forms).forEach(([k, f]) => { if (f) f.hidden = k !== key; }); const leadQ = $('.page-hero .lead:not(#hero-lead-complaint)'), leadC = $('#hero-lead-complaint'); if (leadQ && leadC) { leadQ.hidden = key === '불만접수'; leadC.hidden = key !== '불만접수'; } };
    formTabs.addEventListener('click', e => { const p = e.target.closest('.pill[role="tab"]'); if (p) apply(p.textContent.trim()); });
    if (new URLSearchParams(location.search).get('type') === 'complaint') apply('불만접수');
  }

  /* ---------- scroll reveal ---------- */
  const revealTargets = $$('.section-head, .stat, .service, .case, .guide, .step, .use, .related, .policy, .bento > .card, .quick, .visual, .stats__table, .compare, .doclist, .faq--wide, .consultant > *, .cert, .map > *, .form-card, .form-aside > *, .cta__form, .band__inner > *');
  if (!reduced && 'IntersectionObserver' in window) {
    revealTargets.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); });
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(el => io.observe(el));
  }

  /* ---------- count-up numbers ---------- */
  const nums = $$('.stat .num, .bento .num').filter(n => /^[\d,]+/.test(n.textContent.trim()));
  if (nums.length && !reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      const el = en.target, small = el.querySelector('small'); const suffix = small ? small.outerHTML : '';
      const raw = el.textContent.replace(small ? small.textContent : '', '').trim(); const m = raw.match(/^([\d,]+)(.*)$/); if (!m) return;
      const target = parseInt(m[1].replace(/,/g, ''), 10), tail = m[2]; const t0 = performance.now(), dur = 1100;
      const tick = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 3))); el.innerHTML = v.toLocaleString('ko-KR') + tail + suffix; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
  }

  /* ---------- process steps: highlight active while scrolling ---------- */
  const steps = $$('.steps .step');
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle('is-active', en.isIntersecting)), { rootMargin: '-40% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  /* ---------- subnav scrollspy (service pages) ---------- */
  const subnav = $('.subnav');
  if (subnav) {
    const links = $$('a[href^="#"]', subnav); const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    let raf = 0, current = null;
    const update = () => {
      raf = 0; const line = window.innerHeight * 0.35; let best = null;
      secs.forEach(sec => { if (sec.getBoundingClientRect().top <= line) best = sec; });
      if (best === current) return; current = best;
      links.forEach(a => a.removeAttribute('aria-current'));
      if (best) { const a = links[secs.indexOf(best)]; a.setAttribute('aria-current', 'true'); const inner = a.parentElement; inner.scrollTo({ left: a.offsetLeft - inner.clientWidth / 2 + a.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' }); }
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true }); update();
  }

  /* ---------- band spotlight + hero parallax (pointer only) ---------- */
  if (finePointer && !reduced) {
    $$('.band').forEach(band => band.addEventListener('pointermove', e => { const r = band.getBoundingClientRect(); band.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`); band.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`); band.classList.add('has-spot'); }));
    const visual = $('.visual');
    if (visual) {
      const media = $('.visual__slides', visual) || visual, note = $('.visual__note', visual); let raf = 0, tx = 0, ty = 0;
      visual.addEventListener('pointermove', e => { const r = visual.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5); ty = ((e.clientY - r.top) / r.height - .5); if (!raf) raf = requestAnimationFrame(() => { raf = 0; media.style.transform = `scale(1.04) translate(${(-tx * 12).toFixed(1)}px, ${(-ty * 8).toFixed(1)}px)`; if (note) note.style.transform = `translate(${(tx * 6).toFixed(1)}px, ${(ty * 4).toFixed(1)}px)`; }); });
      visual.addEventListener('pointerleave', () => { media.style.transform = ''; if (note) note.style.transform = ''; });
    }
  }

  /* ---------- scrollbar width for full-bleed sections ---------- */
  const setScrollbarWidth = () => document.documentElement.style.setProperty('--sbw', `${window.innerWidth - document.documentElement.clientWidth}px`);
  setScrollbarWidth(); window.addEventListener('resize', setScrollbarWidth);

  /* ---------- slideshows: hero (5s) and certification cards (8s, staggered) ---------- */
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startSlideshow = (slides, intervalMs, delayMs = 0) => {
    if (slides.length < 2 || reducedMotion) return;
    let cur = slides.findIndex(s => s.classList.contains('is-active'));
    if (cur < 0) cur = 0;
    const step = () => {
      if (document.hidden) return;
      slides[cur].classList.remove('is-active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('is-active');
    };
    setTimeout(() => setInterval(step, intervalMs), delayMs);
  };
  startSlideshow($$('.visual__slide'), 5000);
  $$('.service__slides').forEach((box, i) => startSlideshow($$('.service__media', box), 8000, i * 2600));

  /* ---------- lazy videos: attach sources only when they will play and are near the viewport ---------- */
  const lazyVideos = $$('video[data-src]');
  if (lazyVideos.length && !reduced && window.matchMedia('(min-width: 601px)').matches) {
    const attach = video => { if (video.dataset.loaded) return; video.dataset.loaded = '1'; ['webm', 'mp4'].forEach(ext => { const s = document.createElement('source'); s.src = `${video.dataset.src}.${ext}`; s.type = `video/${ext}`; video.appendChild(s); }); video.load(); video.play().catch(() => {}); };
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { attach(en.target); io.unobserve(en.target); } }), { rootMargin: '300px 0px' }); lazyVideos.forEach(v => io.observe(v)); }
    else lazyVideos.forEach(attach);
  }

  /* ---------- ambient canvas: drifting grid, blobs, dust with scroll parallax ---------- */
  const amb = $('.ambient');
  if (amb && !reduced) {
    const cx = amb.getContext('2d'); let w = 0, h = 0, raf = 0, last = 0, hidden = document.hidden;
    const dust = Array.from({ length: 36 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.2, s: 0.004 + Math.random() * 0.01, p: Math.random() * 6.28 }));
    const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
    const resize = () => { w = amb.width = window.innerWidth; h = amb.height = window.innerHeight; };
    const draw = now => {
      raf = 0; if (hidden) return;
      if (now - last < 33) { raf = requestAnimationFrame(draw); return; } last = now;
      const t = now / 1000, sy = window.scrollY;
      cx.clearRect(0, 0, w, h);
      // blobs
      const b1 = cx.createRadialGradient(w * (0.15 + 0.04 * Math.sin(t * 0.11)), h * 0.2 - sy * 0.05, 0, w * 0.15, h * 0.2 - sy * 0.05, h * 0.9); b1.addColorStop(0, rgba(13, 72, 133, 0.10)); b1.addColorStop(1, rgba(13, 72, 133, 0)); cx.fillStyle = b1; cx.fillRect(0, 0, w, h);
      const b2 = cx.createRadialGradient(w * (0.85 + 0.04 * Math.cos(t * 0.09)), h * 0.8 - sy * 0.03, 0, w * 0.85, h * 0.8 - sy * 0.03, h * 0.8); b2.addColorStop(0, rgba(223, 233, 246, 0.9)); b2.addColorStop(1, rgba(223, 233, 246, 0)); cx.fillStyle = b2; cx.fillRect(0, 0, w, h);
      // drifting grid (parallax with scroll)
      const step = Math.max(64, w / 24), ox = (t * 6) % step, oy = (-sy * 0.15 + t * 4) % step;
      cx.strokeStyle = rgba(13, 72, 133, 0.06); cx.lineWidth = 1; cx.beginPath();
      for (let gx = -step + ox; gx < w + step; gx += step) { cx.moveTo(gx, 0); cx.lineTo(gx, h); }
      for (let gy = -step + oy; gy < h + step; gy += step) { cx.moveTo(0, gy); cx.lineTo(w, gy); }
      cx.stroke();
      // dust
      dust.forEach(d => { const y = ((d.y - t * d.s - sy / (h * 6)) % 1 + 1) % 1, xx = d.x * w + Math.sin(t * 0.5 + d.p) * 12; cx.beginPath(); cx.arc(xx, y * h, d.r, 0, 6.283); cx.fillStyle = rgba(13, 72, 133, 0.10 + 0.12 * Math.sin(t + d.p) ** 2); cx.fill(); });
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (!hidden && !raf) raf = requestAnimationFrame(draw); });
    raf = requestAnimationFrame(draw);
  }

  /* ---------- mark current nav item ---------- */
  /* 고객지원은 contact.html?type=quote, 상담문의(단독)는 contact.html 로 구분한다. 단독 링크가 현재면 상위 메뉴는 표시하지 않는다 */
  const here = (location.pathname.split('/').pop() || 'index.html') + location.search;
  const isHere = a => a.getAttribute('href').split('#')[0] === here;
  $$('.nav, .drawer__nav').forEach(nav => {
    const solo = $$(':scope > a', nav).filter(a => !a.hasAttribute('aria-haspopup'));
    solo.forEach(a => isHere(a) ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    const soloHit = solo.some(isHere);
    $$('.nav__sub a, .drawer__sub a', nav).filter(isHere).forEach(a => {
      a.setAttribute('aria-current', 'page');
      const top = a.closest('.nav__item') ? $(':scope > a', a.closest('.nav__item')) : a.closest('.drawer__sub').previousElementSibling;
      if (soloHit) top.removeAttribute('aria-current'); else top.setAttribute('aria-current', 'page');
    });
  });
  /* hover/focus dropdowns */
  $$('.nav__item').forEach(it => { const trigger = $(':scope > a', it); it.addEventListener('focusin', () => it.classList.add('is-open')); it.addEventListener('focusout', e => { if (!it.contains(e.relatedTarget)) it.classList.remove('is-open'); }); trigger.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); const f = $('.nav__sub a', it); if (f) f.focus(); } }); it.addEventListener('keydown', e => { if (e.key === 'Escape') { it.classList.remove('is-open'); trigger.focus(); } }); });
})();
