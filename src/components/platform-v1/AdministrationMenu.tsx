import {ModuleIcon} from "./Presentation";
import s from "./platform.module.css";
export default function AdministrationMenu({name,teams,onSelect}:{name:string;teams:boolean;onSelect:(section:string)=>void}){
 const modules=[...(teams?[{label:"Equipos",icon:1}]:[]),{label:"Jugadores",icon:2},{label:"Partidos",icon:3},{label:"Estadísticas",icon:0},{label:"Temporadas",icon:4},{label:"Noticias",icon:5},{label:"Configuración",icon:6},{label:"Enlace",icon:7}];
 return <main className={s.adminMenu}><div className={s.adminHeading}><h1>Administración</h1><span>{name}</span></div>
  <nav className={s.adminGrid} aria-label="Administración">{modules.map(item=><button type="button" key={item.label} className={s.adminCard} onClick={()=>onSelect(item.label)}><ModuleIcon index={item.icon}/><span>{item.label}</span></button>)}</nav>
  <footer className={s.adminFooter}>JUNTA11</footer>
 </main>;
}
