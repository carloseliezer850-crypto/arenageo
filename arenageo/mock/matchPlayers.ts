export interface MatchPlayerSeed {
  id: number;
  matchId: number;
  playerId: number;
  statusId: number;
  joinedAt: string;
}

export const matchPlayers: MatchPlayerSeed[] = [
  { id: 1, matchId: 1, playerId: 10, statusId: 1, joinedAt: "2026-08-18T12:15:00" },
  { id: 2, matchId: 1, playerId: 11, statusId: 1, joinedAt: "2026-08-18T12:20:00" },
  { id: 3, matchId: 2, playerId: 12, statusId: 1, joinedAt: "2026-08-18T09:30:00" },
  { id: 4, matchId: 3, playerId: 12, statusId: 1, joinedAt: "2026-08-17T18:50:00" },
];
