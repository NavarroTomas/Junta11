"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { canManage, loadLeague } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { inkFor, matchLabel } from "@/lib/platform/domain";
import type { LeagueBundle } from "@/lib/platform/types";
import { Brand, Loading, Monogram, Notice, usePlatformSession } from "./ui";
import { dateLabel, MatchRows, NewsCards, PlayersTable, StandingsTable } from "./LeagueViews";
import s from "./platform.module.css";
import LeagueNavigation from "./LeagueNavigation";
import MatchCalendar from "./MatchCalendar";
import PublicProfile from "./PublicProfile";
import {leaguePath,profilePath,type ProfileView} from "@/lib/platform/profiles";
import CompetitionPicker from "./CompetitionPicker";
import {competitionBundle,selectCompetitionId} from "@/lib/platform/competition";
export default function PublicLeague({ slug, example, view }: {
    view?:ProfileView;
    slug?: string;
    example?: LeagueBundle;
}) {
    const [allData, setData] = useState<LeagueBundle | null>(example ?? null), [tab, setTab] = useState("Inicio"), [error, setError] = useState(""), [retry, setRetry] = useState(0),[selection,setSelection]=useState("");
    useEffect(() => { if (example || !slug)
        return; let active = true; loadLeague(slug, true).then(d => { if (active) {
        setData(d);
        setError("");
    } }).catch(e => { if (active)
        setError(messageFor(e)); }); return () => { active = false; }; }, [slug, example, retry]);
    const { user, ready } = usePlatformSession();
    const [accessKey, setAccessKey] = useState("");
    const leagueId = allData?.league.id;
    const userId = user?.id;
    useEffect(() => {
        let active = true;
        if (userId && leagueId && !example) {
            canManage(leagueId).then(allowed => {
                if (active) setAccessKey(allowed ? userId + ":" + leagueId : "");
            }).catch(() => { if (active) setAccessKey(""); });
        } else setAccessKey("");
        return () => { active = false; };
    }, [userId, leagueId, example]);
    const panelId = userId && accessKey === userId + ":" + leagueId ? leagueId : undefined;
    if (error)
        return <main className={s.page}><Brand /><Notice error>{error}</Notice><button className={s.outline} onClick={() => setRetry(n => n + 1)}>Volver a intentar</button></main>;
    if (!allData)
        return <Loading />;
    const selectedId=selectCompetitionId(allData,selection),data=competitionBundle(allData,selectedId);
    const l = data.league, next = [...data.matches].filter(m => m.status === "scheduled").sort((a, b) => String(a.starts_at ?? "9999").localeCompare(String(b.starts_at ?? "9999")))[0];
    return <div style={{ "--league-primary": l.primary_color, "--league-ink": inkFor(l.primary_color), "--league-secondary": l.secondary_color } as CSSProperties}>
    <header className={s.publicHeader}><LeagueNavigation signedIn={!!user} panelId={panelId} teams={l.mode === "teams"} /><Link href={example ? "/demo" : `/liga/${l.slug}`} className={s.publicIdentity}><Monogram name={l.name} image={l.logo_url}/><div><strong>{l.name}</strong><small>{data.seasons[0]?.name ?? "Temporada 1"} · {l.mode === "teams" ? "Liga por equipos" : "Grupo de jugadores"}</small></div></Link><nav className={s.publicNav} aria-label="Acceso a la plataforma">{user ? <Link href={panelId ? `/panel/${panelId}` : "/mis-ligas"} className={s.manageLink}>Administrar</Link> : ready && <Link href="/registro" className={s.buttonSmall}>Crear mi liga</Link>}</nav></header>
    <main>{example && <div style={{ maxWidth: 1240, margin: "20px auto 0", padding: "0 20px" }}><Notice>Datos de ejemplo.</Notice></div>}{!view&&<section className={s.publicHero}><div><h1>{l.name}</h1>{l.description&&<p>{l.description}</p>}<span className={s.badge}>{data.teams.filter(t=>t.is_active!==false).length} equipos · {data.players.length} jugadores · {data.matches.filter(m => m.status === "completed").length} partidos jugados</span></div><aside className={s.publicHeroAside}><span>Próximo encuentro</span>{next ? <><h2>{matchLabel(next, "home", data)}<br />vs. {matchLabel(next, "away", data)}</h2><p>{dateLabel(next.starts_at)}{next.venue ? ` · ${next.venue}` : ""}</p></> : <><h2>Sin partidos programados</h2></>}</aside></section>}
    {!view&&<nav className={s.publicTabs} aria-label="Secciones de la liga">{["Inicio", "Partidos", l.mode === "teams" ? "Posiciones" : "Ranking", "Jugadores", "Equipos", "Noticias"].filter(x => l.mode === "teams" || x !== "Equipos").map(t => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>{t}</button>)}</nav>}
    <div className={s.page}>{!view&&<CompetitionPicker data={allData} value={selectedId} onChange={setSelection}/>}{view&&<PublicProfile data={allData} view={view}/>}
    {!view&&tab === "Inicio" && <><div className={s.twoColumns}><section className={s.panel}><div className={s.panelTitle}><h2>Partidos recientes</h2><button className={s.textButton} onClick={() => setTab("Partidos")}>Ver todos</button></div><MatchRows data={data} items={[...data.matches].filter(m => m.status === "completed").reverse().slice(0, 3)}/></section><section className={s.panel}><h2>{l.mode === "teams" ? "Tabla de posiciones" : "Ranking de jugadores"}</h2>{l.mode === "teams" ? <StandingsTable data={data}/> : <PlayersTable data={data}/>}</section></div><section style={{ marginTop: 35 }}><h2 style={{ fontSize: 27, fontWeight: 550 }}>Noticias recientes</h2><NewsCards data={{ ...data, news: data.news.slice(-2) }}/></section></>}
    {!view&&tab === "Partidos" && <section className={s.panel}><h2>Partidos</h2><MatchCalendar key={selectedId} data={data}/></section>}
    {!view&&tab === "Posiciones" && <section className={s.panel}><h2>Tabla de posiciones</h2><StandingsTable data={data}/></section>}
    {!view&&(tab === "Jugadores" || tab === "Ranking") && <section className={s.panel}><h2>{tab === "Ranking" ? "Ranking individual" : "Estadísticas de jugadores"}</h2><PlayersTable data={data}/></section>}
    {!view&&tab === "Equipos" && <div className={s.leagueGrid}>{data.teams.filter(t=>t.is_active!==false).map(t => <article key={t.id} className={s.leagueCard}><Monogram name={t.name} image={t.logo_url} large/><h2><Link href={profilePath(data,"equipos",t.id)}>{t.name}</Link></h2><p className={s.muted}>{data.players.filter(p => p.team_id === t.id).length} jugadores</p><div>{data.players.filter(p => p.team_id === t.id).map(p => <div key={p.id} className={s.checkItem}><Monogram name={p.name} image={p.photo_url}/><Link href={profilePath(data,"jugadores",p.id)}>{p.name}</Link><span className={s.small}>{p.position}</span></div>)}</div></article>)}</div>}
    {!view&&tab === "Noticias" && <><h2 style={{ fontSize: 30, fontWeight: 550 }}>Noticias</h2><NewsCards data={data}/></>}
    </div></main><footer className={s.footer}><Brand /><Link href="/registro">Crear una liga </Link></footer></div>;
}
