import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';

/**
 * EJEMPLO DE CONFIGURACIÓN DE main.ts CON EL ASISTENTE VIRTUAL
 *
 * Este archivo muestra cómo configurar el punto de entrada de la aplicación
 * para que funcione correctamente con el asistente virtual.
 *
 * INSTRUCCIONES:
 * 1. Si ya tienes un main.ts, compara con este ejemplo y agrega lo que falte
 * 2. Si no tienes main.ts, copia este archivo y renómbralo a 'main.ts'
 * 3. Ajusta las importaciones según tu estructura
 */

bootstrapApplication(MainLayoutComponent, {
  providers: [
    // Configuración de rutas
    provideRouter(routes),

    // Configuración de HTTP Client (REQUERIDO para el asistente virtual)
    provideHttpClient(
      withInterceptorsFromDi()
    ),

    // Animaciones de Angular Material (REQUERIDO)
    provideAnimations(),

    // Agrega aquí otros providers que necesites
    // Por ejemplo:
    // provideStore(),
    // provideEffects(),
    // etc.
  ]
}).catch(err => console.error(err));

/**
 * VERIFICACIÓN:
 *
 * Asegúrate de que tienes:
 * ✅ provideHttpClient() - Para llamadas a la API de Gemini
 * ✅ provideAnimations() - Para animaciones de Angular Material
 * ✅ provideRouter(routes) - Para navegación
 * ✅ MainLayoutComponent - Como componente raíz que incluye el asistente
 *
 * ALTERNATIVA:
 *
 * Si tu aplicación ya tiene un componente raíz diferente (por ejemplo AppComponent),
 * puedes agregar el asistente virtual allí:
 *
 * @Component({
 *   selector: 'app-root',
 *   standalone: true,
 *   imports: [
 *     RouterOutlet,
 *     NavbarComponent,
 *     SidebarComponent,
 *     VirtualAssistantComponent  // Agregar aquí
 *   ],
 *   template: `
 *     <app-navbar></app-navbar>
 *     <app-sidebar></app-sidebar>
 *     <router-outlet></router-outlet>
 *     <app-virtual-assistant></app-virtual-assistant>
 *   `
 * })
 * export class AppComponent {}
 */
