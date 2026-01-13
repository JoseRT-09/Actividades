import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { VirtualAssistantComponent } from '../components/virtual-assistant/virtual-assistant.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    VirtualAssistantComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <app-sidebar></app-sidebar>
    <router-outlet></router-outlet>
    <app-virtual-assistant></app-virtual-assistant>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MainLayoutComponent {}
