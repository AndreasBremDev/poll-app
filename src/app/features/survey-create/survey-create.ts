import { Component, inject, signal } from '@angular/core';
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

  userform = this.formbuilder.group({
    title: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]],
    enddate: ['', []],
    description: ['']
  })

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.selectedCategory.set(value);
    selectElement.blur();
  }

}
