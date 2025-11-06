export interface Achievement {
  id: string;
  title: string;
  description: string; // si es secreto, omitimos la descripción
  icon: string;        
  secret?: boolean;     // true = oculto (no mostrar la descripción en la lista)
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primera_croqueta', title: 'Primera croqueta', description: 'Cocina tu primera croqueta.', icon: '/assets/producers/click.webp' },
  { id: '100_croquetas', title: '100 croquetas', description: 'Cocina 100 croquetas.', icon: '/assets/producers/click.webp'},
  { id: 'six_seven', title: 'Six Seven', description: 'jeje sixseven', icon: '/assets/producers/click.webp', secret: true }
];
