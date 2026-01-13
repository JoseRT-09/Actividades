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
  pdfContent = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPdfContent();
    this.addMessage('¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', false);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async loadPdfContent(): Promise<void> {
    try {
      // Cargar el contenido del PDF
      const response = await fetch('/assets/manual.pdf');
      const blob = await response.blob();

      // Aquí deberías implementar la lectura del PDF
      // Por ahora, establecemos un mensaje de contexto
      this.pdfContent = 'Manual de usuario cargado correctamente.';
    } catch (error) {
      console.error('Error cargando el PDF:', error);
      this.pdfContent = 'Error al cargar el manual.';
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
            text: `Contexto: Eres un asistente virtual para ResidenceHub, un sistema de gestión de residencias. ${this.pdfContent}

Usuario pregunta: ${message}

Por favor responde de manera clara y concisa, basándote en la información del manual cuando sea relevante.`
          }]
        }]
      };

      const response: any = await this.http.post(url, payload).toPromise();

      if (response && response.candidates && response.candidates[0]) {
        return response.candidates[0].content.parts[0].text;
      }

      return 'No pude generar una respuesta. Por favor, intenta de nuevo.';
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
