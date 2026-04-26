import { Injectable, signal } from '@angular/core';

export type HudPanelId = 'leaderboard' | 'contracts';

@Injectable({ providedIn: 'root' })
export class HudPanelsService {
  private readonly _activePanel = signal<HudPanelId | null>(null);

  readonly activePanel = this._activePanel.asReadonly();

  open(panel: HudPanelId): void {
    this._activePanel.set(panel);
  }

  close(panel?: HudPanelId): void {
    if (!panel || this._activePanel() === panel) {
      this._activePanel.set(null);
    }
  }

  toggle(panel: HudPanelId): void {
    this._activePanel.update((currentPanel) => (currentPanel === panel ? null : panel));
  }
}
