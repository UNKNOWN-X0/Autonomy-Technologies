/* Progress rules shared by the hub (js/index.js), guides (js/guide.js) and labs (js/lab.js), and unit-tested in
   tests/progress.test.js. A chapter stores <prefix>-checks ({key: true}, lab experiments as lab-<id>) and
   <prefix>-log ({days: ["YYYY-MM-DD", …]}, local dates) in localStorage. No DOM here. */
(function (root) {
  var GAPS = [1, 7, 30],
    DAY = 86400000;

  // Today's local date as YYYY-MM-DD.
  function stamp(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function read(store, key, fallback) {
    try {
      var v = JSON.parse(store.getItem(key));
      return v && typeof v === "object" ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(store, key, value) {
    try {
      store.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
  // Adds a study day to <prefix>-log, re-reading first so a day another tab logged is never overwritten.
  function logDay(store, prefix, day) {
    var log = read(store, prefix + "-log", { days: [] });
    if (!Array.isArray(log.days)) log.days = [];
    day = day || stamp();
    if (log.days.indexOf(day) === -1) log.days.push(day);
    write(store, prefix + "-log", log);
    return log;
  }
  // Drops guide keys that are no longer on the page (a renamed or removed checklist item); lab-<id> keys stay.
  function prune(checks, keep) {
    var changed = false;
    Object.keys(checks).forEach(function (k) {
      if (k.indexOf("lab-") !== 0 && keep.indexOf(k) === -1) {
        delete checks[k];
        changed = true;
      }
    });
    return changed;
  }
  // Ticked guide skills and lab experiments, each capped at its size on the page.
  function count(checks, total, lab) {
    var guide = 0,
      labs = 0;
    Object.keys(checks).forEach(function (k) {
      if (!checks[k]) return;
      if (k.indexOf("lab-") === 0) labs++;
      else guide++;
    });
    guide = Math.min(guide, Math.max(total - lab, 0));
    labs = Math.min(labs, lab);
    return { guideDone: guide, labDone: labs, done: guide + labs };
  }
  // Counts the two explicit states used by worked-solution problems.
  function countSolved(checks) {
    var worked = 0,
      redo = 0;
    Object.keys(checks || {}).forEach(function (key) {
      if (checks[key] === "worked") worked++;
      else if (checks[key] === "redo") redo++;
    });
    return { worked: worked, redo: redo };
  }
  function utcDay(s) {
    var p = s.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  // Spaced review: each distinct study day widens the gap (1, 7, then 30 days). weight = days since / gap;
  // a chapter is fresh below 1, due from 1, overdue from 2. Ticks with no logged day count as due.
  function review(days, done, today) {
    var r = { state: "new", since: null, gap: GAPS[0], weight: 0 },
      sorted = (days || []).slice().sort();
    today = today || stamp();
    if (sorted.length) {
      r.gap = GAPS[Math.min(sorted.length, GAPS.length) - 1];
      r.since = Math.round((utcDay(today) - utcDay(sorted[sorted.length - 1])) / DAY);
      r.weight = r.since / r.gap;
      r.state = r.weight >= 2 ? "overdue" : r.weight >= 1 ? "due" : "fresh";
    } else if (done > 0) {
      r.state = "due";
      r.weight = 1;
    }
    return r;
  }
  // One string of every chapter's saved progress, to tell whether anything changed since a page was drawn.
  function signature(store) {
    var parts = [];
    for (var i = 0; i < store.length; i++) {
      var k = store.key(i);
      if (/-(checks|log)$/.test(k)) parts.push(k + "=" + store.getItem(k));
    }
    return parts.sort().join("\n");
  }

  var SAVED = /-(checks|log|lab)$/;
  // Every chapter's ticks, review days and lab answers as one object, for a backup file.
  function exportData(store) {
    var data = {};
    for (var i = 0; i < store.length; i++) {
      var k = store.key(i);
      if (SAVED.test(k)) data[k] = read(store, k, null);
    }
    return { site: "autonomy-technologies", version: 1, exported: new Date().toISOString(), data: data };
  }
  // Merges a backup into this browser: a skill ticked in either is ticked, review days are joined, and lab answers
  // saved here win over the file's. Returns the number of chapters' entries changed; throws on a file that is not a backup.
  function importData(store, file) {
    if (!file || file.site !== "autonomy-technologies" || !file.data || typeof file.data !== "object") throw new Error("not a progress file from this site");
    var changed = 0;
    Object.keys(file.data).forEach(function (k) {
      var v = file.data[k];
      if (!SAVED.test(k) || !v || typeof v !== "object") return;
      var have = read(store, k, null),
        out;
      if (/-checks$/.test(k)) {
        out = Object.assign({}, have || {});
        Object.keys(v).forEach(function (c) {
          if (v[c] === true || v[c] === "worked" || v[c] === "redo") out[c] = v[c];
        });
      } else if (/-log$/.test(k)) {
        var days = ((have && Array.isArray(have.days) && have.days) || []).slice();
        (Array.isArray(v.days) ? v.days : []).forEach(function (d) {
          if (/^\d{4}-\d\d-\d\d$/.test(d) && days.indexOf(d) === -1) days.push(d);
        });
        out = { days: days.sort() };
      } else out = Object.assign({}, v, have || {});
      if (JSON.stringify(out) !== JSON.stringify(have)) {
        write(store, k, out);
        changed++;
      }
    });
    return changed;
  }

  // localStorage, or an in-memory stand-in where the browser blocks storage (reading the property itself can throw).
  var local;
  try {
    local = root.localStorage;
    local.length;
  } catch (e) {
    var mem = {};
    local = {
      get length() { return Object.keys(mem).length; },
      key: function (i) { return Object.keys(mem)[i]; },
      getItem: function (k) { return k in mem ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
    };
  }

  var api = { local: local, GAPS: GAPS, stamp: stamp, read: read, write: write, logDay: logDay, prune: prune, count: count, countSolved: countSolved, review: review, signature: signature, exportData: exportData, importData: importData };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.siteProgress = api;
})(this);
