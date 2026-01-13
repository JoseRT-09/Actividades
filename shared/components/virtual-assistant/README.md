# Asistente Virtual de ResidenceHub

## Descripción
Componente de asistente virtual que utiliza Google Gemini AI para responder preguntas sobre el sistema ResidenceHub basándose en el manual de usuario.

## Configuración

### 1. Obtener API Key de Google Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea o selecciona un proyecto
3. Genera una nueva API Key
4. Copia la API Key

### 2. Configurar la API Key
Abre el archivo `/environments/environment.ts` y agrega tu API Key:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  geminiApiKey: 'TU_API_KEY_AQUÍ'
};
```

### 3. Agregar el manual.pdf
1. Crea una carpeta `assets` en la raíz del proyecto si no existe
2. Coloca tu archivo `manual.pdf` en `/assets/manual.pdf`

### 4. Integrar el componente

#### Opción A: En un componente específico
Importa y agrega el componente en tu HTML:

```typescript
import { VirtualAssistantComponent } from './shared/components/virtual-assistant/virtual-assistant.component';

@Component({
  // ...
  imports: [
    // otros imports
    VirtualAssistantComponent
  ]
})
```

```html
<app-virtual-assistant></app-virtual-assistant>
```

#### Opción B: En el layout principal (recomendado)
Si tienes un componente de layout principal, agrégalo ahí para que esté disponible en toda la aplicación:

```typescript
// En tu componente de layout principal
import { VirtualAssistantComponent } from './shared/components/virtual-assistant/virtual-assistant.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    // otros imports
    VirtualAssistantComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <app-sidebar></app-sidebar>
    <router-outlet></router-outlet>
    <app-virtual-assistant></app-virtual-assistant>
  `
})
```

### 5. Configurar HttpClient
Asegúrate de que tu aplicación tenga configurado el HttpClient. En tu archivo de configuración principal (generalmente `app.config.ts` o `main.ts`):

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // otros providers
  ]
};
```

## Características

- **Botón flotante**: Aparece en la esquina inferior derecha
- **Chat en tiempo real**: Interfaz de chat moderna y responsiva
- **IA conversacional**: Respuestas inteligentes basadas en Google Gemini
- **Contexto del manual**: Lee y comprende el contenido del manual.pdf
- **Animaciones suaves**: Transiciones y efectos visuales atractivos

## Uso

1. Haz clic en el botón flotante morado en la esquina inferior derecha
2. Se abrirá la ventana de chat
3. Escribe tu pregunta sobre ResidenceHub
4. El asistente responderá basándose en el manual y su conocimiento del sistema
5. Puedes presionar Enter para enviar mensajes

## Personalización

### Cambiar colores
Edita los colores en el archivo SCSS:

```scss
// Cambiar el color del botón flotante
.assistant-fab {
  background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### Modificar el prompt del asistente
En `virtual-assistant.component.ts`, edita el método `callGeminiAPI`:

```typescript
text: `Contexto: Tu contexto personalizado aquí...
Usuario pregunta: ${message}
Por favor responde...`
```

## Notas importantes

- La API Key de Gemini tiene límites de uso gratuitos
- El componente es completamente standalone y no requiere módulos adicionales
- El manual.pdf debe estar en la carpeta assets para ser accesible
- Se recomienda implementar lectura real del PDF usando una librería como pdf.js

## Próximas mejoras

- [ ] Implementar lectura real del contenido del PDF
- [ ] Agregar histórico de conversaciones
- [ ] Soporte para archivos adjuntos
- [ ] Modo oscuro
- [ ] Personalización del avatar
