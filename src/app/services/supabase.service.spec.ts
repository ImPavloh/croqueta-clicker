import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector } from '@angular/core';
import { SupabaseService } from './supabase.service';

describe('SupabaseService (navigator lock resilience)', () => {
  let svc: SupabaseService;

  beforeEach(() => {
    const inj = { get: () => null } as Injector;
    svc = new SupabaseService(inj);
  });

  it('retries getUser once and succeeds when navigator lock error occurs', async () => {
    const getUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('NavigatorLockAcquireTimeoutError: failed to acquire lock'))
      .mockResolvedValueOnce({ data: { user: { id: 'u1' } } });

    const auth: any = {
      getUser: getUserMock,
    };
    (svc as any).supabase = { auth } as any;

    const res = await svc.getUser();
    expect(res).toBeDefined();
    expect(getUserMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(res.data.user?.id).toBe('u1');
  });

  it('signInAnonymously retries and succeeds', async () => {
    const signInAnonymouslyMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('NavigatorLockAcquireTimeoutError: lock busy'))
      .mockResolvedValueOnce({ data: { user: { id: 'anon' } } });

    const auth: any = {
      signInAnonymously: signInAnonymouslyMock,
    };
    (svc as any).supabase = { auth } as any;

    const r = await svc.signInAnonymously();
    expect(r).toBeDefined();
    expect(signInAnonymouslyMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('throws after exhausting retry attempts', async () => {
    const getUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('NavigatorLockAcquireTimeoutError: 1'))
      .mockRejectedValueOnce(new Error('NavigatorLockAcquireTimeoutError: 2'))
      .mockRejectedValueOnce(new Error('NavigatorLockAcquireTimeoutError: 3'));

    const auth: any = {
      getUser: getUserMock,
    };
    (svc as any).supabase = { auth } as any;

    try {
      await svc.getUser();
      throw new Error('expected error to be thrown');
    } catch (e: any) {
      expect(String(e?.message || '')).toContain('NavigatorLockAcquireTimeoutError');
      expect(getUserMock.mock.calls.length).toBe(3);
    }
  });
});
