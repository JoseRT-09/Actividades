import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-virtual-assistant',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './virtual-assistant.component.html',
  styleUrls: ['./virtual-assistant.component.scss']
})
export class VirtualAssistantComponent implements OnInit {
  isOpen = false;
  messages: Message[] = [];
  userMessage = '';
  isLoading = false;
  manualContent = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadManualContent();
    this.addMessage('¡Hola! Soy tu asistente virtual de ResidenceHub. Puedo ayudarte con dudas sobre cómo usar el sistema. ¿En qué puedo ayudarte?', false);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async loadManualContent(): Promise<void> {
    try {
      // Cargar el contenido del manual.txt
      const response = await fetch('/assets/manual.txt');
      const text = await response.text();
      this.manualContent = text;
      console.log('Manual cargado correctamente');
    } catch (error) {
      console.error('Error cargando el manual:', error);
      this.manualContent = 'Manual de usuario de ResidenceHub no disponible.';
    }
  }

  addMessage(text: string, isUser: boolean): void {
    this.messages.push({
      text,
      isUser,
      timestamp: new Date()
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.userMessage.trim()) return;

    const userMsg = this.userMessage;
    this.addMessage(userMsg, true);
    this.userMessage = '';
    this.isLoading = true;

    try {
      // Llamar a la API de Gemini
      const response = await this.callGeminiAPI(userMsg);
      this.addMessage(response, false);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', false);
    } finally {
      this.isLoading = false;
    }
  }

  async callGeminiAPI(message: string): Promise<string> {
    const apiKey = environment.geminiApiKey || '';

    if (!apiKey) {
      return 'Por favor, configura tu API Key de Google Gemini en el archivo environment.ts';
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          parts: [{
            text: `Eres un asistente virtual para ResidenceHub, un sistema de gestión de residencias y condominios.

MANUAL DEL SISTEMA:
${this.manualContent}

INSTRUCCIONES:
- Responde de manera clara, concisa y amigable
- Basate en la información del manual anterior
- Si la pregunta no está en el manual, usa tu conocimiento sobre sistemas de gestión
- Proporciona pasos específicos cuando sea necesario
- Si no sabes algo, admítelo honestamente

PREGUNTA DEL USUARIO: ${message}

Por favor responde la pregunta del usuario:`
          }]
        }]
      };

      const response: any = await this.http.post(url, payload).toPromise();

      if (response && response.candidates && response.candidates[0]) {
        return response.candidates[0].content.parts[0].text;
      }

      return 'No pude generar una respuesta. Por favor, intenta de nuevo.';
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);

      // Manejar errores específicos de la API
      if (error.status === 401 || error.status === 403) {
        return 'La API Key de Google Gemini parece ser inválida o ha expirado. Por favor, verifica la configuración en environments/environment.ts o genera una nueva API Key en https://makersuite.google.com/app/apikey';
      }

      if (error.status === 429) {
        return 'Has excedido el límite de solicitudes de la API de Gemini. Por favor, espera un momento e intenta de nuevo.';
      }

      return 'Hubo un problema al conectar con el asistente virtual. Por favor, verifica tu conexión a internet e intenta de nuevo.';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
