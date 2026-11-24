import type {LeagueBundle} from "./types";
import {matchLabel} from "./domain";
export function argentinaDateTimeLocal(iso:string|null):string {
    if(!iso)return "";
    const date=new Date(iso);if(!Number.isFinite(date.getTime()))return "";
    const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Argentina/Cordoba",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(date);
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function argentinaDateTimeIso(value:string):string|null {
    if(!value)return null;
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error("Revisá el día y horario del partido.");
    // Competition dates use Argentina (UTC-03), independent of the device zone.
    const date=new Date(`${value}:00-03:00`);
    if(!Number.isFinite(date.getTime())||argentinaDateTimeLocal(date.toISOString())!==value)throw Error("Revisá el día y horario del partido.");
    return date.toISOString();
}
export type CalendarFilters={round:string;status:string;query:string;day:string};
export function calendarMatches(data:LeagueBundle,filters:CalendarFilters){
    const needle=filters.query.trim().toLocaleLowerCase("es-AR");
    return data.matches.filter(m=>m.league_id===data.league.id
      &&(!filters.round||m.round===Number(filters.round))
      &&(!filters.status||m.status===filters.status)
      &&(!filters.day||argentinaDateTimeLocal(m.starts_at).slice(0,10)===filters.day)
      &&(!needle||`${matchLabel(m,"home",data)} ${matchLabel(m,"away",data)} ${m.venue}`.toLocaleLowerCase("es-AR").includes(needle)))
      .sort((a,b)=>{
          const aTime=a.starts_at?Date.parse(a.starts_at):NaN,bTime=b.starts_at?Date.parse(b.starts_at):NaN;
          const left=Number.isFinite(aTime)?aTime:Infinity,right=Number.isFinite(bTime)?bTime:Infinity;
          return a.round-b.round||(left===right?0:left-right)||a.id.localeCompare(b.id);
      });
}
