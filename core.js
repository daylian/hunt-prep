(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- dates ---------- */
  const DAY = 86400000;
  const START = '2026-11-23';
  const TRIP = '2027-10-11';
  const LAST_WEEK = 46;
  const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pad = n => (n < 10 ? '0' : '') + n;
  const Dt = {
    ms(s) { const p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); },
    str(ms) { const d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); },
    add(s, n) { return Dt.str(Dt.ms(s) + n * DAY); },
    diff(a, b) { return Math.round((Dt.ms(a) - Dt.ms(b)) / DAY); },
    dow(s) { return (new Date(Dt.ms(s)).getUTCDay() + 6) % 7; },
    local() { const n = new Date(); return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate()); }
  };

  const weekNum = d => Math.floor(Dt.diff(d, START) / 7) + 1;
  const weekStart = w => Dt.add(START, (w - 1) * 7);
  const phaseOf = w => (w <= 12 ? 1 : w <= 24 ? 2 : w <= 38 ? 3 : w <= 44 ? 4 : 5);
  const PHASE_NAMES = { 1: 'Base and tendons', 2: 'VO2max block', 3: 'Loaded build', 4: 'Hunt peak', 5: 'Taper' };
  const isDeload = w => w <= 40 && w % 4 === 0;
  const z2min = w => (isDeload(w) ? 40 : 45 + 5 * ((w - 1) % 4));

  /* ---------- zones ---------- */
  const ZONES = {
    z1: 'up to 137', z2: '138-152', z3: '153-166', z4: '167-176', z5: '177-190'
  };

  /* ---------- week data ---------- */
  const Z2 = (min, pack, label) => ({ t: 'z2', min, pack: pack || 0, label: label || 'Z2 climb' });
  const Z4 = (b, pack) => ({ t: 'z4', b, pack: pack || 0 });
  const Z3 = (b, pack) => ({ t: 'z3', b, pack: pack || 0 });
  const I44 = (r, inc) => ({ t: 'int44', r, inc: !!inc });
  const I63 = { t: 'int63', r: 6 };
  const I101 = { t: 'int101', sets: 2 };
  const TEST = { t: 'test' };

  const WK = {};
  const set = (w, h1, h2, lg, long2) => { WK[w] = { h1, h2, lg, long2 }; };
  // Phase 1
  set(1, Object.assign(Z2(45), { map: true }), Z2(45), [60, 0]);
  set(2, Object.assign(Z2(45), { map: true }), TEST, [60, 0]);
  set(3, I44(3), Z2(45), [75, 0]);
  set(4, I44(3), Z2(40), [60, 0]);
  set(5, I44(4), Z4([12, 12]), [90, 9]);
  set(6, I44(4), Z4([10, 10, 10]), [100, 9]);
  set(7, I44(4), Z4([15, 15]), [105, 9]);
  set(8, I44(3), Z2(45), [75, 7]);
  set(9, I44(4), Z4([15, 15]), [105, 13]);
  set(10, I44(4), Z4([12, 12, 12]), [110, 15]);
  set(11, I44(4), Z4([20, 20]), [120, 18]);
  set(12, I44(3), TEST, [90, 13]);
  // Phase 2
  set(13, I44(4), I63, [120, 18]);
  set(14, I44(4), I63, [120, 18]);
  set(15, I44(5), I63, [120, 18]);
  set(16, I44(3), Z2(45), [90, 14]);
  set(17, I44(5), I101, [120, 22]);
  set(18, I44(5), I101, [135, 22]);
  set(19, I44(5), I101, [150, 22]);
  set(20, I44(4), Z2(45), [90, 17]);
  set(21, I44(5, true), I63, [150, 22]);
  set(22, I44(5, true), I63, [150, 22]);
  set(23, I44(5, true), I63, [150, 22]);
  set(24, I44(3), TEST, [90, 17]);
  // Phase 3
  const sun90 = Z2(90, 0, 'Sunday Z2');
  set(25, Z4([20, 20], 26), I44(4), [150, 26]);
  set(26, Z4([20, 20], 26), I44(4), [165, 26]);
  set(27, Z4([20, 20], 26), I44(4), [180, 26]);
  set(28, Z3([45], 20), Z2(45), [120, 22]);
  set(29, Z3([20, 20, 20], 31), I44(4), [180, 31]);
  set(30, Z3([20, 20, 20], 33), I44(4), [180, 33]);
  set(31, Z3([20, 20, 20], 35), I44(4), [180, 35]);
  set(32, Z3([45], 26), Z2(45), [120, 26]);
  set(33, Z3([60], 35), I44(4), [180, 35], sun90);
  set(34, Z3([65], 37), I44(4), [195, 37], sun90);
  set(35, Z3([75], 40), I44(4), [210, 40], sun90);
  set(36, Z3([45], 31), TEST, [120, 31]);
  set(37, Z3([75], 44), I44(4), [210, 44], sun90);
  set(38, Z3([90], 44), I44(4), [210, 44], sun90);
  // Phase 4
  const sunZ = m => Z2(m, 0, 'Sunday Z2');
  set(39, Z3([75], 49), I44(4), [210, 49], sunZ(120));
  set(40, Z3([45], 37), Z2(45), [120, 37]);
  set(41, Z3([60], 53), I44(4), [240, 55], sunZ(150));
  set(42, Z3([75], 57), I44(4), [240, 55], { t: 'long', min: 100, pack: 70, packout: true });
  set(43, Z3([90], 62), I44(4), [240, 55], sunZ(150));
  set(44, Z3([60], 53), I44(4), [240, 55], sunZ(120));

  /* ---------- session kinds ---------- */
  const HARD = { h1: 1, h2: 1, long: 1, test: 1 };
  const LEG = { legA: 1, legB: 1, leg1: 1 };
  const RESCHED = { h1: 1, h2: 1, long: 1, test: 1, legA: 1, leg1: 1, legB: 1, long2: 1, push: 1, pull: 1 };
  const ORDER = ['legA', 'leg1', 'long', 'h1', 'h2', 'test', 'legB', 'long2', 'push', 'pull', 'z2', 'easy'];
  const SHOW_ORDER = ['h1', 'h2', 'test', 'long', 'long2', 'z2', 'easy', 'legA', 'leg1', 'legB', 'push', 'pull'];

  function weekSessions(w) {
    const o = [];
    if (w < 1 || w > LAST_WEEK) return o;
    const ph = phaseOf(w);
    const add = (slot, kind, pref, spec) => o.push({ id: 'W' + w + ':' + slot, w, slot, kind, pref, spec });
    if (ph <= 3) {
      const t = WK[w];
      add('h1', 'h1', 0, t.h1);
      if (ph === 2) add('leg', 'leg1', 1, { t: 'leg', v: 'ONE', ph, w });
      else add('legA', 'legA', 1, { t: 'leg', v: 'A', ph, w });
      add('z2', 'z2', 2, Z2(z2min(w)));
      add('h2', t.h2.t === 'test' ? 'test' : 'h2', 3, t.h2);
      if (ph !== 2) add('legB', 'legB', 4, { t: 'leg', v: 'B', ph, w });
      add('push', 'push', 2, { t: 'push', ph, w });
      add('pull', 'pull', 3, { t: 'pull', ph, w });
      add('long', 'long', 5, { t: 'long', min: t.lg[0], pack: t.lg[1], outdoor: ph >= 3, w, oreq: ph >= 2 && w % 2 === 0 });
      if (t.long2) add('long2', 'long2', 6, t.long2);
    } else if (ph === 4) {
      const t = WK[w];
      add('h1', 'h1', 1, t.h1);
      add('leg', 'leg1', 2, { t: 'leg', v: 'ONE', ph: 4, w });
      add('h2', 'h2', 3, t.h2);
      add('easy', 'easy', 4, Z2(35, 0, 'Easy Z2'));
      add('push', 'push', 0, { t: 'push', ph: 4, w });
      add('pull', 'pull', 4, { t: 'pull', ph: 4, w });
      add('long', 'long', 5, { t: 'long', min: t.lg[0], pack: t.lg[1], packtest: w === 40, w, oreq: w % 2 === 0 });
      if (t.long2) add('long2', 'long2', 6, t.long2);
    } else if (w === 45) {
      add('h1', 'h1', 1, Z2(60, 26, 'Loaded climb'));
      add('leg', 'leg1', 2, { t: 'leg', v: 'ONE', ph: 5, w, taper: true });
      add('h2', 'h2', 3, I44(3));
      add('easy', 'easy', 4, Z2(30, 0, 'Easy Z2'));
      add('long', 'long', 5, { t: 'long', min: 120, pack: 26, easy: true });
      add('push', 'push', 0, { t: 'push', ph: 5, w, taper: true });
      add('pull', 'pull', 4, { t: 'pull', ph: 5, w, taper: true });
    } else {
      add('h1', 'h1', 1, { t: 'int33', r: 3 });
      add('z2', 'z2', 2, Z2(40));
      add('easy', 'easy', 4, Z2(30, 0, 'Easy Z2'));
    }
    return o;
  }
  // phase 4 week data lives in WK already; fix deload week 40 long2 and week 45/46 handled above

  /* ---------- helpers ---------- */
  const r5 = n => Math.round(n / 5) * 5;
  const vert = (min, inc, spd) => {
    const g = (+inc || 0) / 100;
    return Math.round(((+spd || 0) * 1000 * g / Math.sqrt(1 + g * g)) * ((+min || 0) / 60));
  };
  const hm = m => (m >= 120 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min');

  const LIFTS = {
    squat: { name: 'Back squat', start: 195, inc: 5, fl: 'lb', suf: ' lb' },
    trap: { name: 'Trap bar deadlift', start: 317, inc: 5, fl: 'lb', suf: ' lb' },
    rdl: { name: 'Romanian deadlift', start: 155, inc: 5, fl: 'lb', suf: ' lb' },
    bulg: { name: 'Bulgarian split squat', start: 35, inc: 5, fl: 'lb each', suf: ' lb dumbbells, each hand' },
    bench: { name: 'Bench press', start: 165, inc: 5, fl: 'lb', suf: ' lb' },
    inc: { name: 'Incline dumbbell press', start: 45, inc: 5, fl: 'lb each', suf: ' lb dumbbells, each hand' },
    ohp: { name: 'Neutral-grip dumbbell shoulder press', start: 35, inc: 5, fl: 'lb each', suf: ' lb dumbbells, each hand' },
    pullup: { name: 'Pull-up, strict', start: 0, inc: 5, fl: 'lb added', suf: ' lb added' },
    row: { name: 'One-arm dumbbell row', start: null, inc: 5, fl: 'lb each', suf: ' lb dumbbell' },
    stepup: { name: 'Loaded step-up, 20-24 in box', start: null, inc: 5, fl: 'lb each', suf: ' lb dumbbells, each hand' },
    carry: { name: 'Heavy carry, farmer or suitcase', start: null, inc: 5, fl: 'lb each', suf: ' lb each hand' }
  };
  const RX = {
    squat: { 1: [3, '8'], 2: [2, '5'], 3: [3, '6'], 4: [2, '5'] },
    trap: { 1: [3, '5'], 2: [2, '5'], 3: [3, '5'], 4: [2, '5'] },
    rdl: { 1: [3, '6-8'], 2: [2, '6'], 3: [3, '6'], 4: [2, '6'] },
    bulg: { 1: [3, '8'], 2: [2, '8'], 3: [3, '8'], 4: [2, '8'] },
    bench: { 1: [3, '6-8'], 2: [2, '5'], 3: [3, '6'], 4: [2, '5'] },
    inc: { 1: [3, '8-10'], 2: [2, '8'], 3: [3, '8'], 4: [2, '8'] },
    ohp: { 1: [3, '8-10'], 2: [2, '8'], 3: [3, '8'], 4: [2, '8'] },
    pullup: { 1: [3, '6-8'], 2: [2, '5'], 3: [3, '6'], 4: [2, '5'] },
    row: { 1: [3, '8-10'], 2: [2, '8'], 3: [3, '8'], 4: [2, '8'] },
    stepup: { 1: [3, '8'], 2: [2, '6'], 3: [3, '8'], 4: [2, '6'] },
    carry: { 1: [3, '1'], 2: [2, '1'], 3: [3, '1'], 4: [2, '1'] }
  };
  const HOTEL_LIFT = {
    squat: { name: 'Goblet squat, one 50 lb dumbbell', reps: '12, 3 s lowering', n: 12 },
    trap: { name: 'Dumbbell RDL, two 50 lb dumbbells', reps: '10, slow', n: 10 },
    rdl: { name: 'Single-leg RDL, 50 lb dumbbells', reps: '8 each leg', n: 8 },
    bulg: { name: 'Dumbbell Bulgarian split squat, 50 lb each hand', reps: '10 each leg', n: 10 },
    step: { name: 'Dumbbell step-up, 50 lb each hand', reps: '10 each leg', n: 10 }
  };
  HOTEL_LIFT.stepup = HOTEL_LIFT.step;

  const VIDEOS = {
    squat: { c: 'Squat University', v: '7v_V6xiA_AA' },
    rdl: { c: 'Squat University', v: '5bJEigM5iVg' },
    bulg: { c: 'Squat University', v: '-4LVK1crLSw' },
    bench: { c: 'Jeremy Ethier', v: '4Y2ZdHCOXok' },
    face: { c: 'ATHLEAN-X', v: 'ljgqer1ZpXg' },
    row: { c: 'ATHLEAN-X', v: 'gfUg6qWohTk' },
    pullup: { c: 'OPEX Fitness', v: 'rVRiy_HVz2g' },
    rot: { c: 'Jeremy Ethier', v: '-NA8lUy5_Qc' },
    trap: { c: 'Horton Barbell', v: 'dfYIApfWS5o' },
    ohp: { c: 'OPEX Fitness', v: 'LZImFJfg12Q' },
    stepup: { c: 'OPEX Fitness', v: 'Zp7RG4jFScw' },
    slrdl: { c: 'OPEX Fitness', v: 'pJewPISyHjw' },
    tricepext: { c: 'OPEX Fitness', v: 'a9oPnZReIRE' },
    goblet: { c: 'OPEX Fitness', v: 'pEGfGwp6IEA' },
    dbbench: { c: 'OPEX Fitness', v: 'Q7omzf7Bt1I' },
    curl: { c: 'OPEX Fitness', v: '4hKyhFBeclI' },
    reardelt: { c: 'OPEX Fitness', v: 'MMgl5ZtN278' },
    pushup: { c: 'OPEX Fitness', v: 'Ql8PKKsDE70' },
    calf: { c: 'OPEX Fitness', v: '9OKjv_iDa-g' },
    hang: { c: 'OPEX Fitness', v: '0Bx_Ap7-EwU' },
    dbrdl: { c: 'J2Fit', v: 'hQgFixeXdZo' },
    cop: { c: 'E3 Rehab', v: 'YRRnnZsRs9U' },
    spa: { c: 'Jake Tuura', v: 'NzBj2XEzySc' },
    swing: { c: 'Zack Henderson', v: 'bDCeXbMJVNs' },
    slam: { c: 'Horton Barbell', v: 'EsAhU1jHpiQ' },
    kneeraise: { c: 'Signum Fitness', v: 'p9hhX_Sx5v0' },
    inc: { c: 'Scott Herman Fitness', v: 'hChjZQhX1Ls' },
    tri: { c: 'Alex Leonidas', v: '6IEwkw_pLf4' },
    carry: { c: 'Lift With Michelle', v: 'ur4ou6mX7sw' },
    pallof: { c: 'StrengthLab360', v: 'SsQWYNxlYsQ' }
  };
  const VSEARCH = {
    inc: 'incline dumbbell press form tutorial', ohp: 'neutral grip dumbbell shoulder press form',
    carry: 'suitcase carry farmer carry technique', tri: 'cable triceps pushdown form',
    pushup: 'push-up proper form', hang: 'dead hang shoulder health technique',
    reardelt: 'rear delt fly dumbbell form', curl: 'hammer curl form', pallof: 'pallof press tutorial',
    kneeraise: 'hanging knee raise form', soleus: 'bent knee soleus calf raise', calf: 'standing calf raise form',
    stepdown: 'slow eccentric step down knee tutorial', goblet: 'goblet squat form', dbrdl: 'dumbbell romanian deadlift form',
    slrdl: 'single leg romanian deadlift dumbbell form', stepup: 'dumbbell step up form', tricepext: 'overhead dumbbell triceps extension form',
    sq: 'adductor squeeze ball isometric exercise', cop: 'copenhagen plank knee supported form', spa: 'spanish squat isometric hold form', swing: 'kettlebell swing form', slam: 'medicine ball slam form',
    dbbench: 'dumbbell bench press form', rdl: 'romanian deadlift form', trap: 'trap bar deadlift form'
  };
  function videoFor(vk) {
    if (!vk) return null;
    const v = VIDEOS[vk];
    if (v) return { url: 'https://www.youtube.com/watch?v=' + v.v, label: 'Video: ' + v.c, curated: true };
    const q = VSEARCH[vk];
    if (!q) return null;
    return { url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q), label: 'Find a video', curated: false };
  }

  function descMin(w) {
    if (!w || w < 25 || w >= 45) return 0;
    if (w % 4 === 0) return 8;
    return w <= 28 ? 8 : w <= 38 ? 12 : 15;
  }
  function legSpecInfo(sp) {
    const ph = sp.ph === 5 ? 4 : sp.ph;
    const dl = isDeload(sp.w);
    const maint = sp.ph === 2 || sp.ph === 4 || sp.ph === 5;
    return { ph, dl, maint, taper: !!sp.taper, noProg: dl || maint || !!sp.taper };
  }
  function legPlan(sp) {
    // returns ordered list of [slotKey, liftKey]
    if (sp.v === 'A') return [['l1', 'trap'], ['l2', 'stepup'], ['l3', 'bulg']];
    if (sp.v === 'B') return [['l1', 'squat'], ['l2', 'rdl'], ['l3', 'step']];
    return [['l1', 'squat'], ['l2', 'trap'], ['l3', 'rdl'], ['l4', 'bulg']];
  }

  /* ---------- logs helpers ---------- */
  const DB_KEYS = { bulg: 1, inc: 1, ohp: 1, row: 1, stepup: 1 };
  function capOf(key, S) { return DB_KEYS[key] ? ((S && +S.dbmax) || 50) : null; }
  function liftNext(key, S) {
    const w = liftNextRaw(key, S), cap = capOf(key, S);
    return w != null && cap != null && w > cap ? cap : w;
  }
  function liftNextRaw(key, S) {
    let best = null;
    const items = S.items || {};
    for (const id in items) {
      const r = items[id];
      if (r && r.done && r.lift === key && !r.nop && r.vals && r.vals.w != null && r.vals.w !== '') {
        if (!best || r.date >= best.date) best = r;
      }
    }
    const ov = S.start && S.start[key];
    if (ov && ov.w != null && ov.w !== '' && (!best || ov.d >= best.date)) return +ov.w;
    if (!best) return LIFTS[key].start;
    const inc = LIFTS[key].inc;
    const w = +best.vals.w, t = best.tgt;
    if (!t) return w + (best.vals.clean ? inc : 0); // older records
    if (t.ok) return w + (best.vals.ok && !best.vals.grind ? inc : 0);
    const done = [];
    for (let i = 1; i <= t.s; i++) {
      const v = best.vals['r' + i];
      if (v != null && v !== '') done.push(+v);
    }
    if (!done.length) return w;
    const skipped = done.length < t.s;
    const allTop = done.every(x => x >= t.hi), allLo = done.every(x => x >= t.lo);
    if (allTop && !skipped && !best.vals.grind) return w + inc;
    const ratio = done.reduce((a, b) => a + b, 0) / (done.length * t.lo);
    if (allLo || ratio >= 0.85) return w;
    return Math.max(0, r5(w * 0.9));
  }
  function lastVals(S, ltype) {
    let best = null;
    const items = S.items || {};
    for (const id in items) {
      const r = items[id];
      if (r && r.ltype === ltype && r.vals && (r.vals.inc || r.vals.spd)) {
        if (!best || r.date >= best.date) best = r;
      }
    }
    return best ? best.vals : null;
  }

  /* ---------- titles ---------- */
  function titleOf(def) {
    const s = def.spec;
    switch (s.t) {
      case 'int44': return '4x4 VO2 intervals (Z5), ' + s.r + ' rounds';
      case 'int63': return '6x3 min VO2 intervals (Z5)';
      case 'int101': return '10x1 min intervals, 2 sets';
      case 'int33': return 'Opener: 3x3 min at Z5';
      case 'z4': return 'Threshold (Z4): ' + blocksLabel(s.b) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'z3': return 'Loaded tempo (Z3): ' + blocksLabel(s.b) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'z2': return (s.label || 'Z2 climb') + ', ' + s.min + ' min' + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'long':
        if (s.packout) return 'Packout simulation, ' + hm(s.min) + ', ' + s.pack + ' lb';
        return (s.easy ? 'Easy long climb, ' : 'Long climb, ') + hm(s.min) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'test': return '30-minute threshold test';
      case 'leg': return legTitle(s);
      case 'push': return s.taper ? 'Push day, light (taper)' : 'Push Day: chest, shoulders, triceps';
      case 'pull': return s.taper ? 'Pull day, light (taper)' : 'Pull Day: back, grip, carries';
      default: return 'Session';
    }
  }
  function legTitle(s) {
    if (s.v === 'A') return 'Leg Day A: trap bar and single-leg';
    if (s.v === 'B') return 'Leg Day B: squat and RDL';
    return s.taper ? 'Leg day, light (taper)' : 'Leg day: all four lifts';
  }
  function blocksLabel(b) {
    const same = b.every(x => x === b[0]);
    return same ? b.length + 'x' + b[0] + ' min' : b.join('+') + ' min';
  }
  function estMin(def) {
    const s = def.spec;
    switch (s.t) {
      case 'int44': return 10 + s.r * 7 + 5;
      case 'int63': return 10 + s.r * 5 + 5;
      case 'int101': return 10 + s.sets * 20 + 4 + 5;
      case 'int33': return 10 + s.r * 6 + 5;
      case 'z4': case 'z3': return 10 + s.b.reduce((a, b) => a + b, 0) + 4 * (s.b.length - 1) + 5;
      case 'z2': return s.min;
      case 'long': return 10 + s.min;
      case 'test': return 50;
      case 'leg': return s.v === 'ONE' ? 50 : 45;
      case 'push': case 'pull': return 50;
      default: return 45;
    }
  }

  /* ---------- items ---------- */
  function climbFields(min, pack) {
    return [
      { k: 'min', l: 'Minutes', d: min },
      { k: 'inc', l: 'Incline %' },
      { k: 'spd', l: 'km/h' },
      { k: 'hr', l: 'Avg HR' },
      { k: 'pack', l: 'Pack lb', d: pack || 0 }
    ];
  }

  function buildItems(def, variant, S) {
    S = S || { items: {} };
    const sp = def.spec, hotel = variant === 'hotel', I = [];
    const it = (key, label, detail, extra) => I.push(Object.assign({ key, label, detail: detail || '' }, extra || {}));
    const hotelInt = ' Hotel treadmill: run or fast-walk at max incline.';
    const lv = lastVals(S, sp.t);
    const lastTxt = lv ? ' Last time: ' + (lv.inc || '?') + '% at ' + (lv.spd || '?') + ' km/h.' : '';
    const logFields = [{ k: 'pk', l: 'Peak HR' }, { k: 'inc', l: 'Incline %' }, { k: 'spd', l: 'km/h' }];

    switch (sp.t) {
      case 'int44': {
        it('warm', 'Warm-up, 10 min', '5 min easy at 5-8% incline, then 3 x 1 min stepping up with 1 min easy.');
        const inc = sp.inc ? ' Add 2 points of incline versus last block.' : '';
        for (let k = 1; k <= sp.r; k++) {
          it('r' + k, 'Round ' + k + ' of ' + sp.r + ': 4 min at 177-190 bpm, 3 min easy',
            'HR 177+ by minute 2, finish 183-188. Recovery about 3 km/h, HR to 140 or lower.' +
            (hotel ? hotelInt : ' Start near 5 km/h at 25%, hold incline and switch with speed.') + (k === 1 ? lastTxt + inc : ''));
        }
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        it('log', 'Log the numbers', 'Hands off the rails after the first minute.', { fields: logFields, optional: true, ltype: sp.t });
        break;
      }
      case 'int63': {
        it('warm', 'Warm-up, 10 min', '5 min easy at 5-8% incline, then 3 x 1 min stepping up.');
        for (let k = 1; k <= sp.r; k++) it('r' + k, 'Round ' + k + ' of ' + sp.r + ': 3 min at 177-190 bpm, 2 min easy', 'Same HR target as the 4x4: 177+ by minute 1.5.' + (hotel ? hotelInt : '') + (k === 1 ? lastTxt : ''));
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        it('log', 'Log the numbers', '', { fields: logFields, optional: true, ltype: sp.t });
        break;
      }
      case 'int101': {
        it('warm', 'Warm-up, 10 min', '5 min easy at 5-8% incline, then 3 x 1 min stepping up.');
        for (let k = 1; k <= sp.sets; k++) it('s' + k, 'Set ' + k + ' of ' + sp.sets + ': 10 x (1 min hard, 1 min easy)', 'Heart rate lags, so judge by effort and the settings. 4 min easy between sets.' + (hotel ? hotelInt : ''));
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        it('log', 'Log the numbers', '', { fields: logFields, optional: true, ltype: sp.t });
        break;
      }
      case 'int33': {
        it('warm', 'Warm-up, 10 min', '5 min easy, then 3 x 1 min stepping up.');
        for (let k = 1; k <= sp.r; k++) it('r' + k, 'Opener ' + k + ' of ' + sp.r + ': 3 min at 177-190 bpm, 3 min easy', 'This is the last hard effort before the trip. Sharp, not heroic.' + (hotel ? hotelInt : ''));
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        break;
      }
      case 'z4': case 'z3': {
        const z = sp.t === 'z4' ? '167-176' : '153-166';
        const pack = hotel ? 0 : sp.pack;
        it('warm', 'Warm-up, 10 min', '5 min easy, then 3 x 1 min stepping up.');
        sp.b.forEach((m, i) => it('b' + (i + 1), 'Block ' + (i + 1) + ' of ' + sp.b.length + ': ' + m + ' min at ' + z + ' bpm',
          'Steady effort, not a surge.' + (pack ? ' Pack ' + pack + ' lb.' : '') + (hotel ? ' No pack here: use incline and speed to reach the zone.' : '') + (i < sp.b.length - 1 ? ' Then 3-5 min easy.' : '')));
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        it('log', 'Log the numbers', '', { fields: [{ k: 'hr', l: 'Avg HR' }, { k: 'inc', l: 'Incline %' }, { k: 'spd', l: 'km/h' }, { k: 'pack', l: 'Pack lb', d: pack }], optional: true, ltype: sp.t });
        break;
      }
      case 'z2': {
        const mins = hotel && sp.pack ? r5(sp.min * 1.15) : sp.min;
        const pack = hotel ? 0 : sp.pack;
        it('wu', 'Warm-up, first 5 min', 'Start at 3-4 km/h and 5% incline and let HR climb under 138 before you settle into the zone. If hips or calves are tight, do 10 calf raises and 5 leg swings each side before stepping on.', { optional: true, show: true });
        let d = 'HR 138-152. Typical 4-5 km/h at 8-15%. Hands off the rails.';
        if (hotel) d = 'HR 138-152. Max incline, then raise speed until HR sits in the zone. Hands off the rails.' + (sp.pack ? ' No pack, so extra time.' : '');
        if (sp.map) d += ' Note which incline and speed give 140-150 bpm; that is your map.';
        it('main', (sp.label || 'Z2 climb') + ' (138-152 bpm): ' + mins + ' min' + (pack ? ', pack ' + pack + ' lb' : ''), d, { fields: climbFields(mins, pack), ltype: 'z2' });
        break;
      }
      case 'long': {
        const mins = hotel ? r5(sp.min * 1.15) : sp.min;
        const pack = hotel ? 0 : sp.pack;
        it('warm', 'Warm-up, 10 min', 'Easy walk at 5-8% incline.');
        if (sp.packtest) it('pt', 'Pack economy check: first 45 min at fixed speed, incline and pack', 'Log average HR of each half below. Under 5% drift is the target.', { fields: [{ k: 'hr1', l: 'HR first half' }, { k: 'hr2', l: 'HR second half' }], optional: true });
        let d = 'Z2, HR 138-152. Aim for 600-900 vertical m per hour: about 4-4.5 km/h at 15-20%.';
        if (hotel) d = 'Z2, HR 138-152. No pack and a limited hotel incline, so the time is 15% longer. Max incline, raise speed to hold the zone.';
        else if (sp.outdoor) d += ' Outdoors counts: hunting boots and your hunting pack, with poles on descents.';
        if (sp.packout && !hotel) d = 'Z2, mostly flat or rolling, once. Hunting pack, snug hip belt, hands off the rails.';
        if (sp.oreq && !hotel) it('out', 'Outdoors this week', 'Do this climb outside if you can: your real boots, hunting pack, uneven ground, poles on the way down. The treadmill is the fallback.', { optional: true });
        it('main', (sp.packout ? 'Packout simulation: ' : sp.easy ? 'Easy long climb: ' : 'Long climb: ') + mins + ' min in Z2 (138-152 bpm)' + (pack ? ', pack ' + pack + ' lb' : ''), d, { fields: climbFields(mins, pack), ltype: 'long' });
        const dm = descMin(sp.w);
        if (dm && !hotel && !sp.easy) it('desc', 'Downhill block: ' + dm + ' min at -5% incline' + (pack ? ', pack ' + pack + ' lb' : ''), 'Walk 3-4 km/h on the decline, short steps, knees soft, no braking with a locked knee. This is eccentric work, so expect leg soreness the next day. If the treadmill will not go below 0, do slow step-downs instead.', { optional: true, vk: 'stepdown' });
        if (sp.outdoor && !hotel && !sp.easy) it('shot', 'Shot hold at the end', 'Pack on. Step off, take 30 seconds to settle your breathing, then hold a steady rifle stance for 20 seconds. Log HR at the end of the climb and 30 seconds later.', { fields: [{ k: 'hrE', l: 'HR at end' }, { k: 'hr30', l: 'HR +30 s' }], optional: true });
        break;
      }
      case 'test': {
        it('warm', 'Warm-up, 15 min', 'Progressive, finish with 3 x 1 min harder.');
        it('main', '30 min as hard as you can hold steady', 'Pick settings you can hold for the full 30. The average HR of the last 20 minutes is your threshold HR.' + (hotel ? ' Hotel treadmill: run or fast-walk at max incline.' : ''),
          { fields: [{ k: 'hr20', l: 'Avg HR last 20' }, { k: 'inc', l: 'Incline %' }, { k: 'spd', l: 'km/h' }, { k: 'min', l: 'Minutes', d: 30 }], ltype: 'test' });
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        break;
      }
      case 'leg': warmLift('leg', hotel, it); legItems(sp, hotel, S, it); break;
      case 'push': case 'pull': warmLift(sp.t, hotel, it); pushPullItems(sp, hotel, S, it); break;
      default: break;
    }
    return I.map(x => Object.assign({ id: def.id + ':' + x.key }, x));
  }

  function warmLift(kind, hotel, it) {
    const band = hotel ? ' (skip if you did not pack a band)' : '';
    const L = a => a.map(x => '\u2022 ' + x).join('\n');
    if (kind === 'leg') {
      it('wu', 'Warm-up, 10 min: do each move once, smooth and slow', L([
        '3 min easy walk at 5-8% incline',
        'Short-foot hold x10 each foot',
        'Tibialis raise against a wall x15',
        'Single-leg balance, 30 s each side',
        'Glute bridge x10',
        'Bodyweight squat, 2 s pause at the bottom x8',
        'Reverse lunge x6 each side',
        'Band side-step x10 each way' + band,
        'Straight-leg calf raise x10',
        'Ankle rock against a wall x10 each side'
      ]), { show: true });
      it('ramp', 'Ramp-up sets on your first lift', L([
        'Empty bar or light weight x8',
        'About half the working weight x5',
        'About 75% x3',
        'Rest 45 s between. Do not log these.'
      ]), { show: true });
    } else if (kind === 'push') {
      it('wu', 'Warm-up, 8 min: do each move once', L([
        '3 min easy walk',
        'Band pull-apart x15' + band,
        'Scapular push-up x10',
        'Band external rotation x12 each side' + band,
        'Thoracic extension over a bench or rolled towel x8',
        'Cat-cow x8',
        'Arm circles x10 each way, slow'
      ]), { show: true });
      it('ramp', 'Ramp-up sets on your first press', L([
        'Empty bar or light dumbbells x10',
        'About half the working weight x6',
        'About 75% x3',
        'Rest 45 s between. Do not log these.'
      ]), { show: true });
    } else {
      it('wu', 'Warm-up, 8 min: do each move once', L([
        '3 min easy walk',
        'Dead hang, 20 s',
        'Scapular pull-up x8',
        'Band pull-apart x15' + band,
        'Cat-cow x8',
        'Bodyweight hip hinge x10',
        'Thoracic rotation on all fours x6 each side'
      ]), { show: true });
      it('ramp', 'Ramp-up sets on your first pull', L([
        'Two light sets of 5, easy',
        'One set at about 75% of the working weight x3',
        'Do not log these.'
      ]), { show: true });
    }
  }
  const repsOf = str => { const p = String(str).split('-').map(Number); return { lo: p[0], hi: p[p.length - 1] }; };
  const adjW = (key, S, info) => {
    const w = liftNext(key, S);
    if (w == null) return null;
    return info.taper ? r5(w * 0.8) : info.dl ? r5(w * 0.9) : w;
  };
  const setsFor = (n, info) => { let x = n; if (info.dl) x = Math.max(1, x - 1); if (info.taper) x = Math.min(x, 2); return x; };

  function liftLine(it, slot, key, sets, repStr, w, o) {
    o = o || {};
    const cap = capOf(key, o.S), atCap = !o.noProg && cap != null && w != null && w >= cap;
    if (atCap) { const q = repsOf(repStr); repStr = (q.hi + 2) + '-' + (q.hi + 5); }
    const L = LIFTS[key], r = repsOf(repStr);
    const nm = o.name || L.name;
    const fields = [{ k: 'w', l: L.fl, d: w == null ? '' : w }];
    for (let i = 1; i <= sets; i++) fields.push({ k: 'r' + i, l: 'Set ' + i, d: r.hi });
    const at = w == null ? ' (pick a weight that leaves 2 reps in reserve)' : (key === 'pullup' && w === 0 ? ' at bodyweight' : ' at ' + w + L.suf);
    const detail = o.noProg
      ? (o.note || 'Hold the weight. 2 reps in reserve. Log what you actually did.')
      : atCap ? 'These are your heaviest dumbbells (' + cap + ' lb), so progress with reps and tempo instead: 3 seconds down, 1 second pause at the bottom. All sets at the top of the range means it is time for a harder version (one arm at a time, or feet elevated).'
      : 'Top of the rep range on every set adds ' + L.inc + ' lb next time. The minimum on every set holds the weight. A big miss lowers it 10%. Leave a set blank if you skipped it.';
    it(slot, nm + ': ' + sets + ' x ' + repStr + at, detail, {
      lift: key, vk: key, nop: !!o.noProg, mk: !!o.mk, liftKey: key, fields, inline: true,
      tgt: { s: sets, lo: r.lo, hi: r.hi }, chips: o.noProg ? null : [{ k: 'grind', l: 'Grindy, hold weight' }]
    });
  }
  function carryLine(it, slot, sets, w, o) {
    o = o || {};
    const L = LIFTS.carry;
    const at = w == null ? ' (pick a heavy weight you can hold straight)' : ' at ' + w + L.suf;
    it(slot, L.name + ': ' + sets + ' x 40 m' + at, o.noProg ? 'Hold the weight. Tall posture, no leaning.' : 'If all walks were solid, tick it and the weight goes up ' + L.inc + ' lb next time.' + (o.elbow ? ' Elbow mode: pain 3 out of 10 or less. If it goes above that, drop the weight or a set.' : ''), {
      lift: 'carry', vk: 'carry', nop: !!o.noProg, fields: [{ k: 'w', l: L.fl, d: w == null ? '' : w }], inline: true,
      tgt: { ok: true, s: sets }, chips: o.noProg ? null : [{ k: 'ok', l: 'All walks solid' }]
    });
  }
  function hotelLine(it, slot, name, sets, reps, n, detail, o) {
    o = o || {};
    const fields = [{ k: 'w', l: 'lb each', d: 50 }];
    for (let i = 1; i <= sets; i++) fields.push({ k: 'r' + i, l: 'Set ' + i, d: n });
    it(slot, name + ': ' + sets + ' x ' + reps, detail || 'Leave 2 reps in reserve. Hotel work never changes your home weights.', { nop: true, mk: !!o.mk, liftKey: o.liftKey, vk: o.vk, fields, inline: true });
  }

  function legItems(sp, hotel, S, it) {
    const info = legSpecInfo(sp);
    const plan = legPlan(sp);
    plan.forEach(pair => {
      const slot = pair[0], key = pair[1];
      if (key === 'step') {
        const sets = info.dl ? 2 : 3;
        if (hotel) hotelLine(it, slot, HOTEL_LIFT.step.name, sets, HOTEL_LIFT.step.reps, HOTEL_LIFT.step.n, 'Bench or sturdy step. Leave 2 reps in reserve.', { mk: true, vk: 'stepup' });
        else it(slot, 'Slow step-down, 20 in box: ' + sets + ' x 8 each leg', '4 seconds down, touch the heel lightly, stand back up. This is your downhill protection. Hold the pack or dumbbells once it feels easy. Stop if the knee pinches.', { mk: true, vk: 'stepdown' });
        return;
      }
      const rx = RX[key][info.ph];
      const sets = setsFor(rx[0], info);
      if (hotel) {
        const h = HOTEL_LIFT[key];
        hotelLine(it, slot, h.name, sets, h.reps, h.n, 'Leave 2 reps in reserve. Maintenance only; heavy numbers resume at home.', { mk: true, liftKey: key, vk: { squat: 'goblet', trap: 'dbrdl', rdl: 'slrdl', bulg: 'bulg', stepup: 'stepup' }[key] });
        return;
      }
      liftLine(it, slot, key, sets, rx[1], adjW(key, S, info), { noProg: info.noProg, mk: true, S });
    });
    const dsets = info.maint || info.dl ? 2 : 3;
    if (S && S.groin) it('cop', 'Adductor squeeze, ball or pillow between the knees: ' + dsets + ' x 5 at about 50% effort', 'Squeeze for 8 seconds, rest 5. Pain 3 out of 10 or less and settled by morning. Move to the Copenhagen plank when this is pain-free for two weeks and you have cleared it with your physio.', { vk: 'sq' });
    else it('cop', 'Copenhagen plank, knee supported: ' + dsets + ' x 15 s each side', 'Top foot on a bench, bottom knee on the floor. Groin and hip stability for steep ground. Stop if it pinches.', { vk: 'cop' });
    it('spa', 'Spanish squat hold, band behind the knees: ' + dsets + ' x 30 s', 'Knee-friendly isometric for the tendons you load on descents. Shins vertical, sit back, pain no higher than 3 out of 10.', { vk: 'spa' });
    const solSets = info.ph === 1 || info.ph === 3 ? 4 : 3;
    it('sol', 'Soleus raise, bent knee, slow and heavy: ' + (info.dl ? solSets - 1 : solSets) + ' x 8', hotel ? 'Dumbbell on the knee, seated, or standing with a bent knee.' : 'Pain above 3 out of 10 means cut incline for a week.', { vk: 'soleus' });
    if (sp.v !== 'B') it('calf', 'Standing calf raise: ' + (info.maint ? 2 : 3) + ' x 10', hotel ? 'Single leg, dumbbell in hand.' : '', { vk: 'calf' });
  }

  function pushPullItems(sp, hotel, S, it) {
    const info = legSpecInfo(sp);
    const acc = info.maint ? 2 : 3;
    if (sp.t === 'push') {
      if (hotel) {
        hotelLine(it, 'p1', 'Dumbbell bench press (floor press if no bench)', setsFor(3, info), '10-12', 12, null, { vk: 'dbbench' });
        hotelLine(it, 'p2', 'Incline dumbbell press, or feet-elevated push-ups', setsFor(3, info), '12', 12, null, { vk: 'inc' });
        hotelLine(it, 'p3', 'Neutral-grip dumbbell shoulder press', setsFor(3, info), '10', 10, null, { vk: 'ohp' });
        it('tri', 'Overhead dumbbell triceps extension: 2 x 12', 'Slow lowering.', { vk: 'tricepext' });
        it('face', 'Face pull with a band, or rear-delt fly: 3 x 15', 'Light. Squeeze the shoulder blades.', { vk: 'face' });
      } else {
        ['bench', 'inc', 'ohp'].forEach((key, i) => {
          const rx = RX[key][info.ph];
          liftLine(it, 'p' + (i + 1), key, setsFor(rx[0], info), rx[1], adjW(key, S, info), { noProg: info.noProg, S });
        });
        it('tri', 'Triceps pushdown, cable or band: ' + acc + ' x 12', 'Controlled, full stretch at the top.', { vk: 'tri' });
        it('face', 'Face pull: 3 x 15', 'Light. Pull to the forehead and hold 1 second.', { vk: 'face' });
        it('rot', 'Band external rotation: 2 x 15 each arm', 'Shoulder health for the pack and the draw.', { vk: 'rot' });
        if (!info.maint && !info.dl) it('pu', 'Push-ups: 2 x max minus 2', 'Optional finisher.', { optional: true, vk: 'pushup' });
      }
      if (!info.maint && !info.dl) {
        it('pow1', hotel ? 'Dumbbell swing: 3 x 12' : 'Kettlebell swing: 3 x 12', 'Hips drive it, arms just hang on. RPE 7. Power fades faster than strength after 50, so keep it fast and crisp.', { vk: 'swing' });
        it('pow2', 'Medicine ball slam, or fast burpee-free alternative: 3 x 8', 'Explosive, then reset. Keep it light and quick.', { optional: true, vk: 'slam' });
      }
      it('mob', 'Shoulder and thoracic mobility, 8 min', '\u2022 Thread the needle x6 each side\n\u2022 Open-book thoracic rotation x8 each side\n\u2022 Wall slides x10\n\u2022 Doorway pec stretch, 30 s each side', { show: true });
    } else {
      if (hotel) {
        hotelLine(it, 'u1', 'One-arm dumbbell row, 50 lb', setsFor(3, info), '10 each side', 10, null, { vk: 'row' });
        hotelLine(it, 'u2', 'Pull-ups if there is a bar, otherwise dumbbell pullover', setsFor(3, info), '8', 8, null, { vk: 'pullup' });
        it('u3', 'Suitcase carry, 50 lb: 3 x 40 m', 'Tall posture, no leaning.', { vk: 'carry' });
        it('u4', 'Rear-delt fly, light dumbbells: 2 x 15', '', { vk: 'reardelt' });
        if (!(S && S.elbow)) it('u5', 'Hammer curl: 2 x 12', '', { vk: 'curl' });
      } else {
        const pr = RX.pullup[info.ph], rr = RX.row[info.ph];
        if (S && S.elbow) liftLine(it, 'u1', 'pullup', info.maint || info.dl ? 3 : 5, '3', 0, { noProg: true, name: 'Pull-up on rings, neutral grip', note: 'Elbow mode: start with the rings neutral, sets of 3, stop each set before pain goes above 3 out of 10. Bodyweight only. Add sets before reps.' });
        else liftLine(it, 'u1', 'pullup', setsFor(pr[0], info), pr[1], adjW('pullup', S, info), { noProg: info.noProg });
        liftLine(it, 'u2', 'row', setsFor(rr[0], info), rr[1], adjW('row', S, info), { noProg: info.noProg, S });
        carryLine(it, 'u3', info.maint ? 2 : 3, adjW('carry', S, info), { noProg: info.noProg, elbow: !!(S && S.elbow) });
        it('u4', 'Dead hang: 2 x 30 s', 'Grip and shoulder health. Relaxed shoulders.', { vk: 'hang' });
        it('u5', 'Rear-delt fly or band pull-aparts: 2 x 15', '', { vk: 'reardelt' });
        if (S && S.elbow) it('u6', 'Elbow exercises from your physio, or isometric wrist extension: 3 x 30 s', 'Do exactly what your physio gave you. Until then, a common starting option: forearm on a table, palm down, hold a light dumbbell level for 30 seconds. Pain 3 out of 10 or less and settled by morning.', { optional: true });
        else it('u6', 'Hammer curl: ' + (info.maint ? 1 : 2) + ' x 10-12', '', { vk: 'curl' });
      }
      it('u7', 'Pallof press: 3 x 10 each side', 'Anti-rotation. Slow.', { vk: 'pallof' });
      it('u8', 'Hanging knee raise or lying leg raise: 3 x 10', '', { vk: 'kneeraise' });
      it('mob', 'Hips and thoracic mobility, 8 min', '\u2022 90/90 hip switches x8 each side\n\u2022 Hip circles against a wall x6 each way\n\u2022 Thoracic rotation on all fours x6 each side\n\u2022 Child\'s pose with a side reach, 30 s each side', { show: true });
    }
  }

  function startHint(def, variant, S) {
    const sp = def.spec, hotel = variant === 'hotel';
    const key = sp.t === 'z2' ? 'z2' : sp.t === 'long' ? 'long' : sp.t;
    const lv = lastVals(S || { items: {} }, key);
    const last = lv && (lv.inc || lv.spd) ? ' Last time: ' + (lv.inc || '?') + '% at ' + (lv.spd || '?') + ' km/h.' : '';
    switch (sp.t) {
      case 'int44': case 'int63': case 'int101': case 'int33':
        return hotel
          ? 'Target 177+ bpm by minute 2. Hotel treadmill: max incline, run or fast-walk, raise speed until you get there.' + last
          : 'Target 177+ bpm by minute 2. Start near 5 km/h at 25%, then change incline or speed to get there. Recover at about 3 km/h.' + last;
      case 'z4':
        return 'Hold 167-176 bpm. Start from your Z2 setting and add 3-5 points of incline, then adjust.' + (hotel ? ' No pack: use max incline and speed.' : '') + last;
      case 'z3':
        return 'Hold 153-166 bpm. Start from your Z2 setting and add 2-3 points of incline, then adjust.' + (hotel ? ' No pack: use max incline and speed.' : '') + last;
      case 'z2':
        return hotel
          ? 'Hold 138-152 bpm. Max incline, then raise speed until you are in the zone.' + last
          : 'Hold 138-152 bpm. Start about 4-5 km/h at 8-15%, then adjust.' + last;
      case 'long':
        return hotel
          ? 'Hold 138-152 bpm. Max incline, then raise speed until you are in the zone.' + last
          : 'Hold 138-152 bpm at 600-900 vertical m per hour: about 4-4.5 km/h at 15-20%.' + last;
      case 'test':
        return 'Pick settings you can hold for 30 minutes. Start from your Z4 setting.' + last;
      default: return '';
    }
  }

  function reqKeys(def) {
    return buildItems(def, 'home', { items: {} }).filter(i => !i.optional && !i.fields_only).map(i => i.key).filter(k => k !== 'log');
  }

  /* ---------- planner ---------- */
  function hotelPen(def) {
    const k = def.kind;
    if (k === 'long' || LEG[k]) return 100;
    if (k === 'push' || k === 'pull') return 10;
    if (k === 'h1' && def.spec.pack) return 20;
    return 0;
  }

  function planWeek(w, S, today) {
    S = S || {};
    S.modes = S.modes || {}; S.tired = S.tired || {}; S.items = S.items || {}; S.skip = S.skip || {}; S.cant = S.cant || {};
    const ws = weekStart(w);
    const dates = [0, 1, 2, 3, 4, 5, 6].map(i => Dt.add(ws, i));
    const idx = d => Dt.diff(d, ws);
    const modeOf = d => S.modes[d] || 'home';
    const defs = weekSessions(w);
    const entries = defs.map(def => ({ def, status: 'pending', date: null, moved: null, reason: '', p: progress(def) }));
    const placed = [];
    const changes = [];

    function progress(def) {
      const keys = reqKeys(def);
      let done = 0, skipped = 0, first = null, last = null;
      keys.forEach(k => {
        const id = def.id + ':' + k;
        const r = S.items[id];
        if (r && r.done) { done++; if (!first || r.date < first) first = r.date; if (!last || r.date > last) last = r.date; }
        else if (S.skip[id]) skipped++;
      });
      return { total: keys.length, done, skipped, first, last, keys };
    }

    // fixed: started or done
    entries.forEach(e => {
      if (e.p.done > 0) {
        const d = e.p.first;
        e.date = idx(d) >= 0 && idx(d) < 7 ? d : dates[e.def.pref];
        e.status = e.p.done + e.p.skipped >= e.p.total ? 'done' : 'partial';
        placed.push(e);
      }
    });

    const spacingOK = (kind, di) => {
      for (const p of placed) {
        const pk = p.def.kind, pd = idx(p.date);
        if (HARD[kind] && HARD[pk] && Math.abs(pd - di) < 2) return false;
        if (LEG[kind] && LEG[pk] && Math.abs(pd - di) < 2) return false;
        if (kind === 'long2' && HARD[pk] && pd === di) return false;
      }
      return true;
    };
    const stackPen = (kind, di) => {
      let pen = 0;
      for (const p of placed) {
        if (idx(p.date) !== di) continue;
        const pk = p.def.kind;
        if (LEG[kind]) {
          if (pk === 'long') pen += 120;
          else if (HARD[pk] && !(kind === 'legB' && (pk === 'h2' || pk === 'test'))) pen += 15;
        }
        if (kind === 'long' && LEG[pk]) pen += 120;
        if (kind === 'push' || kind === 'pull') {
          if (pk === 'long') pen += 30;
          else if (HARD[pk]) pen += 8;
          else if (LEG[pk]) pen += 10;
          else if (pk === 'push' || pk === 'pull') pen += 12;
        }
        if ((kind === 'h1' || kind === 'h2' || kind === 'test') && LEG[pk] && !(pk === 'legB' && kind !== 'h1')) pen += 15;
      }
      if (HARD[kind]) {
        // avoid squeezing a hard session next to one that has not been placed yet
        for (const o of entries) {
          if (o.date || o.def.kind === kind || !HARD[o.def.kind]) continue;
          if (Math.abs(dates[o.def.pref] === undefined ? 9 : idx(dates[o.def.pref]) - di) < 2) pen += 20;
        }
      }
      return pen;
    };

    const pending = entries.filter(e => !e.date).sort((a, b) => ORDER.indexOf(a.def.kind) - ORDER.indexOf(b.def.kind));
    pending.forEach(e => {
      const def = e.def, kind = def.kind, prefD = dates[def.pref];
      const cantD = S.cant[def.id];
      if (!RESCHED[kind]) {
        e.date = prefD;
        if (cantD) { e.status = 'skipped'; e.reason = 'Marked "can\'t do"'; }
        else if (Dt.diff(prefD, today) < 0) { e.status = 'missed'; }
        else if (modeOf(prefD) === 'off') { e.status = 'dropped'; e.reason = 'Off day'; }
        placed.push(e);
        return;
      }
      let minD = today;
      if (cantD && Dt.diff(cantD, minD) >= 0) minD = Dt.add(cantD, 1);
      let best = null;
      for (let di = 0; di < 7; di++) {
        const d = dates[di];
        if (Dt.diff(d, minD) < 0) continue;
        if (modeOf(d) === 'off') continue;
        if (S.tired[d] && (HARD[kind] || kind === 'long2')) continue;
        if (!spacingOK(kind, di)) continue;
        let score = Math.abs(di - def.pref) * 5 + stackPen(kind, di);
        if (modeOf(d) === 'hotel') score += hotelPen(def);
        if (!best || score < best.score) best = { di, score };
      }
      if (best && kind === 'legB' && modeOf(dates[best.di]) === 'hotel') best = null;
      if (!best) {
        e.date = prefD;
        if (Dt.diff(prefD, today) < 0 || (cantD && Dt.diff(cantD, today) <= 0)) {
          e.status = 'missed';
          e.reason = kind === 'legB' ? 'No home day left for a second leg day' : 'No day left this week that keeps hard days 48 hours apart';
        } else {
          e.status = 'dropped';
          e.reason = kind === 'legB' ? 'No home day this week for a second leg day' : 'No day this week fits';
        }
        placed.push(e);
        return;
      }
      e.date = dates[best.di];
      if (best.di !== def.pref) {
        e.moved = DN[def.pref];
        if (cantD) e.reason = 'You could not do it ' + DN[idx(cantD)] + '.';
        else if (Dt.diff(prefD, today) < 0) e.reason = 'Missed ' + DN[def.pref] + '.';
        else if (modeOf(prefD) === 'off') e.reason = DN[def.pref] + ' is an off day.';
        else if (S.tired[prefD] && (HARD[kind] || kind === 'long2')) e.reason = DN[def.pref] + ' is marked tired, so intensity moved.';
        else if (modeOf(prefD) === 'hotel' && modeOf(e.date) === 'home' && hotelPen(def) > 0) e.reason = DN[def.pref] + ' is a hotel day; moved to a home day for the full session.';
        else e.reason = 'Moved to keep hard days 48 hours apart.';
      }
      placed.push(e);
    });

    // days
    const days = dates.map((d, i) => ({ date: d, di: i, mode: modeOf(d), modeSet: !!S.modes[d], tired: !!S.tired[d], sessions: [], makeups: [], extra: [] }));
    entries.forEach(e => { if (e.date) days[idx(e.date)].sessions.push(e); });

    // tired swap
    days.forEach(day => {
      if (!day.tired) return;
      const lost = entries.some(e => HARD[e.def.kind] && dates[e.def.pref] === day.date && e.date !== day.date);
      const none = !day.sessions.some(e => e.status === 'pending' || e.status === 'partial' || e.status === 'done');
      if (lost || none) {
        const def = { id: 'tz:' + day.date, kind: 'easy', slot: 'tz', w, pref: day.di, spec: Z2(40, 0, 'Easy Z2, tired swap') };
        const p = progress(def);
        day.sessions.push({ def, status: p.done === p.total && p.total ? 'done' : 'pending', date: day.date, moved: null, reason: 'Tired day: easy work only.', p, swap: true });
      }
    });

    // make-ups for skipped or unfinished leg lifts
    entries.forEach(e => {
      if (!LEG[e.def.kind]) return;
      if (e.status !== 'partial' && e.status !== 'pending' && e.status !== 'done') return;
      const items = buildItems(e.def, 'home', S).filter(i => i.mk);
      items.forEach(item => {
        const skipD = S.skip[item.id];
        const rec = S.items[item.id];
        if (rec && rec.done) return;
        let eligible = false, earliest = null;
        if (skipD) { eligible = true; earliest = Dt.add(skipD, 1); }
        else if (e.status === 'partial' && Dt.diff(e.date, today) < 0) { eligible = true; earliest = today; }
        if (!eligible) return;
        const mk = S.items['MK:' + item.id];
        const exist = days.find(dd => dd.makeups.some(m => m.srcId === item.id));
        if (exist) return;
        let tgt = null;
        if (mk && mk.done) { const di = idx(mk.date); if (di >= 0 && di < 7) tgt = days[di]; }
        if (!tgt) {
          const lo = Dt.diff(earliest, today) < 0 ? today : earliest;
          const startIdx = Math.max(0, idx(Dt.diff(lo, ws) >= 0 ? lo : ws));
          for (let di = Math.max(idx(e.date) + 1, startIdx, 0); di < Math.min(7, idx(e.date) + 4); di++) {
            const dd = days[di];
            if (Dt.diff(dd.date, lo) < 0) continue;
            if (dd.mode === 'off') continue;
            if (dd.sessions.some(s => (HARD[s.def.kind] || LEG[s.def.kind]) && (s.status === 'pending' || s.status === 'partial' || s.status === 'done'))) continue;
            tgt = dd; break;
          }
        }
        if (!tgt) { changes.push({ type: 'dropped', text: 'Dropped (no easy day within 3 days): ' + item.label.split(':')[0] }); return; }
        const v = tgt.mode === 'hotel' ? 'hotel' : 'home';
        const alt = buildItems(e.def, v, S).find(i => i.key === item.key) || item;
        tgt.makeups.push({ id: 'MK:' + item.id, srcId: item.id, label: 'Make-up: ' + alt.label, detail: alt.detail, fields: alt.fields, lift: alt.lift, nop: true, inline: alt.inline, tgt: alt.tgt, chips: null, vk: alt.vk, from: DN[idx(e.date)] });
        changes.push({ type: 'makeup', text: 'Make-up on ' + DN[tgt.di] + ': ' + item.label.split(':')[0] });
      });
    });

    // changes list
    entries.forEach(e => {
      const t = titleOf(e.def);
      if (e.moved) changes.push({ type: 'moved', text: t + ' moved from ' + e.moved + ' to ' + DN[idx(e.date)] + '. ' + e.reason, id: e.def.id });
      else if (e.status === 'dropped' || e.status === 'skipped') changes.push({ type: 'dropped', text: t + ' dropped. ' + e.reason, id: e.def.id });
      else if (e.status === 'missed' && Dt.diff(e.date, today) >= -3) changes.push({ type: 'missed', text: t + ' missed. ' + e.reason, id: e.def.id });
    });

    return { w, ws, days, changes, entries };
  }

  function sortSessions(list) {
    return list.slice().sort((a, b) => SHOW_ORDER.indexOf(a.def.kind) - SHOW_ORDER.indexOf(b.def.kind));
  }

  function sessionVariant(day) { return day.mode === 'hotel' ? 'hotel' : 'home'; }

  /* ---------- stats ---------- */
  function weekVertical(S, w) {
    const ws = weekStart(w);
    let tot = 0;
    const items = S.items || {};
    for (const id in items) {
      const r = items[id];
      if (!r || !r.done || !r.vals || !r.ltype) continue;
      const di = Dt.diff(r.date, ws);
      if (di < 0 || di > 6) continue;
      tot += vert(r.vals.min, r.vals.inc, r.vals.spd);
    }
    return tot;
  }

  return {
    Dt, START, TRIP, LAST_WEEK, DN, weekNum, weekStart, phaseOf, PHASE_NAMES, isDeload, ZONES,
    weekSessions, buildItems, startHint, planWeek, sortSessions, sessionVariant, titleOf, estMin, reqKeys,
    liftNext, capOf, lastVals, videoFor, vert, hm, weekVertical, LIFTS, HARD, LEG, RESCHED
  };
});
