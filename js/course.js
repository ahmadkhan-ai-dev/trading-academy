/* =====================================================================
   course.js — Module 1 Course Engine
   ---------------------------------------------------------------------
   window.COURSE (array) se lessons render karta hai. Data files
   (course-data-1.js, course-data-2.js ...) sirf window.COURSE.push(...)
   karti hain. Is file ko data files se PEHLE load hona chahiye kyun ke
   woh CourseEngine.candles() helper use karti hain.

   PHASE format:
     { id, order, label, title, subtitle,
       lessons: [LESSON, ...],
       gate: null | { id, title, passPct, questions: [{ q, options:[], answer, explain }] } }

   LESSON format:
     { id, day, section, title, concepts:[], notes:[{ h, p }], keyPoints:[],
       visual: VISUAL | [VISUAL, ...]   (array = tabs),
       exercise: { title, steps:[], deliverable } }

   VISUAL format:
     { title, caption, decimals, height,
       candles: CourseEngine.candles(start, rows, defaultWick),
       annotations: [ ...see buildSvg() ],
       task: { prompt, answer:[candleIndex...], explain, hint } }

   Text mein **bold** likh sakte ho (safe markdown).
   Store keys: "course_progress" { lessonId: timestamp }
               "gates" { gateId: { passed, best, lastScore, attempts, passedAt } }
   Routes: #/course  ·  #/course/lesson/<id>  ·  #/course/gate/<gateId>
   ===================================================================== */
(function () {
  'use strict';

  window.COURSE = window.COURSE || [];

  /* ---------------- Shared helpers ---------------- */
  const COLORS = { bull: '#10b981', bear: '#ef4444', liq: '#f59e0b', muted: '#94a3b8', info: '#38bdf8', white: '#e2e8f0' };
  const col = (c) => COLORS[c] || c || COLORS.muted;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  // Safe mini-markdown: pehle escape, phir sirf **bold**
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  const R6 = (x) => Math.round(x * 1e6) / 1e6;  // floating point safai
  const n2 = (x) => Math.round(x * 100) / 100;  // SVG coordinates chhote rakho

  const BTN_SM = 'px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition';
  const CARD = 'bg-card border border-slate-800 rounded-2xl p-5 md:p-6';

  /* =================================================================
     1) CANDLE BUILDER — data files ke liye
     rows: [[close, upperWick, lowerWick], ...]; har candle pichli
     candle ke close par open hoti hai. Wick na do to defWick lagta hai.
     ================================================================= */
  function candles(start, rows, defWick) {
    const w = defWick == null ? 0.3 : defWick;
    let prev = start;
    return rows.map((r) => {
      const arr = Array.isArray(r) ? r : [r];
      const c = arr[0];
      const uw = arr[1] == null ? w : arr[1];
      const lw = arr[2] == null ? w : arr[2];
      const o = prev;
      prev = c;
      return { o: R6(o), c: R6(c), h: R6(Math.max(o, c) + uw), l: R6(Math.min(o, c) - lw) };
    });
  }

  /* =================================================================
     2) STATE — progress aur gates (Store)
     ================================================================= */
  function getProgress() {
    const p = Store.get('course_progress', {});
    return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
  }
  const isDone = (id) => !!getProgress()[id];
  function setDone(id, done) {
    const p = getProgress();
    if (done) p[id] = Date.now(); else delete p[id];
    Store.set('course_progress', p);
  }
  function getGates() {
    const g = Store.get('gates', {});
    return g && typeof g === 'object' && !Array.isArray(g) ? g : {};
  }
  const gatePassed = (gid) => !!(getGates()[gid] && getGates()[gid].passed);

  /* Phases order ke hisaab se */
  const phases = () => window.COURSE.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  /* Kaun sa pichla phase is phase ko LOCK kar raha hai? (null = khula) */
  function blockingPhase(phase) {
    for (const p of phases()) {
      if (p === phase) return null;
      if (p.gate && !gatePassed(p.gate.id)) return p;
    }
    return null;
  }
  const isLocked = (phase) => !!blockingPhase(phase);
  const phaseDoneCount = (p) => (p.lessons || []).filter((l) => isDone(l.id)).length;

  function findLesson(id) {
    for (const p of phases()) {
      const lesson = (p.lessons || []).find((l) => l.id === id);
      if (lesson) return { phase: p, lesson };
    }
    return null;
  }
  const findGatePhase = (gid) => phases().find((p) => p.gate && p.gate.id === gid) || null;

  /* Poore course ka seedha sequence: lessons + gates (prev/next ke liye) */
  function sequence() {
    const seq = [];
    phases().forEach((p) => {
      (p.lessons || []).forEach((l) => seq.push({ type: 'lesson', id: l.id, phase: p, label: l.day + ': ' + l.title }));
      if (p.gate) seq.push({ type: 'gate', id: p.gate.id, phase: p, label: '🏁 ' + p.gate.title });
    });
    return seq;
  }

  /* Dashboard ke liye summary */
  function stats() {
    let total = 0, done = 0, gatesTotal = 0, gatesPassed = 0, next = null;
    const list = phases().map((p) => {
      const locked = isLocked(p);
      const lessons = p.lessons || [];
      const d = phaseDoneCount(p);
      total += lessons.length;
      done += d;
      if (p.gate) { gatesTotal++; if (gatePassed(p.gate.id)) gatesPassed++; }

      // Agla kaam: pehla adhoora lesson, warna pending gate (sirf unlocked phases mein)
      if (!next && !locked) {
        const l = lessons.find((x) => !isDone(x.id));
        if (l) next = { route: ['lesson', l.id], label: l.day + ' — ' + l.title };
        else if (p.gate && !gatePassed(p.gate.id)) next = { route: ['gate', p.gate.id], label: p.gate.title };
      }
      return { id: p.id, label: p.label || '', title: p.title, done: d, total: lessons.length, locked, gatePassed: p.gate ? gatePassed(p.gate.id) : false };
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, next, gatesTotal, gatesPassed, phases: list };
  }

  /* =================================================================
     3) CHART VISUALIZER (SVG)
     ================================================================= */

  /* Candle ki anatomy: body %, wicks %, aur type */
  function classify(k, avgBody) {
    const range = (k.h - k.l) || 1e-9;
    const body = Math.abs(k.c - k.o);
    const up = k.h - Math.max(k.o, k.c);
    const low = Math.min(k.o, k.c) - k.l;
    const bp = body / range, upp = up / range, lp = low / range;
    const bull = k.c >= k.o;
    let label, color;
    if (bp >= 0.65 && body >= avgBody * 1.4) { label = bull ? 'Bullish Displacement' : 'Bearish Displacement'; color = bull ? COLORS.bull : COLORS.bear; }
    else if (lp >= 0.55) { label = 'Rejection wick (neeche se)'; color = COLORS.liq; }
    else if (upp >= 0.55) { label = 'Rejection wick (upar se)'; color = COLORS.liq; }
    else if (bp <= 0.2) { label = 'Indecision (Doji)'; color = COLORS.muted; }
    else { label = bull ? 'Normal bullish' : 'Normal bearish'; color = COLORS.muted; }
    return { label, color, body: Math.round(bp * 100), up: Math.round(upp * 100), low: Math.round(lp * 100) };
  }

  /* Annotation kis candle index ke baad dikhe (Replay ke liye) */
  function annAt(a) {
    if (typeof a.at === 'number') return a.at;
    switch (a.type) {
      case 'zone': case 'hline': return a.i1 || 0;
      case 'line': return Math.max(a.from[0], a.to[0]);
      case 'path': return a.points.length ? a.points[0][0] : 0;
      default: return a.i || 0;
    }
  }

  /* Annotation ki prices (y-scale mein shamil karne ke liye) */
  function annPrices(a) {
    const out = [];
    ['price', 'from', 'to'].forEach((f) => {
      if (typeof a[f] === 'number') out.push(a[f]);
      else if (Array.isArray(a[f])) out.push(a[f][1]);
    });
    if (a.points) a.points.forEach((p) => out.push(p[1]));
    return out;
  }

  /* Label tag: rounded box + text (width andaze se) */
  function tag(x, y, text, color, minX, maxX) {
    const w = String(text).length * 6.3 + 12, h = 18;
    let rx = x - w / 2;
    rx = Math.max(minX, Math.min(rx, maxX - w));
    const ry = y - h / 2;
    return '<g pointer-events="none"><rect x="' + n2(rx) + '" y="' + n2(ry) + '" width="' + n2(w) + '" height="' + h +
      '" rx="4" fill="#0b1220" fill-opacity="0.92" stroke="' + color + '" stroke-opacity="0.6"/>' +
      '<text x="' + n2(rx + w / 2) + '" y="' + n2(ry + 12.5) + '" text-anchor="middle" fill="' + color +
      '" font-size="11" font-weight="600">' + esc(text) + '</text></g>';
  }

  /* Poora SVG string banao.
     Annotation types:
       zone  : { type:'zone',  from, to, i1, i2, color, label }      price box
       hline : { type:'hline', price, i1, i2, color, label, dash }   horizontal level
       line  : { type:'line',  from:[i,p], to:[i,p], color, label, labelPos:'above'|'below', dash }
       path  : { type:'path',  points:[[i,p],...], color }            swing zigzag
       label : { type:'label', i, at:'high'|'low' | price, text, color } */
  function buildSvg(v, st) {
    const cs = v.candles || [];
    const n = cs.length;
    const W = 720, H = v.height || 320, pl = 10, pr = 76, pt = 18, pb = 18;
    const all = v.annotations || [];

    // Y-scale: candles + saari annotations (toggle se scale nahi badalta)
    let lo = Infinity, hi = -Infinity;
    cs.forEach((k) => { lo = Math.min(lo, k.l); hi = Math.max(hi, k.h); });
    all.forEach((a) => annPrices(a).forEach((p) => { lo = Math.min(lo, p); hi = Math.max(hi, p); }));
    const pad = (hi - lo) * 0.1 || 1;
    lo -= pad; hi += pad;

    const pw = W - pl - pr, ph = H - pt - pb;
    const step = pw / Math.max(n, 1);
    const bw = Math.max(3, Math.min(22, step * 0.62));
    const X = (i) => pl + step * i + step / 2;
    const Y = (p) => pt + ((hi - p) / (hi - lo)) * ph;
    const dec = v.decimals == null ? 1 : v.decimals;
    const fmt = (p) => Number(p).toFixed(dec);
    const vis = st.revealed;
    const lastX = (i2) => (i2 == null ? W - pr : X(Math.min(i2, vis - 1)) + step / 2);
    const anns = st.ann ? all.filter((a) => vis > annAt(a)) : [];
    const out = [];

    // Grid + price axis
    for (let g = 0; g <= 4; g++) {
      const p = lo + ((hi - lo) * g) / 4, y = n2(Y(p));
      out.push('<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" stroke="#1e293b"/>');
      out.push('<text x="' + (W - pr + 6) + '" y="' + (y + 4) + '" fill="#64748b" font-size="11" font-family="ui-monospace,monospace">' + fmt(p) + '</text>');
    }

    // Selected / correct candle highlight column
    if (st.picked != null && st.picked < vis) {
      out.push('<rect x="' + n2(X(st.picked) - step / 2) + '" y="' + pt + '" width="' + n2(step) + '" height="' + ph +
        '" fill="' + (st.solved ? COLORS.bull : COLORS.bear) + '" fill-opacity="0.14"/>');
    }

    // Zones + horizontal lines (candles ke peeche)
    anns.forEach((a) => {
      const c = col(a.color);
      if (a.type === 'zone') {
        const x1 = X(a.i1 || 0) - step / 2, x2 = lastX(a.i2);
        const y1 = Y(Math.max(a.from, a.to)), y2 = Y(Math.min(a.from, a.to));
        out.push('<rect x="' + n2(x1) + '" y="' + n2(y1) + '" width="' + n2(Math.max(0, x2 - x1)) + '" height="' + n2(y2 - y1) +
          '" fill="' + c + '" fill-opacity="0.13" stroke="' + c + '" stroke-opacity="0.45" stroke-dasharray="4 3"/>');
        if (a.label) {
          const w = a.label.length * 6.3 + 12;
          out.push(tag(x1 + 4 + w / 2, y1 + 12, a.label, c, pl, W - pr));
        }
      } else if (a.type === 'hline') {
        const x1 = X(a.i1 || 0) - step / 2, x2 = lastX(a.i2), y = n2(Y(a.price));
        out.push('<line x1="' + n2(x1) + '" x2="' + n2(x2) + '" y1="' + y + '" y2="' + y + '" stroke="' + c +
          '" stroke-width="1.5"' + (a.dash === false ? '' : ' stroke-dasharray="6 4"') + '/>');
        // Axis par price tag
        out.push('<rect x="' + (W - pr + 2) + '" y="' + (y - 9) + '" width="' + (pr - 4) + '" height="18" rx="3" fill="' + c + '"/>');
        out.push('<text x="' + (W - pr + 6) + '" y="' + (y + 4) + '" fill="#090d16" font-size="11" font-weight="700" font-family="ui-monospace,monospace">' + fmt(a.price) + '</text>');
        if (a.label) {
          const w = a.label.length * 6.3 + 12;
          out.push(tag(x2 - w / 2 - 4, y - 13, a.label, c, pl, W - pr));
        }
      }
    });

    // Candles
    for (let i = 0; i < vis; i++) {
      const k = cs[i], c = k.c >= k.o ? COLORS.bull : COLORS.bear, x = n2(X(i));
      const yTop = Y(Math.max(k.o, k.c)), yBot = Y(Math.min(k.o, k.c));
      out.push('<line x1="' + x + '" x2="' + x + '" y1="' + n2(Y(k.h)) + '" y2="' + n2(Y(k.l)) + '" stroke="' + c + '" stroke-width="1.4"/>');
      out.push('<rect x="' + n2(X(i) - bw / 2) + '" y="' + n2(yTop) + '" width="' + n2(bw) + '" height="' + n2(Math.max(1.2, yBot - yTop)) + '" fill="' + c + '" rx="1"/>');
    }

    // Lines, paths, labels (candles ke upar)
    anns.forEach((a) => {
      const c = col(a.color);
      if (a.type === 'line') {
        const x1 = X(a.from[0]), y1 = Y(a.from[1]), x2 = X(a.to[0]), y2 = Y(a.to[1]);
        out.push('<line x1="' + n2(x1) + '" y1="' + n2(y1) + '" x2="' + n2(x2) + '" y2="' + n2(y2) + '" stroke="' + c +
          '" stroke-width="1.8"' + (a.dash ? ' stroke-dasharray="5 4"' : '') + '/>');
        if (a.label) {
          const below = a.labelPos === 'below';
          out.push(tag((x1 + x2) / 2, (y1 + y2) / 2 + (below ? 14 : -14), a.label, c, pl, W - pr));
        }
      } else if (a.type === 'path') {
        const pts = a.points.filter((p) => p[0] < vis).map((p) => n2(X(p[0])) + ',' + n2(Y(p[1]))).join(' ');
        if (pts) out.push('<polyline points="' + pts + '" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-opacity="0.75" stroke-dasharray="2 3"/>');
      } else if (a.type === 'label') {
        const k = cs[a.i];
        if (!k) return;
        let py, dy;
        if (a.at === 'low') { py = k.l; dy = 16; }
        else if (a.at === 'high') { py = k.h; dy = -16; }
        else { py = typeof a.price === 'number' ? a.price : k.h; dy = a.pos === 'below' ? 16 : -16; }
        const x = X(a.i), y = Y(py);
        out.push('<circle cx="' + n2(x) + '" cy="' + n2(y) + '" r="3" fill="' + c + '"/>');
        out.push(tag(x, y + dy, a.text, c, pl, W - pr));
      }
    });

    // Invisible hit areas (hover / click) — sab se upar
    for (let i = 0; i < vis; i++) {
      out.push('<rect data-i="' + i + '" x="' + n2(X(i) - step / 2) + '" y="' + pt + '" width="' + n2(step) + '" height="' + ph + '" fill="transparent" style="cursor:pointer"/>');
    }

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="block w-full h-auto select-none" role="img" aria-label="' +
      esc(v.title || 'Candlestick chart') + '">' + out.join('') + '</svg>';
  }

  /* Ek chart mount karo: controls, tooltip, replay, click-task */
  function mountChart(parent, v) {
    parent.innerHTML = '';
    const box = document.createElement('div');  // har mount par naya box = purane listeners khatam
    parent.appendChild(box);

    const cs = v.candles || [];
    const st = { revealed: cs.length, ann: true, timer: null, picked: null, solved: false };
    const avgBody = cs.reduce((s, k) => s + Math.abs(k.c - k.o), 0) / (cs.length || 1);
    const dec = v.decimals == null ? 1 : v.decimals;

    box.innerHTML =
      '<div class="flex flex-wrap items-center gap-2 mb-3">' +
        '<button type="button" data-act="replay" class="' + BTN_SM + '">▶ Replay</button>' +
        '<button type="button" data-act="ann" class="' + BTN_SM + '"></button>' +
        '<span class="text-[11px] text-slate-500 ml-auto">Hover / tap = candle anatomy</span>' +
      '</div>' +
      '<div class="overflow-x-auto rounded-xl border border-slate-800 bg-ink">' +
        '<div data-wrap class="relative min-w-[560px]">' +
          '<div data-svg></div>' +
          '<div data-tip class="hidden pointer-events-none absolute z-10 w-56 bg-card/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl"></div>' +
        '</div>' +
      '</div>' +
      (v.caption ? '<p class="text-sm text-slate-400 mt-3 leading-6">' + md(v.caption) + '</p>' : '') +
      (v.task ? '<div class="mt-4 p-4 rounded-xl border border-liq/40 bg-liq/5"><p class="text-sm text-slate-200 leading-6"><span class="font-bold text-liq">🎯 Chart Task:</span> ' +
        md(v.task.prompt) + '</p><div data-fb class="text-sm mt-2 leading-6"></div></div>' : '');

    const svgHost = box.querySelector('[data-svg]');
    const tip = box.querySelector('[data-tip]');
    const wrap = box.querySelector('[data-wrap]');
    const fb = box.querySelector('[data-fb]');
    const annBtn = box.querySelector('[data-act="ann"]');

    function draw() {
      svgHost.innerHTML = buildSvg(v, st);
      annBtn.textContent = st.ann ? '👁 Annotations: ON' : '👁 Annotations: OFF';
    }

    // Tooltip: OHLC + body/wick % + candle type
    function showTip(i, e) {
      const k = cs[i];
      if (!k) return;
      const info = classify(k, avgBody);
      const f = (p) => Number(p).toFixed(dec);
      tip.innerHTML =
        '<div class="font-semibold text-white mb-1">Candle #' + (i + 1) + ' · <span style="color:' + info.color + '">' + esc(info.label) + '</span></div>' +
        '<div class="grid grid-cols-2 gap-x-3 font-mono text-[11px] text-slate-300"><span>O ' + f(k.o) + '</span><span>H ' + f(k.h) +
        '</span><span>L ' + f(k.l) + '</span><span>C ' + f(k.c) + '</span></div>' +
        '<div class="mt-1 text-[11px] text-slate-400">Body ' + info.body + '% · Upper wick ' + info.up + '% · Lower wick ' + info.low + '%</div>';
      tip.classList.remove('hidden');
      const r = wrap.getBoundingClientRect();
      let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      if (x + tip.offsetWidth > r.width) x = e.clientX - r.left - tip.offsetWidth - 14;
      if (y + tip.offsetHeight > r.height) y = r.height - tip.offsetHeight - 4;
      tip.style.left = Math.max(4, x) + 'px';
      tip.style.top = Math.max(4, y) + 'px';
    }

    // Replay: candles ek ek karke aati hain (annotations bhi apne waqt par)
    function replay() {
      clearInterval(st.timer);
      st.revealed = 1;
      draw();
      st.timer = setInterval(() => {
        if (!document.body.contains(box)) { clearInterval(st.timer); return; } // page badal gaya
        st.revealed++;
        draw();
        if (st.revealed >= cs.length) clearInterval(st.timer);
      }, v.speed || 380);
    }

    // Click-task check
    function check(i) {
      const ok = v.task.answer.indexOf(i) !== -1;
      st.picked = i;
      st.solved = ok;
      draw();
      fb.innerHTML = ok
        ? '<span class="text-bull font-semibold">✅ Sahi jawab!</span> <span class="text-slate-300">' + md(v.task.explain || '') + '</span>'
        : '<span class="text-bear font-semibold">❌ Yeh candle nahi.</span> <span class="text-slate-300">' + md(v.task.hint || 'Dobara dhyan se dekho aur koshish karo.') + '</span>';
    }

    box.addEventListener('mousemove', (e) => {
      const h = e.target.closest('[data-i]');
      if (h) showTip(+h.dataset.i, e); else tip.classList.add('hidden');
    });
    box.addEventListener('mouseleave', () => tip.classList.add('hidden'));
    box.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        if (act.dataset.act === 'replay') replay();
        else { st.ann = !st.ann; draw(); }
        return;
      }
      const h = e.target.closest('[data-i]');
      if (!h) return;
      const i = +h.dataset.i;
      showTip(i, e);                              // mobile tap par bhi tooltip
      if (v.task && !st.solved) check(i);
    });

    draw();
    return { destroy() { clearInterval(st.timer); } };
  }

  /* Visualizer: ek chart ya tabs (agar visual array ho) */
  function mountVisualizer(host, visual) {
    if (!host) return;
    const list = (Array.isArray(visual) ? visual : [visual]).filter(Boolean);
    if (!list.length) { host.innerHTML = '<p class="text-sm text-slate-500">Is lesson ka visual abhi nahi hai.</p>'; return; }

    const tabCls = (on) => 'px-3 py-1.5 rounded-lg text-xs font-semibold border transition ' +
      (on ? 'bg-liq/15 text-liq border-liq/40' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800');

    host.innerHTML =
      (list.length > 1
        ? '<div class="flex flex-wrap gap-2 mb-3" role="tablist">' + list.map((v, i) =>
            '<button type="button" role="tab" data-tab="' + i + '" class="' + tabCls(i === 0) + '">' + esc(v.title || 'Chart ' + (i + 1)) + '</button>').join('') + '</div>'
        : (list[0].title ? '<h3 class="font-semibold text-white mb-3">' + esc(list[0].title) + '</h3>' : '')) +
      '<div data-chart></div>';

    const chartHost = host.querySelector('[data-chart]');
    let api = null;
    const show = (i) => {
      if (api) api.destroy();
      host.querySelectorAll('[data-tab]').forEach((b) => { b.className = tabCls(+b.dataset.tab === i); });
      api = mountChart(chartHost, list[i]);
    };
    host.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tab]');
      if (t) show(+t.dataset.tab);
    });
    show(0);
  }

  /* =================================================================
     4) VIEWS
     ================================================================= */
  function lockedView(el, blocker) {
    el.innerHTML =
      '<div class="max-w-xl mx-auto mt-6 ' + CARD + ' text-center">' +
        '<div class="text-5xl">🔒</div>' +
        '<h2 class="text-xl font-bold text-white mt-3">Yeh phase abhi LOCKED hai</h2>' +
        '<p class="text-slate-400 mt-2 text-sm leading-6">Pehle <b class="text-liq">' + esc(blocker.gate.title) + '</b> ' +
        esc(blocker.gate.passPct) + '% score ke saath pass karo. Institutional trader buniyad pakki kiye baghair aage nahi barhta.</p>' +
        '<button type="button" data-go="overview" class="mt-5 px-4 py-2 rounded-lg bg-bull text-ink font-semibold hover:bg-emerald-400">← Curriculum par jao</button>' +
      '</div>';
    el.querySelector('[data-go]').addEventListener('click', () => App.navigate('course'));
  }

  function notFoundView(el) {
    el.innerHTML = '<div class="max-w-xl mx-auto mt-6 ' + CARD + '"><p class="text-slate-300">Yeh lesson nahi mila.</p>' +
      '<button type="button" class="mt-4 ' + BTN_SM + '" data-go>← Curriculum</button></div>';
    el.querySelector('[data-go]').addEventListener('click', () => App.navigate('course'));
  }

  /* ---------- 4a) Overview: saare phases + checkboxes ---------- */
  function lessonRow(l, locked) {
    const done = isDone(l.id);
    return '<div ' + (locked ? '' : 'data-open="' + esc(l.id) + '"') + ' class="flex items-center gap-3 px-5 py-3 ' +
        (locked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/40') + '">' +
      '<input type="checkbox" data-toggle="' + esc(l.id) + '" ' + (done ? 'checked ' : '') + (locked ? 'disabled ' : '') +
        'class="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" aria-label="Lesson complete">' +
      '<div class="min-w-0 flex-1">' +
        '<div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold">' +
          '<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">' + esc(l.day) + '</span>' +
          (l.section ? '<span class="px-2 py-0.5 rounded bg-liq/10 text-liq">' + esc(l.section) + '</span>' : '') +
          (done ? '<span class="text-bull">✓ Done</span>' : '') +
        '</div>' +
        '<p class="mt-1 font-medium text-slate-100 truncate">' + esc(l.title) + '</p>' +
      '</div>' +
      '<span class="text-slate-500 text-lg">' + (locked ? '🔒' : '›') + '</span>' +
    '</div>';
  }

  function gateRow(p, locked) {
    const g = p.gate, rec = getGates()[g.id] || {};
    const d = phaseDoneCount(p), t = p.lessons.length;
    let status;
    if (rec.passed) status = '<span class="text-bull font-semibold text-sm">✅ Passed (' + rec.best + '%)</span>';
    else if (locked) status = '<span class="text-slate-500">🔒</span>';
    else if (d < t) status = '<span class="text-slate-400 text-xs text-right">Pehle saare lessons<br>complete karo (' + d + '/' + t + ')</span>';
    else status = '<span class="text-liq font-semibold text-sm">Ready — attempt karo ›</span>';
    return '<div ' + (locked ? '' : 'data-gate="' + esc(g.id) + '"') + ' class="flex items-center gap-3 px-5 py-4 bg-liq/5 border-t border-liq/30 ' +
        (locked ? '' : 'cursor-pointer hover:bg-liq/10') + '">' +
      '<span class="text-2xl">🏁</span>' +
      '<div class="flex-1 min-w-0"><p class="font-bold text-white">' + esc(g.title) + '</p>' +
        '<p class="text-xs text-slate-400">' + g.questions.length + ' sawal · ' + g.passPct + '% zaroori' + (rec.attempts ? ' · ' + rec.attempts + ' attempts' : '') + '</p></div>' +
      status + '</div>';
  }

  function phaseCard(p) {
    const blocker = blockingPhase(p), locked = !!blocker;
    const d = phaseDoneCount(p), t = (p.lessons || []).length;
    const pct = t ? Math.round((d / t) * 100) : 0;
    return '<section class="bg-card border border-slate-800 rounded-2xl overflow-hidden ' + (locked ? 'opacity-75' : '') + '">' +
      '<div class="p-5 flex flex-wrap items-start justify-between gap-3">' +
        '<div class="min-w-0">' +
          '<span class="text-[11px] font-bold tracking-widest ' + (locked ? 'text-slate-500' : 'text-liq') + '">' + esc(p.label || '') + '</span>' +
          '<h2 class="text-lg md:text-xl font-bold text-white">' + esc(p.title) + '</h2>' +
          (p.subtitle ? '<p class="text-sm text-slate-400 mt-1 leading-6">' + esc(p.subtitle) + '</p>' : '') +
        '</div>' +
        '<span class="text-sm font-semibold ' + (locked ? 'text-slate-500' : 'text-slate-300') + '">' + (locked ? '🔒 Locked' : d + '/' + t) + '</span>' +
      '</div>' +
      (locked
        ? '<div class="px-5 py-3 bg-bear/10 border-y border-bear/20 text-sm text-red-300">🔒 Pehle <b>' + esc(blocker.gate.title) + '</b> pass karo (' + blocker.gate.passPct + '%).</div>'
        : '<div class="h-1 bg-slate-800"><div class="h-full bg-bull transition-all" style="width:' + pct + '%"></div></div>') +
      '<div class="divide-y divide-slate-800/70">' + (p.lessons || []).map((l) => lessonRow(l, locked)).join('') + '</div>' +
      (p.gate ? gateRow(p, locked) : '') +
    '</section>';
  }

  function renderOverview(el) {
    const draw = () => {
      const list = phases();
      const s = stats();
      el.innerHTML =
        '<div class="max-w-5xl mx-auto space-y-6">' +
          '<div>' +
            '<p class="text-xs uppercase tracking-widest text-bull font-semibold">Module 1</p>' +
            '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">Institutional Curriculum</h1>' +
            '<p class="text-slate-400 mt-1 text-sm leading-6">Din ba din seekho. Lesson parh kar checkbox lagao. Har phase ke end par Milestone Gate hai — pass kiye baghair agla phase nahi khulega.</p>' +
          '</div>' +
          '<div class="' + CARD + '">' +
            '<div class="flex items-center justify-between text-sm"><span class="text-slate-300 font-semibold">Overall Progress</span><span class="text-bull font-bold">' + s.pct + '%</span></div>' +
            '<div class="h-2.5 mt-2 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-bull rounded-full transition-all" style="width:' + s.pct + '%"></div></div>' +
            '<p class="text-xs text-slate-400 mt-2">' + s.done + ' / ' + s.total + ' lessons · ' + s.gatesPassed + ' / ' + s.gatesTotal + ' gates passed</p>' +
          '</div>' +
          (list.length ? list.map(phaseCard).join('') : '<p class="text-slate-500">Course data load nahi hua (course-data files check karo).</p>') +
        '</div>';
    };
    draw();

    // Listeners sirf ek baar (el par) — draw() sirf andar ka HTML badalta hai
    el.addEventListener('change', (e) => {
      const cb = e.target.closest('input[data-toggle]');
      if (!cb) return;
      setDone(cb.dataset.toggle, cb.checked);
      draw();
    });
    el.addEventListener('click', (e) => {
      if (e.target.closest('input')) return;          // checkbox click = sirf toggle
      const o = e.target.closest('[data-open]');
      if (o) { App.navigate('course', 'lesson', o.dataset.open); return; }
      const g = e.target.closest('[data-gate]');
      if (g) App.navigate('course', 'gate', g.dataset.gate);
    });
  }

  /* ---------- 4b) Lesson view ---------- */
  function navBtn(item, dir) {
    if (!item) return '<div></div>';
    const locked = isLocked(item.phase);
    return '<button type="button" ' + (locked ? 'disabled' : 'data-nav-item="' + item.type + ':' + esc(item.id) + '"') +
      ' class="w-full text-' + (dir === 'prev' ? 'left' : 'right') + ' p-4 rounded-xl border border-slate-800 bg-card ' +
      (locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600') + '">' +
      '<span class="block text-[11px] uppercase tracking-wider text-slate-500">' + (dir === 'prev' ? '← Pichla' : 'Agla →') + (locked ? ' 🔒' : '') + '</span>' +
      '<span class="block text-sm text-slate-200 font-medium truncate mt-0.5">' + esc(item.label) + '</span></button>';
  }

  function completeBtnHtml(done) {
    return done
      ? '<span class="text-lg">✅</span> Lesson complete! <span class="text-xs font-normal text-emerald-200/70 ml-1">(undo ke liye click)</span>'
      : '<span class="text-lg">☐</span> Lesson complete mark karo';
  }
  const completeBtnCls = (done) => 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition ' +
    (done ? 'bg-bull/15 text-bull border border-bull/40 hover:bg-bull/25' : 'bg-bull text-ink hover:bg-emerald-400');

  function renderLesson(el, id) {
    const found = findLesson(id);
    if (!found) return notFoundView(el);
    const { phase, lesson } = found;
    const blocker = blockingPhase(phase);
    if (blocker) return lockedView(el, blocker);

    const seq = sequence();
    const idx = seq.findIndex((s) => s.type === 'lesson' && s.id === lesson.id);
    const prev = seq[idx - 1], next = seq[idx + 1];
    const done = isDone(lesson.id);
    const ex = lesson.exercise || {};

    el.innerHTML =
      '<div class="max-w-4xl mx-auto space-y-6">' +
        '<button type="button" data-go="overview" class="text-sm text-slate-400 hover:text-white">← Curriculum</button>' +

        // Header
        '<header class="' + CARD + '">' +
          '<p class="text-[11px] font-bold tracking-widest text-liq">' + esc(phase.label) + ' · ' + esc(phase.title) + '</p>' +
          '<div class="flex flex-wrap gap-2 mt-3 text-xs font-semibold">' +
            '<span class="px-2 py-1 rounded bg-slate-800 text-slate-200">' + esc(lesson.day) + '</span>' +
            (lesson.section ? '<span class="px-2 py-1 rounded bg-liq/10 text-liq">Section ' + esc(lesson.section) + '</span>' : '') +
          '</div>' +
          '<h1 class="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">' + esc(lesson.title) + '</h1>' +
          ((lesson.concepts || []).length ? '<div class="flex flex-wrap gap-2 mt-4">' + lesson.concepts.map((c) =>
            '<span class="px-2.5 py-1 rounded-full text-xs bg-bull/10 text-bull border border-bull/20">' + esc(c) + '</span>').join('') + '</div>' : '') +
        '</header>' +

        // Study notes
        '<section class="' + CARD + '">' +
          '<h2 class="text-lg font-bold text-white">📖 Study Notes</h2>' +
          '<div class="mt-4 space-y-6">' + (lesson.notes || []).map((nt, i) =>
            '<div><h3 class="text-base md:text-lg font-semibold text-bull">' + (i + 1) + '. ' + esc(nt.h) + '</h3>' +
            '<p class="text-slate-300 leading-7 mt-2 text-[15px]">' + md(nt.p) + '</p></div>').join('') +
          '</div>' +
        '</section>' +

        // Key points
        ((lesson.keyPoints || []).length ?
        '<section class="' + CARD + '">' +
          '<h2 class="text-lg font-bold text-white">🔑 Yaad Rakhne Wali Baatein</h2>' +
          '<ul class="mt-3 space-y-2">' + lesson.keyPoints.map((k) =>
            '<li class="flex gap-2 text-sm text-slate-300 leading-6"><span class="text-bull shrink-0">✔</span><span>' + md(k) + '</span></li>').join('') + '</ul>' +
        '</section>' : '') +

        // Visualizer
        '<section class="' + CARD + '">' +
          '<h2 class="text-lg font-bold text-white">📈 Interactive Chart Visualizer</h2>' +
          '<p class="text-xs text-slate-400 mt-1 mb-4">Replay dabao taake candles ek ek karke banen. Kisi bhi candle par hover/tap karke us ki anatomy dekho.</p>' +
          '<div data-vis></div>' +
        '</section>' +

        // Exercise
        '<section class="bg-card border border-liq/40 rounded-2xl p-5 md:p-6">' +
          '<h2 class="text-lg font-bold text-liq">🎯 Practical Chart Exercise' + (ex.title ? ': <span class="text-white">' + esc(ex.title) + '</span>' : '') + '</h2>' +
          '<ol class="mt-3 space-y-2 list-decimal ml-5 text-sm text-slate-300 leading-6 marker:text-liq marker:font-bold">' +
            (ex.steps || []).map((s) => '<li class="pl-1">' + md(s) + '</li>').join('') + '</ol>' +
          (ex.deliverable ? '<p class="mt-4 text-sm text-slate-200 bg-ink/60 border border-slate-800 rounded-lg p-3"><b class="text-liq">Deliverable:</b> ' + md(ex.deliverable) + '</p>' : '') +
        '</section>' +

        // Complete
        '<div class="flex justify-center"><button type="button" data-complete class="' + completeBtnCls(done) + '">' + completeBtnHtml(done) + '</button></div>' +

        // Prev / next
        '<nav class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + navBtn(prev, 'prev') + navBtn(next, 'next') + '</nav>' +
      '</div>';

    mountVisualizer(el.querySelector('[data-vis]'), lesson.visual);

    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-go="overview"]')) { App.navigate('course'); return; }

      const cb = e.target.closest('[data-complete]');
      if (cb) {
        // Sirf button update — visualizer ki state reset na ho
        const now = !isDone(lesson.id);
        setDone(lesson.id, now);
        cb.className = completeBtnCls(now);
        cb.innerHTML = completeBtnHtml(now);
        if (now) App.toast('Shabash! Lesson complete ho gaya.', 'success');
        return;
      }

      const nb = e.target.closest('[data-nav-item]');
      if (nb) {
        const [type, nid] = nb.dataset.navItem.split(':');
        App.navigate('course', type, nid);
      }
    });
  }

  /* ---------- 4c) Milestone Gate (quiz) ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Har attempt par sawal aur options shuffle — ratta kaam nahi aayega */
  function buildAttempt(gate) {
    return shuffle(gate.questions).map((q) => ({
      q: q.q,
      explain: q.explain,
      options: shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })))
    }));
  }

  function renderGate(el, gid) {
    const phase = findGatePhase(gid);
    if (!phase) return notFoundView(el);
    const blocker = blockingPhase(phase);
    if (blocker) return lockedView(el, blocker);
    const gate = phase.gate;

    // Pehle saare lessons complete hone chahiyen
    const remaining = phase.lessons.filter((l) => !isDone(l.id));
    if (remaining.length) {
      el.innerHTML =
        '<div class="max-w-2xl mx-auto ' + CARD + '">' +
          '<button type="button" data-go="overview" class="text-sm text-slate-400 hover:text-white">← Curriculum</button>' +
          '<h1 class="text-2xl font-bold text-white mt-3">🏁 ' + esc(gate.title) + '</h1>' +
          '<p class="text-slate-400 mt-2 text-sm leading-6">Gate attempt karne se pehle yeh lessons complete karo:</p>' +
          '<ul class="mt-3 space-y-2">' + remaining.map((l) =>
            '<li><button type="button" data-open="' + esc(l.id) + '" class="w-full text-left px-4 py-3 rounded-lg bg-ink border border-slate-800 hover:border-slate-600 text-sm text-slate-200">' +
            '<span class="text-liq font-semibold">' + esc(l.day) + '</span> — ' + esc(l.title) + '</button></li>').join('') + '</ul>' +
        '</div>';
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-go]')) App.navigate('course');
        const o = e.target.closest('[data-open]');
        if (o) App.navigate('course', 'lesson', o.dataset.open);
      });
      return;
    }

    let attempt = buildAttempt(gate);
    const total = gate.questions.length;
    const need = Math.ceil((gate.passPct / 100) * total);
    const nextPhase = phases()[phases().indexOf(phase) + 1] || null;

    const header = () => {
      const rec = getGates()[gid] || {};
      return '<button type="button" data-go="overview" class="text-sm text-slate-400 hover:text-white">← Curriculum</button>' +
        '<div class="' + CARD + ' mt-3">' +
          '<p class="text-[11px] font-bold tracking-widest text-liq">' + esc(phase.label) + ' · MILESTONE</p>' +
          '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">🏁 ' + esc(gate.title) + '</h1>' +
          '<p class="text-sm text-slate-400 mt-2 leading-6">' + total + ' sawal · pass ke liye kam az kam <b class="text-white">' + gate.passPct + '% (' + need + '/' + total + ')</b>. ' +
          'Sawal aur options har attempt par shuffle hote hain.' +
          (rec.attempts ? ' <br>Pichle attempts: ' + rec.attempts + ' · Best: ' + rec.best + '%' + (rec.passed ? ' <span class="text-bull font-semibold">✅ Passed</span>' : '') : '') + '</p>' +
        '</div>';
    };

    function drawQuiz() {
      el.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' + header() +
        attempt.map((q, qi) =>
          '<fieldset data-q="' + qi + '" class="' + CARD + '">' +
            '<legend class="sr-only">Sawal ' + (qi + 1) + '</legend>' +
            '<p class="font-semibold text-white leading-6"><span class="text-liq">Q' + (qi + 1) + '.</span> ' + md(q.q) + '</p>' +
            '<div class="mt-3 grid gap-2">' + q.options.map((o, oi) =>
              '<label class="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-ink/50 hover:border-slate-600 cursor-pointer has-[:checked]:border-liq has-[:checked]:bg-liq/5">' +
                '<input type="radio" name="q' + qi + '" value="' + oi + '" class="mt-1 accent-amber-500">' +
                '<span class="text-sm text-slate-300 leading-6">' + md(o.text) + '</span></label>').join('') +
            '</div>' +
          '</fieldset>').join('') +
        '<button type="button" data-submit class="w-full px-5 py-3 rounded-xl bg-liq text-ink font-bold hover:bg-amber-400">Submit karo</button>' +
      '</div>';
    }

    function submit() {
      const picks = attempt.map((q, qi) => {
        const r = el.querySelector('input[name="q' + qi + '"]:checked');
        return r ? +r.value : null;
      });
      const missing = picks.findIndex((p) => p === null);
      if (missing !== -1) {
        App.toast('Pehle saare sawalon ka jawab do (Q' + (missing + 1) + ' khali hai).', 'warn');
        const fs = el.querySelector('[data-q="' + missing + '"]');
        if (fs) { fs.classList.add('ring-2', 'ring-liq'); fs.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        return;
      }

      const correct = picks.filter((p, qi) => attempt[qi].options[p].correct).length;
      const pct = Math.round((correct / total) * 100);
      const passed = pct >= gate.passPct;

      // Store mein record (pass hamesha pass rehta hai)
      const all = getGates();
      const rec = all[gid] || {};
      all[gid] = {
        passed: !!rec.passed || passed,
        best: Math.max(rec.best || 0, pct),
        lastScore: pct,
        attempts: (rec.attempts || 0) + 1,
        passedAt: rec.passedAt || (passed ? Date.now() : null)
      };
      Store.set('gates', all);
      if (passed) App.toast('Mubarak ho! Gate pass — agla phase unlock ho gaya.', 'success');

      drawResult(picks, correct, pct, passed);
    }

    function drawResult(picks, correct, pct, passed) {
      const nextBtn = passed
        ? (nextPhase && nextPhase.lessons && nextPhase.lessons.length
            ? '<button type="button" data-open="' + esc(nextPhase.lessons[0].id) + '" class="px-5 py-2.5 rounded-xl bg-bull text-ink font-semibold hover:bg-emerald-400">' + esc(nextPhase.label) + ' shuru karo →</button>'
            : '<p class="text-sm text-slate-300">Agla phase course ke agle part (course-data-2.js) mein aayega.</p>')
        : '';

      el.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' + header() +
        '<div class="rounded-2xl p-6 border ' + (passed ? 'border-bull/50 bg-bull/10' : 'border-bear/50 bg-bear/10') + '">' +
          '<p class="text-sm font-semibold ' + (passed ? 'text-bull' : 'text-bear') + '">' + (passed ? '✅ GATE PASSED' : '❌ GATE NOT PASSED') + '</p>' +
          '<p class="text-4xl font-bold text-white mt-1">' + correct + ' / ' + total + ' <span class="text-2xl ' + (passed ? 'text-bull' : 'text-bear') + '">(' + pct + '%)</span></p>' +
          '<p class="text-sm text-slate-300 mt-2 leading-6">' + (passed
            ? 'Behtareen! Aap ki buniyad mazboot hai. Agla phase ab khul gaya hai.'
            : 'Pass ke liye ' + gate.passPct + '% chahiye. Neeche ghalat jawabon ki wazahat parho, mutalliqa lessons dobara dekho, aur phir attempt karo. Jaldi nahi — samajh zaroori hai.') + '</p>' +
          '<div class="flex flex-wrap items-center gap-3 mt-4">' +
            '<button type="button" data-retry class="' + BTN_SM + '">⟲ Dobara attempt</button>' + nextBtn +
          '</div>' +
        '</div>' +
        attempt.map((q, qi) => {
          const pick = q.options[picks[qi]];
          const right = q.options.find((o) => o.correct);
          const ok = pick.correct;
          return '<div class="' + CARD + ' border-l-4 ' + (ok ? 'border-l-bull' : 'border-l-bear') + '">' +
            '<p class="font-semibold text-white leading-6"><span class="' + (ok ? 'text-bull' : 'text-bear') + '">' + (ok ? '✔' : '✘') + ' Q' + (qi + 1) + '.</span> ' + md(q.q) + '</p>' +
            '<p class="text-sm mt-2 ' + (ok ? 'text-bull' : 'text-bear') + '">Aap ka jawab: ' + md(pick.text) + '</p>' +
            (ok ? '' : '<p class="text-sm mt-1 text-bull">Sahi jawab: ' + md(right.text) + '</p>') +
            (q.explain ? '<p class="text-sm mt-2 text-slate-400 leading-6">💡 ' + md(q.explain) + '</p>' : '') +
          '</div>';
        }).join('') +
      '</div>';
      window.scrollTo(0, 0);
    }

    drawQuiz();

    // Ek hi delegated listener (draws sirf innerHTML badalte hain)
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-go="overview"]')) { App.navigate('course'); return; }
      if (e.target.closest('[data-submit]')) { submit(); return; }
      if (e.target.closest('[data-retry]')) { attempt = buildAttempt(gate); drawQuiz(); window.scrollTo(0, 0); return; }
      const o = e.target.closest('[data-open]');
      if (o) App.navigate('course', 'lesson', o.dataset.open);
    });
  }

  /* =================================================================
     5) MODULE REGISTRATION + GLOBAL API
     ================================================================= */
  function render(container, params) {
    const view = params && params[0];
    const id = params && params[1];
    if (view === 'lesson' && id) return renderLesson(container, id);
    if (view === 'gate' && id) return renderGate(container, id);
    return renderOverview(container);
  }

  App.registerModule({ id: 'course', title: 'Module 1: Course', icon: '📚', order: 10, render });

  // Doosre modules (dashboard, simulator) ke liye
  window.CourseEngine = Object.freeze({
    candles,          // data files ka candle builder
    stats,            // dashboard summary
    phases,           // sorted phases
    isLocked,         // phase locked hai?
    mountVisualizer,  // SVG chart doosre modules mein reuse ke liye
    classify          // candle anatomy
  });
})();
