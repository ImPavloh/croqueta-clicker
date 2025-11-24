import { Injector } from '@angular/core';
import { SupabaseService } from './supabase.service';

describe('SupabaseService (navigator lock resilience)', () => {
  let svc: SupabaseService;

  beforeEach(() => {
    const inj = { get: () => null } as Injector;
    svc = new SupabaseService(inj);
  });

  it('retries getUser once and succeeds when navigator lock error occurs', async () => {
    const auth: any = {
      getUser: jasmine
        .createSpy('getUser')
        .and.returnValues(
          Promise.reject(new Error('NavigatorLockAcquireTimeoutError: failed to acquire lock')),
          Promise.resolve({ data: { user: { id: 'u1' } } })
        ),
    };
    (svc as any).supabase = { auth } as any;

    const res = await svc.getUser();
    expect(res).toBeDefined();
    expect((auth.getUser as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(2);
    expect(res.data.user.id).toBe('u1');
  });

  it('signInAnonymously retries and succeeds', async () => {
    const auth: any = {
      signInAnonymously: jasmine
        .createSpy('signInAnonymously')
        .and.returnValues(
          Promise.reject(new Error('NavigatorLockAcquireTimeoutError: lock busy')),
          Promise.resolve({ data: { user: { id: 'anon' } } })
        ),
    };
    (svc as any).supabase = { auth } as any;

    const r = await svc.signInAnonymously();
    expect(r).toBeDefined();
    expect((auth.signInAnonymously as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(2);
  });

  it('throws after exhausting retry attempts', async () => {
    const auth: any = {
      getUser: jasmine
        .createSpy('getUser')
        .and.returnValues(
          Promise.reject(new Error('NavigatorLockAcquireTimeoutError: 1')),
          Promise.reject(new Error('NavigatorLockAcquireTimeoutError: 2')),
          Promise.reject(new Error('NavigatorLockAcquireTimeoutError: 3'))
        ),
    };
    (svc as any).supabase = { auth } as any;

    try {
      await svc.getUser();
      fail('expected error to be thrown');
    } catch (e: any) {
      expect(String(e?.message || '')).toContain('NavigatorLockAcquireTimeoutError');
      expect((auth.getUser as jasmine.Spy).calls.count()).toBe(3);
    }
  });
});
