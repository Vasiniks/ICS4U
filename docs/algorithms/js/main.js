// main.js — focused-view router, per-topic chips, run-in-venv buttons.
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function decodeEntities(s){
  var t = document.createElement('textarea');
  t.innerHTML = s;
  return t.value;
}

function renderSortCards() {
  const container = document.getElementById('sorts-container');
  if (!container || container.dataset.done) return;
  container.dataset.done = '1';
  SORT_ORDER.forEach(k => {
    const s = SORTS[k];
    const card = document.createElement('div');
    card.className = 'sort-card';
    card.id = 'sort-' + k;
    card.dataset.sort = k;
    card.innerHTML = `
      <div class="head">
        <h3 style="margin:0">${s.name}</h3>
        <div>
          <span class="badge cat">${s.category}</span>
          <span class="badge">${s.stability}</span>
          <span class="badge">${s.inPlace}</span>
        </div>
      </div>
      <p style="color:var(--ink-2)">${s.tagline}</p>
      <p>${s.description}</p>
      <h4>Complexity</h4>
      <table class="complexity">
        <tr><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th><th>In-place</th><th>Adaptive</th></tr>
        <tr>
          <td><code>${s.best}</code></td><td><code>${s.avg}</code></td><td><code>${s.worst}</code></td><td><code>${s.space}</code></td>
          <td>${s.stability}</td><td>${s.inPlace}</td><td>${s.adaptive}</td>
        </tr>
      </table>
      <details><summary>Pseudocode</summary><pre class="code">${esc(s.pseudo)}</pre></details>
      <details class="pyblock"><summary>Python — run it in the venv</summary><pre class="code">${esc(s.code)}</pre></details>
      <h4>Micro-optimizations</h4>
      <div class="opt-list">${s.micro.map(m=>`<div class="opt-item"><p>${m}</p></div>`).join('')}</div>
    `;
    container.appendChild(card);
  });
}

function renderMicro() {
  const el = document.getElementById('micro-global');
  if (!el || el.dataset.done) return;
  el.dataset.done = '1';
  const items = [
    {h:'Avoid swaps when possible', p:'Swaps cost 3 writes; use shifts (insertion) or index moves. Count writes, not just comparisons.'},
    {h:'Cache locality', p:'Sequential access (merge, counting) beats random access (heapsort) on modern CPUs despite same Big-O.'},
    {h:'Branch prediction', p:'Sorted or nearly-sorted data makes branches predictable; random data causes mispredictions. Timsort exploits runs.'},
    {h:'SIMD / vectorization', p:'Compare multiple elements per instruction (std::sort uses introsort + insertion; library sorts are highly tuned).'},
    {h:'Parallelism', p:'Merge sort parallelizes cleanly; quicksort with parallel partitions; use thread pools for large n.'},
    {h:'Hybrid sorts', p:'Introsort (quicksort→heapsort→insertionsort) and Timsort (mergesort+insertionsort+galloping) dominate in practice.'},
    {h:'Small-array cutoff', p:'Switch to insertion sort below ~32-64 elements to reduce overhead.'},
    {h:'Measure, don\'t guess', p:'Profile on representative data; constants and cache effects dominate Big-O at real sizes.'}
  ];
  el.innerHTML = items.map(i=>`<div class="opt-item"><h5>${i.h}</h5><p>${i.p}</p></div>`).join('');
}

function renderSimTable() {
  const el = document.getElementById('sim-table');
  if (!el || el.dataset.done) return;
  el.dataset.done = '1';
  const rows = [
    ['Bubble','Comparison','Stable','Yes','Yes','O(n²)','O(n)','O(1)','Tiny/teaching; nearly-sorted with flag'],
    ['Selection','Comparison','No*','Yes','No','O(n²)','O(n²)','O(1)','Few writes; small arrays'],
    ['Insertion','Comparison','Stable','Yes','Yes','O(n²)','O(n)','O(1)','Small or nearly-sorted runs'],
    ['Merge','Comparison (D&C)','Stable','No','No','O(n log n)','O(n log n)','O(n)','Linked lists, stable needs, external'],
    ['Quick','Comparison (D&C)','No','Yes','No','O(n²)','O(n log n)','O(log n)','General purpose, cache-friendly'],
    ['Heap','Comparison','No','Yes','No','O(n log n)','O(n log n)','O(1)','Guaranteed worst case, low memory'],
    ['Shell','Comparison','No','Yes','Yes*','O(n²)','O(n^1.3)','O(1)','Medium arrays, embedded'],
    ['Counting','Non-comparison','Stable*','No','No','O(n+k)','O(n+k)','O(k)','Integers, small range'],
    ['Radix','Non-comparison','Stable','No','No','O(d(n+k))','O(d(n+k))','O(n+k)','Fixed-width integers/strings']
  ];
  const head = ['Algorithm','Type','Stable','In-place','Adaptive','Worst','Avg/Best','Space','Best for'];
  let html = '<table class="cmp"><thead><tr>'+head.map(h=>`<th>${h}</th>`).join('')+'</tr></thead><tbody>';
  rows.forEach(r => { html += '<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>'; });
  html += '</tbody></table>';
  el.innerHTML = html;
}

/* ---------- focused views: one section at a time ---------- */
var VIEWS = [
  {id:'overview', label:'Overview', hint:'Start here · 2 min'},
  {id:'bbc', label:'BBC documentary', hint:'The 58-minute film in 5 minutes'},
  {id:'basics', label:'Basics', hint:'Vocabulary for the evaluation'},
  {id:'sorts', label:'How each sort works', hint:'One sort at a time'},
  {id:'answers', label:'Homework answers', hint:'One prompt at a time'},
  {id:'micro', label:'Micro-optimizations', hint:'The marks are here'},
  {id:'viz', label:'Visualize', hint:'Watch it run'},
  {id:'sim', label:'Similarities & differences', hint:'Compare side by side'},
  {id:'quiz', label:'Practice quiz', hint:'48 questions'}
];

function viewEl(id) {
  if (id === 'overview') return document.querySelector('#view > header.hero');
  return document.getElementById(id);
}

function store(k, v) {
  try {
    if (v === undefined) { var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; }
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) { return null; }
}

function currentView() {
  var h = (location.hash || '#overview').replace('#','').split('/')[0];
  if (!viewEl(h)) return 'overview';
  return h;
}

function markVisited(id) {
  var v = store('ics4u-visited') || {};
  v[id] = true;
  store('ics4u-visited', v);
}

function route() {
  var id = currentView();
  VIEWS.forEach(function (v) {
    var n = viewEl(v.id);
    if (n) n.hidden = (v.id !== id);
  });
  // sidebar highlight
  document.querySelectorAll('.nav a[data-route]').forEach(function (a) {
    if (a.getAttribute('data-route') === id) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  var title = document.querySelector('.topbar-title');
  var meta = VIEWS.filter(function(v){return v.id===id;})[0];
  if (title && meta) title.textContent = meta.label;
  markVisited(id);
  renderPager(id);
  window.scrollTo(0, 0);
}

function renderPager(id) {
  var idx = VIEWS.findIndex(function(v){return v.id===id;});
  var host = viewEl(id);
  if (!host) return;
  var old = host.querySelector(':scope > .view-pager');
  if (old) old.remove();
  var pager = document.createElement('div');
  pager.className = 'view-pager';
  var prev = VIEWS[idx-1], next = VIEWS[idx+1];
  pager.innerHTML =
    '<span class="vp-progress">' + (idx+1) + ' of ' + VIEWS.length + ' · ' + VIEWS[idx].hint + '</span>'
    + '<span class="vp-btns">'
    + (prev ? '<a class="btn ghost sm" href="#' + prev.id + '">← ' + prev.label + '</a>' : '')
    + (next ? '<a class="btn sm" href="#' + next.id + '">' + next.label + ' →</a>' : '<a class="btn sm" href="../">All units →</a>')
    + '</span>';
  host.appendChild(pager);
}

/* ---------- one-card-at-a-time chips for sorts + answers ---------- */
function chipRow(cards, getLabel, storageKey) {
  var row = document.createElement('div');
  row.className = 'chip-row';
  row.setAttribute('role', 'tablist');
  var saved = store(storageKey);
  cards.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'fchip';
    b.textContent = getLabel(c, i);
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { select(i); });
    row.appendChild(b);
  });
  function select(i) {
    cards.forEach(function (c, j) { c.hidden = (i !== j); });
    Array.prototype.forEach.call(row.children, function (b, j) {
      b.setAttribute('aria-pressed', String(i === j));
    });
    store(storageKey, i);
  }
  select(Math.min(saved || 0, cards.length - 1));
  return {row: row, select: select};
}

function initChips() {
  // sorts
  var sc = document.getElementById('sorts-container');
  if (sc && !sc.dataset.chipped) {
    sc.dataset.chipped = '1';
    var cards = Array.prototype.slice.call(sc.querySelectorAll('.sort-card'));
    var chips = chipRow(cards, function (c) {
      return c.querySelector('.head h3') ? c.querySelector('.head h3').textContent.replace(' Sort','') : c.id;
    }, 'ics4u-sort-idx');
    sc.parentElement.insertBefore(chips.row, sc);
    var note = document.createElement('p');
    note.className = 'chip-note';
    note.textContent = 'One sort at a time — pick a chip. Nothing was removed.';
    sc.parentElement.insertBefore(note, sc);
  }
  // answers
  var ans = document.querySelector('#answers .container');
  if (ans && !ans.dataset.chipped) {
    ans.dataset.chipped = '1';
    var cards2 = Array.prototype.slice.call(ans.querySelectorAll('.answer-card'));
    var labels = ['Euclid GCD', 'Powers', 'Bubble ×4', 'Selection', 'Insertion', 'Counting', 'Checklist'];
    var chips2 = chipRow(cards2, function (c, i) { return labels[i] || ('Q' + (i+1)); }, 'ics4u-ans-idx');
    var lead = ans.querySelector('.lead');
    lead.parentElement.insertBefore(chips2.row, lead.nextSibling);
  }
}

/* ---------- Run-in-venv buttons on every Python block ---------- */
function initRunButtons() {
  document.querySelectorAll('#view details.pyblock, #view details').forEach(function (d) {
    var sum = d.querySelector('summary');
    var pre = d.querySelector('pre');
    if (!sum || !pre) return;
    if (!/python/i.test(sum.textContent)) return;
    if (d.querySelector('.run-venv')) return;
    var btn = document.createElement('button');
    btn.className = 'btn sm run-venv';
    btn.textContent = 'Run in venv ▶';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var code = decodeEntities(pre.innerHTML)
        .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
      var ed = document.getElementById('py-editor');
      if (ed) { ed.value = code; try{localStorage.setItem('ics4u-py-code', JSON.stringify(code));}catch(_){} }
      if (window.IdeDock) window.IdeDock.toggle(true);
      setTimeout(function(){ if (window.IdeDock) window.IdeDock.run(); }, 350);
    });
    sum.appendChild(document.createTextNode(' '));
    sum.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSortCards();
  renderMicro();
  renderSimTable();
  if (window.Detail) window.Detail.inject();
  initChips();
  initRunButtons();
  Viz.init();
  Race.init();
  Quiz.init();
  // code toggle for the dock (added by router shell)
  var tgl = document.getElementById('ide-toggle');
  if (tgl) tgl.addEventListener('click', function(){ if (window.IdeDock) window.IdeDock.toggle(); });
  window.addEventListener('hashchange', route);
  route();
});
