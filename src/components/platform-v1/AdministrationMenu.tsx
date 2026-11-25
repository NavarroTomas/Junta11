import {ModuleIcon} from "./Presentation";
import s from "./platform.module.css";
export function administrationModules(teams:boolean) {
 return [...(teams?[{label:"Equipos",icon:1}]:[]),{label:"Jugadores",icon:2},{label:"Partidos",icon:3},{label:"Estadísticas",icon:0},{label:"Temporadas",icon:4},{label:"Noticias",icon:5},{label:"Configuración",icon:6},{label:"Enlace",icon:7}];
}
export default function AdministrationMenu({name,teams,onSelect}:{name:string;teams:boolean;onSelect:(section:string)=>void}){
 const modules=administrationModules(teams);
 return <main className={s.adminMenu}><div className={s.adminHeading}><h1>Administración</h1><span>{name}</span></div>
  <div className={s.quickActions}>
    <button type="button" onClick={()=>onSelect("Crear partido")}><ModuleIcon index={3}/>Crear partido</button>
    <button type="button" onClick={()=>onSelect("Agregar jugador")}><ModuleIcon index={2}/>Agregar jugador</button>
  </div>
  <nav className={s.adminGrid} aria-label="Administración">{modules.map(item=><button type="button" key={item.label} className={s.adminCard} onClick={()=>onSelect(item.label)}><ModuleIcon index={item.icon}/><span>{item.label}</span></button>)}</nav>
  <footer className={s.adminFooter}>JUNTA11</footer>
 </main>;
}
