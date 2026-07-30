import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DialogPopover } from './../../shared/services/dialog-popover';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../shared/services/supabase';
import { limitYearLengthToFourDigits } from './../../shared/validators/custom-validators';
import { IndexToLetterPipe } from '../../shared/pipes/index-to-letter.pipe';
import { dateValidator } from './../../shared/validators/custom-validators'
import { SurveyFormValue } from '../../shared/interfaces/interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-survey-create',
  imports: [ReactiveFormsModule, IndexToLetterPipe],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {

  dialogPopover = inject(DialogPopover)
  supabase = inject(Supabase)
  router = inject(Router)

  formbuilder = inject(FormBuilder)
  readonly allowedPattern = /^[a-zA-ZäöüÄÖÜß0-9 .,?!&()-]*$/;
  selectedCategory = signal<string>('all');
  isSubmitting = signal(false);

  thisYearPlusTwo = new Date().getFullYear() + 2;
  minDate = new Date().toISOString().split('T')[0];
  maxDate = `${this.thisYearPlusTwo}-12-31`

  userform = this.formbuilder.group({
    title: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80),
      Validators.pattern(this.allowedPattern)
    ]],
    enddate: [null, [
      dateValidator()
    ]],
    description: [null, [
      Validators.maxLength(200),
      Validators.pattern(this.allowedPattern)
    ]],
    category: ['', [
      Validators.required
    ]],
    questions: this.formbuilder.array([])
  });

  createQuestionGroup(): FormGroup {
    return this.formbuilder.group({
      questionTitle: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(this.allowedPattern)]],
      multiple: [false],
      options: this.formbuilder.array([])
    });
  }

  createOptionGroup(): FormGroup {
    return this.formbuilder.group({
      optionTitle: ['', [
        Validators.required,
        Validators.pattern(this.allowedPattern)]]
    })
  }

  ngOnInit() {
    this.addQuestion();
  }

  onFieldBlur(controlOrFieldname: string | AbstractControl | null, anchorElem: HTMLElement, popoverElem: HTMLElement, event?: FocusEvent): void {
    // const targetElement = event?.relatedTarget as HTMLElement | null;
    // const isDeleting = targetElement?.dataset['deleteBtn'] === 'true';
    // if (isDeleting) { return };
    let control: AbstractControl | null;
    if (typeof controlOrFieldname === 'string') {
      control = this.userform.get(controlOrFieldname);
    } else {
      control = controlOrFieldname;
    }
    control?.markAsTouched();
    if (control && control.invalid) {
      this.dialogPopover.openPopover(anchorElem, popoverElem);
    }

  }

  getFieldError(controlOrFieldname: string | AbstractControl | null): string {
    let control: AbstractControl | null;
    if (typeof controlOrFieldname === 'string') {
      control = this.userform.get(controlOrFieldname);
    } else {
      control = controlOrFieldname;
    }
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return 'Type at least 3 characters';
    if (control.errors['minDate']) return 'Date should be minimum today';
    if (control.errors['invalidDate']) return 'Date is not within today plus two years';
    if (control.errors['pattern']) return 'Only .,-?!&() and letters and numbers allowed';
    return 'Invalid field';
  }

  onYearInput(event: Event): void {
    limitYearLengthToFourDigits(event, this.userform);
  }

  checkNativeValidity(inputElement: HTMLInputElement, controlName: string): void {
    const control = this.userform.get(controlName);
    if (!inputElement.validity.valid) { /* validity.valid = false, when i.e. 'tt.01.0022' */
      control?.setErrors({ invalidDate: true }); /* set error manually in Angular FormControl */
      control?.markAsTouched();
    }
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

  deleteQuestion(questionIndex: number): void {
    const questionGroup = this.questions.at(questionIndex) as FormGroup;
    const titleControl = questionGroup.get('questionTitle');
    this.clearOrRemoveItem(titleControl, this.questions, questionIndex, 1)
  }

  deleteOption(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.questions.at(questionIndex).get('options') as FormArray;
    const titleControl = optionsArray.at(optionIndex).get('optionTitle');
    this.clearOrRemoveItem(titleControl, optionsArray, optionIndex, 2);
  }

  clearOrRemoveItem(control: AbstractControl | null, array: FormArray, index: number, minLength: number): void {
    if (control && control.value.trim() !== '') {
      control.setValue('');
      control.markAsUntouched();
      return;
    }
    if (array.length > minLength) {
      array.removeAt(index);
    }
  }

  clearField(formField: string): void {
    const control = this.userform.get(formField);
    if (!control) return;
    control.setValue('');
    control.markAsUntouched();
    control.markAsPristine();
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

  async onSubmit(anchorBtn: HTMLElement, popoverRef: HTMLElement): Promise<void> {
    if (this.userform.invalid || this.isSubmitting()) return;
    try {
      this.isSubmitting.set(true);
      const formValue = this.userform.value as SurveyFormValue;
      await this.supabase.saveSurvey(formValue);
      this.dialogPopover.openPopover(anchorBtn, popoverRef)
      setTimeout(() => { this.closeModal(true) }, 1500);
    } catch (err) {
      console.error('Error at upload votes to supabase:', err)
      this.isSubmitting.set(false);
    }
  }

  closeModal(isSubmit: boolean = false) {
    this.resetQuestionsArray();
    this.userform.reset({ category: '' })
    this.dialogPopover.isCreateSurveyModalOpen.set(false);
    if (isSubmit) { this.router.navigate(['']) }
    this.isSubmitting.set(false);
  }

  resetQuestionsArray(): void {
    while (this.questions.length > 1) {
      this.questions.removeAt(this.questions.length - 1);
    }
    const firstQuestion = this.questions.at(0);
    if (firstQuestion) {
      const options = firstQuestion.get('options') as FormArray;
      while (options.length > 2) {
        options.removeAt(options.length - 1);
      }
      while (options.length < 2) {
        this.addOption(0);
      }
    }
  }

}