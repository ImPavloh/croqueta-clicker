import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OptionsService } from './options.service';

/**
 * Servicio para gestionar el modo debug del juego.
 * Permite activar funcionalidades especiales para depuración y testing.
 */
@Injectable({
  providedIn: 'root',
})
export class DebugService {
  /** Subject privado que almacena el estado del modo debug */
  private readonly isDebugModeSubject = new BehaviorSubject<boolean>(false);

  /** Observable público para suscribirse a cambios en el modo debug */
  readonly isDebugMode$ = this.isDebugModeSubject.asObservable();

  /**
   * @param optionsService Servicio de opciones para cargar el estado del modo debug
   */
  constructor(private optionsService: OptionsService) {
    const isDebug = this.optionsService.getGameItem('isDebugMode') === 'true';
    this.isDebugModeSubject.next(isDebug);
  }

  /**
   * Obtiene el valor actual del modo debug.
   * @returns true si el modo debug está activado, false en caso contrario
   */
  get isDebugMode(): boolean {
    return this.isDebugModeSubject.value;
  }

  /**
   * Activa el modo debug y persiste el cambio en el almacenamiento local.
   */
  enableDebugMode(): void {
    this.optionsService.setGameItem('isDebugMode', 'true');
    this.isDebugModeSubject.next(true);
  }
}
