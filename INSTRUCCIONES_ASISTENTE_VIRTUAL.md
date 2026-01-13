# Instrucciones para Integrar el Asistente Virtual

## Método 1: Usar el Main Layout Component (RECOMENDADO)

He creado un componente de layout principal en `/shared/layouts/main-layout.component.ts` que ya incluye:
- Navbar
- Sidebar
- Router Outlet
- Asistente Virtual

### Paso 1: Verificar el componente creado
El archivo ya está en: `/shared/layouts/main-layout.component.ts`

### Paso 2: Configurar las rutas principales

Si tienes un archivo de rutas principal (por ejemplo `app.routes.ts` o similar), agrégalo así:

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes').then(m => m.USER_ROUTES)
      },
      {
        path: 'residences',
        loadChildren: () => import('./residences/residences.routes').then(m => m.RESIDENCE_ROUTES)
      },
      {
        path: 'payments',
        loadChildren: () => import('./payments/payments.routes').then(m => m.PAYMENT_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes').then(m => m.REPORT_ROUTES)
      },
      {
        path: 'complaints',
        loadChildren: () => import('./complaints/complaints.routes').then(m => m.COMPLAINT_ROUTES)
      },
      {
        path: 'activities',
        loadChildren: () => import('./activities/activities.routes').then(m => m.ACTIVITY_ROUTES)
      },
      {
        path: 'amenities',
        loadChildren: () => import('./amenities/amenities.routes').then(m => m.AMENITY_ROUTES)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  }
];
```

### Paso 3: Configurar el archivo principal (main.ts)

Asegúrate de que tu `main.ts` tenga la configuración de HTTP Client:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';

bootstrapApplication(MainLayoutComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    // otros providers...
  ]
}).catch(err => console.error(err));
```

---

## Método 2: Agregar Individualmente a Componentes

Si prefieres no usar un layout wrapper, puedes agregar el asistente virtual a cada componente principal:

### En cada componente que quieras que tenga el asistente:

1. **Importa el componente en tu TypeScript:**

```typescript
import { VirtualAssistantComponent } from './shared/components/virtual-assistant/virtual-assistant.component';

@Component({
  // ...
  imports: [
    CommonModule,
    // otros imports...
    VirtualAssistantComponent
  ]
})
```

2. **Agrégalo en tu HTML:**

```html
<!-- Al final de tu template -->
<app-navbar></app-navbar>
<app-sidebar></app-sidebar>

<!-- Tu contenido -->
<div class="content">
  <!-- ... -->
</div>

<!-- Asistente Virtual -->
<app-virtual-assistant></app-virtual-assistant>
```

---

## Método 3: Agregar Globalmente en index.html

Si tu aplicación tiene un index.html donde se monta la app, puedes agregar el asistente allí, pero necesitarás configurarlo como un Web Component o usar un approach diferente.

---

## Verificación

Una vez integrado, deberías ver:
1. Un botón flotante morado en la esquina inferior derecha
2. Al hacer clic, se abre la ventana de chat
3. El asistente responde a preguntas sobre el sistema

## Solución de Problemas

### El botón no aparece:
- Verifica que importaste `VirtualAssistantComponent`
- Verifica que agregaste `<app-virtual-assistant></app-virtual-assistant>` en tu template
- Revisa la consola del navegador por errores

### El asistente no responde:
- Verifica que la API Key esté configurada en `environments/environment.ts`
- Verifica que el archivo `manual.txt` esté en `/assets/manual.txt`
- Verifica que `provideHttpClient()` esté en tus providers

### Error de CORS o HTTP:
- Asegúrate de tener `provideHttpClient()` en la configuración de providers
- Verifica que la API Key de Gemini sea válida

---

## Estructura de Archivos

```
/home/user/Actividades/
├── shared/
│   ├── layouts/
│   │   └── main-layout.component.ts  (NUEVO - Layout wrapper)
│   └── components/
│       ├── navbar/
│       ├── sidebar/
│       └── virtual-assistant/
│           ├── virtual-assistant.component.ts
│           ├── virtual-assistant.component.html
│           ├── virtual-assistant.component.scss
│           └── README.md
├── environments/
│   └── environment.ts (API Key configurada)
├── assets/
│   └── manual.txt (Manual completo del sistema)
└── [tus otros componentes]
```

---

## Recomendación Final

Te recomiendo usar el **Método 1** (Main Layout Component) porque:
- ✅ El asistente estará disponible en todas las vistas automáticamente
- ✅ Mantiene tu código DRY (Don't Repeat Yourself)
- ✅ Más fácil de mantener y actualizar
- ✅ Solo necesitas configurarlo una vez

Si necesitas ayuda específica con tu configuración de rutas o archivo principal,
comparte el contenido de tu archivo de rutas principal y te ayudo a integrarlo correctamente.
