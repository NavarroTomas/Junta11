"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createLeague } from "@/lib/platform/api";
import { messageFor, platformClient } from "@/lib/platform/client";
import { DRAFT_KEY, formatNames, purposeNames, restoreDraft, validateDraft } from "@/lib/platform/domain";
import type { LeagueDraft, LeagueFormat, LeaguePurpose } from "@/lib/platform/types";
import { Loading, Notice, usePlatformSession } from "./ui";
import s from "./platform.module.css";
import {PlatformTheme, PresentationHeader, TypedText} from "./Presentation";
import v from "./presentation.module.css";
import PasswordInput from "./PasswordInput";
import {canResumeRegistration, normalizeEmail, registrationEmailError, REGISTRATION_PROGRESS_KEY} from "@/lib/platform/registration";
const blank: LeagueDraft = { version: 1, requestId: "", purpose: "amateur", mode: "teams", name: "", description: "", expectedParticipants: 0, format: "round_robin", primaryColor: "#216348", secondaryColor: "#dbe99d" };
const palettes = [{ name: "Verde cancha", primary: "#216348", secondary: "#dbe99d" }, { name: "Azul club", primary: "#234f8c", secondary: "#dce8f8" }, { name: "Rojo camiseta", primary: "#94372e", secondary: "#f2dfc9" }, { name: "Negro y blanco", primary: "#252b28", secondary: "#e7e9e2" }];
export default function Onboarding() {
    const router = useRouter(), { user, ready } = usePlatformSession();
    const [draft, setDraft] = useState<LeagueDraft>(blank), [initialized, setInitialized] = useState(false), [step, setStep] = useState(0), [error, setError] = useState(""), [busy, setBusy] = useState(false), [creating, setCreating] = useState(false), [pendingEmail, setPendingEmail] = useState(false), [leaving, setLeaving] = useState(false);
    const [nameComplete,setNameComplete]=useState(false);
    const resumeChecked=useRef(false);
    const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [displayName, setDisplayName] = useState("");
    const titleRef = useRef<HTMLHeadingElement>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), submitting = useRef(false), registering = useRef(false);
    useEffect(() => { try {
        const raw = localStorage.getItem(DRAFT_KEY);
        const saved = raw ? JSON.parse(raw) : null;
        const restored = restoreDraft(saved, { ...blank, requestId: crypto.randomUUID() });
        setDraft(restored);
        // A valid old draft is not proof that the visitor answered these questions.
        setStep(0);
    }
    catch {
        setDraft({ ...blank, requestId: crypto.randomUUID() });
    } setInitialized(true); return () => { if (timer.current)
        clearTimeout(timer.current); }; }, []);
    useEffect(() => { if (initialized)
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
        catch { } }, [draft, initialized]);
    useEffect(() => {
        if(!initialized || !ready || resumeChecked.current)return;
        resumeChecked.current=true;
        try {
            const progress=JSON.parse(localStorage.getItem(REGISTRATION_PROGRESS_KEY)||"null");
            if(canResumeRegistration(window.location.pathname.replace(/\/$/,""),!!user,draft,progress)) {
                setStep(6);setNameComplete(true);
            }
        }catch{}
    },[initialized,ready,user,draft]);
    useEffect(() => { if (initialized)
        titleRef.current?.focus(); }, [step, initialized]);
    const update = (value: Partial<LeagueDraft>) => setDraft(d => ({ ...d, ...value }));
    function move(next: number) { setError(""); if (next < 0 || next > 6 || busy)
        return; setLeaving(true); timer.current = setTimeout(() => { setStep(next); setLeaving(false); }, 160); }
    async function create() { const issue = validateDraft(draft); if (issue) {
        setError(issue);
        return;
    } if (submitting.current)
        return; submitting.current = true; setBusy(true); setCreating(true); setError(""); try {
        const league = await createLeague(draft);
        try {
            localStorage.removeItem(DRAFT_KEY);
            localStorage.removeItem(REGISTRATION_PROGRESS_KEY);
        }
        catch { }
        router.replace(`/panel/${league.id}`);
    }
    catch (e) {
        setError(messageFor(e));
        setCreating(false);
        setBusy(false);
        submitting.current = false;
    } }
    async function submit(event: React.FormEvent) { event.preventDefault(); if(busy || leaving || registering.current)return; if (step === 2 && !draft.name.trim()) {
        setError("Escribí el nombre de tu liga.");
        return;
    } if (step === 3 && (!Number.isInteger(draft.expectedParticipants) || (draft.expectedParticipants !== 0 && draft.expectedParticipants < 2) || draft.expectedParticipants > 128)) {
        setError("Dejá la cantidad sin definir o ingresá entre 2 y 128.");
        return;
    } if (step < 6) {
        if(step===5) {
            const issue=validateDraft(draft);if(issue){setError(issue);return;}
            try {localStorage.setItem(REGISTRATION_PROGRESS_KEY,JSON.stringify({version:1,requestId:draft.requestId,questionsComplete:true}));}catch{}
        }
        move(step + 1);
        return;
    } if (!ready) {
        setError("Estamos comprobando tu sesión. Esperá un momento.");
        return;
    } if (user) {
        await create();
        return;
    }
    const issue=validateDraft(draft)||registrationEmailError(email);
    if(issue){setError(issue);return;}
    if(!displayName.trim()){setError("Ingresá tu nombre de usuario.");setNameComplete(false);return;}
    if (password.length < 10) {
        setError("Usá una contraseña de al menos 10 caracteres.");
        return;
    } registering.current=true; setBusy(true); setError(""); try {
        const { data, error } = await platformClient().auth.signUp({ email: normalizeEmail(email), password, options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/crear-liga` } });
        if (error)
            throw error;
        if(!data.user)throw new Error("No pudimos crear la cuenta. Intentá nuevamente.");
        if(data.user.identities?.length===0)throw new Error("Si ya tenés una cuenta, ingresá o recuperá tu contraseña.");
        setPassword("");
        if (data.session) {
            await create();
        }
        else {
            setPendingEmail(true);
            setBusy(false);
        }
    }
    catch (e) {
        setError(messageFor(e));
        setBusy(false);
    } finally { registering.current=false; } }
    const titles = ["¿Para qué es tu liga?", "¿Cómo van a competir?", "Nombre de la liga", "Cantidad estimada (opcional)", "¿Qué formato?", "Tus colores.", user ? "Revisá tu liga." : "Tu cuenta."];
    return <PlatformTheme><PresentationHeader/><main className={`${s.onboarding} ${v.registration}`}>
 {!initialized || !ready ? <Loading text="Preparando tu registro."/> : !user && !nameComplete ? <section className={`${v.registrationBody} ${v.nameIntro}`}><form className={v.authForm} onSubmit={event=>{event.preventDefault();if(displayName.trim())setNameComplete(true);}}><label className={v.field} htmlFor="first-name"><TypedText text="Nombre de usuario"/><input id="first-name" required maxLength={80} autoComplete="nickname" value={displayName} onChange={event=>setDisplayName(event.target.value)} placeholder="Ejemplo: Martín"/></label><button className={v.action}>Continuar</button><Link href="/login" className={v.secondary}>Ya tengo una cuenta</Link></form></section> : creating ? <section className={s.creating} role="status"><span className={s.spinner}/><h1>Creando tu liga…</h1></section> : pendingEmail ? <section className={s.onboardBody}><h1>Confirmá tu correo.</h1><p className={s.onboardHint}>Abrí el enlace que enviamos a {normalizeEmail(email)} para activar tu cuenta. Revisá también spam.</p><Link href="/login" className={s.buttonLight}>Ingresar</Link></section> : <section className={s.onboardBody}><form onSubmit={submit}><div className={`${s.step} ${leaving ? s.stepLeaving : ""}`} key={step}><span className={v.srOnly}>Paso {step + 1} de 7</span><h1 tabIndex={-1} ref={titleRef}><TypedText text={titles[step]}/></h1>
 {step === 0 && <><div className={s.choices}>{(Object.entries(purposeNames) as [
            LeaguePurpose,
            string
        ][]).map(([key, label], i) => <button type="button" className={s.choice} aria-pressed={draft.purpose === key} key={key} onClick={() => update({ purpose: key })}><strong>{label}</strong></button>)}</div></>}
 {step === 1 && <><div className={s.choices}>{([{ key: "teams", title: "Por equipos", text: "Cada equipo tiene su plantel. Tabla de posiciones y fixture." }, { key: "players", title: "Por jugadores", text: "Los equipos cambian en cada partido. Puntos y estadísticas individuales." }] as const).map((option, i) => <button type="button" key={option.key} className={s.choice} aria-pressed={draft.mode === option.key} onClick={() => update({ mode: option.key, format: option.key === "players" ? "friendly" : "round_robin" })}><div><strong>{option.title}</strong></div></button>)}</div></>}
 {step === 2 && <><div className={s.onboardField}><label htmlFor="league-name">Nombre de la liga</label><input id="league-name" required maxLength={80} autoComplete="off" value={draft.name} onChange={e => update({ name: e.target.value })} placeholder="Liga del domingo"/><label htmlFor="league-idea" style={{ marginTop: 14 }}>Descripción (opcional)</label><textarea id="league-idea" maxLength={1000} value={draft.description} onChange={e => update({ description: e.target.value })} placeholder="Fútbol 7 del barrio…"/></div></>}
 {step === 3 && <><div className={s.onboardField}><label htmlFor="participant-count">Cantidad de {draft.mode === "teams" ? "equipos" : "jugadores"}</label><input id="participant-count" type="number" placeholder="Sin definir" min={2} max={128} inputMode="numeric" value={draft.expectedParticipants || ""} onChange={e => update({ expectedParticipants: Number(e.target.value) })}/><p className={s.help}>Podés agregar o retirar {draft.mode === "teams" ? "equipos" : "jugadores"} después.</p></div></>}
 {step === 4 && <><div className={s.choices}>{(Object.entries(formatNames) as [
            LeagueFormat,
            string
        ][]).filter(([key]) => draft.mode === "teams" || key === "friendly").map(([key, label], i) => <button type="button" key={key} className={s.choice} aria-pressed={draft.format === key} onClick={() => update({ format: key })}><strong>{label}</strong></button>)}</div></>}
 {step === 5 && <><div className={s.choices}>{palettes.map((p, i) => <button type="button" key={p.name} className={s.choice} aria-pressed={draft.primaryColor === p.primary && draft.secondaryColor === p.secondary} onClick={() => update({ primaryColor: p.primary, secondaryColor: p.secondary })}><span aria-hidden="true" style={{ background: p.primary, borderColor: p.secondary }}/><strong>{p.name}</strong></button>)}</div><div className={s.formRow} style={{ marginTop: 22 }}><div className={s.onboardField}><label htmlFor="primary-color">Color principal</label><input id="primary-color" type="color" value={draft.primaryColor} onChange={e => update({ primaryColor: e.target.value })}/></div><div className={s.onboardField}><label htmlFor="secondary-color">Color secundario</label><input id="secondary-color" type="color" value={draft.secondaryColor} onChange={e => update({ secondaryColor: e.target.value })}/></div></div></>}
 {step === 6 && <>{!user && <div className={s.onboardField}><label htmlFor="email">Correo electrónico</label><input id="email" type="email" required disabled={busy} autoCapitalize="none" spellCheck={false} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}/><label htmlFor="password">Contraseña (al menos 10 caracteres)</label><PasswordInput id="password" minLength={10} required disabled={busy} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}/></div>}<div className={s.onboardSummary}><div><span>Liga</span><strong>{draft.name}</strong></div><div><span>Modalidad</span><strong>{draft.mode === "teams" ? "Equipos" : "Jugadores"}</strong></div><div><span>Participantes</span><strong>{draft.expectedParticipants||"Sin definir"}</strong></div><div><span>Organización</span><strong>{formatNames[draft.format]}</strong></div></div></>}
 </div>{error && <Notice error>{error}</Notice>}<div className={s.onboardActions}><button type="button" className={s.textButton} disabled={(step === 0 && !!user) || busy || leaving} onClick={() => {if(step===0)setNameComplete(false);else move(step - 1);}}>Atrás</button><button type="submit" className={s.buttonLight} disabled={!initialized || busy || leaving}>{busy ? "Guardando…" : step === 6 ? user ? "Crear mi liga" : "Crear cuenta" : step===3&&!draft.expectedParticipants ? "Definir después" : "Continuar"}</button></div></form></section>}
</main></PlatformTheme>;
}
