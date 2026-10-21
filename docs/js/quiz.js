// quiz.js
const QUIZ = {
  easy: [
    {q:"Which sort repeatedly swaps adjacent elements that are out of order?", opts:["Selection Sort","Bubble Sort","Insertion Sort","Merge Sort"], a:1, exp:"Bubble sort compares adjacent pairs and swaps them if left > right, 'bubbling' the largest to the end."},
    {q:"Which sort is stable by default (equal elements keep original order)?", opts:["Quick Sort","Heap Sort","Merge Sort","Selection Sort"], a:2, exp:"Merge sort uses <= when merging, preserving relative order of equal keys."},
    {q:"Time complexity of bubble sort worst case?", opts:["O(n)","O(n log n)","O(n²)","O(2^n)"], a:2, exp:"Bubble sort worst case is O(n²) comparisons/swaps."},
    {q:"Which sort builds a sorted prefix by inserting each element into place?", opts:["Insertion Sort","Selection Sort","Counting Sort","Radix Sort"], a:0, exp:"Insertion sort inserts each new element into the already-sorted prefix."},
    {q:"Which sort has O(n) best case on already-sorted input (with a swapped flag)?", opts:["Selection Sort","Bubble Sort","Heap Sort","Merge Sort"], a:1, exp:"Bubble sort with a swapped flag terminates after one pass on sorted input: O(n)."},
    {q:"Non-comparison sort that counts occurrences of each value?", opts:["Quick Sort","Counting Sort","Shell Sort","Heap Sort"], a:1, exp:"Counting sort counts how many times each key occurs."},
    {q:"Which sort divides the array in half recursively then merges?", opts:["Quick Sort","Heap Sort","Merge Sort","Shell Sort"], a:2, exp:"Merge sort is the classic divide-and-conquer sort with a merge step."},
    {q:"Space complexity of merge sort (auxiliary)?", opts:["O(1)","O(log n)","O(n)","O(n²)"], a:2, exp:"Merge sort needs an auxiliary array of size n: O(n) extra space."},
    {q:"Which sort is NOT in-place?", opts:["Selection Sort","Insertion Sort","Bubble Sort","Merge Sort"], a:3, exp:"Merge sort requires O(n) auxiliary memory; the others are in-place."},
    {q:"Best case time of insertion sort?", opts:["O(1)","O(n)","O(n log n)","O(n²)"], a:1, exp:"Insertion sort on already-sorted input does n-1 comparisons: O(n)."},
    {q:"[ICS4U] In the BBC tiles demo, Euclid's algorithm shows…", opts:["Two ways to sort tiles by colour","Subtractive vs modulo reach the same GCD, modulo is faster","Tiles prove sorting is O(n)","GCD cannot be computed by computer"], a:1, exp:"Marcus du Sautoy lays square tiles: repeated subtraction peels one row at a time; mod jumps a whole strip. Same GCD, far fewer steps."},
    {q:"[ICS4U] Bubble A1 uses a 'swapped' flag so that…", opts:["It never swaps","It stops early when a pass makes no swaps","It sorts floats","It uses extra memory"], a:1, exp:"Swapped=false each pass; if no swap occurs the list is sorted — O(n) best case. A2/A3 lack this."},
    {q:"[ICS4U] Counting sort with negatives needs…", opts:["More RAM","An offset = min value (index = value − min)","A pivot","Recursion"], a:1, exp:"Negative values can't index directly. offset=min, spread=max−min, index=value−offset."},
    {q:"[ICS4U] Selection sort out-of-place vs in-place: which is true?", opts:["Both do the same comparisons, but out-of-place uses an extra list","Out-of-place is O(n log n)","In-place needs O(n) extra","Out-of-place does swaps"], a:0, exp:"Both select the min each pass (~n²/2 compares). Out-of-place remove+appends to a second list; in-place swaps within one array."},
    {q:"[ICS4U] The 37% (optimal stopping) rule says…", opts:["Look at 37% then take the next best-so-far","Always take the first option","Never stop exploring","Sort 37% of data"], a:0, exp:"Ch.1 Optimal Stopping: observe 37% with no commitment, then commit to the next candidate beating all seen."},
    {q:"[ICS4U] Caching (Ch.4) eviction rule taught is…", opts:["Random eviction","Least-recently-used (LRU)","Largest first","Alphabetical"], a:1, exp:"Keep what you used recently; evict least-recently-used — CPU caches, libraries, desk vs archive."}
  ],
  medium: [
    {q:"Quick sort's worst case occurs when...", opts:["Pivot is always the median","Input is random","Pivot is always min or max","Array has distinct values"], a:2, exp:"If pivot is always the smallest/largest, partitions are 0 and n-1 → O(n²)."},
    {q:"Which optimization makes quick sort's recursion stack O(log n)?", opts:["Random pivot","Tail-call optimization (recurse smaller, loop larger)","3-way partition","Median-of-three"], a:1, exp:"Recurse on the smaller side and loop on the larger keeps stack depth logarithmic."},
    {q:"Heap sort's build-heap phase runs in...", opts:["O(n log n)","O(n)","O(log n)","O(n²)"], a:1, exp:"Bottom-up heap construction is O(n) (not n insertions)."},
    {q:"Counting sort requires keys in range...", opts:["Any real numbers","Integers in known range [0,k)","Strings only","Negative only"], a:1, exp:"Counting sort needs integer keys within a known bounded range."},
    {q:"Radix sort processes digits from...", opts:["Most significant to least","Least significant to most (LSD)","Random order","Middle outward"], a:1, exp:"LSD radix sorts from least significant digit upward, using a stable sort per digit."},
    {q:"Shell sort is essentially insertion sort with...", opts:["A pivot","Gaps between compared elements","A heap","Counting"], a:1, exp:"Shell sort compares elements a 'gap' apart, shrinking the gap to 1."},
    {q:"Which sort is used as the small-run base case in Timsort?", opts:["Heap Sort","Quick Sort","Insertion Sort","Bubble Sort"], a:2, exp:"Timsort uses insertion sort for runs shorter than ~32-64 elements."},
    {q:"A stable sort used to sort linked lists efficiently?", opts:["Quick Sort","Merge Sort","Heap Sort","Selection Sort"], a:1, exp:"Merge sort is stable and O(n log n); great for linked lists (no random access needed)."},
    {q:"In-place merge sort's main drawback?", opts:["Unstable","Complex implementation, poor constants","O(n²) worst case","Not adaptive"], a:1, exp:"In-place merge is complex and has worse constant factors; standard merge uses O(n) space."},
    {q:"3-way quicksort (Dutch national flag) is best when...", opts:["All elements distinct","Many duplicate keys","Input is sorted","Array is tiny"], a:1, exp:"3-way partition groups equal keys, avoiding repeated work on duplicates."},
    {q:"[ICS4U] Bubble A4 (cocktail) differs from A2 because it…", opts:["Never swaps","Passes in both directions, fixing 'turtles'", "Uses recursion","Needs O(n) extra"], a:1, exp:"Cocktail shaker alternates forward+backward passes; a small value at the end moves in 1 pass instead of n."},
    {q:"[ICS4U] Naive powers (×n) vs fast powers: complexities?", opts:["O(n) vs O(log n) multiplications","O(log n) vs O(n)","Both O(n²)","Both O(1)"], a:0, exp:"Naive multiplies n times; squaring/halving method needs O(log n)."},
    {q:"[ICS4U] Counting 6000–7000 with offset needs how many counters?", opts:["7001","1001","6000","n²"], a:1, exp:"spread=max−min=1000 → 1001 slots vs 7001 without offset. Same code as negatives."},
    {q:"[ICS4U] Counting money ($0.05…$100, 8 values) needs…", opts:["10001 counters","8 counters via value→index map","A pivot","O(n²) time"], a:1, exp:"Only distinct values need counters. Map each bill to an index with a dict; never use floats as indexes."},
    {q:"[ICS4U] Selection sort does how many swaps (in-place)?", opts:["O(n²) swaps","At most n−1 swaps","Zero swaps","n! swaps"], a:1, exp:"One swap per pass → n−1 total. Few writes is its only strength."},
    {q:"[ICS4U] Insertion sort shifts instead of swapping because…", opts:["Shifts are 1 write vs 3 per swap","Shifts look cooler","Swaps are illegal","Shifts use more memory"], a:0, exp:"A swap is 3 writes; a shift is 1 write + final insert. Fewer memory writes."}
  ],
  hard: [
    {q:"Introsort switches to heap sort when recursion depth exceeds...", opts:["log₂ n","2 log₂ n","n/2","√n"], a:1, exp:"Introsort (std::sort) falls back to heapsort if depth > 2·floor(log₂ n)."},
    {q:"Timsort's minimum run length is chosen to ensure...", opts:["Runs are prime","Merge tree is balanced & runs combine well","No recursion","Stability"], a:1, exp:"Minrun (32-64) is chosen so merges stay balanced and runs are efficient for insertion sort."},
    {q:"Counting sort stable variant's extra work converts counts to...", opts:["Max values","Prefix sums (positions)","Averages","Hashes"], a:1, exp:"Prefix sums turn counts into starting positions, enabling stable placement."},
    {q:"Radix sort time complexity with base b and d digits?", opts:["O(n log n)","O(d(n+b))","O(n+b)","O(n²)"], a:1, exp:"Each of d passes is O(n+b); total O(d(n+b))."},
    {q:"Which has best worst-case among comparison sorts here?", opts:["Quick Sort","Heap Sort","Merge Sort","Shell Sort"], a:2, exp:"Merge sort guarantees O(n log n) worst case (heap sort too; merge is stable)."},
    {q:"American flag sort is an in-place variant of...", opts:["Counting Sort","Radix Sort (MSD)","Heap Sort","Quick Sort"], a:1, exp:"American flag sort is an in-place MSD radix sort."},
    {q:"Shell sort with Hibbard's gaps has worst case...", opts:["O(n²)","O(n^(3/2))","O(n log n)","O(n^(5/4))"], a:1, exp:"Hibbard increments give O(n^(3/2)) worst case."},
    {q:"For external sorting (data larger than memory), the usual approach is...", opts:["Quick Sort in memory","Merge sort with runs on disk","Heap sort","Counting sort"], a:1, exp:"External sort: sort chunks in memory, write runs, then k-way merge from disk."},
    {q:"Comparison sort lower bound (decision tree) is...", opts:["O(n)","O(n log n)","O(n²)","O(log n)"], a:1, exp:"Any comparison sort needs Ω(n log n) comparisons in the worst case."},
    {q:"Which sort is both stable and in-place with O(n log n) worst case?", opts:["Merge Sort","Quick Sort","Heap Sort","None of the above"], a:3, exp:"No comparison sort is simultaneously stable, in-place, and O(n log n) worst case (Block sort is a complex exception). Standard answer: none."},
    {q:"[ICS4U] gcd(1000,1): mod version vs subtractive steps?", opts:["1 step vs 999 subtractions","Same steps","999 vs 1","Both O(1)"], a:0, exp:"1000 mod 1 = 0 finishes in 1 step; subtractive does 999 × (1000−1). This is the tiles-demo gap."},
    {q:"[ICS4U] Bubble A2 on already-sorted n=100 does…", opts:["~100 compares then stops","~100×100 compares (no early exit)","0 compares","Crashes"], a:1, exp:"No swapped flag → all N−1 passes run: (N−1)² ≈ 10k compares. A1 would do ~99 and stop."},
    {q:"[ICS4U] Why can't counting sort use floats as indexes?", opts:["Floats can't be list indexes; map via dict/cents","Floats are too big","Floats are always negative","It can — no problem"], a:0, exp:"List indexes must be ints. Money fix: dict value→index or convert to cents. Using raw floats breaks."},
    {q:"[ICS4U] Stable counting sort places from the right because…", opts:["Right is faster","Preserves input order of equal keys","Left is illegal","Saves memory"], a:1, exp:"Scanning input right-to-left into prefix-sum positions keeps equal keys in original order (needed for radix)."},
    {q:"[ICS4U] Explore/Exploit (bandit) best practice is…", opts:["Always exploit from step 1","Explore early, exploit late (UCB / Gittins)","Never explore","Random only"], a:1, exp:"Try new options early when information is valuable; converge to the winner. Win-Stay Lose-Shift is a simple instance."},
    {q:"[ICS4U] Relaxation (Ch.8) solves hard problems by…", opts:["Ignoring the problem","Dropping/softening constraints, solving easy version, rounding back","Sorting first","Adding constraints"], a:1, exp:"Relax constraints → tractable bound (e.g. LP) → round to feasible solution. TSP / scheduling use this."}
  ]
};

const Quiz = {
  init() {
    this.container = document.getElementById('quiz-container');
    this.scoreEl = document.getElementById('quiz-score');
    this.renderAll();
  },
  renderAll() {
    this.container.innerHTML = '';
    let idx = 0;
    ['easy','medium','hard'].forEach(level => {
      const h = document.createElement('h3'); h.textContent = level.charAt(0).toUpperCase()+level.slice(1); this.container.appendChild(h);
      QUIZ[level].forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'quiz';
        card.dataset.level = level;
        card.dataset.i = i;
        card.innerHTML = `<div class="q">${idx+1}. ${q.q}</div>
          <div class="opts">${q.opts.map((o,j)=>`<div class="opt" data-j="${j}">${String.fromCharCode(65+j)}. ${o}</div>`).join('')}</div>
          <div class="explain">${q.exp}</div>`;
        card.querySelectorAll('.opt').forEach(opt => {
          opt.addEventListener('click', () => this.answer(card, q, parseInt(opt.dataset.j)));
        });
        this.container.appendChild(card);
        idx++;
      });
    });
    this.updateScore();
  },
  answer(card, q, j) {
    if (card.classList.contains('done')) return;
    card.classList.add('done');
    const opts = card.querySelectorAll('.opt');
    opts.forEach(o => o.classList.add('disabled'));
    if (j === q.a) {
      opts[j].classList.add('correct');
      card.dataset.correct = '1';
    } else {
      opts[j].classList.add('wrong');
      opts[q.a].classList.add('correct');
      card.dataset.correct = '0';
    }
    card.querySelector('.explain').classList.add('show');
    this.updateScore();
  },
  updateScore() {
    const done = document.querySelectorAll('.quiz.done').length;
    const correct = document.querySelectorAll('.quiz.done[data-correct="1"]').length;
    this.scoreEl.innerHTML = `Answered: <b>${done}</b> / ${document.querySelectorAll('.quiz').length} &nbsp; Correct: <b>${correct}</b>`;
  }
};
