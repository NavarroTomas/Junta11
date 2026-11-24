"use client";
import Link from "next/link";
import {createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode} from "react";
import v from "./presentation.module.css";
import s from "./platform.module.css";

const ThemeContext=createContext<{dark:boolean; toggle:()=>void}>({dark:false,toggle:()=>{}});
export function PlatformTheme({children}:{children:ReactNode}) {
 const [dark,setDark]=useState(false);
 useEffect(()=>{
  try {setDark(localStorage.getItem("junta11-theme")==="dark");} catch {}
  const sync=(event:StorageEvent)=>{if(event.key==="junta11-theme")setDark(event.newValue==="dark");};
  window.addEventListener("storage",sync);
  return ()=>window.removeEventListener("storage",sync);
 },[]);
 function toggle(){setDark(previous=>{const next=!previous;try{localStorage.setItem("junta11-theme",next?"dark":"light");}catch{}return next;});}
 return <ThemeContext.Provider value={{dark,toggle}}><div className={`${v.theme} ${s.themed}`} data-theme={dark?"dark":"light"}>{children}</div></ThemeContext.Provider>;
}
export function ThemeToggle(){const {dark,toggle}=useContext(ThemeContext);return <button type="button" className={v.themeToggle} onClick={toggle} aria-label={dark?"Activar modo claro":"Activar modo oscuro"} aria-pressed={dark}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{dark?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></>:<path d="M20 15a8 8 0 0 1-11-11 8 8 0 1 0 11 11Z"/>}</svg></button>;}
export function Wordmark(){return <Link href="/" className={v.wordmark} aria-label="Junta11, inicio">JUNTA<span>11</span></Link>;}
export function PresentationHeader(){return <header className={v.header}><Wordmark/><ThemeToggle/></header>;}
export function AuthLayout({children}:{children:ReactNode}){return <PlatformTheme><PresentationHeader/><main className={v.authMain}><section className={v.authContent}>{children}</section></main></PlatformTheme>;}
/** The complete accessible string never changes; CSS reveals only its visual copy. */
export function TypedText({text,className=""}:{text:string;className?:string}){return <span className={`${v.typed} ${className}`} key={text} style={{"--letters":Math.max(text.length,1)} as CSSProperties}><span className={v.srOnly}>{text}</span><span aria-hidden="true" className={v.typedVisual}>{text}</span></span>;}
export function ModuleIcon({index}:{index:number}){const paths=["M4 19V9m6 10V5m6 14v-7m4 9H2","M4 8l5-4 3 3 3-3 5 4-3 4-2-1v9H9v-9l-2 1Z","M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m9 4a4 4 0 0 1 4 4v2m-4-10a4 4 0 0 0 0-8","M3 7h18v14H3Zm0 5h18M7 3v6m10-6v6","M7 3h10v5a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 1v7m-4 0h8","M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h4","M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m-2-6h4l1 4 4 1 3 4-3 3v4l-4 2-3-2-3 2-4-2v-4l-3-3 3-4 4-1Z","M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2m3 6a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"];return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index%paths.length]}/></svg>;}
