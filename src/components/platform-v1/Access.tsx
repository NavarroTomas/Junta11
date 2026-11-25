"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DRAFT_KEY } from "@/lib/platform/domain";
import { loginDestination } from "@/lib/platform/access";
import { messageFor, platformClient } from "@/lib/platform/client";
import { AuthLayout, TypedText } from "./Presentation";
import { Notice } from "./ui";
import v from "./presentation.module.css";
import PasswordInput from "./PasswordInput";

export default function Access() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const recoveryFromQuery = new URLSearchParams(window.location.search).get("recovery") === "1";
    const frame = requestAnimationFrame(() => setRecovery(recoveryFromQuery));
    return () => cancelAnimationFrame(frame);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      if (recovery) {
        const { error } = await platformClient().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/recuperar`,
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await platformClient().auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword("");
        let draft = false;
        try {
          draft = !!localStorage.getItem(DRAFT_KEY);
        } catch { /* Storage may be unavailable; login still works. */ }
        router.replace(loginDestination(new URLSearchParams(window.location.search).get("next"), draft));
      }
    } catch (error) {
      setError(messageFor(error));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return <AuthLayout>
    <h1 className={v.title}><TypedText text={recovery ? "Recuperar acceso." : "Iniciar sesión"} /></h1>
    {sent ? <Notice>Si tenés una cuenta, recibirás un enlace por correo.</Notice> : <form onSubmit={submit} className={v.authForm} aria-busy={busy}>
      <label className={v.field}>Correo electrónico
        <input type="email" required disabled={busy} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />
      </label>
      {!recovery && <>
        <div className={v.field}><label htmlFor="login-password">Contraseña</label>
          <PasswordInput id="login-password" required disabled={busy} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>
      </>}
      {error && <Notice error>{error}</Notice>}
      {!recovery && <div className={v.authQuestions}>
        <button type="button" disabled={busy} onClick={() => { setRecovery(true); setError(""); }}>¿Olvidaste tu contraseña?</button>
        <Link href="/registro">¿Aún no tienes cuenta?</Link>
      </div>}
      <button type="submit" className={v.action} disabled={busy}>{busy ? "Un momento…" : recovery ? "Enviar enlace" : "Ingresar"}</button>
    </form>}
    {recovery && <button type="button" className={v.secondary} disabled={busy} onClick={() => { setRecovery(false); setError(""); setSent(false); }}>Volver</button>}
  </AuthLayout>;
}
