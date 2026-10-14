// Endpoints come from untrusted clients. Never allow arbitrary server-side URLs.
export function validPushEndpoint(value:string){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&!url.hash&&value.length<=2048&&(
 url.hostname==='fcm.googleapis.com'||url.hostname==='updates.push.services.mozilla.com'||url.hostname==='web.push.apple.com'||
 /^[a-z0-9-]+\.notify\.windows\.com$/.test(url.hostname)
 )}catch{return false}}
export function pushBody(language:string){return language==='uk'?'Розробник надіслав нове повідомлення.':'Your developer sent a new message.'}
