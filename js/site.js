// the room. small, no dependencies.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('room.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('room.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // lamp
  const html = document.documentElement;
  if (store.get('lamp', false)) html.classList.add('lamp');
  const lampBtn = $('.lampb');
  const paintLamp = () => {
    if (!lampBtn) return;
    const on = html.classList.contains('lamp');
    lampBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    $('.lt', lampBtn).textContent = on ? 'lamp on' : 'lamp off';
    $('path', lampBtn).setAttribute('fill', on ? '#F2B632' : 'none');
  };
  paintLamp();
  lampBtn && lampBtn.addEventListener('click', () => { html.classList.toggle('lamp'); store.set('lamp', html.classList.contains('lamp')); paintLamp(); });

  // menu on phones
  const menu = $('.menu');
  menu && menu.addEventListener('click', () => { const n = $('.top nav'); const o = n.classList.toggle('open'); menu.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  // clock
  const clock = $('.clock');
  const tickClock = () => { if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' IST'; };
  tickClock(); setInterval(tickClock, 30000);

  // stamps
  const stamps = new Set(store.get('stamps', []));
  const here = document.body.dataset.case;
  if (here) { stamps.add(here); store.set('stamps', Array.from(stamps)); }
  $$('.stampc b').forEach((b) => { b.textContent = stamps.size; });
  $$('[data-stamp]').forEach((el) => {
    if (stamps.has(el.dataset.stamp)) { el.classList.add('got'); el.textContent = 'seen ' + el.dataset.n; }
  });

  // reveal on scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); countUp(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  $$('[data-r],[data-wipe],[data-side],.chart,.in-on').forEach((el) => { if (io && !reduce) io.observe(el); else { el.classList.add('in'); countUp(el); } });

  function countUp(root) {
    $$('[data-count]', root).concat(root.matches && root.matches('[data-count]') ? [root] : []).forEach((el) => {
      if (el.dataset.done) return; el.dataset.done = '1';
      const to = Number(el.dataset.count); if (reduce) { el.textContent = to.toLocaleString('en-IN'); return; }
      const t0 = performance.now(); const dur = 1400;
      const step = (t) => { const p = Math.min(1, (t - t0) / dur); const v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  // the wall: scale to fit, drift with the cursor
  const box = $('.wallbox'); const wall = $('.wall');
  if (box && wall) {
    const fit = () => wall.style.setProperty('--s', (box.clientWidth / 1344).toFixed(4));
    fit(); window.addEventListener('resize', fit);
    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      box.addEventListener('mousemove', (e) => { const r = box.getBoundingClientRect(); wall.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3)); wall.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3)); });
      box.addEventListener('mouseleave', () => { wall.style.setProperty('--mx', '0'); wall.style.setProperty('--my', '0'); });
    }
  }

  // before and after
  const range = $('#ba'); const ba = $('.ba');
  range && range.addEventListener('input', () => ba.style.setProperty('--cut', range.value + '%'));

  // the drawer of lines
  const qbox = $('.drawer');
  if (qbox) {
    const Q = JSON.parse($('#quotes').textContent); let qi = Math.floor(Math.random() * Q.length);
    const show = () => { const q = $('.q', qbox); const nq = q.cloneNode(false); nq.textContent = Q[qi][0]; q.replaceWith(nq); $('.qsrc', qbox).textContent = Q[qi][1]; $('.qn', qbox).textContent = (qi + 1) + ' of ' + Q.length; };
    show();
    $('.go', qbox).addEventListener('click', () => { qi = (qi + 1 + Math.floor(Math.random() * 3)) % Q.length; show(); });
  }

  // desk drawers
  $$('.chips').forEach((chips) => {
    const list = $('#' + chips.dataset.list); const empty = $('#' + chips.dataset.empty);
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', chips).forEach((c) => c.setAttribute('aria-selected', c === b ? 'true' : 'false'));
      const k = b.dataset.k; let n = 0;
      $$('li', list).forEach((li, i) => { const show = k === 'all' || li.dataset.d.split(' ').includes(k); li.hidden = !show; if (show) { n++; li.style.animation = 'none'; void li.offsetWidth; li.style.animation = 'rise 500ms var(--ease) ' + (n * 40) + 'ms both'; } });
      if (empty) empty.hidden = n > 0;
    });
  });

  // the shelf
  const shelf = $('.shelf');
  if (shelf) {
    const B = JSON.parse($('#books').textContent); const info = $('.bookinfo');
    shelf.addEventListener('click', (e) => {
      const b = e.target.closest('.book'); if (!b) return;
      $$('.book', shelf).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      const d = B[Number(b.dataset.i)];
      $('.bs', info).textContent = d[1] + ' · ' + d[2]; $('.n', info).textContent = d[0]; $('.bw', info).textContent = d[3]; $('.bk', info).textContent = d[4];
    });
  }

  // say something: tabs, Google Forms, notes pinned on this screen
  const say = $('#say');
  if (say) {
    const G = JSON.parse($('#gforms').textContent);
    const cork = $('.cork');
    const pinNote = (t, who, r, mine) => {
      const d = document.createElement('div'); d.className = 'note'; d.style.setProperty('--r', r + 'deg');
      d.innerHTML = '<span class="pin" aria-hidden="true"></span><p></p><span class="k12"></span>';
      $('p', d).textContent = t; $('.k12', d).textContent = who + (mine ? ', only on your screen until i approve it' : '');
      cork.prepend(d); const e = $('.empty-cork', cork); if (e) e.remove();
    };
    store.get('mynotes', []).forEach((n) => pinNote(n[0], n[1], n[2], true));
    // notes you approved: edit notes.json in the repo, one {"line": "...", "who": "..."} per note
    fetch('/notes.json', { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '[]')).then((t) => JSON.parse(t.replace(/,\s*\]\s*$/, ']'))).then((list) => {
      (Array.isArray(list) ? list : []).slice().reverse().forEach((n, i) => { if (n && n.line) pinNote(n.line, n.who || 'no name', ((i * 37) % 7) - 3, false); });
    }).catch(() => {});
    $$('.tab', say).forEach((t) => t.addEventListener('click', () => {
      $$('.tab', say).forEach((x) => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
      $$('form.f', say).forEach((f) => { f.hidden = f.dataset.k !== t.dataset.k; });
    }));
    const kinds = { note: 'a note for the wall', work: 'work with me', suggest: 'a suggestion' };
    $$('form.f', say).forEach((f) => f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const k = f.dataset.k; const g = G[k]; const data = Object.fromEntries(new FormData(f).entries());
      const sent = $('.sent', f); const btn = $('button[type="submit"]', f);
      if (data._honey) { sent.textContent = f.dataset.done; f.reset(); return; }
      delete data._honey;
      btn.disabled = true; sent.textContent = 'sending…';
      // optional copy into a Google Form
      if (g && g.url) {
        const body = new URLSearchParams();
        Object.keys(g.map).forEach((key) => { if (data[key] && g.map[key] && g.map[key] !== 'entry.') body.append(g.map[key], data[key]); });
        fetch(g.url, { method: 'POST', mode: 'no-cors', body }).catch(() => {});
      }
      // the inbox
      let ok = !G.inbox;
      if (G.inbox) {
        try {
          const payload = Object.assign({ _subject: 'the room: ' + (kinds[k] || k) + (data.ticket ? ', ' + data.ticket : ''), _template: 'table', _captcha: 'false', form: kinds[k] || k, page: location.href }, data);
          if (data.email) payload._replyto = data.email;
          if (k !== 'work') payload.to_approve_paste_this_into_notes_json = JSON.stringify({ line: data.line || data.idea || '', who: data.who || 'no name' }) + ',';
          const r = await fetch(G.inbox, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
          const j = await r.json().catch(() => ({}));
          ok = r.ok && String(j.success) !== 'false';
        } catch (err) { ok = false; }
      }
      btn.disabled = false;
      if (!ok) { sent.innerHTML = 'that didn’t go through. write to <a href="mailto:' + G.inbox.split('/').pop() + '">' + G.inbox.split('/').pop() + '</a> instead.'; return; }
      const text = data.line || data.idea || '';
      if (text && k !== 'work') {
        const n = [text, data.who || 'no name', (Math.random() * 6 - 3).toFixed(1)];
        const all = store.get('mynotes', []); all.unshift(n); store.set('mynotes', all.slice(0, 6));
        pinNote(n[0], n[1], n[2], true);
      }
      sent.textContent = f.dataset.done; f.reset();
    }));
  }

  // the route: indices and eggs
  const idx = $('.idx');
  if (idx) {
    $$('.key').forEach((k) => k.addEventListener('click', () => {
      const on = k.getAttribute('aria-pressed') !== 'true';
      $$('.key').forEach((x) => x.setAttribute('aria-pressed', 'false')); $$('path.ln', idx).forEach((p) => p.classList.remove('on'));
      if (on) { k.setAttribute('aria-pressed', 'true'); $('path.ln[data-k="' + k.dataset.k + '"]', idx).classList.add('on'); idx.classList.add('pick'); } else idx.classList.remove('pick');
    }));
    const route = $('.routemap');
    const pick = (i) => {
      const cur = route.dataset.sel === String(i);
      route.dataset.sel = cur ? '' : String(i);
      route.classList.toggle('has-sel', !cur);
      const x = cur ? null : $$('.eggb')[i].style.left;
      $$('.selline', route).forEach((l) => { if (x) l.style.left = x; });
      $$('.eggb').forEach((b, j) => b.setAttribute('aria-pressed', !cur && j === i ? 'true' : 'false'));
      $$('.erow').forEach((b, j) => b.setAttribute('aria-pressed', !cur && j === i ? 'true' : 'false'));
    };
    $$('.eggb').forEach((b, i) => b.addEventListener('click', () => pick(i)));
    $$('.erow').forEach((b, i) => b.addEventListener('click', () => { pick(i); route.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }));
  }

  // simran.gpt questions copy themselves before the gpt opens
  $$('[data-q]').forEach((a) => a.addEventListener('click', () => { try { navigator.clipboard && navigator.clipboard.writeText(a.dataset.q); } catch (e) {} }));

  // tickets pre-fill the work form
  $$('[data-ticket]').forEach((a) => a.addEventListener('click', () => {
    const t = $$('#say .tab').find((x) => x.dataset.k === 'work'); if (t) t.click();
    const sel = $('#say form[data-k="work"] select[name="ticket"]'); if (sel) sel.value = a.dataset.ticket;
  }));

  // carousels
  $$('.carousel').forEach((c) => {
    const s = $('.slides', c); const step = () => s.clientWidth * 0.8;
    $('.prev', c).addEventListener('click', () => s.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    $('.next', c).addEventListener('click', () => s.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    s.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') s.scrollBy({ left: step() }); if (e.key === 'ArrowLeft') s.scrollBy({ left: -step() }); });
  });
})();
