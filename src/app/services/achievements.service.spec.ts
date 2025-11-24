import { TestBed } from '@angular/core/testing';
import { AchievementsService } from './achievements.service';
import { GAME_PREFIX } from '@app/config/constants';
import { ACHIEVEMENTS, Achievement } from '@data/achievements.data';
import { firstValueFrom } from 'rxjs';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let store: Record<string, string>;
  const storageKey = GAME_PREFIX + 'achievements';

  // función setup para simular localStorage
  const setupLocalStorageMock = () => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(console, 'warn');
  };

  // Función para recrear el servicio (para probar la inicialización)
  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AchievementsService],
    });
    return TestBed.inject(AchievementsService);
  };

  beforeEach(() => {
    setupLocalStorageMock();
    service = createService(); // El servicio se crea aquí
  });

  afterEach(() => {
    // Limpiamos los espías
    (console.warn as jasmine.Spy).calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load data from localStorage on init', () => {
    // Prepara el store ANTES de la creación del servicio
    const mockData = { ach1: true, ach2: false };
    store[storageKey] = JSON.stringify(mockData);

    // Crea una nueva instancia del servicio para disparar el constructor
    const newService = createService();

    // Comprueba que se leyó
    expect(localStorage.getItem).toHaveBeenCalledWith(storageKey);
    const map = (newService as any).unlockedMapSnapshot(); // helper privado
    expect(map).toEqual(mockData);
    expect(newService.getUnlockedCount()).toBe(1); // solo cuenta los true
  });

  it('should handle parsing errors on load gracefully', () => {
    store[storageKey] = 'invalid-json'; // JSON inválido

    const newService = createService(); // No debe lanzar un error

    expect(console.warn).toHaveBeenCalledWith(
      'No se pudo leer achievements desde localStorage',
      jasmine.any(Error)
    );
    expect(newService.getUnlockedCount()).toBe(0); // debe empezar vacío
  });

  it('should save to localStorage when an achievement is unlocked', () => {
    // Asumimos que achh1 existe y no es uno de los especiales
    const testAch = ACHIEVEMENTS.find(
      (a) => a.id !== 'primer_achievement' && a.id !== 'todos_achievements'
    );
    if (!testAch) {
      fail('Se necesita al menos un logro normal en ACHIEVEMENTS.data');
      return;
    }

    service.unlockAchievement(testAch.id);

    expect(localStorage.setItem).toHaveBeenCalledWith(storageKey, jasmine.any(String));

    const rawStore = store[storageKey];
    const parsedStore = JSON.parse(rawStore);

    // debería haber desbloqueado tanto el logro de prueba como el primer logro
    expect(parsedStore[testAch.id]).toBeTrue();
    expect(parsedStore['primer_achievement']).toBeTrue();
  });

  describe('unlockAchievement', () => {
    let testAch: Achievement | undefined;

    beforeEach(() => {
      // reiniciar estado antes de cada test de unlock
      service.resetAll();
      (localStorage.setItem as jasmine.Spy).calls.reset();

      testAch = ACHIEVEMENTS.find(
        (a) => a.id !== 'primer_achievement' && a.id !== 'todos_achievements'
      );
      if (!testAch) {
        fail('ACHIEVEMENTS data debe tener un logro de prueba válido.');
      }
    });

    it('should unlock a new achievement, return true, and add to queue', async () => {
      const id = testAch!.id;
      const result = service.unlockAchievement(id);

      expect(result).toBeTrue();
      // se desbloquean 2 (el de prueba + primer_achievement)
      expect(service.getUnlockedCount()).toBe(2);

      const map = await firstValueFrom(service.unlockedMap$);
      expect(map[id]).toBeTrue();
      expect(map['primer_achievement']).toBeTrue(); // comprobar la lógica circular

      const queue = await firstValueFrom(service.queue$);
      expect(queue.length).toBe(2);
      expect(queue[0].id).toBe(id);
      expect(queue[1].id).toBe('primer_achievement');
    });

    it('should not unlock an already unlocked achievement and return false', () => {
      const id = testAch!.id;
      service.unlockAchievement(id); // desbloqueo inicial
      (localStorage.setItem as jasmine.Spy).calls.reset(); // reseteo del espía

      const result = service.unlockAchievement(id); // segundo intento

      expect(result).toBeFalse();
      expect(service.getUnlockedCount()).toBe(2); // sigue en 2
      // la lógica de unlock retorna pronto por lo que no debería haber
      // una nueva llamada a next() que dispare el saveToStorage
      // (Depende de la implementación de 'already')
      const queue = (service as any).queueSubject.getValue();
      expect(queue.length).toBe(2); // sigue en 2
    });

    it('should not unlock a non-existent achievement, return false, and warn', () => {
      const result = service.unlockAchievement('non-existent-id');
      expect(result).toBeFalse();
      expect(console.warn).toHaveBeenCalledWith('Achievement non-existent-id no existe.');
      expect(service.getUnlockedCount()).toBe(0); // Ningún logro desbloqueado
    });

    it('should unlock "todos_achievements" when the N-1 achievement is unlocked', () => {
      // se obtienen todos los IDs menos el de todos_achievements y uno más (ej ach1)
      const achToUnlock = ACHIEVEMENTS.find(
        (a) => a.id !== 'primer_achievement' && a.id !== 'todos_achievements'
      );
      if (!achToUnlock) {
        fail('Se necesita otro logro además de los especiales');
        return;
      }
      const allButTwo = ACHIEVEMENTS.map((a) => a.id).filter(
        (id) => id !== 'todos_achievements' && id !== achToUnlock.id
      );

      // forzado del estado a N-2 logros (sin disparar la lógica de check)
      const mapSubject = (service as any).unlockedMapSubject;
      const initialMap: Record<string, boolean> = {};
      allButTwo.forEach((id) => {
        initialMap[id] = true;
      });
      mapSubject.next(initialMap);

      // el contador está en N-2. La condición N-2 >= N-1 es falsa
      expect(service.getUnlockedCount()).toBe(ACHIEVEMENTS.length - 2);
      expect((service as any).unlockedMapSnapshot()['todos_achievements']).toBeFalsy();

      // ahora se desbloquea el penúltimo logro ('ach1')
      service.unlockAchievement(achToUnlock.id);

      // El contador ahora es (N-2) + 1 ('ach1') = N-1
      // La condición (N-1 >= N-1) es verdadera
      // checkAchievements debería desbloquear todos_achievements
      const finalMap = (service as any).unlockedMapSnapshot();
      expect(finalMap[achToUnlock.id]).toBeTrue();
      expect(finalMap['todos_achievements']).toBeTrue();
      expect(service.getUnlockedCount()).toBe(ACHIEVEMENTS.length); // todos desbloqueados
    });
  });

  describe('consumeNext', () => {
    it('should return undefined if queue is empty', () => {
      (service as any).queueSubject.next([]); // forzar cola vacía
      expect(service.consumeNext()).toBeUndefined();
    });

    it('should return the first item and remove it from the queue', async () => {
      const testAch = ACHIEVEMENTS[0];
      const testAch2 = ACHIEVEMENTS[1];

      // Forzar estado de la cola
      (service as any).queueSubject.next([testAch, testAch2]);

      const first = service.consumeNext();
      expect(first).toBe(testAch);

      let queue = await firstValueFrom(service.queue$);
      expect(queue.length).toBe(1);
      expect(queue[0]).toBe(testAch2);

      const second = service.consumeNext();
      expect(second).toBe(testAch2);

      queue = await firstValueFrom(service.queue$);
      expect(queue.length).toBe(0);
    });
  });

  describe('resetAll', () => {
    it('should clear unlocked map, queue, and localStorage', async () => {
      // Añade estado
      service.unlockAchievement(ACHIEVEMENTS[0].id);
      expect(service.getUnlockedCount()).toBe(2); // ach[0] + primer

      // Resetear
      service.resetAll();

      // Comprobar
      const map = await firstValueFrom(service.unlockedMap$);
      expect(map).toEqual({});

      const queue = await firstValueFrom(service.queue$);
      expect(queue).toEqual([]);

      expect(localStorage.removeItem).toHaveBeenCalledWith(storageKey);
      expect(service.getUnlockedCount()).toBe(0);
    });
  });

  describe('Getters (síncronos)', () => {
    beforeEach(() => {
      service.resetAll();
      // forzar estado sin disparar checkAchievements
      const mapSubject = (service as any).unlockedMapSubject;
      mapSubject.next({ [ACHIEVEMENTS[0].id]: true, [ACHIEVEMENTS[1].id]: true });
    });

    it('getUnlockedCount() should return correct count', () => {
      expect(service.getUnlockedCount()).toBe(2);
    });

    it('getTotalCount() should return total achievements', () => {
      expect(service.getTotalCount()).toBe(ACHIEVEMENTS.length);
    });

    it('getAchievementById() should find an achievement', () => {
      const ach = service.getAchievementById(ACHIEVEMENTS[0].id);
      expect(ach).toEqual(ACHIEVEMENTS[0]);
    });

    it('getAchievementById() should return undefined for non-existent', () => {
      const ach = service.getAchievementById('fake-id');
      expect(ach).toBeUndefined();
    });

    it('getAllWithState() should correctly merge state', () => {
      const allWithState = service.getAllWithState();

      expect(allWithState.length).toBe(ACHIEVEMENTS.length);

      const ach0 = allWithState.find((a) => a.id === ACHIEVEMENTS[0].id);
      const ach1 = allWithState.find((a) => a.id === ACHIEVEMENTS[1].id);

      expect(ach0?.unlocked).toBeTrue();
      expect(ach1?.unlocked).toBeTrue();

      if (ACHIEVEMENTS.length > 2) {
        const ach2 = allWithState.find((a) => a.id === ACHIEVEMENTS[2].id);
        expect(ach2?.unlocked).toBeFalse();
      }
    });
  });
});
