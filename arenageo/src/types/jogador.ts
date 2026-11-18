export interface Player {
  id: number;
  name: string;
  username: string;
  city: string;
  state: string;
  bio: string;
  timezone: string;
  validUntil: string;
  sports: { id: number; name: string; levelId: number; level: string }[];
  slots: { day: number; start: number; end: number }[];
}
export interface DiscoveryConfig {
  visible: boolean;
  name: string;
  city: string;
  state: string;
  bio: string;
  timezone: string;
  validUntil: string;
  revision: number;
  slots: Player["slots"];
}
export interface PlayerPage {
  items: Player[];
  total: number;
  page: number;
  size: number;
}
