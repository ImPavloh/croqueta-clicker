// src/app/services/audio.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { OptionsService } from './options.service';
import { combineLatest, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService implements OnDestroy {
  private ctx: AudioContext | null = null;

  // Gains
  private masterGain!: GainNode;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;

  private optionsSub?: Subscription;

  // Música actual (para crossfade)
  private currentMusic: {
    url: string;
    audio: HTMLAudioElement;
    srcNode: MediaElementAudioSourceNode;
    trackGain: GainNode;
  } | null = null;

  // Cache para buffers SFX
  private sfxBufferCache = new Map<string, AudioBuffer>();

  constructor(private options: OptionsService) {
    // lazy init: no crear AudioContext hasta que sea necesario (por política de user gesture)
  }

  // --- Inicialización lazy del AudioContext y nodos ---
  private ensureCtx() {
    if (this.ctx) return;

    // Limpieza: si hay audio elements creados por instancias previas del servicio, pararlos.
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
      // no crítico
    }

    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    if (this.ctx == null) return;
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    // chain: sfxGain -> masterGain -> destination; musicGain -> masterGain -> destination
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Inicializar gains con valores actuales de options (0..1)
    const now = this.ctx.currentTime;
    // usar setValueAtTime para evitar valores por defecto raros
    this.masterGain.gain.setValueAtTime(this.options.getGeneral(), now);
    this.sfxGain.gain.setValueAtTime(this.options.getSfx(), now);
    this.musicGain.gain.setValueAtTime(this.options.getMusic(), now);

    // Suscribirse a cambios de sliders (observables 0..1 que devuelves en OptionsService)
    this.optionsSub = combineLatest([
      this.options.generalVolume$,
      this.options.sfxVolume$,
      this.options.musicVolume$,
    ]).subscribe(([g, s, m]) => {
      if (!this.ctx) return;
      const t = this.ctx!.currentTime;
      // rampillos cortos para suavizar cambios bruscos
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.clamp(g), t + 0.05);

      this.sfxGain.gain.cancelScheduledValues(t);
      this.sfxGain.gain.linearRampToValueAtTime(this.clamp(s), t + 0.05);

      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.linearRampToValueAtTime(this.clamp(m), t + 0.05);
    });
  }

  // --- Resume (usar en primer gesto del usuario) ---
  // resumeIfNeeded mejorado
  async resumeIfNeeded() {
    // Asegurar contexto y nodos
    this.ensureCtx();
    if (!this.ctx) return;
    try {
      // Mostrar estado para debug
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (e) {
      console.warn('[AudioService] resumeIfNeeded error:', e);
    }
  }

  // ---------------- SFX (pueden superponerse) ----------------
  /**
   * Reproduce un SFX desde URL. Se decodifica y cachea AudioBuffer.
   * volumeMultiplier es relativo (0..1) y se multiplica por el gain SFX global y master.
   */
  async playSfx(url: string, volumeMultiplier = 1) {
    this.ensureCtx();
    if (!this.ctx) return;

    // obtener o decodificar buffer
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

    // crear fuente y gain local
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const localGain = this.ctx.createGain();
    localGain.gain.setValueAtTime(this.clamp(volumeMultiplier), this.ctx.currentTime);

    // conectar: src -> localGain -> sfxGain -> master -> destination
    src.connect(localGain);
    localGain.connect(this.sfxGain);

    // empezar y cleanup al terminar
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

  // ---------------- Música (no superponer, crossfade) ----------------
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

    // crear nuevo elemento audio + nodo y gain local del track
    const audio = new Audio();
    audio.src = url;
    audio.loop = loop;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    // marcar elemento para que instancias futuras lo encuentren y limpien (HMR / recompilaciones)
    try {
      audio.setAttribute('data-audioservice', 'true');
      audio.style.display = 'none';
      // fijar volumen inicial según options como fallback (0..1)
      try {
        audio.volume = this.options.getMusic();
      } catch {}
      // añadir al DOM para poder localizarlo/limpiarlo si hay HMR
      document.body.appendChild(audio);
    } catch {}

    const srcNode = this.ctx.createMediaElementSource(audio);
    const trackGain = this.ctx.createGain();

    // conectar: srcNode -> trackGain -> musicGain -> master -> destination
    srcNode.connect(trackGain);
    trackGain.connect(this.musicGain);

    // iniciar track con gain 0 y reproducir (si autoplay permitido)
    const now = this.ctx.currentTime;
    trackGain.gain.setValueAtTime(0, now);

    try {
      await audio.play();
    } catch {
      // autoplay bloqueado: quedará pausado hasta que llames resumeIfNeeded() en gesto de usuario
    }

    // fade-in de la nueva pista
    trackGain.gain.cancelScheduledValues(now);
    trackGain.gain.linearRampToValueAtTime(1.0, now + crossfadeSec);

    // fade-out y cleanup de la anterior si existe
    if (this.currentMusic) {
      const old = this.currentMusic;
      const oldNow = this.ctx.currentTime;
      old.trackGain.gain.cancelScheduledValues(oldNow);
      // asegurarse de partir del valor actual
      old.trackGain.gain.setValueAtTime(old.trackGain.gain.value, oldNow);
      old.trackGain.gain.linearRampToValueAtTime(0, oldNow + crossfadeSec);

      // cleanup tras crossfade
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

    // establecer como actual
    this.currentMusic = { url, audio, srcNode, trackGain };
  }

  /**
   * Forzar parar la música actual (con fade opcional)
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

  // ---------------- Utilities / cleanup ----------------
  private clamp(v: number) {
    return Math.max(0, Math.min(1, v));
  }

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

    // cleanup audio elements actuales
    if (this.currentMusic) {
      try {
        this.currentMusic.audio.pause();
        if (this.currentMusic.audio.parentElement) {
          this.currentMusic.audio.parentElement.removeChild(this.currentMusic.audio);
        }
      } catch {}
      this.currentMusic = null;
    }

    // también intentar eliminar cualquier audio marcado (por ejemplo, si alguna quedó)
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
