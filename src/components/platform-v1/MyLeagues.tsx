"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {myLeagues} from "@/lib/platform/api";
import {messageFor} from "@/lib/platform/client";
import type {League} from "@/lib/platform/types";
import {Arrow,Header,Loading,Monogram,Notice,usePlatformSession} from "@/components/platform-v1/ui";
import s from "@/components/platform-v1/platform.module.css";
import LeagueNavigation from "./LeagueNavigation";
export default function MyLeagues(){const router=useRouter(),[leagues,setLeagues]=useState<League[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[query,setQuery]=useState(""),[retry,setRetry]=useState(0);
const {user,ready,error:sessionError}=usePlatformSession(retry);
const userId = user?.id;
useEffect(() => {
    if (!ready || sessionError) return;
    if (!userId) { router.replace("/login"); return; }
    let active = true;
    const controller = new AbortController();
    setError("");
    setLoading(true);
    const timer = window.setTimeout(() => {
        active = false;
        controller.abort();
        setError("La consulta de tus ligas tardó demasiado. Volvé a intentar.");
        setLoading(false);
    }, 15000);
    myLeagues(userId, controller.signal).then(data => {
        if (active) setLeagues(data);
    }).catch(error => {
        if (active) setError(messageFor(error));
    }).finally(() => {
        clearTimeout(timer);
        if (active) setLoading(false);
    });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
}, [userId, ready, sessionError, router, retry]);
return <><Header account menu={<LeagueNavigation signedIn={!!user} teams={false} />}/><main className={s.page}><div className={s.pageTitle}><div><h1>Mis ligas</h1></div><Link href="/crear-liga" className={s.button}>Crear una liga </Link></div>{sessionError||error?<><Notice error>{sessionError||error}</Notice><button className={s.outline} onClick={()=>setRetry(n=>n+1)}>Volver a intentar</button></>:!ready||loading?<Loading text="Buscando tus ligas…"/>:leagues.length===0?<section className={s.empty}><Monogram name="Tu liga" large/><h2>Sin ligas</h2><Link href="/crear-liga" className={s.button}>Crear liga </Link></section>:<><label className={s.field} style={{maxWidth:350,marginBottom:25}}>Buscar una liga<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre de la liga"/></label><div className={s.leagueGrid}>{leagues.filter(l=>l.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(l=><article key={l.id} className={s.leagueCard}><div className={s.leagueCardTop}><Monogram name={l.name} image={l.logo_url} large/><span className={s.badge}>{l.mode==="teams"?"Por equipos":"Por jugadores"}</span></div><h2>{l.name}</h2>{l.description&&<p className={s.muted}>{l.description}</p>}<div className={s.cardActions}><Link href={`/panel/${l.id}`} className={s.manageLink}>Administrar </Link><Link href={`/liga/${l.slug}`} className={s.backLink}>Ver liga pública</Link></div></article>)}</div>{!leagues.some(l=>l.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))&&<p>No encontramos ligas con ese nombre.</p>}</>}</main></>;}
