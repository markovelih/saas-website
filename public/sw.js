/* Koryx: notifications only. Never cache private pages, conversations or API responses. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const url=typeof data.url==='string'&&/^\/dashboard\/chats(?:\?project=[a-f0-9-]{36})?$/.test(data.url)?data.url:'/dashboard/chats';
 event.waitUntil(self.registration.showNotification('Koryx',{
  body:typeof data.body==='string'?data.body.slice(0,160):'Your developer sent a new message.',
  icon:'/brand/app-192.png',badge:'/brand/favicon.png',tag:typeof data.tag==='string'?data.tag:'koryx-chat',data:{url},
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=new URL(event.notification.data?.url||'/dashboard/chats',self.location.origin);
 if(url.origin!==self.location.origin||url.pathname!=='/dashboard/chats')return;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const current=windows.find(client=>new URL(client.url).origin===url.origin&&new URL(client.url).pathname.startsWith('/dashboard'));
  if(current){await current.navigate(url.href);return current.focus()}
  return self.clients.openWindow(url.href);
 })());
});
