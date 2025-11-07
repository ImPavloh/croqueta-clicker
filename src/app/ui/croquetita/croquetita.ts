import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { TUTORIAL_MESSAGES, TutorialMessage } from '@data/tutorial.data';

@Component({
  selector: 'app-croquetita',
  imports: [CommonModule],
  templateUrl: './croquetita.html',
  styleUrl: './croquetita.css',
})
export class Croquetita {
  isOpen = signal(false);
  currentMessage = signal('');
  isAnimating = signal(false);

  private messages: TutorialMessage[] = TUTORIAL_MESSAGES;
  private shownMessages = new Set<string>();

  constructor(private pointsService: PointsService, private playerStats: PlayerStats) {
    this.loadShownMessages();
  }

  ngOnInit() {
    setTimeout(() => {
      if (!this.shownMessages.has('welcome')) {
        this.showAutoMessage();
      }
    }, 2000);

    // Revisar nuevos mensajes cada 30 segundos
    setInterval(() => {
      this.checkForNewMessages();
    }, 30000);
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
  }

  close() {
    this.isAnimating.set(false);
    setTimeout(() => {
      this.isOpen.set(false);
    }, 200);
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

  // TODO: MEJORABLEEEEE
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
    localStorage.setItem('croquetita_shown_messages', JSON.stringify(messagesArray));
  }

  private loadShownMessages() {
    const stored = localStorage.getItem('croquetita_shown_messages');
    if (stored) {
      try {
        const messagesArray = JSON.parse(stored);
        this.shownMessages = new Set(messagesArray);
      } catch (e) {
        console.error('Error loading shown messages:', e);
      }
    }
  }

  resetTutorial() {
    this.shownMessages.clear();
    this.saveShownMessages();
    this.close();
  }
}
