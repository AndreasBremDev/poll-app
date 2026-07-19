import { Component, inject } from '@angular/core';
import { ModalDialog } from '../../../../shared/services/modal-dialog';

@Component({
  selector: 'app-hero-section',
  imports: [],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {

  modalDialog = inject(ModalDialog);
}
