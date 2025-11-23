import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';

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

    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [
        { provide: ModalService, useValue: modalStub },
        { provide: AudioService, useValue: audioStub },
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
});
