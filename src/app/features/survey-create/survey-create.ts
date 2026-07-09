import { Component, inject } from '@angular/core';
import { ModalDialog } from '../../shared/services/modal-dialog';

@Component({
  selector: 'app-survey-create',
  imports: [],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {

  modalDialog = inject(ModalDialog)
}
