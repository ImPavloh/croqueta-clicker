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
      closeModal: jasmine.createSpy('closeModal'),
      openModal: jasmine.createSpy('openModal'),
      isOpen: jasmine.createSpy('isOpen'),
      showConfirm: jasmine.createSpy('showConfirm'),
      closeConfirm: jasmine.createSpy('closeConfirm'),
      confirm: jasmine.createSpy('confirm'),
      cancel: jasmine.createSpy('cancel'),
    } as any;

    const audioStub = { playSfx: jasmine.createSpy('playSfx') } as any;
    const translocoStub = { translate: (k: string) => k } as any;
    const usernameStub = {
      validate: (name: string) => ({ valid: false, reason: 'format' }),
    } as any;
    const supabaseStub = {
      isUsernameTaken: jasmine.createSpy('isUsernameTaken').and.resolveTo(false),
      updateUserName: jasmine.createSpy('updateUserName').and.resolveTo({ error: null }),
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
    usernameSvc.validate = jasmine
      .createSpy('validate')
      .and.returnValue({ valid: false, reason: 'length' });

    component.desiredName.set('toolongusernameover16');
    await component.setUsername();
    expect(component.usernameMessage()).toBe('user.invalidUsernameTooLong');
  });

  it('rejects taken usernames', async () => {
    const usernameSvc = TestBed.inject(UsernameService) as any;
    usernameSvc.validate = jasmine.createSpy('validate').and.returnValue({ valid: true });
    const supSvc = TestBed.inject(SupabaseService) as any;
    supSvc.isUsernameTaken = jasmine.createSpy('isUsernameTaken').and.resolveTo(true);

    component.desiredName.set('validname');
    await component.setUsername();
    expect(component.usernameMessage()).toBe('user.usernameTaken');
  });

  it('sets username successfully', async () => {
    const usernameSvc = TestBed.inject(UsernameService) as any;
    usernameSvc.validate = jasmine.createSpy('validate').and.returnValue({ valid: true });
    const supSvc = TestBed.inject(SupabaseService) as any;
    supSvc.isUsernameTaken = jasmine.createSpy('isUsernameTaken').and.resolveTo(false);
    supSvc.updateUserName = jasmine.createSpy('updateUserName').and.resolveTo({ error: null });

    component.desiredName.set('validname');
    await component.setUsername();
    expect(component.usernameMessage()).toBe('user.setUsernameSuccess');
  });
});
