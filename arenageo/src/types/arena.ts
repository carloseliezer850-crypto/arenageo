export interface Arena {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  ownerId: number;
  active: boolean;
}

