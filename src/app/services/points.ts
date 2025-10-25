import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PointsService {
    // state
    private _points = signal<number>(0);
    private _pointsPerSecond = signal<number>(0);
    private _pointsPerClick = signal<number>(1);

    // getter público (read-only signal)
    readonly points = this._points.asReadonly();
    readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
    readonly pointsPerClick = this._pointsPerClick.asReadonly();

    // métodos
    add() {
        this._points.update(v => v + this.pointsPerClick());
    }

    reset() {
        this._points.set(0);
    }

    // TODO: Implementar lógica de puntos por segundo
    // TODO: Implementar lógica de puntos por click

    // persistencia simple en localStorage
    loadFromStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // cargar puntos
        const points = localStorage.getItem('points');
        if (points) this._points.set(Number(points) || 0);
        // cargar puntos por segundo
        const cps = localStorage.getItem('pointsPerSecond');
        if (cps) this._pointsPerSecond.set(Number(cps) || 0);
        // cargar puntos por click
        const cpc = localStorage.getItem('pointsPerClick');
        if (cpc) this._pointsPerClick.set(Number(cpc) || 1);
    }

    saveToStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // guardar puntos
        localStorage.setItem('points', String(this._points()));
        // guardar puntos por segundo
        localStorage.setItem('pointsPerSecond', String(this._pointsPerSecond()));
        // guardar puntos por click
        localStorage.setItem('pointsPerClick', String(this._pointsPerClick()));
    }
}
