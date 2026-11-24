"use client";
import {useState} from "react";
import {saveStructure,removeStructure} from "@/lib/platform/api";
import {messageFor} from "@/lib/platform/client";
import {formatNames} from "@/lib/platform/domain";
import type {LeagueBundle,LeagueFormat} from "@/lib/platform/types";
import {Notice} from "./ui";
import s from "./platform.module.css";
type Kind="seasons"|"divisions"|"competitions";
type Draft={id?:string;name:string;season_id:string;division_id:string;format:LeagueFormat};
const labels={seasons:"temporada",divisions:"división",competitions:"competencia"};
export default function StructureManager({data,onChanged,onSelect}:{data:LeagueBundle;onChanged:()=>Promise<void>;onSelect:(id:string)=>void}){
 const [kind,setKind]=useState<Kind>("seasons"),[draft,setDraft]=useState<Draft|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState(""),[deleting,setDeleting]=useState<{kind:Kind;id:string;name:string}|null>(null);
 function open(next:Kind,row?:{id:string;name:string;season_id?:string;division_id?:string;format?:LeagueFormat}){
  const season=row?.season_id??data.seasons[0]?.id??"";
  setKind(next);setError("");setNotice("");setDeleting(null);
  setDraft({id:row?.id,name:row?.name??"",season_id:season,division_id:row?.division_id??data.divisions.find(d=>d.season_id===season)?.id??"",format:row?.format??(data.league.mode==="players"?"friendly":"round_robin")});
 }
 async function save(e:React.FormEvent){e.preventDefault();if(!draft||busy)return;setBusy(true);setError("");setNotice("");try{
  const id=draft.id??crypto.randomUUID();
  if(kind!=="seasons"&&!data.seasons.some(x=>x.id===draft.season_id))throw Error("Elegí una temporada.");
  if(kind==="competitions"&&!data.divisions.some(x=>x.id===draft.division_id&&x.season_id===draft.season_id))throw Error("Elegí una división de esa temporada.");
  if(kind==="competitions"&&!draft.id&&data.league.mode==="players")throw Error("Las competencias adicionales para grupos de jugadores todavía no están disponibles.");
  const old=data.seasons.find(x=>x.id===draft.id);
  const value={id,league_id:data.league.id,name:draft.name.trim(),...(kind==="seasons"?{is_active:old?.is_active??false}:{season_id:draft.season_id}),...(kind==="competitions"?{division_id:draft.division_id,format:draft.format}:{})};
  await saveStructure(kind,value,draft.id?"update":"create");await onChanged();setDraft(null);setNotice("Cambios guardados.");
  if(kind==="competitions")onSelect(id);
 }catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 async function remove(){if(!deleting||busy)return;setBusy(true);setError("");try{await removeStructure(deleting.kind,deleting.id,data.league.id);await onChanged();setDeleting(null);setNotice("Registro eliminado.");}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 return <section className={s.panel}><h2>Temporadas</h2>
 {error&&<Notice error>{error}</Notice>}{notice&&<Notice>{notice}</Notice>}
 {data.league.mode==="players"&&<Notice>Los grupos de jugadores usan su competencia inicial. Las competencias adicionales para esta modalidad siguen pendientes.</Notice>}
 {draft&&<form className={s.editor} onSubmit={save}><h3>{draft.id?"Editar":"Crear"} {labels[kind]}</h3><label className={s.field}>Nombre<input required maxLength={80} disabled={busy} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 {kind!=="seasons"&&<label className={s.field}>Temporada<select required disabled={busy||!!draft.id} value={draft.season_id} onChange={e=>setDraft({...draft,season_id:e.target.value,division_id:data.divisions.find(d=>d.season_id===e.target.value)?.id??""})}>{!data.seasons.length&&<option value="">Creá una temporada primero</option>}{data.seasons.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
 {kind==="competitions"&&<><label className={s.field}>División<select required disabled={busy||!!draft.id} value={draft.division_id} onChange={e=>setDraft({...draft,division_id:e.target.value})}><option value="">Elegir división</option>{data.divisions.filter(d=>d.season_id===draft.season_id).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className={s.field}>Organización<select disabled={busy||data.matches.some(m=>m.competition_id===draft.id)} value={draft.format} onChange={e=>setDraft({...draft,format:e.target.value as LeagueFormat})}>{Object.entries(formatNames).filter(([key])=>data.league.mode==="teams"||key==="friendly").map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label><p className={s.help}>Las competencias nuevas permiten programar partidos manualmente. La generación automática para varias competencias sigue pendiente. Una vez cargados partidos, el formato se conserva.</p></>}
 <div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy?"Guardando…":"Guardar"}</button><button type="button" className={s.textButton} disabled={busy} onClick={()=>setDraft(null)}>Cancelar</button></div></form>}
 {deleting&&<div className={s.confirmation}><p>¿Eliminar {deleting.name}? Si tiene divisiones, competencias o partidos, la eliminación se bloqueará para conservar esos datos.</p><button className={s.danger} disabled={busy} onClick={remove}>Eliminar</button><button className={s.textButton} disabled={busy} onClick={()=>setDeleting(null)}>Cancelar</button></div>}
 {(["seasons","divisions","competitions"] as const).map(k=><section key={k} style={{marginTop:25}}><div className={s.panelTitle}><h3>{k==="seasons"?"Temporadas":k==="divisions"?"Divisiones":"Competencias"}</h3><button className={s.outline} disabled={busy||(k!=="seasons"&&!data.seasons.length)||(k==="competitions"&&(!data.divisions.length||data.league.mode==="players"))} onClick={()=>open(k)}>Agregar {labels[k]}</button></div><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Nombre</th><th>Contexto</th><th>Acciones</th></tr></thead><tbody>{data[k].map(row=><tr key={row.id}><td>{row.name}</td><td>{"season_id" in row?data.seasons.find(x=>x.id===row.season_id)?.name:row.is_active?"Activa":"Disponible"}{"division_id" in row?` / ${data.divisions.find(x=>x.id===row.division_id)?.name??"Sin división"}`:""}</td><td><div className={s.rowActions}>{k==="competitions"&&<button disabled={busy} onClick={()=>onSelect(row.id)}>Seleccionar</button>}<button disabled={busy} onClick={()=>open(k,row)}>Editar</button><button disabled={busy} onClick={()=>{setDraft(null);setError("");setDeleting({kind:k,id:row.id,name:row.name});}}>Eliminar</button></div></td></tr>)}</tbody></table></div>{!data[k].length&&<p>Todavía no hay registros.</p>}</section>)}
 </section>;
}
