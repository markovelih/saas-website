export type ChatAttachment = {id:string;name:string;mime:string;size:number}
export type ChatMessage = {id:string;order_id:string;sender_id:string;sender_name:string;sender_role:'client'|'developer';body:string;created_at:string;edited_at:string|null;deleted_at:string|null;pinned:boolean;reply_to:string|null;attachments:ChatAttachment[];pending?:boolean;failed?:boolean}
export type ChatThread = {order_id:string;title:string;client_name?:string;developer_id:string|null;developer_name:string;paid:boolean;can_write:boolean;can_moderate:boolean;pinned:boolean;unread:number;last_body:string;last_at:string;last_read_at:string|null;client_read_at:string|null;developer_read_at?:string|null}
export type ChatEvent = {id:string;order_id:string;status:string;created_at:string}
export type ChatPage = {thread:ChatThread;messages:ChatMessage[];has_more:boolean;pins:ChatMessage[];events?:ChatEvent[]}
export type ChatIdentity = {id:string;name:string;founder:boolean;staff:boolean}
