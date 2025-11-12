export interface SkinModel {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlocked?: boolean; // para lógica futura (si se bloquean)
  particleImage?: string;
  counterLabel?: string;
}
