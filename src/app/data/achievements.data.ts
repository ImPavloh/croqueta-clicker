export interface Achievement {
  id: string;
  title: string;
  description: string; // si es secreto, omitimos la descripción
  icon: string;
  secret?: boolean;     // true = oculto (no mostrar la descripción en la lista)
}

export const ACHIEVEMENTS: Achievement[] = [
  // ------------------------------------------------------------
  // CLICKS (Implementado)
  // ------------------------------------------------------------
  { id: 'primera_croqueta', title: 'Primera croqueta', description: 'Cocina tu primera croqueta.', icon: '/assets/achievements/clicks/1.webp' },
  { id: '1k_croquetas', title: 'Mil croquetas', description: 'Cocina 1k de croquetas.', icon: '/assets/achievements/clicks/2.webp' },
  { id: '1m_croquetas', title: 'Un millón', description: 'Cocina 1M croquetas.', icon: '/assets/achievements/clicks/3.webp' },
  { id: '1b_croquetas', title: 'Un billón', description: 'Cocina 1B de croquetas...', icon: '/assets/achievements/clicks/4.webp' },
  { id: '1t_croquetas', title: 'Un trillón', description: '¿Un 1T de croquetas...?', icon: '/assets/achievements/clicks/5.webp' },
  { id: '1qa_croquetas', title: 'Un quadrillón', description: '¿Y si sales a la calle un rato?', icon: '/assets/achievements/clicks/6.webp' },
  { id: '1qi_croquetas', title: 'Un quatrillón', description: 'Creo que ya es suficiente...', icon: '/assets/achievements/clicks/7.webp' },
  { id: '1sx_croquetas', title: 'Un sextillón', description: 'Me estoy empezando a preocupar.', icon: '/assets/achievements/clicks/8.webp' },
  { id: '1sp_croquetas', title: 'Un septillón', description: '¿Has pensado en buscar trabajo?', icon: '/assets/achievements/clicks/9.webp' },
  { id: '1oc_croquetas', title: 'Un octillón', description: 'Nuevo objetivo: Tocar hierba.', icon: '/assets/achievements/clicks/10.webp' },
  { id: '1nn_croquetas', title: 'Un nonillón', description: 'No sabia que existia ese numero.', icon: '/assets/achievements/clicks/11.webp' },
  { id: '1dc_croquetas', title: 'Un decillón', description: 'Para, porfavor.', icon: '/assets/achievements/clicks/12.webp' },

  // ------------------------------------------------------------
  // 🎯 SUBIDA DE NIVEL - NUEVOS LOGROS
  // ------------------------------------------------------------
  { id: 'nivel_5', title: 'Aprendiz croquetero', description: 'Alcanza el nivel 5.', icon: '/assets/achievements/level/5.webp' },
  { id: 'nivel_10', title: 'Cocinero novato', description: 'Alcanza el nivel 10.', icon: '/assets/achievements/level/10.webp' },
  { id: 'nivel_15', title: 'Chef croquetero', description: 'Alcanza el nivel 15.', icon: '/assets/achievements/level/15.webp' },
  { id: 'nivel_20', title: 'Maestro fritador', description: 'Alcanza el nivel 20.', icon: '/assets/achievements/level/20.webp' },
  { id: 'nivel_25', title: 'Experto en empanado', description: 'Alcanza el nivel 25.', icon: '/assets/achievements/level/25.webp' },
  { id: 'nivel_30', title: 'Leyenda croquetera', description: 'Alcanza el nivel 30.', icon: '/assets/achievements/level/30.webp' },
  { id: 'nivel_50', title: 'Gran Maestro', description: 'Alcanza el nivel 50.', icon: '/assets/achievements/level/35.webp' },
  { id: 'nivel_60', title: 'Croqueta Suprema', description: 'Alcanza el nivel 60.', icon: '/assets/achievements/level/40.webp' },
  { id: 'nivel_80', title: 'Dios de la Fritura', description: 'Alcanza el nivel 80.', icon: '/assets/achievements/level/45.webp' },
  { id: 'nivel_100', title: 'Emperador Croquetero', description: 'Alcanza el nivel 100.', icon: '/assets/achievements/level/50.webp' },

  // ------------------------------------------------------------
  // 🏭 PRODUCTORES
  // ------------------------------------------------------------
  { id: 'primer_productor', title: 'Primer productor', description: 'Compra tu primer productor.', icon: '/assets/producers/click.webp' },
  { id: '10_productores', title: 'Fábrica pequeña', description: 'Compra 10 productores.', icon: '/assets/producers/click.webp' },
  { id: '100_productores', title: 'Fábrica grande', description: 'Compra 100 productores.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // 🧥 SKINS Y PERSONALIZACIÓN (Implementado)
  // ------------------------------------------------------------
  { id: 'primer_skin', title: 'Cambio de look', description: 'Cambia de skin por primera vez.', icon: '/assets/producers/click.webp' },
  { id: 'todas_skins', title: 'Fashionista', description: 'Prueba todas las skins.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // ⚙️ MEJORAS Y ACTUALIZACIONES
  // ------------------------------------------------------------
  { id: 'primer_upgrade', title: 'Mejora desbloqueada', description: 'Compra tu primera mejora.', icon: '/assets/producers/click.webp' },
  { id: 'todas_mejoras', title: 'Mejorado al máximo', description: 'Compra todas las mejoras.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // 🕹️ INTERACCIÓN Y GAMEPLAY (Implementado)
  // ------------------------------------------------------------
  { id: 'click_rapido', title: 'Dedos veloces', description: 'Haz 70 clicks en 10 segundos.', icon: '/assets/achievements/gameplay/fast1.webp', secret: true },
  { id: 'speedrun', title: 'Speedrun', description: 'Haz 100 clicks en 10 segundos.', icon: '/assets/achievements/gameplay/fast2.webp', secret: true },
  { id: 'autoclicker', title: 'Autoclicker', description: '¿250 clicks en 10 segundos? Lo dudo...', icon: '/assets/achievements/gameplay/autoclicker.webp', secret: true },
  { id: 'no_clicks_1h', title: 'Zen', description: 'No hagas clicks durante 1 hora.', icon: '/assets/achievements/gameplay/noclick-1h.webp', secret: true },

  // ------------------------------------------------------------
  // 📰 NOTICIAS Y CONTENIDO
  // ------------------------------------------------------------
  { id: 'primer_noticia', title: '¡Noticias!', description: 'Lee tu primera noticia.', icon: '/assets/producers/click.webp' },
  { id: 'todas_noticias', title: 'Periodista', description: 'Lee todas las noticias.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // 📈 SISTEMA DE LOGROS (Implementado)
  // ------------------------------------------------------------
  { id: 'primer_achievement', title: 'Logro desbloqueado', description: 'Desbloquea tu primer logro.', icon: '/assets/producers/click.webp' },
  { id: 'todos_achievements', title: 'Maestro de logros', description: 'Desbloquea todos los logros.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // ⏱️ TIEMPO DE JUEGO
  // ------------------------------------------------------------
  { id: 'achievement_maraton', title: 'Maratón', description: 'Juega durante 2 horas seguidas.', icon: '/assets/producers/click.webp' },
  { id: 'achievement_paciencia', title: 'Paciencia', description: 'Juega 7 días seguidos.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // 🕓 HORARIOS Y CONDICIONES ESPECIALES
  // ------------------------------------------------------------
  { id: 'achievement_noche', title: 'Nocturno', description: 'Juega después de medianoche.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_speedrun', title: 'Speedrun', description: 'Llega a 10,000 croquetas en menos de 5 minutos.', icon: '/assets/producers/click.webp', secret: true },

  // ------------------------------------------------------------
  // 🎵 AUDIO Y OST (Implementado)
  // ------------------------------------------------------------
  { id: 'achievement_ost', title: 'Melómano', description: 'Escucha toda la OST.', icon: '/assets/producers/click.webp' },

  // ------------------------------------------------------------
  // 🔧 DESARROLLO Y SECRETOS DEL JUEGO
  // ------------------------------------------------------------
  { id: 'achievement_dev', title: 'Dev Mode', description: 'Activa el modo desarrollador.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_bug', title: '¿Bug?', description: 'Encuentra un bug (o algo raro).', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_misterioso', title: 'Misterio', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_memero', title: 'Memero', description: 'Descubre el meme oculto.', icon: '/assets/producers/click.webp', secret: true },

  // ------------------------------------------------------------
  // 🥇 LOGROS SECRETOS Y RAROS
  // ------------------------------------------------------------
  { id: 'primer_achievement_secreto', title: '¿Qué es esto?', description: '', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_croqueta_dorada', title: 'Croqueta dorada', description: 'Consigue una croqueta dorada.', icon: '/assets/producers/click.webp', secret: true },
  { id: 'achievement_croqueta_legendaria', title: 'Croqueta legendaria', description: 'Consigue una croqueta legendaria.', icon: '/assets/producers/click.webp', secret: true },

  // ------------------------------------------------------------
  // 🤪 LOGROS DE BROMA / TESTEO (implementado)
  // ------------------------------------------------------------
  { id: 'six_seven', title: 'Six Seven', description: 'jeje sixseven', icon: '/assets/producers/click.webp', secret: true },
];
