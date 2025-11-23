export interface LeaderboardRow {
  id?: number;
  user_id: string;
  username?: string | null;
  score: number;
  meta?: any;
  created_at?: string | null;
}

export interface LeaderboardEntry extends LeaderboardRow {
  rank?: number;
}
