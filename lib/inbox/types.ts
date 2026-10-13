export type InboxAttachment={id:string;filename:string;content_type:string;size:number}
export type InboxEmail={id:string;from:string;to:string[];subject:string;created_at:string;attachments:InboxAttachment[];text?:string;authentication?:Record<string,string>}
export type InboxPage={emails:InboxEmail[];cursor:string|null;hasMore:boolean;configured:boolean;error?:string}
