export const mailAccounts = {
 support: {address:'support@koryx.ca',name:'Koryx',title:'Support inbox',href:'/dashboard/inbox'},
 ceo: {address:'ceo_artem@koryx.ca',name:'Artem · Koryx',title:'My work inbox',href:'/dashboard/work-inbox'},
} as const
export type MailAccount = keyof typeof mailAccounts
export function mailAccount(value:unknown):MailAccount {
 if(value===undefined||value===null||value===''||value==='support')return 'support'
 if(value==='ceo')return 'ceo'
 throw Error('Unknown mailbox.')
}
