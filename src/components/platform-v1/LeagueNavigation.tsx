"use client";
import { useRef } from "react";
import Link from "next/link";
import { Wordmark } from "./Presentation";
import { administrationModules } from "./AdministrationMenu";
import s from "./platform.module.css";

export default function LeagueNavigation({ signedIn, panelId, teams, onSection }: {
  signedIn: boolean;
  panelId?: string;
  teams: boolean;
  onSection?: (name: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" className={s.menuTrigger} aria-label="Abrir menú" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      <span/><span/><span/>
    </button>
    <dialog ref={dialog} className={s.leagueDrawer} aria-label="Menú de Junta11">
      <div className={s.menuBar}>
        <button type="button" autoFocus className={s.menuClose} aria-label="Cerrar menú" onClick={() => dialog.current?.close()}><span/><span/></button>
        <Wordmark/>
      </div>
      <div className={s.drawerColumns}>
        <nav aria-label="Junta11">{signedIn && <h2>Junta11</h2>}
          <Link href="/#historia">La plataforma</Link>
          <Link href="/#como-funciona">Cómo funciona</Link>
          <Link href="/demo">Ver una liga</Link>
          <Link href={signedIn ? "/crear-liga" : "/registro"}>Crear mi liga</Link>
          {!signedIn && <Link href="/login">Iniciar sesión</Link>}
        </nav>
        {signedIn && <nav aria-label="Administración"><h2>Administración</h2>
          <Link href="/mis-ligas">Mis ligas</Link>
          {panelId && administrationModules(teams).map(({label}) => onSection
            ? <button type="button" key={label} onClick={() => { onSection(label); dialog.current?.close(); }}>{label}</button>
            : <Link key={label} href={`/panel/${panelId}?seccion=${encodeURIComponent(label)}`}>{label}</Link>)}
        </nav>}
      </div>
    </dialog>
  </>;
}
