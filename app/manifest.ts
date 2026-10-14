import type {MetadataRoute} from 'next'
export default function manifest():MetadataRoute.Manifest{return {
 id:'/dashboard',name:'Koryx',short_name:'Koryx',description:'Your projects and conversations with Koryx.',
 start_url:'/dashboard/chats',scope:'/',display:'standalone',background_color:'#0a0a0a',theme_color:'#0a0a0a',
 icons:[{src:'/brand/app-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/brand/app-512.png',sizes:'512x512',type:'image/png',purpose:'any'}],
 shortcuts:[{name:'Chat',url:'/dashboard/chats',icons:[{src:'/brand/app-192.png',sizes:'192x192'}]}],
}}
