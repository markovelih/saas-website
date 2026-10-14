export const CHAT_MAX_FILES=4
export const CHAT_MAX_FILE_BYTES=4*1024*1024
export const CHAT_MAX_BODY=8000
export const CHAT_IMAGE_TYPES=['image/jpeg','image/png','image/webp'] as const
export function firstName(value:string|null|undefined,fallback='Developer'){return value?.trim().split(/\s+/u)[0]?.slice(0,40)||fallback}
export function validateChatImage(file:{type:string;size:number}){if(!CHAT_IMAGE_TYPES.some(t=>t===file.type))return 'Choose a JPG, PNG or WebP photo.';if(file.size<1||file.size>CHAT_MAX_FILE_BYTES)return 'Each photo must be 4 MB or smaller.';return null}
