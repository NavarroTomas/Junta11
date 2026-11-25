import type { Player } from "@/lib/platform/types";
import s from "./platform.module.css";

export default function ParticipantPicker({ players, selected, onChange }: {
    players: Player[];
    selected: string[];
    onChange: (ids: string[]) => void;
}) {
    const groups = new Map<string, Player[]>();
    for (const player of players) {
        const position = player.position?.trim() || "Sin definir";
        if (!groups.has(position)) groups.set(position, []);
        groups.get(position)!.push(player);
    }
    return <div className={s.participantPicker}>
        <div className={s.pickerHeading}>
            <span aria-live="polite">{selected.length} de {players.length} seleccionados</span>
            {players.length > 0 && <button type="button" className={s.outline} onClick={() => onChange(selected.length === players.length ? [] : players.map(p => p.id))}>
                {selected.length === players.length ? "Quitar todos" : "Elegir todos"}
            </button>}
        </div>
        {[...groups].map(([position, members]) => <details key={position}>
            <summary>{position} <small>{members.filter(p => selected.includes(p.id)).length} / {members.length}</small></summary>
            <div className={s.playerTiles}>{members.map(player =>
                <label key={player.id}>
                    <input type="checkbox" checked={selected.includes(player.id)} onChange={event =>
                        onChange(event.target.checked ? [...selected, player.id] : selected.filter(id => id !== player.id))}/>
                    {player.name}
                </label>
            )}</div>
        </details>)}
    </div>;
}
