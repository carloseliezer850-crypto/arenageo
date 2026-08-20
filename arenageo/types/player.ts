export interface Player {
  id: number;
  name: string;
  username: string;
  profileImageUrl: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  skillLevelId: number;
  active: boolean;
}

export interface PlayerSport {
  id: number;
  playerId: number;
  sportId: number;
  skillLevelId: number;
}
