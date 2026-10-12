import {workspaceSession} from '@/lib/workspace'
import {AccountSettings} from '@/components/workspace/account-settings'
export default async function SettingsPage(){const {user,profile}=await workspaceSession();return <AccountSettings name={profile?.full_name||''} email={user.email||''} created={profile?.created_at||user.created_at}/>}
