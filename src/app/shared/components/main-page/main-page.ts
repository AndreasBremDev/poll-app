import { Component } from '@angular/core';
import { HeroSection } from '../hero-section/hero-section';
import { SoonSection } from '../soon-section/soon-section';
import { ListServeySection } from '../list-servey-section/list-servey-section';

@Component({
  selector: 'app-main-page',
  imports: [HeroSection, SoonSection, ListServeySection],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {}
