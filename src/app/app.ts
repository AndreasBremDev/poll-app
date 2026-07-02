import { Component, signal, HostBinding, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poll-app');

  private router = inject(Router);
  currentPath = '';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects;
    });
  }

  @HostBinding('class.theme-start') get isStartPage() {
    return this.currentPath === '/' || this.currentPath === '';
  }

  @HostBinding('class.theme-survey') get isViewPage() {
    return this.currentPath.includes('view') || this.currentPath.includes('create');
  }

}
