import { Component, ChangeDetectionStrategy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { OptionsService } from '@services/options.service';

@Component({
    selector: 'app-language-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './language-selection.html',
    styleUrls: ['./language-selection.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectionComponent {
    private transloco = inject(TranslocoService);
    private options = inject(OptionsService);

    @Output() completed = new EventEmitter<void>();

    selectLanguage(lang: string) {
        this.transloco.setActiveLang(lang);
        this.options.setGameItem('language_selected', 'true');
        // También guardar la preferencia de idioma si Transloco no lo hace automáticamente
        // Pero Transloco suele tener su propio mecanismo, aunque aquí estamos forzándolo.
        // Podríamos guardar 'lang' en options si quisiéramos persistirlo manualmente,
        // pero por ahora asumimos que Transloco o la app lo maneja.
        // Sin embargo, para asegurar que la próxima vez cargue bien, tal vez deberíamos persistirlo.
        // Vamos a confiar en que el usuario ya eligió y la app lo recordará o nosotros lo recordamos.
        // De hecho, Transloco suele guardar en localStorage si está configurado.
        // Si no, podríamos necesitar guardarlo nosotros.

        // Guardamos el idioma en options por si acaso
        this.options.setGameItem('lang', lang);

        this.completed.emit();
    }
}
