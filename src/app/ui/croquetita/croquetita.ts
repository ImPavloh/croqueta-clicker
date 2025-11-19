import { CommonModule } from '@angular/common';
import { Component, signal, ChangeDetectionStrategy, inject, OnDestroy, HostListener } from '@angular/core';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { OptionsService } from '@services/options.service';
import { AudioService } from '@services/audio.service';
import { TUTORIAL_MESSAGES } from '@data/tutorial.data';
import { TutorialMessage } from '@models/tutorial.model';

import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-croquetita',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './croquetita.html',
  styleUrl: './croquetita.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Croquetita implements OnDestroy {
  isOpen = signal(false);
  currentMessage = signal('');
  isAnimating = signal(false);

  private messages: TutorialMessage[] = TUTORIAL_MESSAGES;
  private shownMessages = new Set<string>();
  private autoCloseTimeout?: number;
  private initialTimeout?: number;
  private checkInterval?: number;
  protected optionsService = inject(OptionsService);
  private audioService = inject(AudioService);

  constructor(private pointsService: PointsService, private playerStats: PlayerStats) {
    this.loadShownMessages();
  }

  ngOnInit() {
    this.initialTimeout = window.setTimeout(() => {
      if (!this.shownMessages.has('welcome')) {
        this.showAutoMessage();
      }
    }, 5000);

    // Revisar nuevos mensajes cada 30 segundos
    this.checkInterval = window.setInterval(() => {
      this.checkForNewMessages();
    }, 30000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen()) return;

    const target = event.target as HTMLElement;

    // no cerrar si se hace clic en Croquetita o en el mensaje
    if (target.closest('.croquetita-character') || target.closest('.croquetita-dialog')) {
      return;
    }

    // ni cerrar si se hace clic en el clicker
    if (target.closest('.croqueta-container')) {
      return;
    }

    // cerrar el mensaje si se hace clic en cualquier otro lao
    this.close();
  }

  toggleHelper() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen.set(true);
    this.isAnimating.set(true);
    this.showRelevantMessage();
    this.audioService.playSfx('/assets/sfx/croquetita.mp3', 1);

    // cerrar automáticamente
    this.clearAutoCloseTimeout();
    this.autoCloseTimeout = window.setTimeout(() => {
      this.close();
    }, 8000);
  }

  closeSound() {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.close();
  }

  close() {
    this.clearAutoCloseTimeout();
    this.isAnimating.set(false);
    setTimeout(() => {
      this.isOpen.set(false);
    }, 200);
  }

  private clearAutoCloseTimeout() {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = undefined;
    }
  }

  private checkCondition(msg: TutorialMessage): boolean {
    const points = this.pointsService.points();
    const clicks = this.playerStats.totalClicks();
    const level = this.playerStats._level.value;

    // Verificar condición de puntos
    if (msg.minPoints !== undefined) {
      if (points.lt(msg.minPoints)) return false;
    }
    if (msg.maxPoints !== undefined) {
      if (points.gt(msg.maxPoints)) return false;
    }

    // Verificar condición de clicks
    if (msg.minClicks !== undefined) {
      if (clicks < msg.minClicks) return false;
    }
    if (msg.maxClicks !== undefined) {
      if (clicks > msg.maxClicks) return false;
    }

    // Verificar condición de nivel
    if (msg.minLevel !== undefined) {
      if (level < msg.minLevel) return false;
    }
    if (msg.maxLevel !== undefined) {
      if (level > msg.maxLevel) return false;
    }

    return true;
  }

  private showRelevantMessage() {
    // Encontrar el mensaje más relevante que no se haya mostrado
    const relevantMessages = this.messages
      .filter((msg) => this.checkCondition(msg) && !this.shownMessages.has(msg.id))
      .sort((a, b) => a.priority - b.priority);

    if (relevantMessages.length > 0) {
      const message = relevantMessages[0];
      this.currentMessage.set(message.message);
      this.markMessageAsShown(message.id);
    } else {
      // Si todos los mensajes se mostraron, seleccionar un mensaje aleatorio de ayuda
      const helpMessages = this.messages.filter(
        (msg) => msg.category === 'tips' || msg.category === 'tutorial'
      );
      if (helpMessages.length > 0) {
        const randomMsg = helpMessages[Math.floor(Math.random() * helpMessages.length)];
        this.currentMessage.set(randomMsg.message);
      } else {
        // Mensaje por defecto
        const generalHelp = this.messages.find((msg) => msg.id === 'general_help');
        if (generalHelp) {
          this.currentMessage.set(generalHelp.message);
        }
      }
    }
  }

  private showAutoMessage() {
    const relevantMessages = this.messages
      .filter(
        (msg) =>
          this.checkCondition(msg) && !this.shownMessages.has(msg.id) && msg.autoShow === true
      )
      .sort((a, b) => a.priority - b.priority);

    if (relevantMessages.length > 0) {
      this.open();
    }
  }

  private checkForNewMessages() {
    // Revisar si hay mensajes nuevos que deberían mostrarse automáticamente
    const newAutoMessages = this.messages.filter(
      (msg) =>
        this.checkCondition(msg) &&
        !this.shownMessages.has(msg.id) &&
        msg.autoShow === true &&
        msg.priority <= 100 // Solo mensajes importantes
    );

    if (newAutoMessages.length > 0 && !this.isOpen()) {
      this.showAutoMessage();
    }
  }

  private markMessageAsShown(id: string) {
    this.shownMessages.add(id);
    this.saveShownMessages();
  }

  private saveShownMessages() {
    const messagesArray = Array.from(this.shownMessages);
    this.optionsService.setGameItem('croquetita_shown_messages', JSON.stringify(messagesArray));
  }

  private loadShownMessages() {
    const stored = this.optionsService.getGameItem('croquetita_shown_messages');
    if (stored) {
      try {
        const messagesArray = JSON.parse(stored);
        this.shownMessages = new Set(messagesArray);
      } catch (e) {
        console.error('Error loading shown messages:', e);
      }
    }
  }

  // dejado para pruebas
  resetTutorial() {
    this.shownMessages.clear();
    this.saveShownMessages();
    this.close();
  }

  ngOnDestroy() {
    // Limpiar todos los timers al destruir el componente
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
