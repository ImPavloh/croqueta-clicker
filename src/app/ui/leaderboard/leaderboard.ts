import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  Input,
  effect,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SupabaseService } from '@services/supabase.service';
import { DebugService } from '@services/debug.service';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FormsModule, ShortNumberPipe, ButtonComponent],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  @Input() mode: 'panel' | 'full' = 'panel';

  private supabase = inject(SupabaseService);
  private debugService = inject(DebugService);
  private points = inject(PointsService);
  private modalService = inject(ModalService);
  private playerStats = inject(PlayerStats);
  private translocoService = inject(TranslocoService);
  private audioService = inject(AudioService);

  top = signal<Array<any>>([]);
  loading = signal(false);
  message = signal('');
  expanded = signal(false);
  nextUpdateRemaining = signal<number>(0);
  user = signal<any | null>(null);
  pendingCount = signal<number>(0);
  currentLevel = toSignal(this.playerStats.level$, { initialValue: 0 });

  query = signal('');
  page = signal(0);
  pageSize = 20;
  items = signal<Array<any>>([]);
  total = signal<number | null>(null);

  totalPages = computed(() => {
    const t = this.total();
    if (!t) return 0;
    return Math.ceil(t / this.pageSize);
  });

  currentPoints = computed(() => this.points.points().toString());

  username = computed(() => {
    const u = this.user();
    if (!u) return null;
    return u.user_metadata?.['name'] || null;
  });

  private nextRunMs: number | null = null;
  private countdownTimerHandle?: any;
  private scheduleTimerHandle?: any;
  private usernamePromptHandle?: any;
  private _onlineHandler?: () => void;

  private readonly UPDATE_INTERVAL_MS = 1 * 60 * 60 * 1000; // 1 hora

  private searchDebounceHandle?: any;
  private readonly SEARCH_DEBOUNCE_MS = 300;
  private readonly CACHE_TTL_MS = 60 * 1000;
  private readonly PANEL_CACHE_TTL_MS = this.UPDATE_INTERVAL_MS;
  private requestToken = 0;
  private cache = new Map<string, { ts: number; data: any[] | null; count: number | null }>();
  private panelCache: { ts: number; data: any[] } | null = null;

  private _nextRunKeyPrefix = 'leaderboard:next_run:';

  // handler for closing when tapping outside on mobile devices
  private _outsideTouchHandler?: (ev: Event) => void;
  private _isTouchDevice =
    (typeof navigator !== 'undefined' && ((navigator as any).maxTouchPoints ?? 0) > 0) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    if (this.mode === 'full') {
      this.searchFullImmediate();
      this.checkAndPromptUsername();
    }
  }

  constructor() {
    if (this.mode === 'full') {
      return;
    }

    this.refresh();

    // verificar username después del splash
    effect(() => {
      if (this.modalService.shouldCheckUsername()) {
        this.checkAndPromptUsername();
        this.modalService.shouldCheckUsername.set(false);
      }
    });

    // ver cambios de auth (login/logout)
    this.supabase.getClient().auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      this.user.set(u);
      if (u && !this.nextRunMs) this.setupPeriodicSubmitAndRefresh();
    });

    // asegurar que exista una sesion anon y establecer el usuario localmente
    this.supabase.getUser().then(async (r) => {
      const u = r.data.user ?? null;
      if (!u) {
        // en vez de crear la sesión aquí que se haga después del splash
      } else {
        this.user.set(u);
      }

      // configurar envios refrescos
      if (this.user()) this.setupPeriodicSubmitAndRefresh();

      // actualizar contador
      this._refreshPendingCount();
    });

    // actualizar UI cuando vuelva a estar online y asegurar que los contadores se actualizan
    this._onlineHandler = async () => {
      try {
        // do not process pending/upload while in debug mode
        if (!this.debugService?.isDebugMode) await this.supabase.processPendingScores();
      } catch {}
      this._refreshPendingCount();
      // usar caché si está disponible al volver online
      await this.refresh(false);
    };
    window.addEventListener('online', this._onlineHandler);

    // persistir el inicio del ciclo cuando el usuario sube de nivel 0 -> >0
    // así si recarga la página no se reinicia el contador
    effect(() => {
      try {
        // no hacer nada en debug mode
        if (this.debugService?.isDebugMode) return;
      } catch {}

      const lvl = this.currentLevel();
      const u = this.user();
      if (!u) return;

      // si el nivel es 0 no hacemos nada (mejorable)
      if (!lvl || lvl <= 0) return;

      // si no existe last submit para este usuario usar el momento actual
      try {
        const key = this._lastSubmitKeyForUser(u.id);
        const existing = localStorage.getItem(key);
        if (!existing) {
          // marcar ahora como inicio del ciclo, no se enviará score aquí
          localStorage.setItem(key, String(Date.now()));

          // reconfigurar timers (por si se cargó antes de subir de nivel)
          this.setupPeriodicSubmitAndRefresh();
        }
      } catch {}
    });

    // close leaderboard when tapping outside on touch devices (mobile)
    effect(() => {
      // only relevant for the small panel mode and on touch devices
      if (this.mode !== 'panel' || !this._isTouchDevice) return;

      // if expanded attach a global touchstart listener that will collapse
      if (this.expanded()) {
        // create handler
        this._outsideTouchHandler = (ev: Event) => {
          try {
            const el = this.elRef?.nativeElement as HTMLElement | null;
            if (!el) return;
            // if the event happened inside the component, ignore
            const path = (ev as any).composedPath?.() as EventTarget[] | undefined;
            if (path && path.includes(el)) return;
            if (el.contains(ev.target as Node)) return;

            // otherwise collapse
            this.expanded.set(false);
          } catch {}
        };

        document.addEventListener('touchstart', this._outsideTouchHandler as EventListener, {
          passive: true,
        });
      } else {
        // remove existing handler when not expanded
        if (this._outsideTouchHandler) {
          document.removeEventListener('touchstart', this._outsideTouchHandler as EventListener);
          this._outsideTouchHandler = undefined;
        }
      }
    });
  }

  async refresh(forceRefresh = false) {
    // verificar caché si no es forzado
    if (!forceRefresh && this.panelCache) {
      const now = Date.now();
      if (now - this.panelCache.ts < this.PANEL_CACHE_TTL_MS) {
        // caché válido, usar datos cacheados
        this.top.set(this.panelCache.data);
        return;
      }
    }

    this.loading.set(true);
    const res = await this.supabase.getTopScores(3);
    if (res.error) {
      this.message.set(
        this.translocoService.translate('leaderboard.errorWithDetail', {
          message: res.error?.message ?? '',
        })
      );
    } else {
      const data = res.data ?? [];
      this.top.set(data);
      // guardar en caché
      this.panelCache = { ts: Date.now(), data };
    }
    this.loading.set(false);
  }

  // mejorable xD
  async submitScore() {
    if (this.debugService?.isDebugMode) {
      this.message.set(this.translocoService.translate('leaderboard.scoreSubmissionsDisabled'));
      return;
    }

    await this._doSubmitIfAllowed();
  }

  private _lastSubmitKeyForUser(userId: string) {
    return `leaderboard:last_submit:${userId}`;
  }

  private _isSubmittedWithinWindow(userId: string): boolean {
    try {
      const key = this._lastSubmitKeyForUser(userId);
      const val = localStorage.getItem(key);
      if (!val) return false;
      const ts = Number(val);
      if (Number.isNaN(ts)) return false;
      return Date.now() - ts < this.UPDATE_INTERVAL_MS;
    } catch {
      return false;
    }
  }

  private _markSubmittedNow(userId: string) {
    try {
      const key = this._lastSubmitKeyForUser(userId);
      localStorage.setItem(key, String(Date.now()));
      this.nextRunMs = Date.now() + this.UPDATE_INTERVAL_MS;
      this.nextUpdateRemaining.set(this.nextRunMs - Date.now());
      try {
        localStorage.setItem(this._nextRunKeyForUser(userId), String(this.nextRunMs));
      } catch {}
    } catch {
      // rezar si falla
    }
  }

  private async _doSubmitIfAllowed() {
    const u = this.user();
    if (!u) return;

    // reinicialización
    if (this.countdownTimerHandle) {
      clearInterval(this.countdownTimerHandle);
      this.countdownTimerHandle = undefined;
    }
    if (this.scheduleTimerHandle) {
      clearTimeout(this.scheduleTimerHandle);
      this.scheduleTimerHandle = undefined;
    }
    const uid = u.id as string;

    // solo una vez por intervalo por usuario
    if (this._isSubmittedWithinWindow(uid)) return;

    if (!this.username()) {
      this.openUsernameModal();
      return;
    }

    // block en debug mode
    if (this.debugService?.isDebugMode) {
      this.message.set(this.translocoService.translate('leaderboard.disabledDebug'));
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const current = Number(this.currentLevel());
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.supabase.enqueuePendingScore(current, { source: 'auto' });
      this.message.set(this.translocoService.translate('leaderboard.offline'));
      this._refreshPendingCount();
      this.loading.set(false);
      return;
    }

    // no subir si el nivel es 0 (usuario recién empezado)
    if (current === 0) {
      this.loading.set(false);
      return;
    }

    const res = await this.supabase.submitScore(current);
    if (!res.error) {
      this._markSubmittedNow(uid);
      this.message.set(this.translocoService.translate('leaderboard.levelSynced'));
      // invalidar caché y forzar refresh después de sincronización exitosa
      this.panelCache = null;
      await this.refresh(true);
    } else {
      this.supabase.enqueuePendingScore(current, { source: 'auto', error: res.error?.message });
      this.message.set(this.translocoService.translate('leaderboard.offline'));
      this._refreshPendingCount();
    }
    this.loading.set(false);
  }

  private scheduleAt(nextMs: number, job: () => void) {
    this.nextRunMs = Date.now() + nextMs;
    try {
      const u = this.user();
      if (u) localStorage.setItem(this._nextRunKeyForUser(u.id), String(this.nextRunMs));
    } catch {}

    this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    if (this.countdownTimerHandle) clearInterval(this.countdownTimerHandle);
    this.countdownTimerHandle = setInterval(() => {
      if (!this.nextRunMs) return;
      this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    }, 1000);

    this.scheduleTimerHandle = setTimeout(() => {
      try {
        job();
      } finally {
        this.scheduleAt(this.UPDATE_INTERVAL_MS, job);
      }
    }, nextMs);
  }

  private setupPeriodicSubmitAndRefresh() {
    // limpiar timers previos para evitar duplicados
    if (this.countdownTimerHandle) {
      clearInterval(this.countdownTimerHandle);
      this.countdownTimerHandle = undefined;
    }
    if (this.scheduleTimerHandle) {
      clearTimeout(this.scheduleTimerHandle);
      this.scheduleTimerHandle = undefined;
    }
    try {
      if (this.debugService?.isDebugMode) {
        this.nextUpdateRemaining.set(0);
        return;
      }
    } catch {}
    const u = this.user();
    if (!u) {
      // sin usuario, mostrar tiempo completo del intervalo
      this.nextRunMs = Date.now() + this.UPDATE_INTERVAL_MS;
      this.nextUpdateRemaining.set(this.UPDATE_INTERVAL_MS);
      return;
    }

    const uid = u.id as string;

    let nextRun = Date.now();
    let isFirstTime = true;
    try {
      const nrKey = this._nextRunKeyForUser(uid);
      const persistedNext = localStorage.getItem(nrKey);
      if (persistedNext) {
        const p = Number(persistedNext);
        if (!Number.isNaN(p)) {
          nextRun = p;
          isFirstTime = false;
        }
      }

      const v = localStorage.getItem(this._lastSubmitKeyForUser(uid));
      if (v) {
        const last = Number(v);
        if (!Number.isNaN(last)) {
          if (isFirstTime) nextRun = last + this.UPDATE_INTERVAL_MS;
          isFirstTime = false;
        }
      }
    } catch {}

    const now = Date.now();
    // si es primera vez establecer el intervalo completo
    const msUntil = isFirstTime ? this.UPDATE_INTERVAL_MS : Math.max(0, nextRun - now);
    this.nextRunMs = now + msUntil;

    this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    this.countdownTimerHandle = setInterval(() => {
      if (!this.nextRunMs) return;
      this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    }, 1000);

    this.scheduleAt(msUntil, async () => {
      await this._doSubmitIfAllowed();
      // forzar refresh después de sincronización programada
      await this.refresh(true);
      // limpiar persisted next run because submit updated last_submit
      try {
        const u2 = this.user();
        if (u2) localStorage.removeItem(this._nextRunKeyForUser(u2.id));
      } catch {}
      if (!this.nextRunMs) this.nextRunMs = Date.now() + this.UPDATE_INTERVAL_MS;
    });
  }

  private _nextRunKeyForUser(userId: string) {
    return `${this._nextRunKeyPrefix}${userId}`;
  }

  private _refreshPendingCount() {
    try {
      if (this.debugService?.isDebugMode) {
        this.pendingCount.set(0);
        return;
      }
    } catch {}
    try {
      const list = this.supabase.getPendingScores();
      this.pendingCount.set(Array.isArray(list) ? list.length : 0);
    } catch {
      this.pendingCount.set(0);
    }
  }

  formatMs(ms: number) {
    if (!ms || ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  ngOnDestroy(): void {
    if (this.countdownTimerHandle) clearInterval(this.countdownTimerHandle);
    if (this.scheduleTimerHandle) clearTimeout(this.scheduleTimerHandle);
    if (this.usernamePromptHandle) clearTimeout(this.usernamePromptHandle);
    try {
      if (this._onlineHandler) window.removeEventListener('online', this._onlineHandler);
    } catch {}
    try {
      if (this._outsideTouchHandler) {
        document.removeEventListener('touchstart', this._outsideTouchHandler as EventListener);
        this._outsideTouchHandler = undefined;
      }
    } catch {}
  }

  togglePanel() {
    this.expanded.update((v) => !v);
    try {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } catch {}
  }

  openUsernameModal() {
    this.modalService.openModal('username');
  }

  async checkAndPromptUsername() {
    // Esperar a que se establezca la sesión del usuario
    const result = await this.supabase.getUser();
    if (result?.data?.user) {
      this.user.set(result.data.user);
      if (!this.username()) {
        this.openUsernameModal();
      }
      if (this.user()) this.setupPeriodicSubmitAndRefresh();
    }
  }

  openFullLeaderboard() {
    this.modalService.openModal('leaderboard');
  }

  scheduleSearchFull() {
    this.page.set(0);
    if (this.searchDebounceHandle) clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.searchDebounceHandle = undefined;
      this.searchFullImmediate();
    }, this.SEARCH_DEBOUNCE_MS);
  }

  async searchFullImmediate() {
    const q = (this.query() ?? '').trim();
    try {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } catch {}
    const p = this.page();

    const key = `${q}:${p}`;
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && now - cached.ts < this.CACHE_TTL_MS) {
      this.items.set(cached.data ?? []);
      this.total.set(cached.count ?? 0);
      this.message.set('');
      return;
    }

    const token = ++this.requestToken;

    this.loading.set(true);
    this.message.set('');
    try {
      const res = await this.supabase.searchLeaderboard(q, p, this.pageSize);

      if (token !== this.requestToken) return;

      if (res.error) {
        this.message.set(
          this.translocoService.translate('leaderboard.errorWithDetail', {
            message: res.error?.message ?? '',
          })
        );
        this.items.set([]);
        this.total.set(null);
      } else {
        this.items.set(res.data ?? []);
        this.total.set(res.count ?? 0);

        this.cache.set(key, { ts: now, data: res.data ?? [], count: res.count ?? 0 });
      }
    } catch (e: any) {
      if (token !== this.requestToken) return;
      this.message.set(
        this.translocoService.translate('leaderboard.errorWithDetail', { message: String(e) })
      );
      this.items.set([]);
      this.total.set(null);
    } finally {
      if (token === this.requestToken) this.loading.set(false);
    }
  }

  prevPage() {
    const p = this.page();
    if (p <= 0) return;
    this.page.set(p - 1);
    this.searchFullImmediate();
  }

  nextPage() {
    const p = this.page();
    if (this.totalPages() <= p + 1) return;
    this.page.set(p + 1);
    this.searchFullImmediate();
  }
}
