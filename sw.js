// 배포할 때마다 손으로 올린다. 올리지 않으면 오프라인에서 옛 버전이 남는다.
var CACHE='dungeon-log-v2';
var ASSETS=['./','./index.html','./manifest.json',
  './icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k===CACHE?null:caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  // 앱 파일만 캐시한다. GitHub API 응답을 캐시하면 동기화가 옛 데이터를 읽는다.
  if(new URL(e.request.url).origin!==self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request,copy); });
      return res;
    }).catch(function(){ return caches.match(e.request).then(function(r){ return r||caches.match('./index.html'); }); })
  );
});
