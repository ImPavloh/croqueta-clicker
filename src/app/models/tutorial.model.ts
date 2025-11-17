export interface TutorialMessage {
  id: string;
  minPoints?: number;
  maxPoints?: number;
  minClicks?: number;
  maxClicks?: number;
  minLevel?: number;
  maxLevel?: number;
  message: string;
  priority: number;
  autoShow?: boolean;
  category:
    | 'welcome'
    | 'tutorial'
    | 'milestone'
    | 'tips'
    | 'encouragement'
    | 'humor'
    | 'warning'
    | 'achievement';
}
