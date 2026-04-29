# Documentación del proyecto: Croqueta Clicker

## 1. Introducción

**Croqueta Clicker** es un juego incremental (o _clicker game_) desarrollado con **Angular 21**. El objetivo es simple: generar la mayor cantidad de croquetas posible. El jugador comienza haciendo clic manualmente en una croqueta gigante y, a medida que acumula puntos (croquetas), puede comprar productores que las generan automáticamente y mejoras que aumentan la eficiencia de sus clics.

El proyecto está diseñado con una **arquitectura modular basada en componentes standalone** de Angular 21, desacoplando la lógica de negocio del estado de la interfaz de usuario. Utiliza características modernas de Angular como:

- **Signals**: Gestión de estado reactiva y eficiente con `signal()`, `computed()`, `input()`, `output()`
- **Zoneless Change Detection**: Mejor rendimiento eliminando Angular Zone.js
- **ChangeDetectionStrategy.OnPush**: En todos los componentes para optimizar renders
- **Control flow nativo**: Directivas `@if`, `@for`, `@switch` en templates en lugar de `*ngIf`, `*ngFor`
- **Host bindings modernos**: Uso de `host` property en lugar de `@HostListener`/@HostBinding`

## 2. Conceptos fundamentales del juego

- **Puntos (Croquetas)**: Es la moneda principal del juego. Se obtienen mediante clics manuales o a través de productores automáticos.
- **Experiencia (EXP) y nivel**: El jugador gana EXP al realizar acciones (clics, compras). Al acumular suficiente EXP, sube de nivel, lo que desbloquea nuevas mejoras, productores y contenido.
- **Productores**: Son "edificios" o entidades que el jugador puede comprar para generar croquetas automáticamente (puntos por segundo). Su coste aumenta exponencialmente con cada compra.
- **Mejoras (Upgrades)**: Aumentan la cantidad de croquetas obtenidas por cada clic manual. Suelen tener un requisito de nivel para ser desbloqueadas.
- **Prestigio**: Al alcanzar el nivel mínimo, el jugador puede reiniciar el progreso económico para obtener **croquetas doradas**, que aumentan de forma permanente el multiplicador global y aceleran futuras partidas.
- **Skins**: Elementos cosméticos que cambian la apariencia de la croqueta principal. Se desbloquean al cumplir ciertos requisitos (nivel, total de croquetas, logros, etc.).
- **Logros (Achievements)**: Metas que el jugador puede cumplir para marcar su progreso. Desbloquear logros es persistente.
- **Eventos especiales**: Como la "Croqueta Dorada", que aparece aleatoriamente y otorga un bonus temporal si se le hace clic.

## 3. Estructura del proyecto

El núcleo de la lógica del juego reside en la carpeta `src/app/services/`, mientras que los datos estáticos (configuraciones de productores, mejoras, etc.) se encuentran en `src/app/data/`.

### 3.1. Flujo de datos y persistencia

El estado del juego se guarda en el `localStorage` del navegador.

1.  **`OptionsService` como intermediario**: Este servicio es el único punto de contacto directo con `localStorage`. Centraliza la lectura (`getGameItem`) y escritura (`setGameItem`), añadiendo un prefijo (`croqueta-clicker_`) a todas las claves para evitar colisiones.
2.  **Servicios de estado**: Servicios como `PointsService`, `PlayerStats`, `SkinsService`, etc., cargan su estado inicial desde `OptionsService` en su constructor.
3.  **Guardado de datos**:
    - **Manual**: Ciertas acciones críticas, como un clic manual o una compra, disparan un guardado inmediato a través de `saveToStorage()` en el servicio correspondiente.
    - **Automático**: `AutosaveService` se encarga de guardar periódicamente (cada 60 segundos) el estado de los servicios más importantes (`PointsService`, `PlayerStats`) para prevenir la pérdida de progreso. También guarda el estado justo antes de que la pestaña del navegador se cierre (`beforeunload`).

### 3.2. Descripción de los servicios (`src/app/services/`)

A continuación se detalla la responsabilidad de cada servicio principal:

- **`PointsService`**:
  - **Responsabilidad**: Gestiona la lógica económica central del juego.
  - **Estado que maneja**: signals para `points` (croquetas totales), `pointsPerClick` (croquetas por clic) y `pointsPerSecond` (croquetas por segundo).
  - **Funcionalidad clave**:
    - `addPointsPerClick()`: Añade puntos por un clic manual, aplicando multiplicadores.
    - `addPointPerSecond()`: Se ejecuta a intervalos regulares para añadir los puntos generados automáticamente.
    - `upgrade...()`: Métodos para actualizar los puntos por clic/segundo al comprar mejoras o productores.
    - Utiliza `break_infinity.js` para manejar números muy grandes.
    - Implementa `ChangeDetectionStrategy.OnPush` para renders optimizados
    - Usa `effect()` para reaccionar a cambios de estado
    - Manejo de inyección con `inject()` en lugar de constructor

- **`PlayerStats`**:
  - **Responsabilidad**: Gestiona el progreso y las estadísticas del jugador.
  - **Estado que maneja**: `level`, `currentExp`, `expToNext`, `totalClicks`, `timePlaying`.
  - **Funcionalidad clave**:
    - `addClick()` y `addExp()`: Incrementan la experiencia.
    - `checkLevelUp()`: Verifica si el jugador ha subido de nivel y, si es así, actualiza el nivel y la EXP necesaria para el siguiente, notificando a `LevelUpService`.

- **`OptionsService`**:
  - **Responsabilidad**: Actúa como un gestor de configuración y el principal intermediario con `localStorage`.
  - **Funcionalidad clave**:
    - Gestiona opciones del juego (volumen, partículas, etc.).
    - Proporciona métodos `getGameItem`, `setGameItem` y `removeGameItem` con prefijo para que otros servicios persistan su estado.
    - Implementa la lógica para exportar/importar la partida y reiniciar el juego.

- **`AchievementsService`**:
  - **Responsabilidad**: Gestiona el desbloqueo y la persistencia de los logros.
  - **Funcionalidad clave**:
    - `unlockAchievement(id)`: Desbloquea un logro, lo guarda en `localStorage` y lo añade a una cola (`queue$`) para ser mostrado en la UI.
    - Maneja logros especiales como "desbloquea tu primer logro" y "desbloquea todos los logros".

- **`PrestigeService`**:
  - **Responsabilidad**: Gestiona la capa de progresión meta del juego.
  - **Estado que maneja**: `prestigeLevel`, `goldenCroquetas` y `prestigeMultiplier`.
  - **Funcionalidad clave**:
    - `canPrestige()`: Comprueba si el jugador puede prestigiar, con nivel mínimo actual de `50`.
    - `getPrestigePreview()`: Calcula cuántas croquetas doradas ganará el jugador y el multiplicador resultante antes de confirmar la acción.
    - `performPrestige()`: Aumenta el nivel de prestigio, suma croquetas doradas, recalcula el multiplicador global y reinicia el progreso económico normal.
    - Resetea productores, mejoras, puntos y estadísticas base, pero conserva el progreso de meta-progresión y desbloquea logros específicos de prestigio.
    - Aplica un multiplicador permanente basado en croquetas doradas y un factor de reducción de XP por nivel de prestigio.

- **`SkinsService`**:
  - **Responsabilidad**: Gestiona las apariencias (skins) de la croqueta.
  - **Funcionalidad clave**:
    - `isSkinUnlocked(skin)`: Comprueba si una skin está desbloqueada basándose en requisitos (nivel, puntos, logros) que obtiene de otros servicios (`PlayerStats`, `PointsService`, `AchievementsService`).
    - Mantiene un `Set` de las skins usadas para desbloquear logros relacionados.

- **`AudioService`**:
  - **Responsabilidad**: Controla toda la reproducción de audio.
  - **Funcionalidad clave**:
    - Usa la **Web Audio API** para un control avanzado del sonido.
    - `playSfx()`: Reproduce efectos de sonido, cacheando los buffers para mayor eficiencia.
    - `playMusic()`: Gestiona la música de fondo, permitiendo _crossfading_ suave entre pistas.
    - Se suscribe a los `Observables` de volumen de `OptionsService` para ajustar las ganancias en tiempo real.

- **`AutosaveService`**:
  - **Responsabilidad**: Orquesta el guardado automático del progreso del juego.
  - **Funcionalidad clave**:
    - Inicia un `setInterval` que llama a `saveAll()` cada 60 segundos.
    - `saveAll()` fuerza a los servicios principales a guardar su estado actual.
    - Se engancha al evento `beforeunload` del navegador para un último guardado antes de cerrar la página.

- **Servicios de UI y efectos**:
  - `FloatingService`: Muestra texto flotante (ej. `+100`).
  - `ParticlesService`: Crea y gestiona efectos de partículas.
  - `ModalService`: Controla qué modal (Stats, Skins, etc.) está visible.
  - `LevelUpService` y `NewsService`: Gestionan colas de notificaciones para la UI.

- **`ReportService`**:
  - **Responsabilidad**: Genera los datos para el panel de informes y estadísticas.
  - **Funcionalidad clave**:
    - `getGameSummary()`: Resumen del jugador (nivel, croquetas, CPS, tiempo jugado).
    - `getProducersData()`, `getUpgradesData()`, `getAchievementsData()`, `getSkinsTableData()`: Datos para tablas.
    - `getProducerDistribution()`, `getProducerROIData()`, `getSkinUnlockByRarityDonut()`, `getAchievementStatusDistribution()`, `getSkinRarityDistribution()`: Datos para gráficos de barras y donuts.
    - `getUpgradeClickCurveData()` y `getUpgradeCumulativeCurveData()`: Datos para las nuevas curvas de línea y área del informe.
    - `getEfficiencyData()`: Campos calculados (clicks/min, croquetas/min, ROI, eficiencia de upgrades, completitud y coste acumulado).
    - `getUpgradeLevelDistribution()`: Histograma por tramos de nivel adaptado al nuevo endgame (hasta `801+`).
    - `getDebugInfo()`: Información técnica (localStorage, idioma, versiones).

- **`ReportPdfService`**:
  - **Responsabilidad**: Exporta el informe a PDF.
  - **Funcionalidad clave**:
    - `exportReport(payload)`: Genera un PDF con jsPDF + AutoTable incluyendo tablas, gráficos y estadísticas.
    - Dibuja directamente en el PDF tablas, barras y curvas del dashboard, evitando depender del DOM para la exportación principal.
    - Representa las curvas de mejoras con escala logarítmica para que datos muy exponenciales sigan siendo legibles.
    - Incluye también el bloque de cobertura del informe y mantiene pie y paginación por página.

- **Internacionalización (i18n) con Transloco**:
  - `SmartMissingHandler` en `app.config.ts`: Silencia warnings de traducción durante los primeros 3 segundos (antes de que el JSON cargue), pero loguea claves genuinamente faltantes después.
  - El componente `Report` usa `selectTranslation()` en lugar de `langChanges$` para asegurar que `refreshData()` solo se ejecuta cuando las traducciones están disponibles.

### 3.3. Datos del juego (`src/app/data/`)

Esta carpeta contiene los "blueprints" de todos los elementos del juego, lo que facilita el balance y la adición de nuevo contenido sin tocar la lógica de los servicios.

- `producer.data.ts`: Define 50 productores, manteniendo intacto el early/mid game y ampliando el late/endgame con nuevos tiers.
- `upgrade.data.ts`: Define 50 mejoras de clic con una curva de precio revisada para mantener competitiva la ruta activa sin bloquear el progreso.
- `skin.data.ts`: Define el catálogo original de 33 skins, con rarezas y requisitos de desbloqueo ligados a nivel, croquetas, EXP y logros.
- `achievements.data.ts`: Define todos los logros disponibles.
- `news.data.ts`: Contiene los mensajes de noticias.
- `tutorial.data.ts`: Define los mensajes del tutorial y sus condiciones de aparición.

### 3.4. Sistema de prestigio

El prestigio actúa como el bucle de meta-progresión principal del juego y está accesible desde la página de opciones.

- **Requisitos y recompensa**:
  - El prestigio se desbloquea a partir del nivel `50`.
  - La recompensa son `croquetas doradas`, calculadas a partir del nivel actual y del número de prestigios previos.
  - Cada croqueta dorada aumenta el multiplicador global del jugador en `+0.05`.

- **Qué reinicia**:
  - Puntos actuales, progreso económico, productores comprados, mejoras adquiridas, estadísticas base del jugador y controles de compra.

- **Qué se conserva**:
  - Nivel de prestigio, croquetas doradas acumuladas, multiplicador permanente, logros ya desbloqueados y el resto de meta-progresión persistente.

- **Efectos secundarios de diseño**:
  - El prestigio acelera futuras partidas con un multiplicador global acumulativo.
  - También reduce la XP requerida por nivel en un `2%` por prestigio, con un tope del `30%`.

### 3.5. Panel de informes y exportación PDF

El panel de informes (`src/app/pages/report/`) funciona como una página analítica completa dentro del juego y está disponible tanto en escritorio como en móvil.

- **Vista del dashboard**:
  - Usa tarjetas reutilizables, tablas con filtros, badges de estado y gráficos SVG standalone.
  - Incluye gráficos de barras, donuts y componentes de tendencia (`trend-chart`) para representar progresiones y acumulados.
  - La pestaña debug añade un bloque de cobertura del informe para resumir tablas, gráficos, filtros, campos calculados y la escala actual del catálogo.
  - En móvil se renderiza dentro de un panel de ruta específico del layout principal, en lugar de quedar oculto por la interfaz del clicker.

- **Exportación PDF**:
  - Reutiliza el mismo conjunto de datos calculados por `ReportService`, pero no depende de capturas de pantalla del dashboard.
  - Genera tablas con `jspdf-autotable` y dibuja gráficos simplificados nativos en el canvas del PDF.
  - Añade paginación, pie de página y el bloque de cobertura del informe para que el PDF sirva también como documento de defensa.
  - Esto hace que la exportación sea más estable, más ligera y más predecible que una captura rasterizada del informe.

### 3.6. Ayuda contextual y accesibilidad

El proyecto añade una capa de ayuda global que no depende únicamente de tooltips aislados:

- **Centro de ayuda**:
  - Se renderiza como modal contextual (`src/app/pages/help-center/`) y se integra dentro del sistema general de modales.
  - Resume atajos de teclado, consejos de uso y accesos rápidos a secciones relevantes del juego.
  - Su entrada visible se encuentra dentro de la pantalla de `Options`, porque conceptualmente funciona como ayuda de interfaz y no como página completa.

- **Atajos globales**:
  - `F1` y `?` abren el centro de ayuda.
  - `F2` abre la superficie de opciones.
  - `Escape` cierra el modal activo.
  - `Ctrl + Shift + F12` mantiene el acceso al panel debug.

- **Objetivo de UX/accesibilidad**:
  - Ofrecer una referencia rápida para usuarios que no descubren toda la interfaz sólo con hover.
  - Mejorar la navegación por teclado y la comprensión global del juego.
  - Reforzar la defensa académica del proyecto al hacer visible una mejora específica de accesibilidad.

## 4. Flujo de interacción típico (Ejemplo: Comprar una mejora)

1.  **Usuario**: Hace clic en el botón de compra de una mejora en la UI.
2.  **Componente (`Upgrade.ts`)**: Llama al método `buyUpgrade()`.
3.  **Lógica de compra**:
    - El componente verifica si el jugador tiene suficientes puntos llamando a `pointsService.points().gte(price)`.
    - Si es así, llama a `pointsService.substractPoints(price)` para restar el coste.
    - Llama a `pointsService.upgradePointPerClick()` para actualizar el valor de los clics.
    - Llama a `playerStats.addExp()` para otorgar la experiencia de la compra.
    - Llama a `audioService.playSfx()` para reproducir un sonido de confirmación.
    - Actualiza su estado interno a `bought = true` y lo guarda usando `optionsService.setGameItem()`.
4.  **Reacción en cadena**:
    - El cambio en `pointsPerClick` en `PointsService` puede hacer que `PlayerStats` actualice el `expPerClick`.
    - El aumento de `EXP` en `PlayerStats` puede desencadenar una subida de nivel (`checkLevelUp()`).
    - Una subida de nivel notifica a `LevelUpService` y puede desbloquear nuevas skins (`SkinsService`) o logros (`AchievementsService`).
    - Todos los cambios de estado persistentes son guardados en `localStorage` por el servicio correspondiente.
