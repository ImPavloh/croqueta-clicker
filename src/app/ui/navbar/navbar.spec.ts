import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      imports: [
        Navbar, // Importa el componente standalone
        // 🚨 CLAVE: Añadir RouterTestingModule para simular las directivas RouterLink
        RouterTestingModule
      ],
      // Si NewsLine o ButtonComponent no son standalone, necesitarías declarations: [NewsLine, ButtonComponent]
      // Pero como están en imports[] en el Navbar, asumimos que son standalone.
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    // El @HostListener en el componente corregido (si lo implementaste)
    // se inicializará aquí.
    fixture.detectChanges();
  });

  it('should create', () => {
    // Verificar creación
    expect(component).toBeTruthy();

    // Aserción de la lógica de detección móvil (opcional pero útil)
    // Asume que la ventana del test no es mayor a 1344px por defecto.
    expect(component.isMobile).toBe(window.innerWidth <= 1344);
  });
});
