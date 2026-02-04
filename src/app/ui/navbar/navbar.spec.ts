import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { Navbar } from './navbar';
// 👈 Importación CLAVE para testing de routing
import { RouterTestingModule } from '@angular/router/testing';

// Importa los componentes que usa el template (aunque sean standalone)
import { NewsLine } from '@ui/newsline/newsline';
import { ButtonComponent } from '@ui/button/button';

// Mock simple de componentes externos para evitar fallos de inyección
// (Esto solo es necesario si NewsLine o ButtonComponent tienen dependencias)
// Si son standalone y simples, el TestBed los puede manejar directamente.
// Pero si tienes problemas, declararlos como Stubs es una buena práctica.

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, RouterTestingModule],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    // El @HostListener en el componente corregido (si lo implementaste)
    // se inicializará aquí.
    fixture.detectChanges();
  });

  it('should create', () => {
    // Verificar creación
    expect(component).toBeTruthy();

    // isMobile es un signal por lo que hay que invocarlo
    expect(component.isMobile()).toBe(window.innerWidth <= 1344);
  });
});
