# Componente de Navegación con Sidebar

Este componente proporciona una barra de navegación lateral (sidebar) responsive con opciones de menú basadas en roles de usuario.

## Características

### Opciones de Pago según Rol

- **Residentes**: Tienen acceso a "Mis Pagos" (`/payments/my-payments`) para ver y gestionar sus pagos personales
- **Administrador y Super Admin**: Tienen acceso a "Gestión de Pagos" (`/payments`) para inspeccionar todos los pagos del sistema

### Otras Funcionalidades

- Sidebar responsive (modo overlay en móviles, modo fijo en escritorio)
- Navegación basada en roles de usuario
- Diseño Material Design
- Información del usuario en el footer del sidebar
- Menú de usuario con opciones de perfil y cerrar sesión

## Estructura del Componente

```
shared/components/navigation/
├── navigation.component.ts      # Lógica del componente
├── navigation.component.html    # Template HTML
├── navigation.component.scss    # Estilos
└── README.md                    # Esta documentación
```

## Integración en la Aplicación

### 1. Importar en el Componente Principal

Si tienes un componente `app.component.ts` o similar:

```typescript
import { NavigationComponent } from './shared/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavigationComponent,
    // ... otros imports
  ],
  template: '<app-navigation></app-navigation>'
})
export class AppComponent {}
```

### 2. Configurar las Rutas

Asegúrate de que las rutas de pagos estén configuradas en tu archivo de rutas principal:

```typescript
export const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'payments',
        loadChildren: () => import('./payments/payments.routes').then(m => m.PAYMENTS_ROUTES)
      },
      // ... otras rutas
    ]
  }
];
```

### 3. Verificar Guards de Autenticación

Las rutas de pagos ya están protegidas:

```typescript
// payments/payments.routes.ts
export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [adminGuard], // Solo admin y super admin
        loadComponent: () => import('./payment-list/payment-list.component')
      },
      {
        path: 'my-payments', // Todos los usuarios autenticados
        loadComponent: () => import('./my-payments/my-payments.component')
      }
    ]
  }
];
```

## Personalización del Menú

Para agregar o modificar items del menú, edita el array `menuItems` en `navigation.component.ts`:

```typescript
menuItems: MenuItem[] = [
  {
    label: 'Nombre del Item',
    icon: 'nombre_icono_material', // Ver: https://fonts.google.com/icons
    route: '/ruta',
    roles: [UserRole.RESIDENTE] // Opcional: restringe por rol
  }
];
```

### Roles Disponibles

- `UserRole.RESIDENTE`: Residentes de la comunidad
- `UserRole.ADMINISTRADOR`: Administradores
- `UserRole.SUPER_ADMIN`: Super administradores

Si no se especifica el campo `roles`, el item será visible para todos los usuarios autenticados.

## Estilos y Temas

El componente utiliza Angular Material y está diseñado con:

- Color primario: Azul (#1e3a8a - #1e40af)
- Color de acento: Azul claro (#60a5fa)
- Fondo de contenido: Gris claro (#f5f5f5)

Para personalizar los colores, edita el archivo `navigation.component.scss`.

## Dependencias Requeridas

Asegúrate de tener instalados los siguientes paquetes:

```bash
npm install @angular/material @angular/cdk
```

Y que los siguientes módulos estén importados:

- `MatSidenavModule`
- `MatToolbarModule`
- `MatListModule`
- `MatIconModule`
- `MatButtonModule`
- `MatMenuModule`

## Ejemplo de Uso Completo

```typescript
// app.config.ts o main.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    // ... otros providers
  ]
};
```

## Notas Importantes

1. **Autenticación**: El componente asume que existe un servicio `AuthService` con métodos:
   - `currentUser$`: Observable del usuario actual
   - `hasRole(roles: UserRole[])`: Verifica si el usuario tiene uno de los roles especificados
   - `logout()`: Cierra la sesión del usuario

2. **Responsive**: El sidebar se muestra fijo en pantallas grandes y como overlay en móviles (breakpoint: 599px)

3. **Seguridad**: Los guards de ruta (`authGuard`, `adminGuard`) deben estar implementados para proteger las rutas sensibles

## Soporte

Para más información sobre Angular Material, visita: https://material.angular.io/
