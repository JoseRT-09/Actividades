# Guía de Opciones de Pago en el Sidebar

## Resumen

Se han agregado opciones de pago al sidebar de navegación de la aplicación ResidenceHub. Las opciones varían según el rol del usuario.

## Opciones de Pago por Rol

### Para Residentes

**Opción disponible**: "Mis Pagos"
- **Icono**: 💳 (payment)
- **Ruta**: `/payments/my-payments`
- **Acceso**: Solo usuarios con rol `RESIDENTE`

**Funcionalidad**:
- Ver historial de pagos personales
- Consultar pagos completados, pendientes y rechazados
- Ver detalles de cada pago (fecha, concepto, monto, método de pago)
- Estadísticas de pagos (total pagado, total pendiente, cantidad de pagos)
- Paginación de resultados

### Para Administradores y Super Administradores

**Opción disponible**: "Gestión de Pagos"
- **Icono**: 💰 (account_balance_wallet)
- **Ruta**: `/payments`
- **Acceso**: Solo usuarios con rol `ADMINISTRADOR` o `SUPER_ADMIN`

**Funcionalidad**:
- Inspeccionar todos los pagos del sistema
- Ver pagos de todos los residentes
- Crear nuevos registros de pagos
- Editar pagos existentes
- Ver detalles completos de cada pago
- Filtros y búsqueda avanzada
- Exportar reportes de pagos

## Estructura del Menú de Navegación

El sidebar incluye las siguientes secciones principales (visibles según rol):

```
Dashboard (Todos)
Mi Residencia (Solo Residentes)
Residencias (Solo Admin/Super Admin)
Actividades (Todos)
Amenidades (Todos)
Mis Reservaciones (Solo Residentes)
Gestión de Reservaciones (Solo Admin/Super Admin)
Reportes (Todos)
Quejas (Todos)
Mis Pagos (Solo Residentes) ← NUEVO
Gestión de Pagos (Solo Admin/Super Admin) ← NUEVO
```

## Implementación Técnica

### Control de Acceso

El componente de navegación utiliza el servicio `AuthService` para determinar qué opciones mostrar:

```typescript
menuItems: MenuItem[] = [
  // ...
  {
    label: 'Mis Pagos',
    icon: 'payment',
    route: '/payments/my-payments',
    roles: [UserRole.RESIDENTE]
  },
  {
    label: 'Gestión de Pagos',
    icon: 'account_balance_wallet',
    route: '/payments',
    roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
  }
];
```

### Guards de Ruta

Las rutas están protegidas a nivel de routing:

```typescript
// payments/payments.routes.ts
export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard], // Requiere autenticación
    children: [
      {
        path: '',
        canActivate: [adminGuard], // Solo admin/super admin
        loadComponent: () => import('./payment-list/payment-list.component')
      },
      {
        path: 'my-payments', // Todos los autenticados
        loadComponent: () => import('./my-payments/my-payments.component')
      }
    ]
  }
];
```

## Seguridad

1. **Doble capa de seguridad**:
   - Primera capa: Visibilidad en el menú (controlada por roles)
   - Segunda capa: Guards de ruta (autenticación y autorización)

2. **Validación en el backend**:
   - El componente `MyPaymentsComponent` filtra pagos por `usuario_id`
   - El backend valida que los usuarios solo puedan acceder a sus propios datos

3. **Separación de responsabilidades**:
   - Residentes: Solo ven sus pagos (componente `MyPaymentsComponent`)
   - Admins: Ven todos los pagos con opciones de gestión (componente `PaymentListComponent`)

## Componentes Relacionados

### Componentes de Pago

1. **MyPaymentsComponent** (`payments/my-payments/`)
   - Vista de pagos personales para residentes
   - Filtrado automático por usuario actual
   - Estadísticas personales

2. **PaymentListComponent** (`payments/payment-list/`)
   - Vista administrativa de todos los pagos
   - Funciones CRUD completas
   - Filtros avanzados

3. **PaymentDetailComponent** (`payments/payment-detail/`)
   - Detalles completos de un pago específico
   - Accesible desde ambas vistas

4. **PaymentFormComponent** (`payments/payment-form/`)
   - Formulario para crear/editar pagos
   - Solo accesible para administradores

### Servicios y Repositorios

- `PaymentRepository`: Interfaz del repositorio
- `PaymentApiRepository`: Implementación de llamadas HTTP
- `PaymentService`: Lógica de negocio (si existe)
- `AuthService`: Autenticación y control de roles

## Pruebas

Para verificar que las opciones de pago funcionan correctamente:

### Como Residente:
1. Iniciar sesión con usuario de rol RESIDENTE
2. Verificar que aparece "Mis Pagos" en el sidebar
3. Verificar que NO aparece "Gestión de Pagos"
4. Hacer clic en "Mis Pagos"
5. Verificar que solo se muestran los pagos del usuario actual

### Como Administrador:
1. Iniciar sesión con usuario de rol ADMINISTRADOR o SUPER_ADMIN
2. Verificar que aparece "Gestión de Pagos" en el sidebar
3. Verificar que NO aparece "Mis Pagos"
4. Hacer clic en "Gestión de Pagos"
5. Verificar que se muestran todos los pagos del sistema
6. Verificar acceso a crear/editar pagos

## Personalización

Para modificar las opciones de pago:

1. **Cambiar iconos**: Editar el campo `icon` en `menuItems`
2. **Cambiar etiquetas**: Editar el campo `label` en `menuItems`
3. **Cambiar rutas**: Editar el campo `route` en `menuItems` (y actualizar las rutas correspondientes)
4. **Cambiar permisos**: Modificar el array `roles` en cada item

## Próximas Mejoras

Posibles mejoras futuras:

1. Notificaciones de pagos vencidos en el sidebar
2. Badge con cantidad de pagos pendientes
3. Acceso rápido a pagos recientes
4. Búsqueda de pagos desde el sidebar
5. Integración con pasarelas de pago

## Soporte

Para más información sobre la implementación, consulta:
- `shared/components/navigation/README.md`: Documentación del componente de navegación
- `payments/payments.routes.ts`: Configuración de rutas de pagos
- `core/services/auth.service.ts`: Servicio de autenticación y roles
