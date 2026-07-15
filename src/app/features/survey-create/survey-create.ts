import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ModalDialog } from '../../shared/services/modal-dialog';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Supabase } from '../../shared/services/supabase';

@Component({
  selector: 'app-survey-create',
  imports: [ReactiveFormsModule],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {

  modalDialog = inject(ModalDialog)

  selectedCategory = signal<string>('all');

  formbuilder = inject(FormBuilder)

  supabase = inject(Supabase)

  minDate = new Date().toISOString().split('T')[0];
  maxDate = '2099-12-31'
  placeholderDate: string = '2099-12-31'

  userform = this.formbuilder.group({
    title: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80)
    ]],
    enddate: ['2099-12-31', []],
    description: ['', [
      Validators.maxLength(200)
    ]],
    question: ['', []],
    option: ['', []]
  })

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.selectedCategory.set(value);
    selectElement.blur();
  }

  private popover = viewChild<ElementRef<HTMLElement>>('popoverRef');

  openPopover() {
    const elem = this.popover()?.nativeElement;
    if (elem) {
      if (typeof elem.showPopover === 'function') {
        elem.showPopover();
        setTimeout(() => this.closePopover(), 1500);
      } else {
        elem.classList.add('is-open');
        setTimeout(() => {
          elem.classList.remove('is-open');
        }, 1500);
      }
    }
  }

  closePopover() {
    const elem = this.popover()?.nativeElement;
    if (elem) {
      if (typeof elem.hidePopover === 'function') {
        elem.hidePopover();
      } else {
        elem.classList.remove('is-open');
      }
    }
  }

  openPublishedPopover(anchor: HTMLElement, popover: HTMLElement) {
        popover.showPopover(); /* 1. Popover kurz bereitstellen für die Maße */
    var { leftPosition, padding, popoverWidth, viewportWidth, topPosition } = this.defineProperties(anchor, popover);
    leftPosition = this.recalculatePopoverPosition(leftPosition, padding, popoverWidth, viewportWidth);
    popover.style.top = `${topPosition}px`; /* 5. Styles zuweisen */
    popover.style.left = `${leftPosition}px`;
    setTimeout(() => this.closePopover(), 1500);
}


  private defineProperties(anchor: HTMLElement, popover: HTMLElement) {
    /* 2. Button-Position und Popover-Maße holen */
    const rect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const viewportWidth = window.innerWidth; /* Die Gesamtbreite des Bildschirms */
    /* 3. Höhe berechnen */
    const gap = 15;
    const topPosition = rect.top - popoverHeight - gap;
    /* 4. Breite berechnen mit Randschutz (Safe Guard) */
    const padding = 10; // 10px Mindestabstand zum Bildschirmrand
    /* Berechne den idealen left-Wert (rechtsbündig zum Button) */
    let leftPosition = rect.right - popoverWidth;
    return { leftPosition, padding, popoverWidth, viewportWidth, topPosition };
  }

  private recalculatePopoverPosition(leftPosition: number, padding: number, popoverWidth: number, viewportWidth: number) {
    /* FEHLERSCHUTZ LINKS: Verhindert, dass das Popover links aus dem Bildschirm ragt */
    if (leftPosition < padding) {
      leftPosition = padding;
    }
    /* FEHLERSCHUTZ RECHTS: Verhindert, dass es rechts hinausragt (falls der Button sehr weit rechts liegt) */
    if (leftPosition + popoverWidth > viewportWidth - padding) {
      leftPosition = viewportWidth - popoverWidth - padding;
    }
    return leftPosition;
  }
}
