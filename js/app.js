/* =====================================================================
   app.js — Module registry, sidebar navigation, routing + Home Dashboard
   ---------------------------------------------------------------------
   PUBLIC API (STABLE — future files sirf isi ko call karengi):
     App.registerModule({ id, title, icon, render(container) })
        - id     : unique string (URL mein use hota hai: #/id)
        - title  : sidebar mein dikhne wala naam
        - icon   : emoji ya chhota inline SVG string
        - render : function(container, params) — container ek khali <div>
                   hai; params = URL ke baqi hisse (#/id/a/b -> ['a','b'])
        - order  : (optional) sidebar mein tarteeb; chhota number upar

   Helpers (future modules bhi use kar sakte hain):
     App.navigate(id, ...params)  App.refresh()  App.toast(msg, type)
     App.esc(text)  App.todayKey()
   ===================================================================== */
(function () {
  'use strict';

  const modules = [];      // registered modules ki list
  let started = false;     // App.start() chal chuka hai ya nahi
  let currentId = null;    // abhi kaun sa module khula hai

  /* HTML escape — user/data text ko safely innerHTML mein daalne ke liye */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* Aaj ki local date "YYYY-MM-DD" */
  function todayKey(d) {
    d = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* ------------------------------------------------------------------
     1) MODULE REGISTRY
     ------------------------------------------------------------------ */
  function registerModule(def) {
    if (!def || !def.id || typeof def.render !== 'function') {
      console.error('[App] registerModule ko {id, title, icon, render} chahiye', def);
      return;
    }
    if (modules.some((m) => m.id === def.id)) {
      console.warn('[App] module pehle se registered hai:', def.id);
      return;
    }
    modules.push({
      id: String(def.id),
      title: def.title || def.id,
      icon: def.icon || '•',
      render: def.render,
      order: typeof def.order === 'number' ? def.order : 100 + modules.length
    });
    modules.sort((a, b) => a.order - b.order);

    // Agar app start ho chuki hai (late registration) to nav dobara banao
    if (started) {
      renderNav();
      if (parseHash().id === def.id) route();
    }
  }

  /* ------------------------------------------------------------------
     2) ROUTING  (#/moduleId/param1/param2)
     ------------------------------------------------------------------ */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw ? raw.split('/').map((p) => {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    }) : [];
    return { id: parts[0] || '', params: parts.slice(1) };
  }

  function navigate(id, ...params) {
    const hash = '#/' + [id, ...params].map((p) => encodeURIComponent(p)).join('/');
    if (location.hash === hash) route();   // same hash par hashchange nahi aata
    else location.hash = hash;
  }

  /* Current hash ke mutabiq module render karo */
  function route() {
    const main = document.getElementById('main');
    if (!main || !modules.length) return;

    const { id, params } = parseHash();
    const mod = modules.find((m) => m.id === id) || modules[0]; // ghalat id -> Home
    currentId = mod.id;
    renderNav();

    // Har route par naya container — purane listeners khud khatam
    main.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'ita-view';
    main.appendChild(container);

    try {
      mod.render(container, params);
    } catch (err) {
      console.error('[App] render error in', mod.id, err);
      container.innerHTML =
        '<div class="max-w-xl mx-auto mt-10 bg-card border border-bear/40 rounded-2xl p-6">' +
        '<h2 class="text-bear font-bold text-lg">Kuch ghalat ho gaya</h2>' +
        '<p class="text-slate-400 text-sm mt-2">Yeh module load nahi ho saka. Console (F12) mein error dekho.</p>' +
        '<pre class="mt-3 text-xs text-slate-500 whitespace-pre-wrap">' + esc(err && err.message) + '</pre></div>';
    }

    document.title = mod.title + ' · Institutional Trading Academy';
    closeSidebar();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------
     3) SIDEBAR NAV + MOBILE HAMBURGER
     ------------------------------------------------------------------ */
  function renderNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    nav.innerHTML = modules.map((m) => {
      const active = m.id === currentId;
      const icon = String(m.icon).trim().charAt(0) === '<' ? m.icon : esc(m.icon); // SVG ya emoji
      return '<button type="button" data-nav="' + esc(m.id) + '" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition ' +
        (active ? 'bg-bull/10 text-bull ring-1 ring-bull/30' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white') + '"' +
        (active ? ' aria-current="page"' : '') + '>' +
        '<span class="w-6 text-center text-base shrink-0">' + icon + '</span>' +
        '<span class="truncate">' + esc(m.title) + '</span></button>';
    }).join('');
  }

  function openSidebar() {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
  }
  function closeSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebar-overlay');
    if (sb) sb.classList.add('-translate-x-full');   // md+ par CSS isay override karta hai
    if (ov) ov.classList.add('hidden');
  }

  /* ------------------------------------------------------------------
     4) TOAST NOTIFICATIONS  (type: info | success | error | warn)
     ------------------------------------------------------------------ */
  function toast(msg, type) {
    const root = document.getElementById('toast-root');
    if (!root) { alert(msg); return; }
    const colors = {
      success: 'border-bull/50 text-emerald-300',
      error: 'border-bear/50 text-red-300',
      warn: 'border-liq/50 text-amber-300',
      info: 'border-slate-600 text-slate-200'
    };
    const el = document.createElement('div');
    el.className = 'pointer-events-auto bg-card border ' + (colors[type] || colors.info) +
      ' rounded-xl px-4 py-3 text-sm shadow-2xl shadow-black/50 transition-opacity duration-300';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2800);
    setTimeout(() => el.remove(), 3200);
  }

  /* ------------------------------------------------------------------
     5) HOME DASHBOARD — Store data readers
     Future modules ko yeh formats follow karne chahiyen:
       sim_scores : [{ ts, correct: Number, total: Number }]   (preferred)
                    (ya { score: 0-100 }, ya { correct: true/false })
       backtest   : [{ r: Number }]  R-multiple (+2 = 2R win, -1 = 1R loss)
                    (ya { result: 'win'|'loss'|'be', rr: Number })
                    (ya object { trades: [...] })
       demo       : [{ date: 'YYYY-MM-DD' ya ts, result: 'win'|'loss'|'be', r }]
     ------------------------------------------------------------------ */
  const DAILY_LOSS_LIMIT = 2; // 2 loss ke baad us din trading band

  /* Kisi bhi array-ya-wrapper ko array mein badlo */
  function asList(raw, field) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw[field])) return raw[field];
    return [];
  }

  /* Ek trade ka R-multiple nikalo (na mile to null) */
  function tradeR(t) {
    if (typeof t === 'number') return t;
    if (!t || typeof t !== 'object') return null;
    if (typeof t.r === 'number') return t.r;
    if (typeof t.pnl === 'number') return t.pnl > 0 ? 1 : t.pnl < 0 ? -1 : 0; // sirf sign
    const res = String(t.result || '').toLowerCase();
    if (res === 'win') return typeof t.rr === 'number' ? t.rr : 1;
    if (res === 'loss') return -1;
    if (res === 'be') return 0;
    return null;
  }

  /* Trader Accuracy Rating (%) — simulator scores se */
  function readAccuracy() {
    const list = asList(Store.get('sim_scores', []), 'attempts');
    let correct = 0, total = 0;
    list.forEach((a) => {
      if (!a || typeof a !== 'object') return;
      if (typeof a.correct === 'number' && typeof a.total === 'number' && a.total > 0) {
        correct += a.correct; total += a.total;
      } else if (typeof a.correct === 'boolean') {
        correct += a.correct ? 1 : 0; total += 1;
      } else if (typeof a.score === 'number') {
        correct += Math.max(0, Math.min(100, a.score)) / 100; total += 1;
      }
    });
    return total > 0 ? { pct: Math.round((correct / total) * 100), n: list.length } : null;
  }

  /* Backtest Expectancy (R mein) = (Win% × Avg Win) − (Loss% × Avg Loss) */
  function readExpectancy() {
    const raw = Store.get('backtest', []);
    const rs = asList(raw, 'trades').map(tradeR).filter((x) => typeof x === 'number' && isFinite(x));
    if (!rs.length) {
      if (raw && typeof raw.expectancy === 'number') return { exp: raw.expectancy, winRate: null, n: 0 };
      return null;
    }
    const wins = rs.filter((r) => r > 0);
    const losses = rs.filter((r) => r < 0);
    const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
    const winRate = wins.length / rs.length;
    const lossRate = losses.length / rs.length;
    const exp = winRate * avg(wins) - lossRate * Math.abs(avg(losses));
    return { exp, winRate, n: rs.length };
  }

  /* Aaj ke losses (demo trade log se) */
  function readTodayLosses() {
    const list = asList(Store.get('demo', []), 'trades');
    const today = todayKey();
    return list.filter((t) => {
      if (!t || typeof t !== 'object') return false;
      let d = '';
      if (typeof t.date === 'string') d = t.date.slice(0, 10);
      else if (typeof t.ts === 'number') d = todayKey(new Date(t.ts));
      const r = tradeR(t);
      return d === today && typeof r === 'number' && r < 0;
    }).length;
  }

  /* Course progress — course.js ka CourseEngine use hota hai (agar loaded ho) */
  function courseStats() {
    if (window.CourseEngine && typeof window.CourseEngine.stats === 'function') {
      return window.CourseEngine.stats();
    }
    return { total: 0, done: 0, pct: 0, next: null, gatesTotal: 0, gatesPassed: 0, phases: [] };
  }

  /* ------------------------------------------------------------------
     6) HOME DASHBOARD — UI
     ------------------------------------------------------------------ */
  function statCard(title, valueHtml, subHtml, accent) {
    return '<div class="bg-card border border-slate-800 rounded-2xl p-5 flex flex-col">' +
      '<p class="text-xs uppercase tracking-wider text-slate-400 font-semibold">' + title + '</p>' +
      '<div class="mt-2 text-3xl font-bold ' + (accent || 'text-white') + '">' + valueHtml + '</div>' +
      '<div class="mt-2 text-xs text-slate-400 leading-5">' + subHtml + '</div></div>';
  }

  function renderHome(el) {
    const cs = courseStats();
    const acc = readAccuracy();
    const ex = readExpectancy();
    const losses = readTodayLosses();

    // --- Card 1: Course progress ---
    const progressCard = statCard(
      'Course Progress',
      cs.pct + '%',
      '<div class="h-2 rounded-full bg-slate-800 overflow-hidden mb-2"><div class="h-full bg-bull rounded-full" style="width:' + cs.pct + '%"></div></div>' +
      cs.done + ' / ' + cs.total + ' lessons complete · Gates: ' + cs.gatesPassed + '/' + cs.gatesTotal,
      'text-bull'
    );

    // --- Card 2: Trader Accuracy Rating ---
    let accCard;
    if (acc) {
      const grade = acc.pct >= 80 ? ['Institutional level', 'text-bull']
        : acc.pct >= 60 ? ['Developing — practice jari rakho', 'text-liq']
        : ['Retail mindset — basics dobara dekho', 'text-bear'];
      accCard = statCard('Trader Accuracy Rating', acc.pct + '%',
        '<span class="' + grade[1] + ' font-semibold">' + grade[0] + '</span><br>' + acc.n + ' simulator attempts', grade[1]);
    } else {
      accCard = statCard('Trader Accuracy Rating', '—', 'Abhi simulator ka data nahi. Simulator module (Part 2+) mein drills karo.', 'text-slate-500');
    }

    // --- Card 3: Backtest Expectancy ---
    let expCard;
    if (ex) {
      const pos = ex.exp > 0;
      expCard = statCard('Backtest Expectancy',
        (pos ? '+' : '') + ex.exp.toFixed(2) + 'R',
        (pos ? '<span class="text-bull font-semibold">Positive edge</span>' : '<span class="text-bear font-semibold">Abhi edge nahi — system review karo</span>') +
        '<br>' + ex.n + ' trades' + (ex.winRate !== null ? ' · Win rate ' + Math.round(ex.winRate * 100) + '%' : ''),
        pos ? 'text-bull' : 'text-bear');
    } else {
      expCard = statCard('Backtest Expectancy', '—', 'Backtest ka data nahi. Kam az kam 30 trades ka backtest karo (Tools module).', 'text-slate-500');
    }

    // --- Card 4: Aaj ke losses (daily loss limit) ---
    let lossSub, lossAccent;
    if (losses >= DAILY_LOSS_LIMIT) {
      lossSub = '<span class="text-bear font-semibold">STOP! Daily limit poori. Aaj mazeed trade nahi.</span>';
      lossAccent = 'text-bear';
    } else if (losses === DAILY_LOSS_LIMIT - 1) {
      lossSub = '<span class="text-liq font-semibold">Ehtiyaat: ek aur loss = aaj ka din khatam.</span>';
      lossAccent = 'text-liq';
    } else {
      lossSub = 'Daily limit: ' + DAILY_LOSS_LIMIT + ' losses. Discipline hi asal edge hai.';
      lossAccent = 'text-white';
    }
    const lossCard = statCard('Aaj ke Losses', losses + ' / ' + DAILY_LOSS_LIMIT, lossSub, lossAccent);

    // --- "Agla qadam" button ---
    const next = cs.next;
    const nextBlock = next
      ? '<button type="button" data-act="continue" class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bull text-ink font-semibold hover:bg-emerald-400 transition">▶ Jari rakho: ' + esc(next.label) + '</button>'
      : (cs.total ? '<p class="mt-4 text-bull font-semibold">🎉 Abhi tak ka saara content complete! Agla part jald aayega.</p>' : '');

    // --- Phase roadmap (chhoti list) ---
    const roadmap = (cs.phases || []).map((p) => {
      const icon = p.locked ? '🔒' : (p.gatePassed ? '✅' : (p.done === p.total && p.total ? '🏁' : '📘'));
      return '<li class="flex items-center gap-3 py-2.5">' +
        '<span class="text-lg w-6 text-center">' + icon + '</span>' +
        '<div class="flex-1 min-w-0"><p class="text-sm font-medium ' + (p.locked ? 'text-slate-500' : 'text-slate-200') + ' truncate">' + esc(p.label) + ' — ' + esc(p.title) + '</p>' +
        '<div class="h-1.5 mt-1 rounded-full bg-slate-800 overflow-hidden"><div class="h-full ' + (p.locked ? 'bg-slate-600' : 'bg-bull') + '" style="width:' + (p.total ? Math.round(p.done / p.total * 100) : 0) + '%"></div></div></div>' +
        '<span class="text-xs text-slate-400 shrink-0">' + p.done + '/' + p.total + '</span></li>';
    }).join('');

    el.innerHTML =
      '<div class="max-w-6xl mx-auto space-y-6">' +
        // Header
        '<div class="bg-gradient-to-br from-card to-ink border border-slate-800 rounded-2xl p-6">' +
          '<p class="text-xs uppercase tracking-widest text-liq font-semibold">Home Dashboard</p>' +
          '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">Assalam-o-Alaikum, Trader 👋</h1>' +
          '<p class="text-slate-400 mt-2 text-sm leading-6 max-w-2xl">Retail soch se Institutional soch tak ka safar. Har roz ek lesson, har phase ke baad ek Gate. Jaldi nahi — gehrai.</p>' +
          nextBlock +
        '</div>' +
        // Stats
        '<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">' + progressCard + accCard + expCard + lossCard + '</div>' +
        // Roadmap + Data
        '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">' +
          '<div class="lg:col-span-2 bg-card border border-slate-800 rounded-2xl p-5">' +
            '<h2 class="font-semibold text-white">🗺️ Roadmap</h2>' +
            (roadmap ? '<ul class="mt-2 divide-y divide-slate-800">' + roadmap + '</ul>' : '<p class="text-sm text-slate-500 mt-2">Course data load nahi hua.</p>') +
          '</div>' +
          '<div class="bg-card border border-slate-800 rounded-2xl p-5">' +
            '<h2 class="font-semibold text-white">💾 Data & Backup</h2>' +
            '<p class="text-xs text-slate-400 mt-1 leading-5">Saara data sirf aap ke browser mein save hai. Browser saaf karne se pehle backup zaroor lo.</p>' +
            '<div class="mt-4 grid gap-2">' +
              '<button type="button" data-act="export" class="w-full px-4 py-2 rounded-lg bg-bull/10 text-bull border border-bull/30 hover:bg-bull/20 text-sm font-semibold">⬇ Export Backup (JSON)</button>' +
              '<button type="button" data-act="import" class="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-sm font-semibold">⬆ Import Backup</button>' +
              '<input type="file" accept="application/json,.json" data-file class="hidden">' +
              '<button type="button" data-act="reset" class="w-full px-4 py-2 rounded-lg bg-bear/10 text-bear border border-bear/30 hover:bg-bear/20 text-sm font-semibold">⟲ Reset All</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // Disclaimer
        '<div class="border border-liq/40 bg-liq/5 rounded-2xl p-5">' +
          '<h2 class="font-semibold text-liq">⚠️ Risk Disclaimer</h2>' +
          '<p class="text-sm text-slate-300 mt-2 leading-6">Yeh app sirf <b>taleem (education)</b> ke liye hai — yeh financial advice nahi hai. Trading mein, khaas taur par Leverage ke saath, aap ka poora capital doob sakta hai. Koi bhi strategy guaranteed profit nahi deti. Pehle demo account par practice karo, sirf utna paisa lagao jitna khona bardasht kar sako, aur har trade mein risk management ko pehli tarjeeh do.</p>' +
        '</div>' +
      '</div>';

    /* --- Events --- */
    const fileInput = el.querySelector('[data-file]');
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;

      if (act === 'continue' && next) navigate('course', ...next.route);

      if (act === 'export') {
        Store.exportAll();
        toast('Backup file download ho gayi.', 'success');
      }

      if (act === 'import') fileInput.click();

      if (act === 'reset') {
        const ok = window.confirm('Kya aap waqai SAARA data delete karna chahte ho?\n\nCourse progress, gates, scores, journal — sab khatam ho jayega. Yeh wapas nahi aayega (agar backup nahi liya).');
        if (!ok) return;
        Store.clearAll();
        toast('Saara data reset ho gaya.', 'warn');
        route();
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      Store.importAll(file)
        .then((n) => { toast(n + ' items restore ho gaye.', 'success'); route(); })
        .catch((err) => toast(err.message, 'error'))
        .finally(() => { fileInput.value = ''; });
    });
  }

  /* ------------------------------------------------------------------
     7) START
     ------------------------------------------------------------------ */
  function start() {
    if (started) return;
    started = true;

    document.getElementById('menu-btn').addEventListener('click', openSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

    // Sidebar nav clicks (event delegation)
    document.getElementById('nav').addEventListener('click', (e) => {
      const b = e.target.closest('[data-nav]');
      if (b) navigate(b.dataset.nav);
    });

    window.addEventListener('hashchange', route);
    renderNav();
    route();
  }

  // Home module khud app.js register karta hai (hamesha sab se upar)
  registerModule({ id: 'home', title: 'Home Dashboard', icon: '🏠', order: 0, render: renderHome });

  // Saare scripts load hone ke baad start
  document.addEventListener('DOMContentLoaded', start);

  // Global expose — registerModule ka signature STABLE hai
  window.App = Object.freeze({
    registerModule,
    navigate,
    refresh: route,
    toast,
    esc,
    todayKey,
    get modules() { return modules.map((m) => ({ id: m.id, title: m.title, icon: m.icon })); }
  });
})();
