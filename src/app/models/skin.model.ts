export type UnlockRequirement =
  | { type: 'none' }
  | { type: 'level'; value: number }
  | { type: 'croquetas'; value: number }
  | { type: 'exp'; value: number }
  | { type: 'achievement'; id: string };

export interface SkinModel {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlocked?: boolean;
  particleImage?: string;
  counterLabel?: string;
  unlockRequirement?: UnlockRequirement;
}
