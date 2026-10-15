export const TRUCK_VIEW={width:1200,height:480,min:58,max:440,initial:245} as const
export const clampScan=(y:number)=>Math.max(TRUCK_VIEW.min,Math.min(TRUCK_VIEW.max,y))
// Invert the SVG screen transform, including viewBox letterboxing and page offsets.
export function pointerScanY(x:number,y:number,matrix:{a:number;b:number;c:number;d:number;e:number;f:number}){
 const determinant=matrix.a*matrix.d-matrix.b*matrix.c
 if(!Number.isFinite(determinant)||Math.abs(determinant)<1e-9)return null
 const value=(-matrix.b*(x-matrix.e)+matrix.a*(y-matrix.f))/determinant
 return Number.isFinite(value)?clampScan(value):null
}
export function settleScan(current:number,target:number,elapsed:number,reduced=false){
 const next=reduced?target:current+(target-current)*(1-Math.exp(-Math.max(0,Math.min(elapsed,40))/32))
 return Math.abs(target-next)<.025?target:next
}
