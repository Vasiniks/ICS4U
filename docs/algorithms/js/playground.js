/* In-browser Python "venv" (Pyodide) + terminal. Lazy-loaded, resizable, no backend.
   Panel lives on the right; terminal sits at its bottom; both adjustable via drag. */
(function () {
  'use strict';

  var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
  var state = {
    pyodide: null, loading: null, packages: [], stdinQueue: [],
    open: null, snippets: {}
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function store(k, v) {
    try {
      if (v === undefined) { var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; }
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }

  /* Default snippets per lesson; lesson code can also push snippets at runtime. */
  var DEFAULT_SNIPPETS = {
    bubble: 'a = [5, 4, 6, 2, 4, 6, 7, 8, 1]\n\ndef bubble_sort(a_list):\n    n = len(a_list)\n    while True:\n        swapped = False\n        for i in range(1, n):\n            if a_list[i-1] > a_list[i]:\n                a_list[i-1], a_list[i] = a_list[i], a_list[i-1]\n                swapped = True\n        n -= 1\n        if not swapped:\n            break\n    return a_list\n\nprint(bubble_sort(a[:]))',
    selection: 'numbers = [8, 8, 18, 13, 36, 0, 2, -2, -5]\n\ndef selection_sort(a):\n    n = len(a)\n    for i in range(n - 1):\n        m = i\n        for j in range(i + 1, n):\n            if a[j] < a[m]:\n                m = j\n        a[i], a[m] = a[m], a[i]\n    return a\n\nprint(selection_sort(numbers[:]))',
    insertion: 'def insertion_sort(a):\n    for i in range(1, len(a)):\n        key = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = key\n    return a\n\nprint(insertion_sort([5, 4, 6, 2, 4, 6, 7, 8, 1]))',
    counting: 'def counting_sort_offset(a):\n    if not a:\n        return []\n    mn, mx = min(a), max(a)\n    cnt = [0] * (mx - mn + 1)\n    for x in a:\n        cnt[x - mn] += 1\n    out = []\n    for i, c in enumerate(cnt):\n        out.extend([i + mn] * c)\n    return out\n\nprint(counting_sort_offset([4, -2, 0, -2, 7]))',
    euclid: 'def gcd_mod(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\nprint(gcd_mod(48, 18))',
    powers: 'def power_fast(x, n):\n    r, base, exp = 1, x, n\n    while exp > 0:\n        if exp % 2 == 1:\n            r *= base\n        base *= base\n        exp //= 2\n    return r\n\nprint(power_fast(2, 10))'
  };

  window.PlaygroundSnippets = state.snippets;

  function termPrint(msg, cls) {
    var term = $('#py-term');
    if (!term) return;
    var line = el('div', 'tline ' + (cls || ''), '');
    line.textContent = msg;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  function setStatus(msg) {
    var s = $('#py-status');
    if (s) s.textContent = msg;
  }

  function loadPyodide() {
    if (state.pyodide) return Promise.resolve(state.pyodide);
    if (state.loading) return state.loading;
    setStatus('Loading Python… (first run downloads ~10MB)');
    state.loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PYODIDE_URL;
      s.onload = function () {
        try {
          window.loadPyodide({ stdin: stdinHandler }).then(function (py) {
            state.pyodide = py;
            setStatus('Python ' + (py.version || '') + ' ready · isolated env');
            termPrint('Python ' + (py.version || '') + ' ready. This is an isolated in-browser env (like a venv).', 'tok');
            resolve(py);
          }, reject);
        } catch (e) { reject(e); }
      };
      s.onerror = function () { reject(new Error('CDN blocked')); };
      document.head.appendChild(s);
    });
    state.loading.catch(function (e) {
      state.loading = null;
      setStatus('Could not load Python (network blocked).');
      termPrint('Could not download Pyodide. Check network / CDN access and retry.', 'err');
    });
    return state.loading;
  }

  function stdinHandler() {
    if (state.stdinQueue.length) return state.stdinQueue.shift();
    return null;
  }

  function runCode() {
    var editor = $('#py-editor');
    var code = editor ? editor.value : '';
    termPrint('$ python lesson.py', 'cmd');
    loadPyodide().then(function (py) {
      try {
        py.setStdin({ stdin: stdinHandler });
        py.setStdout({ batched: function (t) { termPrint(t, ''); } });
        py.setStderr({ batched: function (t) { termPrint(t, 'err'); } });
        var out = py.runPython(code);
        if (out !== undefined) termPrint(String(out), 'tok');
        setStatus('Run finished.');
      } catch (e) {
        var msg = String((e && e.message) || e);
        termPrint(msg, 'err');
        setStatus('Error — see terminal.');
      }
    });
  }

  function installPackage() {
    var inp = $('#py-pkg');
    var name = inp && inp.value ? inp.value.trim() : '';
    if (!name) return;
    termPrint('$ pip install ' + name, 'cmd');
    loadPyodide().then(function (py) {
      setStatus('Installing ' + name + '…');
      py.loadPackage('micropip').then(function () {
        return py.runPythonAsync('import micropip\nawait micropip.install("' + name.replace(/"/g, '') + '")');
      }).then(function () {
        state.packages.push(name);
        store('ics4u-py-pkgs', state.packages);
        termPrint('Installed ' + name, 'tok');
        setStatus(state.packages.length + ' package(s) installed.');
      }, function (e) {
        termPrint('Install failed: ' + String((e && e.message) || e), 'err');
        setStatus('Install failed.');
      });
    });
  }

  function currentSnippetKey() {
    var h = (location.hash || '#overview').replace('#', '');
    if (DEFAULT_SNIPPETS[h]) return h;
    if (h.indexOf('sort-') === 0) {
      var k = h.slice(5);
      if (DEFAULT_SNIPPETS[k]) return k;
    }
    var map = {
      answers: 'euclid', viz: 'bubble', sorts: 'bubble',
      micro: 'insertion', sim: 'counting', quiz: 'bubble', basics: 'powers', bbc: 'euclid'
    };
    return map[h] || 'bubble';
  }

  function loadSnippet(key) {
    var ed = $('#py-editor');
    if (!ed) return;
    var code = state.snippets[key] || DEFAULT_SNIPPETS[key] || DEFAULT_SNIPPETS.bubble;
    ed.value = code;
    store('ics4u-py-code', code);
    var sel = $('#py-snippet');
    if (sel) sel.value = key;
    setStatus('Snippet: ' + key);
  }

  function buildDock() {
    if ($('#ide-dock')) return;
    var dock = el('aside', 'ide-dock', '');
    dock.id = 'ide-dock';
    dock.setAttribute('aria-label', 'Python playground');
    dock.innerHTML =
      '<div class="ide-grip" id="ide-grip" title="Drag to resize"></div>'
      + '<div class="ide-head"><strong>Python venv</strong><span class="ide-sub">in-browser · Pyodide</span>'
      + '<span class="ide-spacer"></span>'
      + '<button class="btn ghost sm" id="py-run">Run</button>'
      + '<button class="btn ghost sm" id="py-clear">Clear</button>'
      + '<button class="btn ghost sm" id="ide-close">Hide</button></div>'
      + '<div class="ide-row"><select id="py-snippet" aria-label="Snippet"></select></div>'
      + '<textarea id="py-editor" spellcheck="false" aria-label="Python editor"></textarea>'
      + '<div class="ide-pkg"><input id="py-pkg" placeholder="pip install … (e.g. numpy)" aria-label="Package name">'
      + '<button class="btn ghost sm" id="py-install">Install</button></div>'
      + '<div class="ide-tgrip" id="ide-tgrip" title="Drag to resize terminal"></div>'
      + '<div class="ide-termhead"><span>Terminal</span><span id="py-status">Not loaded yet.</span></div>'
      + '<div class="ide-termin"><div id="py-term" aria-live="polite"></div>'
      + '<div class="ide-stdin"><span>&gt;&gt;&gt;</span><input id="py-stdin" placeholder="type input() text + Enter" aria-label="stdin"></div></div>';
    document.body.appendChild(dock);

    var sel = dock.querySelector('#py-snippet');
    Object.keys(DEFAULT_SNIPPETS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = k;
      sel.appendChild(o);
    });

    var saved = store('ics4u-py-code');
    dock.querySelector('#py-editor').value = saved || DEFAULT_SNIPPETS.bubble;
    sel.value = currentSnippetKey();

    dock.querySelector('#py-run').addEventListener('click', runCode);
    dock.querySelector('#py-clear').addEventListener('click', function () {
      var t = $('#py-term'); if (t) t.innerHTML = '';
    });
    dock.querySelector('#ide-close').addEventListener('click', toggleDock);
    dock.querySelector('#py-install').addEventListener('click', installPackage);
    sel.addEventListener('change', function () { loadSnippet(sel.value); });
    dock.querySelector('#py-stdin').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value !== '') {
        state.stdinQueue.push(this.value + '\n');
        termPrint(this.value, 'cmd');
        this.value = '';
      }
    });

    // Adjustable width (drag vertical grip)
    var grip = dock.querySelector('#ide-grip');
    grip.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      var startX = e.clientX;
      var startW = dock.getBoundingClientRect().width;
      function move(ev) {
        var w = Math.min(760, Math.max(280, startW + (startX - ev.clientX)));
        dock.style.width = w + 'px';
        try { document.body.style.setProperty('--ide-w', w + 'px'); } catch (_e) {}
      }
      function up() {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        store('ics4u-ide-w', dock.getBoundingClientRect().width);
      }
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });

    // Adjustable terminal height (drag horizontal grip)
    var tg = dock.querySelector('#ide-tgrip');
    tg.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      tg.setPointerCapture(e.pointerId);
      var term = dock.querySelector('.ide-termin');
      var startY = e.clientY, startH = term.getBoundingClientRect().height;
      function move(ev) {
        var h = Math.min(420, Math.max(80, startH + (startY - ev.clientY)));
        term.style.height = h + 'px';
      }
      function up() {
        tg.removeEventListener('pointermove', move);
        tg.removeEventListener('pointerup', up);
        store('ics4u-term-h', dock.querySelector('.ide-termin').getBoundingClientRect().height);
      }
      tg.addEventListener('pointermove', move);
      tg.addEventListener('pointerup', up);
    });

    // Restore sizes
    var w = store('ics4u-ide-w');
    if (w) { dock.style.width = Math.min(760, Math.max(280, w)) + 'px'; try { document.body.style.setProperty('--ide-w', dock.style.width); } catch (_e) {} }
    var th = store('ics4u-term-h');
    if (th) dock.querySelector('.ide-termin').style.height = Math.min(420, Math.max(80, th)) + 'px';

    var pkgs = store('ics4u-py-pkgs');
    if (pkgs && pkgs.length) {
      state.packages = pkgs;
      setStatus(pkgs.length + ' package(s) installed earlier (reinstall on load).');
    }

    window.addEventListener('hashchange', function () {
      if (!state.pyodide) loadSnippet(currentSnippetKey());
    });
  }

  function toggleDock(force) {
    buildDock();
    var dock = $('#ide-dock');
    var show = force !== undefined ? force : dock.classList.contains('ide-hidden');
    dock.classList.toggle('ide-hidden', !show);
    document.body.classList.toggle('ide-open', show);
    store('ics4u-ide-open', show);
    if (show) loadSnippet(currentSnippetKey());
  }

  window.IdeDock = { toggle: toggleDock, run: runCode, snippet: loadSnippet };

  document.addEventListener('DOMContentLoaded', function () {
    buildDock();
    var open = store('ics4u-ide-open');
    toggleDock(open === null ? true : !!open);
    // "Run this code" buttons inside lesson <details>
    document.querySelectorAll('pre.trace, pre.code').forEach(function (pre) {
      if (pre.parentElement && pre.parentElement.tagName === 'DETAILS') return;
    });
  });
})();
