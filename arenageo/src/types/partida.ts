export interface Match {
  id: number;
  creatorId: number;
  sportId: number;
  spaceId: number | null;
  title: string;
  description: string;
  dateTime: string;
  durationMinutes: number;
  maxPlayers: number;
  currentPlayers: number;
  skillLevelId: number;
  statusId: number;
  visibility: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface MatchStatus {
  id: number;
  name: string;
  code: string;
}

export interface MatchPlayer {
  id: number;
  matchId: number;
  playerId: number;
  statusId: number;
  joinedAt: string;
}

