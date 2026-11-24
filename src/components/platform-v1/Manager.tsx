"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { canManage, loadLeague } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { formatNames, inkFor } from "@/lib/platform/domain";
import type { LeagueBundle } from "@/lib/platform/types";
import { Arrow, Header, Loading, Notice, usePlatformSession } from "./ui";
import { MatchRows, PlayersTable, StandingsTable } from "./LeagueViews";
import Entities from "./Entities";
import NewsManager from "./NewsManager";
import Settings from "./Settings";
import MatchesManager from "./MatchesManager";
import StructureManager from "./StructureManager";
import CompetitionPicker from "./CompetitionPicker";
import {competitionBundle,selectCompetitionId} from "@/lib/platform/competition";
import s from "./platform.module.css";
import v from "./presentation.module.css";
import AdministrationMenu from "./AdministrationMenu";
export default function Manager({ leagueId }: {
    leagueId: string;
}) {
    const router = useRouter(), { user, ready, error: sessionError } = usePlatformSession(), [allData, setData] = useState<LeagueBundle | null>(null), [error, setError] = useState(""), [tab, setTab] = useState("Menú"), [copied, setCopied] = useState(false), [selection,setSelection]=useState("");
    const refresh = useCallback(async () => { const d = await loadLeague(leagueId); setData(d); }, [leagueId]);
    useEffect(() => { if (!ready)
        return; if (!user) {
        if (!sessionError)
            router.replace(`/login?next=${encodeURIComponent(`/panel/${leagueId}`)}`);
        return;
    } let active = true; (async () => { try {
        if (!await canManage(leagueId))
            throw new Error("No tenés permisos para administrar esta liga.");
        const d = await loadLeague(leagueId);
        if (active) {
            setData(d);
            setError("");
        }
    }
    catch (e) {
        if (active)
            setError(messageFor(e));
    } })(); return () => { active = false; }; }, [ready, user, sessionError, leagueId, router]);
    if (error || sessionError)
        return <><Header /><main className={s.page}><Notice error>{error || sessionError}</Notice><Link href="/mis-ligas" className={s.outline}>Volver a mis ligas</Link></main></>;
    if (!allData)
        return <><Header account/><Loading text="Abriendo tu administración…"/></>;
    const selectedId=selectCompetitionId(allData,selection),data=competitionBundle(allData,selectedId);
    const initialCompetition=allData.competitions[0]?.id===selectedId;
    const l=data.league,played=data.matches.filter(m=>m.status==="completed").length;
    const publicUrl=`https://junta11.vercel.app/liga/${l.slug}`;
    return <div className={s.adminRoot}><Header account/>
    {tab==="Menú"?<AdministrationMenu name={l.name} teams={l.mode==="teams"} onSelect={setTab}/>:
    <main className={s.adminContent}><div className={s.adminToolbar}><button type="button" className={s.outline} onClick={()=>setTab("Menú")}>Administración</button><span>{l.name}</span><Link href={`/liga/${l.slug}`} className={s.outline}>Ver liga</Link></div>
    <h1>{tab}</h1>
    {["Partidos","Estadísticas"].includes(tab)&&<CompetitionPicker data={allData} value={selectedId} onChange={setSelection}/>}
    {tab==="Equipos"&&<Entities data={allData} kind="teams" onChanged={refresh}/>}
    {tab==="Jugadores"&&<Entities data={allData} kind="players" onChanged={refresh}/>}
    {tab==="Partidos"&&<MatchesManager key={selectedId} data={data} onChanged={refresh} allowFixture={initialCompetition&&allData.matches.length===0} allowFriendsCreation={initialCompetition}/>}
    {tab==="Estadísticas"&&<><div className={s.statsGrid}>{[["Equipos",data.teams.filter(t=>t.is_active!==false).length],["Jugadores",data.players.length],["Partidos jugados",played],["Partidos programados",data.matches.length-played]].map(([label,value])=><div className={s.stat} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{l.mode==="teams"&&<section className={s.panel}><h2>Posiciones</h2><StandingsTable data={data}/></section>}<section className={s.panel}><h2>Jugadores</h2><PlayersTable data={data}/></section></>}
    {tab==="Temporadas"&&<StructureManager data={allData} onChanged={refresh} onSelect={id=>{setSelection(id);setTab("Partidos");}}/>}
    {tab==="Noticias"&&<NewsManager data={allData} onChanged={refresh}/>}
    {tab==="Configuración"&&<Settings key={l.id} data={allData} onChanged={refresh}/>}
    {tab==="Enlace"&&<section className={s.panel}><p className={s.linkBox}>{publicUrl}</p><div className={s.wrap}><button type="button" className={s.outline} onClick={async()=>{try{await navigator.clipboard.writeText(publicUrl);setCopied(true);}catch{setError("No se pudo copiar el enlace.");}}}>{copied?"Copiado":"Copiar enlace"}</button><Link href={`/liga/${l.slug}`} className={s.outline}>Ver liga</Link></div></section>}
    <footer className={s.adminFooter}>JUNTA11</footer></main>}</div>;
}
