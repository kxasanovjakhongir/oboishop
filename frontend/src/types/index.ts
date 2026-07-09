export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface Wallpaper {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | null;
  color: string;
  brand: string;
  images: string[];
  texture: string;
  width: string;
  length: string;
  material: string;
  stock: boolean;
  featured: boolean;
  discount: number;
  views: number;
}

export interface CartItem {
  wallpaper: Wallpaper;
  quantity: number;
}

export type WallTarget = 'all' | 'back' | 'front' | 'left' | 'right';

export type RoomId = 'living' | 'bedroom' | 'kitchen' | 'kids' | 'hall' | 'stair' | 'tv';

export interface WallTextures {
  back: Wallpaper | null;
  front: Wallpaper | null;
  left: Wallpaper | null;
  right: Wallpaper | null;
}

export interface RoomConfig {
  id: RoomId;
  name: string;
  icon: string;
  W: number;
  H: number;
  D: number;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface FilterState {
  category: string;
  color: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  search: string;
}
