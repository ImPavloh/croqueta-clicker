import { Component, inject } from '@angular/core';
import { AudioService } from '@services/audio.service';
import { ModalService } from '@services/modal.service';
import { TimeService } from '@services/time.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-floating-buttons',
  imports: [TranslocoModule],
  templateUrl: './floating-buttons.html',
  styleUrl: './floating-buttons.css',
})
export class FloatingButtons {
  protected modalService = inject(ModalService);
  protected timeService = inject(TimeService);
  private audioService = inject(AudioService);

  openUpgrades() {
    this.modalService.openModal('upgrades');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  openAchievements() {
    this.modalService.openModal('achievements');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  openSkins() {
    this.modalService.openModal('skins');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  openOptions() {
    this.modalService.openModal('options');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  openContracts() {
    this.modalService.openModal('contracts');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }
}
