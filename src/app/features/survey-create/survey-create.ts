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
  popover = viewChild<ElementRef<HTMLElement>>('popoverRef');

  formbuilder = inject(FormBuilder)
  readonly allowedPattern = /^[a-zA-ZäöüÄÖÜß0-9 .,?!&()-]*$/;
  selectedCategory = signal<string>('all');


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




  lastTouchedField = signal<string | null>(null);

  onBlur(fieldName: string): void {
    this.lastTouchedField.set(fieldName)
  }

  errorMessage = computed(() => {
    const fieldName = this.lastTouchedField();
    if (!fieldName) return '';
    const control = this.userform.get(fieldName);
    if (!control || control.valid || !control.errors) return '';
    const firstErrorKey = Object.keys(control.errors)[0]
    switch (firstErrorKey) {

      case 'pattern':
        return `letters, numbers and ".,?!&()-" are allowed`
      case 'minlength':
        return `${fieldName}: minimum length is ${control.errors['minlength'].requiredLength}`;
      case 'maxlength':
        return `${fieldName}: maximum length is ${control.errors['maxlength'].requiredLength}`;
      case 'pattern':
        return `'${fieldName}' contains invalid characters`;
      case 'minDate':
        return `'${fieldName}' must be today or within 2 years`;
      case 'maxYear':
        return `'${fieldName}' year exceeds allowed range`;
      case 'invalidDate':
        return `'${fieldName}' is not a valid date`;
      case 'required':
        return `'${fieldName}' is required`;
      default:
        return `'${fieldName}' is invalid`;
    }
  });






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
    console.log('Control:', control);
    console.log('Control Value:', control?.value);
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
    this.userform.get(formField)?.reset('')
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
    if (this.userform.valid) {
      try {
        this.userform.setErrors({ customError: true });
        const formValue = this.userform.value as SurveyFormValue;
        await this.supabase.saveSurvey(formValue);
        this.dialogPopover.openPublishedPopover(anchorBtn, popoverRef)
        setTimeout(() => { this.closeModal(true) }, 1500);
      } catch (err) {
        console.error('upload to supabase error', err)
      }
    }
  }



  closeModal(isSubmit: boolean = false) {
    this.resetQuestionsArray();
    this.userform.reset({ category: '' })
    this.dialogPopover.isCreateSurveyModalOpen.set(false);
    if (isSubmit) { this.router.navigate(['']) }
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