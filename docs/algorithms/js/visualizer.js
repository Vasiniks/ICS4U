// visualizer.js
const Viz = {
  state: null,
  init() {
    this.algoSel = document.getElementById('viz-algo');
    this.sizeInput = document.getElementById('viz-size');
    this.speedInput = document.getElementById('viz-speed');
    this.barsEl = document.getElementById('viz-bars');
    this.statsEl = document.getElementById('viz-stats');
    this.noteEl = document.getElementById('viz-note');
    this.btnGen = document.getElementById('viz-gen');
    this.btnStart = document.getElementById('viz-start');
    this.btnPause = document.getElementById('viz-pause');
    this.btnStep = document.getElementById('viz-step');
    this.btnReset = document.getElementById('viz-reset');

    SORT_ORDER.forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = SORTS[k].name;
      this.algoSel.appendChild(o);
    });

    this.btnGen.addEventListener('click', () => this.generate());
    this.btnStart.addEventListener('click', () => this.start());
    this.btnPause.addEventListener('click', () => this.pause());
    this.btnStep.addEventListener('click', () => this.step());
    this.btnReset.addEventListener('click', () => this.reset());

    this.generate();
  },

  generate() {
    this.pause();
    const n = Math.max(5, Math.min(80, parseInt(this.sizeInput.value) || 30));
    this.sizeInput.value = n;
    this.arr = Array.from({length:n}, () => Math.floor(Math.random()*95)+5);
    this.gen = SORTS[this.algoSel.value].gen(this.arr);
    this.last = null;
    this.comparisons = 0; this.swaps = 0; this.steps = 0;
    this.render(this.arr, {});
    this.updateStats();
    this.noteEl.textContent = 'Ready. Press Start or Step.';
    this.running = false;
  },

  reset() { this.generate(); },

  step() {
    if (!this.gen) this.generate();
    const r = this.gen.next();
    if (r.done) { this.noteEl.textContent = 'Done.'; this.running = false; return true; }
    const s = r.value;
    this.last = s;
    this.steps++;
    if (s.compare) this.comparisons++;
    if (s.swap) this.swaps++;
    this.render(s.array, s);
    this.noteEl.textContent = s.note || '';
    this.updateStats();
    if (s.done) { this.noteEl.textContent = 'Sorted!'; this.running=false; }
    return s.done;
  },

  async start() {
    if (this.running) return;
    this.running = true;
    const loop = async () => {
      while (this.running) {
        const done = this.step();
        if (done) { this.running = false; break; }
        const delay = Math.max(5, 210 - (parseInt(this.speedInput.value)||50)*2);
        await new Promise(res => setTimeout(res, delay));
      }
    };
    loop();
  },

  pause() { this.running = false; },

  render(arr, s) {
    const n = arr.length;
    const max = Math.max(...arr, 1);
    this.barsEl.innerHTML = '';
    const cmp = new Set(s.compare || []);
    const swp = new Set(s.swap || []);
    const sorted = new Set(s.sorted || []);
    arr.forEach((v, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      if (cmp.has(i)) bar.classList.add('compare');
      if (swp.has(i)) bar.classList.add('swap');
      if (sorted.has(i)) bar.classList.add('sorted');
      if (s.pivot === i) bar.classList.add('pivot');
      bar.style.height = (v / max * 100) + '%';
      bar.title = v;
      this.barsEl.appendChild(bar);
    });
  },

  updateStats() {
    this.statsEl.innerHTML = `Steps: <b>${this.steps}</b> &nbsp; Comparisons: <b>${this.comparisons}</b> &nbsp; Swaps/Writes: <b>${this.swaps}</b> &nbsp; Size: <b>${this.arr.length}</b>`;
  }
};

// Race mode: two algorithms side by side
const Race = {
  init() {
    this.aSel = document.getElementById('race-a');
    this.bSel = document.getElementById('race-b');
    this.sizeInput = document.getElementById('race-size');
    this.barsA = document.getElementById('race-bars-a');
    this.barsB = document.getElementById('race-bars-b');
    this.statsA = document.getElementById('race-stats-a');
    this.statsB = document.getElementById('race-stats-b');
    this.btn = document.getElementById('race-run');
    SORT_ORDER.forEach(k => {
      [this.aSel, this.bSel].forEach(sel => {
        const o = document.createElement('option'); o.value=k; o.textContent=SORTS[k].name; sel.appendChild(o);
      });
    });
    this.aSel.value = 'bubble'; this.bSel.value = 'merge';
    this.btn.addEventListener('click', () => this.run());
    this.seed();
  },
  seed() {
    const n = Math.max(5, Math.min(60, parseInt(this.sizeInput.value)||25));
    this.sizeInput.value = n;
    const base = Array.from({length:n}, () => Math.floor(Math.random()*95)+5);
    this.base = base;
    this.renderStatic(this.barsA, base);
    this.renderStatic(this.barsB, base);
    this.statsA.textContent = 'Ready'; this.statsB.textContent = 'Ready';
  },
  renderStatic(el, arr) {
    const max = Math.max(...arr,1);
    el.innerHTML = '';
    arr.forEach(v => {
      const b = document.createElement('div'); b.className='bar'; b.style.height=(v/max*100)+'%'; el.appendChild(b);
    });
  },
  async run() {
    this.seed();
    const n = this.base.length;
    const genA = SORTS[this.aSel.value].gen(this.base);
    const genB = SORTS[this.bSel.value].gen(this.base);
    let doneA=false, doneB=false;
    const max = Math.max(...this.base);
    const stepA = () => { const r = genA.next(); if (r.done) { doneA=true; return null;} return r.value; };
    const stepB = () => { const r = genB.next(); if (r.done) { doneB=true; return null;} return r.value; };
    let cmpA=0,swA=0,stA=0, cmpB=0,swB=0,stB=0;
    const paint = (el, s, arr) => {
      el.innerHTML='';
      const cmp=new Set(s.compare||[]), swp=new Set(s.swap||[]), sorted=new Set(s.sorted||[]);
      arr.forEach((v,i)=>{
        const b=document.createElement('div'); b.className='bar';
        if (cmp.has(i)) b.classList.add('compare');
        if (swp.has(i)) b.classList.add('swap');
        if (sorted.has(i)) b.classList.add('sorted');
        if (s.pivot===i) b.classList.add('pivot');
        b.style.height=(v/max*100)+'%'; el.appendChild(b);
      });
    };
    while (!doneA || !doneB) {
      if (!doneA) {
        const s = stepA();
        if (s) { stA++; if(s.compare) cmpA++; if(s.swap) swA++; paint(this.barsA, s, s.array); }
        this.statsA.innerHTML = `Steps <b>${stA}</b> · Cmp <b>${cmpA}</b> · Swaps <b>${swA}</b>${doneA?' · DONE':''}`;
      }
      if (!doneB) {
        const s = stepB();
        if (s) { stB++; if(s.compare) cmpB++; if(s.swap) swB++; paint(this.barsB, s, s.array); }
        this.statsB.innerHTML = `Steps <b>${stB}</b> · Cmp <b>${cmpB}</b> · Swaps <b>${swB}</b>${doneB?' · DONE':''}`;
      }
      await new Promise(res=>setTimeout(res, 30));
    }
    this.statsA.innerHTML += ' ✅'; this.statsB.innerHTML += ' ✅';
  }
};
