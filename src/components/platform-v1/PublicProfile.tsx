import Link from "next/link";
import type {LeagueBundle} from "@/lib/platform/types";
import {leaguePath,profilePath,playerSummary,teamMatches,type ProfileView} from "@/lib/platform/profiles";
import {standings,matchLabel} from "@/lib/platform/domain";
import {MatchRows,PlayersTable,dateLabel} from "./LeagueViews";
import {Monogram} from "./ui";
import s from "./platform.module.css";
function Metrics({items}:{items:[string,string|number][]}){return <div className={s.profileMetrics}>{items.map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>;}
export default function PublicProfile({data,view}:{data:LeagueBundle;view:ProfileView}){
 const entity=view.kind==="equipos"?data.teams.find(x=>x.id===view.id):view.kind==="jugadores"?data.players.find(x=>x.id===view.id):view.kind==="partidos"?data.matches.find(x=>x.id===view.id):data.news.find(x=>x.id===view.id&&x.published);
 const back=<Link className={s.outline} href={leaguePath(data)}>Ver liga</Link>;
 if(!entity)return <section className={s.empty}><h1>No encontramos esta ficha</h1>{back}</section>;
 if(view.kind==="equipos"){
  const team=data.teams.find(t=>t.id===view.id)!,players=data.players.filter(p=>p.team_id===team.id),matches=teamMatches(data,team.id),row=standings(data).find(r=>r.id===team.id);
  return <><div className={s.profileHeading}><Monogram name={team.name} image={team.logo_url} large/><div><p className={s.profileLabel}>Equipo</p><h1>{team.name}</h1>{team.is_active===false&&<span className={s.badge}>Retirado</span>}</div>{back}</div>
   <Metrics items={[["Jugadores",players.length],["Partidos",row?.played??0],["Victorias",row?.won??0],["Goles",row?.goalsFor??0]]}/>
   <section className={s.panel}><h2>Plantel</h2>{players.length?<div className={s.entityGrid}>{players.map(p=><Link key={p.id} className={s.personCard} href={profilePath(data,"jugadores",p.id)}><Monogram name={p.name} image={p.photo_url}/><div><strong>{p.name}</strong><small>{p.position}</small></div></Link>)}</div>:<p className={s.muted}>Sin jugadores</p>}</section>
   <section className={s.panel}><h2>Partidos</h2><MatchRows data={data} items={matches}/></section></>;
 }
 if(view.kind==="jugadores"){
  const player=data.players.find(p=>p.id===view.id)!,team=data.teams.find(t=>t.id===player.team_id),summary=playerSummary(data,player.id);
  return <><div className={s.profileHeading}><Monogram name={player.name} image={player.photo_url} large/><div><p className={s.profileLabel}>Jugador</p><h1>{player.name}</h1><p className={s.muted}>{player.position}{team&&<> · <Link href={profilePath(data,"equipos",team.id)}>{team.name}</Link></>}</p></div>{back}</div>
   <Metrics items={[["Partidos",summary.played],["Goles",summary.goals],["Asistencias",summary.assists],["Nota media",summary.rating?.toFixed(1)??"Sin nota"]]}/>
   {data.seasons.length>1&&<section className={s.panel}><h2>Temporadas</h2><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Temporada</th><th>Partidos</th><th>Goles</th><th>Asistencias</th></tr></thead><tbody>{data.seasons.map(season=>{const ids=new Set(data.competitions.filter(c=>c.season_id===season.id).map(c=>c.id));const period=playerSummary({...data,matches:data.matches.filter(m=>ids.has(m.competition_id))},player.id);return <tr key={season.id}><td>{season.name}</td><td>{period.played}</td><td>{period.goals}</td><td>{period.assists}</td></tr>;})}</tbody></table></div></section>}
   <section className={s.panel}><h2>Disciplina</h2><div className={s.wrap}><span>Amarillas: {summary.yellow}</span><span>Rojas: {summary.red}</span></div></section>
   <section className={s.panel}><h2>Partidos</h2><MatchRows data={data} items={data.matches.filter(m=>summary.matchIds.has(m.id))}/></section></>;
 }
 if(view.kind==="partidos"){
  const match=data.matches.find(m=>m.id===view.id)!,stats=data.stats.filter(row=>row.match_id===match.id);
  return <><div className={s.profileHeading}><div><p className={s.profileLabel}>Fecha {match.round}</p><h1>Partido</h1><p className={s.muted}>{dateLabel(match.starts_at)}{match.venue?` · ${match.venue}`:""}</p></div>{back}</div>
   <div className={s.scoreboard}><div>{match.home_team_id?<Link href={profilePath(data,"equipos",match.home_team_id)}>{matchLabel(match,"home",data)}</Link>:match.home_label}</div><strong>{match.status==="completed"?`${match.home_score} : ${match.away_score}`:"VS"}</strong><div>{match.away_team_id?<Link href={profilePath(data,"equipos",match.away_team_id)}>{matchLabel(match,"away",data)}</Link>:match.away_label}</div></div>
   <p className={s.profileLabel}>{match.status==="completed"?"Finalizado":"Programado"}</p>
   <section className={s.panel}><h2>Jugadores</h2>{stats.length?<PlayersTable data={{...data,matches:[match],stats,players:data.players.filter(player=>stats.some(row=>row.player_id===player.id))}}/>:<p className={s.muted}>Sin estadísticas cargadas</p>}</section></>;
 }
 const news=data.news.find(n=>n.id===view.id&&n.published)!;
 return <article className={s.newsArticle}><div className={s.profileHeading}><div><p className={s.profileLabel}>Noticia · {new Date(news.created_at).toLocaleDateString("es-AR")}</p><h1>{news.title}</h1></div>{back}</div>{news.image_url&&<img src={news.image_url} alt=""/>}<p>{news.body}</p></article>;
}
