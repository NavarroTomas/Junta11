import React from "react";
/** Sites serves browser routes; keep navigation on this origin. */
const router={push:(path:string)=>window.location.assign(path),replace:(path:string)=>window.location.replace(path),refresh:()=>window.location.reload(),back:()=>window.history.back()};
export function useRouter(){return router;}
export function usePathname(){return window.location.pathname;}
export function useParams(){return {leagueId:window.location.pathname.split("/")[2]};}
export default function Link({href,children,prefetch,replace,scroll,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{href:string;prefetch?:boolean;replace?:boolean;scroll?:boolean}){void prefetch;void scroll;return <a {...props} href={href} onClick={event=>{props.onClick?.(event);if(replace&&!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();window.location.replace(href);}}}>{children}</a>;}
