import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { SupabaseService } from '@services/supabase.service';
import { UsernameService } from '@services/username.service';
import { TranslocoService } from '@jsverse/transloco';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    const modalStub = {
      currentModal: () => null,
      confirmDialog: () => null,
      closeModal: vi.fn(),
      openModal: vi.fn(),
      isOpen: vi.fn(),
      showConfirm: vi.fn(),
      closeConfirm: vi.fn(),
      confirm: vi.fn(),
      cancel: vi.fn(),
    } as any;

    const audioStub = { playSfx: vi.fn() } as any;
    const translocoStub = { translate: (k: string) => k } as any;
    const usernameStub = {
      validate: (name: string) => ({ valid: false, reason: 'format' }),
    } as any;
    const supabaseStub = {
      isUsernameTaken: vi.fn().mockResolvedValue(false),
      updateUserName: vi.fn().mockResolvedValue({ error: null }),
    } as any;

    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [
        { provide: ModalService, useValue: modalStub },
        { provide: AudioService, useValue: audioStub },
        { provide: SupabaseService, useValue: supabaseStub },
        { provide: UsernameService, useValue: usernameStub },
        { provide: TranslocoService, useValue: translocoStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls modalService.closeModal and plays sfx on closeModal()', () => {
    const modalSvc = TestBed.inject(ModalService) as any;
    const audioSvc = TestBed.inject(AudioService) as any;

    component.closeModal();

    expect(modalSvc.closeModal).toHaveBeenCalled();
    expect(audioSvc.playSfx).toHaveBeenCalledWith('/assets/sfx/click02.mp3', 1);
  });

  it('rejects invalid username with message', async () => {
    const usernameSvc = TestBed.inject(UsernameService) as any;
    // force validation to return invalid
    usernameSvc.validate = vi.fn().mockReturnValue({ valid: false, reason: 'length' });

    component.desiredName.set('toolongusernameover16');
    await component.setUsername();
    expect(component.usernameMessage()).toBe('user.invalidUsernameTooLong');
  });

  it('rejects taken usernames', async () => {
    const usernameSvc = TestBed.inject(UsernameService) as any;
    usernameSvc.validate = vi.fn().mockReturnValue({ valid: true });
    const supSvc = TestBed.inject(SupabaseService) as any;
    supSvc.isUsernameTaken = vi.fn().mockResolvedValue(true);

    component.desiredName.set('validname');
    await component.setUsername();
    expect(component.usernameMessage()).toBe('user.usernameTaken');
  });

  it('sets username successfully', async () => {
    const usernameSvc = TestBed.inject(UsernameService) as any;
    usernameSvc.validate = vi.fn().mockReturnValue({ valid: true });
    const supSvc = TestBed.inject(SupabaseService) as any;
    supSvc.isUsernameTaken = vi.fn().mockResolvedValue(false);
    supSvc.updateUserName = vi.fn().mockResolvedValue({ error: null });

    const setMessageSpy = vi.spyOn(component.usernameMessage, 'set');

    component.desiredName.set('validname');
    await component.setUsername();
    expect(setMessageSpy).toHaveBeenCalledWith('user.setUsernameSuccess');
  });
});
