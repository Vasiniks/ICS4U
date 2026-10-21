// sorts.js — metadata + generator-based step visualizers

const SORTS = {
  bubble: {
    name: "Bubble Sort",
    category: "Comparison",
    tagline: "Repeatedly swaps adjacent out-of-order pairs; largest bubbles to the end.",
    stability: "Stable",
    inPlace: "Yes",
    adaptive: "Yes (with swapped flag)",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    description: "Bubble sort walks the list comparing each adjacent pair; if the left is greater, they swap. After each pass the largest unsorted element is in its final place. A 'swapped' flag makes it adaptive: if a full pass makes no swaps, the list is sorted.",
    pseudo: `procedure bubbleSort(A)
  n ← length(A)
  repeat
    swapped ← false
    for i ← 0 to n-2 do
      if A[i] > A[i+1] then
        swap(A[i], A[i+1]); swapped ← true
  until not swapped
  n ← n - 1`,
    code: `def bubble_sort(a):
    n = len(a)
    while True:
        swapped = False
        for i in range(n - 1):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        n -= 1
        if not swapped:
            break
    return a`,
    micro: [
      "Track a 'swapped' flag; stop early when a pass makes no swaps (adaptive O(n) best case).",
      "Shrink the unsorted bound (n--) each pass — the tail is already sorted.",
      "Cocktail shaker sort: alternate directions so small values ('turtles') don't take O(n²) passes to reach the front.",
      "Compare with > not >= to keep equal elements in original order (stability)."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      let bound = n;
      let swapped;
      do {
        swapped = false;
        for (let i = 0; i < bound - 1; i++) {
          yield { array: a.slice(), compare: [i, i+1], swap: null, sorted: [], done: false, note: `compare ${a[i]} and ${a[i+1]}` };
          if (a[i] > a[i+1]) {
            [a[i], a[i+1]] = [a[i+1], a[i]];
            swapped = true;
            yield { array: a.slice(), compare: null, swap: [i, i+1], sorted: [], done: false, note: `swap → ${a[i]}, ${a[i+1]}` };
          }
        }
        bound--;
        yield { array: a.slice(), compare: null, swap: null, sorted: range(bound, n), done: false, note: `pass done; tail sorted` };
      } while (swapped && bound > 1);
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  selection: {
    name: "Selection Sort",
    category: "Comparison",
    tagline: "Each pass picks the minimum of the unsorted region and swaps it into place.",
    stability: "Not stable (typical)",
    inPlace: "Yes",
    adaptive: "No",
    best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    description: "Selection sort divides the list into sorted (left) and unsorted (right) regions. Each pass scans the unsorted region for its minimum, then swaps that minimum with the first unsorted position. It always does O(n²) comparisons but at most n-1 swaps.",
    pseudo: `procedure selectionSort(A)
  for i ← 0 to n-2 do
    min ← i
    for j ← i+1 to n-1 do
      if A[j] < A[min] then min ← j
    swap(A[i], A[min])`,
    code: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a`,
    micro: [
      "Swap only once per pass (n-1 swaps total) — great when writes are expensive.",
      "Bidirectional selection sort finds both min and max per pass, halving passes.",
      "Stable variant: instead of swapping, insert the minimum by shifting (costs O(n) moves).",
      "No early exit: even sorted input costs O(n²) comparisons."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) {
          yield { array: a.slice(), compare: [m, j], swap: null, pivot: m, sorted: range(0, i), done: false, note: `scan min: ${a[m]} vs ${a[j]}` };
          if (a[j] < a[m]) m = j;
        }
        if (m !== i) {
          [a[i], a[m]] = [a[m], a[i]];
          yield { array: a.slice(), compare: null, swap: [i, m], pivot: null, sorted: range(0, i+1), done: false, note: `swap min into place` };
        } else {
          yield { array: a.slice(), compare: null, swap: null, sorted: range(0, i+1), done: false, note: `already in place` };
        }
      }
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  insertion: {
    name: "Insertion Sort",
    category: "Comparison",
    tagline: "Builds a sorted prefix by inserting each next element into its correct spot.",
    stability: "Stable",
    inPlace: "Yes",
    adaptive: "Yes (O(n) on nearly-sorted)",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    description: "Insertion sort maintains a sorted prefix. For each new element it shifts larger elements right and drops the new element into the gap. Excellent on small or nearly-sorted data; it is the base case inside Timsort and Introsort.",
    pseudo: `procedure insertionSort(A)
  for i ← 1 to n-1 do
    key ← A[i]; j ← i-1
    while j ≥ 0 and A[j] > key do
      A[j+1] ← A[j]; j ← j-1
    A[j+1] ← key`,
    code: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
    micro: [
      "Binary insertion sort: find insertion point with binary search (O(n log n) comparisons, still O(n²) moves).",
      "Shift with memmove-style block copies instead of element-by-element swaps.",
      "Use as the small-run sorter inside Timsort/Introsort (threshold ~32-64).",
      "Sentinel: place a minimum at index -1 to drop the j>=0 check."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      for (let i = 1; i < n; i++) {
        let key = a[i];
        let j = i - 1;
        yield { array: a.slice(), compare: [j, i], swap: null, sorted: range(0, i), done: false, note: `insert ${key}` };
        while (j >= 0 && a[j] > key) {
          a[j+1] = a[j];
          yield { array: a.slice(), compare: [j, j+1], swap: [j, j+1], sorted: range(0, i), done: false, note: `shift ${a[j+1]}` };
          j--;
        }
        a[j+1] = key;
        yield { array: a.slice(), compare: null, swap: null, sorted: range(0, i+1), done: false, note: `placed ${key}` };
      }
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  merge: {
    name: "Merge Sort",
    category: "Comparison (Divide & Conquer)",
    tagline: "Split in half, sort each half, merge two sorted halves.",
    stability: "Stable",
    inPlace: "No (O(n) extra)",
    adaptive: "No (but bottom-up variants exist)",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",
    description: "Merge sort recursively splits the array into singletons, then merges pairs into sorted runs. Guaranteed O(n log n) worst case and stable, but needs O(n) auxiliary memory. The basis of Timsort's merge phase.",
    pseudo: `procedure mergeSort(A, lo, hi)
  if lo < hi then
    mid ← (lo+hi)/2
    mergeSort(A, lo, mid)
    mergeSort(A, mid+1, hi)
    merge(A, lo, mid, hi)`,
    code: `def merge_sort(a):
    if len(a) <= 1: return a
    m = len(a)//2
    L = merge_sort(a[:m])
    R = merge_sort(a[m:])
    return merge(L, R)

def merge(L, R):
    out=[]; i=j=0
    while i<len(L) and j<len(R):
        if L[i] <= R[j]: out.append(L[i]); i+=1
        else: out.append(R[j]); j+=1
    return out + L[i:] + R[j:]`,
    micro: [
      "Bottom-up (iterative) merge sort avoids recursion overhead and is cache-friendly.",
      "Use insertion sort for small runs (Timsort) — fewer comparisons on tiny arrays.",
      "Ping-pong between two buffers to avoid reallocating the auxiliary array.",
      "Natural merge sort detects already-sorted runs (adaptive)."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      const aux = a.slice();
      function* ms(lo, hi) {
        if (hi - lo <= 1) return;
        const mid = (lo + hi) >> 1;
        yield* ms(lo, mid);
        yield* ms(mid, hi);
        // merge
        for (let k = lo; k < hi; k++) aux[k] = a[k];
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
          yield { array: a.slice(), compare: [i, j], swap: null, sorted: [], done: false, note: `merge compare` };
          if (aux[i] <= aux[j]) { a[k++] = aux[i++]; }
          else { a[k++] = aux[j++]; }
          yield { array: a.slice(), compare: null, swap: [k-1, k-1], sorted: [], done: false, note: `write ${a[k-1]}` };
        }
        while (i < mid) { a[k++] = aux[i++]; yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `copy left` }; }
        while (j < hi) { a[k++] = aux[j++]; yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `copy right` }; }
      }
      yield* ms(0, n);
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  quick: {
    name: "Quick Sort",
    category: "Comparison (Divide & Conquer)",
    tagline: "Pick a pivot, partition around it, recurse on both sides.",
    stability: "Not stable",
    inPlace: "Yes (O(log n) stack)",
    adaptive: "No",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)",
    description: "Quick sort chooses a pivot and partitions the array so elements ≤ pivot go left and > pivot go right, then recurses. Average O(n log n) and very fast in practice due to cache locality, but degrades to O(n²) on sorted input with naive pivot choice.",
    pseudo: `procedure quickSort(A, lo, hi)
  if lo < hi then
    p ← partition(A, lo, hi)
    quickSort(A, lo, p-1)
    quickSort(A, p+1, hi)`,
    code: `def quick_sort(a, lo=0, hi=None):
    if hi is None: hi = len(a)-1
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p-1)
        quick_sort(a, p+1, hi)

def partition(a, lo, hi):
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] <= pivot:
            a[i], a[j] = a[j], a[i]; i+=1
    a[i], a[hi] = a[hi], a[i]
    return i`,
    micro: [
      "Median-of-three (or random) pivot avoids O(n²) on sorted/reverse input.",
      "Tail-call optimization: recurse on the smaller partition, loop on the larger (O(log n) stack).",
      "3-way (Dutch national flag) partition for many duplicates.",
      "Introsort: switch to heap sort if recursion depth exceeds 2·log₂n."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      function* qs(lo, hi) {
        if (hi - lo <= 1) {
          if (lo < n) yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `base ${lo}` };
          return;
        }
        // median-of-three pivot
        const mid = (lo + hi) >> 1;
        // simple: pivot = last
        const pivotIdx = hi - 1;
        const pivot = a[pivotIdx];
        yield { array: a.slice(), pivot: pivotIdx, compare: null, swap: null, sorted: [], done: false, note: `pivot ${pivot}` };
        let i = lo;
        for (let j = lo; j < hi - 1; j++) {
          yield { array: a.slice(), compare: [j, pivotIdx], pivot: pivotIdx, swap: null, sorted: [], done: false, note: `compare ${a[j]} with pivot ${pivot}` };
          if (a[j] <= pivot) {
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              yield { array: a.slice(), compare: null, swap: [i, j], pivot: pivotIdx, sorted: [], done: false, note: `swap` };
            }
            i++;
          }
        }
        [a[i], a[hi-1]] = [a[hi-1], a[i]];
        yield { array: a.slice(), compare: null, swap: [i, hi-1], pivot: i, sorted: [], done: false, note: `pivot placed at ${i}` };
        yield* qs(lo, i);
        yield* qs(i + 1, hi);
      }
      yield* qs(0, n);
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  heap: {
    name: "Heap Sort",
    category: "Comparison",
    tagline: "Turn the array into a max-heap, then repeatedly extract the max.",
    stability: "Not stable",
    inPlace: "Yes",
    adaptive: "No",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)",
    description: "Heap sort builds a max-heap in O(n), then swaps the root (max) to the end and sifts down, growing a sorted suffix. Guaranteed O(n log n) and in-place, but poor cache locality vs quicksort.",
    pseudo: `procedure heapSort(A)
  buildMaxHeap(A)
  for i ← n-1 down to 1 do
    swap(A[0], A[i])
    siftDown(A, 0, i)`,
    code: `def heap_sort(a):
    n = len(a)
    for i in range(n//2 - 1, -1, -1):
        sift_down(a, i, n)
    for i in range(n - 1, 0, -1):
        a[0], a[i] = a[i], a[0]
        sift_down(a, 0, i)
    return a`,
    micro: [
      "Build heap bottom-up in O(n) (not n insertions).",
      "Use sift-down (not sift-up) for extraction phase.",
      "Heapsort is the fallback in Introsort when quicksort recurses too deep.",
      "Cache-unfriendly: random access pattern hurts modern CPUs."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      function* sift(i, size) {
        while (true) {
          let largest = i;
          const l = 2*i+1, r = 2*i+2;
          if (l < size) {
            yield { array: a.slice(), compare: [i, l], swap: null, sorted: [], done: false, note: `heap compare` };
            if (a[l] > a[largest]) largest = l;
          }
          if (r < size) {
            yield { array: a.slice(), compare: [largest, r], swap: null, sorted: [], done: false, note: `heap compare` };
            if (a[r] > a[largest]) largest = r;
          }
          if (largest !== i) {
            [a[i], a[largest]] = [a[largest], a[i]];
            yield { array: a.slice(), compare: null, swap: [i, largest], sorted: [], done: false, note: `sift down` };
            i = largest;
          } else break;
        }
      }
      // build
      for (let i = (n>>1)-1; i >= 0; i--) yield* sift(i, n);
      // extract
      for (let i = n - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        yield { array: a.slice(), compare: null, swap: [0, i], sorted: range(i, n), done: false, note: `extract max to position ${i}` };
        yield* sift(0, i);
      }
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  shell: {
    name: "Shell Sort",
    category: "Comparison",
    tagline: "Insertion sort with gaps that shrink; moves elements far in one step.",
    stability: "Not stable",
    inPlace: "Yes",
    adaptive: "Yes (gap-dependent)",
    best: "O(n log n)", avg: "O(n^1.3)", worst: "O(n²)", space: "O(1)",
    description: "Shell sort generalizes insertion sort by comparing elements a gap apart, then shrinking the gap. Large gaps move small elements to the front quickly; final gap 1 is a plain insertion sort. Gap sequence matters enormously (Knuth, Sedgewick).",
    pseudo: `procedure shellSort(A)
  gap ← n/2
  while gap > 0 do
    for i ← gap to n-1 do
      temp ← A[i]; j ← i
      while j ≥ gap and A[j-gap] > temp do
        A[j] ← A[j-gap]; j ← j-gap
      A[j] ← temp
    gap ← gap/2`,
    code: `def shell_sort(a):
    n = len(a)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = a[i]
            j = i
            while j >= gap and a[j-gap] > temp:
                a[j] = a[j-gap]
                j -= gap
            a[j] = temp
        gap //= 2
    return a`,
    micro: [
      "Use Sedgewick or Knuth gap sequences for better worst-case bounds.",
      "Last pass (gap=1) is insertion sort; earlier passes make it nearly sorted.",
      "No extra memory; good for embedded / memory-constrained systems.",
      "Performance highly sensitive to gap sequence — benchmark for your data."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      let gap = Math.floor(n / 2);
      while (gap > 0) {
        for (let i = gap; i < n; i++) {
          let temp = a[i];
          let j = i;
          while (j >= gap) {
            yield { array: a.slice(), compare: [j-gap, j], swap: null, sorted: [], done: false, note: `gap ${gap}: compare` };
            if (a[j-gap] > temp) {
              a[j] = a[j-gap];
              yield { array: a.slice(), compare: null, swap: [j, j-gap], sorted: [], done: false, note: `shift` };
              j -= gap;
            } else break;
          }
          a[j] = temp;
          yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `place ${temp}` };
        }
        gap = Math.floor(gap / 2);
      }
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  counting: {
    name: "Counting Sort",
    category: "Non-comparison (Integer)",
    tagline: "Count occurrences of each value, then reconstruct in order.",
    stability: "Stable (if done carefully)",
    inPlace: "No (O(k) extra)",
    adaptive: "No",
    best: "O(n+k)", avg: "O(n+k)", worst: "O(n+k)", space: "O(k)",
    description: "Counting sort assumes integer keys in a known range [0,k). It counts how many times each value occurs, converts counts to positions, then writes elements to their final positions. Linear time when k = O(n).",
    pseudo: `procedure countingSort(A, k)
  C[0..k] ← 0
  for x in A do C[x]++
  for i ← 1 to k do C[i] += C[i-1]
  for x in A (reverse) do B[C[x]-1] ← x; C[x]--`,
    code: `def counting_sort(a):
    if not a: return a
    k = max(a)
    cnt = [0]*(k+1)
    for x in a: cnt[x]+=1
    # prefix sums -> positions
    for i in range(1,k+1): cnt[i]+=cnt[i-1]
    out=[0]*len(a)
    for x in reversed(a):
        out[cnt[x]-1]=x; cnt[x]-=1
    return out`,
    micro: [
      "Use prefix sums to make it stable (needed for radix sort).",
      "If range k >> n, switch to comparison sort.",
      "In-place variant exists but loses stability.",
      "Handle negatives by shifting keys by min."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      if (n === 0) { yield { array: a, compare: null, swap: null, sorted: [], done: true, note: "empty" }; return; }
      const min = Math.min(...a);
      const max = Math.max(...a);
      const shift = min < 0 ? -min : 0;
      const k = max - min;
      const cnt = new Array(k+1).fill(0);
      for (let x of a) { cnt[x+shift]++; }
      // show counting
      yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `counted: ${cnt.join(",")}` };
      // prefix
      for (let i = 1; i <= k; i++) cnt[i] += cnt[i-1];
      const out = new Array(n);
      // place in reverse for stability
      for (let idx = n-1; idx >= 0; idx--) {
        const v = a[idx];
        const pos = --cnt[v+shift];
        out[pos] = v;
        const snapshot = out.map(x => (x === undefined ? 0 : x));
        yield { array: snapshot.slice(), compare: null, swap: [idx, pos], sorted: [], done: false, note: `place ${v} at ${pos}` };
      }
      for (let i = 0; i < n; i++) a[i] = out[i];
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  },

  radix: {
    name: "Radix Sort",
    category: "Non-comparison (Integer)",
    tagline: "Sort digit by digit from least significant to most, using counting sort.",
    stability: "Stable",
    inPlace: "No",
    adaptive: "No",
    best: "O(d(n+k))", avg: "O(d(n+k))", worst: "O(d(n+k))", space: "O(n+k)",
    description: "Radix sort processes digits of integer keys from LSD to MSD, applying a stable counting sort per digit. Time is O(d·(n+k)) where d is digit count and k the base. Great for fixed-width integers/strings.",
    pseudo: `procedure radixSort(A, d)
  for i ← 0 to d-1 do
    stableSortByDigit(A, i)   // counting sort`,
    code: `def radix_sort(a):
    if not a: return a
    m = max(a)
    exp = 1
    while m // exp > 0:
        counting_sort_by_digit(a, exp)
        exp *= 10
    return a`,
    micro: [
      "LSD radix is stable and simple; MSD radix can short-circuit on prefixes.",
      "Choose base to balance passes vs bucket size (base 256 for bytes).",
      "Pad numbers to fixed width; handle negatives via offset.",
      "In-place (American flag sort) for MSD radix saves memory."
    ],
    gen: function* (a) {
      a = a.slice();
      const n = a.length;
      if (n === 0) { yield { array: a, compare:null, swap:null, sorted:[], done:true, note:"empty" }; return; }
      const max = Math.max(...a.map(x=>Math.abs(x)));
      let exp = 1;
      while (Math.floor(max / exp) > 0) {
        // counting sort by digit exp
        const cnt = new Array(10).fill(0);
        for (let x of a) cnt[Math.floor(Math.abs(x)/exp) % 10]++;
        for (let i = 1; i < 10; i++) cnt[i] += cnt[i-1];
        const out = new Array(n);
        for (let i = n-1; i >= 0; i--) {
          const d = Math.floor(Math.abs(a[i])/exp) % 10;
          out[--cnt[d]] = a[i];
        }
        for (let i = 0; i < n; i++) a[i] = out[i];
        yield { array: a.slice(), compare: null, swap: null, sorted: [], done: false, note: `pass digit ${exp} (exp)` };
        exp *= 10;
      }
      yield { array: a.slice(), compare: null, swap: null, sorted: range(0, n), done: true, note: "sorted" };
    }
  }
};

function range(lo, hi) { const r=[]; for(let i=lo;i<hi;i++) r.push(i); return r; }

// metadata list for UI
const SORT_ORDER = ["bubble","selection","insertion","merge","quick","heap","shell","counting","radix"];
