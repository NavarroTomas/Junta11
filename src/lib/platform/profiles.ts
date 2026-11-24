import type {LeagueBundle} from "./types";
export type ProfileKind="equipos"|"jugadores"|"partidos"|"noticias";
export type ProfileView={kind:ProfileKind;id:string};
export function leaguePath(data:LeagueBundle){return data.league.id==="example"?"/demo":`/liga/${encodeURIComponent(data.league.slug)}`;}
export function profilePath(data:LeagueBundle,kind:ProfileKind,id:string){return `${leaguePath(data)}/${kind}/${encodeURIComponent(id)}`;}
export function playerSummary(data:LeagueBundle,id:string){
 const matches=new Map(data.matches.filter(match=>match.status==="completed").map(match=>[match.id,match]));
 const stats=data.stats.filter(row=>row.player_id===id&&matches.has(row.match_id));
 const ratings=stats.flatMap(row=>row.rating===null?[]:[row.rating]);
 return {played:stats.length,goals:stats.reduce((n,s)=>n+s.goals,0),assists:stats.reduce((n,s)=>n+s.assists,0),yellow:stats.reduce((n,s)=>n+s.yellow_cards,0),red:stats.reduce((n,s)=>n+s.red_cards,0),rating:ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:null,matchIds:new Set(stats.map(row=>row.match_id))};
}
export function teamMatches(data:LeagueBundle,id:string){return data.matches.filter(match=>match.home_team_id===id||match.away_team_id===id);}
