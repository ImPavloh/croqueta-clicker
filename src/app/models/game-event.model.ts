export interface GameEvent {
  id: number;
  type: 'golden' | 'burnt' | 'bonus';
  duration: number;
  effect: number;
  active: boolean;
  spawned: boolean;
  position: { x: number; y: number };
  image: string;
  remainingTime?: number;
  state?: 'fading-in' | 'visible' | 'fading-out';
}
