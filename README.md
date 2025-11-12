# Croqueta Clicker

**Croqueta Clicker** es un juego incremental inspirado en Cookie Clicker, desarrollado con Angular 20 y TypeScript. 

¡Haz clic en croquetas, desbloquea mejoras, compra productores automáticos y personaliza tu experiencia con skins exclusivas!

Visita **[croquetaclicker.pavloh.com](https://croquetaclicker.pavloh.com)** para jugarlo ya :)

---

## Características principales

### Sistema de juego completo
- **Sistema de clicks**: Gana croquetas haciendo clic (con efectos visuales y partículas)
- **Productores automáticos**: 8 tipos de productores que generan croquetas por segundo
- **Mejoras (Upgrades)**: 20+ mejoras para aumentar tus clicks y producción
- **Sistema de niveles**: Gana experiencia y sube de nivel desbloqueando contenido
- **Logros (Achievements)**: 30+ logros por desbloquear con diferentes categorías
- **Croqueta dorada**: Evento especial aleatorio con bonificaciones temporales
- **Skins personalizables**: 10+ skins desbloqueables para personalizar tu croqueta

### Características técnicas
- **Guardado automático**: Progreso guardado en localStorage
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
│                         App (Root)        │
│  - Control de splash screen               │
│  - Inicialización de servicios globales   │
│  - Gestión de audio por nivel             │
└────────────────┬──────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐    ┌──────────▼────────┐
│  Clicker   │    │   Router Outlet   │
│ Container  │    │   (Menu Pages)    │
│            │    │                   │
│ - Clicker  │    │    - Upgrades     │
│ - Counter  │    │    - Stats        │
│ - Particles│    │    - Options      │
│ - Floating │    │    - Skins        │
└────────────┘    └───────────────────┘
```

### Flujo de datos
1. **Servicios singleton** gestionan el estado global
2. **Signals y Effects** para reactividad (Angular 20.3)
3. **RxJS Observables** para eventos asíncronos
4. **LocalStorage** para persistencia de datos

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v20.19.0 o superior
- [PNPM](https://pnpm.io/) v10.20.0 (gestor de paquetes)
- [Angular CLI](https://github.com/angular/angular-cli) v20.3.9

> **Nota**: Se recomienda usar [NVM](https://github.com/nvm-sh/nvm) para gestionar versiones de Node.js

---

## Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/impavloh/croqueta-clicker.git
cd croqueta-clicker
```

### 2. Instalar Node.js (con NVM y si no lo tienes)
```bash
nvm install 20.19.0
nvm use 20.19.0
```

### 3. Instalar PNPM globalmente (si no lo tienes)
```bash
npm install -g pnpm
```

### 4. Instalar dependencias del proyecto
```bash
pnpm install
```

### 5. Iniciar servidor de desarrollo
```bash
ng serve
```

La aplicación estará disponible en **[http://localhost:4200/](http://localhost:4200/)**

El servidor recargará automáticamente al detectar cambios en los archivos.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `ng serve` | Inicia servidor de desarrollo en http://localhost:4200 |
| `ng build` | Compila el proyecto para producción en `/dist` |
| `ng build --configuration development` | Compila en modo desarrollo (con source maps) |
| `ng test` | Ejecuta tests unitarios con Karma + Jasmine |
| `ng serve --open` | Inicia servidor y abre navegador automáticamente |

---

## Autores

- **[Pavloh](https://github.com/ImPavloh)**
- **[Roberto Cichón](https://github.com/RobertoCichon)**
- **[Víctor RG](https://github.com/VictorRG15)**
