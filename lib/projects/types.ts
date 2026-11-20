export type PurchaseMode = 'buyout' | 'managed'
export type ProjectMaterial = {id:string;order_id:string|null;user_id:string;name:string;path:string;mime:string;size:number;created_at:string}
export type ProjectConnection = {order_id:string;enabled:boolean;connected_at:string|null;last_event_at:string|null;key_hint:string|null}
export type SourceRelease = {id:string;order_id:string;title:string;published_at:string|null;created_at:string;origin?:'manual'|'automatic';deployment_id?:string;commit_sha?:string;policy_version?:string}
export type SourceFile = {id:string;release_id:string;path:string;storage_path:string;size:number;sha256:string;mime:string}
export type MetricBucket = {order_id:string;hour:string;page_views:number;requests:number;errors:number;duration_ms:number}
export type ProjectActivity = {countries?:{country:string;page_views:number}[];connected:boolean;lastEvent:string|null;pageViews:number;requests:number;errors:number;averageMs:number|null;buckets:MetricBucket[]}

export type SourceLink={order_id:string;repo_full_name:string;repo_id:number;vercel_project_id:string;team_id:string;production_domain:string;approved_paths:string[];enabled:boolean;policy_version:string;current_release_id:string|null;last_checked_at:string|null;last_synced_at:string|null;created_at:string}
export type SourceJob={id:string;order_id:string;policy_version:string;deployment_id?:string|null;status:'pending'|'running'|'completed'|'failed'|'blocked'|'superseded';attempts:number;next_attempt_at:string;lease_until:string|null;lease_token:string|null;error:string|null;release_id:string|null;created_at:string;updated_at:string}
