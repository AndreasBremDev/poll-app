import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ModalDialog } from '../../shared/services/modal-dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../shared/services/supabase';
import { limitYearLengthToFourDigits } from './../../shared/validators/custom-validators';
import { IndexToLetterPipe } from '../../shared/pipes/index-to-letter.pipe';
import { dateValidator } from './../../shared/validators/custom-validators'

@Component({
  selector: 'app-survey-create',
  imports: [ReactiveFormsModule, IndexToLetterPipe],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {

  modalDialog = inject(ModalDialog)

  selectedCategory = signal<string>('all');

  formbuilder = inject(FormBuilder)

  supabase = inject(Supabase)

  thisYearPlusTwo = new Date().getFullYear() + 2;
  minDate = new Date().toISOString().split('T')[0];
  maxDate = `${this.thisYearPlusTwo}-12-31`

  userform = this.formbuilder.group({
    title: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80),
      Validators.pattern(/^[a-zA-ZäöüÄÖÜß0-9 .?!-]*$/)
    ]],
    enddate: [null, [dateValidator()]],
    description: [null, [
      Validators.maxLength(200),
      Validators.pattern(/^[a-zA-ZäöüÄÖÜß0-9 .?!-]*$/)
    ]],
    category: ['', [
      Validators.required
    ]],
    questions: this.formbuilder.array([])
  })

  ngOnInit() {
    this.addQuestion();
  }

  onYearInput(event: Event): void {
    limitYearLengthToFourDigits(event, this.userform);
  }

  get questions(): FormArray {
    return this.userform.get('questions') as FormArray;
  }

  getOptionsFromArray(questionIndex: number): FormArray {
    const questionGroup = this.questions.at(questionIndex) as FormGroup
    return questionGroup.get('options') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
    const newQuestionIndex = this.questions.length - 1;
    this.addOption(newQuestionIndex);
    this.addOption(newQuestionIndex);
  }

  addOption(questionIndex: number): void {
    const optionsArray = this.getOptionsFromArray(questionIndex);
    if (optionsArray.length >= 6) return;
    optionsArray.push(this.createOptionGroup());
  }

  clearField(formField: string) {
    this.userform.get(formField)?.reset('')
  }

  createQuestionGroup(): FormGroup {
    return this.formbuilder.group({
      questionTitle: ['', [Validators.required,Validators.pattern(/^[a-zA-ZäöüÄÖÜß0-9 .?!-]*$/)]],
      options: this.formbuilder.array([])
    });
  }

  createOptionGroup(): FormGroup {
    return this.formbuilder.group({
      optionTitle: ['', [Validators.required,Validators.pattern(/^[a-zA-ZäöüÄÖÜß0-9 .?!-]*$/)]]
    })
  }

  deleteQuestion(questionIndex: number): void {
    if (this.questions.length <= 1) return;
    this.questions.removeAt(questionIndex);
  }

  deleteOption(questionIndex: number, optionIndex: number) {
    const optionsArray = this.questions.at(questionIndex).get('options') as FormArray;
    if (optionsArray) {
      if (optionsArray.length <= 2) return;
      optionsArray.removeAt(optionIndex);
    }
  }

  clearQuestionInputValueByIndex(questionIndex: number): void {
    const questionGroup = this.questions.at(questionIndex);
    questionGroup.get('questionTitle')?.setValue('');
  }

  clearOptionInputValueByIndex(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.questions.at(questionIndex).get('options') as FormArray;
    if (optionsArray) {
      const optionGroup = optionsArray.at(optionIndex);
      optionGroup.get('optionTitle')?.setValue('');
    }
  }

  trimControl(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      input.value = input.value.trim();
      /* Signal an Angular: Wert geändert, FormControl aktualiert */
      input.dispatchEvent(new Event('input'));
    }
  }

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
    let { leftPosition, padding, popoverWidth, viewportWidth, topPosition } = this.defineProperties(anchor, popover);
    /*  2. Button-Position und Popover-Maße holen, 3. Höhe berechnen, 
        4a. Breite berechnen mit Randschutz (Safe Guard, 10px Mindestabstand zum Bildschirmrand), 
        4b. Berechne idealen left-Wert (rechtsbündig zum Button) */
    leftPosition = this.recalculatePopoverPosition(leftPosition, padding, popoverWidth, viewportWidth);
    popover.style.top = `${topPosition}px`; /* 5. Styles zuweisen */
    popover.style.left = `${leftPosition}px`;
    setTimeout(() => this.closePopover(), 1500);
  }


  private defineProperties(anchor: HTMLElement, popover: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const viewportWidth = window.innerWidth; /* Die Gesamtbreite des Bildschirms */
    const gap = 15;
    const topPosition = rect.top - popoverHeight - gap;
    const padding = 10;
    let leftPosition = rect.right - popoverWidth;
    return { leftPosition, padding, popoverWidth, viewportWidth, topPosition };
  }

  private recalculatePopoverPosition(leftPosition: number, padding: number, popoverWidth: number, viewportWidth: number) {
    /* Fehlerschutz LINKS: Verhindert, dass das Popover links aus dem Bildschirm ragt */
    if (leftPosition < padding) {
      leftPosition = padding;
    }
    /* Fehlerschutz RECHTS: Verhindert, dass es rechts hinausragt (falls der Button sehr weit rechts liegt) */
    if (leftPosition + popoverWidth > viewportWidth - padding) {
      leftPosition = viewportWidth - popoverWidth - padding;
    }
    return leftPosition;
  }
}