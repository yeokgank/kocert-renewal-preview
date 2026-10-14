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

  /* ---------- quick service tabs (home hero) ---------- */
  const ICON = {
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    chart: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15l3-3 2 2 5-5"/>',
    list: '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="17" r="3"/>',
    link: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="16" r="3"/><path d="M10.5 9.5l3 3M5 20l3-2M19 4l-3 2"/>',
    shield: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/>',
    data: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    grade: '<path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.3 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    bug: '<path d="M8 9V7a4 4 0 0 1 8 0v2M5 13h14M6 9h12v7a6 6 0 0 1-12 0z"/>',
    cart: '<path d="M3 4h2l2.5 11h11L21 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 19h16"/>',
  };
  const TABS = {
    '시험성적서': [['doc', '공인시험<br>성적서', 'test-accredited.html'], ['chart', '일반시험<br>성적서', 'test-general.html'], ['check', '기능적합성<br>시험', 'test-accredited.html#compare'], ['data', '데이터 품질<br>시험', 'test-accredited.html#compare'], ['list', '평가 항목<br>정의', 'test-accredited.html#process'], ['target', '발급<br>프로세스', 'test-accredited.html#process']],
    '인증': [['shield', 'GS인증', 'gs.html'], ['grade', 'KC인증', 'kc.html'], ['cloud', '클라우드<br>확인제', 'cloud.html'], ['target', '등급 · 유형<br>판별', 'gs.html#compare'], ['bug', '사전 결함<br>점검', 'gs.html#process'], ['cart', '조달 등록<br>지원', 'gs.html#uses']],
    '고객지원': [['chat', '견적문의', 'contact.html'], ['list', 'Q&amp;A', 'faq.html'], ['bug', '불만접수', 'contact.html?type=complaint'], ['map', '오시는 길', 'company.html#map'], ['check', '공평성<br>선언서', 'company.html#impartiality'], ['calendar', '전화<br>02-6012-0821', 'tel:0260120821']],
  };
  const quick = $('.quick');
  if (quick) {
    const tabs = $$('.quick__tab', quick), grid = $('.quick__grid', quick);
    const render = name => {
      grid.innerHTML = TABS[name].map(([ic, label, href]) => `<a class="quick__item" href="${href}"><span class="quick__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${ICON[ic]}</svg></span>${label}</a>`).join('');
      grid.classList.remove('is-swap'); void grid.offsetWidth; grid.classList.add('is-swap');
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { tabs.forEach(t => t.setAttribute('aria-selected', 'false')); tab.setAttribute('aria-selected', 'true'); render(tab.textContent.trim()); });
      tab.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click(); } });
    });
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
    const apply = key => { $$('.pill[role="tab"]', formTabs).forEach(p => p.setAttribute('aria-selected', String(p.textContent.trim() === key))); Object.entries(forms).forEach(([k, f]) => { if (f) f.hidden = k !== key; }); };
    formTabs.addEventListener('click', e => { const p = e.target.closest('.pill[role="tab"]'); if (p) apply(p.textContent.trim()); });
    if (new URLSearchParams(location.search).get('type') === 'complaint') apply('불만접수');
  }

  /* ---------- scroll reveal ---------- */
  const revealTargets = $$('.section-head, .stat, .service, .case, .guide, .step, .use, .related, .policy, .bento > .card, .quick, .visual, .marks__row, .stats__table, .compare, .doclist, .faq--wide, .consultant > *, .cert, .map > *, .form-card, .form-aside > *, .cta__form, .band__inner > *');
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
      const media = $('.visual__video', visual) || visual, note = $('.visual__note', visual); let raf = 0, tx = 0, ty = 0;
      visual.addEventListener('pointermove', e => { const r = visual.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5); ty = ((e.clientY - r.top) / r.height - .5); if (!raf) raf = requestAnimationFrame(() => { raf = 0; media.style.transform = `scale(1.04) translate(${(-tx * 12).toFixed(1)}px, ${(-ty * 8).toFixed(1)}px)`; if (note) note.style.transform = `translate(${(tx * 6).toFixed(1)}px, ${(ty * 4).toFixed(1)}px)`; }); });
      visual.addEventListener('pointerleave', () => { media.style.transform = ''; if (note) note.style.transform = ''; });
    }
  }

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
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__sub a, .drawer__sub a').forEach(a => { const h = a.getAttribute('href').split('#')[0].split('?')[0]; if (h && h === here) { a.setAttribute('aria-current', 'page'); const top = a.closest('.nav__item'); if (top) $(':scope > a', top).setAttribute('aria-current', 'page'); } });
  /* hover/focus dropdowns */
  $$('.nav__item').forEach(it => { const trigger = $(':scope > a', it); it.addEventListener('focusin', () => it.classList.add('is-open')); it.addEventListener('focusout', e => { if (!it.contains(e.relatedTarget)) it.classList.remove('is-open'); }); trigger.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); const f = $('.nav__sub a', it); if (f) f.focus(); } }); it.addEventListener('keydown', e => { if (e.key === 'Escape') { it.classList.remove('is-open'); trigger.focus(); } }); });
})();
