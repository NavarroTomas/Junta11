"use client";
import { useRef, useState } from "react";
import type { LeagueBundle, Match, MatchPlayer, Player } from "@/lib/platform/types";
import { generateFixture, removeEntity, saveEntity, saveResult, updateMatchSchedule } from "@/lib/platform/api";
import { messageFor, platformClient } from "@/lib/platform/client";
import { matchLabel, playerStandings, splitPlayers, validateResult } from "@/lib/platform/domain";
import { Monogram, Notice } from "./ui";
import ResultStats from "./ResultStats";
import ParticipantPicker from "./ParticipantPicker";
import MatchCalendar from "./MatchCalendar";
import {argentinaDateTimeLocal,argentinaDateTimeIso} from "@/lib/platform/calendar";
import s from "./platform.module.css";
export default function MatchesManager({ data, onChanged, startCreating=false, allowFixture=true, allowFriendsCreation=true }: {
    data: LeagueBundle;
    onChanged: () => Promise<void>;
    startCreating?: boolean;
    allowFixture?: boolean;
    allowFriendsCreation?: boolean;
}) {
    const [step, setStep] = useState(1);
    const stepHeading = useRef<HTMLHeadingElement>(null);
    function goToStep(next: number) {
        setError("");
        setStep(next);
        requestAnimationFrame(() => stepHeading.current?.focus());
    }
    const [form, setForm] = useState(startCreating && !!data.competitions.length && (data.league.mode !== "players" || allowFriendsCreation)), [schedule, setSchedule] = useState<Match | null>(null), [result, setResult] = useState<Match | null>(null), [deleting, setDeleting] = useState<Match | null>(null);
    const [home, setHome] = useState(data.teams.filter(t=>t.is_active!==false)[0]?.id ?? ""), [away, setAway] = useState(data.teams.filter(t=>t.is_active!==false)[1]?.id ?? ""), [when, setWhen] = useState(""), [venue, setVenue] = useState(""), [round, setRound] = useState(1), [homeName, setHomeName] = useState("Equipo A"), [awayName, setAwayName] = useState("Equipo B");
    const [participants, setParticipants] = useState<string[]>(data.players.map(p => p.id)), [balanced, setBalanced] = useState(false), [split, setSplit] = useState<{
        home: Player[];
        away: Player[];
    } | null>(null);
    const [homeScore, setHomeScore] = useState(""), [awayScore, setAwayScore] = useState(""), [stats, setStats] = useState<MatchPlayer[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState("");
    const friends = data.league.mode === "players",activeTeams=data.teams.filter(t=>t.is_active!==false);
    async function action(fn: () => Promise<void>, message: string) { setBusy(true); setError(""); setSuccess(""); try {
        await fn();
        await onChanged();
        setSuccess(message);
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    function openForm(m?: Match) { setStep(1);setBalanced(false); setResult(null); setError(""); setSchedule(m ?? null); setHome(m?.home_team_id ?? activeTeams[0]?.id ?? ""); setAway(m?.away_team_id ?? activeTeams[1]?.id ?? ""); setWhen(argentinaDateTimeLocal(m?.starts_at ?? null)); setVenue(m?.venue ?? ""); setRound(m?.round ?? 1); setHomeName(m?.home_label ?? "Equipo A"); setAwayName(m?.away_label ?? "Equipo B"); setParticipants(data.players.map(p => p.id)); setSplit(null); setForm(true); }
    function openResult(m: Match) { setForm(false); setError(""); setResult(m); setHomeScore(m.home_score === null ? "" : String(m.home_score)); setAwayScore(m.away_score === null ? "" : String(m.away_score)); setStats(data.stats.filter(s => s.match_id === m.id).map(s => ({ ...s }))); }
    async function submitMatch(e: React.FormEvent) {
        e.preventDefault();
        await action(async () => {
            const starts_at = argentinaDateTimeIso(when);
            if (schedule) {
                await updateMatchSchedule(schedule.id, data.league.id, { starts_at, venue: venue.trim(), round, home_label: homeName.trim(), away_label: awayName.trim() });
            }
            else if (friends) {
                if (!allowFriendsCreation) throw new Error("Los partidos entre amigos se programan en la competencia inicial por ahora.");
                if (!split || !split.home.length || !split.away.length)
                    throw new Error("Seleccioná participantes y repartí los equipos antes de guardar.");
                const { error } = await platformClient().rpc("create_friendly_match", { p_league_id: data.league.id, p_home_label: homeName.trim(), p_away_label: awayName.trim(), p_home_players: split.home.map(p => p.id), p_away_players: split.away.map(p => p.id), p_starts_at: starts_at, p_venue: venue.trim(), p_round: round });
                if (error)
                    throw error;
            }
            else {
                if (!home || !away || home === away)
                    throw new Error("Elegí dos equipos distintos.");
                const competition = data.competitions[0];
                if (!competition)
                    throw new Error("Falta la competencia inicial de la liga.");
                await saveEntity("matches", { id: crypto.randomUUID(), league_id: data.league.id, competition_id: competition.id, round, home_team_id: home, away_team_id: away, starts_at, venue: venue.trim() });
            }
            setForm(false);
        }, schedule ? "La programación quedó actualizada." : "El partido quedó programado.");
    }
    async function submitResult(e: React.FormEvent) { e.preventDefault(); if (!result)
        return; const h = homeScore === "" ? NaN : Number(homeScore), a = awayScore === "" ? NaN : Number(awayScore); const issue = validateResult(result, h, a, stats, data.players, data.league, data.stats); if (issue) {
        setError(issue);
        return;
    } await action(async () => { await saveResult(result.id, h, a, stats); setResult(null); }, "Resultado y estadísticas guardados. Las posiciones ya están actualizadas."); }
    if (result) return <form className={s.resultEditor} onSubmit={submitResult}>
        <h2>Resultado del partido</h2>
        <div className={s.scoreEntry}>{(["home","away"] as const).map(side=>
            <label key={side}>{matchLabel(result,side,data)}
                <input type="number" aria-label={"Goles de "+matchLabel(result,side,data)} required min={0} max={999} placeholder="0"
                    value={side==="home"?homeScore:awayScore} onChange={e=>(side==="home"?setHomeScore:setAwayScore)(e.target.value)}/>
            </label>)}</div>
        <ResultStats data={data} match={result} stats={stats} onChange={setStats}/>
        {error && <Notice error>{error}</Notice>}
        <div className={s.wizardActions}><button type="button" className={s.outline} disabled={busy} onClick={()=>{setResult(null);setError("");}}>Cancelar</button>
            <button disabled={busy} className={s.buttonSmall}>{busy?"Guardando…":"Guardar resultado"}</button></div>
    </form>;
    if (form && !schedule) {
        const enough = friends ? participants.length >= 2 : !!home && !!away && home !== away;
        function distribute(mode: boolean) {
            const ratings = new Map(playerStandings(data).filter(p => p.rating !== null).map(p => [p.id, p.rating!]));
            setSplit(splitPlayers(data.players.filter(p => participants.includes(p.id)), mode, ratings));
        }
        function advance(event: React.FormEvent) {
            event.preventDefault();
            if (busy) return;
            if (step === 1) { goToStep(2); return; }
            if (!enough) { goToStep(2); return; }
            if (step === 2) {
                if (friends && !split) distribute(balanced);
                goToStep(3);
                return;
            }
            void submitMatch(event);
        }
        return <form className={s.matchWizard} data-step={step} onSubmit={advance}>
            <p className={s.stepCount}>Paso {step} de 3</p>
            <h2 ref={stepHeading} tabIndex={-1}>{["¿Cuándo se juega?", "¿Quiénes juegan?", "Detalles del partido"][step - 1]}</h2>
            {step === 1 && <label className={s.field}>Día y hora de Argentina (opcional)
                <input type="datetime-local" value={when} onChange={event => setWhen(event.target.value)}/>
            </label>}
            {step === 2 && (friends ? <>
                <ParticipantPicker players={data.players} selected={participants} onChange={ids => {setParticipants(ids);setSplit(null);}}/>
                {!enough && <p>Elegí al menos dos jugadores. Si te faltan, podés agregarlos en Jugadores.</p>}
            </> : <>
                {activeTeams.length < 2 && <p>Agregá dos equipos activos en Equipos para programar un partido.</p>}
                <div className={s.formRow}>{["Local","Visitante"].map((label,i)=><label key={label} className={s.field}>{label}
                    <select value={i ? away : home} onChange={event => (i ? setAway : setHome)(event.target.value)}>
                        <option value="">Elegir equipo</option>{activeTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select></label>)}</div>
                {home && home === away && <p>Elegí dos equipos distintos.</p>}
            </>)}
            {step === 3 && <>
                <p>{when ? when.split("T")[0].split("-").reverse().join("/") + " · " + when.split("T")[1] : "Horario a definir"} · {friends ? participants.length + " jugadores" : activeTeams.find(t=>t.id===home)?.name + " vs. " + activeTeams.find(t=>t.id===away)?.name}</p>
                {friends && split && <>
                    <div className={s.splitModes} role="group" aria-label="Método de reparto">
                        {[false,true].map(mode => <button key={String(mode)} type="button" aria-pressed={balanced===mode}
                            onClick={()=>{if(mode!==balanced){setBalanced(mode);distribute(mode);}}}>
                            {mode ? "Equilibrado por nota" : "Aleatorio"}
                        </button>)}
                    </div>
                    <div className={s.squadSheets}>{(["home","away"] as const).map((side,i)=>
                        <section key={side} className={s.squadSheet} aria-label={i?awayName:homeName}>
                            <header>
                                <input required maxLength={80} aria-label={i?"Nombre del equipo B":"Nombre del equipo A"} value={i?awayName:homeName}
                                    onChange={event=>(i?setAwayName:setHomeName)(event.target.value)}/>
                                <span aria-label={split[side].length+" convocados"}>{split[side].length}</span>
                            </header>
                            <ul>{split[side].map(player=><li key={player.id}>
                                <Monogram name={player.name} image={player.photo_url}/>
                                <div><strong>{player.name}</strong><small>{player.position || "Sin definir"}</small></div>
                            </li>)}</ul>
                        </section>)}</div>
                    <button type="button" className={s.redistribute} onClick={()=>distribute(balanced)}>Volver a repartir</button>
                </>}
                <details><summary>Cancha y jornada</summary><div className={s.formRow}>
                    <label className={s.field}>Cancha (opcional)<input maxLength={160} value={venue} onChange={event=>setVenue(event.target.value)}/></label>
                    <label className={s.field}>Jornada<input type="number" required min={1} max={10000} value={round} onChange={event=>setRound(Number(event.target.value))}/></label>
                </div></details>
            </>}
            {error && <Notice error>{error}</Notice>}
            <div className={s.wizardActions}>
                <button type="button" className={s.outline} disabled={busy} onClick={()=>step===1?setForm(false):goToStep(step-1)}>{step===1?"Cancelar":"Atrás"}</button>
                <button type="submit" className={s.buttonSmall} disabled={busy || (step===2 && !enough)}>{step===3?(busy?"Guardando…":"Guardar partido"):step===1&&!when?"Definir después":"Continuar"}</button>
            </div>
        </form>;
    }
    return <section className={s.panel}><div className={s.panelTitle}><h2>Partidos y resultados</h2><div className={s.wrap}>{!friends && data.league.format !== "friendly" && <button className={s.outline} disabled={busy || !allowFixture || activeTeams.length < 2 || data.matches.length > 0} onClick={() => action(async () => { await generateFixture(data.league.id,data.competitions[0]?.id); }, "El fixture está listo. Completá los días y horarios de cada partido.")}>Generar fixture</button>}<button className={s.buttonSmall} disabled={busy || !data.competitions.length || (friends && !allowFriendsCreation)} onClick={() => openForm()}>Programar partido</button></div></div>
 {startCreating && !data.competitions.length && <Notice>Creá una competencia en Temporadas para programar el partido.</Notice>}
 {startCreating && friends && !allowFriendsCreation && <Notice>Elegí la competencia inicial para crear el partido.</Notice>}
 {!friends && data.matches.length === 0 && <p className={s.help}>Para generar el fixture cargá al menos dos equipos. Cada pareja se programa una vez, o dos si elegiste ida y vuelta.</p>}
 {!friends&&!allowFixture&&data.matches.length===0&&<Notice>Podés programar partidos manualmente en esta competencia. La generación automática para varias competencias sigue pendiente.</Notice>}{success && <Notice>{success}</Notice>}{error && <Notice error>{error}</Notice>}
 {form && <form className={s.editor} onSubmit={submitMatch}><h3>{schedule ? "Editar programación" : "Programar partido"}</h3>
 {friends && <><div className={s.formRow}><label className={s.field}>Nombre del equipo A<input required maxLength={80} value={homeName} onChange={e => setHomeName(e.target.value)}/></label><label className={s.field}>Nombre del equipo B<input required maxLength={80} value={awayName} onChange={e => setAwayName(e.target.value)}/></label></div>
 </>}
 <div className={s.formRow} style={{ marginTop: 16 }}><label className={s.field}>Día y hora (opcional)<input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}/></label><label className={s.field}>Cancha (opcional)<input maxLength={160} value={venue} onChange={e => setVenue(e.target.value)}/></label><label className={s.field}>Número de fecha<input type="number" required min={1} max={10000} value={round} onChange={e => setRound(Number(e.target.value))}/></label></div><p className={s.help}>Los horarios se muestran en hora de Argentina.</p><div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy ? "Guardando…" : "Guardar partido"}</button><button type="button" className={s.textButton} onClick={() => setForm(false)}>Cancelar</button></div></form>}
 {deleting && <div className={s.confirmation}><p>¿Eliminar {matchLabel(deleting, "home", data)} vs. {matchLabel(deleting, "away", data)}? También se eliminarán sus estadísticas y se recalcularán las posiciones.</p><div className={s.wrap}><button className={s.danger} disabled={busy} onClick={() => action(async () => { await removeEntity("matches", deleting.id, data.league.id); setDeleting(null); }, "Partido eliminado.")}>Eliminar partido</button><button className={s.textButton} onClick={() => setDeleting(null)}>Cancelar</button></div></div>}
 <MatchCalendar data={data} actions={m => <><button onClick={() => openForm(m)}>Programación</button><button className={s.resultAction} onClick={() => openResult(m)}>{m.status === "completed" ? "Editar resultado" : "Cargar resultado"}</button>{m.status === "completed" && <button disabled={busy} onClick={() => action(async () => { await saveResult(m.id, null, null, []); }, "El resultado fue anulado y sus estadísticas se retiraron.")}>Anular resultado</button>}<button onClick={() => setDeleting(m)}>Eliminar</button></>}/>
 </section>;
}
