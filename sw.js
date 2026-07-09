var CACHE = 'tokyo-trip-v4';
var ASSETS = ['./','./index.html','./map.html','./budget.html','./ledger.html','./tips.html','./apps.html',
  './style.css','./theme.js','./ledger.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET'){ return; }
  var url = new URL(req.url);
  if(url.hostname === 'textdb.online'){ return; }
  if(url.hostname.indexOf('open-meteo') >= 0){ return; } // 天氣永遠拿最新              // 記帳同步永遠走網路
  if(url.hostname.indexOf('tile.openstreetmap') >= 0){ return; } // 地圖磚不快取
  if(url.origin === location.origin){
    // 網路優先（拿最新行程），離線退回快取
    e.respondWith(fetch(req).then(function(res){
      var cl = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, cl); }); return res;
    }).catch(function(){
      return caches.match(req).then(function(r){ return r || caches.match('./index.html'); });
    }));
  }else{
    // 第三方資源（Leaflet）快取優先
    e.respondWith(caches.match(req).then(function(r){
      return r || fetch(req).then(function(res){
        var cl = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, cl); }); return res;
      });
    }));
  }
});
