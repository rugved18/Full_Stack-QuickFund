import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LayoutModule } from './layout/layout.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LayoutModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Quickfund';
  appReady = false;

  constructor(private router: Router) {
    // Wait until the very first navigation is done
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && !this.appReady) {
        setTimeout(() => {
          this.appReady = true;
        }, 200);
      }
    });
  }
}
