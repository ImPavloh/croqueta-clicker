import { Component, computed, inject, signal, OnDestroy, Input, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { SupabaseService } from '@services/supabase.service';
import { DebugService } from '@services/debug.service';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { ModalService } from '@services/modal.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FormsModule, ShortNumberPipe, ButtonComponent],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard {
  @Input() mode: 'panel' | 'full' = 'panel';

  private supabase = inject(SupabaseService);
  private debugService = inject(DebugService);
  private points = inject(PointsService);
  private modalService = inject(ModalService);
  private playerStats = inject(PlayerStats);

  top = signal<Array<any>>([]);
  loading = signal(false);
  message = signal('');
  expanded = signal(true);
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

  private readonly UPDATE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas

  private searchDebounceHandle?: any;
  private readonly SEARCH_DEBOUNCE_MS = 300;
  private readonly CACHE_TTL_MS = 60 * 1000;
  private requestToken = 0;
  private cache = new Map<string, { ts: number; data: any[] | null; count: number | null }>();

  constructor() {
    if (this.mode === 'full') {
      this.searchFullImmediate();
      return;
    } else {
      this.refresh();
    }

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
      await this.refresh();
    };
    window.addEventListener('online', this._onlineHandler);
  }

  async refresh() {
    this.loading.set(true);
    const res = await this.supabase.getTopScores(5);
    if (res.error) {
      this.message.set('Error: ' + res.error.message);
    } else {
      this.top.set(res.data ?? []);
    }
    this.loading.set(false);
  }

  // mejorable xD
  async submitScore() {
    if (this.debugService?.isDebugMode) {
      this.message.set('Score submissions are disabled in DEBUG mode');
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

    // Block in debug mode
    if (this.debugService?.isDebugMode) {
      this.message.set('Disabled while in DEBUG mode');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const current = Number(this.currentLevel());
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.supabase.enqueuePendingScore(current, { source: 'auto' });
      this.message.set('Offline');
      this._refreshPendingCount();
      this.loading.set(false);
      return;
    }

    const res = await this.supabase.submitScore(current);
    if (!res.error) {
      if (current > 0) this._markSubmittedNow(uid);
      this.message.set('Level synced for this interval.');
      await this.refresh();
    } else {
      this.supabase.enqueuePendingScore(current, { source: 'auto', error: res.error?.message });
      this.message.set('Offline');
      this._refreshPendingCount();
    }
    this.loading.set(false);
  }

  private scheduleAt(nextMs: number, job: () => void) {
    this.nextRunMs = Date.now() + nextMs;
    this.scheduleTimerHandle = setTimeout(() => {
      try {
        job();
      } finally {
        this.scheduleAt(this.UPDATE_INTERVAL_MS, job);
      }
    }, nextMs);
  }

  private setupPeriodicSubmitAndRefresh() {
    // do nothing if debug mode is active
    try {
      if (this.debugService?.isDebugMode) return;
    } catch {}
    const u = this.user();
    if (!u) return;

    const uid = u.id as string;

    let nextRun = Date.now();
    try {
      const v = localStorage.getItem(this._lastSubmitKeyForUser(uid));
      if (v) {
        const last = Number(v);
        if (!Number.isNaN(last)) {
          nextRun = last + this.UPDATE_INTERVAL_MS;
        }
      }
    } catch {}

    const now = Date.now();
    const msUntil = Math.max(0, nextRun - now);
    this.nextRunMs = now + msUntil;

    this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    this.countdownTimerHandle = setInterval(() => {
      if (!this.nextRunMs) return;
      this.nextUpdateRemaining.set(Math.max(0, this.nextRunMs - Date.now()));
    }, 1000);

    this.scheduleAt(msUntil, async () => {
      await this._doSubmitIfAllowed();
      await this.refresh();
      if (!this.nextRunMs) this.nextRunMs = Date.now() + this.UPDATE_INTERVAL_MS;
    });
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
  }

  togglePanel() {
    this.expanded.update((v) => !v);
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
        this.message.set(res.error.message || 'Error');
        this.items.set([]);
        this.total.set(null);
      } else {
        this.items.set(res.data ?? []);
        this.total.set(res.count ?? 0);

        this.cache.set(key, { ts: now, data: res.data ?? [], count: res.count ?? 0 });
      }
    } catch (e: any) {
      if (token !== this.requestToken) return;
      this.message.set(String(e));
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
