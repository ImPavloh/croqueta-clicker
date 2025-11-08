export interface StatModel {
  id: string;                // identificador único
  title: string;             // título mostrado
  key: string;               // referencia al valor en PlayerStats
  icon: string;              // nombre del icono
  format: 'number' | 'percentage' | 'time';
  description?: string;      // texto opcional para tooltip o ayuda
}
