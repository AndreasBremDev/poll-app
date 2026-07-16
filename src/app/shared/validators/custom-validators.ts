import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export function maxYearValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
        const inputDate = new Date(control.value);
        const inputYear = inputDate.getFullYear();
        const maxAllowedYear = new Date().getFullYear() + 2; /* Aktuelles Jahr (2026) + 2 (2028) */
        if (inputYear > maxAllowedYear) { /* Falls der User es irgendwie schafft, ein Jahr > maxAllowedYear einzugeben: */
            return {
                'yearTooHigh': {
                    'maxYear': maxAllowedYear,
                    'actualYear': inputYear
                }
            };
        }
        return null; /* null ist: Alles in Ordnung */
    };
}

export function limitYearLengthToFourDigits(event: Event, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    const parts = input.value.split('-'); /* Format "YYYY-MM-DD" */
    const year = parts[0];
    if (year.length > 4) {
        const correctedYear = year.slice(0, 4);
        parts[0] = correctedYear;
        input.value = parts.join('-');

        // Ganz wichtig bei Reactive Forms: Wir müssen Angular mitteilen, 
        // dass wir den Wert im DOM manuell geändert haben!
        form.get('enddate')?.setValue(input.value, { emitEvent: false });
    }
}