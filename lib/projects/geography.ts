import geo from './geo-data.json'
export const countryCentres=Object.fromEntries(Object.entries(geo.centres).map(([code,p])=>[code,[p[0],p[1]] as [number,number]]))
export const landPoints=geo.land.map(p=>[p[0],p[1]] as [number,number])
export function countryCode(value:unknown){const code=typeof value==='string'?value.toUpperCase():'';return Object.hasOwn(countryCentres,code)?code:'ZZ'}
export function projectGeo(lat:number,lon:number,yaw:number,pitch:number,flat:number,width:number,height:number){
 const r=Math.PI/180,phi=lat*r,lambda=(lon-yaw)*r,tilt=pitch*r,x=Math.cos(phi)*Math.sin(lambda),y=Math.cos(tilt)*Math.sin(phi)-Math.sin(tilt)*Math.cos(phi)*Math.cos(lambda),z=Math.sin(tilt)*Math.sin(phi)+Math.cos(tilt)*Math.cos(phi)*Math.cos(lambda),radius=Math.min(width*.31,height*.43)
 return {x:(width/2+radius*x)*(1-flat)+(22+(lon+180)/360*(width-44))*flat,y:(height*.52-radius*y)*(1-flat)+(20+(85-Math.max(-60,Math.min(85,lat)))/145*(height-40))*flat,opacity:(z>0?1:0)*(1-flat)+flat,depth:z,radius}
}
