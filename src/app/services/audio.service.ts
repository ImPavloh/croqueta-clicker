import { Injectable, OnDestroy } from '@angular/core';
import { OptionsService } from './options.service';
import { combineLatest, Subscription } from 'rxjs';

/**
 * Servicio para gestionar la reproducción de audio (música y efectos de sonido)
 * utilizando la Web Audio API para un control avanzado del volumen y transiciones.
 */
@Injectable({ providedIn: 'root' })
export class AudioService implements OnDestroy {

  //El contexto de audio principal de la Web Audio API. Se inicializa de forma perezosa.
  private ctx: AudioContext | null = null;
  //Nodo de ganancia principal que controla el volumen general.
  private masterGain!: GainNode;
  //Nodo de ganancia para los efectos de sonido (SFX).
  private sfxGain!: GainNode;
  //Nodo de ganancia para la música.
  private musicGain!: GainNode;
  //Suscripción a los cambios de volumen en el servicio de opciones.
  private optionsSub?: Subscription;

  //Almacena el estado de la pista de música actual para gestionar el crossfade.
  private currentMusic: {
    url: string;
    audio: HTMLAudioElement;
    srcNode: MediaElementAudioSourceNode;
    trackGain: GainNode;
  } | null = null;

  //Caché para almacenar los `AudioBuffer` de los SFX decodificados y evitar recargas.
  private sfxBufferCache = new Map<string, AudioBuffer>();

  /**
   * @param options Servicio de opciones para obtener y suscribirse a los ajustes de volumen.
   */
  constructor(private options: OptionsService) {
    // lazy init: no crear AudioContext hasta que sea necesario (por política de user gesture)
  }

  /**
   * Asegura que el `AudioContext` y los nodos de ganancia estén inicializados.
   * Se ejecuta solo una vez cuando es necesario. Limpia elementos de audio antiguos
   * y establece la estructura de nodos de audio.
   */
  private ensureCtx() {
    if (this.ctx) return;

    // Limpieza: si hay elementos de audio creados por instancias previas del servicio, los detiene y elimina.
    try {
      const old = Array.from(
        document.querySelectorAll('audio[data-audioservice="true"]')
      ) as HTMLAudioElement[];
      for (const a of old) {
        try {
          a.pause();
          a.currentTime = 0;
          if (a.parentElement) a.parentElement.removeChild(a);
        } catch {}
      }
    } catch (e) {
      // No es crítico si falla.
    }

    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    if (this.ctx == null) return;
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    // Conexión de nodos: sfxGain -> masterGain -> destination; musicGain -> masterGain -> destination
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Inicializa los nodos de ganancia con los valores actuales del servicio de opciones (0..1).
    const now = this.ctx.currentTime;
    // Se usa setValueAtTime para evitar valores por defecto inesperados.
    this.masterGain.gain.setValueAtTime(this.options.getGeneral(), now);
    this.sfxGain.gain.setValueAtTime(this.options.getSfx(), now);
    this.musicGain.gain.setValueAtTime(this.options.getMusic(), now);

    // Se suscribe a los cambios en los sliders de volumen para actualizar las ganancias con una suave transición.
    this.optionsSub = combineLatest([
      this.options.generalVolume$,
      this.options.sfxVolume$,
      this.options.musicVolume$,
    ]).subscribe(([g, s, m]) => {
      if (!this.ctx) return;
      const t = this.ctx!.currentTime;
      // Pequeñas rampas para suavizar cambios bruscos.
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.clamp(g), t + 0.05);

      this.sfxGain.gain.cancelScheduledValues(t);
      this.sfxGain.gain.linearRampToValueAtTime(this.clamp(s), t + 0.05);

      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.linearRampToValueAtTime(this.clamp(m), t + 0.05);
    });
  }

  /**
   * Reanuda el `AudioContext` si está en estado "suspendido".
   * Debe ser llamado como respuesta a una interacción del usuario para cumplir con las políticas de autoplay de los navegadores.
   */
  async resumeIfNeeded() {
    // Asegura que el contexto y los nodos estén listos.
    this.ensureCtx();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (e) {
      console.warn('[AudioService] resumeIfNeeded error:', e);
    }
  }

  /**
   * Reproduce un efecto de sonido (SFX) desde una URL.
   * El `AudioBuffer` decodificado se cachea para reproducciones futuras. Los SFX pueden superponerse.
   * @param url La ruta al fichero de audio.
   * @param volumeMultiplier Un multiplicador de volumen local para este SFX (0 a 1).
   * @returns La `AudioBufferSourceNode` creada, para un posible control externo (ej. `stop()`).
   */
  async playSfx(url: string, volumeMultiplier = 1) {
    this.ensureCtx();
    if (!this.ctx) return;

    let buffer = this.sfxBufferCache.get(url);
    if (!buffer) {
      try {
        const resp = await fetch(url, { cache: 'force-cache' });
        const ab = await resp.arrayBuffer();
        buffer = await this.ctx.decodeAudioData(ab);
        this.sfx_buffer_cache_set(url, buffer); // usa helper por compatibilidad con TS estricto
      } catch (e) {
        console.warn('AudioService: fallo al cargar/decodificar SFX', url, e);
        return;
      }
    }

    // Crea una nueva fuente y un nodo de ganancia local para este SFX.
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const localGain = this.ctx.createGain();
    localGain.gain.setValueAtTime(this.clamp(volumeMultiplier), this.ctx.currentTime);

    // Conexión: src -> localGain -> sfxGain -> master -> destination
    src.connect(localGain);
    localGain.connect(this.sfxGain);

    // Inicia la reproducción y limpia los nodos cuando termina.
    src.start();
    src.onended = () => {
      try {
        src.disconnect();
        localGain.disconnect();
      } catch {}
    };

    return src; // devuelve la fuente si quieres controlarla (stop etc.)
  }

  // Helper para evitar error de minificación/compilación si usas strictPropertyInitialization
  private sfx_buffer_cache_set(url: string, buffer: AudioBuffer) {
    this.sfxBufferCache.set(url, buffer);
  }

  // Música (no superponer, crossfade)
  /**
   * Cambia música con crossfade suave.
   * - url: ruta
   * - loop: boolean
   * - crossfadeSec: duración del crossfade en segundos
   */
  async playMusic(url: string, loop = true, crossfadeSec = 1.0) {
    this.ensureCtx();
    if (!this.ctx) return;

    // si ya suena la misma url -> no reiniciar
    if (this.currentMusic && this.currentMusic.url === url) {
      const cur = this.currentMusic;
      if (cur.audio.paused) {
        try {
          await cur.audio.play();
        } catch {}
      }
      return;
    }

    // Crea un nuevo elemento <audio>, su nodo fuente y un gain local para el track.
    const audio = new Audio();
    audio.src = url;
    audio.loop = loop;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    // Marca el elemento para que futuras instancias del servicio puedan encontrarlo y limpiarlo (útil en HMR).
    try {
      audio.setAttribute('data-audioservice', 'true');
      audio.style.display = 'none';
      // Fija el volumen inicial como fallback.
      try {
        audio.volume = this.options.getMusic();
      } catch {}
      // Añade al DOM para poder localizarlo.
      document.body.appendChild(audio);
    } catch {}

    const srcNode = this.ctx.createMediaElementSource(audio);
    const trackGain = this.ctx.createGain();

    // Conexión: srcNode -> trackGain -> musicGain -> master -> destination
    srcNode.connect(trackGain);
    trackGain.connect(this.musicGain);

    // iniciar track con gain 0 y reproducir (si autoplay permitido)
    const now = this.ctx.currentTime;
    trackGain.gain.setValueAtTime(0, now);

    try {
      await audio.play();
    } catch {
      // Autoplay bloqueado: quedará pausado hasta que se llame a resumeIfNeeded().
    }

    // Realiza un fade-in de la nueva pista.
    trackGain.gain.cancelScheduledValues(now);
    trackGain.gain.linearRampToValueAtTime(1.0, now + crossfadeSec);

    // Realiza un fade-out y limpia la pista anterior si existía.
    if (this.currentMusic) {
      const old = this.currentMusic;
      const oldNow = this.ctx.currentTime;
      old.trackGain.gain.cancelScheduledValues(oldNow);
      // Se asegura de partir del valor de ganancia actual.
      old.trackGain.gain.setValueAtTime(old.trackGain.gain.value, oldNow);
      old.trackGain.gain.linearRampToValueAtTime(0, oldNow + crossfadeSec);

      // Limpieza de recursos después del crossfade.
      setTimeout(() => {
        try {
          old.audio.pause();
          old.audio.currentTime = 0;
          // eliminar del DOM si lo añadimos
          if (old.audio.parentElement) old.audio.parentElement.removeChild(old.audio);
        } catch {}
        try {
          old.srcNode.disconnect();
        } catch {}
        try {
          old.trackGain.disconnect();
        } catch {}
      }, (crossfadeSec + 0.05) * 1000);
    }

    // Establece la nueva pista como la actual.
    this.currentMusic = { url, audio, srcNode, trackGain };
  }

  /**
   * Detiene la música actual de forma forzada, con un fade-out opcional.
   * @param fadeOutSec Duración del fade-out en segundos.
   */
  stopMusic(fadeOutSec = 0.5) {
    if (!this.ctx) {
      if (this.currentMusic) {
        try {
          this.currentMusic.audio.pause();
          if (this.currentMusic.audio.parentElement) {
            this.currentMusic.audio.parentElement.removeChild(this.currentMusic.audio);
          }
        } catch {}
        this.currentMusic = null;
      }
      return;
    }
    if (!this.currentMusic) return;

    const now = this.ctx.currentTime;
    const cg = this.currentMusic.trackGain;
    cg.gain.cancelScheduledValues(now);
    cg.gain.setValueAtTime(cg.gain.value, now);
    cg.gain.linearRampToValueAtTime(0, now + fadeOutSec);

    setTimeout(() => {
      try {
        this.currentMusic!.audio.pause();
        this.currentMusic!.audio.currentTime = 0;
        if (this.currentMusic!.audio.parentElement) {
          this.currentMusic!.audio.parentElement.removeChild(this.currentMusic!.audio);
        }
        this.currentMusic!.srcNode.disconnect();
        this.currentMusic!.trackGain.disconnect();
      } catch {}
      this.currentMusic = null;
    }, (fadeOutSec + 0.05) * 1000);
  }

  /**
   * Utilidad para asegurar que un valor numérico se mantenga en el rango de 0 a 1.
   * @param v El valor a limitar.
   * @returns El valor limitado entre 0 y 1.
   */
  private clamp(v: number) {
    return Math.max(0, Math.min(1, v));
  }

  /**
   * Método del ciclo de vida de Angular. Limpia todos los recursos para evitar fugas de memoria.
   */
  ngOnDestroy() {
    this.optionsSub?.unsubscribe();
    try {
      this.sfxBufferCache.clear();
    } catch {}
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }

    // Limpia los elementos de audio actuales.
    if (this.currentMusic) {
      try {
        this.currentMusic.audio.pause();
        if (this.currentMusic.audio.parentElement) {
          this.currentMusic.audio.parentElement.removeChild(this.currentMusic.audio);
        }
      } catch {}
      this.currentMusic = null;
    }

    // Intenta eliminar cualquier otro elemento de audio marcado que haya podido quedar.
    try {
      const left = Array.from(
        document.querySelectorAll('audio[data-audioservice="true"]')
      ) as HTMLAudioElement[];
      for (const a of left) {
        try {
          a.pause();
          if (a.parentElement) a.parentElement.removeChild(a);
        } catch {}
      }
    } catch {}
  }
}
