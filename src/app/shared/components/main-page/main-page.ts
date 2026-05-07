import { Component } from '@angular/core';
import { HeroSection } from '../hero-section/hero-section';
import { CurrentSection } from '../current-section/current-section';

@Component({
  selector: 'app-main-page',
  imports: [HeroSection,CurrentSection],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {}
