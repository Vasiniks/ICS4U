// main.js
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function renderSortCards() {
  const container = document.getElementById('sorts-container');
  SORT_ORDER.forEach(k => {
    const s = SORTS[k];
    const card = document.createElement('div');
    card.className = 'sort-card';
    card.id = 'sort-' + k;
    card.innerHTML = `
      <div class="head">
        <h3 style="margin:0">${s.name}</h3>
        <div>
          <span class="badge cat">${s.category}</span>
          <span class="badge">${s.stability}</span>
          <span class="badge">${s.inPlace}</span>
        </div>
      </div>
      <p style="color:var(--muted)">${s.tagline}</p>
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
      <details><summary>Python</summary><pre class="code">${esc(s.code)}</pre></details>
      <h4>Micro-optimizations</h4>
      <div class="opt-list">${s.micro.map(m=>`<div class="opt-item"><p>${m}</p></div>`).join('')}</div>
    `;
    container.appendChild(card);
  });
}

function renderMicro() {
  const el = document.getElementById('micro-global');
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

document.addEventListener('DOMContentLoaded', () => {
  renderSortCards();
  renderMicro();
  renderSimTable();
  Viz.init();
  Race.init();
  Quiz.init();

  // smooth nav highlight
  document.querySelectorAll('nav.top a').forEach(a => {
    a.addEventListener('click', e => {
      // allow default anchor
    });
  });
});
