"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { platformClient, messageFor } from "@/lib/platform/client";
import { AuthLayout, TypedText } from "./Presentation";
import { Loading, Notice, usePlatformSession } from "./ui";
import v from "./presentation.module.css";
import PasswordInput from "./PasswordInput";

export default function Recovery() {
  const { user, ready, error: sessionError } = usePlatformSession();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submitting = useRef(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      if (password.length < 10) throw new Error("Usá al menos 10 caracteres.");
      const { error } = await platformClient().auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setDone(true);
    } catch (error) {
      setError(messageFor(error));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return <AuthLayout>
    <h1 className={v.title}><TypedText text={done ? "Acceso actualizado." : "Recuperar acceso."} /></h1>
    {sessionError ? <Notice error>{sessionError}</Notice> : !ready ? <Loading text="Comprobando el acceso…" /> : done ? <>
      <Notice>Contraseña actualizada.</Notice>
      <Link href="/mis-ligas" className={v.action}>Ir a mis ligas</Link>
    </> : user ? <>
      <p className={v.hint}>Mínimo 10 caracteres.</p>
      <form className={v.authForm} onSubmit={save} aria-busy={busy}>
        <div className={v.field}><label htmlFor="new-password">Nueva contraseña</label>
          <PasswordInput id="new-password" required minLength={10} disabled={busy} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        {error && <Notice error>{error}</Notice>}
        <button type="submit" className={v.action} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
      </form>
    </> : <>
      <p className={v.hint}>Abrí el enlace de tu correo o pedí uno nuevo.</p>
      <Link href="/login?recovery=1" className={v.action}>Pedir enlace</Link>
      <Link href="/login" className={v.secondary}>Volver</Link>
    </>}
  </AuthLayout>;
}
