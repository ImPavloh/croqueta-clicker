import { Injectable, Injector } from '@angular/core';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { SUPABASE } from '../../environments/supabase.config';
import { DebugService } from '@services/debug.service';
import type { LeaderboardEntry, LeaderboardRow } from '@models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _debugService: any | null = null;

  constructor(private injector: Injector) {
    this.supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY, {
      auth: { persistSession: true },
    });
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
    const resp = await this.supabase.auth.signInAnonymously();
    return resp;
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  // Actualiza el nombre del usuario autenticado
  async updateUserName(name: string) {
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operation disabled in debug mode'), data: null } as any;
    } catch {}

    return this.supabase.auth.updateUser({ data: { name } });
  }

  // Verifica si un nombre de usuario ya existe en la tabla de clasificacion
  async isUsernameTaken(name: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('leaderboard')
      .select('user_id')
      .eq('username', name)
      .limit(1);
    if (error) return false; // evitar falsos positivos
    return Array.isArray(data) && data.length > 0;
  }

  // Elimina la fila de la tabla de clasificacion del usuario actual
  async deleteOwnLeaderboardEntry() {
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operation disabled in debug mode') } as any;
    } catch {}
    const sessionResp = await this.supabase.auth.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Not authenticated') } as any;

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

    // creo que esto es innecesario pero bueno, lo dejo de momento
    try {
      const u = this.supabase.auth.getUser();
    } catch {}

    const entry = {
      score,
      meta: meta ?? null,
      ts: Date.now(),
    } as any;

    if (extra && typeof extra === 'object') Object.assign(entry, extra);

    try {
      const s = this.supabase.auth.getUser();
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

    const session = await this.supabase.auth.getUser();
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
    limit = 10
  ): Promise<{ error: PostgrestError | null; data: LeaderboardEntry[] | null }> {
    const { data, error } = await this.supabase
      .from('leaderboard')
      .select('user_id, username, score, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    return {
      error: error as PostgrestError | null,
      data: data as unknown as LeaderboardEntry[] | null,
    };
  }

  // Busca en el leaderboard con paginación (por username)
  async searchLeaderboard(
    query = '',
    page = 0,
    pageSize = 20
  ): Promise<{
    error: PostgrestError | null;
    data: LeaderboardEntry[] | null;
    count: number | null;
  }> {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    let request = this.supabase
      .from('leaderboard')
      .select('user_id, username, score, created_at', { count: 'exact' })
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
    //  bloquear en modo debug
    try {
      if (this.debugService?.isDebugMode)
        return { error: new Error('Operation disabled in debug mode'), data: null } as any;
    } catch {}
    const sessionResp = await this.supabase.auth.getUser();
    const user = sessionResp.data.user;
    if (!user) return { error: new Error('Not authenticated'), data: null } as any;

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

    return {
      error: error as PostgrestError | null,
      data: data as unknown as LeaderboardRow[] | null,
    };
  }

  // Devuelve el cliente supabase
  getClient() {
    return this.supabase;
  }
}
