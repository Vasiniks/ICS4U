/* Extreme-detail collapsibles, injected into sort cards + answer cards.
   No deletions: everything is collapsed by default. */
(function () {
  'use strict';

  var SORT_DEEP = {
    bubble: {
      title: 'Extreme detail · Bubble Sort on [5, 2, 4]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Walk left to right comparing neighbours. Whenever the left one is bigger, swap. The biggest value you meet keeps moving right, so after one full pass it sits at the very end and never needs to be touched again. Repeat on a shorter and shorter prefix.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Pass</th><th>Compare</th><th>Action</th><th>Array after</th></tr></thead><tbody>'
        + '<tr><td>1</td><td>5 vs 2</td><td>5 &gt; 2, swap</td><td>[2, 5, 4]</td></tr>'
        + '<tr><td>1</td><td>5 vs 4</td><td>5 &gt; 4, swap</td><td>[2, 4, 5] — 5 is final</td></tr>'
        + '<tr><td>2</td><td>2 vs 4</td><td>in order, nothing</td><td>[2, 4, 5] — done</td></tr>'
        + '</tbody></table>'
        + '<h5>Loop invariant (say this on the test)</h5>'
        + '<p>After pass <em>k</em>, the last <em>k</em> positions hold the <em>k</em> largest values in sorted order. That is why the bound shrinks: those cells are finished.</p>'
        + '<h5>Exact cost</h5>'
        + '<p>Pass lengths (n−1) + (n−2) + … + 1 = n(n−1)/2 comparisons — always, unless the swapped flag exits early. Swaps ≤ comparisons (one per inversion removed). Sorted input with flag: exactly n−1 comparisons, 0 swaps → O(n).</p>'
        + '<h5>Why the flag matters</h5>'
        + '<p>A full pass with zero swaps proves no adjacent pair is inverted, which proves the whole list is sorted. Variants A2/A3 skip the flag, so they pay all (N−1)² steps even on sorted input.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Stability needs strict <code>&gt;</code>, not <code>≥</code>. With <code>≥</code>, equal neighbours would swap pointlessly and flip their original order.</p>'
    },
    selection: {
      title: 'Extreme detail · Selection Sort on [5, 2, 4]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Grow a sorted prefix one slot at a time. For position <code>i</code>, scan everything from <code>i</code> rightward, remember where the minimum lives, then swap it into <code>i</code>. One swap per pass — that is the whole personality of this sort.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>i</th><th>Scan</th><th>Min</th><th>Swap → array</th></tr></thead><tbody>'
        + '<tr><td>0</td><td>5, 2, 4</td><td>2 at index 1</td><td>swap 0↔1 → [2, 5, 4]</td></tr>'
        + '<tr><td>1</td><td>5, 4</td><td>4 at index 2</td><td>swap 1↔2 → [2, 4, 5]</td></tr>'
        + '</tbody></table>'
        + '<h5>Loop invariant</h5>'
        + '<p>After iteration <em>i</em>, positions [0..i] are sorted and every one of them is ≤ everything in [i+1..]. The prefix is final — you never revisit it.</p>'
        + '<h5>Exact cost</h5>'
        + '<p>Comparisons are fixed: n(n−1)/2, sorted or not — there is no early exit. Swaps are at most n−1. That trade (many reads, few writes) is why selection wins when writes are expensive, e.g. flash memory.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Standard in-place selection is <strong>not stable</strong>. Counter-example: [2<sub>a</sub>, 2<sub>b</sub>, 1] → the 1 swaps with 2<sub>a</sub> → [1, 2<sub>b</sub>, 2<sub>a</sub>]. The equal 2s flipped order.</p>'
    },
    insertion: {
      title: 'Extreme detail · Insertion Sort on [5, 2, 4]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Keep a sorted hand of cards. Pick up the next card and slide it left past every bigger card until its slot opens. Nothing is ever swapped — bigger cards shift one step right, then the new card drops into the gap.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>i</th><th>Key</th><th>Shifts</th><th>Array after</th></tr></thead><tbody>'
        + '<tr><td>1</td><td>2</td><td>5 shifts right</td><td>[2, 5, 4]</td></tr>'
        + '<tr><td>2</td><td>4</td><td>5 shifts right, 2 stays</td><td>[2, 4, 5]</td></tr>'
        + '</tbody></table>'
        + '<h5>Loop invariant</h5>'
        + '<p>After iteration <em>i</em>, positions [0..i] are sorted. The prefix only ever grows — but unlike selection, later inserts can still move early elements (by shifting, not by re-scanning).</p>'
        + '<h5>Exact cost</h5>'
        + '<p>Sorted input: n−1 comparisons, 0 shifts → O(n) — it just checks each card against its neighbour. Reversed input: n(n−1)/2 shifts → O(n²). Each element moves at most once per pass (1 write per shift + 1 insert), versus 3 writes per swap.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Insertion is <strong>online</strong> (handles a stream — sort as values arrive) and <strong>adaptive</strong> (fast on nearly-sorted data). That is exactly why Timsort and Introsort use it for runs under ~32–64 elements.</p>'
    },
    merge: {
      title: 'Extreme detail · Merge Sort on [5, 2, 4]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Split the list in half, sort each half the same way, then zip the two sorted halves together by always taking the smaller front card. Splitting is trivial; all the work is the merge.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Step</th><th>What happens</th></tr></thead><tbody>'
        + '<tr><td>split</td><td>[5, 2, 4] → [5] + [2, 4]</td></tr>'
        + '<tr><td>sort right</td><td>[2, 4] → split → [2] + [4] → merge → [2, 4]</td></tr>'
        + '<tr><td>merge</td><td>5 vs 2 → take 2; 5 vs 4 → take 4; take 5 → [2, 4, 5]</td></tr>'
        + '</tbody></table>'
        + '<h5>Why the merge uses ≤</h5>'
        + '<p>When fronts are equal, taking from the <em>left</em> half first keeps equal elements in their original relative order. That single character is the entire stability proof.</p>'
        + '<h5>Exact cost</h5>'
        + '<p>log₂n levels, each level merges all n elements once → O(n log n) in every case — best, average, worst. Price: the auxiliary array, O(n) extra memory, plus sequential (cache-friendly) access.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Merge sort is the answer for linked lists (no random access needed, stable) and external sorting (sort chunks on disk, k-way merge). In-place merge exists but has bad constants — standard merge uses the extra array.</p>'
    },
    quick: {
      title: 'Extreme detail · Quick Sort on [5, 2, 4] (Lomuto, pivot = last)',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Pick a pivot, then sweep left to right dealing every card ≤ pivot to a growing “small” pile. Drop the pivot right after that pile and recurse on both sides. No merging step — placement is final at partition time.</p>'
        + '<h5>Trace it cell by cell (pivot 4)</h5>'
        + '<table><thead><tr><th>j</th><th>Card</th><th>Action</th><th>Array</th></tr></thead><tbody>'
        + '<tr><td>0</td><td>5</td><td>5 &gt; 4, skip</td><td>[5, 2, 4]</td></tr>'
        + '<tr><td>1</td><td>2</td><td>2 ≤ 4, swap 0↔1</td><td>[2, 5, 4]</td></tr>'
        + '<tr><td>end</td><td>pivot</td><td>swap 1↔2</td><td>[2, 4, 5] — pivot final at 1</td></tr>'
        + '</tbody></table>'
        + '<h5>Why it can collapse</h5>'
        + '<p>With the last element as pivot on already-sorted input, partitions are 0 and n−1 every time → O(n²). Fixes: random pivot, median-of-three, and Introsort’s guard (hand control to heapsort past 2·log₂n depth).</p>'
        + '<h5>Exact cost</h5>'
        + '<p>Average O(n log n) with tiny constants and sequential-ish scans — that is why it beats merge/heap in practice on random arrays despite the worse worst case. Stack is O(log n) if you recurse on the smaller side and loop on the larger.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>3-way (Dutch-flag) partition groups equal keys together — the fix when the input has many duplicates. Standard quicksort is not stable (equal keys scatter across partitions).</p>'
    },
    heap: {
      title: 'Extreme detail · Heap Sort on [5, 2, 4]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Rearrange the array into a max-heap (every parent ≥ its children — the max sits at index 0). Then repeat: swap the root with the last unsorted slot (that max is now final) and sift the new root down. The sorted suffix grows from the right.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Phase</th><th>What happens</th></tr></thead><tbody>'
        + '<tr><td>build</td><td>[5, 2, 4] is already a max-heap (5 ≥ 2, 5 ≥ 4)</td></tr>'
        + '<tr><td>extract</td><td>swap 0↔2 → [4, 2 | 5]; sift: 4 ≥ 2, heap ok</td></tr>'
        + '<tr><td>extract</td><td>swap 0↔1 → [2 | 4, 5] — done → [2, 4, 5]</td></tr>'
        + '</tbody></table>'
        + '<h5>Exact cost</h5>'
        + '<p>Bottom-up heap build is O(n) — not n insertions. Each of the n−1 extractions sifts O(log n) → O(n log n) guaranteed, O(1) extra space. Catch: sift-down jumps around the array (poor cache locality), so it usually loses to quicksort on random data.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Heap sort is Introsort’s emergency brake: when quicksort recurses deeper than 2·log₂n, control passes to heapsort to guarantee O(n log n). Not stable (a far equal can jump over a near equal during sifts).</p>'
    },
    shell: {
      title: 'Extreme detail · Shell Sort on [5, 1, 4, 2] (gaps 2 → 1)',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Insertion sort, but compare elements a <em>gap</em> apart instead of neighbours. Big gaps teleport small values near the front in one move; shrink the gap and repeat; the final gap-1 pass is plain insertion on nearly-sorted data.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Gap</th><th>i</th><th>Action</th><th>Array</th></tr></thead><tbody>'
        + '<tr><td>2</td><td>2</td><td>temp 4, 5 &gt; 4 → shift</td><td>[4, 1, 5, 2]</td></tr>'
        + '<tr><td>2</td><td>3</td><td>temp 2, 1 &lt; 2 → stay</td><td>[4, 1, 5, 2]</td></tr>'
        + '<tr><td>1</td><td>—</td><td>insertion pass</td><td>[1, 2, 4, 5]</td></tr>'
        + '</tbody></table>'
        + '<h5>Why gaps matter</h5>'
        + '<p>The gap sequence decides the complexity (halving ≈ O(n²) worst; Hibbard ≈ O(n³ᐟ²; Sedgewick better). Each pass leaves the array “gap-sorted”, so the final insertion pass does almost no work.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Shell sort is adaptive in a gap-dependent way and in-place O(1) — good for embedded/medium arrays — but not stable: a far equal can leapfrog a near equal across a gap.</p>'
    },
    counting: {
      title: 'Extreme detail · Counting Sort on [2, 0, 2, 1]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Don’t compare — count. Tally how many of each value exist, turn tallies into starting positions (prefix sums), then deal every element straight to its final slot. One counting pass, one writing pass: linear time.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Step</th><th>State</th></tr></thead><tbody>'
        + '<tr><td>count</td><td>cnt = [1, 1, 2] (one 0, one 1, two 2s)</td></tr>'
        + '<tr><td>prefix</td><td>cnt = [1, 2, 4] (positions)</td></tr>'
        + '<tr><td>place right→left</td><td>1→1, 2→3, 0→0, 2→2 → [0, 1, 2, 2]</td></tr>'
        + '</tbody></table>'
        + '<h5>Why right-to-left</h5>'
        + '<p>Placing from the right into prefix-sum positions keeps equal elements in input order — that is the stability proof, and radix sort depends on it.</p>'
        + '<h5>Exact cost</h5>'
        + '<p>O(n + k) time, O(k) extra. Beats the Ω(n log n) comparison bound by using key structure — only valid for integer keys in a known range. Negatives? shift by min (index = value − min). Sparse huge range (6000–7000)? the same offset trick shrinks 7001 slots to 1001.</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Floats can never be indexes — map distinct values to indexes with a dict (the money solution: 8 bills → 8 counters). If k ≫ n, switch back to a comparison sort.</p>'
    },
    radix: {
      title: 'Extreme detail · Radix Sort on [170, 45, 75]',
      html: ''
        + '<h5>The 60-second story</h5>'
        + '<p>Sort digit by digit from the least significant digit upward, using stable counting sort per digit. After the ones pass the numbers are ordered by ones; the tens pass (stable) refines that; the hundreds pass finishes the job.</p>'
        + '<h5>Trace it cell by cell</h5>'
        + '<table><thead><tr><th>Pass</th><th>Digit</th><th>Result</th></tr></thead><tbody>'
        + '<tr><td>ones</td><td>0, 5, 5</td><td>[170, 45, 75] (45 stays before 75 — stable)</td></tr>'
        + '<tr><td>tens</td><td>7, 4, 7</td><td>[45, 75, 170]</td></tr>'
        + '<tr><td>hundreds</td><td>0, 0, 1</td><td>[45, 75, 170] — done</td></tr>'
        + '</tbody></table>'
        + '<h5>Exact cost</h5>'
        + '<p>d passes × O(n + b) counting work = O(d(n + b)) for base b. LSD is simple and stable; MSD can quit early on prefixes but needs buffering (American flag sort = in-place MSD).</p>'
        + '<h5>Exam trap</h5>'
        + '<p>Radix only works on fixed-width keys (ints, equal-length strings). Variable-length strings must be padded first, and the per-digit sort must be stable or higher passes destroy lower-pass order.</p>'
    }
  };

  var ANSWER_DEEP = {
    'ans-euclid': {
      title: 'Exam script · 30-second answer',
      html: '<p><strong>Similarity:</strong> both compute GCD(a, b) with the same loop invariant and the same result. <strong>Difference:</strong> mod jumps many subtractions at once — O(log min(a,b)) steps; subtractive peels one at a time — O(max(a,b)) worst case. Evidence: gcd(1000, 1) is 1 mod-step versus 999 subtractions. The floor tiles show it: a strip versus a single row.</p>'
    },
    'ans-powers': {
      title: 'Exam script · 30-second answer',
      html: '<p><strong>Similarity:</strong> both compute xⁿ for n ≥ 1 with multiply-only loops. <strong>Difference:</strong> naive multiplies n times — O(n); fast halves/squares — O(log n) via the binary expansion of n. Evidence: 2¹⁰ needs 9 naive mults but the list 10→5→4→2→1 walks back in 4 ops (square, ×x, square, square).</p>'
    },
    'ans-bubble4': {
      title: 'Exam script · pick ONE difference',
      html: '<p>“A1 carries a <code>swapped</code> flag and shrinks the unsorted bound with L, so sorted input costs O(n); A2/A3 have no flag and always run (N−1)² comparisons.” Or: “A4 is cocktail — it alternates forward and backward passes, so a small ‘turtle’ at the end reaches the front in one pass instead of n.” Similarities for any pair: adjacent compare-and-swap only, in-place O(1), stable with strict <code>&gt;</code>, O(n²) worst case.</p>'
    },
    'ans-selection': {
      title: 'Exam script · 30-second answer',
      html: '<p><strong>Similarity:</strong> both pick the minimum of the unsorted region each pass — ~n²/2 comparisons, n−1 picks, Θ(n²), never adaptive. <strong>Difference:</strong> out-of-place builds a second list with remove+append (O(n) extra); in-place swaps inside one array (O(1) extra, ≤ n−1 swaps). Stability note: the swap version can flip equals — [2<sub>a</sub>, 2<sub>b</sub>, 1] → [1, 2<sub>b</sub>, 2<sub>a</sub>].</p>'
    },
    'ans-insertion': {
      title: 'Exam script · 30-second answer',
      html: '<p>Mark the first element sorted; for each new X, shift every larger sorted element one step right and drop X in the gap. Stable, in-place, adaptive O(n) best / O(n²) worst, online. One write per shift plus the final insert — that is why it beats swapping, and why it owns small/nearly-sorted inputs (and Timsort’s short runs).</p>'
    },
    'ans-counting': {
      title: 'Exam script · 30-second answer',
      html: '<p>Base: count occurrences, walk counters low→high, emit — O(n+k). Negatives: <code>index = value − min</code>, <code>size = max − min + 1</code>. Same code fixes 6000–7000 (1001 slots, not 7001). Money: floats can’t index — map the 8 distinct bills to indexes with a dict and count those. Stability comes from prefix sums + placing right-to-left.</p>'
    }
  };

  function detailHTML(title, inner) {
    return '<details class="deep"><summary>' + title + ' — click to expand</summary><div class="deep-body">' + inner + '</div></details>';
  }

  window.Detail = {
    inject: function () {
      Object.keys(SORT_DEEP).forEach(function (k) {
        var card = document.getElementById('sort-' + k);
        if (!card || card.querySelector('.deep')) return;
        var d = document.createElement('div');
        d.innerHTML = detailHTML(SORT_DEEP[k].title, SORT_DEEP[k].html);
        card.appendChild(d.firstChild);
      });
      Object.keys(ANSWER_DEEP).forEach(function (id) {
        var card = document.getElementById(id);
        if (!card || card.querySelector('.deep')) return;
        var d = document.createElement('div');
        d.innerHTML = detailHTML(ANSWER_DEEP[id].title, ANSWER_DEEP[id].html);
        card.appendChild(d.firstChild);
      });
    }
  };
})();
