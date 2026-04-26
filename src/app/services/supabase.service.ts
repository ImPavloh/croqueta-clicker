import { Injectable, Injector } from '@angular/core';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { SUPABASE } from '../../environments/supabase.config';
import { DebugService } from '@services/debug.service';
import { UsernameService } from './username.service';
import type { LeaderboardEntry, LeaderboardMode, LeaderboardRow } from '@models/leaderboard.model';
import type { DailyContractsState } from '@models/daily-contract.model';
import type { LeaderboardStats, LeaderboardStatsBucket } from '@models/report.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _debugService: any | null = null;

  constructor(private injector: Injector) {
    this.supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY, {
      auth: {
        persistSession: true,
        storageKey: 'sb-cosvywlgllqpnqdrphtt-auth-token',
        // Desactiva navigator lock para evitar el error
        // "Acquiring an exclusive Navigator LockManager lock immediately failed"
        // https://github.com/supabase/supabase-js/issues/936
        lock: (_name: string, _timeout: number, fn: () => Promise<any>) => fn(),
      },
    });
  }

  private _usernameService: UsernameService | null = null;

  private get usernameService(): UsernameService | null {
    if (this._usernameService === null) {
      try {
        this._usernameService = this.injector.get(UsernameService, null as any);
      } catch {
        this._usernameService = null;
      }
    }
    return this._usernameService;
  }

  private get debugService(): DebugService | null {
    if (this._debugService === null) {
      try {
        this._debugService = this.injector.get(DebugService, null as any);
      } catch {
        this._debugService = null;
      }
    }
    return this._debugService;
  }

  // Crea una sesión anónima
  async signInAnonymously() {
    return this.supabase.auth.signInAnonymously();
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  // Actualiza el nombre del usuario autenticado
  async updateUserName(name: string) {
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operación deshabilitada en modo DEBUG'), data: null } as any;
    } catch {}

    try {
      if (this.usernameService && !this.usernameService.validate(name).valid)
        return { error: new Error('Invalid username'), data: null } as any;
    } catch {}

    return this.supabase.auth.updateUser({ data: { name } });
  }

  // Verifica si un nombre de usuario ya existe en la tabla de clasificacion
  async isUsernameTaken(name: string): Promise<boolean> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }

    const sessionResp = await this.getUser();
    const currentUserId = sessionResp.data.user?.id ?? null;

    const [levelResult, contractsResult] = await Promise.all([
      this.supabase.from('leaderboard').select('user_id').eq('username', trimmedName).limit(1),
      this.supabase
        .from('daily_contract_profiles')
        .select('user_id')
        .eq('username', trimmedName)
        .limit(1),
    ]);

    const matchesOtherUser = (
      data: Array<{
        user_id: string;
      }> | null,
    ): boolean => {
      if (!Array.isArray(data) || data.length === 0) {
        return false;
      }

      return data.some((entry) => entry.user_id !== currentUserId);
    };

    if (levelResult.error && contractsResult.error) {
      return false;
    }

    return (
      matchesOtherUser(levelResult.data as Array<{ user_id: string }> | null) ||
      matchesOtherUser(contractsResult.data as Array<{ user_id: string }> | null)
    );
  }

  // Elimina la fila de la tabla de clasificacion del usuario actual
  async deleteOwnLeaderboardEntry() {
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operación deshabilitada en modo DEBUG') } as any;
    } catch {}
    const sessionResp = await this.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Usuario no autenticado') } as any;

    const { data, error } = await this.supabase.from('leaderboard').delete().eq('user_id', user.id);
    return { data, error } as { data: any; error: PostgrestError | null };
  }

  // Cola offline en local storage
  private PENDING_KEY = 'leaderboard:pending';

  private _readPending(): Array<any> {
    try {
      const raw = localStorage.getItem(this.PENDING_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Array<any>;
    } catch {
      return [];
    }
  }

  private _writePending(list: Array<any>) {
    try {
      localStorage.setItem(this.PENDING_KEY, JSON.stringify(list));
    } catch {
      // ignorar
    }
  }

  // Guarda o actualiza un score pendiente en localStorage.
  enqueuePendingScore(score: number, meta?: any, extra?: any) {
    // en debug mode no se hace nada
    try {
      if (this.debugService?.isDebugMode) return;
    } catch {}
    const current = this._readPending();

    const entry = {
      score,
      meta: meta ?? null,
      ts: Date.now(),
    } as any;

    if (extra && typeof extra === 'object') Object.assign(entry, extra);

    try {
      const s = this.getUser();
      s.then((res) => {
        if (res?.data?.user) {
          entry.user_id = res.data.user.id;
          entry.username = res.data.user.user_metadata?.['name'] ?? null;
          const idx = current.findIndex((c) => c.user_id === entry.user_id);
          if (idx >= 0) {
            const existing = current[idx];
            if ((entry.score ?? 0) > (existing.score ?? 0))
              current[idx] = { ...existing, ...entry };
          } else {
            current.push(entry);
          }
          this._writePending(current);
        } else {
          current.push(entry);
          this._writePending(current);
        }
      });
    } catch (e) {
      current.push(entry);
      this._writePending(current);
    }
  }

  // Lee todas las entradas pendientes
  getPendingScores(): Array<any> {
    return this._readPending();
  }

  // Cuenta pendientes para un user_id o total
  countPendingForUser(userId?: string) {
    const list = this._readPending();
    if (!userId) return list.length;
    return list.filter((r) => r.user_id === userId).length;
  }

  // Procesa las puntuaciones pendientes del usuario autenticado
  async processPendingScores(): Promise<{ processed: number; failed: number }> {
    // en debug mode no se hace nada
    try {
      if (this.debugService?.isDebugMode) return { processed: 0, failed: 0 };
    } catch {}
    const list = this._readPending();
    if (!list || list.length === 0) return { processed: 0, failed: 0 };

    const session = await this.getUser();
    const user = session.data.user;
    if (!user) return { processed: 0, failed: list.length };

    const userId = user.id;
    let processed = 0;
    let failed = 0;

    const remaining: Array<any> = [];
    for (const e of list) {
      if (e.user_id && e.user_id !== userId) {
        remaining.push(e);
        continue;
      }

      try {
        if (e.usernameChange) {
          const nameResp = await this.updateUserName(e.usernameChange);
          if (nameResp?.error) {
            const msg = String(nameResp.error?.message ?? '').toLowerCase();
            if (msg.includes('already') || msg.includes('unique')) {
              failed++;
              continue;
            } else {
              remaining.push(e);
              failed++;
              continue;
            }
          }
        }

        const resp = await this.submitScore(e.score ?? 0, e.meta ?? null);
        if (!resp.error) {
          processed++;
        } else {
          remaining.push(e);
          failed++;
        }
      } catch (err) {
        remaining.push(e);
        failed++;
      }
    }

    this._writePending(remaining);
    return { processed, failed };
  }

  // Obtiene las n mejores puntuaciones ordenadas descendentemente
  async getTopScores(
    limit = 10,
    mode: LeaderboardMode = 'level',
  ): Promise<{ error: PostgrestError | null; data: LeaderboardEntry[] | null }> {
    const table = this.getLeaderboardTable(mode);
    const { data, error } = await this.supabase
      .from(table)
      .select('user_id, username, score, meta, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    return {
      error: error as PostgrestError | null,
      data: data as unknown as LeaderboardEntry[] | null,
    };
  }

  // Obtiene estadisticas agregadas del leaderboard
  async getLeaderboardStats(mode: LeaderboardMode = 'level'): Promise<{
    error: PostgrestError | null;
    data: LeaderboardStats | null;
  }> {
    const table = this.getLeaderboardTable(mode);
    const totalResp = await this.supabase
      .from(table)
      .select('user_id', { count: 'exact', head: true });

    if (totalResp.error) {
      return { error: totalResp.error as PostgrestError, data: null };
    }

    const aggResp = await this.supabase.from(table).select('avg:score, max:score, min:score');

    if (aggResp.error) {
      return { error: aggResp.error as PostgrestError, data: null };
    }

    const row = (aggResp.data ?? [])[0] as any;
    const avgLevel = Number(row?.avg ?? 0) || 0;
    const maxLevel = Number(row?.max ?? 0) || 0;
    const minLevel = Number(row?.min ?? 0) || 0;

    let lastUpdated: string | null = null;

    if (mode === 'contracts') {
      const lastUpdateResp = await this.supabase
        .from(table)
        .select('current_state_date_key, created_at')
        .order('current_state_date_key', { ascending: false })
        .limit(1);

      const latestRow = (lastUpdateResp.data ?? [])[0] as
        | {
            current_state_date_key?: string | null;
            created_at?: string | null;
          }
        | undefined;

      lastUpdated = latestRow?.current_state_date_key ?? latestRow?.created_at ?? null;
    } else {
      const lastUpdateResp = await this.supabase
        .from(table)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      lastUpdated =
        ((lastUpdateResp.data ?? [])[0] as { updated_at?: string | null } | undefined)
          ?.updated_at ?? null;
    }

    const buckets = await this._getLeaderboardBuckets(mode);

    return {
      error: null,
      data: {
        totalPlayers: totalResp.count ?? 0,
        avgLevel: Math.round(avgLevel * 10) / 10,
        maxLevel,
        minLevel,
        lastUpdated,
        buckets,
      },
    };
  }

  private async _countLeaderboardRange(
    mode: LeaderboardMode,
    min: number,
    max?: number,
  ): Promise<number> {
    let query = this.supabase
      .from(this.getLeaderboardTable(mode))
      .select('user_id', { count: 'exact', head: true })
      .gte('score', min);

    if (typeof max === 'number') {
      query = query.lt('score', max);
    }

    const resp = await query;
    if (resp.error) return 0;
    return resp.count ?? 0;
  }

  private async _getLeaderboardBuckets(mode: LeaderboardMode): Promise<LeaderboardStatsBucket[]> {
    const ranges =
      mode === 'contracts'
        ? [
            { label: '0-4', min: 0, max: 5 },
            { label: '5-9', min: 5, max: 10 },
            { label: '10-24', min: 10, max: 25 },
            { label: '25-49', min: 25, max: 50 },
            { label: '50-99', min: 50, max: 100 },
            { label: '100+', min: 100 },
          ]
        : [
            { label: '0-9', min: 0, max: 10 },
            { label: '10-24', min: 10, max: 25 },
            { label: '25-49', min: 25, max: 50 },
            { label: '50-99', min: 50, max: 100 },
            { label: '100-199', min: 100, max: 200 },
            { label: '200+', min: 200 },
          ];

    const buckets: LeaderboardStatsBucket[] = [];
    for (const r of ranges) {
      const count = await this._countLeaderboardRange(mode, r.min, r.max);
      buckets.push({ label: r.label, count });
    }

    return buckets;
  }

  // Busca en el leaderboard con paginación (por username)
  async searchLeaderboard(
    query = '',
    page = 0,
    pageSize = 20,
    mode: LeaderboardMode = 'level',
  ): Promise<{
    error: PostgrestError | null;
    data: LeaderboardEntry[] | null;
    count: number | null;
  }> {
    const start = page * pageSize;
    const end = start + pageSize - 1;
    const table = this.getLeaderboardTable(mode);

    let request = this.supabase
      .from(table)
      .select('user_id, username, score, meta, created_at', { count: 'exact' })
      .order('score', { ascending: false })
      .range(start, end);

    if (query && query.trim().length > 0) request = request.ilike('username', `%${query}%`);

    const { data, error, count } = await request;
    return {
      error: error as PostgrestError | null,
      data: data as unknown as LeaderboardEntry[] | null,
      count: count as number | null,
    };
  }

  // Envía una nueva puntuacion (requiere usuario autenticado, en este caso anonimo)
  async submitScore(score: number, meta?: any) {
    // bloquear en modo debug
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operación deshabilitada en modo DEBUG'), data: null } as any;
    } catch {}
    const sessionResp = await this.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Usuario no autenticado'), data: null } as any;

    const payload: LeaderboardRow = {
      user_id: user.id,
      username: user.user_metadata?.['name'] ?? undefined,
      score,
      meta: meta ?? null,
    };

    const { data, error } = await this.supabase
      .from('leaderboard')
      .upsert(payload, { onConflict: 'user_id' })
      .select();

    if (error) {
      if ((error as any).status === 403) {
        (error as any).message = (error as any).message
          ? `${(error as any).message} (rejected by RLS/policies)`
          : 'Request rejected by RLS/policies';
      }

      return {
        error: error as PostgrestError | null,
        data: data as unknown as LeaderboardRow[] | null,
      };
    }

    return { error: null, data: data as unknown as LeaderboardRow[] | null };
  }

  async getDailyContractsState(): Promise<{
    error: PostgrestError | Error | null;
    data: DailyContractsState | null;
  }> {
    const sessionResp = await this.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Usuario no autenticado'), data: null };

    const { data, error } = await this.supabase
      .from('daily_contract_profiles')
      .select('current_state')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return { error: error as PostgrestError, data: null };
    }

    return {
      error: null,
      data: (data?.current_state ?? null) as DailyContractsState | null,
    };
  }

  async upsertDailyContractsState(state: DailyContractsState): Promise<{
    error: PostgrestError | Error | null;
    data: LeaderboardRow[] | null;
  }> {
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operación deshabilitada en modo DEBUG'), data: null } as any;
    } catch {}

    const sessionResp = await this.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Usuario no autenticado'), data: null };

    const payload = {
      user_id: user.id,
      username: user.user_metadata?.['name'] ?? undefined,
      score: state.stats.lifetimeClaimedContracts,
      current_streak: state.stats.currentStreak,
      best_streak: state.stats.bestStreak,
      weekly_completed_days: state.stats.weeklyCompletedDays,
      week_key: state.stats.weekKey,
      last_completed_date_key: state.stats.lastCompletedDateKey,
      lifetime_claimed_contracts: state.stats.lifetimeClaimedContracts,
      lifetime_completed_days: state.stats.lifetimeCompletedDays,
      lifetime_bonus_claims: state.stats.lifetimeBonusClaims,
      current_state: state,
      current_state_date_key: state.dateKey,
      meta: {
        currentStreak: state.stats.currentStreak,
        bestStreak: state.stats.bestStreak,
        completedDays: state.stats.lifetimeCompletedDays,
        bonusClaims: state.stats.lifetimeBonusClaims,
        weeklyCompletedDays: state.stats.weeklyCompletedDays,
      },
    };

    const { data, error } = await this.supabase
      .from('daily_contract_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('user_id, username, score, meta, created_at');

    if (error) {
      return {
        error: error as PostgrestError,
        data: null,
      };
    }

    return { error: null, data: data as unknown as LeaderboardRow[] | null };
  }

  private getLeaderboardTable(mode: LeaderboardMode): string {
    return mode === 'contracts' ? 'daily_contract_profiles' : 'leaderboard';
  }

  // Devuelve el cliente supabase
  getClient() {
    return this.supabase;
  }
}
