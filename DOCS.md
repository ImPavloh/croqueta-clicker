# Documentación del proyecto: Croqueta Clicker

## 1. Introducción

**Croqueta Clicker** es un juego incremental (o _clicker game_) desarrollado con Angular. El objetivo es simple: generar la mayor cantidad de croquetas posible. El jugador comienza haciendo clic manualmente en una croqueta gigante y, a medida que acumula puntos (croquetas), puede comprar productores que las generan automáticamente y mejoras que aumentan la eficiencia de sus clics.

El proyecto está diseñado con una arquitectura basada en servicios, desacoplando la lógica de negocio del estado de la interfaz de usuario. Utiliza características modernas de Angular como los **Signals** para una gestión de estado reactiva y eficiente.

## 2. Conceptos fundamentales del juego

- **Puntos (Croquetas)**: Es la moneda principal del juego. Se obtienen mediante clics manuales o a través de productores automáticos.
- **Experiencia (EXP) y nivel**: El jugador gana EXP al realizar acciones (clics, compras). Al acumular suficiente EXP, sube de nivel, lo que desbloquea nuevas mejoras, productores y contenido.
- **Productores**: Son "edificios" o entidades que el jugador puede comprar para generar croquetas automáticamente (puntos por segundo). Su coste aumenta exponencialmente con cada compra.
- **Mejoras (Upgrades)**: Aumentan la cantidad de croquetas obtenidas por cada clic manual. Suelen tener un requisito de nivel para ser desbloqueadas.
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
  - **Estado que maneja**: `points` (croquetas totales), `pointsPerClick` (croquetas por clic) y `pointsPerSecond` (croquetas por segundo).
  - **Funcionalidad clave**:
    - `addPointsPerClick()`: Añade puntos por un clic manual, aplicando multiplicadores.
    - `addPointPerSecond()`: Se ejecuta a intervalos regulares para añadir los puntos generados automáticamente.
    - `upgrade...()`: Métodos para actualizar los puntos por clic/segundo al comprar mejoras o productores.
    - Utiliza `break_infinity.js` para manejar números muy grandes.

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

### 3.3. Datos del juego (`src/app/data/`)

Esta carpeta contiene los "blueprints" de todos los elementos del juego, lo que facilita el balance y la adición de nuevo contenido sin tocar la lógica de los servicios.

- `producer.data.ts`: Define cada productor, su coste base, su producción, etc.
- `upgrade.data.ts`: Define cada mejora de clic, su coste, el bono que otorga y el nivel requerido.
- `skin.data.ts`: Define las skins, su rareza y sus requisitos de desbloqueo.
- `achievements.data.ts`: Define todos los logros disponibles.
- `news.data.ts`: Contiene los mensajes de noticias.
- `tutorial.data.ts`: Define los mensajes del tutorial y sus condiciones de aparición.

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
