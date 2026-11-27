"use client";
import Link from "next/link";
import Image from "./LeagueImage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isPlatformConfigured, messageFor, platformClient } from "@/lib/platform/client";
import s from "./platform.module.css";
import {ThemeToggle, Wordmark} from "./Presentation";
export function Brand({ light = false }: {
    light?: boolean;
}) {
    void light;
    return <Wordmark/>;
}
export function Arrow() { return null; }
export function Header({ account = false, menu }: {
    account?: boolean;
    menu?: React.ReactNode;
}) {
    const router = useRouter(), [error, setError] = useState("");
    return <><header className={s.header}>{menu}<Brand /><nav aria-label="Navegación principal">{account ? <><Link href="/mis-ligas">Mis ligas</Link><button className={s.textButton} onClick={async () => { try {
        const { error } = await platformClient().auth.signOut({scope:"local"});
        if (error)
            throw error;
        router.replace("/login");
    }
    catch (e) {
        setError(messageFor(e));
    } }}>Cerrar sesión</button></> : <><Link href="/demo" className={s.hideMobile}>Ver ejemplo</Link><Link href="/login">Ingresar</Link><Link href="/registro" className={s.buttonSmall}>Crear mi liga </Link></>}<ThemeToggle/></nav></header>{error && <Notice error>{error}</Notice>}</>;
}
export function usePlatformSession(attempt = 0) {
    const configured = isPlatformConfigured();
    const [user, setUser] = useState<User | null>(null), [ready, setReady] = useState(!configured), [error, setError] = useState(configured ? "" : "La conexión con Supabase todavía no está configurada.");
    useEffect(() => {
        if (!configured)
            return;
        let active = true;
        setReady(false);
        setError("");
        const timer = window.setTimeout(() => {
            if (active) {
                setError("No pudimos comprobar tu sesión a tiempo. Volvé a intentar.");
                setReady(true);
            }
        }, 15000);
        const db = platformClient();
        let receivedEvent = false;
        const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
            if (!active) return;
            receivedEvent = true;
            clearTimeout(timer);
            setUser(session?.user ?? null);
            setError("");
            setReady(true);
        });
        db.auth.getSession().then(({ data, error }) => {
            if (!active || receivedEvent) return;
            clearTimeout(timer);
            setUser(data.session?.user ?? null);
            setError(error ? messageFor(error) : "");
            setReady(true);
        }).catch(error => {
            if (!active || receivedEvent) return;
            clearTimeout(timer);
            setError(messageFor(error));
            setReady(true);
        });
        return () => { active = false; clearTimeout(timer); subscription.unsubscribe(); };
    }, [configured, attempt]);
    return { user, ready, error };
}
export function Notice({ children, error = false }: {
    children: React.ReactNode;
    error?: boolean;
}) { return <p role={error ? "alert" : "status"} className={error ? s.error : s.notice}>{children}</p>; }
export function Loading({ text = "Cargando la liga…" }: {
    text?: string;
}) { return <div className={s.loading} role="status"><span className={s.spinner}/><p>{text}</p></div>; }
export function Monogram({ name, image, large = false }: {
    name: string;
    image?: string | null;
    large?: boolean;
}) {
    return <span className={`${s.monogram} ${large ? s.monogramLarge : ""}`}>{image ? <Image src={image} alt="" width={large ? 64 : 36} height={large ? 64 : 36} unoptimized/> : name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase()}</span>;
}
export function Footer() { return <footer className={s.footer}><Brand /><p>JUNTA11</p><Link href="/registro">Crear mi liga </Link></footer>; }
