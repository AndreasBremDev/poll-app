import { Component, input, computed } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-errors',
  standalone: true,
  template: `
    @if (errorMessage()) {
      <p class="error-message">{{ errorMessage() }}</p>
    }
  `,
  styles: `
    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      border: 1px solid white;
    }
  `
})
export class FormErrorsComponent {

  ngOnInit(){
    console.log(this.label());
    
  }

  // Ein Control ODER ein Array von Controls
  controls = input<AbstractControl | (AbstractControl | null)[] | null>(null);
  
  // Optionales Label für schönere Texte (z. B. label="Titel")
  label = input<string>('Feld');

  errorMessage = computed(() => {
    const rawControls = this.controls();
    if (!rawControls) return null;

    const controlList = Array.isArray(rawControls) ? rawControls : [rawControls];

    // Iteriere durch die Controls und nimm das erste, das ungültig + touched/dirty ist
    for (const ctrl of controlList) {
      if (ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty) && ctrl.errors) {
        return this.getErrorMessage(ctrl.errors, this.label());
      }
    }

    return null;
  });

  // Hier verwaltest du alle deine Fehler-Texte klipp und klar
  private getErrorMessage(errors: Record<string, any>, label: string): string {
    // 1. Required / Whitespace
    if (errors['required'] || errors['whitespace']) {
      return `Bitte fülle das Feld "${label}" aus.`;
    }

    // 2. Pattern (Sonderzeichen)
    if (errors['pattern']) {
      return `Im Feld "${label}" sind keine Sonderzeichen wie <, >, & erlaubt.`;
    }

    // 3. MinLength (mit dynamischer Längenangabe)
    if (errors['minlength']) {
      const min = errors['minlength'].requiredLength;
      return `Das Feld "${label}" muss mindestens ${min} Zeichen lang sein.`;
    }

    // 4. MaxLength
    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      return `Im Feld "${label}" sind maximal ${max} Zeichen erlaubt.`;
    }

    // 5. Deine Custom Date Validation Errors
    if (errors['invalidDate']) {
      return 'Das eingegebene Datum ist ungültig.';
    }

    if (errors['minDate']) {
      return 'Das Datum muss in der Zukunft liegen.';
    }

    if (errors['yearError']) {
      return 'Das angegebene Jahr liegt außerhalb des zulässigen Bereichs.';
    }

    // Fallback für alle unvorhergesehenen Fehler
    return 'Die Eingabe ist ungültig.';
  }
}