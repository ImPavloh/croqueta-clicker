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
  autoShow?: boolean; // Si debe mostrarse automáticamente (importante para mensajes de bienvenida, para el tutorial en sí)
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
