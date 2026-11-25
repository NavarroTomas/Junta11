import type { Player } from "@/lib/platform/types";
import { Monogram } from "./ui";
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
        {[...groups].map(([position, members]) => <details key={position} open>
            <summary>{position} <small>{members.filter(p => selected.includes(p.id)).length} / {members.length}</small></summary>
            <div className={s.playerTiles}>{members.map(player =>
                <button type="button" key={player.id} aria-pressed={selected.includes(player.id)}
                    onClick={() => onChange(selected.includes(player.id) ? selected.filter(id => id !== player.id) : [...selected, player.id])}>
                    <Monogram name={player.name} image={player.photo_url}/>
                    <strong>{player.name}</strong>
                </button>
            )}</div>
        </details>)}
    </div>;
}
