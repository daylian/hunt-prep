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
  const RESCHED = { h1: 1, h2: 1, long: 1, test: 1, legA: 1, leg1: 1, legB: 1, long2: 1 };
  const ORDER = ['legA', 'leg1', 'long', 'h1', 'h2', 'test', 'legB', 'long2', 'upper', 'z2', 'easy'];
  const SHOW_ORDER = ['h1', 'h2', 'test', 'long', 'long2', 'z2', 'easy', 'legA', 'leg1', 'legB', 'upper'];

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
      if (ph !== 2) add('legB', 'legB', 3, { t: 'leg', v: 'B', ph, w });
      add('upper', 'upper', 4, { t: 'upper' });
      add('long', 'long', 5, { t: 'long', min: t.lg[0], pack: t.lg[1], outdoor: ph >= 3 });
      if (t.long2) add('long2', 'long2', 6, t.long2);
    } else if (ph === 4) {
      const t = WK[w];
      add('h1', 'h1', 1, t.h1);
      add('leg', 'leg1', 2, { t: 'leg', v: 'ONE', ph: 4, w });
      add('h2', 'h2', 3, t.h2);
      add('easy', 'easy', 4, Z2(35, 0, 'Easy Z2'));
      add('long', 'long', 5, { t: 'long', min: t.lg[0], pack: t.lg[1], packtest: w === 40 });
      if (t.long2) add('long2', 'long2', 6, t.long2);
    } else if (w === 45) {
      add('h1', 'h1', 1, Z2(60, 26, 'Loaded climb'));
      add('leg', 'leg1', 2, { t: 'leg', v: 'ONE', ph: 5, w, taper: true });
      add('h2', 'h2', 3, I44(3));
      add('easy', 'easy', 4, Z2(30, 0, 'Easy Z2'));
      add('long', 'long', 5, { t: 'long', min: 120, pack: 26, easy: true });
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
    squat: { name: 'Back squat', start: 195, inc: 5 },
    trap: { name: 'Trap bar deadlift', start: 317, inc: 5 },
    rdl: { name: 'Romanian deadlift', start: 215, inc: 5 },
    bulg: { name: 'Bulgarian split squat', start: 35, inc: 5 }
  };
  const RX = {
    squat: { 1: [3, '8'], 2: [2, '5'], 3: [3, '6'], 4: [2, '5'] },
    trap: { 1: [3, '5'], 2: [2, '5'], 3: [3, '5'], 4: [2, '5'] },
    rdl: { 1: [3, '6-8'], 2: [2, '6'], 3: [3, '6'], 4: [2, '6'] },
    bulg: { 1: [3, '8'], 2: [2, '8'], 3: [3, '8'], 4: [2, '8'] }
  };
  const HOTEL_LIFT = {
    squat: { name: 'Goblet squat, one 50 lb dumbbell', reps: '12, 3 s lowering' },
    trap: { name: 'Dumbbell RDL, two 50 lb dumbbells', reps: '10, slow' },
    rdl: { name: 'Single-leg RDL, 50 lb dumbbells', reps: '8 each leg' },
    bulg: { name: 'Dumbbell Bulgarian split squat, 50 lb each hand', reps: '10 each leg' },
    step: { name: 'Dumbbell step-up, 50 lb each hand', reps: '10 each leg' }
  };

  function legSpecInfo(sp) {
    const ph = sp.ph === 5 ? 4 : sp.ph;
    const dl = isDeload(sp.w);
    const maint = sp.ph === 2 || sp.ph === 4 || sp.ph === 5;
    return { ph, dl, maint, taper: !!sp.taper, noProg: dl || maint || !!sp.taper };
  }
  function legPlan(sp) {
    // returns ordered list of [slotKey, liftKey]
    if (sp.v === 'A') return [['l1', 'trap'], ['l2', 'bulg']];
    if (sp.v === 'B') return sp.ph === 3 ? [['l1', 'squat'], ['l2', 'rdl'], ['l3', 'step']] : [['l1', 'squat'], ['l2', 'rdl']];
    return [['l1', 'squat'], ['l2', 'trap'], ['l3', 'rdl'], ['l4', 'bulg']];
  }

  /* ---------- logs helpers ---------- */
  function liftNext(key, S) {
    let best = null;
    const items = S.items || {};
    for (const id in items) {
      const r = items[id];
      if (r && r.done && r.lift === key && !r.nop && r.vals && +r.vals.w > 0) {
        if (!best || r.date >= best.date) best = r;
      }
    }
    if (!best) return LIFTS[key].start;
    return +best.vals.w + (best.vals.clean ? LIFTS[key].inc : 0);
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
      case 'int44': return '4x4 VO2 intervals, ' + s.r + ' rounds';
      case 'int63': return '6x3 min VO2 intervals';
      case 'int101': return '10x1 min intervals, 2 sets';
      case 'int33': return 'Opener: 3x3 min at Z5';
      case 'z4': return 'Threshold: ' + blocksLabel(s.b) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'z3': return 'Loaded tempo: ' + blocksLabel(s.b) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'z2': return (s.label || 'Z2 climb') + ', ' + s.min + ' min' + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'long':
        if (s.packout) return 'Packout simulation, ' + hm(s.min) + ', ' + s.pack + ' lb';
        return (s.easy ? 'Easy long climb, ' : 'Long climb, ') + hm(s.min) + (s.pack ? ', pack ' + s.pack + ' lb' : '');
      case 'test': return '30-minute threshold test';
      case 'leg': return legTitle(s);
      case 'upper': return 'Upper Day';
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
      case 'upper': return 45;
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
          it('r' + k, 'Round ' + k + ' of ' + sp.r + ': 4 min hard, 3 min easy',
            'HR 177+ by minute 2, finish 183-188. Recovery about 3 km/h, HR to 140 or lower.' +
            (hotel ? hotelInt : ' Start near 5 km/h at 25%, hold incline and switch with speed.') + (k === 1 ? lastTxt + inc : ''));
        }
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        it('log', 'Log the numbers', 'Hands off the rails after the first minute.', { fields: logFields, optional: true, ltype: sp.t });
        break;
      }
      case 'int63': {
        it('warm', 'Warm-up, 10 min', '5 min easy at 5-8% incline, then 3 x 1 min stepping up.');
        for (let k = 1; k <= sp.r; k++) it('r' + k, 'Round ' + k + ' of ' + sp.r + ': 3 min hard, 2 min easy', 'Same HR target as the 4x4: 177+ by minute 1.5.' + (hotel ? hotelInt : '') + (k === 1 ? lastTxt : ''));
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
        for (let k = 1; k <= sp.r; k++) it('r' + k, 'Opener ' + k + ' of ' + sp.r + ': 3 min at Z5, 3 min easy', 'This is the last hard effort before the trip. Sharp, not heroic.' + (hotel ? hotelInt : ''));
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
        let d = 'HR 138-152. Typical 4-5 km/h at 8-15%. Hands off the rails.';
        if (hotel) d = 'HR 138-152. Max incline, then raise speed until HR sits in the zone. Hands off the rails.' + (sp.pack ? ' No pack, so extra time.' : '');
        if (sp.map) d += ' Note which incline and speed give 140-150 bpm; that is your map.';
        it('main', (sp.label || 'Z2 climb') + ': ' + mins + ' min' + (pack ? ', pack ' + pack + ' lb' : ''), d, { fields: climbFields(mins, pack), ltype: 'z2' });
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
        it('main', (sp.packout ? 'Packout simulation: ' : sp.easy ? 'Easy long climb: ' : 'Long climb: ') + mins + ' min in Z2' + (pack ? ', pack ' + pack + ' lb' : ''), d, { fields: climbFields(mins, pack), ltype: 'long' });
        break;
      }
      case 'test': {
        it('warm', 'Warm-up, 15 min', 'Progressive, finish with 3 x 1 min harder.');
        it('main', '30 min as hard as you can hold steady', 'Pick settings you can hold for the full 30. The average HR of the last 20 minutes is your threshold HR.' + (hotel ? ' Hotel treadmill: run or fast-walk at max incline.' : ''),
          { fields: [{ k: 'hr20', l: 'Avg HR last 20' }, { k: 'inc', l: 'Incline %' }, { k: 'spd', l: 'km/h' }, { k: 'min', l: 'Minutes', d: 30 }], ltype: 'test' });
        it('cool', 'Cool-down, 5 min', 'Easy walk.');
        break;
      }
      case 'leg': legItems(sp, hotel, S, it); break;
      case 'upper': {
        if (hotel) {
          it('u1', 'One-arm dumbbell row, 50 lb: 3 x 8-10 each side', '');
          it('u2', 'Dumbbell overhead press: 3 x 8', 'Pick a weight that leaves 2 reps in reserve.');
          it('u3', 'Rear-delt fly, light dumbbells: 2 x 15', '');
          it('u4', 'Dumbbell suitcase carry, 50 lb: 3 x 40 m', '');
          it('u5', 'Side plank: 3 x 30 s each side', '');
          it('u6', 'Lying leg raises: 3 x 10', '');
        } else {
          it('u1', 'Pull-ups or rows: 3 x 6-8', 'Leave 2 reps in reserve.');
          it('u2', 'Overhead press: 3 x 6', '');
          it('u3', 'Band pull-aparts: 2 x 15', '');
          it('u4', 'Farmer or suitcase carries, heavy: 3 x 40 m', '');
          it('u5', 'Pallof press: 3 x 10 each side', '');
          it('u6', 'Hanging knee raises: 3 x 10', '');
        }
        it('mob', 'Hips and ankles mobility, 10 min', '');
        it('z2opt', '20 min easy Z2 after, if fresh', 'Optional.', { optional: true });
        break;
      }
      default: break;
    }
    return I.map(x => Object.assign({ id: def.id + ':' + x.key }, x));
  }

  function legItems(sp, hotel, S, it) {
    const info = legSpecInfo(sp);
    const plan = legPlan(sp);
    plan.forEach(pair => {
      const slot = pair[0], key = pair[1];
      if (key === 'step') {
        const sets = info.dl ? 2 : 3;
        if (hotel) it(slot, HOTEL_LIFT.step.name + ': ' + sets + ' x ' + HOTEL_LIFT.step.reps, 'Bench or sturdy step. Leave 2 reps in reserve.', { lift: null, mk: true });
        else it(slot, 'Slow step-down, 40 cm box: ' + sets + ' x 10 each leg', '3 seconds down. Add the hunting pack or dumbbells when it feels easy.', { mk: true });
        return;
      }
      const rx = RX[key][info.ph];
      let sets = rx[0];
      if (info.dl) sets = Math.max(1, sets - 1);
      if (info.taper) sets = Math.min(sets, 2);
      if (hotel) {
        const h = HOTEL_LIFT[key];
        it(slot, h.name + ': ' + sets + ' x ' + h.reps, 'Leave 2 reps in reserve. Maintenance only; heavy numbers resume at home.', { mk: true, liftKey: key });
        return;
      }
      let w = liftNext(key, S);
      if (info.taper) w = r5(w * 0.8);
      else if (info.dl) w = r5(w * 0.9);
      const per = key === 'bulg' ? ' lb dumbbells, each hand' : ' lb';
      it(slot, LIFTS[key].name + ': ' + sets + ' x ' + rx[1] + ' at ' + w + per,
        info.noProg ? 'Hold the weight. 2 reps in reserve.' : 'Tick "clean" only if every rep was solid with 2 in reserve. Clean sets add ' + LIFTS[key].inc + ' lb next time.',
        { lift: key, nop: info.noProg, mk: true, liftKey: key, fields: [{ k: 'w', l: key === 'bulg' ? 'lb each' : 'lb', d: w }], clean: !info.noProg });
    });
    const solSets = info.ph === 1 || info.ph === 3 ? 4 : 3;
    it('sol', 'Soleus raise, bent knee, slow and heavy: ' + (info.dl ? solSets - 1 : solSets) + ' x 8', hotel ? 'Dumbbell on the knee, seated, or standing with a bent knee.' : 'Pain above 3 out of 10 means cut incline for a week.');
    if (sp.v !== 'B') it('calf', 'Standing calf raise: ' + (info.maint ? 2 : 3) + ' x 10', hotel ? 'Single leg, dumbbell in hand.' : '');
  }

  function reqKeys(def) {
    return buildItems(def, 'home', { items: {} }).filter(i => !i.optional && !i.fields_only).map(i => i.key).filter(k => k !== 'log');
  }

  /* ---------- planner ---------- */
  function hotelPen(def) {
    const k = def.kind;
    if (k === 'long' || LEG[k]) return 100;
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
        tgt.makeups.push({ id: 'MK:' + item.id, srcId: item.id, label: 'Make-up: ' + alt.label, detail: alt.detail, fields: alt.fields, lift: alt.lift, nop: true, clean: alt.clean, from: DN[idx(e.date)] });
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
    weekSessions, buildItems, planWeek, sortSessions, sessionVariant, titleOf, estMin, reqKeys,
    liftNext, lastVals, vert, hm, weekVertical, LIFTS, HARD, LEG, RESCHED
  };
});
