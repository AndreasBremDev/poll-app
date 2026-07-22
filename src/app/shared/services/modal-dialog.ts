import { inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalDialog {

  isCreateSurveyModalOpen = signal<boolean>(false);

  openCreateSurveyModal() {
    this.isCreateSurveyModalOpen.set(true);
  }

  closeCreateSurveyModal() {
    this.isCreateSurveyModalOpen.set(false);
  }

}
