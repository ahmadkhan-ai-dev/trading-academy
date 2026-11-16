/* =====================================================================
   store.js — LocalStorage wrapper (Institutional Trading Academy)
   ---------------------------------------------------------------------
   Har key ke aage "ita_" prefix lagta hai taake browser mein doosri apps
   ke data se takraav na ho.

   PUBLIC API (STABLE — future files isi par depend karti hain, mat badlo):
     Store.get(key, defaultValue)  -> saved value ya defaultValue
     Store.set(key, value)         -> true/false (save hua ya nahi)
     Store.remove(key)             -> ek key delete
     Store.keys()                  -> saari "ita_" keys (prefix ke baghair)
     Store.exportAll()             -> poore data ka JSON backup download
     Store.importAll(file)         -> Promise<number> (kitni keys restore huin)
     Store.clearAll()              -> saari "ita_" keys delete (Reset)

   Known keys: course_progress, gates, setups, sim_scores, backtest,
               demo, calc, flashcards
   ===================================================================== */
(function () {
  'use strict';

  const PREFIX = 'ita_';
  const BACKUP_APP = 'institutional-trading-academy'; // backup file ki pehchan
  const BACKUP_VERSION = 1;

  /* ---------------------------------------------------------------
     Backend: asli localStorage, ya agar woh blocked ho (private mode,
     file:// restrictions) to ek in-memory fallback taake app crash na ho.
     --------------------------------------------------------------- */
  const backend = (function () {
    try {
      const t = '__ita_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return window.localStorage;
    } catch (e) {
      console.warn('[Store] localStorage available nahi — memory fallback use ho raha hai.');
      const mem = {};
      return {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null),
        setItem: (k, v) => { mem[k] = String(v); },
        removeItem: (k) => { delete mem[k]; },
        key: (i) => Object.keys(mem)[i] || null,
        get length() { return Object.keys(mem).length; }
      };
    }
  })();

  /* Key ke aage prefix lagao (agar pehle se laga ho to dobara nahi). */
  function fullKey(key) {
    key = String(key);
    return key.indexOf(PREFIX) === 0 ? key : PREFIX + key;
  }

  /* Value parho. JSON parse fail ho ya key na ho to defaultValue wapas. */
  function get(key, defaultValue) {
    try {
      const raw = backend.getItem(fullKey(key));
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Store] corrupt value for', key, e);
      return defaultValue;
    }
  }

  /* Value save karo (JSON mein). Quota full ho to false wapas. */
  function set(key, value) {
    try {
      backend.setItem(fullKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[Store] save fail:', key, e);
      return false;
    }
  }

  /* Ek key delete karo. */
  function remove(key) {
    try { backend.removeItem(fullKey(key)); } catch (e) { /* ignore */ }
  }

  /* Saari ita_ keys ki list (prefix hata kar). */
  function keys() {
    const out = [];
    for (let i = 0; i < backend.length; i++) {
      const k = backend.key(i);
      if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
    }
    return out;
  }

  /* Saara app data delete karo (sirf ita_ keys — baqi browser data safe). */
  function clearAll() {
    keys().forEach(remove);
  }

  /* Aaj ki date YYYY-MM-DD (backup file ke naam ke liye). */
  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* Poora data ek JSON file mein download karo. */
  function exportAll() {
    const data = {};
    keys().forEach((k) => { data[k] = get(k, null); });

    const payload = {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ita-backup-' + today() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // memory free karo
    return payload;
  }

  /* Backup file se data wapas laao.
     - Pehle file validate hoti hai; ghalat file par purana data safe rehta hai.
     - Valid file par purana data clear karke backup ka data likha jata hai.
     Returns: Promise<number> = restore hone wali keys ki ginti. */
  function importAll(file) {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error('Koi file select nahi hui.')); return; }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File parhi nahi ja saki.'));
      reader.onload = () => {
        let payload;
        try {
          payload = JSON.parse(reader.result);
        } catch (e) {
          reject(new Error('Yeh valid JSON file nahi hai.'));
          return;
        }

        // Pehchan check: sirf isi app ka backup qubool hai
        if (!payload || payload.app !== BACKUP_APP || typeof payload.data !== 'object' || payload.data === null) {
          reject(new Error('Yeh Trading Academy ki backup file nahi lagti.'));
          return;
        }

        clearAll(); // backup = poori state, is liye pehle purana saaf
        let count = 0;
        Object.keys(payload.data).forEach((k) => {
          const clean = k.indexOf(PREFIX) === 0 ? k.slice(PREFIX.length) : k;
          if (set(clean, payload.data[k])) count++;
        });
        resolve(count);
      };
      reader.readAsText(file);
    });
  }

  // Global expose (future files Store.* hi call karengi)
  window.Store = Object.freeze({
    get, set, remove, keys, clearAll, exportAll, importAll, PREFIX
  });
})();
