"use client";
import { useRef } from "react";
import Link from "next/link";
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
    <button type="button" className={s.outline} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Menú</button>
    <dialog ref={dialog} className={s.leagueDrawer} aria-label="Menú de Junta11" onClick={event => {
      if (event.target === dialog.current && event.clientX > dialog.current.getBoundingClientRect().right) dialog.current.close();
    }}>
      <button type="button" autoFocus className={s.outline} onClick={() => dialog.current?.close()}>Cerrar</button>
      <div className={s.drawerColumns}>
        <nav aria-label="Junta11"><h2>Junta11</h2>
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
