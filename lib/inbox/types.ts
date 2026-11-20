export type InboxAttachment={id:string;filename:string;content_type:string;size:number;content_id?:string|null;preview_url?:string}
export type InboxEmail={id:string;from:string;to:string[];subject:string;created_at:string;attachments:InboxAttachment[];text?:string;reply_to?:string[];message_id?:string;references?:string;external_images?:string[];authentication?:Record<string,string>}
export type InboxPage={emails:InboxEmail[];cursor:string|null;hasMore:boolean;configured:boolean;canSend?:boolean;error?:string}
export const MAX_MAIL_FILES=10
export const MAX_MAIL_BYTES=4*1024*1024
export const isPreviewImage=(type:string)=>/^image\/(png|jpe?g|gif|webp|avif)$/i.test(type)
