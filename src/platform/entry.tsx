import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import Access from "@/components/platform-v1/Access";
import Manager from "@/components/platform-v1/Manager";
import MyLeagues from "@/components/platform-v1/MyLeagues";
import Onboarding from "@/components/platform-v1/Onboarding";
import { PlatformTheme } from "@/components/platform-v1/Presentation";
import PublicLeague from "@/components/platform-v1/PublicLeague";
import Recovery from "@/components/platform-v1/Recovery";
import { exampleLeague } from "@/lib/platform/example";
import type { ProfileKind } from "@/lib/platform/profiles";
import "./reset.css";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ padding: 40 }}>
        <h1>No pudimos abrir esta pantalla.</h1>
        <p>Volvé a intentarlo. Tus ligas siguen guardadas en la plataforma.</p>
        <Link href="/mis-ligas">Volver a mis ligas</Link>
      </main>
    );
  }
}

function Route() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/login") return <Access />;
  if (path === "/registro" || path === "/crear-liga") return <Onboarding />;
  if (path === "/recuperar") return <Recovery />;
  if (path === "/mis-ligas") return <PlatformTheme><MyLeagues /></PlatformTheme>;

  const panel = path.match(/^\/panel\/([0-9a-f-]{36})$/i);
  if (panel) return <PlatformTheme><Manager leagueId={panel[1]} /></PlatformTheme>;

  const demo = path.match(/^\/demo(?:\/(equipos|jugadores|partidos|noticias)\/([^/]+))?$/);
  if (demo) {
    const view = demo[1] ? { kind: demo[1] as ProfileKind, id: decodeURIComponent(demo[2]) } : undefined;
    return <PlatformTheme><PublicLeague example={exampleLeague()} view={view} /></PlatformTheme>;
  }

  const league = path.match(/^\/(?:liga|l)\/([^/]+)(?:\/(equipos|jugadores|partidos|noticias)\/([^/]+))?$/);
  if (league) {
    const view = league[2] ? { kind: league[2] as ProfileKind, id: decodeURIComponent(league[3]) } : undefined;
    return <PlatformTheme><PublicLeague slug={decodeURIComponent(league[1])} view={view} /></PlatformTheme>;
  }

  return <main><h1>No encontramos esta página.</h1><Link href="/">Ir al inicio</Link></main>;
}

const root = document.getElementById("platform-root");
if (root) {
  createRoot(root).render(<Boundary><div data-platform-shell><Route /></div></Boundary>);
}
