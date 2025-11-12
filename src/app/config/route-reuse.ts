import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

/**
 * Estrategia personalizada para reutilizar componentes de rutas en lugar de destruirlos
 * ()se tratan las rutas como secciones de una SPA)
 *
 * Sin esto al cambiar de upgrades a skins angular se carga el componente de upgrades y crea uno nuevo de skins que hace que las imgs se recarguen por ejemplo
 *
 * Con esto los componentes se guardan en memoria y se reutilizan al volver a la ruta
 */
export class RouteReuse implements RouteReuseStrategy {
  private readonly storedRoutes = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig?.path && (route.data['reuse'] ?? true);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!handle) return;

    const key = this.getRouteKey(route);
    if (!key) return;

    this.storedRoutes.set(key, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getRouteKey(route);
    return !!key && this.storedRoutes.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getRouteKey(route);
    return key ? this.storedRoutes.get(key) ?? null : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): string {
    return route.routeConfig?.path ?? '';
  }

  public clearCache(): void {
    this.storedRoutes.clear();
  }
}
