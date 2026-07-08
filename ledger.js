(function(){
  var DB_KEY = 'tokyo2026ledger9v3kq8xzt4';
  var READ_URL = 'https://textdb.online/' + DB_KEY;
  var WRITE_URL = 'https://textdb.online/update';
  var KEY = 'tokyo-trip-ledger-v2', OLDKEY = 'tokyo-trip-ledger-v1', RATE = 0.21;
  var state = {peopleTs:0, people:[], exp:[], delExp:[]};
  try{ var raw = localStorage.getItem(KEY); if(raw){ state = normalize(JSON.parse(raw)); } }catch(e){}
  try{ // 匯入舊版（未同步時期）的本機資料
    var old = localStorage.getItem(OLDKEY);
    if(old){
      var o = JSON.parse(old);
      (o.people || []).forEach(function(p){ if(state.people.indexOf(p) < 0){ state.people.push(p); } });
      (o.exp || []).forEach(function(e){
        e.ts = e.ts || parseInt(e.id, 10) || 0;
        if(!state.exp.some(function(x){ return x.id === e.id; })){ state.exp.push(e); }
      });
      state.peopleTs = Date.now();
      localStorage.removeItem(OLDKEY);
    }
  }catch(e){}
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
  var filter = 'all';
  var $ = function(id){ return document.getElementById(id); };
  var yen = function(n){ return '¥' + n.toLocaleString('ja-JP'); };

  function normalize(s){
    s = s || {};
    var n = {peopleTs: s.peopleTs || 0, people: (s.people || []).slice(),
             exp: (s.exp || []).slice(), delExp: (s.delExp || []).slice()};
    n.delExp.sort();
    n.exp = n.exp.filter(function(e){ return n.delExp.indexOf(e.id) < 0; });
    n.exp.sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); });
    n.exp.forEach(function(e){ if(n.people.indexOf(e.p) < 0){ n.people.push(e.p); } });
    return n;
  }
  function merge(a, b){
    var m = {delExp: [], exp: []};
    var newer = (a.peopleTs || 0) >= (b.peopleTs || 0) ? a : b;
    m.peopleTs = newer.peopleTs || 0;
    m.people = (newer.people || []).slice();
    (a.delExp || []).concat(b.delExp || []).forEach(function(id){
      if(m.delExp.indexOf(id) < 0){ m.delExp.push(id); }
    });
    var seen = {};
    (a.exp || []).concat(b.exp || []).forEach(function(e){
      if(!seen[e.id]){ seen[e.id] = true; m.exp.push(e); }
    });
    return normalize(m);
  }

  var syncTimer = null, syncing = false;
  function setSync(txt){ var el = $('syncState'); if(el){ el.textContent = txt; } }
  function syncNow(){
    if(syncing){ return; }
    syncing = true;
    setSync('☁️ 同步中…');
    fetch(READ_URL, {cache:'no-store'})
      .then(function(r){
        if(!r.ok){ throw new Error('http' + r.status); }
        return r.text();
      })
      .then(function(txt){
        var remote = null;
        try{ remote = txt ? JSON.parse(txt) : null; }catch(e){}
        remote = normalize(remote || {});
        var merged = merge(state, remote);
        var changedLocal = JSON.stringify(merged) !== JSON.stringify(normalize(state));
        var changedRemote = JSON.stringify(merged) !== JSON.stringify(remote);
        state = merged; save();
        if(changedLocal){ render(); }
        if(changedRemote){
          return fetch(WRITE_URL, {method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:'key=' + DB_KEY + '&value=' + encodeURIComponent(JSON.stringify(state))})
            .then(function(r){ if(!r.ok){ throw new Error('http' + r.status); } return r.json(); })
            .then(function(j){ if(j.status !== 1){ throw new Error('write'); } });
        }
      })
      .then(function(){ setSync('☁️ 已同步'); })
      .catch(function(){ setSync('📴 離線（已存本機，恢復連線自動補傳）'); })
      .finally(function(){ syncing = false; });
  }
  function queueSync(){ clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, 300); }
  setInterval(syncNow, 5000);
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible'){ syncNow(); }
  });

  function esc(s){
    return s.replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function render(){
    var chips = state.people.map(function(p){
      return '<span class="pchip">' + esc(p) +
        '<button type="button" class="x" data-del-person="' + esc(p) + '" aria-label="刪除成員 ' + esc(p) + '">✕</button></span>';
    }).join('');
    $('personChips').innerHTML = chips || '<span class="lempty" style="padding:0">尚無成員</span>';

    $('expPerson').innerHTML = '<option value="" disabled ' + (state.people.length ? '' : 'selected') + '>誰買的？</option>' +
      state.people.map(function(p){ return '<option>' + esc(p) + '</option>'; }).join('');

    var fs = [['all','全部']].concat(state.people.map(function(p){ return [p, p]; }));
    if(filter !== 'all' && state.people.indexOf(filter) < 0){ filter = 'all'; }
    $('filterChips').innerHTML = fs.map(function(f){
      return '<button type="button" class="fchip' + (filter === f[0] ? ' on' : '') + '" data-filter="' + esc(f[0]) + '">' + esc(f[1]) + '</button>';
    }).join('');

    var rows = state.exp.filter(function(e){ return filter === 'all' || e.p === filter; });
    $('expRows').innerHTML = rows.map(function(e){
      return '<tr><td><small>' + esc(e.d) + '</small></td><td>' + esc(e.p) + '</td><td>' + esc(e.i) +
        '</td><td class="num">' + yen(e.a) + '</td>' +
        '<td><button type="button" class="xbtn" data-del-exp="' + e.id + '" aria-label="刪除這筆">✕</button></td></tr>';
    }).join('');
    $('expEmpty').style.display = rows.length ? 'none' : 'block';

    var totals = {}, grand = 0;
    state.exp.forEach(function(e){ totals[e.p] = (totals[e.p] || 0) + e.a; grand += e.a; });
    $('sumTiles').innerHTML = state.people.map(function(p){
      var t = totals[p] || 0;
      return '<div class="sumtile">' + esc(p) + '<b>' + yen(t) + '</b><small>≈ NT$' + Math.round(t * RATE).toLocaleString() + '</small></div>';
    }).join('') + (grand ? '<div class="sumtile grand">三人合計<b>' + yen(grand) + '</b><small>≈ NT$' + Math.round(grand * RATE).toLocaleString() + '</small></div>' : '');
  }

  $('personForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var n = $('personName').value.trim();
    if(!n){ return; }
    if(state.people.indexOf(n) >= 0){ alert('「' + n + '」已經在名單裡了'); return; }
    state.people.push(n); state.peopleTs = Date.now(); $('personName').value = '';
    save(); render(); queueSync();
  });

  $('expForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var p = $('expPerson').value, i = $('expItem').value.trim(), a = Math.round(Number($('expAmt').value));
    if(!p || !i || !(a > 0)){ return; }
    var now = new Date();
    state.exp.unshift({id: now.getTime() + '' + Math.floor(Math.random() * 1000), ts: now.getTime(),
      p: p, i: i, a: a, d: (now.getMonth() + 1) + '/' + now.getDate()});
    $('expItem').value = ''; $('expAmt').value = '';
    save(); render(); queueSync();
  });

  document.getElementById('ledger').addEventListener('click', function(ev){
    var t = ev.target;
    if(t.dataset.filter){ filter = t.dataset.filter; render(); return; }
    if(t.dataset.delExp){
      state.delExp.push(t.dataset.delExp);
      state.exp = state.exp.filter(function(e){ return e.id !== t.dataset.delExp; });
      save(); render(); queueSync(); return;
    }
    if(t.dataset.delPerson){
      var p = t.dataset.delPerson;
      var n = state.exp.filter(function(e){ return e.p === p; }).length;
      if(!confirm('刪除成員「' + p + '」' + (n ? '和他的 ' + n + ' 筆帳目' : '') + '？（三支手機都會刪除）')){ return; }
      state.people = state.people.filter(function(x){ return x !== p; });
      state.peopleTs = Date.now();
      state.exp.forEach(function(e){ if(e.p === p){ state.delExp.push(e.id); } });
      state.exp = state.exp.filter(function(e){ return e.p !== p; });
      save(); render(); queueSync();
    }
  });

  render();
  syncNow();
})();
