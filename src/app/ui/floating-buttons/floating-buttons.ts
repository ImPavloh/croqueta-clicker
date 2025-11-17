import { Component, inject } from '@angular/core';
import { AudioService } from '@services/audio.service';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-floating-buttons',
  imports: [],
  templateUrl: './floating-buttons.html',
  styleUrl: './floating-buttons.css',
})
export class FloatingButtons {
  private modalService = inject(ModalService);
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
}
