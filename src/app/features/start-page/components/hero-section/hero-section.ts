import { Component, inject } from '@angular/core';
import { DialogPopover } from '../../../../shared/services/dialog-popover';

@Component({
  selector: 'app-hero-section',
  imports: [],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {

  DialogPopover = inject(DialogPopover);
}
