"use client";
import {useState} from "react";
import type {LeagueBundle,Match} from "@/lib/platform/types";
import {calendarMatches,type CalendarFilters} from "@/lib/platform/calendar";
import {MatchRows} from "./LeagueViews";
import s from "./platform.module.css";
const blank:CalendarFilters={round:"",status:"",query:"",day:""};
export default function MatchCalendar({data,actions}:{data:LeagueBundle;actions?:(match:Match)=>React.ReactNode}){
 const [filters,setFilters]=useState<CalendarFilters>(blank),items=calendarMatches(data,filters);
 const rounds=[...new Set(data.matches.map(m=>m.round))].sort((a,b)=>a-b);
 const active=Object.values(filters).filter(Boolean).length;
 return <><details className={s.calendarFilters}><summary>Filtrar partidos{active ? " ("+active+")" : ""}</summary><div className={s.formRow} style={{marginBlock:20}}><label className={s.field}>Jornada<select value={filters.round} onChange={e=>setFilters({...filters,round:e.target.value})}><option value="">Todas</option>{rounds.map(r=><option key={r} value={r}>Fecha {r}</option>)}</select></label><label className={s.field}>Estado<select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">Todos</option><option value="scheduled">Programados</option><option value="completed">Finalizados</option></select></label><label className={s.field}>Día en Argentina<input type="date" value={filters.day} onChange={e=>setFilters({...filters,day:e.target.value})}/></label><label className={s.field}>Buscar equipo o cancha<input type="search" value={filters.query} onChange={e=>setFilters({...filters,query:e.target.value})}/></label></div><p className={s.help}>{items.length} de {data.matches.length} partidos de esta competencia.</p>{active>0 && <button type="button" className={s.textButton} onClick={()=>setFilters(blank)}>Limpiar filtros</button>}</details>{items.length?<MatchRows data={data} items={items} actions={actions}/>:<p className={s.muted}>{data.matches.length?"No hay partidos que coincidan con estos filtros.":"Todavía no hay partidos programados en esta competencia."}</p>}</>;
}
