import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private readonly isDebugModeSubject = new BehaviorSubject<boolean>(false);
  readonly isDebugMode$ = this.isDebugModeSubject.asObservable();

  constructor(private optionsService: OptionsService) {
    const isDebug = this.optionsService.getGameItem('isDebugMode') === 'true';
    this.isDebugModeSubject.next(isDebug);
  }

  get isDebugMode(): boolean {
    return this.isDebugModeSubject.value;
  }

  enableDebugMode(): void {
    this.optionsService.setGameItem('isDebugMode', 'true');
    this.isDebugModeSubject.next(true);
  }
}
