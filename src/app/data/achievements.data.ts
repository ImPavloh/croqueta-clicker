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
  { id: 'six_seven', title: 'Six Seven', description: 'jeje sixseven', icon: '/assets/producers/click.webp', secret: true },

  // temporales de testeo
  { id: '1000_croquetas', title: 'Mil croquetas', description: 'Cocina 1,000 croquetas.', icon: '/assets/producers/click.webp' },
  { id: '10000_croquetas', title: 'Diez mil croquetas', description: 'Cocina 10,000 croquetas.', icon: '/assets/producers/click.webp' },
  { id: '100000_croquetas', title: 'Cien mil croquetas', description: 'Cocina 100,000 croquetas.', icon: '/assets/producers/click.webp' },
  { id: 'un_millon_croquetas', title: 'Un millón', description: 'Cocina 1,000,000 croquetas.', icon: '/assets/producers/click.webp' },
  { id: 'primer_productor', title: 'Primer productor', description: 'Compra tu primer productor.', icon: '/assets/producers/click.webp' },
  { id: '10_productores', title: 'Fábrica pequeña', description: 'Compra 10 productores.', icon: '/assets/producers/click.webp' },
  { id: '100_productores', title: 'Fábrica grande', description: 'Compra 100 productores.', icon: '/assets/producers/click.webp' },
  { id: 'primer_skin', title: 'Cambio de look', description: 'Compra tu primer skin.', icon: '/assets/producers/click.webp' },
  { id: 'todas_skins', title: 'Fashionista', description: 'Desbloquea todas las skins.', icon: '/assets/producers/click.webp' },
  { id: 'primer_upgrade', title: 'Mejora desbloqueada', description: 'Compra tu primera mejora.', icon: '/assets/producers/click.webp' },
  { id: 'todas_mejoras', title: 'Mejorado al máximo', description: 'Compra todas las mejoras.', icon: '/assets/producers/click.webp' },
  { id: 'primer_achievement_secreto', title: '¿Qué es esto?', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'click_rapido', title: 'Dedos veloces', description: 'Haz 100 clics en 10 segundos.', icon: '/assets/producers/click.webp' },
  { id: 'no_clics_1min', title: 'Zen', description: 'No hagas clics durante 1 minuto.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'primer_noticia', title: '¡Noticias!', description: 'Lee tu primera noticia.', icon: '/assets/producers/click.webp' },
  { id: 'todas_noticias', title: 'Periodista', description: 'Lee todas las noticias.', icon: '/assets/producers/click.webp' },
  { id: 'primer_achievement', title: 'Logro desbloqueado', description: 'Desbloquea tu primer logro.', icon: '/assets/producers/click.webp' },
  { id: 'todos_achievements', title: 'Maestro de logros', description: 'Desbloquea todos los logros.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_misterioso', title: 'Misterio', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_memero', title: 'Memero', description: 'Descubre el meme oculto.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_noche', title: 'Nocturno', description: 'Juega después de medianoche.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_maraton', title: 'Maratón', description: 'Juega durante 2 horas seguidas.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_paciencia', title: 'Paciencia', description: 'Juega 7 días seguidos.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_speedrun', title: 'Speedrun', description: 'Llega a 10,000 croquetas en menos de 5 minutos.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_bug', title: '¿Bug?', description: 'Encuentra un bug (o algo raro).', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_dev', title: 'Dev Mode', description: 'Activa el modo desarrollador.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_ost', title: 'Melómano', description: 'Escucha toda la OST.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_croqueta_dorada', title: 'Croqueta dorada', description: 'Consigue una croqueta dorada.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_croqueta_legendaria', title: 'Croqueta legendaria', description: 'Consigue una croqueta legendaria.', icon: '/assets/producers/click.webp', secret: true }
];
