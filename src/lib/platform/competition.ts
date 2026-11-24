import type { LeagueBundle } from "./types";

/** A valid context must belong to the selected league, season and division. */
export function validCompetitions(data: LeagueBundle) {
    return data.competitions.filter(c => c.league_id === data.league.id
        && data.seasons.some(s => s.id === c.season_id && s.league_id === c.league_id)
        && data.divisions.some(d => d.id === c.division_id && d.league_id === c.league_id && d.season_id === c.season_id));
}

export function selectCompetitionId(data: LeagueBundle, requestedId?: string): string {
    const available = validCompetitions(data);
    if (requestedId && available.some(c => c.id === requestedId)) return requestedId;
    const active = data.seasons.find(s => s.league_id === data.league.id && s.is_active);
    return available.find(c => c.season_id === active?.id)?.id ?? available[0]?.id ?? "";
}

/** Sporting results never aggregate two competitions. Catalogs remain league-wide.
 * An invalid explicit context stays empty instead of leaking into another context.
 */
export function competitionBundle(data: LeagueBundle, competitionId: string): LeagueBundle {
    const competition = validCompetitions(data).find(c => c.id === competitionId);
    const matches = competition ? data.matches.filter(m => m.league_id === data.league.id && m.competition_id === competition.id) : [];
    const ids = new Set(matches.map(m => m.id));
    return {
        ...data,
        league: competition ? { ...data.league, format: competition.format } : data.league,
        matches,
        stats: data.stats.filter(s => s.league_id === data.league.id && ids.has(s.match_id)),
        seasons: competition ? data.seasons.filter(s => s.id === competition.season_id) : [],
        divisions: competition ? data.divisions.filter(d => d.id === competition.division_id) : [],
        competitions: competition ? [competition] : [],
    };
}

export function competitionLabel(data: LeagueBundle, id: string): string {
    const c = validCompetitions(data).find(c => c.id === id);
    if (!c) return "Sin competencia";
    const season = data.seasons.find(s => s.id === c.season_id);
    const division = data.divisions.find(d => d.id === c.division_id);
    return `${season?.name} / ${division?.name} / ${c.name}`;
}
