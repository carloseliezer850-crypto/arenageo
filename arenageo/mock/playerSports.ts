export interface PlayerSportSeed {
  id: number;
  playerId: number;
  sportId: number;
  skillLevelId: number;
}

export const playerSports: PlayerSportSeed[] = [
  { id: 1, playerId: 10, sportId: 1, skillLevelId: 2 },
  { id: 2, playerId: 10, sportId: 3, skillLevelId: 1 },
  { id: 3, playerId: 11, sportId: 1, skillLevelId: 2 },
  { id: 4, playerId: 12, sportId: 2, skillLevelId: 1 },
  { id: 5, playerId: 13, sportId: 6, skillLevelId: 3 },
];
