"use client";
import { useEffect, useState, type FormEvent } from "react";
import { messageFor, platformClient } from "@/lib/platform/client";
import type { League } from "@/lib/platform/types";
import { Notice } from "./ui";
import s from "./platform.module.css";

export default function OwnerAccess({ league, refresh }: { league: League; refresh: () => Promise<void> }) {
    const [owner, setOwner] = useState(false);
    const [email, setEmail] = useState("");
    const [action, setAction] = useState("add");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    useEffect(() => {
        let active = true;
        const db = platformClient();
        setOwner(false);
        async function loadRole() {
            const { data: { user }, error } = await db.auth.getUser();
            if (error) throw error;
            if (!user) return;
            const response = await db.from("league_members").select("role").eq("league_id", league.id).eq("user_id", user.id).maybeSingle();
            if (response.error) throw response.error;
            if (active) setOwner(response.data?.role === "owner");
        }
        void loadRole().catch(e => { if (active) setError(messageFor(e)); });
        return () => { active = false; };
    }, [league.id]);
    async function run(name: string, args: Record<string, unknown>, confirmation: string) {
        setBusy(true); setError(""); setSuccess("");
        try {
            const { error } = await platformClient().rpc(name, args);
            if (error) throw error;
            await refresh();
            setSuccess(confirmation);
            setEmail("");
        } catch (e) { setError(messageFor(e)); }
        finally { setBusy(false); }
    }
    function membership(event: FormEvent) {
        event.preventDefault();
        const remove = action === "remove";
        if (remove && !window.confirm(`¿Quitar el acceso de ${email.trim()} a esta liga?`)) return;
        void run(remove ? "remove_league_admin" : "add_league_admin",
            { p_league_id: league.id, p_email: email.trim() }, remove ? "Acceso revocado." : "Acceso otorgado.");
    }
    return <section className={s.panel}>
        <h2>Visibilidad y accesos</h2>
        <p>{league.is_public ? "Liga pública. Cualquier persona puede consultar el plantel y los partidos." : "Liga privada. Solo sus administradores pueden consultarla."}</p>
        {owner && <>
            <button className={s.outline} disabled={busy} onClick={() => {
                if (!league.is_public && !window.confirm("¿Publicar el plantel, los partidos y las noticias publicadas para cualquier visitante?")) return;
                void run("set_league_visibility", { p_league_id: league.id, p_public: !league.is_public }, "Visibilidad actualizada.");
            }}>{league.is_public ? "Hacer privada" : "Publicar liga"}</button>
            <h3>Administradores</h3>
            <form className={s.form} onSubmit={membership}>
                <label className={s.field}>Acción<select value={action} onChange={e => setAction(e.target.value)}>
                    <option value="add">Dar acceso</option><option value="remove">Quitar acceso</option>
                </select></label>
                <label className={s.field}>Correo del administrador<input required type="email" value={email} onChange={e => setEmail(e.target.value)}/></label>
                <button className={s.outline} disabled={busy}>{action === "remove" ? "Quitar administrador" : "Agregar administrador"}</button>
            </form>
        </>}
        {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
    </section>;
}
