"use client";
import type { LeagueBundle } from "@/lib/platform/types";
import { competitionLabel, validCompetitions } from "@/lib/platform/competition";
import s from "./platform.module.css";
export default function CompetitionPicker({data,value,onChange}:{data:LeagueBundle;value:string;onChange:(id:string)=>void}) {
 const available=validCompetitions(data);
 const seasons=data.seasons.filter(season=>season.league_id===data.league.id);
 if(seasons.length<2 && available.length<2)return null;
 return <label className={s.field} style={{maxWidth:650,marginBlock:20}}>{seasons.length>1?"Temporada":"Competencia"}
  <select value={value} onChange={event=>onChange(event.target.value)} disabled={!available.length}>
   {!available.length&&<option value="">Sin competencias</option>}
   {available.map(c=><option value={c.id} key={c.id}>{seasons.length>1?competitionLabel(data,c.id):`${data.divisions.find(d=>d.id===c.division_id)?.name??""} / ${c.name}`}</option>)}
  </select>
 </label>;
}
