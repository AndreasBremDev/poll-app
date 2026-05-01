import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroSection } from './shared/components/hero-section/hero-section';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    HeroSection
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poll-app');
}
