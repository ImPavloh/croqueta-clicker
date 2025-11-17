# Croqueta Clicker

**Croqueta Clicker** es un juego incremental inspirado en Cookie Clicker, desarrollado con Angular 20 y TypeScript.

¡Haz click en croquetas, desbloquea mejoras, compra productores automáticos y personaliza tu experiencia con skins exclusivas!

Visita **[croquetaclicker.pavloh.com](https://croquetaclicker.pavloh.com)** para jugarlo ya :)

---

## Características principales

### Sistema de juego completo

- **Sistema de clicks**: Gana croquetas haciendo click (con efectos visuales y partículas)
- **Productores automáticos**: 8 tipos de productores que generan croquetas por segundo
- **Mejoras (Upgrades)**: 20+ mejoras para aumentar tus clicks y producción
- **Sistema de niveles**: Gana experiencia y sube de nivel desbloqueando contenido
- **Logros (Achievements)**: 30+ logros por desbloquear con diferentes categorías
- **Croqueta dorada**: Evento especial aleatorio con bonificación x2
- **Skins personalizables**: 10+ skins desbloqueables para personalizar tu croqueta

### Características técnicas

- **Guardado automático**: Progreso guardado en localStorage
- **PWA**: Instalación como aplicación web progresiva
- **Arquitectura modular**: componentes UI reutilizables + páginas
- **Optimización de rutas**: RouteReuseStrategy personalizado
- **Gestión de números grandes**: Integración con break_infinity.js para números enormes
- **Interfaz responsiva**: Diseño adaptado para moviles y ordenadores
- **Audio dinámico**: Música y efectos de sonido
- **Efectos visuales**: Partículas, animaciones y efectos

---

## Arquitectura del proyecto

### Patrón de diseño

El proyecto sigue una **arquitectura modular basada en componentes standalone** de Angular 20.3:

```
┌───────────────────────────────────────────┐
│            App (Root)                     │
│  - Control de splash screen               │
│  - Inicialización de servicios globales   │
│  - Gestión de audio por nivel             │
└────────────────┬──────────────────────────┘
                 │
    ┌────────────┴───────────┐
    │                        │
┌───▼────────┐    ┌──────────▼────────┐
│  Clicker   │    │   Router Outlet   │
│ Container  │    │   (Menu Pages)    │
│ - Stats    │    │                   │
│ - Clicker  │    │   - Upgrades      │
│ - Counter  │    │   - Achievements  │
│ - Particles│    │   - Options       │
│ - Floating │    │   - Skins         │
└────────────┘    └───────────────────┘
```

### Flujo de datos

1. **Servicios singleton** gestionan el estado global
2. **Signals y Effects** para reactividad
3. **RxJS Observables** para eventos asíncronos
4. **LocalStorage** para persistencia de datos

### Más información

Puedes consultar una documentación más detallada del proyecto [aquí](DOCS.md).

---

### ¿Qué puedes hacer clonando este repositorio?

1. **Puedes ver la PWA en navegador**: `pnpm install` + `ng serve` - http://localhost:4200
2. **Genera APK debug con Gradle**: `gradlew.bat assembleDebug` - `app/build/outputs/apk/debug/app-debug.apk`
3. **Prueba la app en móvil**: instala el APK debug generado

---

## Requisitos previos

- [Git](https://git-scm.com/) (opcional, para clonar el repositorio)

- [NVM](https://github.com/nvm-sh/nvm) (opcional, para gestionar versiones de Node.js)
- [Node.js](https://nodejs.org/) v20.19.0 o superior
- [PNPM](https://pnpm.io/) v10.20.0 (gestor de paquetes)
- [Angular CLI](https://github.com/angular/angular-cli) v20.3.9

- [Java JDK](https://adoptium.net/) v11 o superior (opcional, para generar APK)
- [Android SDK](https://developer.android.com/studio) (opcional, Gradle lo descarga si falta)

---

## Instalación y ejecución

### Para ejecutar la PWA (desarrollo web)

```bash
git clone https://github.com/impavloh/croqueta-clicker.git
cd croqueta-clicker

# Instalar Node.js 20.x (si no lo tienes)
nvm install 20.19.0
nvm use 20.19.0

# Instalar PNPM globalmente  (si no lo tienes)
npm install -g pnpm

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
ng serve
```

La aplicación estará disponible en **[http://localhost:4200/](http://localhost:4200/)**

El servidor recargará automáticamente al detectar cambios en los archivos.

### Para generar APK Android (Gradle directo)

> Este repositorio incluye también el proyecto Android ya generado con **Bubblewrap**.  
> Bubblewrap solo lo utilizamos los desarrolladores para generar la APK firmada y publicarla en Google Play.
> **No necesitas Bubblewrap** para compilar un APK _debug_.

Si tienes **Java + Android SDK** instalados, puedes generar un APK de depuración con:

```bash
# Windows
gradlew.bat assembleDebug

# Linux / macOS
./gradlew assembleDebug
```

> **Nota**: El APK generado es de depuración y no está firmado para producción.

El APK quedará en: `app/build/outputs/apk/debug/app-debug.apk`

### APK para pruebas

Si quieres probar el juego descargado sin compilarlo, descarga el APK debug desde: **[apk/CroquetaClicker-debug.apk](apk/CroquetaClicker-debug.apk)**

> **Nota**: Para instalarlo necesitas habilitar "Instalar apps de fuentes desconocidas" en Android. Este APK no está firmado.

---

## Scripts disponibles (Angular CLI)

| Comando                                | Descripción                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `ng serve`                             | Inicia servidor de desarrollo en http://localhost:4200 |
| `ng build`                             | Compila el proyecto para producción en `/dist`         |
| `ng build --configuration development` | Compila en modo desarrollo (con source maps)           |
| `ng test`                              | Ejecuta tests unitarios con Karma + Jasmine            |
| `ng serve --open`                      | Inicia servidor y abre navegador automáticamente       |

---

## Publicación en Google Play (Trusted Web Activity)

Este proyecto se publicará en Google Play como una **TWA (Trusted Web Activity)**: un contenedor Android mínimo que abre la PWA a pantalla completa dentro de Chrome. El wrapper **no se incluye completamente** en este repositorio para mantenerlo limpio y proteger las claves de firma.

---

## Autores

- **[Pavloh](https://github.com/ImPavloh)**
- **[Roberto Cichón](https://github.com/RobertoCichon)**
- **[Víctor RG](https://github.com/VictorRG15)**
