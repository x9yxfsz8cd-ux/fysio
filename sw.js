// Fysio — offline-ondersteuning.
// Netwerk eerst, zodat je altijd de nieuwste versie krijgt; is er na 3 seconden
// nog geen antwoord (slecht bereik in de sportschool), dan de bewaarde kopie.
const CACHE='fysio-v2';
const BESTANDEN=['./','./index.html','./fysio-oefeningen.html','./nieuw.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BESTANDEN)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(new Promise(resolve=>{
    let klaar=false;
    const uitCache=()=>caches.match(req,{ignoreSearch:true});
    const timer=setTimeout(()=>{
      uitCache().then(r=>{ if(r&&!klaar){klaar=true;resolve(r);} });
    },3000);
    fetch(req).then(res=>{
      clearTimeout(timer);
      if(res.ok){ const kopie=res.clone();caches.open(CACHE).then(c=>c.put(req,kopie)); }
      if(!klaar){klaar=true;resolve(res);}
    }).catch(()=>{
      clearTimeout(timer);
      uitCache().then(r=>{ if(!klaar){klaar=true;resolve(r||Response.error());} });
    });
  }));
});
