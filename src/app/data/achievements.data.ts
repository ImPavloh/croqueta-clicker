export interface Achievement {
  id: string;
  title: string;
  description: string; // si es secreto, omitimos la descripción
  icon: string;
  secret?: boolean; // true = oculto (no mostrar la descripción en la lista)
}

export const ACHIEVEMENTS: Achievement[] = [
  // ------------------------------------------------------------
  // CLICKS (Implementado)
  // ------------------------------------------------------------
  {
    id: 'primera_croqueta',
    title: 'achievements.primera_croqueta.title',
    description: 'achievements.primera_croqueta.description',
    icon: '/assets/achievements/clicks/1.webp',
  },
  {
    id: '1k_croquetas',
    title: 'achievements.1k_croquetas.title',
    description: 'achievements.1k_croquetas.description',
    icon: '/assets/achievements/clicks/2.webp',
  },
  {
    id: '1m_croquetas',
    title: 'achievements.1m_croquetas.title',
    description: 'achievements.1m_croquetas.description',
    icon: '/assets/achievements/clicks/3.webp',
  },
  {
    id: '1b_croquetas',
    title: 'achievements.1b_croquetas.title',
    description: 'achievements.1b_croquetas.description',
    icon: '/assets/achievements/clicks/4.webp',
  },
  {
    id: '1t_croquetas',
    title: 'achievements.1t_croquetas.title',
    description: 'achievements.1t_croquetas.description',
    icon: '/assets/achievements/clicks/5.webp',
  },
  {
    id: '1qa_croquetas',
    title: 'achievements.1qa_croquetas.title',
    description: 'achievements.1qa_croquetas.description',
    icon: '/assets/achievements/clicks/6.webp',
  },
  {
    id: '1qi_croquetas',
    title: 'achievements.1qi_croquetas.title',
    description: 'achievements.1qi_croquetas.description',
    icon: '/assets/achievements/clicks/7.webp',
  },
  {
    id: '1sx_croquetas',
    title: 'achievements.1sx_croquetas.title',
    description: 'achievements.1sx_croquetas.description',
    icon: '/assets/achievements/clicks/8.webp',
  },
  {
    id: '1sp_croquetas',
    title: 'achievements.1sp_croquetas.title',
    description: 'achievements.1sp_croquetas.description',
    icon: '/assets/achievements/clicks/9.webp',
  },
  {
    id: '1oc_croquetas',
    title: 'achievements.1oc_croquetas.title',
    description: 'achievements.1oc_croquetas.description',
    icon: '/assets/achievements/clicks/10.webp',
  },
  {
    id: '1nn_croquetas',
    title: 'achievements.1nn_croquetas.title',
    description: 'achievements.1nn_croquetas.description',
    icon: '/assets/achievements/clicks/11.webp',
  },
  {
    id: '1dc_croquetas',
    title: 'achievements.1dc_croquetas.title',
    description: 'achievements.1dc_croquetas.description',
    icon: '/assets/achievements/clicks/12.webp',
  },

  // ------------------------------------------------------------
  // 🎯 SUBIDA DE NIVEL (Implementado)
  // ------------------------------------------------------------
  {
    id: 'nivel_5',
    title: 'achievements.nivel_5.title',
    description: 'achievements.nivel_5.description',
    icon: '/assets/achievements/level/1.webp',
  },
  {
    id: 'nivel_10',
    title: 'achievements.nivel_10.title',
    description: 'achievements.nivel_10.description',
    icon: '/assets/achievements/level/2.webp',
  },
  {
    id: 'nivel_15',
    title: 'achievements.nivel_15.title',
    description: 'achievements.nivel_15.description',
    icon: '/assets/achievements/level/3.webp',
  },
  {
    id: 'nivel_20',
    title: 'achievements.nivel_20.title',
    description: 'achievements.nivel_20.description',
    icon: '/assets/achievements/level/4.webp',
  },
  {
    id: 'nivel_25',
    title: 'achievements.nivel_25.title',
    description: 'achievements.nivel_25.description',
    icon: '/assets/achievements/level/5.webp',
  },
  {
    id: 'nivel_30',
    title: 'achievements.nivel_30.title',
    description: 'achievements.nivel_30.description',
    icon: '/assets/achievements/level/6.webp',
  },
  {
    id: 'nivel_50',
    title: 'achievements.nivel_50.title',
    description: 'achievements.nivel_50.description',
    icon: '/assets/achievements/level/7.webp',
  },
  {
    id: 'nivel_60',
    title: 'achievements.nivel_60.title',
    description: 'achievements.nivel_60.description',
    icon: '/assets/achievements/level/8.webp',
  },
  {
    id: 'nivel_80',
    title: 'achievements.nivel_80.title',
    description: 'achievements.nivel_80.description',
    icon: '/assets/achievements/level/9.webp',
  },
  {
    id: 'nivel_100',
    title: 'achievements.nivel_100.title',
    description: 'achievements.nivel_100.description',
    icon: '/assets/achievements/level/10.webp',
  },
  {
    id: 'nivel_1000',
    title: 'achievements.nivel_1000.title',
    description: 'achievements.nivel_1000.description',
    icon: '/assets/achievements/level/11.webp',
  },
  {
    id: 'nivel_10000',
    title: 'achievements.nivel_10000.title',
    description: 'achievements.nivel_10000.description',
    icon: '/assets/achievements/level/12.webp',
  },

  // ------------------------------------------------------------
  // ⭐ EVENTOS (Implementado)
  // ------------------------------------------------------------
  {
    id: 'bonus_event',
    title: 'achievements.bonus_event.title',
    description: 'achievements.bonus_event.description',
    icon: '/assets/achievements/event/golden.webp',
    secret: true,
  },
  {
    id: 'penalty_event',
    title: 'achievements.penalty_event.title',
    description: 'achievements.penalty_event.description',
    icon: '/assets/achievements/event/golden.webp',
    secret: true,
  },

  // ------------------------------------------------------------
  // 🏭 PRODUCTORES
  // ------------------------------------------------------------
  /*{ id: 'primer_productor', title: 'Primer productor', description: 'Compra tu primer productor.', icon: '/assets/producers/click.webp' },
  { id: '10_productores', title: 'Fábrica pequeña', description: 'Compra 10 productores.', icon: '/assets/producers/click.webp' },
  { id: '100_productores', title: 'Fábrica grande', description: 'Compra 100 productores.', icon: '/assets/producers/click.webp' },*/

  // ------------------------------------------------------------
  // 🧥 SKINS Y PERSONALIZACIÓN (Implementado)
  // ------------------------------------------------------------
  {
    id: 'primer_skin',
    title: 'achievements.primer_skin.title',
    description: 'achievements.primer_skin.description',
    icon: '/assets/achievements/skins/first.webp',
  },
  {
    id: 'todas_skins',
    title: 'achievements.todas_skins.title',
    description: 'achievements.todas_skins.description',
    icon: '/assets/achievements/skins/all.webp',
  },

  // ------------------------------------------------------------
  // ⚙️ MEJORAS Y ACTUALIZACIONES
  // ------------------------------------------------------------
  /*{ id: 'primer_upgrade', title: 'Mejora desbloqueada', description: 'Compra tu primera mejora.', icon: '/assets/producers/click.webp' },
  { id: 'todas_mejoras', title: 'Mejorado al máximo', description: 'Compra todas las mejoras.', icon: '/assets/producers/click.webp' },*/

  // ------------------------------------------------------------
  // 🕹️ INTERACCIÓN Y GAMEPLAY (Implementado)
  // ------------------------------------------------------------
  {
    id: 'click_rapido',
    title: 'achievements.click_rapido.title',
    description: 'achievements.click_rapido.description',
    icon: '/assets/achievements/gameplay/fast1.webp',
    secret: true,
  },
  {
    id: 'speedrun',
    title: 'achievements.speedrun.title',
    description: 'achievements.speedrun.description',
    icon: '/assets/achievements/gameplay/fast2.webp',
    secret: true,
  },
  {
    id: 'autoclicker',
    title: 'achievements.autoclicker.title',
    description: 'achievements.autoclicker.description',
    icon: '/assets/achievements/gameplay/autoclicker.webp',
    secret: true,
  },
  {
    id: 'no_clicks_1h',
    title: 'achievements.no_clicks_1h.title',
    description: 'achievements.no_clicks_1h.description',
    icon: '/assets/achievements/gameplay/noclick-1h.webp',
    secret: true,
  },

  // ------------------------------------------------------------
  // 📰 NOTICIAS Y CONTENIDO
  // ------------------------------------------------------------
  /*{ id: 'primer_noticia', title: '¡Noticias!', description: 'Lee tu primera noticia.', icon: '/assets/producers/click.webp' },
  { id: 'todas_noticias', title: 'Periodista', description: 'Lee todas las noticias.', icon: '/assets/producers/click.webp' },*/

  // ------------------------------------------------------------
  // 📈 SISTEMA DE LOGROS (Implementado)
  // ------------------------------------------------------------
  {
    id: 'primer_achievement',
    title: 'achievements.primer_achievement.title',
    description: 'achievements.primer_achievement.description',
    icon: '/assets/achievements/achievements/first.webp',
  },
  {
    id: 'todos_achievements',
    title: 'achievements.todos_achievements.title',
    description: 'achievements.todos_achievements.description',
    icon: '/assets/achievements/achievements/all.webp',
  },

  // ------------------------------------------------------------
  // ⏱️ TIEMPO DE JUEGO
  // ------------------------------------------------------------
  /*{ id: 'achievement_maraton', title: 'Maratón', description: 'Juega durante 2 horas seguidas.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_paciencia', title: 'Paciencia', description: 'Juega 7 días seguidos.', icon: '/assets/producers/click.webp' },*/

  // ------------------------------------------------------------
  // 🕓 HORARIOS Y CONDICIONES ESPECIALES
  // ------------------------------------------------------------
  /*{ id: 'achievement_noche', title: 'Nocturno', description: 'Juega después de medianoche.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_speedrun', title: 'Speedrun', description: 'Llega a 10,000 croquetas en menos de 5 minutos.', icon: '/assets/producers/click.webp', secret: true },*/

  // ------------------------------------------------------------
  // 🎵 AUDIO Y OST (Implementado)
  // ------------------------------------------------------------
  {
    id: 'achievement_ost',
    title: 'achievements.achievement_ost.title',
    description: 'achievements.achievement_ost.description',
    icon: '/assets/achievements/ost/all_ost.webp',
  },

  // ------------------------------------------------------------
  // 🔧 DESARROLLO Y SECRETOS DEL JUEGO
  // ------------------------------------------------------------
  /*{ id: 'achievement_dev', title: 'Dev Mode', description: 'Activa el modo desarrollador.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_bug', title: '¿Bug?', description: 'Encuentra un bug (o algo raro).', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_misterioso', title: 'Misterio', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_memero', title: 'Memero', description: 'Descubre el meme oculto.', icon: '/assets/producers/click.webp', secret: true },*/

  // ------------------------------------------------------------
  // 🥇 LOGROS SECRETOS Y RAROS
  // ------------------------------------------------------------
  /*{ id: 'primer_achievement_secreto', title: '¿Qué es esto?', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_croqueta_dorada', title: 'Croqueta dorada', description: 'Consigue una croqueta dorada.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_croqueta_legendaria', title: 'Croqueta legendaria', description: 'Consigue una croqueta legendaria.', icon: '/assets/producers/click.webp', secret: true },*/

  // ------------------------------------------------------------
  // 🤪 LOGROS DE BROMA (Implementado)
  // ------------------------------------------------------------
  {
    id: 'six_seven',
    title: 'achievements.six_seven.title',
    description: 'achievements.six_seven.description',
    icon: '/assets/achievements/xd/sixseven.webp',
    secret: true,
  },
  {
    id: 'fanboy',
    title: 'achievements.fanboy.title',
    description: 'achievements.fanboy.description',
    icon: '/assets/achievements/xd/fanboy.webp',
    secret: true,
  },
  {
    id: 'certified_obsession',
    title: 'achievements.certified_obsession.title',
    description: 'achievements.certified_obsession.description',
    icon: '/assets/achievements/xd/certified_obsession.webp',
    secret: true,
  },
];
