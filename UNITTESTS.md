# Resumen de Unit Tests

Este documento detalla los tests de funcionalidad más importantes del proyecto, omitiendo los tests básicos de creación de componentes.

## Servicios

### [Achievement Service](./src/app/services/achievements.service.spec.ts)

Este servicio se encarga de gestionar los logros del juego. Sus tests garantizan la correcta persistencia y lógica de desbloqueo.

- **Persistencia en Local Storage**:

  - `should load data from localStorage on init`: Comprueba que el estado de los logros se carga correctamente desde el `localStorage` al iniciar la aplicación.
  - `should handle parsing errors on load gracefully`: Asegura que si los datos en `localStorage` están corruptos, el servicio no falla y simplemente empieza con un estado limpio.
  - `should save to localStorage when an achievement is unlocked`: Verifica que el progreso se guarda en `localStorage` cada vez que el jugador desbloquea un nuevo logro.

- **Lógica de desbloqueo**:

  - `should unlock a new achievement, return true, and add to queue`: Testa la función principal de desbloqueo, asegurando que se marca como conseguido y se añade a la cola de notificaciones.
  - `should not unlock an already unlocked achievement and return false`: Previene que un mismo logro se pueda desbloquear múltiples veces.
  - `should unlock "todos_achievements" when the N-1 achievement is unlocked`: Un test específico para el logro "maestro", que solo debe desbloquearse cuando todos los demás logros han sido conseguidos.

- **Gestión de cola y reseteo**:
  - `should return the first item and remove it from the queue`: Prueba el sistema de cola para notificar los logros uno por uno.
  - `should clear unlocked map, queue, and localStorage`: Comprueba que la función de reseteo elimina todo el progreso de los logros.

### [Points Service](./src/app/services/points.service.spec.ts)

Este es el servicio más crítico, ya que maneja toda la lógica de puntuación del juego.

- **Persistencia y carga**:

  - `should load values from OptionsService on creation`: Asegura que la puntuación del jugador y sus mejoras se cargan correctamente desde el almacenamiento al iniciar el juego.
  - `should NOT save to storage during initialization`: Previene que se guarden datos durante los primeros 2 segundos de la aplicación para evitar condiciones de carrera.
  - `should save to storage AFTER initialization`: Garantiza que el autoguardado se activa después del periodo de inicialización.

- **Funcionalidad principal**:

  - `should add points per click`: Verifica que se suman puntos al hacer clic.
  - `should add points per second via interval`: Comprueba que la ganancia de puntos pasiva funciona correctamente.
  - `should subtract points and save`: Testa que se resten los puntos correctamente al comprar mejoras.

- **Modificadores (bonus y penalizaciones)**:

  - `should add points per click (with golden croqueta bonus)`: Asegura que el bonus de la "croqueta dorada" multiplica los puntos por clic.
  - `should add points per second (with bonus) via interval`: Verifica que el bonus también se aplica a la ganancia pasiva.
  - `should apply burnt croqueta penalty to clicks`: Comprueba que la penalización de la "croqueta quemada" reduce los puntos ganados por clic.
  - `should add points per second (with burnt penalty) via interval`: Testa que la penalización también afecta a la ganancia pasiva.

- **Reset**:
  - `should reset all values`: Prueba que la función de reseteo restaura todos los valores a su estado inicial.

### [Shop Controls Service](./src/app/services/shop-controls.service.spec.ts)

Gestiona los controles de la tienda, como la cantidad de mejoras a comprar de una vez.

- **Persistencia**:

  - `should load stored values from storage on construction`: Carga la configuración de la tienda (ej. "comprar de 10 en 10") guardada por el usuario.
  - `should ignore invalid stored values and use defaults`: Si el dato guardado es inválido (ej. un valor que no existe), el servicio usa los valores por defecto para evitar errores.

- **Funcionalidad**:
  - `cycleBuyAmount`: Comprueba que el botón para cambiar la cantidad de compra (1, 10, 25) funciona de forma cíclica.
  - `setBuyAmount should update signal and call saveToStorage`: Asegura que al cambiar la cantidad de compra, el nuevo valor se guarda.

### [Supabase Service](./src/app/services/supabase.service.spec.ts)

Este servicio gestiona la comunicación con el backend (Supabase), principalmente para la autenticación. Los tests se centran en la resiliencia ante un error específico del navegador.

- **Resiliencia ante `NavigatorLockAcquireTimeoutError`**:
  - `retries getUser once and succeeds when navigator lock error occurs`: Simula un fallo temporal del navegador al intentar obtener el usuario y verifica que el servicio **reintenta automáticamente** la operación y tiene éxito.
  - `signInAnonymously retries and succeeds`: Hace la misma comprobación para el inicio de sesión anónimo.
  - `throws after exhausting retry attempts`: Asegura que si el error persiste después de varios reintentos, el servicio finalmente se rinde y lanza un error para evitar un bucle infinito.
