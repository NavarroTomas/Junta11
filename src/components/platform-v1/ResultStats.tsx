import type {LeagueBundle, Match, MatchPlayer} from "@/lib/platform/types";
import {matchLabel} from "@/lib/platform/domain";
import {Monogram} from "./ui";
import s from "./platform.module.css";

const metrics = [
    {key:"goals", label:"Goles", prompt:"Elegir goleador", max:999},
    {key:"assists", label:"Asistencias", prompt:"Elegir asistente", max:999},
    {key:"yellow_cards", label:"Amarillas", prompt:"Elegir jugador", max:2},
    {key:"red_cards", label:"Rojas", prompt:"Elegir jugador", max:1},
    {key:"rating", label:"Calificaciones", prompt:"Elegir jugador", max:10}
] as const;
type Metric = typeof metrics[number]["key"];
type Props = {
    data: LeagueBundle; match: Match; stats: MatchPlayer[];
    onChange: (rows: MatchPlayer[]) => void;
};

export default function ResultStats({data, match, stats, onChange}: Props) {
    const historical = new Map(data.stats.filter(row=>row.match_id===match.id).map(row=>[row.player_id,row.side]));
    const current = new Map(stats.map(row=>[row.player_id,row]));
    function assign(id:string, side:MatchPlayer["side"], key?:Metric, value?:number|null) {
        const row = current.get(id) ?? {player_id:id,side,match_id:match.id,league_id:data.league.id,goals:0,assists:0,yellow_cards:0,red_cards:0,rating:null};
        if (row.side !== side) return;
        onChange([...stats.filter(previous=>previous.player_id!==id),key ? {...row,[key]:value} : row]);
    }
    return <div className={s.resultTeams}>{(["home","away"] as const).map(side=>{
        const teamId = side==="home" ? match.home_team_id : match.away_team_id;
        const eligible = data.players.filter(p=>{
            const assigned = current.get(p.id);
            if (assigned) return assigned.side===side;
            if (data.league.mode==="players") return true;
            return historical.has(p.id) ? historical.get(p.id)===side : p.team_id===teamId;
        });
        const played=eligible.filter(p=>current.has(p.id));
        return <section className={s.resultTeam} key={side}>
            <h3>{matchLabel(match,side,data)}</h3>
            {metrics.map(({key,label,prompt,max})=>{
                const recorded = played.filter(p=>(current.get(p.id)?.[key] ?? 0)>0);
                const choices=eligible.filter(p=>!(current.get(p.id)?.[key]));
                return <details key={key} className={s.statFold}>
                    <summary>{label} <span>{key==="rating"?recorded.length:recorded.reduce((total,p)=>total+(current.get(p.id)?.[key] ?? 0),0)}</span></summary>
                    <select aria-label={prompt+" · "+label+" · "+matchLabel(match,side,data)} value="" disabled={!choices.length}
                        onChange={e=>{if(e.target.value) assign(e.target.value,side,key,1);}}>
                        <option value="">{choices.length?prompt:"Sin jugadores disponibles"}</option>
                        {choices.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {recorded.map(p=><label key={p.id} className={s.resultPlayer}>
                        <Monogram name={p.name} image={p.photo_url}/><strong>{p.name}</strong>
                        <input aria-label={label+" de "+p.name} type="number" min={key==="rating"?1:0} max={max} step={key==="rating"?0.1:1}
                            value={current.get(p.id)?.[key] ?? ""} onChange={e=>assign(p.id,side,key,e.target.value===""&&key==="rating"?null:Number(e.target.value))}/>
                    </label>)}
                </details>;
            })}
            <details className={s.statFold}><summary>Participación <span>{played.length}</span></summary>
                <p className={s.help}>Marcá a quienes jugaron, incluso si no registraron estadísticas.</p>
                {eligible.map(p=><label className={s.participationRow} key={p.id}>
                    <input type="checkbox" checked={current.has(p.id)} disabled={metrics.some(({key})=>(current.get(p.id)?.[key]??0)>0)}
                        onChange={e=>e.target.checked?assign(p.id,side):onChange(stats.filter(row=>row.player_id!==p.id))}/>
                    {p.name}</label>)}
            </details>
        </section>;
    })}</div>;
}
