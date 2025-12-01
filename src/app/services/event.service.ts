import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { GameEvent } from '../models/game-event.model';
import {
  EVENT_CHECK_INTERVAL_MS,
  GOLDEN_EVENT_SPAWN_CHANCE,
  GOLDEN_EVENT_LIFETIME_MS,
  BURNT_EVENT_SPAWN_CHANCE,
  BURNT_EVENT_LIFETIME_MS,
  BONUS_EVENT_SPAWN_CHANCE,
  BONUS_EVENT_LIFETIME_MS,
  BONUS_EVENT_TIME_REWARD_S,
  GOLDEN_EVENT_BONUS_MULTIPLIER,
  BURNT_EVENT_PENALTY_MULTIPLIER,
  GOLDEN_EVENT_BONUS_DURATION_MS,
  BURNT_EVENT_PENALTY_DURATION_MS,
  EVENT_FADE_OUT_MS,
} from '../config/constants';
import { AudioService } from './audio.service';
import { AchievementsService } from './achievements.service';
import { PointsService } from './points.service';
import { FloatingService } from './floating.service';

/**
 * Servicio para gestionar eventos especiales del juego (croqueta dorada, quemada, bonus).
 * Controla el spawn, la activación y la duración de estos eventos aleatorios.
 */
@Injectable({
  providedIn: 'root',
})
export class EventService implements OnDestroy {
  private audioService = inject(AudioService);
  private achievementsService = inject(AchievementsService);
  private pointsService = inject(PointsService);
  private floatingService = inject(FloatingService);

  /** Signal que contiene todos los eventos activos */
  private events = signal<GameEvent[]>([]);

  /** Contador para asignar IDs únicos a cada evento */
  private eventIdCounter = 0;

  /** Timer para comprobar periódicamente si debe aparecer un nuevo evento */
  private spawnTimer: any;

  constructor() {
    this.startSpawnCheck();
  }

  /**
   * Obtiene los eventos activos como signal de solo lectura.
   * @returns Signal readonly con el array de eventos activos
   */
  getEvents() {
    return this.events.asReadonly();
  }

  /**
   * Inicia el temporizador que comprueba periódicamente si debe aparecer un evento.
   * Solo se crea un evento si no hay otro activo.
   */
  startSpawnCheck() {
    if (typeof window === 'undefined') return;

    this.spawnTimer = setInterval(() => {
      if (this.events().length > 0) {
        return;
      }

      const rand = Math.random();
      if (rand < GOLDEN_EVENT_SPAWN_CHANCE) {
        this.spawnEvent('golden');
      } else if (rand < GOLDEN_EVENT_SPAWN_CHANCE + BURNT_EVENT_SPAWN_CHANCE) {
        this.spawnEvent('burnt');
      } else if (
        rand <
        GOLDEN_EVENT_SPAWN_CHANCE + BURNT_EVENT_SPAWN_CHANCE + BONUS_EVENT_SPAWN_CHANCE
      ) {
        this.spawnEvent('bonus');
      }
    }, EVENT_CHECK_INTERVAL_MS);
  }

  spawnEvent(type: 'golden' | 'burnt' | 'bonus') {
    const id = this.eventIdCounter++;
    let event: GameEvent;

    switch (type) {
      case 'golden':
        event = {
          id,
          type,
          duration: GOLDEN_EVENT_BONUS_DURATION_MS,
          effect: GOLDEN_EVENT_BONUS_MULTIPLIER,
          active: false,
          spawned: true,
          position: this.getRandomPosition(),
          image: 'assets/skins/croqueta-dorada.webp',
          state: 'fading-in',
        };
        break;
      case 'burnt':
        event = {
          id,
          type,
          duration: BURNT_EVENT_PENALTY_DURATION_MS,
          effect: BURNT_EVENT_PENALTY_MULTIPLIER,
          active: false,
          spawned: true,
          position: this.getRandomPosition(),
          image: 'assets/skins/croqueta-quemada.webp',
          state: 'fading-in',
        };
        break;
      case 'bonus':
        event = {
          id,
          type,
          duration: 0, // Instant effect
          effect: BONUS_EVENT_TIME_REWARD_S,
          active: false,
          spawned: true,
          position: this.getRandomPosition(),
          image: 'assets/skins/croqueta-cosmica.webp',
          state: 'fading-in',
        };
        break;
    }

    this.events.update((events) => [...events, event]);

    setTimeout(() => {
      this.events.update((events) =>
        events.map((e) => (e.id === id ? { ...e, state: 'visible' } : e))
      );
    }, 100);

    setTimeout(() => {
      const currentEvent = this.events().find((e) => e.id === id);
      if (currentEvent && !currentEvent.active) {
        this.events.update((events) =>
          events.map((e) => (e.id === id ? { ...e, state: 'fading-out' } : e))
        );
        setTimeout(() => this.removeEvent(id), EVENT_FADE_OUT_MS);
      }
    }, this.getEventLifetime(type));
  }

  clicked(eventId: number, mouseEvent: MouseEvent) {
    let event = this.events().find((e) => e.id === eventId);
    if (!event || !event.spawned) return;

    this.audioService.playSfx('/assets/sfx/achievement.mp3');

    if (event.type === 'golden') {
      this.achievementsService.unlockAchievement('golden_event');
    } else if (event.type === 'burnt') {
      this.achievementsService.unlockAchievement('burnt_event');
    } else if (event.type === 'bonus') {
      // De momento no hay logros para el evento de bonus
      this.achievementsService.unlockAchievement('cosmic_event');
    }

    if (event.type === 'bonus') {
      const bonus = this.pointsService.getPointsPerSecond().times(event.effect);
      this.pointsService.addPoints(bonus);
      this.floatingService.show(`+${bonus.toString()}`, {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      });
    }

    this.events.update((events) =>
      events.map((e) =>
        e.id === eventId ? { ...e, spawned: false, active: true, state: 'fading-out' } : e
      )
    );
    event = this.events().find((e) => e.id === eventId)!;

    setTimeout(() => {
      this.activateEventEffect(event!);
    }, EVENT_FADE_OUT_MS);
  }

  private activateEventEffect(event: GameEvent) {
    switch (event.type) {
      case 'golden':
      case 'burnt':
        this.pointsService.addMultiplier(event.effect, event.duration);
        this.startDurationTimer(event.id, event.duration);
        break;
      case 'bonus': {
        this.removeEvent(event.id);
        break;
      }
    }
  }

  private startDurationTimer(eventId: number, duration: number) {
    this.events.update((events) =>
      events.map((e) => (e.id === eventId ? { ...e, remainingTime: duration / 1000 } : e))
    );

    const interval = setInterval(() => {
      let event = this.events().find((e) => e.id === eventId);
      if (event && event.active) {
        this.events.update((events) =>
          events.map((e) => (e.id === eventId ? { ...e, remainingTime: e.remainingTime! - 1 } : e))
        );
        event = this.events().find((e) => e.id === eventId);

        if (event!.remainingTime! <= 0) {
          clearInterval(interval);
          this.removeEvent(eventId);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  private removeEvent(eventId: number) {
    this.events.update((events) => events.filter((e) => e.id !== eventId));
  }

  private getEventLifetime(type: 'golden' | 'burnt' | 'bonus'): number {
    switch (type) {
      case 'golden':
        return GOLDEN_EVENT_LIFETIME_MS;
      case 'burnt':
        return BURNT_EVENT_LIFETIME_MS;
      case 'bonus':
        return BONUS_EVENT_LIFETIME_MS;
    }
  }

  private getRandomPosition(): { x: number; y: number } {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    return { x, y };
  }

  ngOnDestroy() {
    clearInterval(this.spawnTimer);
    this.events.set([]);
  }
}
