export interface AchievementModel {
  id: string;
  title: string;
  description: string; // si es secreto, omitimos la descripción
  icon: string;
  secret?: boolean; // true = oculto (no mostrar la descripción en la lista)
}
