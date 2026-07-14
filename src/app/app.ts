import { Component, signal, HostBinding, inject, effect, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ModalDialog } from './shared/services/modal-dialog';
import { SurveyCreate } from './features/survey-create/survey-create';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SurveyCreate
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poll-app');

  private router = inject(Router);
  modalDialog = inject(ModalDialog);

  @ViewChild('surveyDialog') dialogRef!: ElementRef<HTMLDialogElement>;

  currentPath = '';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects;
    });

    effect(() => {
      const isOpen = this.modalDialog.isCreateSurveyModalOpen();
      if (!this.dialogRef) return;
      const dialog = this.dialogRef.nativeElement;
      if (isOpen) {
        dialog.showModal();
        document.body.classList.add('modal-open');
      } else {
        dialog.close();
        document.body.classList.remove('modal-open');
      }
    });

  }

  @HostBinding('class.theme-start') get isStartPage() {
    return this.currentPath === '/' || this.currentPath === '';
  }

  @HostBinding('class.theme-survey') get isViewPage() {
    return this.currentPath.includes('view') || this.currentPath.includes('create');
  }

}
